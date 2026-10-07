type TradingSummary = {
  amount: number;
  currency: string;
  total_Profit: number;
  total_Lot: number;
  total_Swap: number;
  total_OpenPosition: number;
};

type TradingSummaryResponse = {
  statusCode: number;
  message: string;
  data: TradingSummary | null;
};

export type TradingSummaryErrorCode =
  | "SESSION_EXPIRED"
  | "SERVICE_UNAVAILABLE";

export class TradingSummaryError extends Error {
  constructor(
    public readonly code: TradingSummaryErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "TradingSummaryError";
  }
}

export async function getTradingSummary(
  accessToken: string,
): Promise<TradingSummary> {
  const backendBaseUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!backendBaseUrl) {
    throw new TradingSummaryError(
      "SERVICE_UNAVAILABLE",
      "Trading information is temporarily unavailable.",
    );
  }

  try {
    const response = await fetch(
      `${backendBaseUrl}Miscellaneous/GetTradingSummary`,
      {
        method: "GET",
        cache: "no-store",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    const result = (await response.json()) as TradingSummaryResponse;

    if (
      response.status === 401 ||
      response.status === 403 ||
      result.statusCode === 103
    ) {
      throw new TradingSummaryError(
        "SESSION_EXPIRED",
        "Your session has expired. Please log in again.",
      );
    }

    if (!response.ok || result.statusCode !== 100 || !result.data) {
      throw new TradingSummaryError(
        "SERVICE_UNAVAILABLE",
        "Your trading summary is temporarily unavailable. Please try again.",
      );
    }

    return result.data;
  } catch (error) {
    if (error instanceof TradingSummaryError) {
      throw error;
    }

    throw new TradingSummaryError(
      "SERVICE_UNAVAILABLE",
      "Your trading summary is temporarily unavailable. Please try again.",
    );
  }
}
