export type AiChatRole = "user" | "assistant";

export type AiChatHistoryItem = {
  role: AiChatRole;
  content: string;
};

export type AiAnswerSourceType =
  | "company_policy"
  | "gemini"
  | "internal_api"
  | "market_data"
  | "marketaux"
  | "verified_tradepro";

export type AiAnswerSource = {
  type: AiAnswerSourceType;
  label: string;
  updatedAt?: string;
};

export type AiChatAttachment = {
  name: string;
  mimeType: string;
  data: string;
};

type StreamAiChatRequest = {
  message: string;
  history: AiChatHistoryItem[];
  file?: AiChatAttachment;
  signal?: AbortSignal;
  onChunk: (content: string, source?: AiAnswerSource) => void;
};

const ANSWER_SOURCE_TYPES = new Set<AiAnswerSourceType>([
  "company_policy",
  "gemini",
  "internal_api",
  "market_data",
  "marketaux",
  "verified_tradepro",
]);

export class AiChatRequestError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
    public readonly loginUrl?: string,
  ) {
    super(message);
    this.name = "AiChatRequestError";
  }
}

export async function streamAiChat({
  message,
  history,
  file,
  signal,
  onChunk,
}: StreamAiChatRequest): Promise<{
  content: string;
  source?: AiAnswerSource;
}> {
  const requestBody = JSON.stringify({ message, history, file });
  let response = await sendChatRequest(requestBody, signal);

  if (response.status === 401) {
    const authError = await readChatError(response);

    if (authError?.code === "AUTH_REQUIRED" && await refreshSession(signal)) {
      response = await sendChatRequest(requestBody, signal);
    } else {
      throw createRequestError(response.status, authError);
    }
  }

  if (!response.ok) {
    throw createRequestError(response.status, await readChatError(response));
  }

  if (!response.body) {
    throw new AiChatRequestError(
      "Streaming response is unavailable.",
      response.status,
    );
  }

  const source = getAnswerSource(response.headers);
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let content = "";

  while (true) {
    const { value, done } = await reader.read();

    if (done) {
      content += decoder.decode();
      break;
    }

    content += decoder.decode(value, { stream: true });
    onChunk(content, source);
  }

  if (!content.trim()) {
    throw new AiChatRequestError("The assistant returned an empty response.", 502);
  }

  onChunk(content, source);
  return { content, source };
}

type ChatErrorResponse = {
  code?: string;
  message?: string;
  loginUrl?: string;
};

async function sendChatRequest(body: string, signal?: AbortSignal) {
  return fetch("/api/gemini/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    signal,
  });
}

async function readChatError(response: Response) {
  return response.json().catch(() => null) as Promise<ChatErrorResponse | null>;
}

function createRequestError(
  status: number,
  errorData: ChatErrorResponse | null,
) {
  return new AiChatRequestError(
    errorData?.message || "Unable to send message.",
    status,
    errorData?.code,
    errorData?.loginUrl,
  );
}

async function refreshSession(signal?: AbortSignal) {
  try {
    const response = await fetch("/api/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal,
    });
    const result = (await response.json()) as { statusCode?: number };

    return response.ok &&
      (result.statusCode === 100 ||
        (typeof result.statusCode === "number" &&
          result.statusCode >= 200 &&
          result.statusCode < 300));
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }

    return false;
  }
}

function getAnswerSource(headers: Headers): AiAnswerSource | undefined {
  const type = headers.get("X-Answer-Source") as AiAnswerSourceType | null;
  const label = headers.get("X-Answer-Source-Label")?.trim();
  const updatedAt = headers.get("X-Answer-Source-Updated-At") || undefined;

  if (!type || !ANSWER_SOURCE_TYPES.has(type) || !label) {
    return undefined;
  }

  return { type, label: label.slice(0, 80), updatedAt };
}
