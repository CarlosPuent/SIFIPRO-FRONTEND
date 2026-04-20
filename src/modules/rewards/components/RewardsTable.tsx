import { SurfaceCard } from "../../../components/ui/SurfaceCard";
import { fallbackText, formatPoints } from "../../../lib/formatters";
import type { RewardResponse } from "../rewards.types";
import { RewardStatusBadge } from "./RewardStatusBadge";

type RewardsTableProps = {
  rewards: RewardResponse[];
  actionRewardId: number | null;
  onEdit: (reward: RewardResponse) => void;
  onToggleStatus: (reward: RewardResponse) => void;
};

function getDescriptionFallback(description: string | null): string {
  return fallbackText(description, "No description provided");
}

export function RewardsTable({
  rewards,
  actionRewardId,
  onEdit,
  onToggleStatus,
}: RewardsTableProps) {
  return (
    <SurfaceCard className="overflow-hidden p-0">
      <div className="flex items-center justify-between border-b border-slate-200/80 px-5 py-4 dark:border-slate-800/80">
        <h2 className="text-sm font-semibold tracking-wide text-slate-800 dark:text-slate-100">
          Rewards
        </h2>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          Total: {rewards.length}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead className="bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-900/50 dark:text-slate-400">
            <tr>
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Description</th>
              <th className="px-5 py-3 font-medium">Required Points</th>
              <th className="px-5 py-3 font-medium">Stock</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/80 text-sm dark:divide-slate-800/80">
            {rewards.map((reward) => {
              const isActionLoading = actionRewardId === reward.id;

              return (
                <tr key={reward.id}>
                  <td className="px-5 py-3.5 font-medium text-slate-800 dark:text-slate-100">
                    {reward.name}
                  </td>
                  <td className="max-w-sm px-5 py-3.5 text-slate-600 dark:text-slate-300">
                    <span className="line-clamp-2">
                      {getDescriptionFallback(reward.description)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-700 dark:text-slate-200">
                    {formatPoints(reward.requiredPoints)}
                  </td>
                  <td className="px-5 py-3.5 text-slate-700 dark:text-slate-200">
                    {reward.stock}
                  </td>
                  <td className="px-5 py-3.5">
                    <RewardStatusBadge active={reward.active} />
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(reward)}
                        className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onToggleStatus(reward)}
                        disabled={isActionLoading}
                        className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800"
                      >
                        {isActionLoading
                          ? "Saving..."
                          : reward.active
                            ? "Deactivate"
                            : "Activate"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </SurfaceCard>
  );
}
