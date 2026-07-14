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
    <Layout className="min-h-screen !bg-[#f4f7fb]">
      <DashboardSidebar
        collapsed={collapsed}
        mobileMenuOpen={mobileMenuOpen}
        onCloseMobileMenu={() => setMobileMenuOpen(false)}
      />

      <Layout
        className="tradepro-dashboard-main !min-h-screen !bg-[#f4f7fb] transition-[margin-left] duration-200"
        style={{
          marginLeft: collapsed
            ? COLLAPSED_WIDTH
            : SIDEBAR_WIDTH,
        }}
      >
        <DashboardHeader
          collapsed={collapsed}
          onToggleCollapsed={() =>
            setCollapsed((current) => !current)
          }
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
        />

        <Content className="!min-h-[calc(100vh-76px)] !bg-[#f4f7fb]">
          <main className="mx-auto w-full max-w-[1680px] p-4 sm:p-6 lg:p-7">
            {children}
          </main>
        </Content>
      </Layout>
    </Layout>
  );
}