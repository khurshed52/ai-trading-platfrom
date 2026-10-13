export function formatReportAmount(
  amount: string | null,
  currency: string | null,
) {
  if (!amount || !currency) return "—";

  const match = amount.trim().match(/^([+-]?)(\d+)(\.\d+)?$/);
  if (!match) return `${amount} ${currency}`;

  const [, sign, integer, decimal = ""] = match;
  const groupedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${sign}${groupedInteger}${decimal} ${currency}`;
}

export function formatReportDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { date: "—", time: "" };

  return {
    date: new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date),
    time: new Intl.DateTimeFormat(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(date),
  };
}
