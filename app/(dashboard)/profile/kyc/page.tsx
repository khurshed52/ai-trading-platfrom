"use client";

import { useMemo, useState } from "react";
import { Alert, Button, Card, Skeleton } from "antd";
import { useQueryClient } from "@tanstack/react-query";

import { KycCompletionState } from "@/components/kyc/kyc-completion-state";
import { KycProgress } from "@/components/kyc/kyc-progress";
import { IdentityDocumentStep } from "@/components/kyc/kyc-placeholder-steps";
import { PersonalInformationStep } from "@/components/kyc/personal-information-step";
import { SignDocumentsStep } from "@/components/kyc/sign-documents-step";
import { VerificationAssistant } from "@/components/kyc/verification-assistant";
import {
  useIdentityVerificationSession,
  useKycProfile,
  useKycStatus,
  useUpdateKycProfile,
} from "@/hooks/useKyc";
import type { ApiResponse } from "@/lib/api";
import {
  getSafeVerificationUrl,
  getKycStepFromStatus,
  isKycStatus,
  mapFormToKycProfileRequest,
  mapKycProfileToForm,
} from "@/lib/kyc";
import type { UserDetail } from "@/services/user.services";
import { KycStatus } from "@/types/kyc";
import type {
  KycPersonalInformationValues,
  KycProfileData,
  KycStep,
  SignedKycAgreement,
} from "@/types/kyc";

export default function KycPage() {
  const queryClient = useQueryClient();
  const statusQuery = useKycStatus();
  const statusValue = statusQuery.data?.data.status;
  const status = statusValue && isKycStatus(statusValue) ? statusValue : null;
  const backendStep = status ? getKycStepFromStatus(status) : null;
  const [selectedStep, setSelectedStep] = useState<KycStep | null>(null);
  const [submissionComplete, setSubmissionComplete] = useState(false);
  const currentStep = selectedStep ?? backendStep;
  const kycProfileQuery = useKycProfile(currentStep === 1);
  const updateProfileMutation = useUpdateKycProfile();
  const identitySessionQuery = useIdentityVerificationSession(currentStep === 2);
  const kycProfile = kycProfileQuery.data?.data;
  const initialValues = useMemo(
    () => (kycProfile ? mapKycProfileToForm(kycProfile) : null),
    [kycProfile],
  );
  const [personalValues, setPersonalValues] = useState<
    Partial<KycPersonalInformationValues>
  >({});
  const assistantValues =
    Object.keys(personalValues).length > 0
      ? personalValues
      : (initialValues ?? {});
  const verificationUrl = getSafeVerificationUrl(
    identitySessionQuery.data?.data.verificationUrl,
  );

  if (!statusQuery.data && statusQuery.isFetching && !statusQuery.isError) {
    return <KycPageSkeleton />;
  }

  if (!statusQuery.data && statusQuery.isError) {
    return (
      <KycErrorState
        message="We could not load your verification status."
        onRetry={() => statusQuery.refetch()}
      />
    );
  }

  if (!status || !currentStep) {
    return (
      <KycErrorState
        message="Your account returned an unsupported verification status."
        onRetry={() => statusQuery.refetch()}
      />
    );
  }

  if (
    submissionComplete ||
    status === KycStatus.COMPLETED ||
    status === KycStatus.APPROVED
  ) {
    return <KycCompletionState />;
  }

  const handlePersonalInformationSubmit = (
    values: KycPersonalInformationValues,
  ) => {
    setPersonalValues(values);
    updateProfileMutation.mutate(mapFormToKycProfileRequest(values), {
      onSuccess: (response) => {
        queryClient.setQueryData<ApiResponse<UserDetail>>(
          ["user-detail"],
          (currentResponse) =>
            currentResponse
              ? {
                  ...currentResponse,
                  data: {
                    ...currentResponse.data,
                    status: response.data.status,
                  },
                }
              : currentResponse,
        );
        void queryClient.invalidateQueries({ queryKey: ["kyc-profile"] });
        setSelectedStep(2);
      },
    });
  };

  const handlePrevious = () => {
    setSelectedStep(1);
    void kycProfileQuery.refetch();
  };

  const handleBackToIdentity = () => {
    setSelectedStep(2);
  };

  const handleAgreementCompleted = (result: SignedKycAgreement) => {
    queryClient.setQueryData<ApiResponse<UserDetail>>(
      ["user-detail"],
      (currentResponse) =>
        currentResponse
          ? {
              ...currentResponse,
              data: {
                ...currentResponse.data,
                status: result.status,
              },
            }
          : currentResponse,
    );
    setSubmissionComplete(true);
  };

  return (
    <div className="space-y-3">
      <KycProgress status={status} currentStep={currentStep} />

      <div className="grid min-w-0 gap-3 xl:grid-cols-[minmax(0,7fr)_minmax(310px,3fr)] xl:items-start">
        <Card
          bordered={false}
          className="min-w-0 !rounded-2xl !border !border-slate-200/80 shadow-[0_16px_45px_rgba(15,23,42,0.06)]"
          styles={{ body: { padding: 18 } }}
        >
          <ActiveKycStep
            step={currentStep}
            profile={kycProfile}
            profileLoading={kycProfileQuery.isFetching}
            profileError={kycProfileQuery.isError}
            initialValues={initialValues}
            profileSubmitting={updateProfileMutation.isPending}
            onValuesChange={setPersonalValues}
            onSubmit={handlePersonalInformationSubmit}
            onRetryProfile={() => kycProfileQuery.refetch()}
            verificationUrl={verificationUrl}
            identityLoading={identitySessionQuery.isFetching}
            identityError={identitySessionQuery.isError}
            onRetryIdentity={() => identitySessionQuery.refetch()}
            onPrevious={handlePrevious}
            onBackToIdentity={handleBackToIdentity}
            onAgreementCompleted={handleAgreementCompleted}
          />
        </Card>

        {currentStep === 1 && kycProfileQuery.isFetching ? (
          <Card bordered={false} className="!rounded-2xl !border !border-slate-200">
            <Skeleton active paragraph={{ rows: 8 }} />
          </Card>
        ) : (
          <VerificationAssistant
            status={status}
            currentStep={currentStep}
            values={assistantValues}
          />
        )}
      </div>
    </div>
  );
}

