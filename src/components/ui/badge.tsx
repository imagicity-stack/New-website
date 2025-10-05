import { cn } from '../../lib/utils/cn';

export const Badge = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <span
    className={cn(
      'inline-flex items-center rounded-full border border-brand/20 bg-brand/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-brand dark:bg-brand/20 dark:text-white',
      className,
    )}
  >
    {children}
  </span>
);
