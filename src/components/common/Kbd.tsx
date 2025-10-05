import { ReactNode } from 'react';

export const Kbd = ({ children }: { children: ReactNode }) => (
  <kbd className="rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
    {children}
  </kbd>
);
