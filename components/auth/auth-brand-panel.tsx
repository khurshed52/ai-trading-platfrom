import {
  BarChart3,
  BrainCircuit,
  ShieldCheck,
  TrendingUp,
  Zap,
} from "lucide-react";

const features = [
  { title: "Real-time Market Data", icon: BarChart3, color: "text-blue-600", background: "bg-blue-100/80" },
  { title: "AI-Powered Insights", icon: BrainCircuit, color: "text-violet-600", background: "bg-violet-100/80" },
  { title: "Secure & Reliable", icon: ShieldCheck, color: "text-emerald-600", background: "bg-emerald-100/80" },
  { title: "Fast Execution", icon: Zap, color: "text-amber-500", background: "bg-amber-100/80" },
];

export function TradeProBrand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`${compact ? "size-11 rounded-xl" : "size-12 rounded-2xl"} flex items-center justify-center bg-blue-600 text-white shadow-lg shadow-blue-600/20`}>
        <TrendingUp size={compact ? 23 : 26} strokeWidth={2.4} />
      </div>
      <div>
        <p className={`${compact ? "text-xl" : "text-2xl"} m-0 font-bold tracking-tight text-slate-950`}>
          Trade<span className="text-blue-600">Pro</span>
        </p>
        <p className="m-0 text-xs font-medium text-slate-500">AI Trading Platform</p>
      </div>
    </div>
  );
}

export default function AuthBrandPanel() {
  return (
    <section className="relative hidden min-h-0 overflow-hidden rounded-[28px] border border-white/80 bg-blue-50 lg:flex lg:flex-col">
      <div className="relative z-10 shrink-0 bg-gradient-to-br from-white via-blue-50 to-blue-100/80 px-7 pb-4 pt-6 xl:px-4 xl:pt-4 2xl:px-9">
        <TradeProBrand />

        <div className="mt-4">
          <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
            All-in-One Trading Platform
          </span>
          <h1 className="mt-4 text-[clamp(36px,3vw,54px)] font-bold leading-[1.06] tracking-[-0.045em] text-slate-950">
            Trade Smarter,
            <span className="text-blue-600"> Invest Better.</span>
          </h1>
          <p className="mt-3 max-w-[760px] text-sm leading-6 text-slate-800 xl:text-sm xl:leading-7 2xl:text-lg">
            Advanced charts, live market intelligence, and AI-powered insights
            in one secure professional platform.
          </p>
        </div>

        <div className="mt-2 grid grid-cols-4 gap-2 xl:mt-5 xl:gap-3">
          {features.map(({ title, icon: Icon, color, background }) => (
            <div key={title} className="flex min-w-0 items-center gap-2">
              <span
                className={`flex size-9 shrink-0 items-center justify-center rounded-xl xl:size-10 ${background} ${color}`}
              >
                <Icon size={20} />
              </span>
              <span className="text-[10px] font-semibold leading-4 text-slate-800 xl:text-xs">
                {title}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="relative min-h-[260px] flex-1 overflow-hidden bg-blue-100">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/images/tradepro-login-journey.png"
          aria-label="A customer walking through the futuristic TradePro trading city"
          className="absolute inset-0 size-full object-cover object-center"
        >
          <source
            src="/videos/tradepro-login-journey.mp4"
            type="video/mp4"
          />
        </video>
        {/* <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-10 bg-gradient-to-b from-blue-50/80 via-blue-50/35 to-transparent backdrop-blur-[10px]" /> */}
      </div>
    </section>
  );
}
