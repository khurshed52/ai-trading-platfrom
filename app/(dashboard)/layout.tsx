import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Shell from "@/components/layouts/shell";

type WebsiteLayoutProps = {
  children: ReactNode;
};

export default async function WebsiteLayout({
  children,
}: WebsiteLayoutProps) {
  const cookieStore = await cookies();

  const token = cookieStore.get("access_token")?.value;

  if (!token) {
    redirect("/login");
  }

  return <Shell>{children}</Shell>;
}