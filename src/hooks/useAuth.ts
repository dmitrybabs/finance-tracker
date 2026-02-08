import { useState, useEffect, useCallback } from 'react';

export interface User {
  id: string;
  username: string;
  displayName: string;
}

const AUTH_KEY = 'fintrack_auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(AUTH_KEY);
      if (saved) {
        setUser(JSON.parse(saved));
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    setError('');
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка входа');
      setUser(data.user);
      localStorage.setItem(AUTH_KEY, JSON.stringify(data.user));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Ошибка входа';
      setError(msg);
      throw new Error(msg);
    }
  }, []);

  const register = useCallback(async (username: string, password: string) => {
    setError('');
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'register', username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка регистрации');
      setUser(data.user);
      localStorage.setItem(AUTH_KEY, JSON.stringify(data.user));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Ошибка регистрации';
      setError(msg);
      throw new Error(msg);
    }
  }, []);

  const loginAsGuest = useCallback(() => {
    const guest: User = { id: 'guest', username: 'guest', displayName: 'Гость' };
    setUser(guest);
    localStorage.setItem(AUTH_KEY, JSON.stringify(guest));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(AUTH_KEY);
  }, []);

  const clearError = useCallback(() => setError(''), []);

  return { user, loading, error, login, register, loginAsGuest, logout, clearError };
}
