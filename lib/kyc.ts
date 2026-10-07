import dayjs from "dayjs";

import type {
  KycJourneyItem,
  KycPersonalInformationValues,
  KycProfileData,
  KycStep,
  ProfileCompletion,
  UpdateKycProfileRequest,
} from "@/types/kyc";
import { KycStatus } from "@/types/kyc";

const statusStepMap: Record<KycStatus, KycStep> = {
  [KycStatus.REGISTERED]: 1,
  [KycStatus.PROFILE_IN_PROGRESS]: 1,
  [KycStatus.PROFILE_COMPLETED]: 2,
  [KycStatus.IDENTITY_PENDING]: 2,
  [KycStatus.IDENTITY_IN_PROGRESS]: 2,
  [KycStatus.IDENTITY_REJECTED]: 2,
  [KycStatus.IDENTITY_VERIFIED]: 3,
  [KycStatus.SIGNATURE_PENDING]: 3,
  [KycStatus.COMPLETED]: 3,
  [KycStatus.APPROVED]: 3,
  [KycStatus.REJECTED]: 3,
};

const requiredFields: Array<keyof KycPersonalInformationValues> = [
  "customerFirstName",
  "customerLastName",
  "dateOfBirth",
  "gender",
  "customerNationality",
  "email",
  "phoneNumber",
  "countryOfResidence",
  "addressLine1",
  "city",
  "state",
  "postalCode",
  "employmentStatus",
  "occupation",
];

const journeyContent = [
  {
    title: "Personal Information",
    description: "Complete your personal details",
  },
  {
    title: "Identity Document",
    description: "Verify a government-issued document",
  },
  {
    title: "Sign Documents",
    description: "Review and sign required documents",
  },
] as const;

export function isKycStatus(status: string): status is KycStatus {
  return Object.values(KycStatus).includes(status as KycStatus);
}

export function getKycStepFromStatus(status: KycStatus): KycStep {
  return statusStepMap[status];
}

export function getKycJourney(
  status: KycStatus,
  activeStep?: KycStep,
): KycJourneyItem[] {
  const currentStep = activeStep ?? getKycStepFromStatus(status);

  return journeyContent.map((item, index) => {
    const step = (index + 1) as KycStep;

    return {
      step,
      ...item,
      state:
        step < currentStep
          ? "completed"
          : step === currentStep
            ? "active"
            : "pending",
    };
  });
}

function hasMeaningfulValue(value: unknown): boolean {
  if (value === null || value === undefined) {
    return false;
  }

  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  return true;
}

export function calculateProfileCompletion(
  values: Partial<KycPersonalInformationValues>,
): ProfileCompletion {
  const completed = requiredFields.filter((field) =>
    hasMeaningfulValue(values[field]),
  ).length;
  const total = requiredFields.length;

  return {
    completed,
    total,
    percentage: Math.round((completed / total) * 100),
  };
}

export function getNextBestAction(
  values: Partial<KycPersonalInformationValues>,
): string {
  const groups: Array<{
    fields: Array<keyof KycPersonalInformationValues>;
    action: string;
  }> = [
    {
      fields: [
        "customerFirstName",
        "customerLastName",
        "dateOfBirth",
        "gender",
        "customerNationality",
      ],
      action: "Complete your personal details",
    },
    {
      fields: ["email", "phoneNumber"],
      action: "Complete your contact details",
    },
    {
      fields: [
        "countryOfResidence",
        "addressLine1",
        "city",
        "state",
        "postalCode",
      ],
      action: "Add your residential address",
    },
    {
      fields: ["employmentStatus", "occupation"],
      action: "Complete your employment details",
    },
  ];

  return (
    groups.find((group) =>
      group.fields.some((field) => !hasMeaningfulValue(values[field])),
    )?.action ?? "Your profile information is ready"
  );
}

export function mapKycProfileToForm(
  profile: KycProfileData,
): KycPersonalInformationValues {
  const personalProfile = profile.kycProfile;
  const parsedDate = personalProfile?.dateOfBirth
    ? dayjs(personalProfile.dateOfBirth)
    : null;

  return {
    customerFirstName: profile.customerFirstName ?? "",
    customerLastName: profile.customerLastName ?? "",
    dateOfBirth: parsedDate?.isValid() ? parsedDate : null,
    gender: personalProfile?.gender ?? "",
    customerNationality: profile.customerNationality ?? "",
    email: profile.email ?? "",
    phoneNumber: profile.phoneNumber ?? "",
    countryOfResidence: personalProfile?.countryOfResidence ?? "",
    addressLine1: personalProfile?.addressLine1 ?? "",
    addressLine2: personalProfile?.addressLine2 ?? "",
    city: personalProfile?.city ?? "",
    state: personalProfile?.state ?? "",
    postalCode: personalProfile?.postalCode ?? "",
    employmentStatus: personalProfile?.employmentStatus ?? "",
    occupation: personalProfile?.occupation ?? "",
  };
}

export function mapFormToKycProfileRequest(
  values: KycPersonalInformationValues,
): UpdateKycProfileRequest {
  return {
    dateOfBirth: values.dateOfBirth?.format("YYYY-MM-DD") ?? "",
    gender: values.gender,
    countryOfResidence: values.countryOfResidence,
    addressLine1: values.addressLine1.trim(),
    addressLine2: values.addressLine2?.trim() ?? "",
    city: values.city.trim(),
    state: values.state.trim(),
    postalCode: values.postalCode.trim(),
    employmentStatus: values.employmentStatus,
    occupation: values.occupation.trim(),
  };
}

export function getSafeVerificationUrl(value: string | undefined): string | null {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);
    const isVeriffHost =
      url.hostname === "veriff.com" || url.hostname.endsWith(".veriff.com");

    return url.protocol === "https:" && isVeriffHost ? url.toString() : null;
  } catch {
    return null;
  }
}
