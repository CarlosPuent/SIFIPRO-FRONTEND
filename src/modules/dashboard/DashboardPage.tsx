import { useCallback, useEffect, useMemo, useState } from "react";
import { appNavigation } from "../../app/router/routes";
import { useAuth } from "../../auth/useAuth";
import { SurfaceCard } from "../../components/ui/SurfaceCard";
import { extractErrorMessage } from "../../lib/error-utils";
import { formatNumber } from "../../lib/formatters";
import { useProgram } from "../program-config/ProgramContext";
import { DashboardQuickActions } from "./components/DashboardQuickActions";
import { LowStockRewardsTable } from "./components/LowStockRewardsTable";
import { MetricCard } from "./components/MetricCard";
import { RecentRedemptionsTable } from "./components/RecentRedemptionsTable";
import { RecentTransactionsTable } from "./components/RecentTransactionsTable";
import { fetchOperationalDashboardData } from "./dashboard.service";
import type {
  DashboardOperationalData,
  DashboardScopeSummary,
} from "./dashboard.types";

function buildMetricItems(summary: DashboardScopeSummary) {
  return [
    {
      label: "Customers in Tenant",
      value: formatNumber(summary.tenantCustomers),
    },
    {
      label: "Active Customers in Tenant",
      value: formatNumber(summary.tenantActiveCustomers),
    },
    {
      label: "Rewards in Program",
      value: formatNumber(summary.programRewards),
    },
    {
      label: "Transactions in Program",
      value: formatNumber(summary.programTransactions),
    },
    {
      label: "Redemptions in Program",
      value: formatNumber(summary.programRedemptions),
    },
  ];
}

function DashboardLoadingState() {
  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <div className="h-7 w-64 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-4 w-lg max-w-full animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-24 animate-pulse rounded-2xl border border-slate-200/80 bg-white/80 dark:border-slate-800/80 dark:bg-slate-900/70"
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-28 animate-pulse rounded-2xl border border-slate-200/80 bg-white/80 dark:border-slate-800/80 dark:bg-slate-900/70"
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="h-72 animate-pulse rounded-2xl border border-slate-200/80 bg-white/80 dark:border-slate-800/80 dark:bg-slate-900/70" />
        <div className="h-72 animate-pulse rounded-2xl border border-slate-200/80 bg-white/80 dark:border-slate-800/80 dark:bg-slate-900/70" />
      </div>
    </section>
  );
}

type DashboardErrorStateProps = {
  message: string;
  onRetry: () => void;
};

function DashboardErrorState({ message, onRetry }: DashboardErrorStateProps) {
  return (
    <SurfaceCard className="p-8">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
        Failed to load dashboard
      </h2>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
        {message}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 inline-flex rounded-lg border border-slate-300 bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:border-slate-400 hover:bg-slate-800 dark:border-slate-600 dark:bg-slate-100 dark:text-slate-900 dark:hover:border-slate-500 dark:hover:bg-white"
      >
        Retry
      </button>
    </SurfaceCard>
  );
}

type DashboardProgramSelectionStateProps = {
  isLoadingPrograms: boolean;
  programsError: string | null;
};

function DashboardProgramSelectionState({
  isLoadingPrograms,
  programsError,
}: DashboardProgramSelectionStateProps) {
  return (
    <SurfaceCard className="p-8">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
        {isLoadingPrograms ? "Loading programs" : "No program selected"}
      </h2>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
        {isLoadingPrograms
          ? "Please wait while we resolve available programs for this tenant."
          : "Select a program from the header to load program-scoped operational metrics and activity."}
      </p>
      {programsError ? (
        <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">
          {programsError}
        </p>
      ) : null}
    </SurfaceCard>
  );
}

