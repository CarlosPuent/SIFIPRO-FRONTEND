import { SurfaceCard } from "../../../components/ui/SurfaceCard";
import { formatDateTime, formatNumber } from "../../../lib/formatters";
import type { DashboardTransactionResponse } from "../dashboard.types";

type RecentTransactionsTableProps = {
  transactions: DashboardTransactionResponse[];
};

export function RecentTransactionsTable({
  transactions,
}: RecentTransactionsTableProps) {
  return (
    <SurfaceCard className="overflow-hidden p-0">
      <div className="flex items-center justify-between border-b border-slate-200/80 px-5 py-4 dark:border-slate-800/80">
        <h2 className="text-sm font-semibold tracking-wide text-slate-800 dark:text-slate-100">
          Recent Transactions
        </h2>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          Latest 5
        </span>
      </div>

      {transactions.length === 0 ? (
        <p className="px-5 py-10 text-sm text-slate-500 dark:text-slate-400">
          No recent transactions available.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-900/50 dark:text-slate-400">
              <tr>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Amount</th>
                <th className="px-5 py-3 font-medium">Transaction Date</th>
                <th className="px-5 py-3 font-medium">Points Earned</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80 text-sm dark:divide-slate-800/80">
              {transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="px-5 py-3.5 font-medium text-slate-800 dark:text-slate-100">
                    {transaction.customerFullName}
                  </td>
                  <td className="px-5 py-3.5 text-slate-700 dark:text-slate-200">
                    {formatNumber(transaction.amount)}
                  </td>
                  <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">
                    {formatDateTime(transaction.transactionDate)}
                  </td>
                  <td className="px-5 py-3.5 text-slate-700 dark:text-slate-200">
                    {formatNumber(transaction.pointsEarned)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </SurfaceCard>
  );
}
