import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import type { AuthResponse, SignInPayload, SignUpPayload } from "@/types";

export function useSignIn() {
  const { setAuth } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: async (payload: SignInPayload) => {
      console.log("signup 1");
      const { data, error } = await api<AuthResponse>("/auth/signin", {
        method: "POST",
        body: payload,
      });
      console.log("signup 2", data);
      if (error || !data) {
        throw new Error(error?.message ?? "Sign in failed");
      }
      return data;
    },
    onSuccess: (data) => {
      setAuth(data.accessToken, data.user);
      router.push("/dashboard");
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Sign in failed");
    },
  });
}

export function useSignUp() {
  const { setAuth } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: async (payload: SignUpPayload) => {
      console.log("SignUpPayload", payload);
      const { data, error } = await api<AuthResponse>("/auth/signup", {
        method: "POST",
        body: payload,
      });
      if (error || !data) {
        throw new Error(error?.message ?? "Sign up failed");
      }
      return data;
    },
    onSuccess: (data) => {
      setAuth(data.accessToken, data.user);
      router.push("/dashboard");
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Sign up failed");
    },
  });
}

export function useSignOut() {
  const { clearAuth } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      await api("/auth/signout", { method: "POST" });
    },
    onSuccess: () => {
      clearAuth();
      router.push("/signin");
    },
    onError: () => {
      // Still clear auth and redirect even on error
      clearAuth();
      router.push("/signin");
    },
  });
}
