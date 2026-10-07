"use client";
import ReactMarkdown from "react-markdown";

import {
  ChangeEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Button,
  Input,
  Modal,
  Spin,
  Typography,
} from "antd";
import {
  BadgeCheck,
  Bot,
  FileText,
  Globe2,
  Headphones,
  LockKeyhole,
  MessageCircle,
  Paperclip,
  RotateCcw,
  Send,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  TrendingUp,
  UserRound,
  X,
} from "lucide-react";
import { AUTH_LOGOUT_EVENT } from "@/lib/auth-events";

const { TextArea } = Input;
const { Text } = Typography;

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  source?: AnswerSource;
};

type AnswerSourceType =
  | "company_policy"
  | "gemini"
  | "internal_api"
  | "market_data"
  | "marketaux"
  | "verified_tradepro";

type AnswerSource = {
  type: AnswerSourceType;
  label: string;
  updatedAt?: string;
};

type ChatAttachment = {
  name: string;
  mimeType: string;
  data: string;
  size: number;
};

type FeedbackRating = "helpful" | "not-helpful";

const SUPPORT_URL = process.env.NEXT_PUBLIC_SUPPORT_URL;
const INITIAL_GREETING = "Hello! How can I help you with TradePro?";

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const FILE_ACCEPT = [
  ".txt",
  ".md",
  ".csv",
  ".json",
  ".html",
  ".css",
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".py",
  ".sql",
  ".yaml",
  ".yml",
  ".xml",
  ".rtf",
  ".pdf",
  ".bmp",
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".mp3",
  ".wav",
  ".mp4",
  ".mpeg",
  ".mov",
  ".webm",
].join(",");

const MIME_TYPE_BY_EXTENSION: Record<string, string> = {
  txt: "text/plain",
  md: "text/markdown",
  csv: "text/csv",
  json: "application/json",
  html: "text/html",
  css: "text/css",
  js: "text/javascript",
  jsx: "text/plain",
  ts: "text/plain",
  tsx: "text/plain",
  py: "text/plain",
  sql: "text/plain",
  yaml: "text/plain",
  yml: "text/plain",
  xml: "text/xml",
  rtf: "text/rtf",
  pdf: "application/pdf",
  bmp: "image/bmp",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  mp3: "audio/mpeg",
  wav: "audio/wav",
  mp4: "video/mp4",
  mpeg: "video/mpeg",
  mov: "video/quicktime",
  webm: "video/webm",
};

const ANSWER_SOURCE_TYPES = new Set<AnswerSourceType>([
  "company_policy",
  "gemini",
  "internal_api",
  "market_data",
  "marketaux",
  "verified_tradepro",
]);

const SOURCE_BADGE_STYLES: Record<AnswerSourceType, string> = {
  company_policy: "bg-violet-50 text-violet-700",
  gemini: "bg-slate-100 text-slate-600",
  internal_api: "bg-emerald-50 text-emerald-700",
  market_data: "bg-cyan-50 text-cyan-700",
  marketaux: "bg-blue-50 text-blue-700",
  verified_tradepro: "bg-teal-50 text-teal-700",
};

function getSourceIcon(type: AnswerSourceType) {
  switch (type) {
    case "company_policy":
      return <FileText size={13} />;
    case "internal_api":
      return <LockKeyhole size={13} />;
    case "market_data":
      return <TrendingUp size={13} />;
    case "marketaux":
      return <Globe2 size={13} />;
    case "verified_tradepro":
      return <BadgeCheck size={13} />;
    case "gemini":
      return <Sparkles size={13} />;
  }
}

function getAnswerSource(headers: Headers): AnswerSource | undefined {
  const type = headers.get("X-Answer-Source") as AnswerSourceType | null;
  const label = headers.get("X-Answer-Source-Label")?.trim();
  const updatedAt = headers.get("X-Answer-Source-Updated-At") || undefined;

  if (!type || !ANSWER_SOURCE_TYPES.has(type) || !label) {
    return undefined;
  }

  return {
    type,
    label: label.slice(0, 80),
    updatedAt,
  };
}

