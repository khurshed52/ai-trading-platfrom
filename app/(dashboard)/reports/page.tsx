import { redirect } from "next/navigation";

import { ROUTES } from "@/constants/routes";

export default function ReportsPage() {
  redirect(ROUTES.REPORTS.DEPOSIT);
}
