"use client";

import { formatCurrency } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import type { MatrixGrandTotal } from "@/types";

interface DailySummaryBarProps {
  summary: MatrixGrandTotal | undefined;
  currency: string;
  isLoading?: boolean;
}

export default function DailySummaryBar({
  summary,
  currency,
  isLoading,
}: DailySummaryBarProps) {
  const balance = summary?.balance ?? 0;

  return (
    <div className="bg-surface border border-gray-200 rounded-xl px-6 py-4">
      <div className="flex flex-wrap gap-6">
        <div>
          <p className="text-xs text-text-muted font-medium uppercase tracking-wide">
            Expenses
          </p>
          {isLoading ? (
            <Skeleton className="h-6 w-24 mt-1" />
          ) : (
            <p className="text-lg font-semibold text-danger mt-0.5">
              {formatCurrency(currency, summary?.expense ?? 0)}
            </p>
          )}
        </div>

        <div>
          <p className="text-xs text-text-muted font-medium uppercase tracking-wide">
            Income
          </p>
          {isLoading ? (
            <Skeleton className="h-6 w-24 mt-1" />
          ) : (
            <p className="text-lg font-semibold text-success mt-0.5">
              {formatCurrency(currency, summary?.income ?? 0)}
            </p>
          )}
        </div>

        <div>
          <p className="text-xs text-text-muted font-medium uppercase tracking-wide">
            Balance
          </p>
          {isLoading ? (
            <Skeleton className="h-6 w-24 mt-1" />
          ) : (
            <p
              className={`text-lg font-semibold mt-0.5 ${
                balance >= 0 ? "text-success" : "text-danger"
              }`}
            >
              {balance >= 0 ? "+" : ""}
              {formatCurrency(currency, balance)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
