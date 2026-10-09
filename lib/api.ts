const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export type ApiResponse<T> = {
  statusCode: number;
  message: string;
  data: T;
};

export class ApiRequestError extends Error {
  constructor(
    message: string,
    public readonly httpStatus: number,
    public readonly apiStatusCode?: number,
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}

const EXPIRED_SESSION_STATUS_CODE = 103;
let clearSessionPromise: Promise<void> | null = null;
type RefreshSessionResult = "refreshed" | "unauthorized" | "failed";
let refreshSessionPromise: Promise<RefreshSessionResult> | null = null;

function isSuccessfulStatus(statusCode: number): boolean {
  return statusCode === 100 || (statusCode >= 200 && statusCode < 300);
}

async function clearExpiredSession(): Promise<void> {
  if (typeof window === "undefined") {
    return;
  }

  if (!clearSessionPromise) {
    clearSessionPromise = fetch("/api/auth/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then(() => undefined)
      .catch(() => undefined);
  }

  await clearSessionPromise;
  window.location.replace("/login");
}

async function refreshSession(): Promise<RefreshSessionResult> {
  if (typeof window === "undefined") {
    return "failed";
  }

  if (!refreshSessionPromise) {
    refreshSessionPromise = fetch("/api/auth/refresh", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then(async (response) => {
        const result = (await response.json()) as ApiResponse<null>;

        if (response.ok && isSuccessfulStatus(result.statusCode)) {
          return "refreshed" as const;
        }

        return response.status === 401 || response.status === 403
          ? ("unauthorized" as const)
          : ("failed" as const);
      })
      .catch(() => "failed" as const)
      .finally(() => {
        refreshSessionPromise = null;
      });
  }

  return refreshSessionPromise;
}

export async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  if (!BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is missing");
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,

    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  const result: ApiResponse<T> =
    await response.json();

  if (!response.ok) {
    throw new ApiRequestError(
      result.message || "API request failed",
      response.status,
      result.statusCode,
    );
  }

  if (!isSuccessfulStatus(result.statusCode)) {
    throw new ApiRequestError(
      result.message || "Something went wrong",
      response.status,
      result.statusCode,
    );
  }

  return result;
}

export async function internalApiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  let response = await fetch(endpoint, {
    ...options,

    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  let result = (await response.json()) as ApiResponse<T>;

  const sessionExpired =
    result.statusCode === EXPIRED_SESSION_STATUS_CODE || response.status === 401;

  if (sessionExpired) {
    const refreshResult = await refreshSession();

    if (refreshResult === "refreshed") {
      response = await fetch(endpoint, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
        },
      });
      result = (await response.json()) as ApiResponse<T>;
    } else if (refreshResult === "unauthorized") {
      await clearExpiredSession();
      throw new Error(result.message || "Session expired");
    } else {
      throw new Error(
        "We could not refresh your session. Please try again shortly.",
      );
    }
  }

  if (
    result.statusCode === EXPIRED_SESSION_STATUS_CODE ||
    response.status === 401
  ) {
    await clearExpiredSession();
    throw new Error(result.message || "Session expired");
  }

  if (!response.ok) {
    throw new ApiRequestError(
      result.message || "API request failed",
      response.status,
      result.statusCode,
    );
  }

  if (!isSuccessfulStatus(result.statusCode)) {
    throw new ApiRequestError(
      result.message || "Something went wrong",
      response.status,
      result.statusCode,
    );
  }

  return result;
}
