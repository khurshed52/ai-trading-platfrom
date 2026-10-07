"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeftOutlined,
  LockOutlined,
  MailOutlined,
} from "@ant-design/icons";
import { Alert, Button, Card, Form, Input, Typography } from "antd";
import OtpInput from "react-otp-input";

import { ROUTES } from "@/constants/routes";
import {
  useRequestPasswordReset,
  useResendResetOtp,
  useResetPassword,
  useVerifyResetOtp,
} from "@/hooks/useAuth";

const { Title, Text } = Typography;

type ForgotPasswordStep = "email" | "otp" | "password";

type ForgotPasswordFormValues = {
  email: string;
};

type ResetPasswordFormValues = {
  newPassword: string;
  confirmPassword: string;
};

type Feedback = {
  type: "success" | "error";
  message: string;
};

const stepContent: Record<
  ForgotPasswordStep,
  { title: string; description: string }
> = {
  email: {
    title: "Forgot password?",
    description:
      "Enter the email address associated with your account. We will send you a verification code.",
  },
  otp: {
    title: "Verify your email",
    description: "Enter the 6-digit verification code sent to your email.",
  },
  password: {
    title: "Create new password",
    description: "Choose a strong password for your account.",
  },
};

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [emailForm] = Form.useForm<ForgotPasswordFormValues>();
  const [passwordForm] = Form.useForm<ResetPasswordFormValues>();
  const [step, setStep] = useState<ForgotPasswordStep>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const requestReset = useRequestPasswordReset();
  const verifyOtp = useVerifyResetOtp();
  const resendOtp = useResendResetOtp();
  const updatePassword = useResetPassword();
  const content = stepContent[step];

  function handleEmailSubmit(values: ForgotPasswordFormValues) {
    setFeedback(null);
    requestReset.mutate(values, {
      onSuccess: () => {
        setEmail(values.email);
        setOtp("");
        setStep("otp");
      },
      onError: (error) => {
        setFeedback({ type: "error", message: error.message });
      },
    });
  }

  function handleVerifyOtp() {
    if (otp.length !== 6) {
      setFeedback({
        type: "error",
        message: "Enter the complete 6-digit verification code.",
      });
      return;
    }

    setFeedback(null);
    verifyOtp.mutate(
      { email, otp },
      {
        onSuccess: (response) => {
          const token = response.data?.resetToken;

          if (!token) {
            setFeedback({
              type: "error",
              message: "The reset token was not returned. Please request a new code.",
            });
            return;
          }

          setResetToken(token);
          setStep("password");
        },
        onError: (error) => {
          setFeedback({ type: "error", message: error.message });
        },
      },
    );
  }

  function handleResendOtp() {
    setFeedback(null);
    resendOtp.mutate(
      { email },
      {
        onSuccess: (response) => {
          setOtp("");
          setFeedback({
            type: "success",
            message: response.message || "A new OTP has been sent successfully.",
          });
        },
        onError: (error) => {
          setFeedback({ type: "error", message: error.message });
        },
      },
    );
  }

  function handlePasswordSubmit(values: ResetPasswordFormValues) {
    if (!resetToken) {
      setFeedback({
        type: "error",
        message: "Your reset session is missing. Please request another code.",
      });
      return;
    }

    setFeedback(null);
    updatePassword.mutate(
      { resetToken, newPassword: values.newPassword },
      {
        onSuccess: () => {
          router.replace(ROUTES.AUTH.LOGIN);
        },
        onError: (error) => {
          setFeedback({ type: "error", message: error.message });
        },
      },
    );
  }

  function returnToEmailStep() {
    setOtp("");
    setResetToken("");
    setFeedback(null);
    setStep("email");
  }

  return (
    <section className="flex w-full max-w-[600px] items-center justify-center rounded-[28px] bg-[#f8fafc]">
      <Card
        bordered={false}
        className="w-full overflow-hidden !rounded-[26px] !bg-white"
        styles={{
          root: { backgroundColor: "#ffffff" },
          body: { padding: 0, backgroundColor: "#ffffff" },
        }}
      >
        <div className="bg-white px-6 py-8 shadow-lg sm:px-9 sm:py-10">
          <header className="mb-8">
            <div className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              {step === "password" ? (
                <LockOutlined className="text-2xl" />
              ) : (
                <MailOutlined className="text-2xl" />
              )}
            </div>

            <Title
              level={1}
              className="!mb-2 !text-[30px] !font-bold !leading-tight !tracking-[-0.03em] !text-slate-950 sm:!text-[34px]"
            >
              {content.title}
            </Title>

            <Text className="!block !max-w-[460px] !text-[15px] !leading-6 !text-slate-500 sm:!text-base">
              {content.description}
            </Text>

            {step === "otp" ? (
              <Text className="!mt-1 !block !font-semibold !text-slate-800">
                {email}
              </Text>
            ) : null}
          </header>

          {step === "email" ? (
            <Form<ForgotPasswordFormValues>
              form={emailForm}
              layout="vertical"
              requiredMark={false}
              onFinish={handleEmailSubmit}
            >
              <Form.Item
                label="Email Address"
                name="email"
                rules={[
                  { required: true, message: "Please enter your email address" },
                  { type: "email", message: "Please enter a valid email address" },
                ]}
              >
                <Input
                  prefix={<MailOutlined className="mr-2 text-lg text-slate-400" />}
                  placeholder="Enter your email"
                  autoComplete="email"
                />
              </Form.Item>

              {feedback ? (
                <Alert type={feedback.type} message={feedback.message} showIcon />
              ) : null}

              <Form.Item className="!mb-0 !mt-7">
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  loading={requestReset.isPending}
                >
                  Next
                </Button>
              </Form.Item>
            </Form>
          ) : null}

          {step === "otp" ? (
            <div>
              <OtpInput
                value={otp}
                onChange={(value) => {
                  setOtp(value.replace(/\D/g, "").slice(0, 6));
                  setFeedback(null);
                }}
                numInputs={6}
                inputType="tel"
                shouldAutoFocus
                skipDefaultStyles
                containerStyle="grid grid-cols-6 gap-2 sm:gap-3"
                renderInput={(inputProps) => (
                  <input
                    {...inputProps}
                    className="h-12 min-w-0 rounded-xl border border-slate-200 bg-white text-center text-xl font-semibold text-slate-950 outline-none transition focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)] sm:h-14"
                  />
                )}
              />

              {feedback ? (
                <Alert
                  className="mt-5"
                  type={feedback.type}
                  message={feedback.message}
                  showIcon
                />
              ) : null}

              <Button
                type="primary"
                block
                className="!mt-6"
                loading={verifyOtp.isPending}
                disabled={otp.length !== 6}
                onClick={handleVerifyOtp}
              >
                Verify OTP
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
                  onClick={returnToEmailStep}
                >
                  Change email
                </Button>
              </div> */}
            </div>
          ) : null}

          {step === "password" ? (
            <Form<ResetPasswordFormValues>
              form={passwordForm}
              layout="vertical"
              requiredMark={false}
              onFinish={handlePasswordSubmit}
            >
              <Form.Item
                label="New Password"
                name="newPassword"
                rules={passwordRules}
              >
                <Input.Password
                  prefix={<LockOutlined className="mr-2 text-lg text-slate-400" />}
                  placeholder="Enter your new password"
                  autoComplete="new-password"
                />
              </Form.Item>

              <Form.Item
                label="Confirm Password"
                name="confirmPassword"
                dependencies={["newPassword"]}
                rules={[
                  { required: true, message: "Please confirm your new password" },
                  ({ getFieldValue }) => ({
                    validator: (_, value) =>
                      !value || getFieldValue("newPassword") === value
                        ? Promise.resolve()
                        : Promise.reject(new Error("Passwords do not match")),
                  }),
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined className="mr-2 text-lg text-slate-400" />}
                  placeholder="Confirm your new password"
                  autoComplete="new-password"
                />
              </Form.Item>

              {feedback ? (
                <Alert type={feedback.type} message={feedback.message} showIcon />
              ) : null}

              <Form.Item className="!mb-0 !mt-7">
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  loading={updatePassword.isPending}
                >
                  Reset Password
                </Button>
              </Form.Item>
            </Form>
          ) : null}

          <footer className="mt-8 text-center">
            <Link
              href={ROUTES.AUTH.LOGIN}
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
            >
              <ArrowLeftOutlined />
              Back to Login
            </Link>
          </footer>
        </div>
      </Card>
    </section>
  );
}

const passwordRules = [
  { required: true, message: "Please enter your new password" },
  { min: 8, message: "Password must contain at least 8 characters" },
  { max: 30, message: "Password cannot exceed 30 characters" },
  { pattern: /[A-Z]/, message: "Password must include an uppercase letter" },
  { pattern: /[a-z]/, message: "Password must include a lowercase letter" },
  { pattern: /\d/, message: "Password must include a number" },
  { pattern: /[^A-Za-z0-9]/, message: "Password must include a symbol" },
];
