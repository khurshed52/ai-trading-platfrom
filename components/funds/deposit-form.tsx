"use client";

import { useMemo, useState } from "react";
import {
  BankOutlined,
  CheckCircleFilled,
  CreditCardOutlined,
  DollarOutlined,
  DownOutlined,
  LockOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Form,
  InputNumber,
  Radio,
  Row,
  Select,
  Typography,
} from "antd";
import type { FormProps } from "antd";
import {
  Landmark,
  WalletCards,
} from "lucide-react";

const { Text, Title } = Typography;

type CurrencyCode = "USD" | "EUR";

type DepositMethodId =
  | "bank-transfer"
  | "card"
  | "usdt" 
  | "skrill"
  | "bitcoin";

type DepositFormValues = {
  paymentMethod: DepositMethodId;
  tradingAccount: string;
  currency: CurrencyCode;
  amount: number;
};

type TradingAccount = {
  id: string;
  label: string;
  accountNumber: string;
  accountType: string;
  currency: CurrencyCode;
  equity: number;
  balance: number;
};

type DepositMethod = {
  id: DepositMethodId;
  title: string;
  processingTime: string;
  feeLabel: string;
  feePercentage: number;
  icon: React.ReactNode;
  recommended?: boolean;
};

const tradingAccounts: TradingAccount[] = [
  {
    id: "primary-mt5",
    label: "Primary MT5 Account",
    accountNumber: "1012345678",
    accountType: "MT5",
    currency: "USD",
    equity: 24850.75,
    balance: 24850.75,
  },
  {
    id: "secondary-mt5",
    label: "Secondary MT5 Account",
    accountNumber: "1012345691",
    accountType: "MT5",
    currency: "EUR",
    equity: 12840.45,
    balance: 12100.2,
  },
];

const depositMethods: DepositMethod[] = [
  {
    id: "bank-transfer",
    title: "Bank Transfer",
    processingTime: "1–3 Business Days",
    feeLabel: "No Fees",
    feePercentage: 0,
    icon: <Landmark size={28} />,
    recommended: false,
  },
  {
    id: "card",
    title: "Credit / Debit Card",
    processingTime: "Instant",
    feeLabel: "2.5% Fee",
    feePercentage: 2.5,
    icon: <CreditCardOutlined className="text-[28px]" />,
  },
  {
    id: "skrill",
    title: "Skrill",
    processingTime: "Instant",
    feeLabel: "1.0% Fee",
    feePercentage: 1,
    icon: (
      <span className="text-[30px] font-bold text-fuchsia-700">
        S
      </span>
    ),
  },
  {
    id: "usdt",
    title: "USDT (TRC20)",
    processingTime: "Instant",
    feeLabel: "No Fees",
    feePercentage: 0,
    icon: (
      <div className="flex size-10 items-center justify-center rounded-full bg-emerald-500 text-lg font-bold text-white">
        ₮
      </div>
    ),
  },
];

const currencyOptions = [
  {
    label: "USD",
    value: "USD",
  },
  {
    label: "EUR",
    value: "EUR",
  },
];

