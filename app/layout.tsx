import type { Metadata } from "next";
import "react-international-phone/style.css";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import AntDesignProvider from "@/components/providers/AntDesignProvider";
import QueryProvider from "@/components/providers/query-provider";
import GeminiChat from "@/components/chat/gemini-chat";
import { Sora } from "next/font/google";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
});

export const metadata: Metadata = {
  title: "Trade Smarter, Invest Better | Trade Pro",
  description: "Advanced charts, live market intelligence, and AI-powered insights in one secure professional trading platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sora.variable} h-full antialiased`}
    >
      <body className={`${sora.className} flex min-h-full flex-col`}>
        <AntdRegistry>
          <AntDesignProvider>
            <QueryProvider>
              {children}
              <GeminiChat />
            </QueryProvider>
          </AntDesignProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
