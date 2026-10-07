import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const REMEMBER_ME_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
const REMEMBER_SESSION_COOKIE = "remember_session";

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
  response.cookies.delete("access_token");
  response.cookies.delete("refresh_token");
  response.cookies.delete(REMEMBER_SESSION_COOKIE);
}

export async function POST() {
  try {
    if (!BASE_URL) {
      throw new Error("NEXT_PUBLIC_API_URL is missing");
    }

    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refresh_token")?.value;
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
      },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    });
    const result = (await backendResponse.json()) as BackendRefreshResponse;
    const accessToken = result.data?.accessToken ?? result.data?.token;

    if (!backendResponse.ok || result.statusCode !== 200 || !accessToken) {
      const response = NextResponse.json(
        {
          statusCode: result.statusCode || backendResponse.status,
          message: result.message || "Unable to refresh session",
          data: null,
        },
        { status: backendResponse.ok ? 401 : backendResponse.status },
      );
      clearAuthCookies(response);
      return response;
    }

    const response = NextResponse.json({
      statusCode: result.statusCode,
      message: result.message,
      data: null,
    });

    response.cookies.set("access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      ...(rememberSession && { maxAge: REMEMBER_ME_MAX_AGE_SECONDS }),
    });

    const rotatedRefreshToken =
      result.data?.refreshToken ?? result.data?.refresh_Token;

    if (rotatedRefreshToken) {
      response.cookies.set("refresh_token", rotatedRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        ...(rememberSession && { maxAge: REMEMBER_ME_MAX_AGE_SECONDS }),
      });
    }

    return response;
  } catch (error) {
    const response = NextResponse.json(
      {
        statusCode: 500,
        message: error instanceof Error ? error.message : "Unable to refresh session",
        data: null,
      },
      { status: 500 },
    );
    clearAuthCookies(response);
    return response;
  }
}
