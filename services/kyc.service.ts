import { internalApiFetch } from "@/lib/api";
import type {
  IdentityVerificationSession,
  KycProfileData,
  SignedKycAgreement,
  SignKycAgreementRequest,
  UpdatedKycProfile,
  UpdateKycProfileRequest,
} from "@/types/kyc";

export function getKycProfile() {
  return internalApiFetch<KycProfileData>("/api/backend/kyc/profile");
}

export function updateKycProfile(payload: UpdateKycProfileRequest) {
  return internalApiFetch<UpdatedKycProfile>("/api/backend/kyc/profile", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function createIdentityVerificationSession() {
  return internalApiFetch<IdentityVerificationSession>(
    "/api/backend/kyc/identity/session",
    { method: "POST" },
  );
}

export function signKycAgreement(payload: SignKycAgreementRequest) {
  return internalApiFetch<SignedKycAgreement>(
    "/api/backend/kyc/agreement/sign",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}