function formatMoney(
  value: number,
  currency: CurrencyCode,
) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export default function DepositForm() {
  const [form] = Form.useForm<DepositFormValues>();

  const [selectedMethod, setSelectedMethod] =
    useState<DepositMethodId>("bank-transfer");

  const [selectedAccountId, setSelectedAccountId] =
    useState("primary-mt5");

  const [currency, setCurrency] =
    useState<CurrencyCode>("USD");

  const [amount, setAmount] = useState(0);

  const selectedAccount = useMemo(
    () =>
      tradingAccounts.find(
        (account) => account.id === selectedAccountId,
      ) ?? tradingAccounts[0],
    [selectedAccountId],
  );

  const selectedDepositMethod = useMemo(
    () =>
      depositMethods.find(
        (method) => method.id === selectedMethod,
      ) ?? depositMethods[0],
    [selectedMethod],
  );

  const feeAmount =
    amount *
    (selectedDepositMethod.feePercentage / 100);

  const receiveAmount = Math.max(
    amount - feeAmount,
    0,
  );

  const handleSubmit: FormProps<DepositFormValues>["onFinish"] = (
    values,
  ) => {
    const payload = {
      ...values,
      amount,
      fee: feeAmount,
      receiveAmount,
      account: selectedAccount,
      method: selectedDepositMethod,
    };

    console.log("Deposit payload:", payload);

    // Call your payment/deposit API here.
  };

  return (
    <Form<DepositFormValues>
      form={form}
      layout="vertical"
      requiredMark={false}
      initialValues={{
        paymentMethod: "bank-transfer",
        tradingAccount: "primary-mt5",
        currency: "USD",
        amount: undefined,
      }}
      onFinish={handleSubmit}
    >
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
        <div className="space-y-4">
          <DepositMethodSection
            selectedMethod={selectedMethod}
            onChange={(method) => {
              setSelectedMethod(method);

              form.setFieldValue(
                "paymentMethod",
                method,
              );
            }}
          />

          <TradingAccountSection
            selectedAccountId={selectedAccountId}
            selectedAccount={selectedAccount}
            onChange={(accountId) => {
              const account =
                tradingAccounts.find(
                  (item) =>
                    item.id === accountId,
                );

              setSelectedAccountId(accountId);

              form.setFieldValue(
                "tradingAccount",
                accountId,
              );

              if (account) {
                setCurrency(account.currency);

                form.setFieldValue(
                  "currency",
                  account.currency,
                );
              }
            }}
          />

          <DepositAmountSection
            currency={currency}
            amount={amount}
            onCurrencyChange={(nextCurrency) => {
              setCurrency(nextCurrency);

              form.setFieldValue(
                "currency",
                nextCurrency,
              );
            }}
            onAmountChange={(nextAmount) => {
              setAmount(nextAmount);

              form.setFieldValue(
                "amount",
                nextAmount,
              );
            }}
          />

          <Button
            type="primary"
            htmlType="submit"
            block
            icon={<LockOutlined />}
            className="!h-14 !rounded-xl !text-base !font-semibold"
          >
            Add Balance
          </Button>
        </div>

        <DepositSummary
          account={selectedAccount}
          method={selectedDepositMethod}
          amount={amount}
          fee={feeAmount}
          receiveAmount={receiveAmount}
          currency={currency}
        />
      </div>
    </Form>
  );
}

type DepositMethodSectionProps = {
  selectedMethod: DepositMethodId;
  onChange: (method: DepositMethodId) => void;
};

function DepositMethodSection({
  selectedMethod,
  onChange,
}: DepositMethodSectionProps) {
  return (
    <Card
      bordered={false}
      className="!rounded-2xl !border !border-slate-200 !bg-white"
      styles={{
        body: {
          padding: 20,
        },
      }}
    >
      <StepHeading
        number={1}
        title="Choose Deposit Method"
      />

      <Form.Item
        name="paymentMethod"
        rules={[
          {
            required: true,
            message: "Please select a deposit method",
          },
        ]}
        className="!mb-0 !mt-4"
      >
        <Radio.Group
          value={selectedMethod}
          onChange={(event) =>
            onChange(
              event.target.value as DepositMethodId,
            )
          }
          className="!w-full"
        >
          <Row gutter={[12, 12]}>
            {depositMethods.map((method) => {
              const selected =
                method.id === selectedMethod;

              return (
                <Col
                  key={method.id}
                  xs={24}
                  sm={12}
                  lg={6}
                >
                  <label
                    className={[
                      "relative flex min-h-[92px] cursor-pointer items-center gap-3 rounded-xl border px-3 py-3 transition",
                      selected
                        ? "border-blue-500 bg-blue-50/40 shadow-[0_8px_25px_rgba(37,99,235,0.08)]"
                        : "border-slate-200 bg-white hover:border-blue-300",
                    ].join(" ")}
                  >
                    <Radio
                      value={method.id}
                      className="!absolute !right-2.5 !top-2.5"
                    />

                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-blue-600">
                      {method.icon}
                    </div>

                    <div className="min-w-0 pr-5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <p className="m-0 truncate text-[13px] font-semibold text-slate-950">
                          {method.title}
                        </p>

                        {method.recommended && (
                          <span className="rounded-full bg-blue-50 px-1.5 py-0.5 text-[8px] font-semibold text-blue-600">
                            Recommended
                          </span>
                        )}
                      </div>

                      <p className="m-0 mt-1 truncate text-[11px] text-slate-500">
                        {method.processingTime}
                      </p>

                      <p className="m-0 mt-1 truncate text-[11px] text-slate-500">
                        {method.feeLabel}
                      </p>
                    </div>

                    {selected && (
                      <CheckCircleFilled className="absolute right-2.5 top-2.5 text-blue-600" />
                    )}
                  </label>
                </Col>
              );
            })}
          </Row>
        </Radio.Group>
      </Form.Item>
    </Card>
  );
}

