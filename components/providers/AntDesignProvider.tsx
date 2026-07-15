"use client";

import type { ReactNode } from "react";
import { ConfigProvider, theme } from "antd";

type AntDesignProviderProps = {
  children: ReactNode;
};

export default function AntDesignProvider({
  children,
}: AntDesignProviderProps) {
  return (
    <ConfigProvider
      theme={{
        // Use the light Ant Design theme.
        algorithm: theme.defaultAlgorithm,

        token: {
          fontFamily: "var(--font-geist-sans)",

          colorPrimary: "#1468f3",

          colorBgBase: "#ffffff",
          colorBgLayout: "#f8fafc",
          colorBgContainer: "#ffffff",
          colorBgElevated: "#ffffff",

          colorText: "#0f172a",
          colorTextSecondary: "#64748b",
          colorTextPlaceholder: "#94a3b8",

          colorBorder: "#d7dfeb",
          colorBorderSecondary: "#e5eaf1",

          borderRadius: 10,
          borderRadiusLG: 24,

          controlHeight: 44,
          controlHeightLG: 54,
        },

        components: {
          Form: {
            labelColor: "#0f172a",
            labelFontSize: 14,
            labelHeight: 22,
            itemMarginBottom: 24,
          },

          Input: {
            colorBgContainer: "#ffffff",
            colorText: "#0f172a",
            colorTextPlaceholder: "#94a3b8",
            colorBorder: "#d7dfeb",

            activeBg: "#ffffff",
            hoverBg: "#ffffff",

            activeBorderColor: "#1468f3",
            hoverBorderColor: "#1468f3",
            activeShadow: "0 0 0 3px rgba(20, 104, 243, 0.1)",

            paddingInline: 16,
            inputFontSize: 15,
            inputFontSizeLG: 15,

            borderRadius: 10,
          },

          Button: {
            controlHeight: 48,
            borderRadius: 10,
            fontWeight: 600,
            primaryShadow: "0 8px 20px rgba(20, 104, 243, 0.2)",
          },

          Card: {
            colorBgContainer: "#ffffff",
            borderRadiusLG: 24,
          },

          Checkbox: {
            colorPrimary: "#1468f3",
            colorPrimaryHover: "#0f5de0",
          },

          Divider: {
            colorSplit: "#e2e8f0",
            colorText: "#94a3b8",
          },

          Typography: {
            colorText: "#64748b",
            colorTextHeading: "#0f172a",
          },
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}