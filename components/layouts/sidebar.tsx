"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Drawer, Layout, Menu, Tooltip } from "antd";
import type { MenuProps } from "antd";
import {
  AccountBookOutlined,
  CreditCardOutlined,
  DollarOutlined,
  FileDoneOutlined,
  FileTextOutlined,
  FundOutlined,
  HistoryOutlined,
  HomeOutlined,
  LockOutlined,
  SettingOutlined,
  SwapOutlined,
  UserOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import { Sparkles } from "lucide-react";

import { TradeProBrand } from "@/components/auth/auth-brand-panel";
import { ROUTES } from "@/constants/routes";
import { useUserDetail } from "@/hooks/useUser";
import {
  canAccessKycProtectedRoutes,
  getKycProtectedRouteMessage,
  isKycStatus,
} from "@/lib/kyc";

import { COLLAPSED_WIDTH, SIDEBAR_WIDTH } from "./shell";

const { Sider } = Layout;

type DashboardSidebarProps = {
  collapsed: boolean;
  mobileMenuOpen: boolean;
  onCloseMobileMenu: () => void;
};

const navigationKeys = [
  ROUTES.PUBLIC.DASHBOARD,
  ROUTES.ACCOUNTS.ROOT,
  ROUTES.FUNDS.DEPOSIT,
  ROUTES.FUNDS.WITHDRAW,
  ROUTES.FUNDS.TRANSFER,
  ROUTES.FUNDS.HISTORY,
  ROUTES.PUBLIC.MARKETS,
  ROUTES.PUBLIC.TRADEPRO_AI,
  ROUTES.PROFILE.ROOT,
  ROUTES.REPORTS.ROOT,
  ROUTES.SETTINGS.PAYMENT_METHOD,
  ROUTES.SETTINGS.AGREEMENT,
  ROUTES.SETTINGS.ROOT,
];

export default function DashboardSidebar({
  collapsed,
  mobileMenuOpen,
  onCloseMobileMenu,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const { data: userData } = useUserDetail();
  const rawKycStatus = userData?.data.status;
  const kycStatus =
    rawKycStatus && isKycStatus(rawKycStatus) ? rawKycStatus : null;
  const hasProtectedAccess = kycStatus
    ? canAccessKycProtectedRoutes(kycStatus)
    : false;
  const protectedRouteMessage = getKycProtectedRouteMessage(kycStatus);

  const selectedKey = useMemo(() => {
    const matchedKey = [...navigationKeys]
      .sort((first, second) => second.length - first.length)
      .find(
        (key) => pathname === key || pathname.startsWith(`${key}/`),
      );

    return matchedKey ?? ROUTES.PUBLIC.DASHBOARD;
  }, [pathname]);

  return (
    <>
      <Sider
        width={SIDEBAR_WIDTH}
        collapsedWidth={COLLAPSED_WIDTH}
        collapsed={collapsed}
        trigger={null}
        theme="dark"
        className="!fixed !inset-y-0 !left-0 !z-50 !hidden !overflow-hidden !bg-[#06152f] !transition-none lg:!block"
        style={{
          boxShadow: "10px 0 35px rgba(15, 23, 42, 0.12)",
          transition: "none",
        }}
      >
        <SidebarContent
          key={`desktop-${selectedKey}`}
          collapsed={collapsed}
          selectedKey={selectedKey}
          hasProtectedAccess={hasProtectedAccess}
          protectedRouteMessage={protectedRouteMessage}
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
          key={`mobile-${selectedKey}`}
          collapsed={false}
          selectedKey={selectedKey}
          hasProtectedAccess={hasProtectedAccess}
          protectedRouteMessage={protectedRouteMessage}
          onNavigate={onCloseMobileMenu}
        />
      </Drawer>
    </>
  );
}

type SidebarContentProps = {
  collapsed: boolean;
  selectedKey: string;
  hasProtectedAccess: boolean;
  protectedRouteMessage: string;
  onNavigate: () => void;
};

function SidebarContent({
  collapsed,
  selectedKey,
  hasProtectedAccess,
  protectedRouteMessage,
  onNavigate,
}: SidebarContentProps) {
  const selectedParentKey = selectedKey.startsWith("/funds/")
    ? "/funds"
    : selectedKey.startsWith(ROUTES.SETTINGS.ROOT)
      ? ROUTES.SETTINGS.ROOT
      : undefined;
  const [openKeys, setOpenKeys] = useState<string[]>(
    selectedParentKey ? [selectedParentKey] : [],
  );
  const navigationItems = createNavigationItems({
    hasProtectedAccess,
    protectedRouteMessage,
    onNavigate,
  });

  return (
    <div className="flex h-full flex-col bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.15),transparent_30%),linear-gradient(180deg,#06152f_0%,#071a38_100%)]">
      <div
        className={`flex h-[76px] shrink-0 items-center border-b border-white/10 ${
          collapsed ? "justify-center px-2" : "px-5"
        }`}
      >
        <Link
          href={ROUTES.PUBLIC.DASHBOARD}
          onClick={onNavigate}
          className="flex items-center gap-3"
        >
          <TradeProBrand compact inverted iconOnly={collapsed} />
        </Link>
      </div>

      <div className="tradepro-sidebar-scrollbar min-h-0 flex-1 overflow-y-auto py-5">
        <Menu
          mode="inline"
          theme="dark"
          inlineCollapsed={collapsed}
          selectedKeys={[selectedKey]}
          openKeys={openKeys}
          onOpenChange={(nextOpenKeys) => {
            const newlyOpenedKey = nextOpenKeys.find(
              (key) => !openKeys.includes(key),
            );
            setOpenKeys(newlyOpenedKey ? [newlyOpenedKey] : []);
          }}
          items={navigationItems}
          className="tradepro-sidebar-menu"
        />
      </div>
    </div>
  );
}

type NavigationItemsOptions = {
  hasProtectedAccess: boolean;
  protectedRouteMessage: string;
  onNavigate: () => void;
};

function createNavigationItems({
  hasProtectedAccess,
  protectedRouteMessage,
  onNavigate,
}: NavigationItemsOptions): MenuProps["items"] {
  const label = (
    href: string,
    title: string,
    protectedRoute = false,
  ) => (
    <NavigationLink
      href={href}
      title={title}
      protectedRoute={protectedRoute}
      hasProtectedAccess={hasProtectedAccess}
      protectedRouteMessage={protectedRouteMessage}
      onNavigate={onNavigate}
    />
  );

  const protectedGroupLabel = (title: string) => (
    <Tooltip
      title={!hasProtectedAccess ? protectedRouteMessage : undefined}
      placement="right"
    >
      <span className="flex w-full items-center justify-between gap-2">
        <span>{title}</span>
        {!hasProtectedAccess ? (
          <LockOutlined className="!text-[11px] !text-slate-500" />
        ) : null}
      </span>
    </Tooltip>
  );

  return [
    {
      key: ROUTES.PUBLIC.DASHBOARD,
      icon: <HomeOutlined />,
      label: label(ROUTES.PUBLIC.DASHBOARD, "Dashboard"),
    },
    {
      key: ROUTES.ACCOUNTS.ROOT,
      icon: <AccountBookOutlined />,
      label: label(ROUTES.ACCOUNTS.ROOT, "Accounts", true),
      disabled: !hasProtectedAccess,
    },
    {
      key: "/funds",
      icon: <WalletOutlined />,
      label: protectedGroupLabel("Funds"),
      disabled: !hasProtectedAccess,
      children: [
        {
          key: ROUTES.FUNDS.DEPOSIT,
          icon: <DollarOutlined />,
          label: label(ROUTES.FUNDS.DEPOSIT, "Deposit", true),
        },
        {
          key: ROUTES.FUNDS.WITHDRAW,
          icon: <WalletOutlined />,
          label: label(ROUTES.FUNDS.WITHDRAW, "Withdraw", true),
        },
        {
          key: ROUTES.FUNDS.TRANSFER,
          icon: <SwapOutlined />,
          label: label(ROUTES.FUNDS.TRANSFER, "Transfer", true),
        },
        {
          key: ROUTES.FUNDS.HISTORY,
          icon: <HistoryOutlined />,
          label: label(ROUTES.FUNDS.HISTORY, "Funds History", true),
        },
      ],
    },
    {
      key: ROUTES.PUBLIC.MARKETS,
      icon: <FundOutlined />,
      label: label(ROUTES.PUBLIC.MARKETS, "Market"),
    },
    {
      key: ROUTES.PUBLIC.TRADEPRO_AI,
      icon: <Sparkles size={18} />,
      label: label(ROUTES.PUBLIC.TRADEPRO_AI, "TradePro AI"),
    },
    {
      key: ROUTES.PROFILE.ROOT,
      icon: <UserOutlined />,
      label: label(ROUTES.PROFILE.ROOT, "Profile"),
    },
    {
      key: ROUTES.REPORTS.ROOT,
      icon: <FileTextOutlined />,
      label: label(ROUTES.REPORTS.ROOT, "Reports", true),
      disabled: !hasProtectedAccess,
    },
    {
      key: ROUTES.SETTINGS.ROOT,
      icon: <SettingOutlined />,
      label: protectedGroupLabel("Settings"),
      disabled: !hasProtectedAccess,
      children: [
        {
          key: ROUTES.SETTINGS.PAYMENT_METHOD,
          icon: <CreditCardOutlined />,
          label: label(
            ROUTES.SETTINGS.PAYMENT_METHOD,
            "Payment Method",
            true,
          ),
        },
        {
          key: ROUTES.SETTINGS.AGREEMENT,
          icon: <FileDoneOutlined />,
          label: label(ROUTES.SETTINGS.AGREEMENT, "Agreement", true),
        },
      ],
    },
  ];
}

type NavigationLinkProps = {
  href: string;
  title: string;
  protectedRoute: boolean;
  hasProtectedAccess: boolean;
  protectedRouteMessage: string;
  onNavigate: () => void;
};

function NavigationLink({
  href,
  title,
  protectedRoute,
  hasProtectedAccess,
  protectedRouteMessage,
  onNavigate,
}: NavigationLinkProps) {
  const isBlocked = protectedRoute && !hasProtectedAccess;

  if (isBlocked) {
    return (
      <Tooltip
        title={protectedRouteMessage}
        placement="right"
      >
        <span
          className="flex w-full cursor-not-allowed items-center justify-between gap-2"
          aria-label={`${title}, verification required`}
        >
          <span>{title}</span>
          <LockOutlined className="!text-[11px] !text-slate-500" />
        </span>
      </Tooltip>
    );
  }

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className="flex w-full items-center justify-between gap-2"
      aria-label={title}
    >
      <span>{title}</span>
    </Link>
  );
}
