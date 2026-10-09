"use client";

import { CheckOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { useRouter } from "next/navigation";

import { ROUTES } from "@/constants/routes";

const completedItems = [
  "Profile Information",
  "Identity Document",
  "Sign Documents",
];

export function KycCompletionState() {
  const router = useRouter();

  return (
    <section className="mx-auto flex min-h-[calc(100vh-150px)] max-w-5xl items-center justify-center py-6">
      <div className="w-full overflow-hidden rounded-3xl border border-blue-100 bg-white px-5 py-4 text-center shadow-[0_24px_70px_rgba(37,99,235,0.10)] sm:px-10 sm:py-5">
        <div className="relative mx-auto flex size-32 items-center justify-center sm:size-40">
          <div className="absolute inset-2 rounded-full bg-emerald-100 blur-xl" />
          <div className="relative flex size-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-300 to-emerald-500 text-5xl text-white shadow-[0_18px_38px_rgba(16,185,129,0.28)] sm:size-28">
            <CheckOutlined />
          </div>
          {[0, 1, 2, 3, 4, 5, 6, 7].map((item) => (
            <span
              key={item}
              className="absolute size-2.5 rounded-full bg-blue-500"
              style={{
                transform: `rotate(${item * 45}deg) translateY(-70px)`,
                transformOrigin: "center 70px",
                backgroundColor: item % 3 === 0 ? "#10b981" : item % 3 === 1 ? "#0ea5e9" : "#f59e0b",
              }}
            />
          ))}
        </div>

        <h1 className="mb-0 mt-5 text-2xl font-bold tracking-tight text-slate-950 sm:text-2xl">
          Verification Submitted!
        </h1>
        <p className="mx-auto mb-0 mt-2 max-w-2xl text-base leading-4 text-slate-500 sm:base sm:leading-5">
          Your verification has been successfully submitted. Your account is
          now under review. We&apos;ll notify you once your verification is approved.
        </p>

        <div className="mx-auto mt-7 max-w-2xl rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50 to-cyan-50 px-5 py-3 text-left">
          {completedItems.map((item, index) => (
            <div
              key={item}
              className={`flex items-center gap-3 py-3 ${
                index < completedItems.length - 1
                  ? "border-b border-emerald-100"
                  : ""
              }`}
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                <CheckOutlined />
              </span>
              <span className="flex-1 font-semibold text-slate-800">{item}</span>
              <span className="text-sm font-semibold text-emerald-600">Completed</span>
            </div>
          ))}
        </div>

        <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700">
          <SafetyCertificateOutlined /> Under Review
        </div>
        <p className="mb-0 mt-3 text-sm text-slate-500">
          We&apos;ll notify you once your account has been approved.
        </p>
        <Button
          type="primary"
          size="large"
          className="mt-7 !min-w-[210px]"
          onClick={() => router.push(ROUTES.PUBLIC.DASHBOARD)}
        >
          Go to Dashboard
        </Button>
      </div>
    </section>
  );
}