function AnswerSourceBadge({ source }: { source: AnswerSource }) {
  return (
    <span
      title={source.updatedAt ? `Retrieved ${source.updatedAt}` : undefined}
      className={`mr-1 inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium ${SOURCE_BADGE_STYLES[source.type]}`}
    >
      {getSourceIcon(source.type)}
      {source.label}
      {source.updatedAt && <span className="opacity-70">· Just now</span>}
    </span>
  );
}

function createMessage(
  role: ChatMessage["role"],
  content: string,
): ChatMessage {
  return {
    id: crypto.randomUUID(),
    role,
    content,
  };
}

function needsSupportOption(content: string): boolean {
  const normalizedContent = content
    .replace(/[’‘]/g, "'")
    .replace(/\s+/g, " ")
    .toLowerCase();
  const mentionsTradePro = normalizedContent.includes("tradepro");
  const indicatesMissingInformation = [
    "don't have verified",
    "do not have verified",
    "not available",
    "unavailable",
    "not documented",
    "not detailed",
    "not provided",
    "no contact details",
    "contact details are missing",
    "specific contact channels",
    "no approved facts",
    "cannot confirm",
    "can't confirm",
    "not in the verified",
  ].some((phrase) => normalizedContent.includes(phrase));

  return mentionsTradePro && indicatesMissingInformation;
}

