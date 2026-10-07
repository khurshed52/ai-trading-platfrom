"use client";

import { useEffect } from "react";
import {
  BankOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  MailOutlined,
  PhoneOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Button, DatePicker, Divider, Form, Input, Select } from "antd";
import dayjs from "dayjs";

import CountrySelect from "@/components/form/country-select";
import type {
  KycPersonalInformationValues,
  KycProfileData,
} from "@/types/kyc";

type PersonalInformationStepProps = {
  profile: KycProfileData;
  initialValues: KycPersonalInformationValues;
  submitting: boolean;
  onValuesChange: (values: KycPersonalInformationValues) => void;
  onSubmit: (values: KycPersonalInformationValues) => void;
};

const genderOptions = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "OTHER", label: "Other" },
  { value: "PREFER_NOT_TO_SAY", label: "Prefer not to say" },
];

const employmentOptions = [
  { value: "EMPLOYED", label: "Employed" },
  { value: "SELF_EMPLOYED", label: "Self-employed" },
  { value: "STUDENT", label: "Student" },
  { value: "RETIRED", label: "Retired" },
  { value: "UNEMPLOYED", label: "Unemployed" },
];

export function PersonalInformationStep({
  profile,
  initialValues,
  submitting,
  onValuesChange,
  onSubmit,
}: PersonalInformationStepProps) {
  const [form] = Form.useForm<KycPersonalInformationValues>();

  useEffect(() => {
    form.setFieldsValue(initialValues);
  }, [form, initialValues]);

  const lockedFields = {
    customerFirstName: Boolean(profile.customerFirstName?.trim()),
    customerLastName: Boolean(profile.customerLastName?.trim()),
    email: Boolean(profile.email?.trim()),
    customerNationality: Boolean(profile.customerNationality?.trim()),
    phoneNumber: Boolean(profile.phoneNumber?.trim()),
  };

  return (
    <div>
      <Form<KycPersonalInformationValues>
        form={form}
        layout="vertical"
        requiredMark
        initialValues={initialValues}
        className="[&_.ant-form-item]:!mb-3 [&_.ant-form-item-label]:!pb-1 [&_.ant-form-item-label>label]:!font-medium"
        onValuesChange={(_, values) => onValuesChange(values)}
        onFinish={onSubmit}
      >
        <FormSection title="Personal Details" first>
          <div className="grid gap-x-5 md:grid-cols-2">
            <Form.Item
              name="customerFirstName"
              label="First Name"
              rules={[{ required: true, message: "Enter your first name" }]}
            >
              <Input
                prefix={<UserOutlined className="text-slate-400" />}
                placeholder="First name"
                disabled={lockedFields.customerFirstName}
              />
            </Form.Item>

            <Form.Item
              name="customerLastName"
              label="Last Name"
              rules={[{ required: true, message: "Enter your last name" }]}
            >
              <Input
                prefix={<UserOutlined className="text-slate-400" />}
                placeholder="Last name"
                disabled={lockedFields.customerLastName}
              />
            </Form.Item>

            <Form.Item
              name="dateOfBirth"
              label="Date of Birth"
              rules={[{ required: true, message: "Select your date of birth" }]}
            >
              <DatePicker
                className="!w-full"
                format="DD MMM YYYY"
                placeholder="Select date"
                suffixIcon={<CalendarOutlined />}
                disabledDate={(date) => date.isAfter(dayjs(), "day")}
              />
            </Form.Item>

            <Form.Item
              name="gender"
              label="Gender"
              rules={[{ required: true, message: "Select your gender" }]}
            >
              <Select
                placeholder="Select gender"
                options={genderOptions}
                suffixIcon={<UserOutlined />}
              />
            </Form.Item>

            <Form.Item
              name="customerNationality"
              label="Nationality"
              rules={[{ required: true, message: "Select your nationality" }]}
            >
              <CountrySelect
                placeholder="Select nationality"
                disabled={lockedFields.customerNationality}
              />
            </Form.Item>
          </div>
        </FormSection>

        <FormSection title="Contact Details">
          <div className="grid gap-x-5 md:grid-cols-2">
            <Form.Item
              name="email"
              label="Email Address"
              rules={[
                { required: true, message: "Enter your email address" },
                { type: "email", message: "Enter a valid email address" },
              ]}
            >
              <Input
                prefix={<MailOutlined className="text-slate-400" />}
                placeholder="Email address"
                disabled={lockedFields.email}
              />
            </Form.Item>

            <Form.Item
              name="phoneNumber"
              label="Phone Number"
              rules={[{ required: true, message: "Enter your phone number" }]}
            >
              <Input
                prefix={<PhoneOutlined className="text-slate-400" />}
                placeholder="Phone number"
                disabled={lockedFields.phoneNumber}
              />
            </Form.Item>
          </div>
        </FormSection>

        <FormSection title="Residential Address">
          <div className="grid gap-x-5 md:grid-cols-2">
            <Form.Item
              name="countryOfResidence"
              label="Country of Residence"
              rules={[{ required: true, message: "Select your country of residence" }]}
            >
              <CountrySelect
                placeholder="Select country"
              />
            </Form.Item>

            <div className="hidden md:block" />

            <Form.Item
              name="addressLine1"
              label="Address Line 1"
              rules={[{ required: true, message: "Enter your address" }]}
            >
              <Input
                prefix={<EnvironmentOutlined className="text-slate-400" />}
                placeholder="Street address"
              />
            </Form.Item>

            <Form.Item name="addressLine2" label="Address Line 2 (Optional)">
              <Input
                prefix={<EnvironmentOutlined className="text-slate-400" />}
                placeholder="Apartment, suite, unit"
              />
            </Form.Item>
          </div>

          <div className="grid gap-x-5 md:grid-cols-3">
            <Form.Item
              name="city"
              label="City"
              rules={[{ required: true, message: "Enter your city" }]}
            >
              <Input placeholder="City" />
            </Form.Item>

            <Form.Item
              name="state"
              label="State / Emirate"
              rules={[{ required: true, message: "Enter your state or emirate" }]}
            >
              <Input placeholder="State or emirate" />
            </Form.Item>

            <Form.Item
              name="postalCode"
              label="Postal Code"
              rules={[{ required: true, message: "Enter your postal code" }]}
            >
              <Input placeholder="Postal code" />
            </Form.Item>
          </div>
        </FormSection>

        <FormSection title="Employment">
          <div className="grid gap-x-5 md:grid-cols-2">
            <Form.Item
              name="employmentStatus"
              label="Employment Status"
              rules={[{ required: true, message: "Select your employment status" }]}
            >
              <Select
                placeholder="Select employment status"
                options={employmentOptions}
                suffixIcon={<BankOutlined />}
              />
            </Form.Item>

            <Form.Item
              name="occupation"
              label="Occupation"
              rules={[{ required: true, message: "Enter your occupation" }]}
            >
              <Input
                prefix={<BankOutlined className="text-slate-400" />}
                placeholder="Occupation"
              />
            </Form.Item>
          </div>
        </FormSection>

        <div className="flex justify-end pt-0.5">
          <Button
            type="primary"
            htmlType="submit"
            loading={submitting}
            className="!min-w-[220px]"
          >
            Save & Continue <span aria-hidden="true">→</span>
          </Button>
        </div>
      </Form>
    </div>
  );
}

type StepHeaderProps = {
  step: number;
  title: string;
  description: string;
};

export function StepHeader({ step, title, description }: StepHeaderProps) {
  return (
    <header className="border-b border-slate-200 pb-5">
      <p className="m-0 text-xs font-semibold text-blue-600">Step {step} of 3</p>
      <h1 className="mb-1 mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-[28px]">
        {title}
      </h1>
      <p className="m-0 text-sm text-slate-500 sm:text-base">{description}</p>
    </header>
  );
}

function FormSection({
  title,
  first = false,
  children,
}: {
  title: string;
  first?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section>
      {!first ? <Divider className="!my-3" /> : null}
      <h2 className="mb-3 mt-0 text-base font-bold text-slate-900">
        {title}
      </h2>
      {children}
    </section>
  );
}
