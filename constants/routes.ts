export const ROUTES = {
  PUBLIC: {
    DASHBOARD: "/dashboard",
    MARKETS: "/markets",
  },

  AUTH: {
    LOGIN: "/login",
    REGISTER: "/register",
    FORGOT_PASSWORD: "/forgot-password",
  },

    FUNDS: {
     DEPOSIT: "/funds/deposit",
      WITHDRAW: "/funds/withdraw",
      TRANSFER: "/funds/transfer",
    }
} as const;