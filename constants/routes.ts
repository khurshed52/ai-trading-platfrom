export const ROUTES = {
  PUBLIC: {
    DASHBOARD: "/dashboard",
    MARKETS: "/markets",
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
    },

    PROFILE: {
      KYC: "/profile/kyc",
    },
} as const;
