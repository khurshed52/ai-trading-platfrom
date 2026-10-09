"use client";

import { useMemo, useState } from "react";
import {
  CheckCircleFilled,
  CreditCardOutlined,
  DollarOutlined,
  DownOutlined,
  LockOutlined,
} from "@ant-design/icons";
import {
  Button,
  App,
  Alert,
  Card,
  Form,
  InputNumber,
  Radio,
  Select,
  Typography,
} from "antd";
import type { FormProps } from "antd";
import {
  Landmark,
} from "lucide-react";
import {
  useBankTransferDeposit,
  useCreditDebitDeposit,
  useDepositExchangeRate,
  useSkrillDeposit,
  useUsdtDeposit,
} from "@/hooks/useDeposit";
import { useAllTradingAccounts } from "@/hooks/useAccounts";
import { useStripeDepositFlow } from "@/hooks/useStripeDepositFlow";
import { useUserDetail } from "@/hooks/useUser";
import { useSearchParams } from "next/navigation";
import type { TradingAccount } from "@/types/accounts";

const { Text, Title } = Typography;
const DEPOSIT_PSP_URL = "https://www.khurshedkhan.dev/";
const MINIMUM_ACCOUNT_DEPOSIT_USD = 10;

type CurrencyCode = "USD" | "EUR" | "INR";

type DepositMethodId =
  | "bank-transfer"
  | "card"
  | "usdt" 
  | "skrill"
  | "stripe";

type DepositFormValues = {
  paymentMethod: DepositMethodId;
  currency: CurrencyCode;
  amount: number;
};

type DepositMethod = {
  id: DepositMethodId;
  title: string;
  processingTime: string;
  feeLabel: string;
  feePercentage?: number;
  icon: React.ReactNode;
  recommended?: boolean;
};

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
  {
    id: "stripe",
    title: "Stripe",
    processingTime: "Secure Online Payment",
    feeLabel: "Fee unavailable",
    icon: <CreditCardOutlined className="text-[28px] text-indigo-600" />,
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
   {
    label: "INR",
    value: "INR",
  },
];

function formatMoney(
  value: number,
  currency: CurrencyCode,
) {
  const formattedValue = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

  return `${formattedValue} ${currency}`;
}

function parseExchangeRate(value: string | undefined): number | undefined {
  const rate = Number(value);
  return Number.isFinite(rate) && rate > 0 ? rate : undefined;
}

