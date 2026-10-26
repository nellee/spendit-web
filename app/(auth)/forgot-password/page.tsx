"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const forgotSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type ForgotValues = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);

  const form = useForm({
    defaultValues: { email: "" } as ForgotValues,
    validators: { onSubmit: forgotSchema },
    onSubmit: async ({ value }) => {
      const { error } = await api("/auth/forgot-password", {
        method: "POST",
        body: { email: value.email },
      });
      if (error) {
        toast.error("Failed to send reset email. Please try again.");
        return;
      }
      setSubmitted(true);
    },
  });

  if (submitted) {
    return (
      <div className="text-center">
        <div className="mb-4 text-4xl">📬</div>
        <h1 className="text-2xl font-semibold text-text-primary mb-2">Check your inbox</h1>
        <p className="text-text-muted text-sm mb-6">
          We&apos;ve sent a password reset link to your email address.
        </p>
        <Link href="/signin" className="text-primary font-medium hover:underline text-sm">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-text-primary">Forgot password?</h1>
        <p className="text-text-muted text-sm mt-1">
          Enter your email and we&apos;ll send a reset link.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        className="space-y-4"
      >
        <form.Field name="email">
          {(field) => (
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
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

        <form.Subscribe selector={(state) => state.isSubmitting}>
          {(isSubmitting) => (
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send reset link"}
            </Button>
          )}
        </form.Subscribe>
      </form>

      <p className="mt-6 text-center text-sm text-text-muted">
        <Link href="/signin" className="text-primary font-medium hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
