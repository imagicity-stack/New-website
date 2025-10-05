import * as DropdownPrimitive from '@radix-ui/react-dropdown-menu';
import { cn } from '../../lib/utils/cn';

const DropdownMenu = DropdownPrimitive.Root;
const DropdownMenuTrigger = DropdownPrimitive.Trigger;
const DropdownMenuGroup = DropdownPrimitive.Group;
const DropdownMenuPortal = DropdownPrimitive.Portal;
const DropdownMenuSub = DropdownPrimitive.Sub;
const DropdownMenuRadioGroup = DropdownPrimitive.RadioGroup;
const DropdownMenuSubTrigger = DropdownPrimitive.SubTrigger;
const DropdownMenuSubContent = DropdownPrimitive.SubContent;
const DropdownMenuContent = ({ className, ...props }: DropdownPrimitive.DropdownMenuContentProps) => (
  <DropdownPrimitive.Content
    className={cn(
      'z-50 min-w-[10rem] overflow-hidden rounded-xl border border-slate-200 bg-white p-1 text-slate-700 shadow-xl dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100',
      className,
    )}
    sideOffset={8}
    {...props}
  />
);
const DropdownMenuItem = ({ className, ...props }: DropdownPrimitive.DropdownMenuItemProps) => (
  <DropdownPrimitive.Item
    className={cn(
      'flex cursor-pointer select-none items-center rounded-lg px-3 py-2 text-sm outline-none transition hover:bg-slate-100 focus:bg-slate-100 dark:hover:bg-slate-800 dark:focus:bg-slate-800',
      className,
    )}
    {...props}
  />
);

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
};
