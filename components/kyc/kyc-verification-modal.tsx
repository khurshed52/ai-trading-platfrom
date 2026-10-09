"use client";

import {
  ArrowRightOutlined,
  CloseOutlined,
  FileTextOutlined,
  IdcardOutlined,
  InfoCircleFilled,
  UserOutlined,
} from "@ant-design/icons";
import { Button, Modal, Typography } from "antd";

import { TradingVerificationAnimation } from "@/components/kyc/trading-verification-animation";
import type { KycState } from "@/types/kyc";
import { KycStatus } from "@/types/kyc";

const { Text, Title } = Typography;

type KycVerificationModalProps = {
  open: boolean;
  status: KycStatus;
  state: KycState;
  onContinue: () => void;
  onDismiss: () => void;
};

type ModalCopy = {
  heading: string;
  description: string;
  action: string;
};

const steps = [
  {
    title: "Personal Information",
    description: "Tell us about yourself",
    icon: <UserOutlined aria-hidden />,
    iconClassName: "bg-blue-50 text-blue-600",
  },
  {
    title: "Identity Document",
    description: "Upload a valid ID",
    icon: <FileTextOutlined aria-hidden />,
    iconClassName: "bg-violet-50 text-violet-600",
  },
  {
    title: "Sign Documents",
    description: "Review and e-sign",
    icon: <IdcardOutlined aria-hidden />,
    iconClassName: "bg-emerald-50 text-emerald-600",
  },
] as const;

function getModalCopy(
  status: KycStatus,
  state: KycState,
): ModalCopy {
  if (status === KycStatus.IDENTITY_REJECTED) {
    return {
      heading: "Identity Verification Required",
      description:
        "Your identity document could not be verified. Please review your information and try again.",
      action: "Review Verification",
    };
  }

  if (status === KycStatus.REJECTED) {
    return {
      heading: "Verification Requires Attention",
      description:
        "We couldn't complete your verification. Please review the required information and resubmit your verification.",
      action: "Review Verification",
    };
  }

  return {
    heading: "Verify Your Identity",
    description:
      "To start trading and access all features, please complete your identity verification. It only takes a few minutes.",
    action:
      state.modalType === "onboarding"
        ? "Complete Verification"
        : "Continue Verification",
  };
}

export function KycVerificationModal({
  open,
  status,
  state,
  onContinue,
  onDismiss,
}: KycVerificationModalProps) {
  const copy = getModalCopy(status, state);

  return (
    <Modal
      open={open}
      centered
      footer={null}
      width={580}
      onCancel={onDismiss}
      closeIcon={<CloseOutlined aria-label="Close verification reminder" />}
      styles={{
        mask: {
          backgroundColor: "rgba(15, 23, 42, 0.62)",
          backdropFilter: "blur(2px)",
        },
        container: {
          maxHeight: "calc(100vh - 32px)",
          overflowY: "auto",
          borderRadius: 24,
          padding: 0,
          boxShadow: "0 28px 80px rgba(15, 23, 42, 0.28)",
        },
        body: {
          padding: "30px 22px 22px",
        },
      }}
    >
      <div className="mx-auto flex max-w-[510px] flex-col items-center text-center">
        <TradingVerificationAnimation active={open} />

        <Title
          level={2}
          className="!mb-2 !text-[28px] !font-bold !tracking-[-0.025em] !text-slate-950 sm:!text-[32px]"
        >
          {copy.heading}
        </Title>
        <Text className="max-w-[470px] !text-[15px] !leading-6 !text-slate-500 sm:!text-base">
          {copy.description}
        </Text>

        <div className="mt-6 grid w-full gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-center sm:gap-2">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="contents"
            >
              <div className="flex min-w-0 items-center gap-3 text-left sm:flex-col sm:gap-2 sm:text-center">
                <span
                  className={`flex size-12 shrink-0 items-center justify-center rounded-2xl text-xl ${step.iconClassName}`}
                >
                  {step.icon}
                </span>
                <span className="min-w-0">
                  <span className="block text-[13px] font-semibold leading-5 text-slate-900">
                    {step.title}
                  </span>
                  <span className="block text-xs leading-5 text-slate-500">
                    {step.description}
                  </span>
                </span>
              </div>
              {index < steps.length - 1 ? (
                <span
                  className="mx-auto h-5 border-l border-dashed border-blue-200 sm:h-0 sm:w-6 sm:border-l-0 sm:border-t"
                  aria-hidden
                />
              ) : null}
            </div>
          ))}
        </div>

        <Button
          type="primary"
          block
          size="large"
          className="!mt-4 !h-12 !rounded-xl !font-semibold !shadow-[0_12px_25px_rgba(37,99,235,0.22)]"
          icon={<ArrowRightOutlined />}
          iconPosition="end"
          onClick={onContinue}
        >
          {copy.action}
        </Button>

        <Button
          type="text"
          className="!mt-1 !font-medium !text-slate-500"
          onClick={onDismiss}
        >
          Maybe later
        </Button>

        <div className="mt-2 flex w-full items-start gap-3 rounded-xl bg-blue-50 px-4 py-3 text-left">
          <InfoCircleFilled
            className="mt-0.5 shrink-0 text-base text-blue-600"
            aria-hidden
          />
          <Text className="!text-[13px] !leading-5 !text-blue-700">
            You can explore the platform, but some features may be limited
            until your verification is completed.
          </Text>
        </div>
      </div>
    </Modal>
  );
}
