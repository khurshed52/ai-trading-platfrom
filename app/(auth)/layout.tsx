import type { ReactNode } from "react";
import TradingRouteVisual from "@/components/auth/trading-route-visual";
import GeminiChat from "@/components/chat/gemini-chat";
import {
  LockKeyhole,
  TrendingUp,
} from "lucide-react";

type AuthLayoutProps = {
  children: ReactNode;
};


export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto grid min-h-screen max-w-[1600px] overflow-hidden bg-white shadow-[0_30px_90px_rgba(15,23,42,0.08)] lg:grid-cols-[minmax(0,1.08fr)_minmax(440px,0.92fr)]">
        {/* Left-side design */}
        <section className="relative hidden overflow-hidden bg-gradient-to-br from-white via-blue-50/50 to-slate-50 px-8 py-6 lg:flex lg:flex-col xl:px-12 h-screen">
          <AuthBackground />

          {/* Logo */}
          <div className="relative z-10 flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
              <TrendingUp size={26} strokeWidth={2.4} />
            </div>

            <div>
              <p className="text-2xl font-bold tracking-tight text-slate-950">
                Trade<span className="text-blue-600">Pro</span>
              </p>

              <p className="text-xs font-medium text-slate-500">
                AI Trading Platform
              </p>
            </div>
          </div>

          {/* Hero text */}
          <div className="relative z-10 mt-7">
            <h1 className="text-4xl font-bold leading-[1.05] tracking-tight text-slate-950 xl:text-5xl">
              Trade Smarter,
              <span className="text-blue-600"> Invest Better.</span>
            </h1>

            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600 xl:text-lg">
              Advanced charts, live market intelligence, and AI-powered
              insights in one secure professional platform.
            </p>
          </div>

          {/* Full-width animated trading area */}
          <div className="relative z-10 mt-2 min-h-0 flex-1">
            <TradingRouteVisual />
          </div>

        </section>

        {/* Right-side page content */}
        <section className="relative flex min-h-screen items-center justify-center bg-white px-5 py-4 sm:px-8 lg:px-5 xl:px-5">
          <div className="" />

          <div className="relative z-10 w-full max-w-[600px]">
            {/* Mobile logo */}
            <div className="mb-9 flex items-center gap-3 lg:hidden">
              <div className="flex size-11 items-center justify-center rounded-xl bg-blue-600 text-white">
                <TrendingUp size={23} />
              </div>

              <div>
                <p className="text-xl font-bold text-slate-950">
                  Trade<span className="text-blue-600">Pro</span>
                </p>

                <p className="text-xs text-slate-500">
                  AI Trading Platform
                </p>
              </div>
            </div>

            {children}

            <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-400">
              <LockKeyhole size={14} />
              <span>Your information is securely encrypted</span>
            </div>
          </div>
        </section>
      </div>
         <GeminiChat />
    </main>
  );
}

function AuthBackground() {
  return (
    <>
      <div className="pointer-events-none absolute -left-24 bottom-[-190px] size-[430px] rounded-full border-[70px] border-blue-100/50" />

      <div className="pointer-events-none absolute -right-36 top-[-160px] size-[430px] rounded-full bg-blue-100/55 blur-3xl" />

      <div className="pointer-events-none absolute bottom-20 right-10 size-52 rounded-full bg-cyan-100/30 blur-3xl" />
    </>
  );
}