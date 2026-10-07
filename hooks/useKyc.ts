import { useMutation, useQuery } from "@tanstack/react-query";

import {
  createIdentityVerificationSession,
  getKycProfile,
  signKycAgreement,
  updateKycProfile,
} from "@/services/kyc.service";
import { getUserDetail } from "@/services/user.services";

export function useKycStatus() {
  return useQuery({
    queryKey: ["user-detail"],
    queryFn: getUserDetail,
    staleTime: 0,
    refetchOnMount: "always",
  });
}

export function useKycProfile(enabled: boolean) {
  return useQuery({
    queryKey: ["kyc-profile"],
    queryFn: getKycProfile,
    enabled,
    staleTime: 0,
    refetchOnMount: "always",
  });
}

export function useUpdateKycProfile() {
  return useMutation({
    mutationFn: updateKycProfile,
  });
}

export function useIdentityVerificationSession(enabled: boolean) {
  return useQuery({
    queryKey: ["kyc-identity-session"],
    queryFn: createIdentityVerificationSession,
    enabled,
    staleTime: Infinity,
    retry: false,
    refetchOnWindowFocus: false,
  });
}

export function useSignKycAgreement() {
  return useMutation({
    mutationFn: signKycAgreement,
  });
}
