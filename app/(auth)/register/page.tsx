// app/(auth)/register/page.tsx

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import OtpInput from "react-otp-input";
import { Alert, Button, Card, Checkbox, Form, Input, Typography } from "antd";
import { ROUTES } from "@/constants/routes";
import type { RegisterFormValues } from "@/types/auth";
import PhoneNumberInput from "@/components/form/phone-number-input";
import {
  useLogin,
  useRegister,
  useResendRegistrationOtp,
  useVerifyRegistrationOtp,
} from "@/hooks/useAuth";
const { Title, Text } = Typography;

export default function RegisterPage() {
  const [form] = Form.useForm<RegisterFormValues>();
  const router = useRouter();
  const [step, setStep] = useState<"details" | "otp">("details");
  const [verificationEmail, setVerificationEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpFeedback, setOtpFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const { mutate: register, isPending } = useRegister();
  const login = useLogin();
  const verifyOtp = useVerifyRegistrationOtp();
  const resendOtp = useResendRegistrationOtp();

  function handleSubmit(values: RegisterFormValues) {
    register(
      {
        customerFirstName: values.firstName,
        customerLastName: values.lastName,
        email: values.email,
        password: values.password,
        customerNationality: values.phone.countryIso2.toUpperCase(),
        phoneNumber: values.phone.fullPhone,
        reglink: "some-reg-link",
        consentAccepted: values.consent,
      },
      {
        onSuccess: (data) => {
          const responseEmail =
            data.data?.email ??
            data.data?.user?.email ??
            data.data?.customer?.email ??
            values.email;

          setVerificationEmail(responseEmail);
          setOtp("");
          setOtpFeedback(null);
          setStep("otp");
        },
      },
    );
  }

  function handleVerifyOtp() {
    if (otp.length !== 6 || !verificationEmail) {
      setOtpFeedback({
        type: "error",
        message: "Enter the complete 6-digit verification code.",
      });
      return;
    }

    setOtpFeedback(null);
    verifyOtp.mutate(
      {
        email: verificationEmail,
        otp,
      },
      {
        onSuccess: () => {
          const password = form.getFieldValue("password");

          login.mutate(
            {
              email: verificationEmail,
              password,
              rememberMe: false,
            },
            {
              onSuccess: () => {
                router.replace(ROUTES.PUBLIC.DASHBOARD);
              },
              onError: () => {
                router.replace(ROUTES.AUTH.LOGIN);
              },
            },
          );
        },
        onError: (error) => {
          setOtpFeedback({
            type: "error",
            message: error.message,
          });
        },
      },
    );
  }

  function handleResendOtp() {
    if (!verificationEmail) {
      return;
    }

    setOtpFeedback(null);
    resendOtp.mutate(
      { email: verificationEmail },
      {
        onSuccess: (data) => {
          setOtp("");
          setOtpFeedback({
            type: "success",
            message: data.message || "Verification code resent successfully.",
          });
        },
        onError: (error) => {
          setOtpFeedback({
            type: "error",
            message: error.message,
          });
        },
      },
    );
  }

  return (
    <section className="flex w-full max-w-[600px] items-center justify-center rounded-[28px] bg-[#f8fafc]">
      <Card
        bordered={false}
        className="w-full overflow-hidden !rounded-[26px] !bg-white"
        styles={{
          root: {
            backgroundColor: "#ffffff",
          },
          body: {
            padding: 0,
            backgroundColor: "#ffffff",
          },
        }}
      >
        <div className="bg-white px-6 py-6 shadow-lg sm:px-8 sm:py-8">
          <header className="mb-8 text-center">
            <Title
              level={1}
              className="!mb-2 !text-[30px] !font-bold !leading-tight !tracking-[-0.03em] !text-slate-950 sm:!text-[34px]"
            >
              {step === "details" ? "Trade with us" : "Verify your email"}
            </Title>

            <Text className="!text-[15px] !text-slate-500 sm:!text-base">
              {step === "details"
                ? "Create an account and start trading"
                : `Enter the 6-digit code sent to ${verificationEmail}`}
            </Text>
          </header>

          {step === "details" ? (
            <Form<RegisterFormValues>
              layout="vertical"
              form={form}
              requiredMark={false}
              onFinish={handleSubmit}
            >
            <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
              <Form.Item
                name="firstName"
                rules={[
                  {
                    required: true,
                    message: "Please enter your first name",
                  },
                ]}
              >
                <Input
                  placeholder="First Name"
                  autoComplete="given-name"
                />
              </Form.Item>

              <Form.Item
                name="lastName"
                rules={[
                  {
                    required: true,
                    message: "Please enter your last name",
                  },
                ]}
              >
                <Input
                  placeholder="Last Name"
                  autoComplete="family-name"
                />
              </Form.Item>
            </div>

            <Form.Item
              name="email"
              rules={[
                {
                  required: true,
                  message: "Please enter your email address",
                },
                {
                  type: "email",
                  message: "Please enter a valid email address",
                },
              ]}
            >
              <Input
                placeholder="Email"
                autoComplete="email"
              />
            </Form.Item>

              <Form.Item
                name="phone"
                validateTrigger="onBlur"
                rules={[
                  {
                    validator: (_, phone) =>
                      phone?.phoneNumber
                        ? Promise.resolve()
                        : Promise.reject(
                            new Error("Please enter your phone number"),
                          ),
                  },
                ]}
              >
                <PhoneNumberInput />
              </Form.Item>

            <Form.Item
              name="password"
              rules={[
                {
                  required: true,
                  message: "Please enter your password",
                },
                {
                  min: 8,
                  message: "Password must contain at least 8 characters",
                },
                {
                  max: 30,
                  message: "Password cannot exceed 30 characters",
                },
                {
                  pattern: /[A-Z]/,
                  message: "Password must include an uppercase letter",
                },
                {
                  pattern: /[a-z]/,
                  message: "Password must include a lowercase letter",
                },
                {
                  pattern: /\d/,
                  message: "Password must include a number",
                },
                {
                  pattern: /[^A-Za-z0-9]/,
                  message: "Password must include a symbol",
                },
              ]}
              className="!mb-4"
            >
              <Input.Password
                placeholder="Password (8 to 30 characters)"
                autoComplete="new-password"
              />
            </Form.Item>

            <div className="mb-6 grid grid-cols-5 gap-2 text-center">
              <PasswordRequirement
                symbol="8+"
                label="Character"
              />
              <PasswordRequirement
                symbol="AA"
                label="Uppercase"
              />
              <PasswordRequirement
                symbol="aa"
                label="Lowercase"
              />
              <PasswordRequirement
                symbol="123"
                label="Number"
              />
              <PasswordRequirement
                symbol="@$#"
                label="Symbol"
              />
            </div>

            <div className="mb-6 rounded-[10px] border border-slate-200 bg-slate-50 px-4 py-4">
              <Form.Item
                name="consent"
                valuePropName="checked"
                rules={[
                  {
                    validator: (_, checked) =>
                      checked
                        ? Promise.resolve()
                        : Promise.reject(
                            new Error(
                              "Please accept the Privacy Policy and Terms and Conditions",
                            ),
                          ),
                  },
                ]}
                className="!mb-0"
              >
                <Checkbox className="!items-start">
                  <span className="text-sm leading-6 text-slate-700">
                    I have read and consent to my data being used in accordance
                    with the{" "}
                    <Link
                      href="/privacy-policy"
                      className="font-medium text-slate-900 underline underline-offset-2"
                    >
                      Privacy Policy
                    </Link>
                    ,{" "}
                    <Link
                      href="/terms-and-conditions"
                      className="font-medium text-slate-900 underline underline-offset-2"
                    >
                      Terms and Conditions
                    </Link>
                    .
                  </span>
                </Checkbox>
              </Form.Item>
            </div>

            <Form.Item className="!mb-0">
              <Button
                type="primary"
                htmlType="submit"
                loading={isPending}
                block
              >
                {isPending ? "Please wait..." : "Next"}
              </Button>
            </Form.Item>
            </Form>
          ) : (
            <div>
              <OtpInput
                value={otp}
                onChange={(value) => {
                  setOtp(value.replace(/\D/g, "").slice(0, 6));
                  setOtpFeedback(null);
                }}
                numInputs={6}
                inputType="tel"
                shouldAutoFocus
                skipDefaultStyles
                containerStyle="grid grid-cols-6 gap-2 sm:gap-3 mb-2"
                renderInput={(inputProps) => (
                  <input
                    {...inputProps}
                    className="h-12 min-w-0 rounded-xl border border-slate-200 bg-white text-center text-xl font-semibold text-slate-950 outline-none transition focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)] sm:h-14"
                  />
                )}
              />

              {otpFeedback ? (
                <Alert
                  className="mt-5"
                  type={otpFeedback.type}
                  message={otpFeedback.message}
                  showIcon
                />
              ) : null}

              <Button
                type="primary"
                block
                className="!mt-6"
                loading={verifyOtp.isPending || login.isPending}
                disabled={otp.length !== 6}
                onClick={handleVerifyOtp}
              >
                {login.isPending
                  ? "Opening dashboard..."
                  : verifyOtp.isPending
                    ? "Verifying..."
                    : "Verify & Continue"}
              </Button>

              <div className="mt-5 text-center text-sm text-slate-500">
                Didn&apos;t receive the code?{" "}
                <Button
                  type="link"
                  className="!h-auto !p-0 !font-semibold"
                  loading={resendOtp.isPending}
                  onClick={handleResendOtp}
                >
                  Resend OTP
                </Button>
              </div>

              {/* <div className="mt-2 text-center">
                <Button
                  type="text"
                  className="!text-slate-500"
                  onClick={() => {
                    setOtpFeedback(null);
                    setStep("details");
                  }}
                >
                  Change email
                </Button>
              </div> */}
            </div>
          )}

          <footer className="mt-7 text-center">
            <Text className="!text-sm !text-slate-500">
              Already have an account?{" "}
              <Link
                href={ROUTES.AUTH.LOGIN}
                className="font-semibold text-blue-600 hover:text-blue-700"
              >
                Login
              </Link>
            </Text>
          </footer>
        </div>
      </Card>
    </section>
  );
}

type PasswordRequirementProps = {
  symbol: string;
  label: string;
};

function PasswordRequirement({
  symbol,
  label,
}: PasswordRequirementProps) {
  return (
    <div>
      <div className="text-sm font-bold text-slate-700">
        {symbol}
      </div>

      <div className="mt-1 text-[11px] leading-4 text-slate-500 sm:text-xs">
        {label}
      </div>
    </div>
  );
}
