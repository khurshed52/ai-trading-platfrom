export interface TransactionActivityDatum {
  month: string;
  deposits: number;
  withdrawals: number;
  transfers: number;
}

export interface TransactionStatusDatum {
  name: string;
  value: number;
  color: string;
}

export interface AccountBalanceDatum {
  account: string;
  currency: string;
  balance: number;
}

export interface DashboardSummaryDatum {
  amount: number;
  currency: string;
  totalProfit: number;
  totalLots: number;
  totalSwaps: number;
  totalOpenPositions: number;
}

export const dashboardSummaryData: DashboardSummaryDatum = {
  amount: 1250,
  currency: "USD",
  totalProfit: 320,
  totalLots: 4.25,
  totalSwaps: -12.5,
  totalOpenPositions: 3,
};

export const transactionActivityData: TransactionActivityDatum[] = [
  { month: "May", deposits: 3800, withdrawals: 1900, transfers: 1100 },
  { month: "Jun", deposits: 4700, withdrawals: 2700, transfers: 1550 },
  { month: "Jul", deposits: 3600, withdrawals: 1450, transfers: 1150 },
  { month: "Aug", deposits: 5500, withdrawals: 2800, transfers: 1950 },
  { month: "Sep", deposits: 4650, withdrawals: 2350, transfers: 1350 },
  { month: "Oct", deposits: 6400, withdrawals: 2900, transfers: 1700 },
];

export const transactionStatusData: TransactionStatusDatum[] = [
  { name: "Completed", value: 42, color: "#08ad6c" },
  { name: "Pending", value: 8, color: "#ffb020" },
  { name: "Failed", value: 3, color: "#f04448" },
  { name: "Rejected", value: 2, color: "#94a3b8" },
];

export const accountBalanceData: AccountBalanceDatum[] = [
  { account: "33587952", currency: "USD", balance: 5400 },
  { account: "44587953", currency: "EUR", balance: 3200 },
  { account: "55687954", currency: "USD", balance: 3850 },
];
