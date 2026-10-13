"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardAnalytics } from "@/components/dashboard/dashboard-analytics";
import { DashboardHero } from "@/components/dashboard/dashboard-hero";
import { DashboardNotifications } from "@/components/dashboard/dashboard-notifications";
import { DashboardSummary } from "@/components/dashboard/dashboard-summary";
import { KycVerificationModal } from "@/components/kyc/kyc-verification-modal";
import { ROUTES } from "@/constants/routes";
import { useTradingSummary, useUserDetail } from "@/hooks/useUser";
import { getKycState, isKycStatus } from "@/lib/kyc";

export default function DashboardPage() {
  const router = useRouter();
  const [isKycModalDismissed, setIsKycModalDismissed] = useState(false);
  const userQuery = useUserDetail();
  const tradingSummaryQuery = useTradingSummary();
  const user = userQuery.data?.data;
  const tradingSummary = tradingSummaryQuery.data?.data;

  const resolvedKycStatus =
    user?.status && isKycStatus(user.status) ? user.status : null;
  const kycState = resolvedKycStatus
    ? getKycState(resolvedKycStatus)
    : null;
  const shouldShowKycModal = Boolean(
    userQuery.isSuccess && !isKycModalDismissed && kycState?.showDashboardModal,
  );

  return (
    <div className="space-y-4 pb-8 sm:space-y-5">
      <DashboardHero user={user} isLoading={userQuery.isLoading} />
      <DashboardSummary
        summary={tradingSummary}
        isLoading={tradingSummaryQuery.isLoading}
      />
      <DashboardAnalytics />
      <DashboardNotifications />

      {resolvedKycStatus && kycState ? (
        <KycVerificationModal
          open={shouldShowKycModal}
          status={resolvedKycStatus}
          state={kycState}
          onDismiss={() => setIsKycModalDismissed(true)}
          onContinue={() => router.push(ROUTES.PROFILE.KYC)}
        />
      ) : null}
    </div>
  );
}
