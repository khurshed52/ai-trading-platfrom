import { CheckOutlined } from "@ant-design/icons";

import { getKycJourney } from "@/lib/kyc";
import type { KycStatus, KycStep } from "@/types/kyc";

type KycProgressProps = {
  status: KycStatus;
  currentStep: KycStep;
};

export function KycProgress({ status, currentStep }: KycProgressProps) {
  const journey = getKycJourney(status, currentStep);

  return (
    <section
      aria-label="KYC progress"
      className="rounded-2xl border border-slate-200/80 bg-white px-4 py-3 shadow-[0_10px_35px_rgba(15,23,42,0.04)] sm:px-5"
    >
      <div className="relative grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-3">
        <span className="absolute left-[16.67%] right-[16.67%] top-[17px] hidden h-px bg-slate-200 sm:block" />

        {journey.map((item) => (
          <div
            key={item.step}
            className="relative flex min-w-0 items-center gap-2.5 sm:flex-col sm:justify-start sm:gap-1.5 sm:text-center"
          >
            <div
              className={`relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold ${
                item.state === "completed"
                  ? "border-blue-600 bg-blue-600 text-white"
                  : item.state === "active"
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-slate-200 bg-white text-slate-500"
              }`}
            >
              {item.state === "completed" ? <CheckOutlined /> : item.step}
            </div>

            <div className="min-w-0 sm:w-full">
              <p
                className={`m-0 truncate text-xs font-semibold ${
                  item.state === "active" ? "text-blue-700" : "text-slate-700"
                }`}
              >
                {item.title}
              </p>
            </div>

          </div>
        ))}
      </div>
    </section>
  );
}
