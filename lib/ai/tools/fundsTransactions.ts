import type {
  FundsTransaction,
  TransactionFilters,
} from "@/types/transactions";

type TransactionsResponse = {
  statusCode: number;
  message: string;
  data: {
    pageData?: FundsTransaction[];
  } | null;
};

export type FundsTransactionsErrorCode =
  | "SESSION_EXPIRED"
  | "SERVICE_UNAVAILABLE";

export class FundsTransactionsError extends Error {
  constructor(
    public readonly code: FundsTransactionsErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "FundsTransactionsError";
  }
}

export async function getFundsTransactions(
  accessToken: string,
  filters: TransactionFilters,
): Promise<FundsTransaction[]> {
  const backendBaseUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!backendBaseUrl) {
    throw new FundsTransactionsError(
      "SERVICE_UNAVAILABLE",
      "Your transaction history is temporarily unavailable.",
    );
  }

  try {
    const response = await fetch(`${backendBaseUrl}funds/transactions`, {
      method: "POST",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ page: 1, pageSize: 10, filters }),
    });
    const responseText = await response.text();
    let result: TransactionsResponse | null = null;

    try {
      result = responseText
        ? (JSON.parse(responseText) as TransactionsResponse)
        : null;
    } catch {
      throw new FundsTransactionsError(
        "SERVICE_UNAVAILABLE",
        "Your transaction history is temporarily unavailable.",
      );
    }

    if (
      response.status === 401 ||
      response.status === 403 ||
      result?.statusCode === 103 ||
      result?.statusCode === 401 ||
      result?.statusCode === 403
    ) {
      throw new FundsTransactionsError(
        "SESSION_EXPIRED",
        "Your session has expired. Please try again.",
      );
    }

    const successfulStatus =
      result?.statusCode === 100 ||
      (typeof result?.statusCode === "number" &&
        result.statusCode >= 200 &&
        result.statusCode < 300);
    const transactions = result?.data?.pageData;

    if (!response.ok || !successfulStatus || !Array.isArray(transactions)) {
      throw new FundsTransactionsError(
        "SERVICE_UNAVAILABLE",
        "Your transaction history is temporarily unavailable.",
      );
    }

    return transactions;
  } catch (error) {
    if (error instanceof FundsTransactionsError) throw error;

    throw new FundsTransactionsError(
      "SERVICE_UNAVAILABLE",
      "Your transaction history is temporarily unavailable.",
    );
  }
}
