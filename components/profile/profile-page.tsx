"use client";

import { useEffect } from "react";
import { Button, Result, Skeleton } from "antd";
import { useRouter } from "next/navigation";

import { ProfileDetails } from "@/components/profile/profile-details";
import { ProfileSummaryHero } from "@/components/profile/profile-summary-hero";
import { ROUTES } from "@/constants/routes";
import { useKycStatus } from "@/hooks/useKyc";
import { KycStatus } from "@/types/kyc";

export function ProfilePageContent() {
  const router = useRouter();
  const profileQuery = useKycStatus();
  const user = profileQuery.data?.data;
  const isApproved = user?.status === KycStatus.APPROVED;

  useEffect(() => {
    if (profileQuery.isSuccess && user && !isApproved) {
      router.replace(ROUTES.PROFILE.KYC);
    }
  }, [isApproved, profileQuery.isSuccess, router, user]);

  if (profileQuery.isLoading || (user && !isApproved)) {
    return (
      <div className="space-y-4">

        <div className="rounded-2xl bg-white p-8">
          <Skeleton active avatar paragraph={{ rows: 5 }} />
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-2xl bg-white p-6">
            <Skeleton active paragraph={{ rows: 6 }} />
          </div>
          <div className="rounded-2xl bg-white p-6">
            <Skeleton active paragraph={{ rows: 6 }} />
          </div>
        </div>
      </div>
    );
  }

  if (profileQuery.isError || !user) {
    return (
      <Result
        status="error"
        title="We couldn’t load your profile"
        subTitle={profileQuery.error?.message ?? "Please try again."}
        extra={
          <Button type="primary" onClick={() => profileQuery.refetch()}>
            Try Again
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-2 pb-2">
      <div>
        <h1 className="m-0 text-2xl font-extrabold text-slate-950">Profile</h1>
      </div>

      <ProfileSummaryHero user={user} />
      <ProfileDetails user={user} />
    </div>
  );
}
