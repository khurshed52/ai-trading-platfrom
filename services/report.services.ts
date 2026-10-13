import { internalApiFetch } from "@/lib/api";
import type {
  DepositReportRequest,
  DepositReportResponse,
  TransferReportRequest,
  TransferReportResponse,
  WithdrawalReportRequest,
  WithdrawalReportResponse,
} from "@/types/reports";

export function getDepositReport(
  request: DepositReportRequest,
): Promise<DepositReportResponse> {
  return internalApiFetch(
    "/api/backend/reports/deposits",
    {
      method: "POST",
      body: JSON.stringify(request),
    },
    "data",
  );
}

export function getWithdrawalReport(
  request: WithdrawalReportRequest,
): Promise<WithdrawalReportResponse> {
  return internalApiFetch(
    "/api/backend/reports/withdrawals",
    {
      method: "POST",
      body: JSON.stringify(request),
    },
    "data",
  );
}

export function getTransferReport(
  request: TransferReportRequest,
): Promise<TransferReportResponse> {
  return internalApiFetch(
    "/api/backend/reports/transfers",
    {
      method: "POST",
      body: JSON.stringify(request),
    },
    "data",
  );
}
