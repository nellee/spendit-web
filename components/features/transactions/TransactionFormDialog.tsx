"use client";

import { useState, useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { useCreateTransaction, useUpdateTransaction } from "@/hooks/useTransactions";
import { useCategories, useCreateCategory } from "@/hooks/useCategories";
import { useHouseholdMembers } from "@/hooks/useHouseholdMembers";
import { useAuthStore } from "@/store/auth.store";
import { cn, formatDateInput } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Transaction, TransactionType, Category } from "@/types";

interface TransactionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction?: Transaction;
  defaultDate?: string;
  defaultType?: TransactionType;
}

const transactionSchema = z.object({
  type: z.enum(["EXPENSE", "INCOME"]),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  categoryId: z.string().min(1, "Category is required"),
  description: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  isRepeating: z.boolean(),
  endDate: z.string().optional(),
  householdMemberId: z.string().optional(),
});

type TransactionValues = z.infer<typeof transactionSchema>;

function flattenCategories(cats: Category[]): Array<{ id: string; label: string; indent: boolean }> {
  const result: Array<{ id: string; label: string; indent: boolean }> = [];
  for (const cat of cats) {
    result.push({ id: cat.id, label: `${cat.icon ?? ""} ${cat.name}`.trim(), indent: false });
    if (cat.children) {
      for (const child of cat.children) {
        result.push({
          id: child.id,
          label: `${child.icon ?? ""} ${child.name}`.trim(),
          indent: true,
        });
      }
    }
  }
  return result;
}

