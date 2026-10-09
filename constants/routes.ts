export const ROUTES = {
  PUBLIC: {
    DASHBOARD: "/dashboard",
    MARKETS: "/markets",
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

  REPORTS: {
    ROOT: "/reports",
  },

  SETTINGS: {
    ROOT: "/settings",
    PAYMENT_METHOD: "/settings/payment-method",
    AGREEMENT: "/settings/agreement",
  },
} as const;
