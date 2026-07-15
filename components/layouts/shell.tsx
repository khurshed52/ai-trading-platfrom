"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { Layout } from "antd";

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
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
          <main className="w-full min-w-0 p-4 sm:p-6 lg:p-7">
            <div className="mx-auto w-full min-w-0 max-w-[1680px]">
              {children}
            </div>
          </main>
        </Content>
      </Layout>
    </Layout>
  );
}