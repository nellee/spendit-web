"use client";

import { useState, useMemo } from "react";
import { ChevronDown, ChevronRight, Pencil, Trash2 } from "lucide-react";
import { cn, formatCurrency, MONTH_NAMES } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import MatrixCell from "./MatrixCell";
import TransactionFormDialog from "./TransactionFormDialog";
import { useDeleteTransaction } from "@/hooks/useTransactions";
import type {
  MonthlyMatrixResponse,
  YearlyMatrixResponse,
  MatrixRow,
  Transaction,
} from "@/types";

interface TransactionMatrixTableProps {
  data: MonthlyMatrixResponse | YearlyMatrixResponse | undefined;
  isLoading: boolean;
  currency: string;
  view: "month" | "year";
  transactions?: Transaction[];
}

function isMonthly(
  data: MonthlyMatrixResponse | YearlyMatrixResponse
): data is MonthlyMatrixResponse {
  return "daysInMonth" in data;
}

export default function TransactionMatrixTable({
  data,
  isLoading,
  currency,
  view,
  transactions = [],
}: TransactionMatrixTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [editTx, setEditTx] = useState<Transaction | null>(null);
  const deleteMutation = useDeleteTransaction();

  const columns = useMemo(() => {
    if (!data) return [];
    if (isMonthly(data)) {
      return Array.from({ length: data.daysInMonth }, (_, i) => ({
        key: String(i + 1),
        label: String(i + 1),
      }));
    }
    return Array.from({ length: 12 }, (_, i) => ({
      key: String(i + 1),
      label: MONTH_NAMES[i],
    }));
  }, [data]);

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (!data || data.rows.length === 0) {
    return (
      <div className="text-center py-12 text-text-muted text-sm">
        No transaction data for this period
      </div>
    );
  }

  // today's day for highlighting
  const today = new Date();
  const todayDay = String(today.getDate());
  const isCurrentMonth =
    view === "month" &&
    isMonthly(data) &&
    data.year === today.getFullYear() &&
    data.month === today.getMonth() + 1;

  const isCurrentYear =
    view === "year" &&
    !isMonthly(data) &&
    data.year === today.getFullYear();

  const currentColKey =
    isCurrentMonth
      ? todayDay
      : isCurrentYear
      ? String(today.getMonth() + 1)
      : null;

  const stickyFirstColClass =
    "sticky left-0 z-10 bg-surface border-r border-gray-100";

  const renderRow = (row: MatrixRow, isChild = false): React.ReactNode => {
    const isExpanded = expandedRows.has(row.categoryId);
    const hasChildren = row.children && row.children.length > 0;

    return (
      <>
        <tr
          key={row.categoryId}
          className={cn(
            "border-b border-gray-100 hover:bg-gray-50/50 transition-colors",
            row.type === "INCOME" && "bg-green-50 hover:bg-green-50/70",
            isChild && "text-sm"
          )}
        >
          {/* Category name — sticky */}
          <td
            className={cn(
              "py-2 px-3 min-w-[180px] max-w-[220px]",
              stickyFirstColClass,
              row.type === "INCOME" ? "bg-green-50" : "bg-surface",
              isChild && "pl-8"
            )}
          >
            <div className="flex items-center gap-1.5">
              {hasChildren && !isChild && (
                <button
                  type="button"
                  onClick={() => toggleRow(row.categoryId)}
                  className="text-text-muted hover:text-text-primary transition-colors shrink-0"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5" />
                  )}
                </button>
              )}
              {!hasChildren && !isChild && <span className="w-3.5" />}
              <span
                className={cn(
                  "truncate",
                  isChild ? "text-text-muted" : "font-medium text-text-primary"
                )}
              >
                {row.icon && <span className="mr-1">{row.icon}</span>}
                {row.categoryName}
              </span>
            </div>
          </td>

          {/* Day/Month columns */}
          {columns.map(({ key }) => {
            const val = row.dailyTotals[key] ?? 0;
            const isCurrent = key === currentColKey;
            const matchIds = new Set([
              row.categoryId,
              ...(row.children?.map((c) => c.categoryId) ?? []),
            ]);
            const cellTxs = transactions.filter((tx) => {
              if (!matchIds.has(tx.categoryId)) return false;
              const d = new Date(tx.date);
              if (isMonthly(data)) {
                return String(d.getUTCDate()) === key;
              }
              return String(d.getUTCMonth() + 1) === key;
            });
            return (
              <td
                key={key}
                className={cn(
                  "py-2 px-2 text-right text-xs min-w-[90px]",
                  isCurrent && "bg-primary/5"
                )}
              >
                <MatrixCell
                  value={val}
                  type={row.type}
                  categoryId={row.categoryId}
                  columnKey={key}
                  year={data.year}
                  month={isMonthly(data) ? data.month : undefined}
                  currency={currency}
                  transactions={cellTxs}
                />
              </td>
            );
          })}

          {/* Row total */}
          <td className="py-2 px-3 text-right text-sm font-semibold min-w-[80px] sticky right-0 bg-surface border-l border-gray-100">
            <span
              className={cn(
                row.type === "INCOME" ? "text-success" : "text-text-primary"
              )}
            >
              {row.monthTotal > 0
                ? formatCurrency(currency, row.monthTotal)
                : "—"}
            </span>
          </td>
        </tr>

        {/* Individual transaction rows when expanded */}
        {hasChildren && isExpanded && (() => {
          const allCatIds = new Set([
            row.categoryId,
            ...row.children.map((c) => c.categoryId),
          ]);
          const rowTxs = transactions
            .filter((tx) => allCatIds.has(tx.categoryId))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

          if (rowTxs.length === 0) {
            return row.children.map((child) =>
              renderRow({ ...child, type: row.type, isParent: false, children: [] }, true)
            );
          }

          return rowTxs.map((tx) => {
            const txColKey = isMonthly(data)
              ? String(new Date(tx.date).getUTCDate())
              : String(new Date(tx.date).getUTCMonth() + 1);
            const memberInitials = tx.householdMember?.name
              .split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
            const isIncome = row.type === "INCOME";

            return (
              <tr
                key={tx.id}
                className={cn(
                  "border-b border-gray-50 text-xs hover:bg-gray-50/80 transition-colors",
                  isIncome ? "bg-green-50/60" : "bg-gray-50/40"
                )}
              >
                <td
                  className={cn(
                    "py-1.5 px-3 pl-10",
                    stickyFirstColClass,
                    isIncome ? "bg-green-50/60" : "bg-gray-50/40"
                  )}
                >
                  <span className="text-text-muted truncate flex items-center gap-1">
                    {tx.isProjected && (
                      <span title="Repeating" className="text-primary/60 text-[10px]">🔁</span>
                    )}
                    {tx.category?.name ?? "—"}
                    {tx.description && (
                      <span className="text-text-muted/60"> · {tx.description}</span>
                    )}
                  </span>
                </td>
                {columns.map(({ key }) => {
                  const isCurrent = key === currentColKey;
                  return (
                    <td
                      key={key}
                      className={cn("py-1.5 px-2 text-right", isCurrent && "bg-primary/5")}
                    >
                      {key === txColKey ? (
                        <Popover>
                          <PopoverTrigger asChild>
                            <button
                              type="button"
                              className="flex items-center justify-end gap-1 w-full hover:underline cursor-pointer"
                            >
                              {memberInitials && (
                                <span
                                  title={tx.householdMember?.name}
                                  className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary/20 text-primary text-[9px] font-bold shrink-0"
                                >
                                  {memberInitials}
                                </span>
                              )}
                              <span className={cn("font-medium text-xs", isIncome ? "text-success" : "text-danger")}>
                                {formatCurrency(currency, parseFloat(tx.amount))}
                              </span>
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-44 p-1" align="end">
                            <Button
                              variant="ghost"
                              className="w-full justify-start gap-2 h-8 text-xs"
                              onClick={() => setEditTx(tx)}
                            >
                              <Pencil className="h-3 w-3" /> Edit
                            </Button>
                            <Button
                              variant="ghost"
                              className="w-full justify-start gap-2 h-8 text-xs text-danger hover:text-danger"
                              disabled={deleteMutation.isPending}
                              onClick={() => {
                                if (confirm("Delete this transaction?")) {
                                  deleteMutation.mutate(tx.id);
                                }
                              }}
                            >
                              <Trash2 className="h-3 w-3" /> Delete
                            </Button>
                          </PopoverContent>
                        </Popover>
                      ) : (
                        <span className="text-text-muted/30 select-none">—</span>
                      )}
                    </td>
                  );
                })}
                <td
                  className={cn(
                    "py-1.5 px-3 sticky right-0 border-l border-gray-100",
                    isIncome ? "bg-green-50/60" : "bg-gray-50/40"
                  )}
                />
              </tr>
            );
          });
        })()}
      </>
    );
  };

  return (
    <>
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-surface">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-gray-200 bg-surface sticky top-0 z-20">
            <th
              className={cn(
                "py-3 px-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wide min-w-[180px]",
                stickyFirstColClass
              )}
            >
              Category
            </th>
            {columns.map(({ key, label }) => {
              const isCurrent = key === currentColKey;
              return (
                <th
                  key={key}
                  className={cn(
                    "py-3 px-2 text-right text-xs font-semibold text-text-muted min-w-[90px]",
                    isCurrent && "text-primary bg-primary/5"
                  )}
                >
                  {label}
                </th>
              );
            })}
            <th className="py-3 px-3 text-right text-xs font-semibold text-text-muted min-w-[80px] sticky right-0 bg-surface border-l border-gray-100 uppercase tracking-wide">
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {data.rows.map((row) => renderRow(row))}
        </tbody>
        <tfoot>
          {/* Expense Total */}
          <tr className="border-t-2 border-gray-200 bg-gray-50">
            <td
              className={cn(
                "py-2.5 px-3 font-semibold text-text-primary text-sm",
                stickyFirstColClass,
                "bg-gray-50"
              )}
            >
              Expense Total
            </td>
            {columns.map(({ key }) => {
              const val = data.columnTotals.expense[key] ?? 0;
              const isCurrent = key === currentColKey;
              return (
                <td
                  key={key}
                  className={cn(
                    "py-2.5 px-2 text-right text-xs font-medium text-danger",
                    isCurrent && "bg-primary/5"
                  )}
                >
                  {val > 0 ? formatCurrency(currency, val) : "—"}
                </td>
              );
            })}
            <td className="py-2.5 px-3 text-right text-sm font-bold text-danger sticky right-0 bg-gray-50 border-l border-gray-100">
              {formatCurrency(currency, data.grandTotal.expense)}
            </td>
          </tr>

          {/* Income Total */}
          <tr className="border-t border-gray-200 bg-green-50">
            <td
              className={cn(
                "py-2.5 px-3 font-semibold text-text-primary text-sm",
                stickyFirstColClass,
                "bg-green-50"
              )}
            >
              Income Total
            </td>
            {columns.map(({ key }) => {
              const val = data.columnTotals.income[key] ?? 0;
              const isCurrent = key === currentColKey;
              return (
                <td
                  key={key}
                  className={cn(
                    "py-2.5 px-2 text-right text-xs font-medium text-success",
                    isCurrent && "bg-primary/5"
                  )}
                >
                  {val > 0 ? formatCurrency(currency, val) : "—"}
                </td>
              );
            })}
            <td className="py-2.5 px-3 text-right text-sm font-bold text-success sticky right-0 bg-green-50 border-l border-gray-100">
              {formatCurrency(currency, data.grandTotal.income)}
            </td>
          </tr>

          {/* Balance */}
          <tr className="border-t border-gray-200 bg-gray-100">
            <td
              className={cn(
                "py-2.5 px-3 font-semibold text-text-primary text-sm",
                stickyFirstColClass,
                "bg-gray-100"
              )}
            >
              Balance
            </td>
            {columns.map(({ key }) => {
              const expense = data.columnTotals.expense[key] ?? 0;
              const income = data.columnTotals.income[key] ?? 0;
              const colBalance = income - expense;
              const isCurrent = key === currentColKey;
              return (
                <td
                  key={key}
                  className={cn(
                    "py-2.5 px-2 text-right text-xs font-medium",
                    colBalance >= 0 ? "text-success" : "text-danger",
                    isCurrent && "bg-primary/5"
                  )}
                >
                  {expense === 0 && income === 0 ? (
                    "—"
                  ) : (
                    <>
                      {colBalance >= 0 ? "+" : ""}
                      {formatCurrency(currency, colBalance)}
                    </>
                  )}
                </td>
              );
            })}
            <td
              className={cn(
                "py-2.5 px-3 text-right text-sm font-bold sticky right-0 bg-gray-100 border-l border-gray-100",
                data.grandTotal.balance >= 0 ? "text-success" : "text-danger"
              )}
            >
              {data.grandTotal.balance >= 0 ? "+" : ""}
              {formatCurrency(currency, data.grandTotal.balance)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>

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
