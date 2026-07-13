// app/(auth)/register/page.tsx

"use client";

import Link from "next/link";
import { Button, Card, Checkbox, Form, Input, Typography } from "antd";
import { ROUTES } from "@/constants/routes";
import type { RegisterFormValues } from "@/types/auth";
import PhoneNumberInput from "@/components/form/phone-number-input";

const { Title, Text } = Typography;

export default function RegisterPage() {
const [form] = Form.useForm<RegisterFormValues>();

  function handleSubmit(values: RegisterFormValues) {
    console.log("Register form submitted:", values);
    form.resetFields();
    // Replace with your register API request.
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
              Trade with us
            </Title>

            <Text className="!text-[15px] !text-slate-500 sm:!text-base">
              Create an account and start trading
            </Text>
          </header>

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
                rules={[
                {
                    required: true,
                    message: "Please enter your phone number",
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
                block
              >
                Next
              </Button>
            </Form.Item>
          </Form>

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