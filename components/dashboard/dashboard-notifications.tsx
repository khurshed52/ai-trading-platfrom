import { Bell, Clock3, MoveRight, WalletCards } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import {
  dashboardNotifications,
  type DashboardNotification,
} from "./dashboard-mock-data";

const toneStyles: Record<DashboardNotification["tone"], string> = {
  green: "bg-emerald-50 text-emerald-600",
  blue: "bg-blue-50 text-blue-600",
  amber: "bg-amber-50 text-amber-600",
};

function NotificationIcon({ tone }: { tone: DashboardNotification["tone"] }) {
  if (tone === "green") return <Clock3 size={19} />;
  if (tone === "blue") return <WalletCards size={19} />;
  return <Bell size={19} />;
}

export function DashboardNotifications() {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
      <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
        <div className="flex items-start gap-3">
          <Bell className="mt-0.5 text-slate-950" size={24} />
          <div>
            <h2 className="font-bold text-slate-950">Stay Informed</h2>
            <p className="text-xs text-slate-500">
              Important updates and notifications
            </p>
          </div>
        </div>
        <Link
          href={ROUTES.FUNDS.HISTORY}
          className="shrink-0 text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          View All
        </Link>
      </header>

      <div className="divide-y divide-slate-100 px-4 sm:px-5">
        {dashboardNotifications.map((notification) => (
          <Link
            key={notification.id}
            href={ROUTES.FUNDS.HISTORY}
            className="group grid gap-3 py-3 transition hover:bg-slate-50 sm:grid-cols-[auto_minmax(0,1fr)_auto_auto] sm:items-center sm:px-1"
          >
            <span
              className={`grid size-10 place-items-center rounded-xl ${toneStyles[notification.tone]}`}
            >
              <NotificationIcon tone={notification.tone} />
            </span>
            <span className="min-w-0">
              <span className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <span className="size-2 shrink-0 rounded-full bg-blue-500" />
                <span className="truncate">{notification.title}</span>
              </span>
              <span className="ml-4 block text-xs text-slate-500">
                {notification.description}
              </span>
            </span>
            <span className="pl-12 text-xs text-slate-500 sm:pl-0 sm:text-right">
              <span className="block">{notification.date}</span>
              <span className="block">{notification.time}</span>
            </span>
            <MoveRight
              size={18}
              className="hidden text-slate-900 transition group-hover:translate-x-1 sm:block"
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
