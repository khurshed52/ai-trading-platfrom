export type TransactionType = "DEPOSIT" | "WITHDRAWAL" | "TRANSFER";

export type TransactionStatus =
  | "PENDING"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED"
  | "REJECTED";

export type TransactionAccount = {
  id: string;
  accountNumber: string;
  currency: string;
};

export type TransactionConversion = {
  exchangeRate: string;
  exchangeRateSource: string;
};

export type FundsTransaction = {
  transactionId: string;
  reference: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: string;
  currency: string;
  convertedAmount: string;
  convertedCurrency: string;
  conversion: TransactionConversion | null;
  account: TransactionAccount | null;
  sourceAccount: TransactionAccount | null;
  destinationAccount: TransactionAccount | null;
  approvalStatus: string;
  completedAt: string | null;
  createdAt: string;
};

export type TransactionsPagination = {
  page: number;
  pageSize: number;
  dataCount: number;
  pageCount: number;
  pageData: FundsTransaction[];
};

export type TransactionFilters = {
  type?: TransactionType;
  status?: TransactionStatus;
  currency?: string;
  reference?: string;
};

export type TransactionsParams = {
  page: number;
  pageSize: number;
  filters: TransactionFilters;
};