export default function DepositForm() {
  const searchParams = useSearchParams();
  const [form] = Form.useForm<DepositFormValues>();
  const { message } = App.useApp();
  const bankTransferDeposit = useBankTransferDeposit();
  const creditDebitDeposit = useCreditDebitDeposit();
  const skrillDeposit = useSkrillDeposit();
  const usdtDeposit = useUsdtDeposit();
  const accountsQuery = useAllTradingAccounts();
  const userQuery = useUserDetail();
  const userId = userQuery.data?.data.id;
  const stripeDeposit = useStripeDepositFlow(userId);

  const [selectedMethod, setSelectedMethod] =
    useState<DepositMethodId>("bank-transfer");

  const linkedAccountId = searchParams.get("accountId")?.trim() ?? "";
  const linkedAccountNumber =
    searchParams.get("accountNumber")?.trim() ?? "";
  const tradingAccounts = useMemo(
    () =>
      (accountsQuery.data?.data ?? []).filter(
        (account) => account.status.trim().toUpperCase() === "ACTIVE",
      ),
    [accountsQuery.data?.data],
  );

  const [selectedAccountId, setSelectedAccountId] =
    useState("");

  const [currency, setCurrency] =
    useState<CurrencyCode>("USD");

  const [amount, setAmount] = useState(0);

  const {
    data: exchangeRateResponse,
    isLoading: isExchangeRateLoading,
    isError: isExchangeRateError,
    error: exchangeRateError,
  } = useDepositExchangeRate({
    fromCurrency: "USD",
    toCurrency: currency,
    amount: 1,
  });

  const exchangeRate = parseExchangeRate(
    exchangeRateResponse?.data.exchangeRate,
  );

  const selectedAccount = useMemo(() => {
    const linkedAccount = tradingAccounts.find(
      (account) =>
        account.id === linkedAccountId ||
        account.accountNumber === linkedAccountNumber,
    );

    return (
      tradingAccounts.find(
        (account) => account.id === selectedAccountId,
      ) ?? linkedAccount ?? tradingAccounts[0]
    );
  }, [
    linkedAccountId,
    linkedAccountNumber,
    selectedAccountId,
    tradingAccounts,
  ]);

  const selectedDepositMethod = useMemo(
    () =>
      depositMethods.find(
        (method) => method.id === selectedMethod,
      ) ?? depositMethods[0],
    [selectedMethod],
  );

  const feeAmount =
    amount *
    ((selectedDepositMethod.feePercentage ?? 0) / 100);

  const receiveAmount = Math.max(
    amount - feeAmount,
    0,
  );
  const convertedReceiveAmount =
    exchangeRate !== undefined && exchangeRate > 0
      ? receiveAmount / exchangeRate
      : undefined;
  const verifiedReceiveAmount = convertedReceiveAmount;

  const handleSubmit: FormProps<DepositFormValues>["onFinish"] = (
    values,
  ) => {
    if (!selectedAccount) {
      message.error("Select an active trading account before continuing.");
      return;
    }

    if (!Number.isFinite(values.amount) || values.amount <= 0) {
      message.error("Enter a deposit amount greater than zero.");
      return;
    }

    if (values.paymentMethod === "stripe") {
      if (!userId) {
        message.error("Your account information is still loading.");
        return;
      }

      if (values.currency !== "USD") {
        message.error(
          "The current Stripe deposit contract confirms USD deposits only.",
        );
        return;
      }

      stripeDeposit.startNewAttempt({
        accountNumber: selectedAccount.accountNumber,
        amount: values.amount,
        currency: values.currency,
        provider: "STRIPE",
      });
      return;
    }

    if (convertedReceiveAmount === undefined) {
      message.error("The exchange rate is not available yet.");
      return;
    }

    if (convertedReceiveAmount < MINIMUM_ACCOUNT_DEPOSIT_USD) {
      message.error("The account must receive at least 10.00 USD.");
      return;
    }

    const depositPayload = {
      deposiT_TO: 2 as const,
      paymenT_DESTINATION: selectedAccount.accountNumber,
      deposiT_AMOUNT: convertedReceiveAmount,
      currency: values.currency,
    };
    const redirectToPsp = () => {
      window.location.assign(DEPOSIT_PSP_URL);
    };

    switch (values.paymentMethod) {
      case "bank-transfer":
        bankTransferDeposit.mutate(
          {
            ...depositPayload,
            country: "India",
          },
          {
            onSuccess: () => {
              message.success("The bank transfer deposit was successful.");
            },
           // onSettled: redirectToPsp,
          },
        );
        break;
      case "card":
        creditDebitDeposit.mutate(depositPayload, {
          onSuccess: redirectToPsp,
        }, 
      );
        break;
      case "skrill":
        skrillDeposit.mutate(depositPayload, {
          onSuccess: redirectToPsp,
        });
        break;
      case "usdt":
        usdtDeposit.mutate({
          ...depositPayload,
          coinName: "USDT",
        }, {
          onSuccess: redirectToPsp,
        });
        break;
    }
  };

  return (
    <Form<DepositFormValues>
      form={form}
      layout="vertical"
      requiredMark={false}
      initialValues={{
        paymentMethod: "bank-transfer",
        currency: "USD",
        amount: undefined,
      }}
      onFinish={handleSubmit}
    >
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
        <div className="flex flex-col gap-2">
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
            accounts={tradingAccounts}
            loading={accountsQuery.isLoading}
            error={accountsQuery.isError ? accountsQuery.error.message : undefined}
            onRetry={() => accountsQuery.refetch()}
            selectedAccountId={selectedAccount?.id ?? ""}
            onChange={(accountId) => {
              const account =
                tradingAccounts.find(
                  (item) =>
                    item.id === accountId,
                );

              setSelectedAccountId(accountId);

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
            feePercentage={selectedDepositMethod.feePercentage}
            receiveAmount={receiveAmount}
            convertedReceiveAmount={verifiedReceiveAmount}
            exchangeRate={exchangeRate}
            isExchangeRateLoading={isExchangeRateLoading}
            exchangeRateError={
              isExchangeRateError
                ? exchangeRateError.message
                : undefined
            }
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

          {stripeDeposit.recoverableAttempt && (
            <Alert
              showIcon
              type="warning"
              message={
                stripeDeposit.recoverableAttempt.state === "initiated"
                  ? "Stripe Checkout needs attention"
                  : stripeDeposit.recoverableAttempt.state === "conflict"
                    ? "This deposit conflicts with an existing attempt"
                  : "A previous Stripe deposit has an uncertain result"
              }
              description={`Account ${stripeDeposit.recoverableAttempt.requestBody.accountNumber} · ${formatMoney(
                stripeDeposit.recoverableAttempt.requestBody.amount,
                stripeDeposit.recoverableAttempt.requestBody.currency as CurrencyCode,
              )}. Retry sends the exact same request and idempotency key.`}
              action={
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    size="small"
                    type="primary"
                    loading={stripeDeposit.isPending}
                    onClick={stripeDeposit.retryRecoverableAttempt}
                  >
                    Retry original attempt
                  </Button>
                  <Button
                    size="small"
                    disabled={stripeDeposit.isPending}
                    onClick={stripeDeposit.dismissRecoverableAttempt}
                  >
                    Remove reminder
                  </Button>
                </div>
              }
              className="!rounded-xl"
            />
          )}

          <Button
            type="primary"
            htmlType="submit"
            block
            icon={<LockOutlined />}
            loading={
              bankTransferDeposit.isPending ||
              creditDebitDeposit.isPending ||
              skrillDeposit.isPending ||
              usdtDeposit.isPending ||
              stripeDeposit.isPending
            }
            disabled={
              accountsQuery.isLoading ||
              accountsQuery.isError ||
              !selectedAccount ||
              (selectedMethod === "stripe" && !userId)
            }
            className="!h-14 !rounded-xl !text-base !font-semibold"
          >
            {selectedMethod === "stripe" ? "Continue to Stripe" : "Add Balance"}
          </Button>
        </div>

        <DepositSummary
          account={selectedAccount}
          method={selectedDepositMethod}
          amount={amount}
          fee={
            selectedDepositMethod.feePercentage === undefined
              ? undefined
              : feeAmount
          }
          convertedReceiveAmount={verifiedReceiveAmount}
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
      className="!rounded-2xl !border-0 !bg-white !shadow-[0_1px_4px_rgba(76,29,149,0.04)]"
      styles={{
        body: {
          padding: 10,
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
        className="!mb-0 !mt-2"
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
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
            {depositMethods.map((method) => {
              const selected =
                method.id === selectedMethod;

              return (
                <div
                  key={method.id}
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
                </div>
              );
            })}
          </div>
        </Radio.Group>
      </Form.Item>
    </Card>
  );
}

type TradingAccountSectionProps = {
  accounts: TradingAccount[];
  loading: boolean;
  error?: string;
  onRetry: () => void;
  selectedAccountId: string;
  onChange: (accountId: string) => void;
};

function TradingAccountSection({
  accounts,
  loading,
  error,
  onRetry,
  selectedAccountId,
  onChange,
}: TradingAccountSectionProps) {
  return (
    <Card
      bordered={false}
      className="!rounded-2xl !border-0 !bg-white !shadow-[0_1px_4px_rgba(76,29,149,0.04)]"
      styles={{
        body: {
          padding: 10,
        },
      }}
    >
      <StepHeading
        number={2}
        title="Select Trading Account"
      />

      <div className="mt-2">
        <Select
          value={selectedAccountId}
          onChange={onChange}
          loading={loading}
          disabled={loading || Boolean(error) || accounts.length === 0}
          placeholder={loading ? "Loading accounts..." : "Select an account"}
          notFoundContent="No eligible active accounts"
          suffixIcon={<DownOutlined />}
          className="funds-control-select !w-full"
          options={accounts.map((account) => ({
            value: account.id,
            label: `${account.accountNumber} · ${account.platform} · ${account.currency}`,
          }))}
        />
      </div>

      {error && (
        <Alert
          type="error"
          showIcon
          message="Trading accounts could not be loaded"
          description={error}
          action={
            <Button size="small" onClick={onRetry}>
              Retry
            </Button>
          }
          className="!mt-2 !rounded-xl"
        />
      )}

      {!loading && !error && accounts.length === 0 && (
        <Alert
          type="info"
          showIcon
          message="No active trading accounts are available for deposits."
          className="!mt-2 !rounded-xl"
        />
      )}
    </Card>
  );
}

type DepositAmountSectionProps = {
  currency: CurrencyCode;
  amount: number;
  feePercentage?: number;
  receiveAmount: number;
  convertedReceiveAmount?: number;
  exchangeRate?: number;
  isExchangeRateLoading: boolean;
  exchangeRateError?: string;
  onCurrencyChange: (
    currency: CurrencyCode,
  ) => void;
  onAmountChange: (amount: number) => void;
};

function DepositAmountSection({
  currency,
  amount,
  feePercentage,
  receiveAmount,
  convertedReceiveAmount,
  exchangeRate,
  isExchangeRateLoading,
  exchangeRateError,
  onCurrencyChange,
  onAmountChange,
}: DepositAmountSectionProps) {
  return (
    <Card
      bordered={false}
      className="!rounded-2xl !border-0 !bg-white !shadow-[0_1px_4px_rgba(76,29,149,0.04)]"
      styles={{
        body: {
          padding: "6px 10px",
        },
      }}
    >
      <StepHeading
        number={3}
        title="Enter Deposit Amount"
      />

      <div className="mt-1 flex flex-col gap-3 sm:flex-row">
        <Form.Item
          name="currency"
          className="!mb-0 sm:!w-[130px]"
        >
          <Select
            value={currency}
            options={currencyOptions}
            onChange={onCurrencyChange}
            className="funds-control-select !w-full"
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
                if (typeof value !== "number") {
                  return Promise.resolve();
                }

                if (value <= 0) {
                  return Promise.reject(
                    new Error("Enter a deposit amount greater than zero"),
                  );
                }

                if (feePercentage === undefined) {
                  return Promise.resolve();
                }

                const amountAfterFees =
                  value * (1 - feePercentage / 100);
                const accountReceiveAmount =
                  exchangeRate !== undefined && exchangeRate > 0
                    ? amountAfterFees / exchangeRate
                    : undefined;

                if (
                  accountReceiveAmount === undefined ||
                  accountReceiveAmount >= MINIMUM_ACCOUNT_DEPOSIT_USD
                ) {
                  return Promise.resolve();
                }

                const minimumPaymentAmount =
                  (MINIMUM_ACCOUNT_DEPOSIT_USD * (exchangeRate ?? 1)) /
                  (1 - feePercentage / 100);

                return Promise.reject(
                  new Error(
                    `Enter at least ${formatMoney(minimumPaymentAmount, currency)} so the account receives 10.00 USD`,
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
            className="funds-amount-input !w-full"
            styles={{
              input: {
                fontSize: 18,
                fontWeight: 600,
              },
            }}
          />
        </Form.Item>
      </div>

      <div className="mt-3 rounded-xl bg-gradient-to-r from-violet-50 via-white to-blue-50 px-4 py-3 shadow-[0_1px_4px_rgba(76,29,149,0.04)]">
        <div className="grid gap-4 sm:grid-cols-3 sm:items-center">
          <div>
            <p className="m-0 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              You pay
            </p>
            <p className="m-0 mt-1 text-base font-bold text-slate-950">
              {formatMoney(receiveAmount, currency)}
            </p>
          </div>

          <div className="sm:text-center">
            <p className="m-0 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Exchange rate
            </p>
            <div className="mt-1 text-sm font-bold text-violet-700">
              {isExchangeRateLoading && "Loading..."}
              {exchangeRateError && (
                <Text type="danger" className="!text-xs">
                  Rate unavailable
                </Text>
              )}
              {!isExchangeRateLoading &&
                !exchangeRateError &&
                (exchangeRate !== undefined ? (
                  <span>
                    1 USD ={" "}
                    {exchangeRate.toLocaleString("en-US", {
                      maximumFractionDigits: 8,
                    })} {currency}
                  </span>
                ) : (
                  <Text type="secondary" className="!text-xs">
                    Rate unavailable
                  </Text>
                ))}
            </div>
          </div>

          <div className="sm:text-right">
            <p className="m-0 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Account receives
            </p>
            {convertedReceiveAmount === undefined ? (
              <p className="m-0 mt-1 text-sm font-semibold text-slate-500">—</p>
            ) : (
              <p
                className={`m-0 mt-1 text-lg font-bold ${
                  amount > 0 &&
                  convertedReceiveAmount < MINIMUM_ACCOUNT_DEPOSIT_USD
                    ? "text-red-600"
                    : "text-emerald-600"
                }`}
              >
                {formatMoney(convertedReceiveAmount, "USD")}
              </p>
            )}
          </div>
        </div>

        {amount > 0 &&
          convertedReceiveAmount !== undefined &&
          convertedReceiveAmount < MINIMUM_ACCOUNT_DEPOSIT_USD && (
            <p className="m-0 mt-2 border-t border-red-100 pt-2 text-xs font-medium text-red-600">
              Minimum account deposit is 10.00 USD.
            </p>
          )}
      </div>
    </Card>
  );
}

type DepositSummaryProps = {
  account?: TradingAccount;
  method: DepositMethod;
  amount: number;
  fee?: number;
  convertedReceiveAmount?: number;
  currency: CurrencyCode;
};

function DepositSummary({
  account,
  method,
  amount,
  fee,
  convertedReceiveAmount,
  currency,
}: DepositSummaryProps) {
  return (
    <div className="flex flex-col gap-2">
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
                  {account?.accountNumber ?? "No account selected"}
                </p>

                <p className="m-0 mt-1 text-xs text-slate-400">
                  {account
                    ? `${account.platform} · ${account.currency}`
                    : "—"}
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
            value={fee === undefined ? "—" : formatMoney(fee, currency)}
          />

          <SummaryDivider />

          <SummaryRow
            label="You Will Receive"
            value={
              <span className="text-lg font-bold text-emerald-400">
                {convertedReceiveAmount === undefined
                  ? "—"
                  : formatMoney(convertedReceiveAmount, "USD")}
              </span>
            }
          />
        </div>


      </Card>

      {/* <Card
        bordered={false}
        className="!rounded-2xl !border !border-emerald-100 !bg-emerald-50/70"
        styles={{
          body: {
            padding: 10,
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
      </Card> */}
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
