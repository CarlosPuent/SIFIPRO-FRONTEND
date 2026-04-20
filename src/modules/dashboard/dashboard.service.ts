import { apiClient } from '../../lib/api-client';
import type {
  DashboardData,
  DashboardOperationalData,
  DashboardRedemptionResponse,
  DashboardRewardResponse,
  DashboardSummaryResponse,
  DashboardTransactionResponse,
  TopCustomerResponse,
  TopRedeemedRewardResponse,
} from './dashboard.types';

const LOW_STOCK_THRESHOLD = 5;

function getComparableTimestamp(dateValue: string | undefined): number {
  if (!dateValue) {
    return 0;
  }

  const parsed = new Date(dateValue).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

export async function fetchDashboardData(): Promise<DashboardData> {
  const [summaryResponse, topCustomersResponse, topRewardsResponse] = await Promise.all([
    apiClient.get<DashboardSummaryResponse>('/api/reports/dashboard'),
    apiClient.get<TopCustomerResponse[]>('/api/reports/top-customers'),
    apiClient.get<TopRedeemedRewardResponse[]>('/api/reports/top-redeemed-rewards'),
  ]);

  return {
    summary: summaryResponse.data,
    topCustomers: Array.isArray(topCustomersResponse.data) ? topCustomersResponse.data : [],
    topRedeemedRewards: Array.isArray(topRewardsResponse.data) ? topRewardsResponse.data : [],
  };
}

export async function fetchOperationalDashboardData(): Promise<DashboardOperationalData> {
  const [summaryResponse, transactionsResponse, redemptionsResponse, rewardsResponse] =
    await Promise.all([
      apiClient.get<DashboardSummaryResponse>('/api/reports/dashboard'),
      apiClient.get<DashboardTransactionResponse[]>('/api/transactions'),
      apiClient.get<DashboardRedemptionResponse[]>('/api/redemptions'),
      apiClient.get<DashboardRewardResponse[]>('/api/rewards'),
    ]);

  const transactions = Array.isArray(transactionsResponse.data)
    ? transactionsResponse.data
    : [];
  const redemptions = Array.isArray(redemptionsResponse.data)
    ? redemptionsResponse.data
    : [];
  const rewards = Array.isArray(rewardsResponse.data) ? rewardsResponse.data : [];

  const recentTransactions = [...transactions]
    .sort(
      (a, b) =>
        getComparableTimestamp(b.transactionDate ?? b.createdAt) -
        getComparableTimestamp(a.transactionDate ?? a.createdAt),
    )
    .slice(0, 5);

  const recentRedemptions = [...redemptions]
    .sort(
      (a, b) =>
        getComparableTimestamp(b.redemptionDate ?? b.createdAt) -
        getComparableTimestamp(a.redemptionDate ?? a.createdAt),
    )
    .slice(0, 5);

  const lowStockRewards = rewards
    .filter((reward) => reward.active && reward.stock <= LOW_STOCK_THRESHOLD)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 5);

  return {
    summary: summaryResponse.data,
    recentTransactions,
    recentRedemptions,
    lowStockRewards,
  };
}
