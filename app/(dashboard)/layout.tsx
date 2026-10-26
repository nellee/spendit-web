"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import TopNav from "@/components/features/TopNav";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { accessToken, setAuth } = useAuthStore();
  const [checking, setChecking] = useState(!accessToken);

  useEffect(() => {
    if (accessToken) {
      setChecking(false);
      return;
    }

    const tryRefresh = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
          method: "POST",
          credentials: "include",
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data?.accessToken) {
            setAuth(json.data.accessToken, json.data.user);
            setChecking(false);
            return;
          }
        }
      } catch {
        // ignore
      }
      router.replace("/signin");
    };

    tryRefresh();
  }, [accessToken, setAuth, router]);

  if (checking) {
    return (
      <div className="min-h-screen bg-neutral flex items-center justify-center">
        <div className="text-text-muted text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral flex flex-col">
      <TopNav />
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
