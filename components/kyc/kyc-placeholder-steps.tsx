"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { Alert, Button, Skeleton } from "antd";

type IdentityDocumentStepProps = {
  verificationUrl: string | null;
  loading: boolean;
  error: boolean;
  onPrevious: () => void;
  onRetry: () => void;
};

export function IdentityDocumentStep({
  verificationUrl,
  loading,
  error,
  onPrevious,
  onRetry,
}: IdentityDocumentStepProps) {
  return (
    <div>
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-end sm:justify-between">
        <header>
          <p className="m-0 text-xs font-semibold text-blue-600">Step 2 of 3</p>
          <h1 className="mb-1 mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-[28px]">
            Identity Document
          </h1>
          <p className="m-0 text-sm text-slate-500 sm:text-base">
            Verify your identity securely with Veriff.
          </p>
        </header>
        <Button icon={<ArrowLeftOutlined />} onClick={onPrevious}>
          Previous
        </Button>
      </div>

      {loading ? (
        <div className="py-8">
          <Skeleton active paragraph={{ rows: 10 }} />
        </div>
      ) : error || !verificationUrl ? (
        <div className="py-8">
          <Alert
            type="error"
            showIcon
            message="We could not start identity verification."
            description="Please try again to create a secure verification session."
            action={
              <Button size="small" onClick={onRetry}>
                Try again
              </Button>
            }
          />
        </div>
      ) : (
        <VeriffEmbeddedFrame verificationUrl={verificationUrl} onRetry={onRetry} />
      )}
    </div>
  );
}

function VeriffEmbeddedFrame({
  verificationUrl,
  onRetry,
}: {
  verificationUrl: string;
  onRetry: () => void;
}) {
  const [sdkError, setSdkError] = useState(false);
  const [sdkAttempt, setSdkAttempt] = useState(0);

  useEffect(() => {
    let disposed = false;
    let closeFrame: (() => void) | undefined;

    void import("@veriff/incontext-sdk")
      .then(({ createVeriffFrame }) => {
        if (disposed) {
          return;
        }

        const frame = createVeriffFrame({
          url: verificationUrl,
          embedded: true,
          embeddedOptions: {
            rootElementID: "veriff-embedded-root",
          },
        });
        closeFrame = () => frame.close();
        setSdkError(false);
      })
      .catch(() => {
        if (!disposed) {
          setSdkError(true);
        }
      });

    return () => {
      disposed = true;
      closeFrame?.();
    };
  }, [sdkAttempt, verificationUrl]);

  const handleRetry = () => {
    setSdkError(false);
    setSdkAttempt((attempt) => attempt + 1);
    onRetry();
  };

  return (
    <div className="relative mt-4 min-h-[680px]">
      <div
        id="veriff-embedded-root"
        className={`h-[680px] min-h-[680px] w-full overflow-hidden rounded-xl border border-slate-200 bg-white ${
          sdkError ? "invisible" : ""
        }`}
      />
      {sdkError ? (
        <div className="absolute inset-x-0 top-0 py-8">
          <Alert
            type="error"
            showIcon
            message="Veriff could not be loaded."
            description="Please retry the verification session."
            action={
              <Button size="small" onClick={handleRetry}>
                Try again
              </Button>
            }
          />
        </div>
      ) : null}
    </div>
  );
}
