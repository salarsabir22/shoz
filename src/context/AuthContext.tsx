"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import type { UserRole } from "@/types";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar_url?: string | null;
  notify_deals?: boolean;
  notify_reminders?: boolean;
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string, redirectTo?: string | null) => Promise<{ error?: string }>;
  signup: (payload: SignupPayload, redirectTo?: string | null) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

export type SignupPayload = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  business?: {
    name: string;
    address: string;
    category: "bakery" | "cafe" | "restaurant" | "grocery";
    phone?: string;
  };
};

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

function postJson<T>(url: string, body: unknown): Promise<{ ok: boolean; data: T; status: number }> {
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    credentials: "same-origin",
  }).then(async (res) => {
    const data = (await res.json().catch(() => ({}))) as T;
    return { ok: res.ok, data, status: res.status };
  });
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [loading, setLoading] = React.useState(true);

  const refreshUser = React.useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "same-origin" });
      if (!res.ok) {
        setUser(null);
        return;
      }
      const json = (await res.json()) as { user: AuthUser };
      setUser(json.user);
    } catch {
      setUser(null);
    }
  }, []);

  React.useEffect(() => {
    void refreshUser().finally(() => setLoading(false));
  }, [refreshUser, pathname]);

  const login = React.useCallback(
    async (email: string, password: string, redirectTo?: string | null) => {
      const { ok, data } = await postJson<{ user: AuthUser; error?: string }>("/api/auth/login", {
        email,
        password,
      });
      if (!ok) {
        return { error: (data as { error?: string }).error ?? "Invalid email or password" };
      }
      const body = data as { user: AuthUser };
      setUser(body.user);
      const fallback = body.user.role === "business" ? "/business/dashboard" : "/explore";
      const dest =
        redirectTo && redirectTo.startsWith("/") && !redirectTo.startsWith("//") ? redirectTo : fallback;
      router.push(dest);
      router.refresh();
      return {};
    },
    [router]
  );

  const signup = React.useCallback(
    async (payload: SignupPayload, redirectTo?: string | null) => {
      const { ok, data } = await postJson<{ user: AuthUser; error?: string }>("/api/auth/signup", payload);
      if (!ok) {
        return { error: (data as { error?: string }).error ?? "Could not sign up" };
      }
      const body = data as { user: AuthUser };
      setUser(body.user);
      const fallback = body.user.role === "business" ? "/business/dashboard" : "/explore";
      const dest =
        redirectTo && redirectTo.startsWith("/") && !redirectTo.startsWith("//") ? redirectTo : fallback;
      router.push(dest);
      router.refresh();
      return {};
    },
    [router]
  );

  const logout = React.useCallback(async () => {
    await postJson("/api/auth/logout", {});
    setUser(null);
    router.push("/");
    router.refresh();
  }, [router]);

  const value = React.useMemo(
    () => ({ user, loading, login, signup, logout, refreshUser }),
    [user, loading, login, signup, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
}
