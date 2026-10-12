"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Layout } from "antd";
import { useQueryClient } from "@tanstack/react-query";

import { ROUTES } from "@/constants/routes";
import { AUTH_SESSION_EXPIRED_EVENT } from "@/lib/auth-events";
import DashboardHeader from "./header";
import DashboardSidebar from "./sidebar";

const { Content } = Layout;

type DashboardShellProps = {
  children: ReactNode;
};

export const SIDEBAR_WIDTH = 252;
export const COLLAPSED_WIDTH = 88;

export default function DashboardShell({
  children,
}: DashboardShellProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    function redirectToLogin() {
      void queryClient.cancelQueries();
      router.replace(ROUTES.AUTH.LOGIN);
    }

    window.addEventListener(
      AUTH_SESSION_EXPIRED_EVENT,
      redirectToLogin,
    );

    return () => {
      window.removeEventListener(
        AUTH_SESSION_EXPIRED_EVENT,
        redirectToLogin,
      );
    };
  }, [queryClient, router]);

  return (
    <Layout className="tradepro-dashboard-shell !min-h-screen !w-full !bg-[#f4f7fb]">
      <DashboardSidebar
        collapsed={collapsed}
        mobileMenuOpen={mobileMenuOpen}
        onCloseMobileMenu={() => {
          setMobileMenuOpen(false);
        }}
      />

      <Layout
        className={
          collapsed
            ? "tradepro-dashboard-main tradepro-dashboard-main-collapsed"
            : "tradepro-dashboard-main"
        }
      >
        <DashboardHeader
          collapsed={collapsed}
          onToggleCollapsed={() => {
            setCollapsed((current) => !current);
          }}
          onOpenMobileMenu={() => {
            setMobileMenuOpen(true);
          }}
        />

        <Content className="!min-h-[calc(100vh-76px)] !min-w-0 !overflow-x-hidden !bg-[#f4f7fb]">
          <main className="w-full min-w-0 p-4 sm:p-6 lg:p-5">
            <div className="w-full min-w-0">
              {children}
            </div>
          </main>
        </Content>
      </Layout>
    </Layout>
  );
}
