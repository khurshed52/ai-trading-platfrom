"use client";

import { useState } from "react";
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  FilePdfOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import { Button, Checkbox } from "antd";

import { useSignKycAgreement } from "@/hooks/useKyc";
import { KycStatus, type SignedKycAgreement } from "@/types/kyc";

import { SignaturePad } from "./signature-pad";

export const DOCUMENT_VERSION = "terms-v1";
const DOCUMENT_URL = "/documents/terms-v1.pdf";

type SignDocumentsStepProps = {
  onBack: () => void;
  onCompleted: (result: SignedKycAgreement) => void;
};

export function SignDocumentsStep({
  onBack,
  onCompleted,
}: SignDocumentsStepProps) {
  const [accepted, setAccepted] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);
  const signAgreementMutation = useSignKycAgreement();

  const handleConsentChange = (checked: boolean) => {
    setAccepted(checked);
    if (!checked) {
      setSignature(null);
    }
  };

  const handleSubmit = () => {
    if (!accepted || !signature || signAgreementMutation.isPending) {
      return;
    }

    signAgreementMutation.mutate(
      {
        accepted: true,
        documentVersion: DOCUMENT_VERSION,
        signature,
      },
      {
        onSuccess: (response) => {
          if (response.data.status === KycStatus.COMPLETED) {
            onCompleted(response.data);
          }
        },
      },
    );
  };

  return (
    <div>
      <h1 className="mb-4 mt-0 text-2xl font-bold tracking-tight text-slate-950 sm:text-[28px]">
        Sign Documents
      </h1>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50/70">
        <div className="flex flex-col gap-3 border-b border-slate-200 bg-white px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-xl text-red-500">
              <FilePdfOutlined />
            </div>
            <div className="min-w-0">
              <p className="m-0 truncate text-sm font-bold text-slate-950">
                Terms of Service
              </p>
              <p className="mb-0 mt-0.5 text-xs text-slate-500">
                Version: {DOCUMENT_VERSION} <span aria-hidden="true">·</span> PDF
              </p>
            </div>
          </div>
          <Button
            href={DOCUMENT_URL}
            target="_blank"
            rel="noreferrer"
            icon={<LinkOutlined />}
            iconPosition="end"
          >
            Open in new tab
          </Button>
        </div>

        <iframe
          src={`${DOCUMENT_URL}#toolbar=1&navpanes=0&view=FitH`}
          title="TradePro Terms of Service PDF"
          className="h-[340px] w-full border-0 bg-slate-100 sm:h-[390px]"
        />
      </section>

      <section className="mt-3 rounded-xl border border-blue-100 bg-blue-50/40 p-3">
        <Checkbox
          checked={accepted}
          onChange={(event) => handleConsentChange(event.target.checked)}
        >
          <span className="font-semibold text-slate-900">
            I have read, understood and agree to the Terms of Service
          </span>
        </Checkbox>
        <p className="mb-0 ml-6 mt-1 text-xs leading-5 text-slate-500">
          By checking this box and signing below, you confirm that you accept
          the above document electronically.
        </p>

        <div
          className={`grid transition-all duration-300 ease-out ${
            accepted
              ? "mt-3 grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            {accepted ? <SignaturePad onChange={setSignature} /> : null}
          </div>
        </div>
      </section>

      <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button icon={<ArrowLeftOutlined />} onClick={onBack}>
          Back
        </Button>
        <Button
          type="primary"
          icon={<ArrowRightOutlined />}
          iconPosition="end"
          loading={signAgreementMutation.isPending}
          disabled={!accepted || !signature || signAgreementMutation.isPending}
          onClick={handleSubmit}
          className="sm:!min-w-[180px]"
        >
          {signAgreementMutation.isPending ? "Submitting" : "Submit"}
        </Button>
      </div>
    </div>
  );
}
