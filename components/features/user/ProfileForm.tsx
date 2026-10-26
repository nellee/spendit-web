"use client";

import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { cn, CURRENCIES, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { User, UpdateProfilePayload } from "@/types";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  currency: z.string().min(1, "Currency is required"),
});

type ProfileValues = z.infer<typeof profileSchema>;

export default function ProfileForm() {
  const { user, setAuth, accessToken } = useAuthStore();

  const mutation = useMutation({
    mutationFn: async (payload: UpdateProfilePayload) => {
      const { data, error } = await api<User>("/users/me", {
        method: "PATCH",
        body: payload,
      });
      if (error || !data) throw new Error(error?.message ?? "Failed to update profile");
      return data;
    },
    onSuccess: (updatedUser) => {
      if (accessToken) {
        setAuth(accessToken, updatedUser);
      }
      toast.success("Profile updated");
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Failed to update profile");
    },
  });

  const form = useForm({
    defaultValues: {
      name: user?.name ?? "",
      currency: user?.currency ?? "EUR",
    } as ProfileValues,
    validators: { onSubmit: profileSchema },
    onSubmit: async ({ value }) => {
      await mutation.mutateAsync(value);
    },
  });

  return (
    <div className="space-y-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        className="space-y-4 max-w-md"
      >
        {/* Email (readonly) */}
        <div className="space-y-1">
          <Label>Email</Label>
          <Input type="email" value={user?.email ?? ""} disabled readOnly />
          <p className="text-xs text-text-muted">Email cannot be changed</p>
        </div>

        {/* Name */}
        <form.Field name="name">
          {(field) => (
            <div className="space-y-1">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                type="text"
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

        {/* Currency */}
        <form.Field name="currency">
          {(field) => (
            <div className="space-y-1">
              <Label>Currency</Label>
              <Select
                value={field.state.value}
                onValueChange={field.handleChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </form.Field>

        {/* Role */}
        <div className="space-y-1">
          <Label>Role</Label>
          <div>
            <Badge variant={user?.role === "ADMIN" ? "default" : "secondary"}>
              {user?.role}
            </Badge>
          </div>
        </div>

        {/* Member since */}
        {user?.createdAt && (
          <div className="space-y-1">
            <Label>Member since</Label>
            <p className="text-sm text-text-muted">{formatDate(user.createdAt)}</p>
          </div>
        )}

        <form.Subscribe selector={(state) => state.isSubmitting}>
          {(isSubmitting) => (
            <Button type="submit" disabled={isSubmitting || mutation.isPending}>
              {isSubmitting || mutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          )}
        </form.Subscribe>
      </form>
    </div>
  );
}
