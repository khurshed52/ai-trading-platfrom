import { AccountBalancesCard } from "./account-balances-card";
import { TransactionActivityCard } from "./transaction-activity-card";
import { TransactionStatusCard } from "./transaction-status-card";

export function DashboardAnalytics() {
  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(360px,1fr)] sm:gap-5">
        <TransactionActivityCard />
        <TransactionStatusCard />
      </div>
      <AccountBalancesCard />
    </div>
  );
}
