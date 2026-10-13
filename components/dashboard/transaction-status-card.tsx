"use client";

import { BarChart3 } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { transactionStatusData } from "./dashboard-mock-data";

const totalTransactions = transactionStatusData.reduce(
  (sum, item) => sum + item.value,
  0,
);

export function TransactionStatusCard() {
  return (
    <section className="rounded-xl border border-slate-200/80 bg-white shadow-sm">
      <header className="flex items-start gap-3 border-b border-slate-100 px-5 py-4">
        <BarChart3 className="mt-0.5 text-slate-950" size={25} />
        <div>
          <h2 className="font-bold text-slate-950">
            Transaction Status Overview
          </h2>
          <p className="text-xs text-slate-500">
            Number of transactions by status (all types)
          </p>
        </div>
      </header>

      <div className="grid items-center gap-2 px-4 py-5 sm:grid-cols-[minmax(180px,0.9fr)_minmax(210px,1.1fr)]">
        <div className="relative mx-auto h-52 w-full max-w-60">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={transactionStatusData}
                dataKey="value"
                nameKey="name"
                innerRadius={58}
                outerRadius={84}
                paddingAngle={1}
                stroke="#ffffff"
                strokeWidth={1}
              >
                {transactionStatusData.map((item) => (
                  <Cell key={item.name} fill={item.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 grid place-content-center text-center">
            <strong className="text-2xl text-slate-950">{totalTransactions}</strong>
            <span className="text-xs text-slate-500">Transactions</span>
          </div>
        </div>

        <ul className="space-y-4">
          {transactionStatusData.map((item) => (
            <li
              key={item.name}
              className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-3 text-sm"
            >
              <span
                className="size-3 rounded-full"
                style={{ backgroundColor: item.color }}
                aria-hidden
              />
              <span className="text-slate-600">{item.name}</span>
              <strong className="text-slate-950">{item.value}</strong>
              <span className="w-9 text-right text-slate-500">
                {Math.round((item.value / totalTransactions) * 100)}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
