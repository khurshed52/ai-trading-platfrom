import { NextResponse } from "next/server";
import {
  ACCESS_TOKEN_COOKIE,
  BACKEND_REFRESH_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE,
  REMEMBER_SESSION_COOKIE,
} from "@/lib/auth-cookies";

export async function POST() {
  const response = NextResponse.json({
    statusCode: 100,
    message: "Logged out successfully",
    data: null,
  });

  response.cookies.delete(ACCESS_TOKEN_COOKIE);
  response.cookies.delete(REFRESH_TOKEN_COOKIE);
  response.cookies.delete(BACKEND_REFRESH_COOKIE_NAME);
  response.cookies.delete(REMEMBER_SESSION_COOKIE);

  return response;
}
