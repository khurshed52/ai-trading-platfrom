import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  BarChartOutlined,
  LockOutlined,
  PlusOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Avatar, Skeleton, Tooltip } from "antd";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import {
  canAccessKycProtectedRoutes,
  getKycProtectedRouteMessage,
  isKycStatus,
} from "@/lib/kyc";
import type { UserDetail } from "@/services/user.services";

interface DashboardHeroProps {
  user?: UserDetail;
  isLoading: boolean;
}

const quickActions = [
  {
    label: "Deposit",
    description: "Add Funds",
    href: ROUTES.FUNDS.DEPOSIT,
    icon: ArrowDownOutlined,
    protected: true,
  },
  {
    label: "Withdraw",
    description: "Withdraw Funds",
    href: ROUTES.FUNDS.WITHDRAW,
    icon: ArrowUpOutlined,
    protected: true,
  },
  {
    label: "Profile",
    description: "View Profile",
    href: ROUTES.PROFILE.ROOT,
    icon: UserOutlined,
    protected: false,
  },
  {
    label: "Open Account",
    description: "Create New",
    href: ROUTES.ACCOUNTS.ROOT,
    icon: PlusOutlined,
    protected: true,
  },
] as const;

function formatJoinedDate(createdAt?: string) {
  if (!createdAt) return "—";
  const date = new Date(createdAt);
  return Number.isNaN(date.getTime()) ? createdAt : date.toISOString();
}

function HeroIllustration() {
  return (
    <div className="relative hidden h-28 w-32 shrink-0 xl:block" aria-hidden>
      <div className="absolute bottom-3 left-0 h-16 w-[74px] -skew-y-6 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-[0_16px_30px_rgba(37,99,235,0.3)]">
        <div className="flex h-full items-end gap-1.5 px-3 pb-3">
          {[22, 34, 28, 46].map((height) => (
            <span
              key={height}
              className="w-2 rounded-t-sm bg-white/55"
              style={{ height }}
            />
          ))}
        </div>
      </div>
      <div className="absolute right-0 top-0 grid h-[94px] w-[82px] place-items-center rounded-[18px] border-[6px] border-white/65 bg-gradient-to-br from-blue-400/80 to-indigo-600/80 text-5xl text-white shadow-[0_18px_34px_rgba(55,88,210,0.35)] [transform:perspective(180px)_rotateY(-12deg)_rotateZ(2deg)]">
        <BarChartOutlined />
      </div>
      <span className="absolute -bottom-1 right-6 h-8 w-2 rounded-full bg-blue-400/70" />
    </div>
  );
}

export function DashboardHero({ user, isLoading }: DashboardHeroProps) {
  const fullName = [
    user?.customer?.customerFirstName,
    user?.customer?.customerLastName,
  ]
    .filter(Boolean)
    .join(" ");
  const displayName = fullName || user?.name || "TradePro customer";
  const rawKycStatus = user?.status;
  const kycStatus = rawKycStatus && isKycStatus(rawKycStatus)
    ? rawKycStatus
    : null;
  const hasProtectedAccess = kycStatus
    ? canAccessKycProtectedRoutes(kycStatus)
    : false;
  const protectedRouteMessage = getKycProtectedRouteMessage(kycStatus);

  return (
    <section className="relative overflow-hidden rounded-xl border border-blue-100 bg-gradient-to-r from-[#d7ecff] via-[#dcecff] to-[#dcdfff] px-4 py-3.5 shadow-sm sm:px-5">
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 1400 150"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path
          d="M0 116 C180 48 320 147 490 91 S760 23 930 91 S1180 140 1400 36 V150 H0 Z"
          fill="#70b8ff"
          opacity="0.2"
        />
        <path
          d="M0 120 C180 52 320 150 490 94 S760 26 930 94 S1180 143 1400 39"
          fill="none"
          stroke="white"
          strokeWidth="1.5"
          opacity="0.85"
        />
        <path
          d="M1040 -15 L1190 150 M1140 -15 L1285 150"
          stroke="#8dc7ff"
          strokeWidth="28"
          opacity="0.22"
        />
      </svg>

      <div className="relative grid items-center gap-4 xl:grid-cols-[minmax(330px,1fr)_minmax(400px,0.9fr)_130px]">
        <div className="flex min-w-0 items-center gap-4">
          <div className="relative shrink-0 rounded-full border-[3px] border-white bg-[#063485] p-1 shadow-md ring-2 ring-blue-400">
            <Avatar
              size={78}
              icon={<UserOutlined />}
              className="!bg-[#063485] text-white sm:!size-[86px] sm:!text-[42px]"
            />
            <span className="absolute bottom-0.5 right-0 size-[18px] rounded-full border-[3px] border-white bg-emerald-500" />
          </div>

          {isLoading ? (
            <Skeleton active paragraph={{ rows: 1 }} title={{ width: 180 }} />
          ) : (
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="truncate text-2xl font-bold text-slate-950">
                  {displayName}
                </h1>
                <span className="rounded-full bg-blue-600 px-3 py-1 text-[10px] font-bold tracking-wide text-white">
                  {rawKycStatus || "PENDING"}
                </span>
              </div>
              <p className="mt-1.5 break-words text-xs text-slate-600">
                SID: {user?.customer?.sid || "—"}
                <span className="mx-2 text-slate-400">|</span>
                {formatJoinedDate(user?.customer?.createdAt)}
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-white/80 bg-white/35 backdrop-blur-sm sm:grid-cols-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            const isBlocked = action.protected && !hasProtectedAccess;
            const className = `group relative flex min-h-[94px] flex-col items-center justify-center px-2 py-2.5 text-center transition ${
              isBlocked
                ? "cursor-not-allowed opacity-50"
                : "hover:bg-white/65"
            } ${index % 2 === 0 ? "border-r border-white/85" : ""} ${
              index < 2 ? "border-b border-white/85 sm:border-b-0" : ""
            } ${index === 1 ? "sm:border-r" : ""}`;
            const content = (
              <>
                <span className="grid size-11 place-items-center rounded-xl bg-white text-[22px] text-blue-600 shadow-sm transition group-hover:-translate-y-0.5">
                  <Icon />
                </span>
                <strong className="mt-1.5 whitespace-nowrap text-[12px] text-blue-800">
                  {action.label}
                </strong>
                <span className="whitespace-nowrap text-[10px] text-slate-500">
                  {action.description}
                </span>
              </>
            );

            if (isBlocked) {
              return (
                <Tooltip key={action.label} title={protectedRouteMessage}>
                  <button
                    type="button"
                    disabled
                    className={className}
                    aria-label={`${action.label}, verification required`}
                  >
                    {content}
                    <LockOutlined className="absolute right-2 top-2 text-[10px] text-slate-500" />
                  </button>
                </Tooltip>
              );
            }

            return (
              <Link key={action.label} href={action.href} className={className}>
                {content}
              </Link>
            );
          })}
        </div>

        <HeroIllustration />
      </div>
    </section>
  );
}