export default function TransactionFormDialog({
  open,
  onOpenChange,
  transaction,
  defaultDate,
  defaultType = "EXPENSE",
}: TransactionFormDialogProps) {
  const isEdit = !!transaction;
  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();
  const createCategoryMutation = useCreateCategory();
  const { data: categories = [] } = useCategories();
  const { data: members = [] } = useHouseholdMembers();
  const { user } = useAuthStore();

  const [categorySearch, setCategorySearch] = useState("");
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryIcon, setNewCategoryIcon] = useState("");
  const [newCategoryParentId, setNewCategoryParentId] = useState("");

  const flatCategories = flattenCategories(categories);

  const form = useForm({
    defaultValues: {
      type: (transaction?.type ?? defaultType) as TransactionType,
      amount: transaction ? parseFloat(transaction.amount) : (0 as number),
      categoryId: transaction?.categoryId ?? "",
      description: transaction?.description ?? "",
      date: transaction
        ? formatDateInput(transaction.date)
        : (defaultDate ?? formatDateInput(new Date())),
      isRepeating: transaction?.isRepeating ?? false,
      endDate: transaction?.endDate ? formatDateInput(transaction.endDate) : "",
      householdMemberId: transaction?.householdMemberId ?? "",
    } as TransactionValues,
    validators: { onSubmit: transactionSchema },
    onSubmit: async ({ value }) => {
      const payload = {
        type: value.type,
        amount: value.amount,
        categoryId: value.categoryId,
        description: value.description || undefined,
        date: value.date,
        isRepeating: value.isRepeating,
        endDate: value.isRepeating && value.endDate ? value.endDate : undefined,
        householdMemberId: value.householdMemberId || undefined,
      };

      if (isEdit && transaction) {
        await updateMutation.mutateAsync({ id: transaction.id, payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      onOpenChange(false);
    },
  });

  useEffect(() => {
    if (!open) {
      form.reset();
      setCategorySearch("");
      setShowCategoryPicker(false);
      setShowNewCategory(false);
      setNewCategoryName("");
      setNewCategoryIcon("");
      setNewCategoryParentId("");
    }
  }, [open, form]);

  const getCategoryName = (id: string) => {
    const found = flatCategories.find((c) => c.id === id);
    return found?.label ?? "Select category...";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Transaction" : "Add Transaction"}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          {/* Type toggle */}
          <form.Field name="type">
            {(field) => (
              <div className="space-y-1">
                <Label>Type</Label>
                <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => field.handleChange("EXPENSE")}
                    className={cn(
                      "flex-1 py-2 text-sm font-medium transition-colors",
                      field.state.value === "EXPENSE"
                        ? "bg-danger text-white"
                        : "bg-surface text-text-muted hover:bg-gray-50"
                    )}
                  >
                    Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => field.handleChange("INCOME")}
                    className={cn(
                      "flex-1 py-2 text-sm font-medium transition-colors",
                      field.state.value === "INCOME"
                        ? "bg-success text-white"
                        : "bg-surface text-text-muted hover:bg-gray-50"
                    )}
                  >
                    Income
                  </button>
                </div>
              </div>
            )}
          </form.Field>

          {/* Amount */}
          <form.Field name="amount">
            {(field) => (
              <div className="space-y-1">
                <Label htmlFor="amount">
                  Amount {user?.currency ? `(${user.currency})` : ""}
                </Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={field.state.value || ""}
                  onChange={(e) => field.handleChange(parseFloat(e.target.value) || 0)}
                  onBlur={field.handleBlur}
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-xs text-danger">
                    {String(field.state.meta.errors[0])}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          {/* Category picker */}
          <form.Field name="categoryId">
            {(field) => (
              <div className="space-y-1">
                <Label>Category</Label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowCategoryPicker(!showCategoryPicker)}
                    className={cn(
                      "flex h-9 w-full items-center justify-between rounded-lg border border-gray-300 bg-surface px-3 py-2 text-sm text-left",
                      !field.state.value && "text-text-muted"
                    )}
                  >
                    {field.state.value
                      ? getCategoryName(field.state.value)
                      : "Select category..."}
                  </button>

                  {showCategoryPicker && (
                    <div className="absolute z-50 mt-1 w-full rounded-xl border border-gray-200 bg-surface shadow-lg">
                      <Command>
                        <CommandInput
                          placeholder="Search categories..."
                          value={categorySearch}
                          onValueChange={setCategorySearch}
                        />
                        <CommandList>
                          <CommandEmpty>No categories found</CommandEmpty>
                          <CommandGroup>
                            {flatCategories
                              .filter((c) =>
                                c.label.toLowerCase().includes(categorySearch.toLowerCase())
                              )
                              .map((cat) => (
                                <CommandItem
                                  key={cat.id}
                                  value={cat.id}
                                  onSelect={() => {
                                    field.handleChange(cat.id);
                                    setShowCategoryPicker(false);
                                    setCategorySearch("");
                                    setShowNewCategory(false);
                                  }}
                                  className={cn(cat.indent && "pl-6")}
                                >
                                  {cat.label}
                                </CommandItem>
                              ))}
                          </CommandGroup>
                        </CommandList>

                        {/* Add new category inline */}
                        <div className="border-t border-gray-100 p-2">
                          {!showNewCategory ? (
                            <button
                              type="button"
                              onClick={() => setShowNewCategory(true)}
                              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-primary hover:bg-primary/5 font-medium"
                            >
                              <span>+</span> Add new category
                            </button>
                          ) : (
                            <div className="space-y-2 pt-1">
                              <p className="text-xs font-medium text-text-muted px-1">New category</p>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  placeholder="Icon (emoji)"
                                  value={newCategoryIcon}
                                  onChange={(e) => setNewCategoryIcon(e.target.value)}
                                  className="w-16 rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                  maxLength={2}
                                />
                                <input
                                  type="text"
                                  placeholder="Category name"
                                  value={newCategoryName}
                                  onChange={(e) => setNewCategoryName(e.target.value)}
                                  className="flex-1 rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                              </div>
                              <select
                                value={newCategoryParentId}
                                onChange={(e) => setNewCategoryParentId(e.target.value)}
                                className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-text-muted"
                              >
                                <option value="">Top-level category</option>
                                {categories
                                  .filter((c) => !c.parentId)
                                  .map((c) => (
                                    <option key={c.id} value={c.id}>
                                      {c.icon} {c.name}
                                    </option>
                                  ))}
                              </select>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setShowNewCategory(false);
                                    setNewCategoryName("");
                                    setNewCategoryIcon("");
                                    setNewCategoryParentId("");
                                  }}
                                  className="flex-1 rounded-md border border-gray-300 px-2 py-1 text-sm hover:bg-gray-50"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  disabled={!newCategoryName.trim() || createCategoryMutation.isPending}
                                  onClick={async () => {
                                    if (!newCategoryName.trim()) return;
                                    const created = await createCategoryMutation.mutateAsync({
                                      name: newCategoryName.trim(),
                                      icon: newCategoryIcon.trim() || undefined,
                                      parentId: newCategoryParentId || undefined,
                                    });
                                    if (created) {
                                      field.handleChange(created.id);
                                      setShowCategoryPicker(false);
                                    }
                                    setShowNewCategory(false);
                                    setNewCategoryName("");
                                    setNewCategoryIcon("");
                                    setNewCategoryParentId("");
                                  }}
                                  className="flex-1 rounded-md bg-primary px-2 py-1 text-sm text-white hover:bg-primary-light disabled:opacity-50"
                                >
                                  {createCategoryMutation.isPending ? "Saving..." : "Save"}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </Command>
                    </div>
                  )}
                </div>
                {field.state.meta.errors.length > 0 && (
                  <p className="text-xs text-danger">
                    {String(field.state.meta.errors[0])}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          {/* Description */}
          <form.Field name="description">
            {(field) => (
              <div className="space-y-1">
                <Label htmlFor="description">Description (optional)</Label>
                <Input
                  id="description"
                  type="text"
                  placeholder="Add a note..."
                  value={field.state.value ?? ""}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                />
              </div>
            )}
          </form.Field>

          {/* Date */}
          <form.Field name="date">
            {(field) => (
              <div className="space-y-1">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-xs text-danger">
                    {String(field.state.meta.errors[0])}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          {/* Repeat monthly */}
          <form.Field name="isRepeating">
            {(field) => (
              <div className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2">
                <div>
                  <Label htmlFor="isRepeating" className="cursor-pointer">
                    Repeat monthly
                  </Label>
                  <p className="text-xs text-text-muted">
                    This transaction recurs every month
                  </p>
                </div>
                <Switch
                  id="isRepeating"
                  checked={field.state.value}
                  onCheckedChange={field.handleChange}
                />
              </div>
            )}
          </form.Field>

          {/* End date — only shown when repeating */}
          <form.Subscribe selector={(state) => state.values.isRepeating}>
            {(isRepeating) =>
              isRepeating ? (
                <form.Field name="endDate">
                  {(field) => (
                    <div className="space-y-1">
                      <Label htmlFor="endDate">End date (optional)</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={field.state.value ?? ""}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                      />
                      <p className="text-xs text-text-muted">
                        Leave blank to repeat indefinitely
                      </p>
                    </div>
                  )}
                </form.Field>
              ) : null
            }
          </form.Subscribe>

          {/* Household member */}
          {members.length > 0 && (
            <form.Field name="householdMemberId">
              {(field) => (
                <div className="space-y-1">
                  <Label>Household Member (optional)</Label>
                  <Select
                    value={field.state.value ?? ""}
                    onValueChange={(val) =>
                      field.handleChange(val === "__mine__" ? "" : val)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="My own transaction" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__mine__">My own transaction</SelectItem>
                      {members.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </form.Field>
          )}

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <form.Subscribe selector={(state) => state.isSubmitting}>
              {(isSubmitting) => (
                <Button
                  type="submit"
                  disabled={isSubmitting || createMutation.isPending || updateMutation.isPending}
                >
                  {isSubmitting || createMutation.isPending || updateMutation.isPending
                    ? "Saving..."
                    : isEdit
                    ? "Save Changes"
                    : "Add Transaction"}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
