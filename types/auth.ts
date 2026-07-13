import type { PhoneValue } from "@/components/form/phone-number-input";

export type LoginFormValues = {
  email: string;
  password: string;
  remember: boolean;
};

export type RegisterFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone: PhoneValue;
  password: string;
  consent: boolean;
};