type ActiveKycStepProps = {
  step: KycStep;
  profile?: KycProfileData;
  profileLoading: boolean;
  profileError: boolean;
  initialValues: KycPersonalInformationValues | null;
  profileSubmitting: boolean;
  onValuesChange: (values: KycPersonalInformationValues) => void;
  onSubmit: (values: KycPersonalInformationValues) => void;
  onRetryProfile: () => void;
  verificationUrl: string | null;
  identityLoading: boolean;
  identityError: boolean;
  onRetryIdentity: () => void;
  onPrevious: () => void;
  onBackToIdentity: () => void;
  onAgreementCompleted: (result: SignedKycAgreement) => void;
};

function ActiveKycStep({
  step,
  profile,
  profileLoading,
  profileError,
  initialValues,
  profileSubmitting,
  onValuesChange,
  onSubmit,
  onRetryProfile,
  verificationUrl,
  identityLoading,
  identityError,
  onRetryIdentity,
  onPrevious,
  onBackToIdentity,
  onAgreementCompleted,
}: ActiveKycStepProps) {
  if (step === 1) {
    if (profileLoading) {
      return <FormSkeleton />;
    }

    if (profileError || !profile || !initialValues) {
      return (
        <KycErrorState
          compact
          message="We could not load your personal information."
          onRetry={onRetryProfile}
        />
      );
    }

    return (
      <PersonalInformationStep
        profile={profile}
        initialValues={initialValues}
        submitting={profileSubmitting}
        onValuesChange={onValuesChange}
        onSubmit={onSubmit}
      />
    );
  }

  if (step === 2) {
    return (
      <IdentityDocumentStep
        verificationUrl={verificationUrl}
        loading={identityLoading}
        error={identityError}
        onPrevious={onPrevious}
        onRetry={onRetryIdentity}
      />
    );
  }

  return (
    <SignDocumentsStep
      onBack={onBackToIdentity}
      onCompleted={onAgreementCompleted}
    />
  );
}

function KycPageSkeleton() {
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <Skeleton active paragraph={{ rows: 1 }} title={{ width: "35%" }} />
      </div>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,7fr)_minmax(310px,3fr)]">
        <Card bordered={false} className="!rounded-2xl !border !border-slate-200">
          <FormSkeleton />
        </Card>
        <Card bordered={false} className="!rounded-2xl !border !border-slate-200">
          <Skeleton active paragraph={{ rows: 8 }} />
        </Card>
      </div>
    </div>
  );
}

function FormSkeleton() {
  return <Skeleton active paragraph={{ rows: 12 }} title={{ width: "42%" }} />;
}

function KycErrorState({
  message,
  onRetry,
  compact = false,
}: {
  message: string;
  onRetry: () => void;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "py-8" : "mx-auto max-w-2xl py-16"}>
      <Alert
        type="error"
        showIcon
        message={message}
        action={
          <Button size="small" onClick={onRetry}>
            Try again
          </Button>
        }
      />
    </div>
  );
}
