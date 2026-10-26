"use client";

import { useAuthStore } from "@/store/auth.store";
import { useDashboardSummary } from "@/hooks/useTransactionMatrix";
import SummaryCard from "@/components/features/dashboard/SummaryCard";
import RecentTransactionsList from "@/components/features/dashboard/RecentTransactionsList";
import CategoryDonutChart from "@/components/features/dashboard/CategoryDonutChart";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { data: summary, isLoading } = useDashboardSummary();

  const currency = user?.currency ?? "EUR";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">Dashboard</h1>
        <p className="text-text-muted text-sm mt-1">
          Your financial overview for this month
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard
          title="Balance"
          amount={summary?.totalBalance ?? 0}
          currency={currency}
          type="balance"
          isLoading={isLoading}
        />
        <SummaryCard
          title="Total Expenses"
          amount={summary?.totalExpenses ?? 0}
          currency={currency}
          type="expense"
          isLoading={isLoading}
        />
        <SummaryCard
          title="Total Incomes"
          amount={summary?.totalIncomes ?? 0}
          currency={currency}
          type="income"
          isLoading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CategoryDonutChart
          data={summary?.expensesByCategory ?? []}
          currency={currency}
        />
        <RecentTransactionsList
          transactions={summary?.recentTransactions ?? []}
          currency={currency}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
