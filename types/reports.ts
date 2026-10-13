import type { ApiResponse } from "@/lib/api";

export type DepositReportStatus =
  | "PENDING"
  | "COMPLETED"
  | "FAILED"
  | "REJECTED"
  | "CANCELLED";

export type DepositPaymentMethod = "STRIPE" | "MOCK" | "COINPAYMENTS";

export type DepositReportFilters = {
  reference?: string;
  status?: DepositReportStatus;
  dateFrom?: string;
  dateTo?: string;
  tradingAccount?: string;
  paymentMethod?: DepositPaymentMethod;
};

export type DepositReportRequest = {
  page: number;
  pageSize: number;
  filters: DepositReportFilters;
};

export type DepositReportItem = {
  id: string;
  reference: string;
  type: "DEPOSIT";
  status: DepositReportStatus;
  tradingAccount: string | null;
  amount: string;
  currency: string;
  convertedAmount: string | null;
  convertedCurrency: string | null;
  exchangeRate: string | null;
  exchangeRateSource: string | null;
  paymentMethod: DepositPaymentMethod | null;
  createdAt: string;
  completedAt: string | null;
};

export type DepositReportPagination = {
  page: number;
  pageSize: number;
  dataCount: number;
  pageCount: number;
  pageData: DepositReportItem[];
};

export type DepositReportResponse = ApiResponse<DepositReportPagination>;

export type WithdrawalReportStatus = DepositReportStatus;

export type WithdrawalApprovalStatus =
  | "NOT_REQUIRED"
  | "PENDING"
  | "APPROVED"
  | "REJECTED";

export type WithdrawalPayoutMethod = DepositPaymentMethod;

export type WithdrawalReportFilters = {
  reference?: string;
  status?: WithdrawalReportStatus;
  dateFrom?: string;
  dateTo?: string;
  tradingAccount?: string;
  withdrawalApprovalStatus?: WithdrawalApprovalStatus;
  payoutMethod?: WithdrawalPayoutMethod;
};

export type WithdrawalReportRequest = {
  page: number;
  pageSize: number;
  filters: WithdrawalReportFilters;
};

export type WithdrawalReportItem = {
  id: string;
  reference: string;
  type: "WITHDRAWAL";
  status: WithdrawalReportStatus;
  tradingAccount: string | null;
  amount: string;
  currency: string;
  convertedAmount: string | null;
  convertedCurrency: string | null;
  exchangeRate: string | null;
  exchangeRateSource: string | null;
  withdrawalApprovalStatus: WithdrawalApprovalStatus;
  payoutMethod: WithdrawalPayoutMethod | null;
  payoutStatus: string | null;
  approvedAt: string | null;
  rejectedAt: string | null;
  createdAt: string;
  completedAt: string | null;
};

export type WithdrawalReportPagination = {
  page: number;
  pageSize: number;
  dataCount: number;
  pageCount: number;
  pageData: WithdrawalReportItem[];
};

export type WithdrawalReportResponse =
  ApiResponse<WithdrawalReportPagination>;

export type TransferReportStatus = DepositReportStatus;

export type TransferReportFilters = {
  status?: TransferReportStatus;
  dateFrom?: string;
  dateTo?: string;
  reference?: string;
  sourceAccount?: string;
  destinationAccount?: string;
};

export type TransferReportRequest = {
  page: number;
  pageSize: number;
  filters: TransferReportFilters;
};

export type TransferReportItem = {
  id: string;
  reference: string;
  type: "TRANSFER";
  status: TransferReportStatus;
  sourceAccount: string | null;
  destinationAccount: string | null;
  amount: string;
  currency: string;
  convertedAmount: string | null;
  convertedCurrency: string | null;
  exchangeRate: string | null;
  exchangeRateSource: string | null;
  createdAt: string;
  completedAt: string | null;
};

export type TransferReportPagination = {
  page: number;
  pageSize: number;
  dataCount: number;
  pageCount: number;
  pageData: TransferReportItem[];
};

export type TransferReportResponse = ApiResponse<TransferReportPagination>;
