export type WithdrawRequest = {
  accountNumber: string;
  amount: number;
  payoutCurrency: string;
};

export type WithdrawalResponse = {
  transactionId: string;
  reference: string;
  status: string;
  account: {
    id: string;
    accountNumber: string;
    currency: string;
  };
  withdrawal: {
    amount: string;
    currency: string;
    amountUsd: string;
  };
  approval: {
    required: boolean;
    status: string;
  };
  payout: unknown | null;
  conversion: {
    exchangeRate: string;
    exchangeRateSource: string;
    convertedAmount: string;
    convertedCurrency: string;
  };
  idempotentReplay: boolean;
};

export type WithdrawFundsParams = {
  payload: WithdrawRequest;
  idempotencyKey: string;
};

export type WithdrawalAttempt = {
  idempotencyKey: string;
  requestBody: WithdrawRequest;
  createdAt: string;
};

export type PendingWithdrawalAttempt = WithdrawalAttempt & {
  state: "pending" | "uncertain" | "conflict";
};
