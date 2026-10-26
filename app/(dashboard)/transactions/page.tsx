"use client";

import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { useAuthStore } from "@/store/auth.store";
import {
  useMonthlyMatrix,
  useYearlyMatrix,
} from "@/hooks/useTransactionMatrix";
import { useTransactionsForPeriod } from "@/hooks/useTransactions";
import DailySummaryBar from "@/components/features/transactions/DailySummaryBar";
import PeriodSelector from "@/components/features/transactions/PeriodSelector";
import TransactionMatrixTable from "@/components/features/transactions/TransactionMatrixTable";

export default function TransactionsPage() {
  const { user } = useAuthStore();
  const currency = user?.currency ?? "EUR";

  const now = new Date();
  const [year, setYear] = useQueryState(
    "year",
    parseAsInteger.withDefault(now.getFullYear()),
  );
  const [month, setMonth] = useQueryState(
    "month",
    parseAsInteger.withDefault(now.getMonth() + 1),
  );
  const [view, setView] = useQueryState(
    "view",
    parseAsString.withDefault("month"),
  );
  const [memberId, setMemberId] = useQueryState("memberId");

  const isMonthView = view === "month";

  const { data: monthlyData, isLoading: monthlyLoading } = useMonthlyMatrix(year, month, memberId);
  const { data: yearlyData, isLoading: yearlyLoading } = useYearlyMatrix(year, memberId);
  const { data: periodTransactions = [] } = useTransactionsForPeriod(
    year,
    isMonthView ? month : null,
    memberId,
  );

  const matrixData = isMonthView ? monthlyData : yearlyData;
  const matrixLoading = isMonthView ? monthlyLoading : yearlyLoading;
  const grandTotal = matrixData?.grandTotal;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">Transactions</h1>
        <p className="text-text-muted text-sm mt-1">Track and manage your expenses and income</p>
      </div>

      <DailySummaryBar
        summary={grandTotal}
        currency={currency}
        isLoading={matrixLoading}
      />

      <PeriodSelector
        year={year}
        month={month}
        view={view}
        onYearChange={setYear}
        onMonthChange={setMonth}
        onViewChange={setView}
        memberId={memberId}
        onMemberChange={setMemberId}
      />

      <TransactionMatrixTable
        data={matrixData}
        isLoading={matrixLoading}
        currency={currency}
        view={isMonthView ? "month" : "year"}
        transactions={periodTransactions}
      />
    </div>
  );
}
