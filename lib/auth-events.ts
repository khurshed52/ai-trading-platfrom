export const AUTH_LOGOUT_EVENT = "tradepro:logout";

export function notifyAuthLogout(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_LOGOUT_EVENT));
  }
}