type TradingAccountSectionProps = {
  selectedAccountId: string;
  selectedAccount: TradingAccount;
  onChange: (accountId: string) => void;
};

function TradingAccountSection({
  selectedAccountId,
  selectedAccount,
  onChange,
}: TradingAccountSectionProps) {
  return (
    <Card
      bordered={false}
      className="!rounded-2xl !border !border-slate-200 !bg-white shadow-[0_12px_40px_rgba(15,23,42,0.05)]"
      styles={{
        body: {
          padding: 20,
        },
      }}
    >
      <StepHeading
        number={2}
        title="Select Trading Account"
      />

      <Form.Item
        name="tradingAccount"
        rules={[
          {
            required: true,
            message:
              "Please select a trading account",
          },
        ]}
        className="!mb-0 !mt-5"
      >
        <Select
          value={selectedAccountId}
          onChange={onChange}
          suffixIcon={<DownOutlined />}
          className="deposit-account-select !h-auto !w-full"
          optionLabelProp="label"
          options={tradingAccounts.map(
            (account) => ({
              value: account.id,
              label: (
                <AccountSelectValue
                  account={account}
                />
              ),
              searchLabel: `${account.label} ${account.accountNumber}`,
            }),
          )}
          optionRender={(option) => {
            const account =
              tradingAccounts.find(
                (item) =>
                  item.id === option.value,
              );

            if (!account) {
              return null;
            }

            return (
              <div className="py-1">
                <AccountSelectValue
                  account={account}
                />
              </div>
            );
          }}
        />
      </Form.Item>
    </Card>
  );
}

function AccountSelectValue({
  account,
}: {
  account: TradingAccount;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3 py-1">
      <div className="min-w-0">
        <p className="m-0 truncate text-sm font-semibold text-slate-950">
          {account.label}
        </p>

        <p className="m-0 mt-0.5 text-xs text-slate-500">
          {account.accountNumber} ·{" "}
          {account.currency}
        </p>
      </div>
    </div>
  );
}

type DepositAmountSectionProps = {
  currency: CurrencyCode;
  amount: number;
  onCurrencyChange: (
    currency: CurrencyCode,
  ) => void;
  onAmountChange: (amount: number) => void;
};

function DepositAmountSection({
  currency,
  amount,
  onCurrencyChange,
  onAmountChange,
}: DepositAmountSectionProps) {
  return (
    <Card
      bordered={false}
      className="!rounded-2xl !border !border-slate-200 !bg-white shadow-[0_12px_40px_rgba(15,23,42,0.05)]"
      styles={{
        body: {
          padding: 20,
        },
      }}
    >
      <StepHeading
        number={3}
        title="Enter Deposit Amount"
      />

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <Form.Item
          name="currency"
          className="!mb-0 sm:!w-[130px]"
        >
          <Select
            value={currency}
            options={currencyOptions}
            onChange={onCurrencyChange}
            className="!h-14 !w-full"
          />
        </Form.Item>

        <Form.Item
          name="amount"
          className="!mb-0 !flex-1"
          rules={[
            {
              required: true,
              message:
                "Please enter a deposit amount",
            },
            {
              validator: (_, value) => {
                if (
                  typeof value === "number" &&
                  value >= 10
                ) {
                  return Promise.resolve();
                }

                return Promise.reject(
                  new Error(
                    "Minimum deposit amount is 10",
                  ),
                );
              },
            },
          ]}
        >
          <InputNumber
            value={amount || undefined}
            min={0}
            precision={2}
            controls={false}
            placeholder="0.00"
            onChange={(value) =>
              onAmountChange(
                typeof value === "number"
                  ? value
                  : 0,
              )
            }
            className="!h-14 !w-full"
            styles={{
              input: {
                height: 54,
                fontSize: 18,
                fontWeight: 600,
              },
            }}
          />
        </Form.Item>
      </div>
    </Card>
  );
}

