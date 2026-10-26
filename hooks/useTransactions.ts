import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type {
  Transaction,
  PaginatedTransactions,
  CreateTransactionPayload,
  UpdateTransactionPayload,
} from "@/types";

interface TransactionFilters {
  type?: string;
  year?: number;
  month?: number;
  date?: string;
  categoryId?: string;
  householdMemberId?: string;
  page?: number;
  limit?: number;
}

export function useTransactionsForPeriod(
  year: number,
  month: number | null,
  memberId?: string | null,
) {
  return useQuery({
    queryKey: ["transactions-period", year, month, memberId ?? "all"],
    queryFn: async () => {
      const query: Record<string, unknown> = { year, limit: 500 };
      if (month) query.month = month;
      if (memberId) query.householdMemberId = memberId;
      const { data, error } = await api<PaginatedTransactions>("/transactions", { query });
      if (error || !data) throw new Error(error?.message ?? "Failed to load transactions");
      return data.data;
    },
  });
}

export function useTransactions(filters: TransactionFilters = {}) {
  return useQuery({
    queryKey: ["transactions", filters],
    queryFn: async () => {
      const query: Record<string, unknown> = {};
      if (filters.type) query.type = filters.type;
      if (filters.year) query.year = filters.year;
      if (filters.month) query.month = filters.month;
      if (filters.date) query.date = filters.date;
      if (filters.categoryId) query.categoryId = filters.categoryId;
      if (filters.householdMemberId) query.householdMemberId = filters.householdMemberId;
      if (filters.page) query.page = filters.page;
      if (filters.limit) query.limit = filters.limit;

      const { data, error } = await api<PaginatedTransactions>("/transactions", {
        query,
      });
      if (error || !data) throw new Error(error?.message ?? "Failed to load transactions");
      return data;
    },
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateTransactionPayload) => {
      const { data, error } = await api<Transaction>("/transactions", {
        method: "POST",
        body: payload,
      });
      if (error || !data) throw new Error(error?.message ?? "Failed to create transaction");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["matrix-monthly"] });
      queryClient.invalidateQueries({ queryKey: ["matrix-yearly"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      toast.success("Transaction added");
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Failed to add transaction");
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdateTransactionPayload }) => {
      const { data, error } = await api<Transaction>(`/transactions/${id}`, {
        method: "PATCH",
        body: payload,
      });
      if (error || !data) throw new Error(error?.message ?? "Failed to update transaction");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["matrix-monthly"] });
      queryClient.invalidateQueries({ queryKey: ["matrix-yearly"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      toast.success("Transaction updated");
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Failed to update transaction");
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await api(`/transactions/${id}`, { method: "DELETE" });
      if (error) throw new Error(error.message ?? "Failed to delete transaction");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["matrix-monthly"] });
      queryClient.invalidateQueries({ queryKey: ["matrix-yearly"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      toast.success("Transaction deleted");
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Failed to delete transaction");
    },
  });
}
