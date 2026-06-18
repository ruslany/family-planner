'use client';

import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';
import { XIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

function Dialog(props: DialogPrimitive.Root.Props) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger(props: DialogPrimitive.Trigger.Props) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogClose(props: DialogPrimitive.Close.Props) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogPopup({ className, children, ...props }: DialogPrimitive.Popup.Props) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/50 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
      <DialogPrimitive.Popup
        data-slot="dialog-popup"
        className={cn(
          // Mobile: bottom sheet
          'fixed inset-x-0 bottom-0 z-50 max-h-[90dvh] overflow-y-auto rounded-t-2xl bg-background px-4 pb-8 pt-4 shadow-xl outline-none',
          // Desktop: centered dialog
          'md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg md:rounded-2xl md:px-6 md:pb-6 md:pt-5',
          'data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0',
          'data-open:slide-in-from-bottom-4 data-closed:slide-out-to-bottom-4',
          'md:data-open:slide-in-from-bottom-0 md:data-open:zoom-in-95 md:data-closed:slide-out-to-bottom-0 md:data-closed:zoom-out-95',
          className,
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Popup>
    </DialogPrimitive.Portal>
  );
}

function DialogTitle({ className, ...props }: DialogPrimitive.Title.Props) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn('text-lg font-semibold leading-none tracking-tight', className)}
      {...props}
    />
  );
}

function DialogDescription({ className, ...props }: DialogPrimitive.Description.Props) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  );
}

function DialogCloseButton({ className, ...props }: DialogPrimitive.Close.Props) {
  return (
    <DialogPrimitive.Close
      data-slot="dialog-close-button"
      className={cn(
        'absolute right-4 top-4 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className,
      )}
      {...props}
    >
      <XIcon className="size-4" />
      <span className="sr-only">Close</span>
    </DialogPrimitive.Close>
  );
}

export {
  Dialog,
  DialogTrigger,
  DialogClose,
  DialogPopup,
  DialogTitle,
  DialogDescription,
  DialogCloseButton,
};
