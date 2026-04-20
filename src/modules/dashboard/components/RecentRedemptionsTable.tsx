import { SurfaceCard } from "../../../components/ui/SurfaceCard";
import { formatDateTime, formatPoints } from "../../../lib/formatters";
import type { DashboardRedemptionResponse } from "../dashboard.types";

type RecentRedemptionsTableProps = {
  redemptions: DashboardRedemptionResponse[];
};

export function RecentRedemptionsTable({
  redemptions,
}: RecentRedemptionsTableProps) {
  return (
    <SurfaceCard className="overflow-hidden p-0">
      <div className="flex items-center justify-between border-b border-slate-200/80 px-5 py-4 dark:border-slate-800/80">
        <h2 className="text-sm font-semibold tracking-wide text-slate-800 dark:text-slate-100">
          Recent Redemptions
        </h2>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          Latest 5
        </span>
      </div>

      {redemptions.length === 0 ? (
        <p className="px-5 py-10 text-sm text-slate-500 dark:text-slate-400">
          No recent redemptions available.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-900/50 dark:text-slate-400">
              <tr>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Reward</th>
                <th className="px-5 py-3 font-medium">Redemption Date</th>
                <th className="px-5 py-3 font-medium">Points Used</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80 text-sm dark:divide-slate-800/80">
              {redemptions.map((redemption) => (
                <tr key={redemption.id}>
                  <td className="px-5 py-3.5 font-medium text-slate-800 dark:text-slate-100">
                    {redemption.customerFullName}
                  </td>
                  <td className="px-5 py-3.5 text-slate-700 dark:text-slate-200">
                    {redemption.rewardName}
                  </td>
                  <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">
                    {formatDateTime(redemption.redemptionDate)}
                  </td>
                  <td className="px-5 py-3.5 text-slate-700 dark:text-slate-200">
                    {formatPoints(redemption.pointsUsed)}
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
