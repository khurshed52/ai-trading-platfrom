"use client";

import DepositForm from "@/components/funds/deposit-form";
import { useUserDetail } from "@/hooks/useUser";

export default function Deposit() {
  const { data: userData } = useUserDetail();
  const customerSid = userData?.data.customer_SID;

  return (
    <div className="space-y-6">
      <div className="mb-2">
        <h1 className="m-0 text-2xl font-bold tracking-tight text-slate-950">
          Deposit Funds
          {customerSid !== undefined && (
            <span className="ml-2 text-base font-semibold text-slate-500">
              (SID: {customerSid})
            </span>
          )}
        </h1>

      </div>
      <DepositForm />
    </div>
  );
}
