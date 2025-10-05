import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils/cn';

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;
const DialogOverlay = DialogPrimitive.Overlay;
const DialogContent = DialogPrimitive.Content;
const DialogTitle = DialogPrimitive.Title;
const DialogDescription = DialogPrimitive.Description;

const Overlay = ({ className, ...props }: DialogPrimitive.DialogOverlayProps) => (
  <DialogOverlay className={cn('fixed inset-0 bg-slate-950/60 backdrop-blur-sm', className)} {...props} />
);

const Content = ({ className, children, ...props }: DialogPrimitive.DialogContentProps) => (
  <DialogPortal>
    <Overlay />
    <DialogContent
      className={cn(
        'fixed left-1/2 top-1/2 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-8 shadow-card focus:outline-none dark:border-slate-800 dark:bg-slate-900',
        className,
      )}
      {...props}
    >
      <DialogClose className="absolute right-4 top-4 rounded-full bg-slate-100 p-1 text-slate-500 transition hover:bg-slate-200 focus:outline-none dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
        <X className="h-4 w-4" />
      </DialogClose>
      {children}
    </DialogContent>
  </DialogPortal>
);

const Header = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('space-y-1 text-left', className)} {...props} />
);

const Footer = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)} {...props} />
);

export {
  Dialog,
  DialogTrigger,
  Content as DialogContent,
  Overlay as DialogOverlay,
  DialogTitle,
  DialogDescription,
  Header as DialogHeader,
  Footer as DialogFooter,
  DialogClose,
};
