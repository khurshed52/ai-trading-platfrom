import { NextRequest, NextResponse } from "next/server";

type MarketAuxResponse = {
  data?: unknown[];
};

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.MARKET_AUX_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { message: "MARKET_AUX_API_KEY is missing" },
        { status: 500 }
      );
    }

    const requestedLanguage = request.nextUrl.searchParams.get("language");
    const language =
      requestedLanguage && /^[a-z]{2}$/i.test(requestedLanguage)
        ? requestedLanguage.toLowerCase()
        : "zh";

    const params = new URLSearchParams({
      api_token: apiKey,
      language: 'en',
      limit: "9",
      entity_types: "currency",
      must_have_entities: "true",
      filter_entities: "true",
    });

    const response = await fetch(
      `https://api.marketaux.com/v1/news/all?${params.toString()}`,
      {
        next: {
          revalidate: 300, // cache for 5 minutes
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch market news");
    }

    const result = (await response.json()) as MarketAuxResponse;

    if (!Array.isArray(result.data)) {
      throw new Error("Market news response is invalid");
    }

    return NextResponse.json({
      status: "success",
      data: result.data,
    });
  } catch (error) {
    console.error("Market news error:", error);

    return NextResponse.json(
      { message: "Failed to fetch market news" },
      { status: 500 }
    );
  }
}
