"use client";

import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import { useLogout } from "@/hooks/useAuth";
import {
  Avatar,
  Button,
  Dropdown,
  Layout,
} from "antd";
import type { MenuProps } from "antd";
import {
  DownOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuOutlined,
  MenuUnfoldOutlined,
  SettingOutlined,
  UserOutlined,
} from "@ant-design/icons";

const { Header } = Layout;
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  beginAuthLogout,
  notifyAuthLogout,
} from "@/lib/auth-events";
import { useUserDetail } from "@/hooks/useUser";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { notificationKeys } from "@/hooks/useNotifications";

type DashboardHeaderProps = {
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onOpenMobileMenu: () => void;
};

const profileMenu: MenuProps["items"] = [
  {
    key: "profile",
    icon: <UserOutlined />,
    label: <Link href="/profile">My profile</Link>,
  },
  {
    key: "settings",
    icon: <SettingOutlined />,
    label: <Link href="/settings">Settings</Link>,
  },
  {
    type: "divider",
  },
  {
    key: "logout",
    icon: <LogoutOutlined />,
    danger: true,
    label: "Log out"
  },
];

export default function DashboardHeader({
  collapsed,
  onToggleCollapsed,
  onOpenMobileMenu,
}: DashboardHeaderProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isPending: isLoggingOut, mutate: logout } = useLogout();
  const { data: userData } = useUserDetail();
  const user = userData?.data;
  const fullName = [
    user?.customer?.customerFirstName || user?.customer_FirstName,
    user?.customer_MiddleName,
    user?.customer?.customerLastName || user?.customer_LastName,
  ]
    .map((namePart) => namePart?.trim())
    .filter(Boolean)
    .join(" ");
  function handleProfileMenuClick({
    key,
  }: {
    key: string;
  }) {
    if (key === "logout") {
      beginAuthLogout();
      void queryClient.cancelQueries();

      logout(undefined, {
        onSettled: () => {
          queryClient.removeQueries({ queryKey: notificationKeys.all });
          notifyAuthLogout();
          router.replace(ROUTES.AUTH.LOGIN);
        },
      });
    }
  }

  return (
    <Header
      className={`!fixed !inset-x-0 !top-0 !z-40 !flex !h-[76px] !items-center !border-b !border-slate-200/80 !bg-white/95 !px-4 !leading-normal backdrop-blur-xl sm:!px-6 lg:!px-7 ${
        collapsed ? "lg:!left-[88px]" : "lg:!left-[252px]"
      }`}
      style={{
        boxShadow: "0 5px 25px rgba(15, 23, 42, 0.04)",
      }}
    >
      <div className="flex w-full items-center gap-3">
        <Button
          type="text"
          aria-label={
            collapsed
              ? "Expand navigation"
              : "Collapse navigation"
          }
          icon={
            collapsed ? (
              <MenuUnfoldOutlined />
            ) : (
              <MenuFoldOutlined />
            )
          }
          onClick={onToggleCollapsed}
          className="!hidden !size-11 !items-center !justify-center !rounded-xl !bg-slate-50 !text-lg !text-slate-700 lg:!inline-flex"
        />

        <Button
          type="text"
          aria-label="Open navigation"
          icon={<MenuOutlined />}
          onClick={onOpenMobileMenu}
          className="!inline-flex !size-11 !items-center !justify-center !rounded-xl !bg-slate-50 !text-lg !text-slate-700 lg:!hidden"
        />

        <div className="flex-1" />

        <div className="flex items-center gap-2 sm:gap-3">
          <NotificationBell />

          <Dropdown
            menu={{
              items: profileMenu?.map((item) =>
                item && "key" in item && item.key === "logout"
                  ? { ...item, disabled: isLoggingOut }
                  : item,
              ),
              onClick: handleProfileMenuClick,
            }}
            placement="bottomRight"
            trigger={["click"]}
          >
            <button
              type="button"
              className="flex items-center gap-2 rounded-xl border-0 bg-transparent p-1.5 text-left transition hover:bg-slate-50 sm:gap-3"
            >
              <Avatar
                size={40}
                icon={<UserOutlined />}
                className="!bg-blue-100 !text-blue-700"
              />

              <div className="hidden min-w-0 md:block">
                <p className="m-0 max-w-[130px] truncate text-sm font-semibold text-slate-950">
                  {fullName || "TradePro User"}
                </p>

                <p className="m-0 text-[11px] font-medium text-blue-600">
                  {user?.customer_Status || "Account"}
                </p>
              </div>

              <DownOutlined className="hidden text-xs text-slate-400 md:block" />
            </button>
          </Dropdown>
        </div>
      </div>
    </Header>
  );
}
