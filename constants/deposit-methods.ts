export type DepositMethodId =
  | "bank-transfer"
  | "card"
  | "usdt"
  | "skrill"
  | "stripe";

export type DepositMethod = {
  id: DepositMethodId;
  title: string;
  processingTime: string;
  feeLabel: string;
  feePercentage?: number;
  recommended?: boolean;
};

export const depositMethods: readonly DepositMethod[] = [
  {
    id: "bank-transfer",
    title: "Bank Transfer",
    processingTime: "1–3 Business Days",
    feeLabel: "No Fees",
    feePercentage: 0,
    recommended: false,
  },
  {
    id: "card",
    title: "Credit / Debit Card",
    processingTime: "Instant",
    feeLabel: "2.5% Fee",
    feePercentage: 2.5,
  },
  {
    id: "skrill",
    title: "Skrill",
    processingTime: "Instant",
    feeLabel: "1.0% Fee",
    feePercentage: 1,
  },
  {
    id: "usdt",
    title: "USDT (TRC20)",
    processingTime: "Instant",
    feeLabel: "No Fees",
    feePercentage: 0,
  },
  {
    id: "stripe",
    title: "Stripe",
    processingTime: "Secure Online Payment",
    feeLabel: "Fee unavailable",
  },
];
