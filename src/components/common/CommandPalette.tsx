import { useEffect, useMemo, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useRepository } from '../../lib/api/client';

export const CommandPalette = () => {
  const repo = useRepository();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ label: string; path: string }[]>([]);

  useEffect(() => {
    const handler = () => setOpen(true);
    document.addEventListener('open-command-palette', handler);
    return () => document.removeEventListener('open-command-palette', handler);
  }, []);

  useEffect(() => {
    if (!open) {
      setQuery('');
      setResults([]);
    }
  }, [open]);

  useEffect(() => {
    let active = true;
    const run = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      const [clients, invoices, items] = await Promise.all([
        repo.clients.list({ search: query }),
        repo.invoices.list({ search: query }),
        repo.items.list({ search: query }),
      ]);
      if (!active) return;
      const matches = [
        ...clients.data.map((c) => ({ label: `Client: ${c.displayName}`, path: `/clients/${c.id}` })),
        ...invoices.data.map((i) => ({ label: `Invoice: ${i.number}`, path: `/invoices/${i.id}` })),
        ...items.data.map((item) => ({ label: `Item: ${item.name}`, path: `/items/${item.id}/edit` })),
      ];
      setResults(matches.slice(0, 10));
    };
    void run();
    return () => {
      active = false;
    };
  }, [query, repo]);

  const shortcuts = useMemo(
    () => [
      { label: 'Dashboard', path: '/dashboard' },
      { label: 'New Invoice', path: '/invoices/new' },
      { label: 'New Client', path: '/clients/new' },
      { label: 'Reports', path: '/reports' },
    ],
    [],
  );

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40" />
        <Dialog.Content className="fixed left-1/2 top-24 w-full max-w-xl -translate-x-1/2 rounded-2xl bg-slate-950/90 p-6 text-white shadow-card backdrop-blur">
          <div className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3">
            <Search className="h-5 w-5 text-slate-400" />
            <input
              autoFocus
              placeholder="Search clients, invoices, items..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="flex-1 bg-transparent text-base text-white placeholder:text-slate-500 focus:outline-none"
            />
          </div>
          <div className="mt-4 space-y-2">
            {query && results.length === 0 && (
              <p className="text-sm text-slate-400">No results yet. Keep typing.</p>
            )}
            {results.map((result) => (
              <button
                key={result.path}
                onClick={() => {
                  navigate(result.path);
                  setOpen(false);
                }}
                className="flex w-full items-center justify-between rounded-xl bg-slate-900 px-4 py-3 text-left text-sm text-slate-100 transition hover:bg-slate-800"
              >
                {result.label}
              </button>
            ))}
            {!query && (
              <div className="space-y-2">
                {shortcuts.map((shortcut) => (
                  <button
                    key={shortcut.path}
                    onClick={() => {
                      navigate(shortcut.path);
                      setOpen(false);
                    }}
                    className="flex w-full items-center justify-between rounded-xl bg-slate-900 px-4 py-3 text-left text-sm text-slate-100 transition hover:bg-slate-800"
                  >
                    {shortcut.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
