export type TransferRequest = {
  sourceAccountNumber: string;
  destinationAccountNumber: string;
  amount: number;
};

export type TransferResponseAccount = {
  accountId: string;
  accountNumber: string;
  amount: string;
  currency: string;
  balance: string;
  reservedBalance?: string;
};

export type TransferResponse = {
  transactionId: string;
  reference: string;
  status: string;
  source: TransferResponseAccount;
  destination: TransferResponseAccount;
  conversion: {
    exchangeRate: string;
    exchangeRateSource: string;
  };
  completedAt: string;
  idempotentReplay: boolean;
};

export type TransferFundsParams = {
  payload: TransferRequest;
  idempotencyKey: string;
};

export type TransferAttempt = {
  idempotencyKey: string;
  requestBody: TransferRequest;
  createdAt: string;
};

export type PendingTransferAttempt = TransferAttempt & {
  state: "pending" | "uncertain" | "conflict";
};
