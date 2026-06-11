import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { AuthAdminUser } from '@sm/shared';
import { api, setAccessToken } from '../lib/api';

interface AuthState {
  user: AuthAdminUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthAdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Attempt a silent refresh on first load (uses the httpOnly cookie).
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await api.post('/auth/admin/refresh');
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

  const value = useMemo<AuthState>(
    () => ({
      user,
      loading,
      login: async (email, password) => {
        const res = await api.post('/auth/admin/login', { email, password });
        setAccessToken(res.data.accessToken);
        setUser(res.data.user);
      },
      logout: async () => {
        try {
          await api.post('/auth/admin/logout');
        } catch {
          /* ignore network errors on logout */
        }
        setAccessToken(null);
        setUser(null);
      },
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
