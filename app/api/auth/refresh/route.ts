import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  ACCESS_TOKEN_COOKIE,
  BACKEND_REFRESH_COOKIE_NAME,
  extractRefreshCookie,
  isSafeCookieName,
  REFRESH_TOKEN_COOKIE,
  REMEMBER_SESSION_COOKIE,
} from "@/lib/auth-cookies";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const REMEMBER_ME_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

type RefreshResponseData = {
  accessToken?: string;
  token?: string;
  refreshToken?: string;
  refresh_Token?: string;
};

type BackendRefreshResponse = {
  statusCode: number;
  message: string;
  data: RefreshResponseData | null;
};

function clearAuthCookies(response: NextResponse) {
  response.cookies.delete(ACCESS_TOKEN_COOKIE);
  response.cookies.delete(REFRESH_TOKEN_COOKIE);
  response.cookies.delete(BACKEND_REFRESH_COOKIE_NAME);
  response.cookies.delete(REMEMBER_SESSION_COOKIE);
}

export async function POST() {
  try {
    if (!BASE_URL) {
      throw new Error("NEXT_PUBLIC_API_URL is missing");
    }

    const cookieStore = await cookies();
    const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;
    const storedBackendCookieName = cookieStore.get(
      BACKEND_REFRESH_COOKIE_NAME,
    )?.value;
    const backendCookieName =
      storedBackendCookieName && isSafeCookieName(storedBackendCookieName)
        ? storedBackendCookieName
        : "refreshToken";
    const rememberSession =
      cookieStore.get(REMEMBER_SESSION_COOKIE)?.value === "1";

    if (!refreshToken) {
      const response = NextResponse.json(
        {
          statusCode: 401,
          message: "Refresh token is missing",
          data: null,
        },
        { status: 401 },
      );
      clearAuthCookies(response);
      return response;
    }

    const backendResponse = await fetch(`${BASE_URL}auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${refreshToken}`,
        Cookie: `${backendCookieName}=${refreshToken}`,
      },
      cache: "no-store",
    });
    const result = (await backendResponse.json()) as BackendRefreshResponse;
    const accessToken = result.data?.accessToken ?? result.data?.token;

    if (!backendResponse.ok || result.statusCode !== 200 || !accessToken) {
      const refreshRejected =
        backendResponse.status === 401 ||
        backendResponse.status === 403 ||
        result.statusCode === 103 ||
        result.statusCode === 401 ||
        result.statusCode === 403;
      const response = NextResponse.json(
        {
          statusCode: result.statusCode || backendResponse.status,
          message: result.message || "Unable to refresh session",
          data: null,
        },
        {
          status: refreshRejected
            ? 401
            : backendResponse.ok
              ? 503
              : backendResponse.status,
        },
      );
      if (refreshRejected) {
        clearAuthCookies(response);
      }
      return response;
    }

    const response = NextResponse.json({
      statusCode: result.statusCode,
      message: result.message,
      data: null,
    });

    response.cookies.set(ACCESS_TOKEN_COOKIE, accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      ...(rememberSession && { maxAge: REMEMBER_ME_MAX_AGE_SECONDS }),
    });

    const rotatedBackendCookie = extractRefreshCookie(backendResponse.headers);
    const rotatedRefreshToken =
      result.data?.refreshToken ??
      result.data?.refresh_Token ??
      rotatedBackendCookie?.value;

    if (rotatedRefreshToken) {
      response.cookies.set(REFRESH_TOKEN_COOKIE, rotatedRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        ...(rememberSession && { maxAge: REMEMBER_ME_MAX_AGE_SECONDS }),
      });

      response.cookies.set(
        BACKEND_REFRESH_COOKIE_NAME,
        rotatedBackendCookie?.name ?? backendCookieName,
        {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          ...(rememberSession && { maxAge: REMEMBER_ME_MAX_AGE_SECONDS }),
        },
      );
    }

    return response;
  } catch (error) {
    const response = NextResponse.json(
      {
        statusCode: 500,
        message: error instanceof Error ? error.message : "Unable to refresh session",
        data: null,
      },
      { status: 503 },
    );
    return response;
  }
}
