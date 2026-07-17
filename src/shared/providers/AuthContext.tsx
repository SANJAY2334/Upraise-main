import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import {
  apiLogin,
  apiMe,
  apiRefresh,
  apiLogout,
  clearTokens,
  getAccessToken,
  storeTokens,
  type AuthUser
} from "../services";

type AuthState = { status: "loading" } | { status: "unauthenticated" } | { status: "authenticated"; user: AuthUser };

type AuthContextValue = {
  state: AuthState;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: "loading" });

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setState({ status: "unauthenticated" });
      return;
    }
    apiMe(token)
      .then((user) => setState({ status: "authenticated", user }))
      .catch(async () => {
        const refreshed = await apiRefresh();
        if (refreshed) {
          try {
            const user = await apiMe(refreshed);
            setState({ status: "authenticated", user });
          } catch {
            clearTokens();
            setState({ status: "unauthenticated" });
          }
        } else {
          clearTokens();
          setState({ status: "unauthenticated" });
        }
      });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { accessToken, refreshToken, user } = await apiLogin(email, password);
    storeTokens(accessToken, refreshToken);
    setState({ status: "authenticated", user });
  }, []);

  const logout = useCallback(() => {
    apiLogout();
    setState({ status: "unauthenticated" });
  }, []);

  return <AuthContext.Provider value={{ state, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
