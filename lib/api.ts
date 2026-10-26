import { createFetch } from "@better-fetch/fetch";
import { getAccessToken, setAccessToken, clearAccessToken } from "@/lib/auth";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export const $fetch = createFetch({
  baseURL: `${BASE_URL}/api`,
  credentials: "include",
  onRequest(ctx) {
    const token = getAccessToken();
    if (token) {
      ctx.headers.set("Authorization", `Bearer ${token}`);
    }
  },
});

let refreshPromise: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) return false;
      const json = await res.json();
      if (json.success && json.data?.accessToken) {
        setAccessToken(json.data.accessToken);
        const { useAuthStore } = await import("@/store/auth.store");
        useAuthStore.getState().setAuth(json.data.accessToken, json.data.user);
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();
  return refreshPromise;
}

async function handleAuthFailure() {
  clearAccessToken();
  const { useAuthStore } = await import("@/store/auth.store");
  useAuthStore.getState().clearAuth();
  if (typeof window !== "undefined") {
    window.location.href = "/signin";
  }
}

type FetchOptions = Parameters<typeof $fetch>[1];

interface NestResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

function unwrap<T>(raw: NestResponse<T> | null | undefined): T | null {
  if (!raw) return null;
  return raw.data ?? null;
}

export async function api<T = unknown>(
  url: string,
  options?: FetchOptions,
): Promise<{
  data: T | null;
  error: { message: string; status: number } | null;
}> {
  const result = await $fetch<NestResponse<T>>(url, options);

  if (result.error) {
    const err = result.error as { status?: number; message?: string };
    const status = err.status ?? 0;
    if (status === 401) {
      const refreshed = await tryRefresh();
      if (refreshed) {
        const retry = await $fetch<NestResponse<T>>(url, options);
        if (retry.error) {
          const retryStatus = (retry.error as { status?: number }).status ?? 0;
          if (retryStatus === 401) await handleAuthFailure();
          return { data: null, error: { message: String(retry.error), status: retryStatus } };
        }
        return { data: unwrap(retry.data), error: null };
      } else {
        await handleAuthFailure();
        return { data: null, error: { message: "Unauthorized", status: 401 } };
      }
    }
    const message = err.message ?? String(result.error);
    return { data: null, error: { message, status } };
  }

  return { data: unwrap(result.data), error: null };
}
