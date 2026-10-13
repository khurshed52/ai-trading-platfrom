import { redirect } from "next/navigation";

import { ROUTES } from "@/constants/routes";

export default function AgreementPage() {
  redirect(ROUTES.SETTINGS.ACCOUNT_SECURITY);
}
