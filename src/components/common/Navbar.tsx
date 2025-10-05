import { Menu, Moon, Sun } from 'lucide-react';
import { Button } from '../ui/button';
import { useTheme } from '../../store/theme';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';

export const Navbar = () => {
  const themeStore = useTheme();
  const { user, logout } = useAuth();
  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
        </Button>
        <div>
          <p className="text-xs uppercase tracking-widest text-brand">Imagicity Invoicing</p>
          <h1 className="font-semibold text-slate-900 dark:text-white">Welcome back{user ? `, ${user.name}` : ''}</h1>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Toggle theme"
          onClick={() => themeStore.getState().toggleTheme()}
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition dark:rotate-0 dark:scale-100" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="rounded-full px-3">
              <span className="mr-2 flex h-8 w-8 items-center justify-center rounded-full bg-brand text-xs font-semibold text-white">
                {user?.name?.[0] ?? 'U'}
              </span>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-100">{user?.name ?? 'Guest'}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onSelect={() => logout()}>Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
