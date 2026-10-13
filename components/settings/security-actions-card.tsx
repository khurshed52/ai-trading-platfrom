"use client";

import {
  EditOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import { App, Button } from "antd";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { ROUTES } from "@/constants/routes";

type SecurityActionRowProps = {
  icon: ReactNode;
  iconClassName: string;
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
};

function SecurityActionRow({
  icon,
  iconClassName,
  title,
  description,
  actionLabel,
  onAction,
}: SecurityActionRowProps) {
  return (
    <div className="flex flex-col gap-3 border-t border-slate-100 py-3 first:border-t-0 sm:flex-row sm:items-center">
      <span
        className={`flex size-12 shrink-0 items-center justify-center rounded-xl text-xl ${iconClassName}`}
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="m-0 text-base font-bold text-slate-950">{title}</h3>
        <p className="mb-0 mt-1 text-sm text-slate-500">{description}</p>
      </div>
      <Button
        icon={<EditOutlined />}
        onClick={onAction}
        className="!h-10 !min-w-32 !rounded-lg !border-blue-300 !font-semibold !text-blue-600"
      >
        {actionLabel}
      </Button>
    </div>
  );
}

export function SecurityActionsCard() {
  const { message } = App.useApp();
  const router = useRouter();
  const showUnavailableMessage = (content: string) => {
    void message.info(content);
  };

  return (
    <section className="rounded-2xl border border-slate-100 bg-white px-5 py-3 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
      <header className="flex items-center gap-4 py-2">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-2xl text-blue-600">
          <SafetyCertificateOutlined />
        </span>
        <div>
          <h2 className="m-0 text-lg font-extrabold text-slate-950">
            Account Security
          </h2>
          <p className="mb-0 mt-1 text-sm text-slate-500">
            Keep your account secure with the latest security settings.
          </p>
        </div>
      </header>

      <SecurityActionRow
        icon={<MailOutlined />}
        iconClassName="bg-blue-50 text-blue-600"
        title="Change Email"
        description="Update your email address to keep your account secure."
        actionLabel="Update"
        onAction={() =>
          showUnavailableMessage("Email updates are not available yet.")
        }
      />
      <SecurityActionRow
        icon={<PhoneOutlined />}
        iconClassName="bg-emerald-50 text-emerald-600"
        title="Change Phone Number"
        description="Update your phone number for account verification."
        actionLabel="Update"
        onAction={() =>
          showUnavailableMessage("Phone number updates are not available yet.")
        }
      />
      <SecurityActionRow
        icon={<LockOutlined />}
        iconClassName="bg-violet-50 text-violet-600"
        title="Change Password"
        description="Create a new password to keep your account secure."
        actionLabel="Change"
        onAction={() => router.push(ROUTES.AUTH.FORGOT_PASSWORD)}
      />
      <SecurityActionRow
        icon={<SafetyCertificateOutlined />}
        iconClassName="bg-amber-50 text-amber-500"
        title="Two-Factor Authentication (2FA)"
        description="Add an extra layer of security to your account."
        actionLabel="Set up"
        onAction={() =>
          showUnavailableMessage(
            "Two-factor authentication is not available yet.",
          )
        }
      />
    </section>
  );
}
