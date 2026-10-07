"use client";

import { Card } from "antd";
import type { ReactNode } from "react";

type TransferAccountCardProps = {
  number: number;
  title: string;
  icon?: ReactNode;
  children: ReactNode;
};

export function TransferAccountCard({
  number,
  title,
  icon,
  children,
}: TransferAccountCardProps) {
  return (
    <Card
      bordered={false}
      className="!rounded-2xl !shadow-[0_1px_4px_rgba(76,29,149,0.04)]"
      styles={{ body: { padding: 12 } }}
    >
      <div className="flex items-center gap-2">
        <span className="flex size-7 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
          {number}
        </span>
        <span className="text-blue-600">{icon}</span>
        <h2 className="m-0 text-lg font-bold text-slate-950">{title}</h2>
      </div>
      {children}
    </Card>
  );
}

type SummaryRowProps = {
  label: string;
  value: string;
  highlight?: boolean;
};

export function SummaryRow({
  label,
  value,
  highlight = false,
}: SummaryRowProps) {
  return (
    <div className="mb-5 flex items-start justify-between gap-5 last:mb-0">
      <span className="text-sm text-slate-300">{label}</span>
      <span
        className={`text-right text-sm font-semibold ${
          highlight ? "text-lg text-emerald-400" : "text-white"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
