import * as SheetPrimitive from '@radix-ui/react-dialog';
import { cn } from '../../lib/utils/cn';

const Sheet = SheetPrimitive.Root;
const SheetTrigger = SheetPrimitive.Trigger;
const SheetClose = SheetPrimitive.Close;
const SheetPortal = SheetPrimitive.Portal;

const SheetOverlay = ({ className, ...props }: SheetPrimitive.DialogOverlayProps) => (
  <SheetPrimitive.Overlay className={cn('fixed inset-0 bg-slate-950/60 backdrop-blur-sm', className)} {...props} />
);

const SheetContent = ({ side = 'right', className, ...props }: SheetPrimitive.DialogContentProps & { side?: 'left' | 'right' }) => (
  <SheetPortal>
    <SheetOverlay />
    <SheetPrimitive.Content
      className={cn(
        'fixed top-0 h-full w-full max-w-md border-l border-slate-200 bg-white p-6 shadow-card transition-transform dark:border-slate-800 dark:bg-slate-900',
        side === 'right' ? 'right-0 translate-x-0' : 'left-0 translate-x-0',
        className,
      )}
      {...props}
    />
  </SheetPortal>
);

export { Sheet, SheetTrigger, SheetContent, SheetClose };
