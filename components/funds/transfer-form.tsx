"use client";

import { useMemo, useState } from "react";
import { Alert, Button, Card, Empty, Form, InputNumber, Modal, Result, Select, Skeleton, Tag } from "antd";
import type { FormProps } from "antd";
import { ArrowDown, ArrowUp, LockKeyhole, Repeat2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { SummaryRow, TransferAccountCard } from "@/components/funds/transfer-ui";
import { ROUTES } from "@/constants/routes";
import { useAllTradingAccounts } from "@/hooks/useAccounts";
import { useDepositExchangeRate } from "@/hooks/useDeposit";
import { useTransferFlow } from "@/hooks/useTransferFlow";
import { useUserDetail } from "@/hooks/useUser";
import type { TradingAccount } from "@/types/accounts";
import type { TransferResponse } from "@/types/transfer";

type TransferFormValues = {
  sourceAccountNumber: string;
  destinationAccountNumber: string;
  amount: number;
};

function formatAmount(amount: number | string, currency: string) {
  const numericAmount = Number(amount);
  const formatted = Number.isFinite(numericAmount)
    ? numericAmount.toLocaleString("en-US", {
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

function accountLabel(account: TradingAccount) {
  return `${account.platform} · ${account.accountNumber} · ${account.currency}`;
}

export default function TransferForm() {
  const router = useRouter();
  const [form] = Form.useForm<TransferFormValues>();
  const accountsQuery = useAllTradingAccounts();
  const userQuery = useUserDetail();
  const transfer = useTransferFlow(userQuery.data?.data.id);
  const [sourceNumber, setSourceNumber] = useState("");
  const [destinationNumber, setDestinationNumber] = useState("");
  const [amount, setAmount] = useState(0);

  const accounts = useMemo(
    () =>
      (accountsQuery.data?.data ?? []).filter(
        (account) => account.status.trim().toUpperCase() === "ACTIVE",
      ),
    [accountsQuery.data?.data],
  );
  const sourceAccount =
    accounts.find((account) => account.accountNumber === sourceNumber) ??
    accounts[0];
  const destinationAccount =
    accounts.find((account) => account.accountNumber === destinationNumber) ??
    accounts[1];

  const exchangeRateQuery = useDepositExchangeRate({
    fromCurrency: sourceAccount?.currency ?? "USD",
    toCurrency: destinationAccount?.currency ?? "USD",
    amount: 1,
  });
  const exchangeRate = parseRate(exchangeRateQuery.data?.data.exchangeRate);
  const receivingAmount =
    amount > 0 && exchangeRate !== undefined ? amount * exchangeRate : undefined;

  function swapAccounts() {
    if (!sourceAccount || !destinationAccount) return;
    setSourceNumber(destinationAccount.accountNumber);
    setDestinationNumber(sourceAccount.accountNumber);
    form.setFieldsValue({
      sourceAccountNumber: destinationAccount.accountNumber,
      destinationAccountNumber: sourceAccount.accountNumber,
    });
  }

  const handleSubmit: FormProps<TransferFormValues>["onFinish"] = (values) => {
    if (!sourceAccount || !destinationAccount || exchangeRate === undefined) return;
    transfer.start({
      sourceAccountNumber: values.sourceAccountNumber,
      destinationAccountNumber: values.destinationAccountNumber,
      amount: values.amount,
    });
  };

  if (accountsQuery.isLoading) return <Skeleton active paragraph={{ rows: 8 }} />;

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

  if (accounts.length < 2 || !sourceAccount || !destinationAccount) {
    return (
      <Card className="!rounded-2xl !border-0">
        <Empty description="At least two active trading accounts are required to transfer funds" />
      </Card>
    );
  }

  const options = accounts.map((account) => ({
    value: account.accountNumber,
    label: accountLabel(account),
  }));
  const sourceBalance = Number(sourceAccount.balance);

  return (
    <>
      <Form<TransferFormValues>
        form={form}
        layout="vertical"
        requiredMark={false}
        initialValues={{
          sourceAccountNumber: sourceAccount.accountNumber,
          destinationAccountNumber: destinationAccount.accountNumber,
        }}
        onFinish={handleSubmit}
      >
        <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
          <div className="space-y-3">
            <TransferAccountCard number={1} title="Transfer From" icon={<ArrowUp size={18} />}>
              <Form.Item
                name="sourceAccountNumber"
                rules={[{ required: true, message: "Select a source account" }]}
                className="!mb-0 !mt-2"
              >
                <Select
                  className="funds-control-select !w-full"
                  options={options.map((option) => ({
                    ...option,
                    disabled: option.value === destinationAccount.accountNumber,
                  }))}
                  onChange={(value) => {
                    setSourceNumber(value);
                    form.setFieldValue("sourceAccountNumber", value);
                  }}
                />
              </Form.Item>
              <p className="m-0 mt-2 text-xs font-medium text-slate-500">
                Reported balance: {formatAmount(sourceAccount.balance, sourceAccount.currency)}
              </p>
            </TransferAccountCard>

            <div className="relative">
              <button
                type="button"
                onClick={swapAccounts}
                aria-label="Swap transfer accounts"
                className="absolute left-1/2 top-0 z-10 flex size-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-blue-600 text-white shadow-md transition hover:bg-blue-700"
              >
                <Repeat2 size={17} />
              </button>
            </div>

            <TransferAccountCard number={2} title="Transfer To" icon={<ArrowDown size={18} />}>
              <Form.Item
                name="destinationAccountNumber"
                dependencies={["sourceAccountNumber"]}
                rules={[
                  { required: true, message: "Select a destination account" },
                  ({ getFieldValue }) => ({
                    validator: (_, value) =>
                      value && value !== getFieldValue("sourceAccountNumber")
                        ? Promise.resolve()
                        : Promise.reject(
                            new Error("Source and destination accounts must be different"),
                          ),
                  }),
                ]}
                className="!mb-0 !mt-2"
              >
                <Select
                  className="funds-control-select !w-full"
                  options={options.map((option) => ({
                    ...option,
                    disabled: option.value === sourceAccount.accountNumber,
                  }))}
                  onChange={(value) => {
                    setDestinationNumber(value);
                    form.setFieldValue("destinationAccountNumber", value);
                  }}
                />
              </Form.Item>
            </TransferAccountCard>

            <TransferAccountCard number={3} title="Amount">
              <Form.Item
                name="amount"
                label={`Transfer amount (${sourceAccount.currency})`}
                className="!mb-0 !mt-2"
                rules={[
                  { required: true, message: "Enter a transfer amount" },
                  {
                    validator: (_, value) => {
                      if (
                        typeof value !== "number" ||
                        !Number.isFinite(value) ||
                        value <= 0
                      ) {
                        return Promise.reject(
                          new Error("Amount must be greater than zero"),
                        );
                      }
                      if (Number.isFinite(sourceBalance) && value > sourceBalance) {
                        return Promise.reject(
                          new Error("Amount exceeds the reported account balance"),
                        );
                      }
                      if (exchangeRateQuery.isError || exchangeRate === undefined) {
                        return Promise.reject(
                          new Error("A valid exchange rate is required"),
                        );
                      }
                      return Promise.resolve();
                    },
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

              <TransferPreview
                amount={amount}
                sourceAccount={sourceAccount}
                destinationAccount={destinationAccount}
                exchangeRate={exchangeRate}
                loading={exchangeRateQuery.isLoading}
                hasError={exchangeRateQuery.isError}
              />
            </TransferAccountCard>

            {transfer.recoverableAttempt ? (
              <Alert
                showIcon
                type="warning"
                message={
                  transfer.recoverableAttempt.state === "conflict"
                    ? "Transfer attempt conflict"
                    : "A previous transfer has an uncertain result"
                }
                description={`${transfer.recoverableAttempt.requestBody.sourceAccountNumber} → ${transfer.recoverableAttempt.requestBody.destinationAccountNumber} · ${transfer.recoverableAttempt.requestBody.amount}. Retry uses the exact same body and idempotency key.`}
                action={
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button size="small" type="primary" loading={transfer.isPending} onClick={transfer.retry}>
                      Retry original attempt
                    </Button>
                    <Button size="small" disabled={transfer.isPending} onClick={transfer.startNew}>
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
              icon={<LockKeyhole size={17} />}
              loading={transfer.isPending}
              disabled={
                transfer.isPending ||
                Boolean(transfer.recoverableAttempt) ||
                exchangeRateQuery.isLoading ||
                exchangeRateQuery.isError ||
                exchangeRate === undefined
              }
              className="!h-14 !rounded-xl !text-base !font-semibold"
            >
              Transfer Funds
            </Button>
          </div>

          <TransferSummary
            source={sourceAccount}
            destination={destinationAccount}
            amount={amount}
            receivingAmount={receivingAmount}
            exchangeRate={exchangeRate}
          />
        </div>
      </Form>

      <TransferSuccessModal
        result={transfer.success}
        onClose={transfer.closeSuccess}
        onViewHistory={() => {
          transfer.closeSuccess();
          router.push(ROUTES.FUNDS.HISTORY);
        }}
      />
    </>
  );
}

function TransferPreview({
  amount,
  sourceAccount,
  destinationAccount,
  exchangeRate,
  loading,
  hasError,
}: {
  amount: number;
  sourceAccount: TradingAccount;
  destinationAccount: TradingAccount;
  exchangeRate?: number;
  loading: boolean;
  hasError: boolean;
}) {
  const receives = exchangeRate === undefined ? undefined : amount * exchangeRate;
  return (
    <div className="mt-3 grid gap-4 rounded-xl bg-gradient-to-r from-violet-50 via-white to-blue-50 px-4 py-3 sm:grid-cols-3 sm:items-center">
      <TransferMetric label="Account deduction">
        {formatAmount(amount, sourceAccount.currency)}
      </TransferMetric>
      <TransferMetric label="Exchange rate" center>
        {loading
          ? "Loading..."
          : hasError || exchangeRate === undefined
            ? "Rate unavailable"
            : `1 ${sourceAccount.currency} = ${exchangeRate.toLocaleString("en-US", { maximumFractionDigits: 8 })} ${destinationAccount.currency}`}
      </TransferMetric>
      <TransferMetric label="Account receives" right highlight>
        {receives === undefined
          ? "—"
          : formatAmount(receives, destinationAccount.currency)}
      </TransferMetric>
    </div>
  );
}

function TransferSummary({
  source,
  destination,
  amount,
  receivingAmount,
  exchangeRate,
}: {
  source: TradingAccount;
  destination: TradingAccount;
  amount: number;
  receivingAmount?: number;
  exchangeRate?: number;
}) {
  return (
    <Card bordered={false} className="!rounded-2xl !bg-[#071d3e] !shadow-lg">
      <div className="mb-8 flex items-center gap-3">
        <span className="flex size-12 items-center justify-center rounded-xl bg-blue-500/20 text-blue-300">
          <Repeat2 size={23} />
        </span>
        <h2 className="m-0 text-xl font-bold text-white">Transfer Summary</h2>
      </div>
      <SummaryRow label="From" value={accountLabel(source)} />
      <SummaryRow label="To" value={accountLabel(destination)} />
      <div className="my-5 border-t border-white/10" />
      <SummaryRow label="Account Deduction" value={formatAmount(amount, source.currency)} />
      <SummaryRow
        label="Exchange Rate"
        value={
          exchangeRate === undefined
            ? "—"
            : `1 ${source.currency} = ${exchangeRate.toLocaleString("en-US", { maximumFractionDigits: 8 })} ${destination.currency}`
        }
      />
      <SummaryRow
        label="Account Receives"
        value={
          receivingAmount === undefined
            ? "—"
            : formatAmount(receivingAmount, destination.currency)
        }
        highlight
      />
    </Card>
  );
}

function TransferMetric({
  label,
  children,
  center = false,
  right = false,
  highlight = false,
}: {
  label: string;
  children: React.ReactNode;
  center?: boolean;
  right?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className={center ? "sm:text-center" : right ? "sm:text-right" : ""}>
      <p className="m-0 text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`m-0 mt-1 text-sm font-bold ${highlight ? "text-emerald-600" : center ? "text-violet-700" : "text-slate-950"}`}>
        {children}
      </p>
    </div>
  );
}

function TransferSuccessModal({
  result,
  onClose,
  onViewHistory,
}: {
  result: TransferResponse | null;
  onClose: () => void;
  onViewHistory: () => void;
}) {
  if (!result) return null;
  return (
    <Modal
      open
      title="Transfer Completed"
      centered
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>Close</Button>,
        <Button key="history" type="primary" onClick={onViewHistory}>View Funds History</Button>,
      ]}
    >
      <p className="text-slate-600">Your transfer completed successfully.</p>
      <div className="space-y-3 rounded-xl bg-slate-50 p-4 text-sm">
        <ResultRow label="Reference" value={result.reference} />
        <ResultRow label="From" value={result.source.accountNumber} />
        <ResultRow label="To" value={result.destination.accountNumber} />
        <ResultRow label="Deducted" value={formatAmount(result.source.amount, result.source.currency)} />
        <ResultRow label="Received" value={formatAmount(result.destination.amount, result.destination.currency)} />
        <ResultRow label="Status" value={<Tag color="success">{result.status}</Tag>} />
      </div>
    </Modal>
  );
}

function ResultRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-slate-500">{label}</span>
      <strong className="text-right text-slate-900">{value}</strong>
    </div>
  );
}
