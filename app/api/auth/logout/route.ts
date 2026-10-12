import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  ACCESS_TOKEN_COOKIE,
  BACKEND_REFRESH_COOKIE_NAME,
  isSafeCookieName,
  REFRESH_TOKEN_COOKIE,
  REMEMBER_SESSION_COOKIE,
} from "@/lib/auth-cookies";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

type BackendLogoutResponse = {
  statusCode: number;
  message: string;
  data: null;
};

function clearAuthCookies(response: NextResponse) {
  response.cookies.delete(ACCESS_TOKEN_COOKIE);
  response.cookies.delete(REFRESH_TOKEN_COOKIE);
  response.cookies.delete(BACKEND_REFRESH_COOKIE_NAME);
  response.cookies.delete(REMEMBER_SESSION_COOKIE);
}

function createLoggedOutResponse(result?: BackendLogoutResponse) {
  const response = NextResponse.json({
    statusCode: result?.statusCode ?? 200,
    message: result?.message ?? "Logged out successfully",
    data: null,
  });

  clearAuthCookies(response);

  return response;
}

export async function POST() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;
  const storedBackendCookieName = cookieStore.get(
    BACKEND_REFRESH_COOKIE_NAME,
  )?.value;
  const backendCookieName =
    storedBackendCookieName && isSafeCookieName(storedBackendCookieName)
      ? storedBackendCookieName
      : "refreshToken";

  if (!BASE_URL || (!accessToken && !refreshToken)) {
    return createLoggedOutResponse();
  }

  try {
    const headers = new Headers({ Accept: "application/json" });

    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }

    if (refreshToken) {
      headers.set("Cookie", `${backendCookieName}=${refreshToken}`);
    }

    const backendResponse = await fetch(`${BASE_URL}auth/logout`, {
      method: "POST",
      headers,
      cache: "no-store",
    });
    const result = (await backendResponse.json()) as BackendLogoutResponse;

    return createLoggedOutResponse(
      backendResponse.ok && result.statusCode === 200 ? result : undefined,
    );
  } catch {
    // Local logout must still complete if the backend is temporarily unavailable.
    return createLoggedOutResponse();
  }
}
