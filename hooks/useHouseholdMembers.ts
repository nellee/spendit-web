import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type {
  HouseholdMember,
  CreateHouseholdMemberPayload,
  UpdateHouseholdMemberPayload,
} from "@/types";

export function useHouseholdMembers() {
  return useQuery({
    queryKey: ["household-members"],
    queryFn: async () => {
      const { data, error } = await api<HouseholdMember[]>("/household-members");
      if (error || !data) throw new Error(error?.message ?? "Failed to load household members");
      return data;
    },
  });
}

export function useCreateHouseholdMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateHouseholdMemberPayload) => {
      const { data, error } = await api<HouseholdMember>("/household-members", {
        method: "POST",
        body: payload,
      });
      if (error || !data) throw new Error(error?.message ?? "Failed to create member");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["household-members"] });
      toast.success("Member added");
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Failed to add member");
    },
  });
}

export function useUpdateHouseholdMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdateHouseholdMemberPayload }) => {
      const { data, error } = await api<HouseholdMember>(`/household-members/${id}`, {
        method: "PATCH",
        body: payload,
      });
      if (error || !data) throw new Error(error?.message ?? "Failed to update member");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["household-members"] });
      toast.success("Member updated");
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Failed to update member");
    },
  });
}

export function useDeleteHouseholdMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await api(`/household-members/${id}`, { method: "DELETE" });
      if (error) throw new Error(error.message ?? "Failed to delete member");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["household-members"] });
      toast.success("Member deleted");
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Failed to delete member");
    },
  });
}
