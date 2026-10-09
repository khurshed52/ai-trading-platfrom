export const ACCESS_TOKEN_COOKIE = "access_token";
export const REFRESH_TOKEN_COOKIE = "refresh_token";
export const BACKEND_REFRESH_COOKIE_NAME = "backend_refresh_cookie_name";
export const REMEMBER_SESSION_COOKIE = "remember_session";

const refreshCookieNames = [
  "refresh_token",
  "refreshToken",
  "refresh-token",
  "RefreshToken",
  "Refresh_Token",
] as const;

type HeadersWithSetCookie = Headers & {
  getSetCookie?: () => string[];
};

export type RefreshCookie = {
  name: string;
  value: string;
};

function getSetCookieHeaders(headers: Headers): string[] {
  const headersWithSetCookie = headers as HeadersWithSetCookie;
  const separateHeaders = headersWithSetCookie.getSetCookie?.();

  if (separateHeaders?.length) {
    return separateHeaders;
  }

  const combinedHeader = headers.get("set-cookie");
  return combinedHeader ? [combinedHeader] : [];
}

export function extractRefreshCookie(headers: Headers): RefreshCookie | null {
  const escapedNames = refreshCookieNames
    .map((name) => name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");
  const cookiePattern = new RegExp(
    `(?:^|[,;]\\s*)(${escapedNames})=("[^"]*"|[^;,\\s]+)`,
    "i",
  );

  for (const setCookieHeader of getSetCookieHeaders(headers)) {
    const match = setCookieHeader.match(cookiePattern);
    if (!match) continue;

    const value = match[2].startsWith('"')
      ? match[2].slice(1, -1)
      : match[2];

    if (value) {
      return { name: match[1], value };
    }
  }

  return null;
}

export function isSafeCookieName(value: string): boolean {
  return /^[A-Za-z0-9_-]+$/.test(value);
}
