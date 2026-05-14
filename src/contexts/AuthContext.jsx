/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(null);

export const MOCK_AUTH_STORAGE_KEY = "adnu-athletics-auth-session";

function readStoredSession() {
  if (typeof window === "undefined") return null;

  const value = window.localStorage.getItem(MOCK_AUTH_STORAGE_KEY);
  if (!value) return null;

  try {
    return JSON.parse(value);
  } catch {
    window.localStorage.removeItem(MOCK_AUTH_STORAGE_KEY);
    return null;
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readStoredSession);

  useEffect(() => {
    if (session) {
      window.localStorage.setItem(MOCK_AUTH_STORAGE_KEY, JSON.stringify(session));
      return;
    }

    window.localStorage.removeItem(MOCK_AUTH_STORAGE_KEY);
  }, [session]);

  const value = useMemo(
    () => ({
      session,
      isAuthenticated: Boolean(session),
      login: (payload = {}) => {
        const nextSession = {
          email: payload.email ?? "",
          role: payload.role ?? "Administrator",
          signedInAt: new Date().toISOString(),
        };
        setSession(nextSession);
        return nextSession;
      },
      logout: () => setSession(null),
    }),
    [session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }

  return context;
}
