"use client";

import { FileTextOutlined } from "@ant-design/icons";
import { Empty } from "antd";

type ReportPlaceholderProps = {
  reportName: "Withdrawal" | "Transfer";
};

export function ReportPlaceholder({ reportName }: ReportPlaceholderProps) {
  return (
    <div className="space-y-5 pb-4">
      <header>
        <h1 className="m-0 text-2xl font-extrabold text-slate-950">
          {reportName} Report
        </h1>
      </header>
      <section className="flex min-h-[420px] items-center justify-center rounded-2xl border border-slate-100 bg-white p-8 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
        <Empty
          image={<FileTextOutlined className="text-6xl text-blue-500" />}
          description={
            <span className="text-base font-semibold text-slate-700">
              Coming Soon — {reportName} Reports
            </span>
          }
        />
      </section>
    </div>
  );
}
