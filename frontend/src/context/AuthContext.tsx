import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { User } from '../types';
import { api, setTokens, clearTokens } from '../api/client';

interface AuthCtx {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const Ctx = createContext<AuthCtx>(null!);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await api<{ data: User }>('/auth/profile');
      setUser(res.data);
    } catch {
      clearTokens();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('co_access');
    if (token) fetchProfile();
    else setLoading(false);
  }, [fetchProfile]);

  const login = async (email: string, password: string) => {
    const res = await api<{ data: { accessToken: string; refreshToken: string; user: User } }>(
      '/auth/login', { method: 'POST', body: { email, password }, noAuth: true },
    );
    setTokens(res.data.accessToken, res.data.refreshToken);
    setUser(res.data.user);
  };

  const logout = async () => {
    try { await api('/auth/logout', { method: 'POST' }); } catch { /* ignore */ }
    clearTokens();
    setUser(null);
  };

  return <Ctx.Provider value={{ user, loading, login, logout }}>{children}</Ctx.Provider>;
}
