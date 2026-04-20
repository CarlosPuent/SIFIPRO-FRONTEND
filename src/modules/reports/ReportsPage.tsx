import { useCallback, useEffect, useMemo, useState } from "react";
import { InlineAlert } from "../../components/ui/InlineAlert";
import { SurfaceCard } from "../../components/ui/SurfaceCard";
import { extractErrorMessage } from "../../lib/error-utils";
import { formatNumber } from "../../lib/formatters";
import { ReportMetricCard } from "./components/ReportMetricCard";
import { TopCustomersReportTable } from "./components/TopCustomersReportTable";
import { TopRedeemedRewardsReportTable } from "./components/TopRedeemedRewardsReportTable";
import {
  getDashboardSummary,
  getTopCustomers,
  getTopRedeemedRewards,
} from "./reports.service";
import type {
  DashboardSummaryResponse,
  TopCustomerResponse,
  TopRedeemedRewardResponse,
} from "./reports.types";

type FeedbackState = {
  kind: "error";
  message: string;
} | null;

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
    {
      label: "Total Rewards",
      value: formatNumber(summary.totalRewards),
    },
    {
      label: "Active Rewards",
      value: formatNumber(summary.totalActiveRewards),
    },
    {
      label: "Total Transactions",
      value: formatNumber(summary.totalTransactions),
    },
    {
      label: "Total Redemptions",
      value: formatNumber(summary.totalRedemptions),
    },
    {
      label: "Total Points Issued",
      value: formatNumber(summary.totalPointsIssued),
    },
    {
      label: "Total Points Redeemed",
      value: formatNumber(summary.totalPointsRedeemed),
    },
  ];
}

function ReportsLoadingState() {
  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <div className="h-7 w-52 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-4 w-lg max-w-full animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
      </div>

      <div className="h-16 animate-pulse rounded-2xl border border-slate-200/80 bg-white/80 dark:border-slate-800/80 dark:bg-slate-900/70" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
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

type ReportsErrorStateProps = {
  message: string;
  onRetry: () => void;
};

function ReportsErrorState({ message, onRetry }: ReportsErrorStateProps) {
  return (
    <SurfaceCard className="p-8">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
        Failed to load reports
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

export function ReportsPage() {
  const [summary, setSummary] = useState<DashboardSummaryResponse | null>(null);
  const [topCustomers, setTopCustomers] = useState<TopCustomerResponse[]>([]);
  const [topRedeemedRewards, setTopRedeemedRewards] = useState<
    TopRedeemedRewardResponse[]
  >([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);

  const loadReports = useCallback(
    async (options?: { showLoader?: boolean }) => {
      const showLoader = options?.showLoader ?? false;

      if (showLoader) {
        setIsLoading(true);
        setLoadError(null);
      } else {
        setIsRefreshing(true);
        setFeedback(null);
      }

      try {
        const [summaryData, topCustomersData, topRedeemedRewardsData] =
          await Promise.all([
            getDashboardSummary(),
            getTopCustomers(),
            getTopRedeemedRewards(),
          ]);

        setSummary(summaryData);
        setTopCustomers(topCustomersData);
        setTopRedeemedRewards(topRedeemedRewardsData);
        setLastUpdatedAt(new Date());

        if (showLoader) {
          setLoadError(null);
        }
      } catch (error) {
        const message = extractErrorMessage(error);

        if (showLoader) {
          setLoadError(message);
        } else {
          setFeedback({
            kind: "error",
            message: `Could not refresh report data. ${message}`,
          });
        }
      } finally {
        if (showLoader) {
          setIsLoading(false);
        } else {
          setIsRefreshing(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    void loadReports({ showLoader: true });
  }, [loadReports]);

  const metricItems = useMemo(() => {
    if (!summary) {
      return [];
    }

    return buildMetricItems(summary);
  }, [summary]);

  const lastUpdatedLabel = useMemo(() => {
    if (!lastUpdatedAt) {
      return "Not yet updated";
    }

    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(lastUpdatedAt);
  }, [lastUpdatedAt]);

  const handleRetry = () => {
    void loadReports({ showLoader: true });
  };

  const handleRefresh = () => {
    void loadReports();
  };

  if (isLoading) {
    return <ReportsLoadingState />;
  }

  if (loadError) {
    return <ReportsErrorState message={loadError} onRetry={handleRetry} />;
  }

  if (!summary) {
    return (
      <ReportsErrorState
        message="Report data is unavailable."
        onRetry={handleRetry}
      />
    );
  }

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
          Reports
        </h1>
        <p className="max-w-3xl text-sm text-slate-600 dark:text-slate-300 sm:text-base">
          Formal operational reporting snapshot of customers, rewards,
          transactions, and redemption activity.
        </p>
      </header>

      {feedback ? (
        <InlineAlert tone="error" message={feedback.message} />
      ) : null}

      <SurfaceCard className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div>
          <h2 className="text-sm font-semibold tracking-wide text-slate-800 dark:text-slate-100">
            Report Summary
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Last updated: {lastUpdatedLabel}
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:border-slate-400 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:bg-slate-100 dark:text-slate-900 dark:hover:border-slate-500 dark:hover:bg-white"
        >
          {isRefreshing ? "Refreshing..." : "Refresh"}
        </button>
      </SurfaceCard>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Metrics Overview
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metricItems.map((metric) => (
            <ReportMetricCard
              key={metric.label}
              label={metric.label}
              value={metric.value}
            />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Ranking Reports
        </h2>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <TopCustomersReportTable customers={topCustomers} />
          <TopRedeemedRewardsReportTable rewards={topRedeemedRewards} />
        </div>
      </section>
    </section>
  );
}
