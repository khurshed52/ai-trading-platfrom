"use client";

import { useMemo, useState } from "react";
import { DollarOutlined, DownOutlined, LockOutlined } from "@ant-design/icons";
import {
  Alert,
  Button,
  Card,
  Empty,
  Form,
  InputNumber,
  Modal,
  Result,
  Select,
  Skeleton,
  Tag,
  Typography,
} from "antd";
import type { FormProps } from "antd";
import { useRouter } from "next/navigation";

import { ROUTES } from "@/constants/routes";
import { useAllTradingAccounts } from "@/hooks/useAccounts";
import { useDepositExchangeRate } from "@/hooks/useDeposit";
import { useUserDetail } from "@/hooks/useUser";
import { useWithdrawalFlow } from "@/hooks/useWithdrawalFlow";
import type { TradingAccount } from "@/types/accounts";
import type { WithdrawalResponse } from "@/types/withdrawal";

const { Title } = Typography;
type CurrencyCode = "USD" | "EUR" | "INR";

type WithdrawalFormValues = {
  accountNumber: string;
  payoutCurrency: CurrencyCode;
  amount: number;
};

const currencyOptions: Array<{ label: CurrencyCode; value: CurrencyCode }> = [
  { label: "USD", value: "USD" },
  { label: "EUR", value: "EUR" },
  { label: "INR", value: "INR" },
];

function formatMoney(value: number | string, currency: string) {
  const amount = Number(value);
  const formatted = Number.isFinite(amount)
    ? amount.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : "0.00";
  return `${formatted} ${currency}`;
}

function parseRate(value: string | undefined) {
  const rate = Number(value);
  return Number.isFinite(rate) && rate > 0 ? rate : undefined;
}

