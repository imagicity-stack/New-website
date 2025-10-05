import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '../../lib/utils/cn';

const TooltipProvider = TooltipPrimitive.Provider;
const Tooltip = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;
const TooltipContent = ({ className, ...props }: TooltipPrimitive.TooltipContentProps) => (
  <TooltipPrimitive.Content
    className={cn('z-50 rounded-lg bg-slate-900 px-3 py-2 text-xs text-white shadow-lg', className)}
    sideOffset={6}
    {...props}
  />
);

export { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent };
