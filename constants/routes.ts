export const ROUTES = {
  PUBLIC: {
    HOME: "/",
    ABOUT: "/about",
  },

  AUTH: {
    LOGIN: "/login",
    REGISTER: "/register",
    FORGOT_PASSWORD: "/forgot-password",
  },

  DASHBOARD: {
    HOME: "/dashboard",
    PROFILE: "/dashboard/profile",
    SETTINGS: "/dashboard/settings",
    IMAGE_BUILDER: "/dashboard/image-builder",
  },
} as const;