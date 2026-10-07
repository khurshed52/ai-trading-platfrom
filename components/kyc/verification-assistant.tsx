import {
  CheckOutlined,
  LockOutlined,
  SafetyCertificateOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { Progress } from "antd";

import {
  calculateProfileCompletion,
  getKycJourney,
  getNextBestAction,
} from "@/lib/kyc";
import type {
  KycPersonalInformationValues,
  KycStatus,
  KycStep,
} from "@/types/kyc";

type VerificationAssistantProps = {
  status: KycStatus;
  currentStep: KycStep;
  values: Partial<KycPersonalInformationValues>;
};

const assistantContent: Record<
  Exclude<KycStep, 1>,
  { title: string; description: string }
> = {
  2: {
    title: "Identity Verification",
    description: "Complete your identity verification to continue.",
  },
  3: {
    title: "Document Signing",
    description: "Complete the required document signing to finish your verification.",
  },
};

export function VerificationAssistant({
  status,
  currentStep,
  values,
}: VerificationAssistantProps) {
  const journey = getKycJourney(status, currentStep);
  const completion = calculateProfileCompletion(values);
  const nextAction = getNextBestAction(values);

  return (
    <aside className="overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-b from-blue-50/80 via-white to-white shadow-[0_16px_45px_rgba(37,99,235,0.08)] xl:sticky xl:top-[104px]">
      <div className="p-4 sm:p-5">
        <div className="flex items-center gap-3 text-blue-700">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-white text-xl shadow-sm">
            <SafetyCertificateOutlined />
          </div>
          <div>
            <h2 className="m-0 text-lg font-bold">Verification Assistant</h2>
            <p className="m-0 mt-0.5 text-xs font-semibold text-blue-500">
              Step {currentStep} of 3
            </p>
          </div>
        </div>

        {currentStep === 1 ? (
          <>
            <div className="mt-4 flex items-center gap-4">
              <Progress
                type="circle"
                percent={completion.percentage}
                size={100}
                strokeWidth={10}
                strokeColor={{ "0%": "#22d3ee", "100%": "#2563eb" }}
              />
              <div className="min-w-0">
                <p className="m-0 text-base font-bold text-slate-950">
                  Complete your profile
                </p>
                <p className="mb-0 mt-1 text-sm leading-6 text-slate-500">
                  {completion.completed} of {completion.total} required fields completed
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-amber-100 bg-white/90 p-3.5 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
                  <ThunderboltOutlined />
                </div>
                <div>
                  <p className="m-0 text-xs font-semibold text-slate-500">Next best action</p>
                  <p className="mb-0 mt-1 text-sm font-bold text-slate-950">{nextAction}</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="mt-4 rounded-2xl border border-blue-100 bg-white/90 p-4 shadow-sm">
              <p className="m-0 text-base font-bold text-slate-950">
                {assistantContent[currentStep].title}
              </p>
              <p className="mb-0 mt-2 text-sm leading-6 text-slate-500">
                {assistantContent[currentStep].description}
              </p>
            </div>
            {currentStep === 3 ? (
              <div className="mt-4 rounded-2xl border border-amber-100 bg-white/90 p-3.5 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
                    <ThunderboltOutlined />
                  </div>
                  <div>
                    <p className="m-0 text-xs font-semibold text-slate-500">Next step</p>
                    <p className="mb-0 mt-1 text-sm font-bold text-slate-950">
                      Read and sign the document
                    </p>
                    <p className="mb-0 mt-1 text-xs leading-5 text-slate-500">
                      Review the Terms of Service and provide your electronic signature.
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
          </>
        )}

        <div className="mt-4 rounded-2xl bg-white/80 p-3.5 shadow-sm">
          <h3 className="m-0 text-sm font-bold text-slate-950">Verification Journey</h3>
          <div className="mt-3 space-y-3">
            {journey.map((item) => (
              <div key={item.step} className="flex items-start gap-3">
                <div
                  className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${
                    item.state === "completed"
                      ? "border-blue-600 bg-blue-600 text-white"
                      : item.state === "active"
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-slate-200 bg-white text-slate-400"
                  }`}
                >
                  {item.state === "completed" ? <CheckOutlined /> : item.step}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`m-0 text-sm font-semibold ${item.state === "active" ? "text-blue-700" : "text-slate-800"}`}>
                      {item.title}
                    </p>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${item.state === "completed" ? "bg-emerald-50 text-emerald-600" : item.state === "active" ? "bg-blue-50 text-blue-600" : "bg-slate-100 text-slate-500"}`}>
                      {item.state === "completed" ? "Complete" : item.state === "active" ? "In progress" : "Pending"}
                    </span>
                  </div>
                  <p className="mb-0 mt-1 text-xs leading-5 text-slate-500">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="m-4 mt-0 flex items-center gap-3 rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50 to-cyan-50 p-4 text-emerald-700 sm:m-5 sm:mt-0">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
          <LockOutlined />
        </div>
        <p className="m-0 text-xs font-semibold leading-5">
          Your information is encrypted and securely handled.
        </p>
      </div>
    </aside>
  );
}
