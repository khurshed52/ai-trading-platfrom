"use client";

import {
  DownloadOutlined,
  EyeOutlined,
  FilePdfOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { App, Button, Tag } from "antd";
import type { ReactNode } from "react";

const TERMS_DOCUMENT_URL = "/documents/terms-v1.pdf";

type LegalDocumentCardProps = {
  title: string;
  description: string;
  actions: ReactNode;
};

function LegalDocumentCard({
  title,
  description,
  actions,
}: LegalDocumentCardProps) {
  return (
    <article className="rounded-xl border border-slate-200 p-4">
      <div className="flex items-start gap-4">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-red-50 text-2xl text-red-500">
          <FilePdfOutlined />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="m-0 text-base font-bold text-slate-950">
                {title}
              </h3>
              <p className="mb-0 mt-1 text-sm text-slate-500">
                {description}
              </p>
            </div>
            <Tag color="warning" className="!rounded-full !px-3 !py-1">
              Review document
            </Tag>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">{actions}</div>
        </div>
      </div>
    </article>
  );
}

export function LegalDocumentsCard() {
  const { message } = App.useApp();
  const showPrivacyUnavailable = () => {
    void message.info("The Privacy Policy document is not available yet.");
  };

  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
      <header className="mb-4 flex items-center gap-4">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-2xl text-blue-600">
          <FileTextOutlined />
        </span>
        <div>
          <h2 className="m-0 text-lg font-extrabold text-slate-950">
            Legal Documents &amp; Consents
          </h2>
          <p className="mb-0 mt-1 text-sm text-slate-500">
            Review our legal documents and provide your consent where required.
          </p>
        </div>
      </header>

      <div className="grid gap-4 xl:grid-cols-2">
        <LegalDocumentCard
          title="Terms & Conditions"
          description="Read our terms and conditions for using TradePro."
          actions={
            <>
              <Button
                type="primary"
                icon={<EyeOutlined />}
                href={TERMS_DOCUMENT_URL}
                target="_blank"
                className="!h-10 !min-w-36 !rounded-lg"
              >
                View PDF
              </Button>
              <Button
                icon={<DownloadOutlined />}
                href={TERMS_DOCUMENT_URL}
                download="tradepro-terms-and-conditions.pdf"
                className="!h-10 !min-w-36 !rounded-lg !border-blue-300 !font-semibold !text-blue-600"
              >
                Download
              </Button>
            </>
          }
        />
        <LegalDocumentCard
          title="Privacy Policy"
          description="Learn how we collect, use, and protect your data."
          actions={
            <>
              <Button
                type="primary"
                icon={<EyeOutlined />}
                onClick={showPrivacyUnavailable}
                className="!h-10 !min-w-36 !rounded-lg"
              >
                View PDF
              </Button>
              <Button
                icon={<DownloadOutlined />}
                onClick={showPrivacyUnavailable}
                className="!h-10 !min-w-36 !rounded-lg !border-blue-300 !font-semibold !text-blue-600"
              >
                Download
              </Button>
            </>
          }
        />
      </div>
    </section>
  );
}

export function SignedAgreementsCard() {
  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-[linear-gradient(105deg,#ffffff_0%,#ffffff_75%,#eef5ff_100%)] p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:flex-row sm:items-center">
      <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-2xl text-violet-600">
        <FileTextOutlined />
      </span>
      <div className="min-w-0 flex-1">
        <h2 className="m-0 text-lg font-extrabold text-slate-950">
          Signed Agreements
        </h2>
        <p className="mb-0 mt-1 text-sm text-slate-500">
          View your signed agreements and consent history.
        </p>
      </div>
      <Button
        icon={<FileTextOutlined />}
        href={TERMS_DOCUMENT_URL}
        target="_blank"
        className="!h-11 !rounded-lg !border-blue-300 !px-6 !font-semibold !text-blue-600"
      >
        View Documents
      </Button>
    </section>
  );
}
