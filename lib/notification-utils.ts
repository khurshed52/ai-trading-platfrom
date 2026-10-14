import type { NotificationType } from "@/types/notifications";

export const notificationToneStyles: Record<NotificationType, string> = {
  INFO: "bg-blue-50 text-blue-600",
  SUCCESS: "bg-emerald-50 text-emerald-600",
  WARNING: "bg-amber-50 text-amber-600",
  ERROR: "bg-rose-50 text-rose-600",
};

export function formatNotificationDate(value: string): {
  date: string;
  time: string;
} {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return { date: "", time: "" };
  }

  return {
    date: new Intl.DateTimeFormat(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date),
    time: new Intl.DateTimeFormat(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date),
  };
}

export function getSafeNotificationUrl(actionUrl: string | null): string | null {
  if (!actionUrl || !actionUrl.startsWith("/") || actionUrl.startsWith("//")) {
    return null;
  }

  return actionUrl;
}