export default function WithdrawalForm() {
  const router = useRouter();
  const [form] = Form.useForm<WithdrawalFormValues>();
  const accountsQuery = useAllTradingAccounts();
  const userQuery = useUserDetail();
  const withdrawal = useWithdrawalFlow(userQuery.data?.data.id);
  const [selectedAccountNumber, setSelectedAccountNumber] = useState("");
  const [payoutCurrency, setPayoutCurrency] = useState<CurrencyCode>("USD");
  const [amount, setAmount] = useState(0);

  const accounts = useMemo(
    () =>
      (accountsQuery.data?.data ?? []).filter(
        (account) => account.status.trim().toUpperCase() === "ACTIVE",
      ),
    [accountsQuery.data?.data],
  );
  const selectedAccount =
    accounts.find(
      (account) => account.accountNumber === selectedAccountNumber,
    ) ?? accounts[0];

  const exchangeRateQuery = useDepositExchangeRate({
    fromCurrency: "USD",
    toCurrency: payoutCurrency,
    amount: 1,
  });
  const exchangeRate = parseRate(exchangeRateQuery.data?.data.exchangeRate);
  const payoutAmount =
    amount > 0 && exchangeRate !== undefined ? amount * exchangeRate : undefined;

  const handleSubmit: FormProps<WithdrawalFormValues>["onFinish"] = (
    values,
  ) => {
    if (!selectedAccount || exchangeRate === undefined) return;
    withdrawal.start({
      accountNumber: selectedAccount.accountNumber,
      amount: values.amount,
      payoutCurrency: values.payoutCurrency,
    });
  };

  if (accountsQuery.isLoading) {
    return <Skeleton active paragraph={{ rows: 7 }} />;
  }

  if (accountsQuery.isError) {
    return (
      <Result
        status="error"
        title="We couldn’t load your trading accounts"
        subTitle={accountsQuery.error.message}
        extra={<Button onClick={() => accountsQuery.refetch()}>Try Again</Button>}
      />
    );
  }

  if (accounts.length === 0) {
    return (
      <Card className="!rounded-2xl !border-0">
        <Empty description="No active trading accounts are available for withdrawal" />
      </Card>
    );
  }

  return (
    <>
      <Form<WithdrawalFormValues>
        form={form}
        layout="vertical"
        requiredMark={false}
        initialValues={{
          accountNumber: selectedAccount.accountNumber,
          payoutCurrency: "USD",
        }}
        onFinish={handleSubmit}
      >
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
          <div className="flex flex-col gap-3">
            <SectionCard>
              <StepHeading number={1} title="Select Trading Account" />
              <Form.Item
                name="accountNumber"
                rules={[{ required: true, message: "Select a trading account" }]}
                className="!mb-0 !mt-3"
              >
                <Select
                  value={selectedAccount?.accountNumber}
                  onChange={(accountNumber) => {
                    setSelectedAccountNumber(accountNumber);
                    form.setFieldValue("accountNumber", accountNumber);
                  }}
                  suffixIcon={<DownOutlined />}
                  className="funds-control-select !w-full"
                  options={accounts.map((account) => ({
                    value: account.accountNumber,
                    label: `${account.platform} · ${account.accountNumber} · ${account.currency}`,
                  }))}
                />
              </Form.Item>
              {selectedAccount ? (
                <p className="mb-0 mt-2 text-xs text-slate-500">
                  Reported balance: {formatMoney(selectedAccount.balance, selectedAccount.currency)}
                </p>
              ) : null}
            </SectionCard>

            <SectionCard>
              <StepHeading number={2} title="Enter Withdrawal Amount" />
              <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                <Form.Item
                  name="payoutCurrency"
                  label="Payout currency"
                  className="!mb-0 sm:!w-[160px]"
                >
                  <Select
                    value={payoutCurrency}
                    options={currencyOptions}
                    onChange={(currency: CurrencyCode) => {
                      setPayoutCurrency(currency);
                      form.setFieldValue("payoutCurrency", currency);
                    }}
                    className="funds-control-select !w-full"
                  />
                </Form.Item>
                <Form.Item
                  name="amount"
                  label="Account deduction (USD)"
                  className="!mb-0 !flex-1"
                  rules={[
                    { required: true, message: "Enter a withdrawal amount" },
                    {
                      validator: (_, value) =>
                        typeof value === "number" &&
                        Number.isFinite(value) &&
                        value > 0
                          ? Promise.resolve()
                          : Promise.reject(
                              new Error("Amount must be greater than zero"),
                            ),
                    },
                    {
                      validator: () =>
                        exchangeRateQuery.isError || exchangeRate === undefined
                          ? Promise.reject(
                              new Error("A valid exchange rate is required"),
                            )
                          : Promise.resolve(),
                    },
                  ]}
                >
                  <InputNumber
                    min={0}
                    precision={2}
                    controls={false}
                    placeholder="0.00"
                    onChange={(value) =>
                      setAmount(typeof value === "number" ? value : 0)
                    }
                    className="funds-amount-input !w-full"
                    styles={{ input: { fontSize: 18, fontWeight: 600 } }}
                  />
                </Form.Item>
              </div>

              <ConversionPreview
                amount={amount}
                currency={payoutCurrency}
                exchangeRate={exchangeRate}
                loading={exchangeRateQuery.isLoading}
                hasError={exchangeRateQuery.isError}
              />
            </SectionCard>

            {withdrawal.recoverableAttempt ? (
              <Alert
                showIcon
                type="warning"
                message={
                  withdrawal.recoverableAttempt.state === "conflict"
                    ? "Withdrawal attempt conflict"
                    : "A previous withdrawal has an uncertain result"
                }
                description={`Account ${withdrawal.recoverableAttempt.requestBody.accountNumber} · ${formatMoney(
                  withdrawal.recoverableAttempt.requestBody.amount,
                  "USD",
                )}. Retry uses the exact same body and idempotency key.`}
                action={
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button
                      size="small"
                      type="primary"
                      loading={withdrawal.isPending}
                      onClick={withdrawal.retry}
                    >
                      Retry original attempt
                    </Button>
                    <Button
                      size="small"
                      disabled={withdrawal.isPending}
                      onClick={withdrawal.startNew}
                    >
                      Start new instead
                    </Button>
                  </div>
                }
                className="!rounded-xl"
              />
            ) : null}

            <Button
              type="primary"
              htmlType="submit"
              block
              icon={<LockOutlined />}
              loading={withdrawal.isPending}
              disabled={
                withdrawal.isPending ||
                Boolean(withdrawal.recoverableAttempt) ||
                exchangeRateQuery.isLoading ||
                exchangeRateQuery.isError ||
                exchangeRate === undefined
              }
              className="!h-14 !rounded-xl !text-base !font-semibold"
            >
              Withdraw Funds
            </Button>
          </div>

          <WithdrawalSummary
            account={selectedAccount}
            accountDeduction={amount}
            payoutAmount={payoutAmount}
            payoutCurrency={payoutCurrency}
            exchangeRate={exchangeRate}
          />
        </div>
      </Form>

      <WithdrawalSuccessModal
        open={Boolean(withdrawal.success)}
        result={withdrawal.success}
        onClose={withdrawal.closeSuccess}
        onViewHistory={() => {
          withdrawal.closeSuccess();
          router.push(ROUTES.FUNDS.HISTORY);
        }}
      />
    </>
  );
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <Card
      bordered={false}
      className="!rounded-2xl !border-0 !bg-white !shadow-[0_1px_4px_rgba(76,29,149,0.04)]"
      styles={{ body: { padding: 16 } }}
    >
      {children}
    </Card>
  );
}