export default function GeminiChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [attachment, setAttachment] =
    useState<ChatAttachment | null>(null);
  const [attachmentError, setAttachmentError] = useState("");
  const [messageFeedback, setMessageFeedback] = useState<
    Record<string, FeedbackRating>
  >({});
  const [isStreaming, setIsStreaming] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    createMessage("assistant", INITIAL_GREETING),
  ]);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(
    null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const container = scrollContainerRef.current;

    if (!container) {
      return;
    }

    container.scrollTo({
      top: container.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isStreaming]);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    function clearChatAfterLogout() {
      abortControllerRef.current?.abort();
      abortControllerRef.current = null;
      setMessages([createMessage("assistant", INITIAL_GREETING)]);
      setMessageFeedback({});
      setPrompt("");
      setAttachment(null);
      setAttachmentError("");
      setIsStreaming(false);
      setIsOpen(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }

    window.addEventListener(AUTH_LOGOUT_EVENT, clearChatAfterLogout);

    return () => {
      window.removeEventListener(AUTH_LOGOUT_EVENT, clearChatAfterLogout);
    };
  }, []);

  async function handleSend() {
    const message =
      prompt.trim() ||
      (attachment ? "Please summarize this file." : "");

    if ((!message && !attachment) || isStreaming) {
      return;
    }

    const selectedAttachment = attachment;
    const userMessage = createMessage(
      "user",
      selectedAttachment
        ? `📎 ${selectedAttachment.name}\n\n${message}`
        : message,
    );
    const assistantMessage = createMessage("assistant", "");

    setPrompt("");
    setAttachment(null);
    setAttachmentError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setIsStreaming(true);

    setMessages((currentMessages) => [
      ...currentMessages,
      userMessage,
      assistantMessage,
    ]);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          history: messages
            .filter(
              (chatMessage, index) =>
                index > 0 && chatMessage.content.trim(),
            )
            .slice(-12)
            .map((chatMessage) => ({
              role: chatMessage.role,
              content: chatMessage.content,
            })),
          file: selectedAttachment
            ? {
                name: selectedAttachment.name,
                mimeType: selectedAttachment.mimeType,
                data: selectedAttachment.data,
              }
            : undefined,
        }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        const errorData = (await response.json().catch(() => null)) as
          | {
              code?: string;
              message?: string;
              loginUrl?: string;
            }
          | null;

        if (response.status === 401 && errorData?.code === "AUTH_REQUIRED") {
          const loginUrl = errorData.loginUrl || "/login";

          setMessages((currentMessages) =>
            currentMessages.map((chatMessage) =>
              chatMessage.id === assistantMessage.id
                ? {
                    ...chatMessage,
                    content: `${errorData.message}\n\n[Log in to continue](${loginUrl})`,
                  }
                : chatMessage,
            ),
          );
          return;
        }

        throw new Error(
          errorData?.message || "Unable to send message.",
        );
      }

      if (!response.body) {
        throw new Error("Streaming response is unavailable.");
      }

      const responseSource = getAnswerSource(response.headers);
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let accumulatedResponse = "";

      while (true) {
        const { value, done } = await reader.read();

        if (done) {
          break;
        }

        accumulatedResponse += decoder.decode(value, {
          stream: true,
        });

        setMessages((currentMessages) =>
          currentMessages.map((chatMessage) =>
            chatMessage.id === assistantMessage.id
                ? {
                  ...chatMessage,
                  content: accumulatedResponse,
                  source: responseSource,
                }
              : chatMessage,
          ),
        );
      }

      if (!accumulatedResponse.trim()) {
        throw new Error("Gemini returned an empty response.");
      }
    } catch (error) {
      if (
        error instanceof DOMException &&
        error.name === "AbortError"
      ) {
        return;
      }

      const errorMessage =
        error instanceof Error
          ? error.message
          : "Something went wrong.";

      setMessages((currentMessages) =>
        currentMessages.map((chatMessage) =>
          chatMessage.id === assistantMessage.id
            ? {
                ...chatMessage,
                content: `Sorry, I could not respond: ${errorMessage}`,
              }
            : chatMessage,
        ),
      );
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  }

  async function handleFileChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setAttachmentError("");

    if (file.size > MAX_FILE_BYTES) {
      setAttachment(null);
      setAttachmentError("File must be 5 MB or smaller.");
      event.target.value = "";
      return;
    }

    const extension = file.name.split(".").pop()?.toLowerCase() || "";
    const mimeType = file.type || MIME_TYPE_BY_EXTENSION[extension];

    if (!mimeType || !Object.values(MIME_TYPE_BY_EXTENSION).includes(mimeType)) {
      setAttachment(null);
      setAttachmentError("This file type is not supported.");
      event.target.value = "";
      return;
    }

    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("Unable to read the file."));
        reader.readAsDataURL(file);
      });
      const data = dataUrl.split(",", 2)[1];

      if (!data) {
        throw new Error("Unable to read the file.");
      }

      setAttachment({
        name: file.name,
        mimeType,
        data,
        size: file.size,
      });
    } catch (error) {
      setAttachment(null);
      setAttachmentError(
        error instanceof Error ? error.message : "Unable to read the file.",
      );
      event.target.value = "";
    }
  }

  function removeAttachment() {
    setAttachment(null);
    setAttachmentError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleFeedback(messageId: string, rating: FeedbackRating) {
    setMessageFeedback((currentFeedback) => ({
      ...currentFeedback,
      [messageId]: rating,
    }));
  }

  function handleKeyDown(
    event: KeyboardEvent<HTMLTextAreaElement>,
  ) {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();
      void handleSend();
    }
  }

  function handleChatScrollKeyDown(
    event: KeyboardEvent<HTMLDivElement>,
  ) {
    const container = event.currentTarget;

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        container.scrollBy({ top: 80, behavior: "smooth" });
        break;
      case "ArrowUp":
        event.preventDefault();
        container.scrollBy({ top: -80, behavior: "smooth" });
        break;
      case "PageDown":
        event.preventDefault();
        container.scrollBy({
          top: container.clientHeight * 0.8,
          behavior: "smooth",
        });
        break;
      case "PageUp":
        event.preventDefault();
        container.scrollBy({
          top: -container.clientHeight * 0.8,
          behavior: "smooth",
        });
        break;
      case "Home":
        event.preventDefault();
        container.scrollTo({ top: 0, behavior: "smooth" });
        break;
      case "End":
        event.preventDefault();
        container.scrollTo({
          top: container.scrollHeight,
          behavior: "smooth",
        });
        break;
    }
  }

  function handleClose() {
    setIsOpen(false);
  }

  function handleNewConversation() {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setMessages([createMessage("assistant", INITIAL_GREETING)]);
    setMessageFeedback({});
    setPrompt("");
    setAttachment(null);
    setAttachmentError("");
    setIsStreaming(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleStop() {
    abortControllerRef.current?.abort();
    setIsStreaming(false);
  }

  return (
    <>
      <button
        type="button"
        aria-label="Open TradePro assistant"
        onClick={() => setIsOpen(true)}
        className="
          fixed bottom-6 right-6 z-[999]
          flex size-14 items-center justify-center
          rounded-full bg-blue-600 text-white
          shadow-[0_14px_35px_rgba(37,99,235,0.38)]
          transition duration-200
          hover:-translate-y-1 hover:bg-blue-700
          focus:outline-none focus:ring-4 focus:ring-blue-600/20
        "
      >
        <MessageCircle size={25} />
      </button>

      <Modal
        open={isOpen}
        onCancel={handleClose}
        footer={null}
        centered
        width={560}
        destroyOnHidden={false}
        title={
          <div className="flex w-full items-center justify-between gap-3 pr-3">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-blue-600 text-white">
                <Bot size={20} />
              </div>

              <div>
                <p className="m-0 text-base font-semibold text-slate-950">
                  TradePro Assistant
                </p>

                <div className="mt-0.5 flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-emerald-500" />

                  <Text className="!text-xs !text-slate-500">
                    Powered by Gemini
                  </Text>
                </div>
              </div>
            </div>

            <Button
              type="text"
              size="small"
              icon={<RotateCcw size={14} />}
              onClick={handleNewConversation}
              disabled={messages.length === 1 && !prompt && !attachment}
            >
              New chat
            </Button>
          </div>
        }
        closeIcon={<X size={19} />}
        styles={{
            container: {
                borderRadius: 24,
                padding: 0,
                overflow: "hidden",
            },
            header: {
                margin: 0,
                padding: "20px 22px",
                borderBottom: "1px solid #e2e8f0",
            },
            body: {
                padding: 0,
            },
            }}
      >
        <div className="flex h-[600px] max-h-[75vh] flex-col bg-slate-50">
          <div
            ref={scrollContainerRef}
            role="log"
            aria-label="TradePro chat messages"
            aria-live="polite"
            aria-relevant="additions text"
            tabIndex={0}
            onKeyDown={handleChatScrollKeyDown}
            className="flex-1 space-y-4 overflow-y-auto px-5 py-5"
          >
            {messages.map((message) => {
              const isUser = message.role === "user";

              return (
                <div
                  key={message.id}
                  className={`flex items-start gap-2.5 ${
                    isUser
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  {!isUser && (
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                      <Bot size={16} />
                    </div>
                  )}

                  <div className="max-w-[82%]">
                    <div
                      className={`whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-6 ${
                        isUser
                          ? "rounded-br-md bg-blue-600 text-white"
                          : "rounded-bl-md border border-slate-200 bg-white text-slate-700 shadow-sm"
                      }`}
                    >
                      <ReactMarkdown
                        components={{
                          a: ({ node, href, ...linkProps }) => {
                            void node;
                            const isInternalLink = href?.startsWith("/");

                            return (
                              <a
                                {...linkProps}
                                href={href}
                                target={isInternalLink ? undefined : "_blank"}
                                rel={
                                  isInternalLink
                                    ? undefined
                                    : "noopener noreferrer"
                                }
                              />
                            );
                          },
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                      {!message.content &&
                        message.role === "assistant" &&
                        isStreaming && (
                          <div className="flex items-center gap-2">
                            <Spin size="small" />
                            <span className="text-slate-400">
                              Thinking…
                            </span>
                          </div>
                        )}
                    </div>

                    {!isUser && message.content && (
                      <div className="mt-1.5 flex flex-wrap items-center gap-1">
                        {message.source && (
                          <AnswerSourceBadge source={message.source} />
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            handleFeedback(message.id, "helpful")
                          }
                          aria-label="Mark response as helpful"
                          aria-pressed={
                            messageFeedback[message.id] === "helpful"
                          }
                          className={`rounded-lg p-1.5 transition ${
                            messageFeedback[message.id] === "helpful"
                              ? "bg-emerald-100 text-emerald-700"
                              : "text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                          }`}
                        >
                          <ThumbsUp size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleFeedback(message.id, "not-helpful")
                          }
                          aria-label="Mark response as not helpful"
                          aria-pressed={
                            messageFeedback[message.id] === "not-helpful"
                          }
                          className={`rounded-lg p-1.5 transition ${
                            messageFeedback[message.id] === "not-helpful"
                              ? "bg-red-100 text-red-600"
                              : "text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                          }`}
                        >
                          <ThumbsDown size={14} />
                        </button>

                        {needsSupportOption(message.content) &&
                          (SUPPORT_URL ? (
                            <a
                              href={SUPPORT_URL}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-1 inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50"
                            >
                              <Headphones size={14} />
                              Contact support
                            </a>
                          ) : (
                            <button
                              type="button"
                              disabled
                              title="Set NEXT_PUBLIC_SUPPORT_URL to enable support contact"
                              className="ml-1 inline-flex cursor-not-allowed items-center gap-1 rounded-lg px-2 py-1 text-xs text-slate-400"
                            >
                              <Headphones size={14} />
                              Contact support
                            </button>
                          ))}
                      </div>
                    )}
                  </div>

                  {isUser && (
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-600">
                      <UserRound size={16} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="border-t border-slate-200 bg-white p-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-2 transition focus-within:border-blue-500 focus-within:shadow-[0_0_0_3px_rgba(37,99,235,0.1)]">
              <input
                ref={fileInputRef}
                type="file"
                accept={FILE_ACCEPT}
                onChange={(event) => void handleFileChange(event)}
                className="hidden"
              />

              {attachment && (
                <div className="mx-1 mb-2 flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-xs text-blue-700">
                  <FileText size={15} className="shrink-0" />
                  <span className="min-w-0 flex-1 truncate">
                    {attachment.name} · {(attachment.size / 1024).toFixed(1)} KB
                  </span>
                  <button
                    type="button"
                    onClick={removeAttachment}
                    aria-label={`Remove ${attachment.name}`}
                    className="rounded p-0.5 hover:bg-blue-100"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              {attachmentError && (
                <p className="mx-2 mb-2 mt-0 text-xs text-red-500">
                  {attachmentError}
                </p>
              )}

              <TextArea
                value={prompt}
                onChange={(event) =>
                  setPrompt(event.target.value)
                }
                onKeyDown={handleKeyDown}
                placeholder="Ask something about TradePro..."
                autoSize={{
                  minRows: 2,
                  maxRows: 5,
                }}
                variant="borderless"
                disabled={isStreaming}
                className="!resize-none !text-sm"
              />

              <div className="mt-2 flex items-center justify-between px-1 pb-1">
                <div className="flex items-center gap-2">
                  <Button
                    type="text"
                    shape="circle"
                    icon={<Paperclip size={17} />}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isStreaming}
                    aria-label="Attach a file"
                    title="Attach PDF, text, image, audio, or video (max 5 MB)"
                  />
                  <Text className="!text-[11px] !text-slate-400">
                    Enter to send · Shift + Enter for new line
                  </Text>
                </div>

                {isStreaming ? (
                  <Button
                    danger
                    type="text"
                    onClick={handleStop}
                  >
                    Stop
                  </Button>
                ) : (
                  <Button
                    type="primary"
                    shape="circle"
                    icon={<Send size={16} />}
                    disabled={!prompt.trim() && !attachment}
                    onClick={() => void handleSend()}
                    aria-label="Send message"
                  />
                )}
              </div>
            </div>

            <p className="mb-0 mt-3 text-center text-[11px] text-slate-400">
              AI responses may be inaccurate and are not financial
              advice.
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
}
