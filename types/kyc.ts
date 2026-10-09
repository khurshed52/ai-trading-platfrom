import type { Dayjs } from "dayjs";

export enum KycStatus {
  REGISTERED = "REGISTERED",
  PROFILE_IN_PROGRESS = "PROFILE_IN_PROGRESS",
  PROFILE_COMPLETED = "PROFILE_COMPLETED",
  IDENTITY_PENDING = "IDENTITY_PENDING",
  IDENTITY_IN_PROGRESS = "IDENTITY_IN_PROGRESS",
  IDENTITY_VERIFIED = "IDENTITY_VERIFIED",
  IDENTITY_REJECTED = "IDENTITY_REJECTED",
  SIGNATURE_PENDING = "SIGNATURE_PENDING",
  COMPLETED = "COMPLETED",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export type KycStep = 1 | 2 | 3;

export type KycDashboardModalType =
  | "onboarding"
  | "continue"
  | "action-required";

export type KycState = {
  showDashboardModal: boolean;
  modalType: KycDashboardModalType | null;
  currentStep: KycStep | null;
  submitted: boolean;
  approved: boolean;
  correctiveActionRequired: boolean;
};

export type KycJourneyState = "completed" | "active" | "pending";

export type KycPersonalProfile = {
  dateOfBirth: string | null;
  gender: string | null;
  countryOfResidence: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  employmentStatus: string | null;
  occupation: string | null;
};

export type UpdateKycProfileRequest = {
  dateOfBirth: string;
  gender: string;
  countryOfResidence: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  employmentStatus: string;
  occupation: string;
};

export type UpdatedKycProfile = UpdateKycProfileRequest & {
  id: string;
  customerId: string;
  dateOfBirth: string;
  profileCompletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  status: KycStatus;
};

export type IdentityVerificationSession = {
  verificationUrl: string;
};

export type SignKycAgreementRequest = {
  accepted: true;
  documentVersion: string;
  signature: string;
};

export type SignedKycAgreement = {
  status: KycStatus;
  completedAt: string;
  agreement: {
    id: string;
    documentVersion: string;
    signedAt: string;
  };
};

export type KycProfileData = {
  id: string;
  customerFirstName: string | null;
  customerLastName: string | null;
  email: string | null;
  customerNationality: string | null;
  phoneNumber: string | null;
  kycProfile: KycPersonalProfile | null;
};

export type KycPersonalInformationValues = {
  customerFirstName: string;
  customerLastName: string;
  dateOfBirth: Dayjs | null;
  gender: string;
  customerNationality: string;
  email: string;
  phoneNumber: string;
  countryOfResidence: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  employmentStatus: string;
  occupation: string;
};

export type KycJourneyItem = {
  step: KycStep;
  title: string;
  description: string;
  state: KycJourneyState;
};

export type ProfileCompletion = {
  completed: number;
  total: number;
  percentage: number;
};
