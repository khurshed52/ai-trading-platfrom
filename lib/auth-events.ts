export const AUTH_LOGOUT_EVENT = "tradepro:logout";
export const AUTH_SESSION_EXPIRED_EVENT = "tradepro:session-expired";

let authLogoutInProgress = false;

export function beginAuthLogout(): void {
  authLogoutInProgress = true;
}

export function completeAuthLogin(): void {
  authLogoutInProgress = false;
}

export function isAuthLogoutInProgress(): boolean {
  return authLogoutInProgress;
}

export function notifyAuthLogout(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_LOGOUT_EVENT));
  }
}

export function notifyAuthSessionExpired(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_SESSION_EXPIRED_EVENT));
  }
}
