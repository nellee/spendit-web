import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type {
  Category,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from "@/types";

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await api<Category[]>("/categories");
      if (error || !data) throw new Error(error?.message ?? "Failed to load categories");
      return data;
    },
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateCategoryPayload) => {
      const { data, error } = await api<Category>("/categories", {
        method: "POST",
        body: payload,
      });
      if (error || !data) throw new Error(error?.message ?? "Failed to create category");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category created");
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Failed to create category");
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdateCategoryPayload }) => {
      const { data, error } = await api<Category>(`/categories/${id}`, {
        method: "PATCH",
        body: payload,
      });
      if (error || !data) throw new Error(error?.message ?? "Failed to update category");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category updated");
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Failed to update category");
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await api(`/categories/${id}`, { method: "DELETE" });
      if (error) throw new Error(error.message ?? "Failed to delete category");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category deleted");
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Failed to delete category");
    },
  });
}
