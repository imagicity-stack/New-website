import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '../../lib/utils/cn';

const Tabs = TabsPrimitive.Root;
const TabsList = ({ className, ...props }: TabsPrimitive.TabsListProps) => (
  <TabsPrimitive.List
    className={cn('inline-flex items-center gap-1 rounded-full bg-slate-100 p-1 text-xs font-medium dark:bg-slate-900/60', className)}
    {...props}
  />
);
const TabsTrigger = ({ className, ...props }: TabsPrimitive.TabsTriggerProps) => (
  <TabsPrimitive.Trigger
    className={cn(
      'inline-flex min-w-[120px] items-center justify-center rounded-full px-4 py-2 text-sm transition data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow dark:data-[state=active]:bg-slate-800 dark:data-[state=active]:text-slate-100',
      className,
    )}
    {...props}
  />
);
const TabsContent = ({ className, ...props }: TabsPrimitive.TabsContentProps) => (
  <TabsPrimitive.Content className={cn('mt-6 focus-visible:outline-none', className)} {...props} />
);

export { Tabs, TabsList, TabsTrigger, TabsContent };
