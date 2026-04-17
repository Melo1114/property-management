"use client";

// context/auth-context.tsx
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

import { authApi } from "@/lib/api";
import {
  clearTokens,
  decodeToken,
  getAccessToken,
  isAuthenticated,
  setTokens,
} from "@/lib/auth";
import type { LoginCredentials, Role, User } from "@/lib/types";

function setAuthCookie(token: string) {
  document.cookie = `pm_access=${token}; path=/; SameSite=Lax; max-age=3600`;
}
function clearAuthCookie() {
  document.cookie = "pm_access=; path=/; max-age=0";
}

interface AuthContextValue {
  user: User | null;
  role: Role | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    if (!isAuthenticated()) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const { data } = await authApi.me();
      setUser(data);
    } catch {
      setUser(null);
      clearTokens();
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      const { data } = await authApi.login(credentials);
      setTokens(data.access, data.refresh);
      setAuthCookie(data.access);

      const payload = decodeToken(data.access);

      const profileRes = await authApi.me();
      setUser(profileRes.data);

      const role = payload?.role;
      if (role === "Tenant") {
        router.push("/tenant/dashboard");
      } else if (role === "Vendor") {
        router.push("/vendor/dashboard");
      } else {
        router.push("/");
      }
    },
    [router]
  );

  const logout = useCallback(() => {
    clearTokens();
    clearAuthCookie();
    setUser(null);
    router.push("/login");
  }, [router]);

  const value: AuthContextValue = {
    user,
    role: user?.role ?? null,
    isLoading,
    isLoggedIn: !!user,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext must be used inside <AuthProvider>");
  }
  return ctx;
}
