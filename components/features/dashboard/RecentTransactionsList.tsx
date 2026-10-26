"use client";

import Link from "next/link";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Transaction } from "@/types";

interface RecentTransactionsListProps {
  transactions: Transaction[];
  currency: string;
  isLoading?: boolean;
}

export default function RecentTransactionsList({
  transactions,
  currency,
  isLoading,
}: RecentTransactionsListProps) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Recent Transactions</CardTitle>
          <Link
            href="/transactions"
            className="text-sm text-primary hover:underline"
          >
            View all
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <p className="text-sm text-text-muted text-center py-8">
            No transactions yet
          </p>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {tx.description ?? tx.category?.name ?? "Transaction"}
                  </p>
                  <p className="text-xs text-text-muted">
                    {formatDate(tx.date)}
                    {tx.category && ` · ${tx.category.name}`}
                  </p>
                </div>
                <span
                  className={cn(
                    "text-sm font-semibold ml-4 shrink-0",
                    tx.type === "INCOME" ? "text-success" : "text-danger"
                  )}
                >
                  {tx.type === "INCOME" ? "+" : "-"}
                  {formatCurrency(currency, parseFloat(tx.amount))}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
