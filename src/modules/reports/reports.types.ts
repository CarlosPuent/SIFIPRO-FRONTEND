export interface DashboardSummaryResponse {
  totalCustomers: number;
  totalActiveCustomers: number;
  totalRewards: number;
  totalActiveRewards: number;
  totalTransactions: number;
  totalRedemptions: number;
  totalPointsIssued: number | string;
  totalPointsRedeemed: number | string;
}

export interface TopCustomerResponse {
  customerId: number;
  customerFullName: string;
  email: string;
  pointsBalance: number | string;
  active: boolean;
}

export interface TopRedeemedRewardResponse {
  rewardId: number;
  rewardName: string;
  totalRedemptions: number;
}
