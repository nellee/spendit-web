"use client";

import { create } from "zustand";
import type { User } from "@/types";
import { clearAccessToken, setAccessToken } from "@/lib/auth";

interface AuthState {
  accessToken: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  setAuth: (token, user) => {
    setAccessToken(token);
    set({ accessToken: token, user });
  },
  clearAuth: () => {
    clearAccessToken();
    set({ accessToken: null, user: null });
  },
}));
