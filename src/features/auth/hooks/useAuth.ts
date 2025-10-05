import { create } from 'zustand';
import { useCallback, useEffect } from 'react';
import { useRepository } from '../../../lib/api/client';
import { UserAccount } from '../../../lib/types';
import { toast } from 'sonner';

interface AuthState {
  user: UserAccount | null;
  token: string | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  isAuthenticated: boolean;
  setUser: (user: UserAccount, token: string) => void;
  setStatus: (status: AuthState['status']) => void;
  reset: () => void;
}

const tokenKey = 'imagicity-token';

const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  status: 'loading',
  isAuthenticated: false,
  setUser: (user, token) => set({ user, token, status: 'authenticated', isAuthenticated: true }),
  setStatus: (status) =>
    set((state) => ({
      ...state,
      status,
      isAuthenticated: status === 'authenticated' ? true : status === 'loading' ? state.isAuthenticated : false,
    })),
  reset: () => set({ user: null, token: null, status: 'unauthenticated', isAuthenticated: false }),
}));

export const useAuth = () => {
  const repo = useRepository();
  const { user, token, status, isAuthenticated, setUser, setStatus, reset } = useAuthStore();

  const login = useCallback(
    async (payload: { email: string; password: string }) => {
      const account = await repo.auth.login(payload);
      setUser(account, account.token);
      window.localStorage.setItem(tokenKey, account.token);
      toast.success('Welcome back to Imagicity Invoicing.');
    },
    [repo, setUser],
  );

  const register = useCallback(
    async (payload: { name: string; email: string; password: string }) => {
      const account = await repo.auth.register(payload);
      setUser(account, account.token);
      window.localStorage.setItem(tokenKey, account.token);
      toast.success('Account created. Let’s build some invoices!');
    },
    [repo, setUser],
  );

  const logout = useCallback(() => {
    window.localStorage.removeItem(tokenKey);
    reset();
  }, [reset]);

  const hydrateFromStorage = useCallback(() => {
    const storedToken = window.localStorage.getItem(tokenKey);
    if (!storedToken) {
      setStatus('unauthenticated');
      return;
    }
    setStatus('loading');
    repo.auth
      .me()
      .then((account) => {
        if (account) {
          setUser(account, account.token);
        } else {
          reset();
        }
      })
      .catch(() => {
        reset();
      });
  }, [repo, reset, setStatus, setUser]);

  useEffect(() => {
    const listener = () => {
      reset();
      toast.error('Session expired. Please sign in again.');
    };
    window.addEventListener('imagicity:logout', listener);
    return () => window.removeEventListener('imagicity:logout', listener);
  }, [reset]);

  return {
    user,
    token,
    status,
    isAuthenticated,
    login,
    register,
    logout,
    hydrateFromStorage,
  };
};
