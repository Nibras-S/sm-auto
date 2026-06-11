import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { apiClient, setAccessToken } from "../lib/apiClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await apiClient.post("/auth/refresh");
        if (!active) return;
        setAccessToken(res.data.accessToken);
        setUser(res.data.user);
      } catch {
        if (active) setUser(null);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await apiClient.post("/auth/login", { email, password });
    setAccessToken(res.data.accessToken);
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const res = await apiClient.post("/auth/register", { name, email, password });
    setAccessToken(res.data.accessToken);
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const loginWithGoogle = useCallback(async (idToken) => {
    const res = await apiClient.post("/auth/google", { idToken });
    setAccessToken(res.data.accessToken);
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiClient.post("/auth/logout");
    } catch {
      /* ignore */
    }
    setAccessToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};

export default AuthContext;
