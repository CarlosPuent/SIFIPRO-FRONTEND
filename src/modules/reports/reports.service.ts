import { apiClient } from "../../lib/api-client";
import type {
  DashboardSummaryResponse,
  TopCustomerResponse,
  TopRedeemedRewardResponse,
} from "./reports.types";

export async function getDashboardSummary(): Promise<DashboardSummaryResponse> {
  const response = await apiClient.get<DashboardSummaryResponse>(
    "/api/reports/dashboard",
  );

  return response.data;
}

export async function getTopCustomers(): Promise<TopCustomerResponse[]> {
  const response = await apiClient.get<TopCustomerResponse[]>(
    "/api/reports/top-customers",
  );

  return Array.isArray(response.data) ? response.data : [];
}

export async function getTopRedeemedRewards(): Promise<TopRedeemedRewardResponse[]> {
  const response = await apiClient.get<TopRedeemedRewardResponse[]>(
    "/api/reports/top-redeemed-rewards",
  );

  return Array.isArray(response.data) ? response.data : [];
}
