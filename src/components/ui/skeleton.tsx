import { cn } from '../../lib/utils/cn';

export const Skeleton = ({ className }: { className?: string }) => (
  <div className={cn('animate-pulse rounded-xl bg-slate-200/70 dark:bg-slate-800/60', className)} />
);
