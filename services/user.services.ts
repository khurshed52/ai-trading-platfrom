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

export function getUserDetail() {
  return internalApiFetch<UserDetail>("/api/backend/profile");
}
