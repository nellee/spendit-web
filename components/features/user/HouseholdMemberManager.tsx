"use client";

import { useState } from "react";
import { Pencil, Trash2, Plus, Check, X } from "lucide-react";
import { toast } from "sonner";
import {
  useHouseholdMembers,
  useCreateHouseholdMember,
  useUpdateHouseholdMember,
  useDeleteHouseholdMember,
} from "@/hooks/useHouseholdMembers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

export default function HouseholdMemberManager() {
  const { data: members = [], isLoading } = useHouseholdMembers();
  const createMutation = useCreateHouseholdMember();
  const updateMutation = useUpdateHouseholdMember();
  const deleteMutation = useDeleteHouseholdMember();

  const [newName, setNewName] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const handleAdd = async () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    await createMutation.mutateAsync({ name: trimmed });
    setNewName("");
  };

  const handleEdit = (id: string, currentName: string) => {
    setEditId(id);
    setEditName(currentName);
  };

  const handleSaveEdit = async () => {
    if (!editId) return;
    const trimmed = editName.trim();
    if (!trimmed) return;
    await updateMutation.mutateAsync({ id: editId, payload: { name: trimmed } });
    setEditId(null);
    setEditName("");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This will also affect transactions by this member.")) return;
    await deleteMutation.mutateAsync(id);
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-md">
      <p className="text-sm text-text-muted">
        Add household members (e.g. spouse, partner) to track their transactions separately.
      </p>

      {/* Existing members */}
      <div className="space-y-2">
        {members.length === 0 && (
          <p className="text-sm text-text-muted italic">No members added yet.</p>
        )}
        {members.map((member) => (
          <div
            key={member.id}
            className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 bg-surface"
          >
            {editId === member.id ? (
              <>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveEdit();
                    if (e.key === "Escape") setEditId(null);
                  }}
                  className="flex-1 h-7 text-sm"
                  autoFocus
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={handleSaveEdit}
                  disabled={updateMutation.isPending}
                >
                  <Check className="h-3.5 w-3.5 text-success" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={() => setEditId(null)}
                >
                  <X className="h-3.5 w-3.5 text-text-muted" />
                </Button>
              </>
            ) : (
              <>
                <span className="flex-1 text-sm font-medium text-text-primary">
                  {member.name}
                </span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={() => handleEdit(member.id, member.name)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-danger hover:text-danger"
                  onClick={() => handleDelete(member.id)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Add new member */}
      <div className="flex gap-2">
        <Input
          placeholder="Member name..."
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          className="flex-1"
        />
        <Button
          onClick={handleAdd}
          disabled={!newName.trim() || createMutation.isPending}
          className="gap-1.5"
        >
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>
    </div>
  );
}
