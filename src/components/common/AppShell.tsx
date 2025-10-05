import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { useHotkeys } from '../../hooks/useHotkeys';
import { useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import { CommandPalette } from './CommandPalette';

export const AppShell = () => {
  const navigate = useNavigate();
  useHotkeys([
    {
      keys: ['g', 'd'],
      description: 'Go to dashboard',
      handler: () => navigate('/dashboard'),
    },
    {
      keys: ['n'],
      description: 'New invoice',
      handler: () => navigate('/invoices/new'),
    },
    {
      keys: ['c'],
      description: 'New client',
      handler: () => navigate('/clients/new'),
    },
    {
      keys: ['f'],
      description: 'Open search',
      handler: () => document.dispatchEvent(new CustomEvent('open-command-palette')),
    },
  ]);

  const layout = useMemo(
    () => (
      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950" data-testid="app-shell">
        <Sidebar />
        <div className="flex w-full flex-1 flex-col">
          <Navbar />
          <main className="flex-1 px-4 py-6 sm:px-8">
            <Outlet />
          </main>
        </div>
        <CommandPalette />
      </div>
    ),
    [],
  );

  return layout;
};
