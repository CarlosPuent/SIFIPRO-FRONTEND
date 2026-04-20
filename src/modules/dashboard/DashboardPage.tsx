import { useCallback, useEffect, useMemo, useState } from "react";
import { appNavigation } from "../../app/router/routes";
import { useAuth } from "../../auth/useAuth";
import { SurfaceCard } from "../../components/ui/SurfaceCard";
import { extractErrorMessage } from "../../lib/error-utils";
import { formatNumber } from "../../lib/formatters";
import { DashboardQuickActions } from "./components/DashboardQuickActions";
import { LowStockRewardsTable } from "./components/LowStockRewardsTable";
import { MetricCard } from "./components/MetricCard";
import { RecentRedemptionsTable } from "./components/RecentRedemptionsTable";
import { RecentTransactionsTable } from "./components/RecentTransactionsTable";
import { fetchOperationalDashboardData } from "./dashboard.service";
import type {
  DashboardOperationalData,
  DashboardSummaryResponse,
} from "./dashboard.types";

function buildMetricItems(summary: DashboardSummaryResponse) {
  return [
    {
      label: "Total Customers",
      value: formatNumber(summary.totalCustomers),
    },
    {
      label: "Active Customers",
      value: formatNumber(summary.totalActiveCustomers),
    },
    { label: "Total Rewards", value: formatNumber(summary.totalRewards) },
    {
      label: "Total Redemptions",
      value: formatNumber(summary.totalRedemptions),
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

export function DashboardPage() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] =
    useState<DashboardOperationalData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const hasProgramConfigRoute = useMemo(
    () => appNavigation.some((item) => item.path === "/program-config"),
    [],
  );

  const roleTitle = user?.role === "ADMIN" ? "ADMIN" : "STAFF";

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await fetchOperationalDashboardData();
      setDashboardData(data);
    } catch (error) {
      const message = extractErrorMessage(error, "Unexpected dashboard error.");
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

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
      return "Command-center overview for platform management, team coordination, and operational control.";
    }

    return "Operational workspace for customer activity, transaction processing, and redemption handling.";
  }, [roleTitle]);

  if (isLoading) {
    return <DashboardLoadingState />;
  }

  if (errorMessage) {
    return (
      <DashboardErrorState message={errorMessage} onRetry={loadDashboard} />
    );
  }

  if (!dashboardData) {
    return (
      <DashboardErrorState
        message="Dashboard data is unavailable."
        onRetry={loadDashboard}
      />
    );
  }

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
          {welcomeTitle}
        </h1>
        <p className="max-w-3xl text-sm text-slate-600 dark:text-slate-300 sm:text-base">
          {welcomeSubtitle}
        </p>
      </header>

      <SurfaceCard className="p-4 sm:p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Operational Role
        </p>
        <p className="mt-2 text-sm font-medium text-slate-800 dark:text-slate-100">
          {roleTitle}
        </p>
      </SurfaceCard>

      <DashboardQuickActions
        role={roleTitle}
        hasProgramConfigRoute={hasProgramConfigRoute}
      />

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Operational Metrics
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
        <RecentRedemptionsTable redemptions={dashboardData.recentRedemptions} />
      </section>

      <LowStockRewardsTable rewards={dashboardData.lowStockRewards} />
    </section>
  );
}
