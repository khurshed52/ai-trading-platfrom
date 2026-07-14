"use client";

import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import {
  Avatar,
  Badge,
  Button,
  Dropdown,
  Input,
  Layout,
  Typography,
} from "antd";
import type { MenuProps } from "antd";
import {
  BellOutlined,
  DownOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuOutlined,
  MenuUnfoldOutlined,
  SearchOutlined,
  SettingOutlined,
  UserOutlined,
} from "@ant-design/icons";

const { Header } = Layout;
const { Text, Title } = Typography;

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
    label: <Link href={ROUTES.AUTH.LOGIN}>Log out</Link>,
  },
];

export default function DashboardHeader({
  collapsed,
  onToggleCollapsed,
  onOpenMobileMenu,
}: DashboardHeaderProps) {
  function handleProfileMenuClick({
    key,
  }: {
    key: string;
  }) {
    if (key === "logout") {
      console.log("Log out");
    }
  }

  return (
    <Header
      className="!sticky !top-0 !z-40 !flex !h-[76px] !items-center !border-b !border-slate-200/80 !bg-white/95 !px-4 !leading-normal backdrop-blur-xl sm:!px-6 lg:!px-7"
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

        <div className="min-w-0 flex-1">
          <Title
            level={4}
            className="!mb-0 !truncate !text-[16px] !font-bold !text-slate-950 sm:!text-[18px]"
          >
            Welcome back, Khurshed 👋
          </Title>

          <Text className="!hidden !text-xs !text-slate-500 sm:!block">
            Here&apos;s what&apos;s happening with your portfolio today.
          </Text>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Input
            allowClear
            prefix={
              <SearchOutlined className="text-slate-400" />
            }
            placeholder="Search markets, assets..."
            className="!hidden !h-11 !w-[250px] !rounded-xl !border-slate-200 xl:!flex"
          />

          <Badge count={3} size="small">
            <Button
              type="text"
              aria-label="Notifications"
              icon={<BellOutlined />}
              className="!inline-flex !size-11 !items-center !justify-center !rounded-xl !bg-slate-50 !text-lg !text-slate-700"
            />
          </Badge>

          <Dropdown
            menu={{
              items: profileMenu,
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
                  Khurshed Khan
                </p>

                <p className="m-0 text-[11px] font-medium text-blue-600">
                  Premium Account
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