type DepositSummaryProps = {
  account: TradingAccount;
  method: DepositMethod;
  amount: number;
  fee: number;
  receiveAmount: number;
  currency: CurrencyCode;
};

function DepositSummary({
  account,
  method,
  amount,
  fee,
  receiveAmount,
  currency,
}: DepositSummaryProps) {
  return (
    <div className="space-y-4">
      <Card
        bordered={false}
        className="overflow-hidden !rounded-2xl !border-0 !bg-[linear-gradient(145deg,#071a38_0%,#06152f_55%,#0b2f68_100%)] shadow-[0_20px_60px_rgba(6,21,47,0.22)]"
        styles={{
          body: {
            padding: 24,
          },
        }}
      >
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-blue-500/20 text-blue-300">
            <DollarOutlined className="text-xl" />
          </div>

          <Title
            level={4}
            className="!mb-0 !text-white"
          >
            Deposit Summary
          </Title>
        </div>

        <div className="mt-6 space-y-4">
          <SummaryRow
            label="Trading Account"
            value={
              <div className="text-right">
                <p className="m-0 font-semibold text-white">
                  {account.label}
                </p>

                <p className="m-0 mt-1 text-xs text-slate-400">
                  {account.accountNumber} ·{" "}
                  {account.currency}
                </p>
              </div>
            }
          />

          <SummaryDivider />

          <SummaryRow
            label="Deposit Method"
            value={method.title}
          />

          <SummaryRow
            label="Amount"
            value={formatMoney(
              amount,
              currency,
            )}
          />

          <SummaryRow
            label="Fees"
            value={formatMoney(fee, currency)}
          />

          <SummaryDivider />

          <SummaryRow
            label="You Will Receive"
            value={
              <span className="text-lg font-bold text-emerald-400">
                {formatMoney(
                  receiveAmount,
                  currency,
                )}
              </span>
            }
          />
        </div>


      </Card>

      <Card
        bordered={false}
        className="!rounded-2xl !border !border-emerald-100 !bg-emerald-50/70"
        styles={{
          body: {
            padding: 20,
          },
        }}
      >
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
            <LockOutlined />
          </div>

          <div>
            <p className="m-0 text-sm font-semibold text-emerald-900">
              Your funds are safe with us
            </p>

            <p className="m-0 mt-2 text-xs leading-5 text-emerald-800">
              We use bank-level security and
              encryption to protect your financial
              information.
            </p>
          </div>
        </div>
      </Card>

      <Card
        bordered={false}
        className="!rounded-2xl !border !border-violet-100 !bg-violet-50/60"
        styles={{
          body: {
            padding: 20,
          },
        }}
      >

      </Card>
    </div>
  );
}

function StepHeading({
  number,
  title,
}: {
  number: number;
  title: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
        {number}
      </span>

      <h2 className="m-0 text-sm font-semibold text-slate-950 sm:text-base">
        {title}
      </h2>
    </div>
  );
}

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-5">
      <span className="text-sm text-slate-300">
        {label}
      </span>

      <div className="text-right text-sm font-semibold text-white">
        {value}
      </div>
    </div>
  );
}

function SummaryDivider() {
  return (
    <div className="h-px bg-white/10" />
  );
}

function FundMetricIcon() {
  return (
    <div className="flex items-center gap-0.5">
      <span className="h-3 w-1 rounded-full bg-blue-400" />
      <span className="h-5 w-1 rounded-full bg-blue-500" />
      <span className="h-7 w-1 rounded-full bg-blue-600" />
    </div>
  );
}