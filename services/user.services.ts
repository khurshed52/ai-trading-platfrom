import { internalApiFetch } from "@/lib/api";

export type UserDetail = {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  status: string;
  permissions: {
    withdrawalAllowed: boolean;
  };
  restrictions: {
    withdrawalAllowedAt: string | null;
  };
  createdAt: string;
  updatedAt: string;
  customer_FirstName?: string;
  customer_MiddleName?: string;
  customer_LastName?: string;
  customer_SID?: string;
  customer_Status?: string;
  user_Email?: string;
  customer: {
    id: string;
    customerFirstName: string;
    customerLastName: string;
    customerNationality: string;
    phoneNumber: string;
    isActive: boolean;
    sid: string;
    createdAt: string;
    updatedAt: string;
  };
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
