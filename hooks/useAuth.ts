import {
  loginUser,
  logoutUser,
  registerUser,
  requestPasswordReset,
  resendResetOtp,
  resendRegistrationOtp,
  resetPassword,
  verifyResetOtp,
  verifyRegistrationOtp,
} from "@/services/auth.service";
import { useMutation } from "@tanstack/react-query";

export function useLogin() {
  return useMutation({
    mutationFn: loginUser,
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: registerUser,
  });
}

export function useVerifyRegistrationOtp() {
  return useMutation({
    mutationFn: verifyRegistrationOtp,
  });
}

export function useResendRegistrationOtp() {
  return useMutation({
    mutationFn: resendRegistrationOtp,
  });
}

export function useRequestPasswordReset() {
  return useMutation({
    mutationFn: requestPasswordReset,
  });
}

export function useVerifyResetOtp() {
  return useMutation({
    mutationFn: verifyResetOtp,
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: resetPassword,
  });
}

export function useResendResetOtp() {
  return useMutation({
    mutationFn: resendResetOtp,
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: logoutUser,
  });
}
