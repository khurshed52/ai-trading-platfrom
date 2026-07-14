import type { ReactNode } from "react";
import Shell from "@/components/layouts/shell";

type WebsiteLayoutProps = {
  children: ReactNode;
};

export default function WebsiteLayout({
  children,
}: WebsiteLayoutProps) {
  return (
    <Shell>
      {children}
    </Shell>
  );
}