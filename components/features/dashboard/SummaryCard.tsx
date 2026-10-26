"use client";

import { cn, formatCurrency } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface SummaryCardProps {
  title: string;
  amount: number;
  currency: string;
  type: "balance" | "expense" | "income";
  isLoading?: boolean;
}

export default function SummaryCard({
  title,
  amount,
  currency,
  type,
  isLoading,
}: SummaryCardProps) {
  const isPositive = amount >= 0;

  const amountColor =
    type === "balance"
      ? isPositive
        ? "text-success"
        : "text-danger"
      : type === "expense"
      ? "text-danger"
      : "text-success";

  return (
    <Card>
      <CardContent className="pt-6">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-36" />
          </div>
        ) : (
          <div>
            <p className="text-sm text-text-muted font-medium">{title}</p>
            <p className={cn("text-2xl font-bold mt-1", amountColor)}>
              {type === "balance" && amount > 0 ? "+" : ""}
              {formatCurrency(currency, amount)}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
