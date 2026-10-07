import { internalApiFetch, apiFetch } from "@/lib/api";
export type LoginRequest = {
  email: string;
  password: string;
  rememberMe?: boolean;
};

export type RegisterRequest = {
  customerFirstName: string;
  customerLastName: string;
  email: string;
  password: string;
  customerNationality: string;
  phoneNumber: string;
  reglink: string;
  consentAccepted: boolean;
};

export type RegisterResponseData = {
  email?: string;
  user?: {
    email: string;
  };
  customer?: {
    email: string;
  };
};

export type VerifyRegistrationOtpRequest = {
  email: string;
  otp: string;
};

export type ResendRegistrationOtpRequest = {
  email: string;
};

export type RegistrationOtpResponseData = {
  email?: string;
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  customer?: {
    id: string;
    customerFirstName: string;
    customerLastName: string;
    email: string;
    customerNationality: string;
    phoneNumber: string;
    reglink: string;
  };
};

export type ForgotPasswordRequest = {
  email: string;
};

export type VerifyResetOtpRequest = {
  email: string;
  otp: string;
};

export type VerifyResetOtpResponseData = {
  resetToken: string;
};

export type ResetPasswordRequest = {
  resetToken: string;
  newPassword: string;
};

export function loginUser(payload: LoginRequest) {
  return internalApiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function registerUser(payload: RegisterRequest) {
  return apiFetch<RegisterResponseData>("auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function verifyRegistrationOtp(
  payload: VerifyRegistrationOtpRequest,
) {
  return apiFetch<RegistrationOtpResponseData>(
    "auth/verify-registration-otp",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export function resendRegistrationOtp(
  payload: ResendRegistrationOtpRequest,
) {
  return apiFetch<RegistrationOtpResponseData>(
    "auth/resend-registration-otp",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export function requestPasswordReset(payload: ForgotPasswordRequest) {
  return apiFetch<null>("auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function verifyResetOtp(payload: VerifyResetOtpRequest) {
  return apiFetch<VerifyResetOtpResponseData>("auth/verify-reset-otp", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function resetPassword(payload: ResetPasswordRequest) {
  return apiFetch<null>("auth/reset-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function resendResetOtp(payload: ForgotPasswordRequest) {
  return apiFetch<null>("auth/resend-reset-otp", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function logoutUser() {
  return internalApiFetch("/api/auth/logout", {
    method: "POST",
  });
}
