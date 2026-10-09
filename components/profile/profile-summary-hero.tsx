import {
  CheckOutlined,
  GlobalOutlined,
  IdcardOutlined,
  MailOutlined,
  PhoneOutlined,
  UserOutlined,
} from "@ant-design/icons";

import type { UserDetail } from "@/services/user.services";

function getInitials(user: UserDetail) {
  const initials = [
    user.customer.customerFirstName,
    user.customer.customerLastName,
  ]
    .map((value) => value.trim().charAt(0).toUpperCase())
    .join("");

  return initials || user.name.trim().charAt(0).toUpperCase() || "TP";
}

export function ProfileSummaryHero({ user }: { user: UserDetail }) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-blue-100 bg-[linear-gradient(120deg,#ffffff_0%,#f8fbff_45%,#e7f1ff_100%)] p-4 shadow-[0_12px_35px_rgba(37,99,235,0.06)] lg:p-4">
      <div
        aria-hidden="true"
        className="absolute inset-y-0 right-0 w-2/3 opacity-35 [background-image:linear-gradient(120deg,transparent_35%,rgba(59,130,246,.15)),repeating-linear-gradient(90deg,transparent_0_52px,rgba(59,130,246,.08)_52px_54px)]"
      />

      <div className="relative grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(480px,0.95fr)] xl:items-center">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="flex size-32 shrink-0 items-center justify-center rounded-full bg-blue-100 text-4xl font-extrabold text-blue-600 shadow-inner">
            {getInitials(user)}
          </div>

          <div className="min-w-0">
            <h2 className="m-0 truncate text-2xl font-extrabold text-slate-950">
              {user.name}
            </h2>
            <p className="mb-0 mt-2 flex items-center gap-3 text-slate-600">
              <MailOutlined className="text-lg text-indigo-500" />
              <span className="truncate">{user.email}</span>
            </p>
            <p className="mb-0 mt-2 flex items-center gap-3 text-slate-600">
              <PhoneOutlined className="text-lg text-indigo-500" />
              {user.customer.phoneNumber || "—"}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2 rounded-lg border border-blue-100 bg-white/80 px-3 py-1.5 text-sm text-slate-600">
                <GlobalOutlined />
                {user.customer.customerNationality || "—"}
              </span>
              <span className="inline-flex items-center gap-2 rounded-lg border border-blue-100 bg-white/80 px-3 py-1.5 text-sm text-slate-600">
                <IdcardOutlined />
                {user.customer.sid || "—"}
              </span>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-emerald-100 bg-white/85 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)] backdrop-blur">
            <div className="flex items-start gap-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-xl text-white">
                <CheckOutlined />
              </span>
              <div>
                <p className="m-0 text-sm text-slate-500">Account Status</p>
                <p className="mb-0 mt-2 text-lg font-bold text-emerald-700">
                  {user.status}
                </p>
                <p className="mb-0 mt-2 text-sm leading-5 text-slate-500">
                  Your account is verified and active.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-white/85 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)] backdrop-blur">
            <div className="flex items-start gap-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xl text-white">
                <UserOutlined />
              </span>
              <div>
                <p className="m-0 text-sm text-slate-500">Account Type</p>
                <p className="mb-0 mt-2 text-lg font-bold text-blue-700">
                  {user.role}
                </p>
                <p className="mb-0 mt-2 text-sm leading-5 text-slate-500">
                  Standard trading account.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
