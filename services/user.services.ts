import { internalApiFetch } from "@/lib/api";

export type UserDetail = {
  customer_FirstName?: string;
  customer_MiddleName?: string;
  customer_LastName?: string;
  customer_SID?: string;
  customer_Status?: string;
  user_Email?: string;
  customer: {
    customerFirstName: string;
    customerLastName: string;
    sid: string;
    createdAt: string;
  },
  status: string;

};

export type TradingSummary = {
  amount: number;
  currency: string;
  total_Profit: number;
  total_Lot: number;
  total_Swap: number;
  total_OpenPosition: number;
}

export function getUserDetail() {
  return internalApiFetch<UserDetail>(
    "/api/backend/profile"
  );
}

export function getTradingSummary() {
  return internalApiFetch<TradingSummary>(
    "/api/backend/Miscellaneous/GetTradingSummary"
  );
}
