"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useDeleteTransaction } from "@/hooks/useTransactions";
import TransactionFormDialog from "./TransactionFormDialog";
import type { Transaction, TransactionType } from "@/types";

interface MatrixCellProps {
  value: number;
  type?: TransactionType;
  categoryId?: string;
  columnKey: string;
  year: number;
  month?: number;
  currency: string;
  transactions?: Transaction[];
}

export default function MatrixCell({
  value,
  type,
  currency,
  transactions = [],
}: MatrixCellProps) {
  const [editTx, setEditTx] = useState<Transaction | null>(null);
  const deleteMutation = useDeleteTransaction();

  if (value === 0) {
    return (
      <span className="text-text-muted select-none">—</span>
    );
  }

  const formatted = formatCurrency(currency, value);
  const isIncome = type === "INCOME";

  if (transactions.length === 0) {
    return (
      <span
        className={cn(
          "text-sm font-medium",
          isIncome ? "text-success" : "text-text-primary"
        )}
      >
        {formatted}
      </span>
    );
  }

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "text-sm font-medium hover:underline cursor-pointer",
              isIncome ? "text-success" : "text-text-primary"
            )}
          >
            {formatted}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
          <div className="p-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-text-primary">
              {transactions.length} transaction{transactions.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {transactions.map((tx) => {
              const memberName = tx.householdMember?.name;
              const initials = memberName
                ? memberName.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
                : null;
              return (
              <div
                key={tx.id}
                className="flex items-center justify-between p-3 border-b border-gray-50 last:border-0 hover:bg-gray-50"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    {initials && (
                      <span
                        className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/15 text-primary text-[10px] font-semibold shrink-0"
                        title={memberName}
                      >
                        {initials}
                      </span>
                    )}
                    <p className="text-sm font-medium text-text-primary truncate">
                      {tx.description ?? tx.category?.name ?? "Transaction"}
                    </p>
                  </div>
                  <p className="text-xs text-text-muted">{formatDate(tx.date)}</p>
                </div>
                <div className="flex items-center gap-1 ml-2 shrink-0">
                  <span
                    className={cn(
                      "text-sm font-semibold",
                      tx.type === "INCOME" ? "text-success" : "text-danger"
                    )}
                  >
                    {tx.type === "INCOME" ? "+" : "-"}
                    {formatCurrency(currency, parseFloat(tx.amount))}
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={() => setEditTx(tx)}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 text-danger hover:text-danger"
                    onClick={() => {
                      if (confirm("Delete this transaction?")) {
                        deleteMutation.mutate(tx.id);
                      }
                    }}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>

      {editTx && (
        <TransactionFormDialog
          open={!!editTx}
          onOpenChange={(open) => !open && setEditTx(null)}
          transaction={editTx}
        />
      )}
    </>
  );
}
