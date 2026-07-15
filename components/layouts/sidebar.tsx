"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import {
  Button,
  Drawer,
  Layout,
  Menu,
} from "antd";
import type { MenuProps } from "antd";
import {
  ApiOutlined,
  AppstoreOutlined,
  BarChartOutlined,
  FundOutlined,
  HomeOutlined,
  KeyOutlined,
  LineChartOutlined,
  NotificationOutlined,
  PieChartOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
  ShopOutlined,
  StarOutlined,
  TransactionOutlined,
  UserOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import { TrendingUp } from "lucide-react";

import {
  COLLAPSED_WIDTH,
  SIDEBAR_WIDTH,
} from "./shell";

const { Sider } = Layout;

type DashboardSidebarProps = {
  collapsed: boolean;
  mobileMenuOpen: boolean;
  onCloseMobileMenu: () => void;
};

const primaryNavigation: MenuProps["items"] = [
  {
    key: "/dashboard",
    icon: <HomeOutlined />,
    label: <Link href="/dashboard">Dashboard</Link>,
  },
  {
    key: "/markets",
    icon: <FundOutlined />,
    label: <Link href={ROUTES.PUBLIC.MARKETS}>Markets</Link>,
  },
  {
    key: "/watchlist",
    icon: <StarOutlined />,
    label: <Link href="/watchlist">Watchlist</Link>,
  },
  {
    key: "/portfolio",
    icon: <PieChartOutlined />,
    label: <Link href="/portfolio">Portfolio</Link>,
  },
  {
    key: "/orders",
    icon: <TransactionOutlined />,
    label: <Link href="/orders">Orders</Link>,
  },
  {
    key: "/positions",
    icon: <BarChartOutlined />,
    label: <Link href="/positions">Positions</Link>,
  },
  {
    key: "/analytics",
    icon: <LineChartOutlined />,
    label: <Link href="/analytics">Analytics</Link>,
  },
];

const allNavigationItems = [
  ...(primaryNavigation ?? []),
];

export default function DashboardSidebar({
  collapsed,
  mobileMenuOpen,
  onCloseMobileMenu,
}: DashboardSidebarProps) {
  const pathname = usePathname();

  const selectedKey = useMemo(() => {
    const matchedKey = allNavigationItems
      .filter(
        (
          item,
        ): item is Exclude<
          NonNullable<MenuProps["items"]>[number],
          null
        > => Boolean(item && "key" in item),
      )
      .map((item) => String(item.key))
      .sort((first, second) => second.length - first.length)
      .find(
        (key) =>
          pathname === key ||
          pathname.startsWith(`${key}/`),
      );

    return matchedKey ?? "/dashboard";
  }, [pathname]);

  return (
    <>
      <Sider
        width={SIDEBAR_WIDTH}
        collapsedWidth={COLLAPSED_WIDTH}
        collapsed={collapsed}
        trigger={null}
        theme="dark"
        className="!fixed !inset-y-0 !left-0 !z-50 !hidden !overflow-hidden !bg-[#06152f] lg:!block"
        style={{
          boxShadow: "10px 0 35px rgba(15, 23, 42, 0.12)",
        }}
      >
        <SidebarContent
          collapsed={collapsed}
          selectedKey={selectedKey}
          onNavigate={() => undefined}
        />
      </Sider>

      <Drawer
        open={mobileMenuOpen}
        onClose={onCloseMobileMenu}
        placement="left"
        width={280}
        closable={false}
        styles={{
          body: {
            padding: 0,
            background: "#06152f",
          },
        }}
      >
        <SidebarContent
          collapsed={false}
          selectedKey={selectedKey}
          onNavigate={onCloseMobileMenu}
        />
      </Drawer>
    </>
  );
}

type SidebarContentProps = {
  collapsed: boolean;
  selectedKey: string;
  onNavigate: () => void;
};

function SidebarContent({
  collapsed,
  selectedKey,
  onNavigate,
}: SidebarContentProps) {
  return (
    <div className="flex h-full flex-col bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.15),transparent_30%),linear-gradient(180deg,#06152f_0%,#071a38_100%)]">
      <div
        className={`flex h-[76px] shrink-0 items-center border-b border-white/10 ${
          collapsed
            ? "justify-center px-2"
            : "px-5"
        }`}
      >
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="flex items-center gap-3"
        >
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-[0_10px_25px_rgba(37,99,235,0.4)]">
            <TrendingUp size={23} strokeWidth={2.5} />
          </div>

          {!collapsed && (
            <div>
              <p className="m-0 text-xl font-bold tracking-tight text-white">
                Trade
                <span className="text-blue-400">
                  Pro
                </span>
              </p>

              <p className="m-0 text-[10px] font-medium text-slate-400">
                AI Trading Platform
              </p>
            </div>
          )}
        </Link>
      </div>

      <div className="tradepro-sidebar-scrollbar min-h-0 flex-1 overflow-y-auto py-5">
        <SidebarSectionTitle
          collapsed={collapsed}
          title="Main"
        />

        <Menu
          mode="inline"
          theme="dark"
          inlineCollapsed={collapsed}
          selectedKeys={[selectedKey]}
          items={primaryNavigation}
          onClick={onNavigate}
          className="tradepro-sidebar-menu"
        />

        <SidebarDivider />

        <SidebarSectionTitle
          collapsed={collapsed}
          title="Wallet"
        />

        <SidebarDivider />

        <SidebarSectionTitle
          collapsed={collapsed}
          title="Account"
        />
      </div>

      {!collapsed && (
        <div className="shrink-0 p-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 shadow-xl backdrop-blur">
            <div className="flex items-start gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-400/15 text-amber-300">
                <ApiOutlined />
              </div>

              <div>
                <p className="m-0 text-sm font-semibold text-white">
                  Upgrade to Pro
                </p>

                <p className="mt-1 text-[11px] leading-5 text-slate-400">
                  Unlock advanced analytics and lower fees.
                </p>
              </div>
            </div>

            <Button
              type="primary"
              block
              className="!mt-4 !h-10 !rounded-xl"
            >
              Upgrade now
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function SidebarSectionTitle({
  collapsed,
  title,
}: {
  collapsed: boolean;
  title: string;
}) {
  if (collapsed) {
    return null;
  }

  return (
    <p className="mb-2 mt-1 px-6 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
      {title}
    </p>
  );
}

function SidebarDivider() {
  return (
    <div className="mx-5 my-4 h-px bg-white/10" />
  );
}