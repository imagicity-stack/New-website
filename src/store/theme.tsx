import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { create } from 'zustand';

interface ThemeState {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
}

const useThemeStore = create<ThemeState>((set) => ({
  theme: 'light',
  setTheme: (theme) => set({ theme }),
  toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
}));

const ThemeContext = createContext(useThemeStore);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [ready, setReady] = useState(false);
  const themeStore = useMemo(() => useThemeStore, []);

  useEffect(() => {
    const stored = window.localStorage.getItem('imagicity-theme') as 'light' | 'dark' | null;
    if (stored) {
      themeStore.getState().setTheme(stored);
    }
    setReady(true);
  }, [themeStore]);

  useEffect(() => {
    const unsub = themeStore.subscribe((state) => {
      document.documentElement.dataset.theme = state.theme;
      document.documentElement.classList.toggle('dark', state.theme === 'dark');
      window.localStorage.setItem('imagicity-theme', state.theme);
      document.documentElement.style.setProperty('--brand-color',
        import.meta.env.VITE_BRAND_PRIMARY || '#C8102E');
    });
    document.documentElement.style.setProperty('--brand-color',
      import.meta.env.VITE_BRAND_PRIMARY || '#C8102E');
    return () => unsub();
  }, [themeStore]);

  if (!ready) return null;

  return <ThemeContext.Provider value={themeStore}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext)();
