import { SurfaceCard } from "../../../components/ui/SurfaceCard";
import { formatPoints } from "../../../lib/formatters";
import type { DashboardRewardResponse } from "../dashboard.types";

type LowStockRewardsTableProps = {
  rewards: DashboardRewardResponse[];
};

export function LowStockRewardsTable({ rewards }: LowStockRewardsTableProps) {
  return (
    <SurfaceCard className="overflow-hidden p-0">
      <div className="flex items-center justify-between border-b border-slate-200/80 px-5 py-4 dark:border-slate-800/80">
        <h2 className="text-sm font-semibold tracking-wide text-slate-800 dark:text-slate-100">
          Low Stock Rewards
        </h2>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          Stock ≤ 5
        </span>
      </div>

      {rewards.length === 0 ? (
        <p className="px-5 py-10 text-sm text-slate-500 dark:text-slate-400">
          No low-stock rewards at the moment.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-900/50 dark:text-slate-400">
              <tr>
                <th className="px-5 py-3 font-medium">Reward</th>
                <th className="px-5 py-3 font-medium">Stock</th>
                <th className="px-5 py-3 font-medium">Required Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80 text-sm dark:divide-slate-800/80">
              {rewards.map((reward) => (
                <tr key={reward.id}>
                  <td className="px-5 py-3.5 font-medium text-slate-800 dark:text-slate-100">
                    {reward.name}
                  </td>
                  <td className="px-5 py-3.5 text-slate-700 dark:text-slate-200">
                    {reward.stock}
                  </td>
                  <td className="px-5 py-3.5 text-slate-700 dark:text-slate-200">
                    {formatPoints(reward.requiredPoints)}
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
