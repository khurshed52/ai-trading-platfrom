import { Sparkles } from "lucide-react";

const capabilities = [
  "Account Support",
  "KYC Guidance",
  "Funds & Transactions",
  "Trading Education",
  "Platform Help",
  "Personalized Insights",
];

export function AiHero() {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 via-sky-50 to-blue-100/70 p-5 shadow-sm sm:p-6">
      <div className="relative z-10 grid items-center gap-5 lg:grid-cols-[1.25fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm">
              <Sparkles size={25} aria-hidden="true" />
            </span>
            <div>
              <h1 className="m-0 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                TradePro <span className="text-blue-600">AI</span>
              </h1>
              <p className="m-0 text-sm font-medium text-slate-700 sm:text-base">
                Your intelligent trading companion
              </p>
            </div>
          </div>

          <p className="mb-0 mt-4 max-w-[590px] text-sm leading-6 text-slate-600">
            Get instant answers, personalized guidance, and insights about your
            accounts, funds, verification, and trading with the power of AI.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 lg:justify-end">
          {capabilities.map((capability) => (
            <span
              key={capability}
              className="rounded-full border border-white/90 bg-white/80 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm backdrop-blur"
            >
              {capability}
            </span>
          ))}
        </div>
      </div>

      <div
        aria-hidden="true"
        className="absolute -right-10 -top-20 size-72 rotate-45 rounded-[64px] border-[28px] border-blue-300/20 bg-blue-500/10"
      />
      <div
        aria-hidden="true"
        className="absolute right-28 top-16 size-28 rotate-45 rounded-3xl bg-gradient-to-br from-blue-500/25 to-cyan-300/20 blur-sm"
      />
    </section>
  );
}
