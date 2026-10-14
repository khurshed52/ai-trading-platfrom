"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Layout, Spin } from "antd";
import { useQueryClient } from "@tanstack/react-query";

import { ROUTES } from "@/constants/routes";
import { useUserDetail } from "@/hooks/useUser";
import { AUTH_SESSION_EXPIRED_EVENT } from "@/lib/auth-events";
import { notificationKeys } from "@/hooks/useNotifications";
import { canAccessKycProtectedRoutes, isKycStatus } from "@/lib/kyc";
import DashboardHeader from "./header";
import DashboardSidebar from "./sidebar";

const { Content } = Layout;

type DashboardShellProps = {
  children: ReactNode;
};

export const SIDEBAR_WIDTH = 252;
export const COLLAPSED_WIDTH = 88;

const protectedRoutePrefixes = [
  ROUTES.ACCOUNTS.ROOT,
  "/funds",
  ROUTES.REPORTS.ROOT,
  ROUTES.SETTINGS.ROOT,
] as const;

export default function DashboardShell({
  children,
}: DashboardShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const userQuery = useUserDetail();
  const previousUserIdRef = useRef<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const rawKycStatus = userQuery.data?.data.status;
  const hasProtectedAccess = Boolean(
    rawKycStatus &&
      isKycStatus(rawKycStatus) &&
      canAccessKycProtectedRoutes(rawKycStatus),
  );
  const isProtectedRoute = protectedRoutePrefixes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
  const isCheckingProtectedAccess = isProtectedRoute && userQuery.isLoading;
  const shouldRedirectFromProtectedRoute =
    isProtectedRoute && !userQuery.isLoading && !hasProtectedAccess;

  useEffect(() => {
    const currentUserId = userQuery.data?.data.id ?? null;
    const previousUserId = previousUserIdRef.current;

    if (previousUserId && currentUserId && previousUserId !== currentUserId) {
      queryClient.removeQueries({
        queryKey: notificationKeys.user(previousUserId),
      });
    }

    previousUserIdRef.current = currentUserId;
  }, [queryClient, userQuery.data?.data.id]);

  useEffect(() => {
    function redirectToLogin() {
      void queryClient.cancelQueries();
      queryClient.removeQueries({ queryKey: notificationKeys.all });
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

  useEffect(() => {
    if (shouldRedirectFromProtectedRoute) {
      router.replace(ROUTES.PUBLIC.DASHBOARD);
    }
  }, [router, shouldRedirectFromProtectedRoute]);

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

        <Content className="!min-h-screen !min-w-0 !overflow-x-hidden !bg-[#f4f7fb] !pt-[76px]">
          <main className="w-full min-w-0 p-4 sm:p-6 lg:p-5">
            <div className="w-full min-w-0">
              {isCheckingProtectedAccess || shouldRedirectFromProtectedRoute ? (
                <div className="grid min-h-[50vh] place-items-center">
                  <Spin size="large" aria-label="Checking account access" />
                </div>
              ) : (
                children
              )}
            </div>
          </main>
        </Content>
      </Layout>
    </Layout>
  );
}
