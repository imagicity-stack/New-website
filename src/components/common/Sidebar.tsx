import { NavLink } from 'react-router-dom';
import { BadgeIndianRupee, ClipboardList, FileText, LayoutGrid, Settings, Users, Wallet2 } from 'lucide-react';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { to: '/clients', label: 'Clients', icon: Users },
  { to: '/items', label: 'Items', icon: ClipboardList },
  { to: '/invoices', label: 'Invoices', icon: FileText },
  { to: '/payments', label: 'Payments', icon: Wallet2 },
  { to: '/reports', label: 'Reports', icon: BadgeIndianRupee },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export const Sidebar = () => (
  <aside className="hidden min-h-screen w-64 flex-col border-r border-slate-200 bg-slate-100/70 px-4 py-6 text-slate-600 dark:border-slate-800 dark:bg-slate-900/40 lg:flex">
    <div className="mb-8 space-y-1">
      <p className="text-xs uppercase tracking-[0.25rem] text-brand">Imagicity</p>
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Invoicing</h2>
    </div>
    <nav className="flex flex-1 flex-col gap-1">
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium transition hover:bg-white hover:text-slate-900 dark:hover:bg-slate-800 ${
                isActive ? 'bg-white text-slate-900 shadow-card dark:bg-slate-800 dark:text-white' : ''
              }`
            }
          >
            <Icon className="h-4 w-4" />
            {link.label}
          </NavLink>
        );
      })}
    </nav>
  </aside>
);
