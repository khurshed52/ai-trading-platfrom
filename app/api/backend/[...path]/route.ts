import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

async function handleRequest(
  request: NextRequest,
  context: {
    params: Promise<{
      path: string[];
    }>;
  }
) {
  try {
    const { path } = await context.params;

    const endpoint = path.join("/");

    const cookieStore = await cookies();

    const token = cookieStore.get("access_token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          statusCode: 401,
          message: "Unauthorized",
          data: null,
        },
        {
          status: 401,
        }
      );
    }

    const url = `${BASE_URL}${endpoint}${request.nextUrl.search}`;

    let body: string | undefined;

    if (
      request.method !== "GET" &&
      request.method !== "HEAD"
    ) {
      body = await request.text();
    }

    const response = await fetch(url, {
      method: request.method,

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },

      ...(body && {
        body,
      }),
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
      {
        status: 500,
      }
    );
  }
}

export const GET = handleRequest;
export const POST = handleRequest;
export const PUT = handleRequest;
export const PATCH = handleRequest;
export const DELETE = handleRequest;