export function DashboardPage() {
  const { user } = useAuth();
  const { currentProgram, isLoadingPrograms, programsError } = useProgram();
  const currentProgramId = currentProgram?.id ?? null;
  const [dashboardData, setDashboardData] =
    useState<DashboardOperationalData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const hasProgramConfigRoute = useMemo(
    () => appNavigation.some((item) => item.path === "/program-config"),
    [],
  );

  const roleTitle = user?.role === "ADMIN" ? "ADMIN" : "STAFF";
  const tenantName = user?.tenant.name ?? "Tenant unavailable";

  const loadDashboard = useCallback(async () => {
    if (!currentProgramId) {
      setDashboardData(null);
      setErrorMessage(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await fetchOperationalDashboardData(currentProgramId);
      setDashboardData(data);
    } catch (error) {
      const message = extractErrorMessage(error, "Unexpected dashboard error.");
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }, [currentProgramId]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const metricItems = useMemo(() => {
    if (!dashboardData) {
      return [];
    }

    return buildMetricItems(dashboardData.summary);
  }, [dashboardData]);

  const welcomeTitle = useMemo(() => {
    if (!user) {
      return "Welcome";
    }

    return `Welcome, ${user.firstName} ${user.lastName}`;
  }, [user]);

  const welcomeSubtitle = useMemo(() => {
    if (roleTitle === "ADMIN") {
      return "Command-center overview for tenant operations with program-aware activity and inventory.";
    }

    return "Operational workspace scoped to the authenticated tenant and the currently selected program.";
  }, [roleTitle]);

  return (
    <section className="space-y-6">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.9fr)] xl:items-start">
        <header className="space-y-2 rounded-2xl border border-slate-200/80 bg-white/75 px-5 py-4 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/65">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
            Dashboard
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-[2rem]">
            {welcomeTitle}
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
            {welcomeSubtitle}
          </p>
        </header>

        <SurfaceCard className="p-4 sm:p-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                Tenant
              </p>
              <p className="mt-1.5 text-sm font-semibold text-slate-800 dark:text-slate-100">
                {tenantName}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                Current Program
              </p>
              <p className="mt-1.5 text-sm font-semibold text-slate-800 dark:text-slate-100">
                {currentProgram?.programName ?? "Select a program"}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                Operational Role
              </p>
              <p className="mt-1.5 text-sm font-semibold text-slate-800 dark:text-slate-100">
                {roleTitle}
              </p>
            </div>
          </div>
          <div className="mt-3 h-px bg-slate-200/80 dark:bg-slate-800/80" />
          <p className="mt-3 text-xs leading-5 text-slate-500 dark:text-slate-400">
            Customer totals remain tenant-scoped. Rewards, transactions,
            redemptions, and low-stock inventory are scoped to the selected
            program.
          </p>
        </SurfaceCard>
      </div>

      {isLoading ? <DashboardLoadingState /> : null}

      {!isLoading && !currentProgram ? (
        <DashboardProgramSelectionState
          isLoadingPrograms={isLoadingPrograms}
          programsError={programsError}
        />
      ) : null}

      {!isLoading && currentProgram && errorMessage ? (
        <DashboardErrorState message={errorMessage} onRetry={loadDashboard} />
      ) : null}

      {!isLoading && currentProgram && !errorMessage && !dashboardData ? (
        <DashboardErrorState
          message="Dashboard data is unavailable."
          onRetry={loadDashboard}
        />
      ) : null}

      {!isLoading && currentProgram && !errorMessage && dashboardData ? (
        <>
          <section className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                Operational Metrics
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Scoped to tenant and selected program
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
              {metricItems.map((metric) => (
                <MetricCard
                  key={metric.label}
                  label={metric.label}
                  value={metric.value}
                />
              ))}
            </div>
          </section>

          <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <RecentTransactionsTable
              transactions={dashboardData.recentTransactions}
            />
            <RecentRedemptionsTable
              redemptions={dashboardData.recentRedemptions}
            />
          </section>

          <LowStockRewardsTable rewards={dashboardData.lowStockRewards} />
        </>
      ) : null}

      <DashboardQuickActions
        role={roleTitle}
        hasProgramConfigRoute={hasProgramConfigRoute}
      />
    </section>
  );
}
