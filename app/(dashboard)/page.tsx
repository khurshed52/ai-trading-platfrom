import { redirect } from "next/navigation";
import { ROUTES } from "@/constants/routes";

export default function Page() {
  redirect(ROUTES.AUTH.LOGIN);
}