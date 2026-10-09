export type StripeDepositPayload = {
  accountNumber: string;
  amount: number;
  currency: string;
  provider: "STRIPE";
};

export type DepositExchangeRateData = {
  fromCurrency: string;
  toCurrency: string;
  amount: string;
  exchangeRate: string;
  convertedAmount: string;
  source: string;
  quotedAt: string;
  providerDate: string;
};

export type StripeDepositResponse = {
  transactionId: string;
  reference: string;
  status: string;
  account: {
    id: string;
    accountNumber: string;
    currency: string;
  };
  deposit: {
    amount: string;
    currency: string;
  };
  conversion: {
    exchangeRate: string;
    exchangeRateSource: string;
    convertedAmount: string;
    convertedCurrency: string;
  };
  payment: {
    attemptId: string;
    provider: "STRIPE";
    status: string;
    checkoutUrl: string | null;
  };
  idempotentReplay: boolean;
};

export type StripeDepositAttempt = {
  idempotencyKey: string;
  requestBody: StripeDepositPayload;
  createdAt: string;
};

export type PendingDepositAttempt = StripeDepositAttempt & {
  state: "uncertain" | "initiated" | "conflict";
  transactionId?: string;
  reference?: string;
};

export type InitiateStripeDepositRequest = {
  payload: StripeDepositPayload;
  idempotencyKey: string;
};
