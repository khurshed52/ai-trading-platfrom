const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export type ApiResponse<T> = {
  statusCode: number;
  message: string;
  data: T;
};

const EXPIRED_SESSION_STATUS_CODE = 103;
let clearSessionPromise: Promise<void> | null = null;
let refreshSessionPromise: Promise<boolean> | null = null;

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

async function refreshSession(): Promise<boolean> {
  if (typeof window === "undefined") {
    return false;
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

        return response.ok && isSuccessfulStatus(result.statusCode);
      })
      .catch(() => false)
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
    throw new Error(
      result.message || "API request failed"
    );
  }

  if (!isSuccessfulStatus(result.statusCode)) {
    throw new Error(
      result.message || "Something went wrong"
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

  if (sessionExpired && (await refreshSession())) {
    response = await fetch(endpoint, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });
    result = (await response.json()) as ApiResponse<T>;
  }

  if (
    result.statusCode === EXPIRED_SESSION_STATUS_CODE ||
    response.status === 401
  ) {
    await clearExpiredSession();
    throw new Error(result.message || "Session expired");
  }

  if (!response.ok) {
    throw new Error(
      result.message || "API request failed"
    );
  }

  if (!isSuccessfulStatus(result.statusCode)) {
    throw new Error(
      result.message || "Something went wrong"
    );
  }

  return result;
}
