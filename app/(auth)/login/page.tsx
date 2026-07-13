// app/(auth)/login/page.tsx

"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { LoginFormValues } from "@/types/auth";
import {
  AppleFilled,
  EyeInvisibleOutlined,
  EyeTwoTone,
  LockOutlined,
  MailOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Checkbox,
  ConfigProvider,
  Divider,
  Form,
  Input,
  Typography,
} from "antd";

import { ROUTES } from "@/constants/routes";

const { Title, Text } = Typography;

function GoogleIcon() {
  return (
    <svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      className="shrink-0"
    >
      <path
        fill="#4285F4"
        d="M21.6 12.23c0-.71-.06-1.4-.18-2.06H12v3.9h5.38a4.6 4.6 0 0 1-2 3.02v2.53h3.24c1.9-1.75 2.98-4.33 2.98-7.39Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.97-.9 6.62-2.38l-3.24-2.53c-.9.6-2.05.96-3.38.96-2.6 0-4.8-1.76-5.6-4.12H3.05v2.61A10 10 0 0 0 12 22Z"
      />
      <path
        fill="#FBBC05"
        d="M6.4 13.93A6.02 6.02 0 0 1 6.08 12c0-.67.12-1.32.32-1.93V7.46H3.05A10 10 0 0 0 2 12c0 1.62.39 3.15 1.05 4.54l3.35-2.61Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.95c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.65 9.65 0 0 0 12 2a10 10 0 0 0-8.95 5.46l3.35 2.61c.8-2.36 3-4.12 5.6-4.12Z"
      />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();

  function handleSubmit(values: LoginFormValues) {
    console.log("Form submitted with values:", values);

    // Replace this with your login API request.
   // router.push(redirectTo || ROUTES.AUTH.dashboard);
  }

  function handleGoogleLogin() {
    console.log("Continue with Google");
  }

  function handleAppleLogin() {
    console.log("Continue with Apple");
  }

 return (
    <section className="flex w-full max-w-[600px] items-center justify-center rounded-[28px] bg-[#f8fafc]">
      <Card
        bordered={false}
        className="w-full overflow-hidden !rounded-[26px] !bg-white "
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
        <div className="bg-white px-6 py-4 sm:px-8 sm:py-8 shadow-lg">
          <header className="mb-8">
            <Title
              level={1}
              className="!mb-2 !text-[30px] !font-bold !leading-tight !tracking-[-0.03em] !text-slate-950 sm:!text-[34px]"
            >
              Welcome Back!
            </Title>

            <Text className="!text-[15px] !text-slate-500 sm:!text-base">
              Sign in to access your trading dashboard
            </Text>
          </header>

          <Form<LoginFormValues>
            layout="vertical"
            requiredMark={false}
            initialValues={{
              remember: true,
            }}
            onFinish={handleSubmit}
          >
            <Form.Item
              label="Email Address"
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
                prefix={
                  <MailOutlined className="mr-2 text-lg text-slate-400" />
                }
                placeholder="Enter your email"
                autoComplete="email"
              />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[
                {
                  required: true,
                  message: "Please enter your password",
                },
              ]}
              className="!mb-4"
            >
              <Input.Password
                prefix={
                  <LockOutlined className="mr-2 text-lg text-slate-400" />
                }
                placeholder="Enter your password"
                autoComplete="current-password"
                iconRender={(visible) =>
                  visible ? (
                    <EyeTwoTone twoToneColor="#64748b" />
                  ) : (
                    <EyeInvisibleOutlined className="text-slate-500" />
                  )
                }
              />
            </Form.Item>

            <div className="mb-8 flex items-center justify-between gap-4">
              <Form.Item
                name="remember"
                valuePropName="checked"
                noStyle
              >
                <Checkbox className="!text-sm !text-slate-600">
                  Remember me
                </Checkbox>
              </Form.Item>

              <Link
                href={ROUTES.AUTH.FORGOT_PASSWORD}
                className="whitespace-nowrap text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Forgot Password?
              </Link>
            </div>

            <Form.Item className="!mb-0">
              <Button
                type="primary"
                htmlType="submit"
                block
                className=""
              >
                Sign In
              </Button>
            </Form.Item>
          </Form>

          <Divider plain className="!my-8 !text-sm !text-slate-400">
            or continue with
          </Divider>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Button
              icon={<GoogleIcon />}
              onClick={handleGoogleLogin}
              className="!flex !h-[54px] !items-center !justify-center !border-slate-200 !bg-white !text-sm !text-slate-900"
            >
              Continue with Google
            </Button>

            <Button
              icon={<AppleFilled className="text-xl" />}
              onClick={handleAppleLogin}
              className="!flex !h-[54px] !items-center !justify-center !border-slate-200 !bg-white !text-sm !text-slate-900"
            >
              Continue with Apple
            </Button>
          </div>

          <footer className="mt-9 text-center">
            <Text className="!text-sm !text-slate-500">
              Don&apos;t have an account?{" "}
              <Link
                href={ROUTES.AUTH.REGISTER}
                className="font-medium text-blue-600 hover:text-blue-700"
              >
                Create Account
              </Link>
            </Text>
          </footer>
        </div>
      </Card>
    </section>
);
}