import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({
    statusCode: 100,
    message: "Logged out successfully",
    data: null,
  });

  response.cookies.delete("access_token");
  response.cookies.delete("refresh_token");
  response.cookies.delete("remember_session");

  return response;
}
