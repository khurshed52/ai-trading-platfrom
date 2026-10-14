export const ROUTES = {
  PUBLIC: {
    DASHBOARD: "/dashboard",
    MARKETS: "/markets",
    TRADEPRO_AI: "/tradepro-ai",
  },

  ACCOUNTS: {
    ROOT: "/accounts",
  },

  AUTH: {
    LOGIN: "/login",
    REGISTER: "/register",
    FORGOT_PASSWORD: "/forgot-password",
    INTERVIEW: "/interview",
    SLIDE: "/slideshow",
    TANSTACK: '/tanstack',
  },

  FUNDS: {
    DEPOSIT: "/funds/deposit",
    WITHDRAW: "/funds/withdraw",
    TRANSFER: "/funds/transfer",
    HISTORY: "/funds/history",
  },

  PROFILE: {
    ROOT: "/profile",
    KYC: "/profile/kyc",
  },

  NOTIFICATIONS: "/notifications",

  REPORTS: {
    ROOT: "/reports",
    DEPOSIT: "/reports/deposit",
    WITHDRAWAL: "/reports/withdrawal",
    TRANSFER: "/reports/transfer",
  },

  SETTINGS: {
    ROOT: "/settings",
    PAYMENT_METHOD: "/settings/payment-method",
    ACCOUNT_SECURITY: "/settings/account-security",
  },
} as const;
