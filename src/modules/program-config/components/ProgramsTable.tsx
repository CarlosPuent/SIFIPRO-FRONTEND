import { SurfaceCard } from "../../../components/ui/SurfaceCard";
import {
  formatDateTime,
  formatNumber,
  formatPoints,
} from "../../../lib/formatters";
import type { ProgramConfigResponse } from "../program-config.types";
import { ProgramStatusBadge } from "./ProgramStatusBadge";

type ProgramsTableProps = {
  programs: ProgramConfigResponse[];
  statusActionProgramId: number | null;
  onEdit: (program: ProgramConfigResponse) => void;
  onToggleStatus: (program: ProgramConfigResponse) => void;
};

export function ProgramsTable({
  programs,
  statusActionProgramId,
  onEdit,
  onToggleStatus,
}: ProgramsTableProps) {
  return (
    <SurfaceCard className="overflow-hidden p-0">
      <div className="flex items-center justify-between border-b border-slate-200/80 px-5 py-4 dark:border-slate-800/80">
        <h2 className="text-sm font-semibold tracking-wide text-slate-800 dark:text-slate-100">
          Tenant Programs
        </h2>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          Total: {programs.length}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead className="bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-900/50 dark:text-slate-400">
            <tr>
              <th className="px-5 py-3 font-medium">Program</th>
              <th className="px-5 py-3 font-medium">Points/$</th>
              <th className="px-5 py-3 font-medium">Min Purchase</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Created</th>
              <th className="px-5 py-3 font-medium">Updated</th>
              <th className="px-5 py-3 font-medium">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200/80 text-sm dark:divide-slate-800/80">
            {programs.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-5 py-8 text-center text-sm text-slate-500 dark:text-slate-400"
                >
                  No programs available for this tenant.
                </td>
              </tr>
            ) : (
              programs.map((program) => {
                const isStatusActionLoading =
                  statusActionProgramId === program.id;

                return (
                  <tr key={program.id}>
                    <td className="px-5 py-3.5 font-medium text-slate-800 dark:text-slate-100">
                      {program.programName}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">
                      {formatPoints(program.pointsPerDollar)}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">
                      {formatNumber(program.minimumPurchaseAmount, 2)}
                    </td>
                    <td className="px-5 py-3.5">
                      <ProgramStatusBadge active={program.active} />
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">
                      {formatDateTime(program.createdAt)}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">
                      {formatDateTime(program.updatedAt)}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onEdit(program)}
                          className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => onToggleStatus(program)}
                          disabled={isStatusActionLoading}
                          className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800"
                        >
                          {isStatusActionLoading
                            ? "Saving..."
                            : program.active
                              ? "Deactivate"
                              : "Activate"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </SurfaceCard>
  );
}