function StepHeading({ number, title }: { number: number; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
        {number}
      </span>
      <h2 className="m-0 text-base font-semibold text-slate-950">{title}</h2>
    </div>
  );
}

function ConversionPreview({
  amount,
  currency,
  exchangeRate,
  loading,
  hasError,
}: {
  amount: number;
  currency: CurrencyCode;
  exchangeRate?: number;
  loading: boolean;
  hasError: boolean;
}) {
  const payout = exchangeRate === undefined ? undefined : amount * exchangeRate;
  return (
    <div className="mt-4 rounded-xl bg-gradient-to-r from-violet-50 via-white to-blue-50 px-4 py-3">
      <div className="grid gap-4 sm:grid-cols-3 sm:items-center">
        <PreviewValue label="Account deduction">
          {formatMoney(amount, "USD")}
        </PreviewValue>
        <PreviewValue label="Exchange rate" centered>
          {loading
            ? "Loading..."
            : hasError || exchangeRate === undefined
              ? "Rate unavailable"
              : `1 USD = ${exchangeRate.toLocaleString("en-US", { maximumFractionDigits: 8 })} ${currency}`}
        </PreviewValue>
        <PreviewValue label="You receive" right highlight>
          {payout === undefined ? "—" : formatMoney(payout, currency)}
        </PreviewValue>
      </div>
    </div>
  );
}

function PreviewValue({
  label,
  children,
  centered,
  right,
  highlight,
}: {
  label: string;
  children: React.ReactNode;
  centered?: boolean;
  right?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className={centered ? "sm:text-center" : right ? "sm:text-right" : ""}>
      <p className="m-0 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p
        className={`m-0 mt-1 text-sm font-bold ${highlight ? "text-emerald-600" : "text-slate-950"}`}
      >
        {children}
      </p>
    </div>
  );
}

function WithdrawalSummary({
  account,
  accountDeduction,
  payoutAmount,
  payoutCurrency,
  exchangeRate,
}: {
  account: TradingAccount;
  accountDeduction: number;
  payoutAmount?: number;
  payoutCurrency: CurrencyCode;
  exchangeRate?: number;
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
          value={`${account.platform} · ${account.accountNumber} · ${account.currency}`}
        />
        <SummaryDivider />
        <SummaryRow
          label="Account Deduction"
          value={formatMoney(accountDeduction, "USD")}
        />
        <SummaryRow
          label="Exchange Rate"
          value={
            exchangeRate === undefined
              ? "—"
              : `1 USD = ${exchangeRate.toLocaleString("en-US", { maximumFractionDigits: 8 })} ${payoutCurrency}`
          }
        />
        <SummaryDivider />
        <SummaryRow
          label="You Receive"
          value={
            <span className="text-lg text-emerald-400">
              {payoutAmount === undefined
                ? "—"
                : formatMoney(payoutAmount, payoutCurrency)}
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
      <div className="max-w-[220px] text-right text-sm font-semibold text-white">
        {value}
      </div>
    </div>
  );
}

function SummaryDivider() {
  return <div className="h-px bg-white/10" />;
}

function WithdrawalSuccessModal({
  open,
  result,
  onClose,
  onViewHistory,
}: {
  open: boolean;
  result: WithdrawalResponse | null;
  onClose: () => void;
  onViewHistory: () => void;
}) {
  if (!result) return null;
  return (
    <Modal
      open={open}
      title="Withdrawal Request Submitted"
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>Close</Button>,
        <Button key="history" type="primary" onClick={onViewHistory}>
          View Funds History
        </Button>,
      ]}
      centered
    >
      <p className="text-slate-600">
        Your withdrawal request has been submitted successfully.
      </p>
      <div className="space-y-3 rounded-xl bg-slate-50 p-4">
        <SummaryDetail label="Reference" value={result.reference} />
        <SummaryDetail label="Trading account" value={result.account.accountNumber} />
        <SummaryDetail
          label="Withdrawal amount"
          value={formatMoney(result.withdrawal.amount, result.withdrawal.currency)}
        />
        <SummaryDetail
          label="Payout"
          value={formatMoney(
            result.conversion.convertedAmount,
            result.conversion.convertedCurrency,
          )}
        />
        <SummaryDetail
          label="Status"
          value={<Tag color="warning">{result.status}</Tag>}
        />
        <SummaryDetail label="Approval" value={result.approval.status} />
      </div>
      <p className="mb-0 mt-3 text-xs text-slate-500">
        Pending means the request was submitted and is awaiting processing.
      </p>
    </Modal>
  );
}

function SummaryDetail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-slate-500">{label}</span>
      <strong className="text-right text-slate-900">{value}</strong>
    </div>
  );
}
