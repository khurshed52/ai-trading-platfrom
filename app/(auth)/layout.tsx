import type { ReactNode } from "react";
import { LockKeyhole } from "lucide-react";

import AuthBrandPanel, { TradeProBrand } from "@/components/auth/auth-brand-panel";

type AuthLayoutProps = {
  children: ReactNode;
};

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top_left,#dbeafe_0%,#f8fafc_42%,#ffffff_100%)] p-0 lg:h-dvh lg:min-h-0 lg:overflow-hidden lg:p-3 2xl:p-0">
      <div className="mx-auto grid min-h-screen max-w-[1800px] overflow-hidden bg-white/85 shadow-[0_28px_90px_rgba(30,64,175,0.12)] lg:h-full lg:min-h-0 lg:grid-cols-[minmax(0,58fr)_minmax(440px,42fr)] lg:rounded-[32px] lg:border lg:border-white/80 lg:p-3">
        <AuthBrandPanel />

        <section className="relative flex min-h-screen items-center justify-center overflow-y-auto bg-white px-5 py-8 sm:px-8 lg:min-h-0 lg:rounded-[28px] lg:bg-white/80 lg:px-8 xl:px-10">
          <div className="relative z-10 w-full max-w-[600px]">
            <div className="mb-8 lg:hidden">
              <TradeProBrand compact />
            </div>

            {children}

            <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-400">
              <LockKeyhole size={14} />
              <span>Your information is securely encrypted</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
