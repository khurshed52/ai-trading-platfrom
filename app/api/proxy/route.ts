import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();

    const token = cookieStore.get("access_token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          statusCode: 401,
          message: "Unauthorized",
          data: null,
        },
        { status: 401 }
      );
    }

    const endpoint = request.nextUrl.searchParams.get("endpoint");

    if (!endpoint) {
      return NextResponse.json(
        {
          statusCode: 400,
          message: "Endpoint is required",
          data: null,
        },
        { status: 400 }
      );
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();

    return NextResponse.json(result, {
      status: response.status,
    });
  } catch (error) {
    return NextResponse.json(
      {
        statusCode: 500,
        message:
          error instanceof Error
            ? error.message
            : "Something went wrong",
        data: null,
      },
      { status: 500 }
    );
  }
}