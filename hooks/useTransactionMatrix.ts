import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  MonthlyMatrixResponse,
  YearlyMatrixResponse,
  DashboardSummary,
} from "@/types";

export function useMonthlyMatrix(year: number, month: number, memberId?: string | null) {
  return useQuery({
    queryKey: ["matrix-monthly", year, month, memberId ?? "all"],
    queryFn: async () => {
      const query: Record<string, unknown> = { year, month };
      if (memberId) query.householdMemberId = memberId;
      const { data, error } = await api<MonthlyMatrixResponse>(
        "/transactions/summary/monthly",
        { query }
      );
      if (error || !data) throw new Error(error?.message ?? "Failed to load monthly matrix");
      return data;
    },
  });
}

export function useYearlyMatrix(year: number, memberId?: string | null) {
  return useQuery({
    queryKey: ["matrix-yearly", year, memberId ?? "all"],
    queryFn: async () => {
      const query: Record<string, unknown> = { year };
      if (memberId) query.householdMemberId = memberId;
      const { data, error } = await api<YearlyMatrixResponse>(
        "/transactions/summary/yearly",
        { query }
      );
      if (error || !data) throw new Error(error?.message ?? "Failed to load yearly matrix");
      return data;
    },
  });
}

export function useDashboardSummary() {
  return useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: async () => {
      const { data, error } = await api<DashboardSummary>(
        "/transactions/summary/dashboard"
      );
      if (error || !data) throw new Error(error?.message ?? "Failed to load dashboard summary");
      return data;
    },
  });
}
