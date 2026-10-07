"use client";

import { App, Button, Card, Form, InputNumber, Select } from "antd";
import { ArrowDown, ArrowUp, Repeat2 } from "lucide-react";
import { useTransferExchangeRate } from "@/hooks/useTransfer";
import { SummaryRow, TransferAccountCard } from "./transfer-ui";

type TransferFormValues = {
  fromAccount: string;
  toAccount: string;
  amount: number;
};

type TradingAccount = {
  id: string;
  label: string;
  accountNumber: string;
  currency: string;
  balance: number;
};

const tradingAccounts: TradingAccount[] = [
  {
    id: "primary-mt5",
    label: "Primary MT5 Account",
    accountNumber: "1012345678",
    currency: "USD",
    balance: 24850.75,
  },
  {
    id: "secondary-mt5",
    label: "Secondary MT5 Account",
    accountNumber: "1012345691",
    currency: "EUR",
    balance: 12100.2,
  },
];

const accountOptions = tradingAccounts.map((account) => ({
  value: account.id,
  label: `${account.label} · ${account.accountNumber} · ${account.currency}`,
}));

function formatAmount(amount: number, currency: string) {
  return `${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${currency}`;
}

export default function TransferForm() {
  const { message } = App.useApp();
  const [form] = Form.useForm<TransferFormValues>();
  const fromAccountId = Form.useWatch("fromAccount", form);
  const toAccountId = Form.useWatch("toAccount", form);
  const amount = Form.useWatch("amount", form) ?? 0;

  const fromAccount =
    tradingAccounts.find((account) => account.id === fromAccountId) ??
    tradingAccounts[0];
  const toAccount =
    tradingAccounts.find((account) => account.id === toAccountId) ??
    tradingAccounts[1];
  const isSameCurrency = fromAccount.currency === toAccount.currency;
  const {
    data: exchangeRateResponse,
    isLoading: isExchangeRateLoading,
    isError: isExchangeRateError,
  } = useTransferExchangeRate({
    fromCurrency: fromAccount.currency,
    toCurrency: toAccount.currency,
  });
  const apiExchangeRate = exchangeRateResponse?.data;
  const exchangeRate = isSameCurrency
    ? 1
    : apiExchangeRate === 0
      ? 1
      : apiExchangeRate;
  const receivingAmount = exchangeRate !== undefined ? amount * exchangeRate : 0;

  function swapAccounts() {
    form.setFieldsValue({
      fromAccount: toAccount.id,
      toAccount: fromAccount.id,
    });
  }

  function handleSubmit() {
    message.info("Transfer form is ready. Connect the transfer API to submit it.");
  }

  return (
    <Form<TransferFormValues>
      form={form}
      layout="vertical"
      requiredMark={false}
      initialValues={{
        fromAccount: tradingAccounts[0].id,
        toAccount: tradingAccounts[1].id,
        amount: 0,
      }}
      onFinish={handleSubmit}
    >
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
        <div className="space-y-3">
          <TransferAccountCard
            number={1}
            title="Transfer From"
            icon={<ArrowUp size={18} />}
          >
            <Form.Item name="fromAccount" className="!mb-0 !mt-2">
              <Select
                className="funds-control-select !w-full"
                options={accountOptions.map((option) => ({
                  ...option,
                  disabled: option.value === toAccountId,
                }))}
              />
            </Form.Item>
            <p className="m-0 mt-2 text-xs font-medium text-slate-500">
              Available balance: {formatAmount(fromAccount.balance, fromAccount.currency)}
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

          <TransferAccountCard
            number={2}
            title="Transfer To"
            icon={<ArrowDown size={18} />}
          >
            <Form.Item name="toAccount" className="!mb-0 !mt-2">
              <Select
                className="funds-control-select !w-full"
                options={accountOptions.map((option) => ({
                  ...option,
                  disabled: option.value === fromAccountId,
                }))}
              />
            </Form.Item>
          </TransferAccountCard>

          <TransferAccountCard number={3} title="Amount">
            <Form.Item
              name="amount"
              className="!mb-0 !mt-2"
              rules={[
                {
                  validator: (_, value) => {
                    if (typeof value !== "number" || value <= 0) {
                      return Promise.reject(new Error("Enter an amount greater than zero"));
                    }
                    if (value > fromAccount.balance) {
                      return Promise.reject(new Error("Amount exceeds the available balance"));
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
                className="funds-amount-input !w-full"
                styles={{ input: { fontSize: 18, fontWeight: 600 } }}
              />
            </Form.Item>

            <div className="mt-3 grid gap-4 rounded-xl bg-gradient-to-r from-violet-50 via-white to-blue-50 px-4 py-3 shadow-[0_1px_4px_rgba(76,29,149,0.04)] sm:grid-cols-3 sm:items-center">
              <TransferMetric label="Account deduction">
                {formatAmount(amount, fromAccount.currency)}
              </TransferMetric>
              <TransferMetric label="Exchange rate" center>
                {isExchangeRateLoading && !isSameCurrency
                  ? "Loading..."
                  : isExchangeRateError && !isSameCurrency
                    ? "Rate unavailable"
                    : `1 ${fromAccount.currency} = ${(exchangeRate ?? 0).toLocaleString("en-US", {
                        maximumFractionDigits: 8,
                      })} ${toAccount.currency}`}
              </TransferMetric>
              <TransferMetric label="Account receives" right highlight>
                {formatAmount(receivingAmount, toAccount.currency)}
              </TransferMetric>
            </div>
          </TransferAccountCard>

          <Button
            type="primary"
            htmlType="submit"
            block
            className="!h-14 !rounded-xl !text-base !font-semibold"
          >
            Transfer Funds
          </Button>
        </div>

        <Card bordered={false} className="!rounded-2xl !bg-[#071d3e] !shadow-lg">
          <div className="mb-8 flex items-center gap-3">
            <span className="flex size-12 items-center justify-center rounded-xl bg-blue-500/20 text-blue-300">
              <Repeat2 size={23} />
            </span>
            <h2 className="m-0 text-xl font-bold text-white">Transfer Summary</h2>
          </div>
          <SummaryRow label="From" value={fromAccount.label} />
          <SummaryRow label="To" value={toAccount.label} />
          <div className="my-5 border-t border-white/10" />
          <SummaryRow
            label="Account Deduction"
            value={formatAmount(amount, fromAccount.currency)}
          />
          <SummaryRow
            label="Account Receives"
            value={formatAmount(receivingAmount, toAccount.currency)}
            highlight
          />
        </Card>
      </div>
    </Form>
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
      <p className="m-0 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p
        className={`m-0 mt-1 text-sm font-bold ${
          highlight ? "text-emerald-600" : center ? "text-violet-700" : "text-slate-950"
        }`}
      >
        {children}
      </p>
    </div>
  );
}
