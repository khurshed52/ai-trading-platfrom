import { NextResponse } from "next/server";
import {
  ACCESS_TOKEN_COOKIE,
  BACKEND_REFRESH_COOKIE_NAME,
  extractRefreshCookie,
  REFRESH_TOKEN_COOKIE,
  REMEMBER_SESSION_COOKIE,
} from "@/lib/auth-cookies";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const REMEMBER_ME_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

type LoginRequestBody = {
  email: string;
  password: string;
  rememberMe?: boolean;
};

type AuthenticatedUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type LoginResponseData = {
  accessToken?: string;
  token?: string;
  refreshToken?: string;
  refresh_Token?: string;
  user?: AuthenticatedUser;
  customer_ID?: string;
  login_ID?: string;
};

type BackendLoginResponse = {
  statusCode: number;
  message: string;
  data: LoginResponseData | null;
};

function isSuccessfulStatus(statusCode: number) {
  return statusCode === 100 || statusCode === 200;
}

export async function POST(request: Request) {
  try {
    if (!BASE_URL) {
      throw new Error("NEXT_PUBLIC_API_URL is missing");
    }

    const body = (await request.json()) as LoginRequestBody;
    const { rememberMe = false, email, password } = body;
    const response = await fetch(`${BASE_URL}auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });
    const result = (await response.json()) as BackendLoginResponse;

    if (!response.ok || !isSuccessfulStatus(result.statusCode) || !result.data) {
      return NextResponse.json(
        {
          statusCode: result.statusCode,
          message: result.message || "Login failed",
          data: null,
        },
        { status: response.ok ? 400 : response.status },
      );
    }

    const accessToken = result.data.accessToken ?? result.data.token;
    if (!accessToken) {
      return NextResponse.json(
        {
          statusCode: 500,
          message: "The login response did not include an access token",
          data: null,
        },
        { status: 500 },
      );
    }

    const persistenceOptions = rememberMe
      ? { maxAge: REMEMBER_ME_MAX_AGE_SECONDS }
      : {};
    const nextResponse = NextResponse.json({
      statusCode: result.statusCode,
      message: result.message,
      data: result.data,
    });

    nextResponse.cookies.set(ACCESS_TOKEN_COOKIE, accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      ...persistenceOptions,
    });

    const backendRefreshCookie = extractRefreshCookie(response.headers);
    const refreshToken =
      result.data.refreshToken ??
      result.data.refresh_Token ??
      backendRefreshCookie?.value;
    if (refreshToken) {
      nextResponse.cookies.set(REFRESH_TOKEN_COOKIE, refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        ...persistenceOptions,
      });

      nextResponse.cookies.set(
        BACKEND_REFRESH_COOKIE_NAME,
        backendRefreshCookie?.name ?? "refreshToken",
        {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          ...persistenceOptions,
        },
      );
    }

    if (rememberMe) {
      nextResponse.cookies.set(REMEMBER_SESSION_COOKIE, "1", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: REMEMBER_ME_MAX_AGE_SECONDS,
      });
    } else {
      nextResponse.cookies.delete(REMEMBER_SESSION_COOKIE);
    }

    return nextResponse;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Login failed";
    return NextResponse.json(
      { statusCode: 500, message, data: null },
      { status: 500 },
    );
  }
}
