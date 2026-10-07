"use client";

import { useMemo, useState } from "react";
import {
  CheckCircleFilled,
  CreditCardOutlined,
  DollarOutlined,
  DownOutlined,
} from "@ant-design/icons";
import {
  App,
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
import { Landmark } from "lucide-react";

import {
  useBankTransferWithdrawal,
  useCreditDebitWithdrawal,
  useSkrillWithdrawal,
  useUsdtWithdrawal,
  useWithdrawalExchangeRate,
} from "@/hooks/useWithdrawal";

const { Title } = Typography;
const MINIMUM_WITHDRAWAL_USD = 50;

type CurrencyCode = "USD" | "EUR" | "INR";
type WithdrawalMethodId = "bank-transfer" | "card" | "skrill" | "usdt";

type WithdrawalFormValues = {
  paymentMethod: WithdrawalMethodId;
  tradingAccount: string;
  currency: CurrencyCode;
  amount: number;
};

type TradingAccount = {
  id: string;
  label: string;
  accountNumber: string;
  currency: CurrencyCode;
};

type WithdrawalMethod = {
  id: WithdrawalMethodId;
  title: string;
  processingTime: string;
  icon: React.ReactNode;
};

const tradingAccounts: TradingAccount[] = [
  {
    id: "primary-mt5",
    label: "Primary MT5 Account",
    accountNumber: "1012345678",
    currency: "USD",
  },
  {
    id: "secondary-mt5",
    label: "Secondary MT5 Account",
    accountNumber: "1012345691",
    currency: "EUR",
  },
];

const withdrawalMethods: WithdrawalMethod[] = [
  {
    id: "bank-transfer",
    title: "Bank Transfer",
    processingTime: "1–3 Business Days",
    icon: <Landmark size={28} />,
  },
  {
    id: "card",
    title: "Credit / Debit Card",
    processingTime: "Instant",
    icon: <CreditCardOutlined className="text-[28px]" />,
  },
  {
    id: "skrill",
    title: "Skrill",
    processingTime: "Instant",
    icon: <span className="text-[30px] font-bold text-fuchsia-700">S</span>,
  },
  {
    id: "usdt",
    title: "USDT (TRC20)",
    processingTime: "Instant",
    icon: (
      <div className="flex size-10 items-center justify-center rounded-full bg-emerald-500 text-lg font-bold text-white">
        ₮
      </div>
    ),
  },
];

const currencyOptions: Array<{ label: CurrencyCode; value: CurrencyCode }> = [
  { label: "USD", value: "USD" },
  { label: "EUR", value: "EUR" },
  { label: "INR", value: "INR" },
];

function formatMoney(value: number, currency: CurrencyCode) {
  const formattedValue = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

  return `${formattedValue} ${currency}`;
}

export default function WithdrawalForm() {
  const [form] = Form.useForm<WithdrawalFormValues>();
  const { message } = App.useApp();
  const [selectedMethod, setSelectedMethod] =
    useState<WithdrawalMethodId>("bank-transfer");
  const [selectedAccountId, setSelectedAccountId] = useState("primary-mt5");
  const [currency, setCurrency] = useState<CurrencyCode>("USD");
  const [amount, setAmount] = useState(0);

  const bankTransferWithdrawal = useBankTransferWithdrawal();
  const creditDebitWithdrawal = useCreditDebitWithdrawal();
  const skrillWithdrawal = useSkrillWithdrawal();
  const usdtWithdrawal = useUsdtWithdrawal();

  const selectedAccount = useMemo(
    () =>
      tradingAccounts.find((account) => account.id === selectedAccountId) ??
      tradingAccounts[0],
    [selectedAccountId],
  );
  const selectedWithdrawalMethod = useMemo(
    () =>
      withdrawalMethods.find((method) => method.id === selectedMethod) ??
      withdrawalMethods[0],
    [selectedMethod],
  );

  const {
    data: exchangeRateResponse,
    isLoading: isExchangeRateLoading,
    isError: isExchangeRateError,
  } = useWithdrawalExchangeRate({
    fromCurrency: "USD",
    toCurrency: currency,
    paymentMethod: 0,
  });
  const apiExchangeRate = exchangeRateResponse?.data;
  const exchangeRate = apiExchangeRate === 0 ? 1 : apiExchangeRate;
  const accountDeduction =
    exchangeRate !== undefined && exchangeRate > 0
      ? amount / exchangeRate
      : undefined;
  const isBelowMinimum =
    amount > 0 &&
    accountDeduction !== undefined &&
    accountDeduction < MINIMUM_WITHDRAWAL_USD;

  const handleSubmit: FormProps<WithdrawalFormValues>["onFinish"] = (values) => {
    if (accountDeduction === undefined) {
      message.error("The exchange rate is not available yet.");
      return;
    }

    if (accountDeduction < MINIMUM_WITHDRAWAL_USD) {
      message.error("The minimum withdrawal is 50.00 USD.");
      return;
    }

    const payload = {
      Withdraw_TO: 1 as const,
      paymenT_DESTINATION: selectedAccount.accountNumber,
      withdraw_AMOUNT: accountDeduction,
      currency: values.currency,
    };

    switch (values.paymentMethod) {
      case "bank-transfer":
        bankTransferWithdrawal.mutate(payload);
        break;
      case "card":
        creditDebitWithdrawal.mutate(payload);
        break;
      case "skrill":
        skrillWithdrawal.mutate(payload);
        break;
      case "usdt":
        usdtWithdrawal.mutate(payload);
        break;
    }
  };

  const isSubmitting =
    bankTransferWithdrawal.isPending ||
    creditDebitWithdrawal.isPending ||
    skrillWithdrawal.isPending ||
    usdtWithdrawal.isPending;

  return (
    <Form<WithdrawalFormValues>
      form={form}
      layout="vertical"
      requiredMark={false}
      initialValues={{
        paymentMethod: "bank-transfer",
        tradingAccount: "primary-mt5",
        currency: "USD",
      }}
      onFinish={handleSubmit}
    >
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
        <div className="flex flex-col gap-2">
          <SectionCard>
            <StepHeading number={1} title="Choose Withdrawal Method" />
            <Form.Item
              name="paymentMethod"
              rules={[{ required: true, message: "Select a withdrawal method" }]}
              className="!mb-0 !mt-2"
            >
              <Radio.Group
                value={selectedMethod}
                onChange={(event) => {
                  const method = event.target.value as WithdrawalMethodId;
                  setSelectedMethod(method);
                  form.setFieldValue("paymentMethod", method);
                }}
                className="!w-full"
              >
                <Row gutter={[12, 12]}>
                  {withdrawalMethods.map((method) => {
                    const selected = method.id === selectedMethod;
                    return (
                      <Col key={method.id} xs={24} sm={12} lg={6}>
                        <label
                          className={`relative flex min-h-[92px] cursor-pointer items-center gap-3 rounded-xl border px-3 py-3 transition ${
                            selected
                              ? "border-blue-500 bg-blue-50/40"
                              : "border-slate-200 bg-white hover:border-blue-300"
                          }`}
                        >
                          <Radio
                            value={method.id}
                            className="!absolute !right-2.5 !top-2.5"
                          />
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-blue-600">
                            {method.icon}
                          </div>
                          <div className="min-w-0 pr-5">
                            <p className="m-0 truncate text-[13px] font-semibold text-slate-950">
                              {method.title}
                            </p>
                            <p className="m-0 mt-1 truncate text-[11px] text-slate-500">
                              {method.processingTime}
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
          </SectionCard>

          <SectionCard>
            <StepHeading number={2} title="Select Trading Account" />
            <Form.Item
              name="tradingAccount"
              rules={[{ required: true, message: "Select a trading account" }]}
              className="!mb-0 !mt-2"
            >
              <Select
                value={selectedAccountId}
                onChange={(accountId) => {
                  setSelectedAccountId(accountId);
                  form.setFieldValue("tradingAccount", accountId);
                }}
                suffixIcon={<DownOutlined />}
                className="funds-control-select !w-full"
                options={tradingAccounts.map((account) => ({
                  value: account.id,
                  label: `${account.label} · ${account.accountNumber} · ${account.currency}`,
                }))}
              />
            </Form.Item>
          </SectionCard>

          <SectionCard>
            <StepHeading number={3} title="Enter Withdrawal Amount" />
            <div className="mt-2 flex flex-col gap-3 sm:flex-row">
              <Form.Item name="currency" className="!mb-0 sm:!w-[130px]">
                <Select
                  value={currency}
                  options={currencyOptions}
                  onChange={(nextCurrency: CurrencyCode) => {
                    setCurrency(nextCurrency);
                    form.setFieldValue("currency", nextCurrency);
                  }}
                  className="funds-control-select !w-full"
                />
              </Form.Item>
              <Form.Item
                name="amount"
                className="!mb-0 !flex-1"
                rules={[
                  { required: true, message: "Enter a withdrawal amount" },
                  {
                    validator: (_, value) => {
                      if (typeof value !== "number" || value <= 0) {
                        return Promise.reject(
                          new Error("Amount must be greater than zero"),
                        );
                      }

                      if (exchangeRate === undefined || exchangeRate <= 0) {
                        return Promise.resolve();
                      }

                      if (value / exchangeRate >= MINIMUM_WITHDRAWAL_USD) {
                        return Promise.resolve();
                      }

                      return Promise.reject(
                        new Error(
                          `Enter at least ${formatMoney(
                            MINIMUM_WITHDRAWAL_USD * exchangeRate,
                            currency,
                          )}`,
                        ),
                      );
                    },
                  },
                ]}
              >
                <InputNumber
                  min={0}
                  precision={2}
                  controls={false}
                  placeholder="0.00"
                  onChange={(value) => setAmount(typeof value === "number" ? value : 0)}
                  className="funds-amount-input !w-full"
                  styles={{ input: { fontSize: 18, fontWeight: 600 } }}
                />
              </Form.Item>
            </div>

            <div className="mt-3 rounded-xl bg-gradient-to-r from-violet-50 via-white to-blue-50 px-4 py-3 shadow-[0_1px_4px_rgba(76,29,149,0.04)]">
              <div className="grid gap-4 sm:grid-cols-3 sm:items-center">
                <ConversionValue label="Account deduction">
                  {formatMoney(accountDeduction ?? 0, "USD")}
                </ConversionValue>
                <div className="sm:text-center">
                  <ConversionLabel>Exchange rate</ConversionLabel>
                  <p className="m-0 mt-1 text-sm font-bold text-violet-700">
                    {isExchangeRateLoading && "Loading..."}
                    {isExchangeRateError && "Rate unavailable"}
                    {!isExchangeRateLoading &&
                      !isExchangeRateError &&
                      exchangeRate !== undefined &&
                      `1 USD = ${exchangeRate.toLocaleString("en-US", {
                        maximumFractionDigits: 8,
                      })} ${currency}`}
                  </p>
                </div>
                <ConversionValue
                  label="You receive"
                  alignRight
                  highlight
                  danger={isBelowMinimum}
                >
                  {formatMoney(amount, currency)}
                </ConversionValue>
              </div>

              {isBelowMinimum && exchangeRate !== undefined && (
                <p className="m-0 mt-2 border-t border-red-100 pt-2 text-xs font-medium text-red-600">
                  Minimum withdrawal is 50.00 USD (
                  {formatMoney(
                    MINIMUM_WITHDRAWAL_USD * exchangeRate,
                    currency,
                  )}
                  ).
                </p>
              )}
            </div>
          </SectionCard>

          <Button
            type="primary"
            htmlType="submit"
            block
            loading={isSubmitting}
            className="!h-14 !rounded-xl !text-base !font-semibold"
          >
            Withdraw Funds
          </Button>
        </div>

        <WithdrawalSummary
          account={selectedAccount}
          method={selectedWithdrawalMethod}
          accountDeduction={accountDeduction ?? 0}
          amount={amount}
          currency={currency}
          isBelowMinimum={isBelowMinimum}
        />
      </div>
    </Form>
  );
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <Card
      bordered={false}
      className="!rounded-2xl !border-0 !bg-white !shadow-[0_1px_4px_rgba(76,29,149,0.04)]"
      styles={{ body: { padding: 10 } }}
    >
      {children}
    </Card>
  );
}

function StepHeading({ number, title }: { number: number; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
        {number}
      </span>
      <h2 className="m-0 text-sm font-semibold text-slate-950 sm:text-base">{title}</h2>
    </div>
  );
}

function ConversionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="m-0 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
      {children}
    </p>
  );
}

function ConversionValue({
  label,
  children,
  alignRight = false,
  highlight = false,
  danger = false,
}: {
  label: string;
  children: React.ReactNode;
  alignRight?: boolean;
  highlight?: boolean;
  danger?: boolean;
}) {
  return (
    <div className={alignRight ? "sm:text-right" : undefined}>
      <ConversionLabel>{label}</ConversionLabel>
      <p
        className={`m-0 mt-1 text-base font-bold ${
          danger
            ? "text-red-600"
            : highlight
              ? "text-emerald-600"
              : "text-slate-950"
        }`}
      >
        {children}
      </p>
    </div>
  );
}

function WithdrawalSummary({
  account,
  method,
  accountDeduction,
  amount,
  currency,
  isBelowMinimum,
}: {
  account: TradingAccount;
  method: WithdrawalMethod;
  accountDeduction: number;
  amount: number;
  currency: CurrencyCode;
  isBelowMinimum: boolean;
}) {
  return (
    <Card
      bordered={false}
      className="h-fit overflow-hidden !rounded-2xl !border-0 !bg-[linear-gradient(145deg,#071a38_0%,#06152f_55%,#0b2f68_100%)] shadow-[0_20px_60px_rgba(6,21,47,0.22)]"
      styles={{ body: { padding: 24 } }}
    >
      <div className="flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-xl bg-blue-500/20 text-blue-300">
          <DollarOutlined className="text-xl" />
        </div>
        <Title level={4} className="!mb-0 !text-white">
          Withdrawal Summary
        </Title>
      </div>
      <div className="mt-6 space-y-4">
        <SummaryRow
          label="Trading Account"
          value={`${account.label} · ${account.accountNumber} · ${account.currency}`}
        />
        <SummaryDivider />
        <SummaryRow label="Withdrawal Method" value={method.title} />
        <SummaryRow label="Account Deduction" value={formatMoney(accountDeduction, "USD")} />
        <SummaryDivider />
        <SummaryRow
          label="You Receive"
          value={
            <span
              className={`text-lg ${
                isBelowMinimum ? "text-red-400" : "text-emerald-400"
              }`}
            >
              {formatMoney(amount, currency)}
            </span>
          }
        />
      </div>
    </Card>
  );
}

function SummaryRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-5">
      <span className="text-sm text-slate-300">{label}</span>
      <div className="max-w-[220px] text-right text-sm font-semibold text-white">{value}</div>
    </div>
  );
}

function SummaryDivider() {
  return <div className="h-px bg-white/10" />;
}
