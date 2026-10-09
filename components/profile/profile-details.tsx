import type { ReactNode } from "react";
import {
  BellOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  GlobalOutlined,
  IdcardOutlined,
  MailOutlined,
  PhoneOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";

import type { UserDetail } from "@/services/user.services";

type DetailRowProps = {
  icon: ReactNode;
  label: string;
  value: ReactNode;
};

function DetailRow({ icon, label, value }: DetailRowProps) {
  return (
    <div className="grid min-h-10 grid-cols-[26px_minmax(120px,0.7fr)_minmax(0,1fr)] items-center gap-2 border-b border-slate-100 py-2 last:border-b-0">
      <span className="text-lg text-indigo-500">{icon}</span>
      <span className="text-sm text-slate-500">{label}</span>
      <span className="min-w-0 break-words text-sm font-semibold text-slate-950">
        {value}
      </span>
    </div>
  );
}

function SectionCard({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.05)] sm:p-6">
      <header className="flex items-center gap-2 border-b border-slate-100 pb-2">
        <span className="text-2xl text-blue-600">{icon}</span>
        <h2 className="m-0 text-xl font-bold text-slate-950">{title}</h2>
      </header>
      <div className="pt-1">{children}</div>
    </section>
  );
}

function BooleanValue({ value }: { value: boolean }) {
  return (
    <span className="inline-flex items-center gap-2 text-emerald-700">
      <span className="size-2.5 rounded-full bg-emerald-500" />
      {value ? "Yes" : "No"}
    </span>
  );
}

function formatDate(value: string | null) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function ProfileDetails({ user }: { user: UserDetail }) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <SectionCard icon={<TeamOutlined />} title="Personal Information">
        <DetailRow icon={<UserOutlined />} label="Name" value={user.name} />
        <DetailRow
          icon={<MailOutlined />}
          label="Email Address"
          value={user.email}
        />
        <DetailRow
          icon={<PhoneOutlined />}
          label="Phone Number"
          value={user.customer.phoneNumber || "—"}
        />
        <DetailRow
          icon={<GlobalOutlined />}
          label="Nationality"
          value={user.customer.customerNationality || "—"}
        />
        <DetailRow
          icon={<IdcardOutlined />}
          label="Customer ID"
          value={user.customer.sid || "—"}
        />
      </SectionCard>

      <SectionCard
        icon={<SafetyCertificateOutlined />}
        title="Account Status"
      >
        <DetailRow
          icon={<SafetyCertificateOutlined />}
          label="Status"
          value={
            <span className="inline-flex items-center gap-2 text-emerald-700">
              <span className="size-2.5 rounded-full bg-emerald-500" />
              {user.status}
            </span>
          }
        />
        <DetailRow
          icon={<BellOutlined />}
          label="Active"
          value={<BooleanValue value={user.isActive} />}
        />
        <DetailRow
          icon={<SafetyCertificateOutlined />}
          label="Withdrawal Allowed"
          value={<BooleanValue value={user.permissions.withdrawalAllowed} />}
        />
        <DetailRow
          icon={<ClockCircleOutlined />}
          label="Withdrawal Available At"
          value={formatDate(user.restrictions.withdrawalAllowedAt)}
        />
      </SectionCard>

      <div className="lg:col-span-2">
        <SectionCard icon={<CalendarOutlined />} title="Account Information">
          <div className="grid gap-x-10 md:grid-cols-2">
            <DetailRow
              icon={<CalendarOutlined />}
              label="Joined On"
              value={formatDate(user.createdAt)}
            />
            <DetailRow
              icon={<CalendarOutlined />}
              label="Last Updated"
              value={formatDate(user.updatedAt)}
            />
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
