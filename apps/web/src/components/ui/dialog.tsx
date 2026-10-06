"use client";

import { Dialog as DialogPrimitive } from "radix-ui";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Dialog = DialogPrimitive.Root;
export const DialogClose = DialogPrimitive.Close;

export function DialogContent({
  className,
  children,
  closeLabel,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & { closeLabel: string }) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-frame/55 backdrop-blur-[2px] animate-in fade-in-0" />
      <DialogPrimitive.Content
        className={cn(
          "fixed start-1/2 top-1/2 z-50 w-[min(92vw,460px)] -translate-y-1/2 rounded-card border border-border bg-popover p-5 text-fg shadow-lg ltr:-translate-x-1/2 rtl:translate-x-1/2 animate-in fade-in-0 zoom-in-95",
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          aria-label={closeLabel}
          className="absolute end-3 top-3 inline-grid size-8 place-items-center rounded-full text-muted-fg hover:bg-soft hover:text-fg"
        >
          <X className="size-4" />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function DialogTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return <DialogPrimitive.Title className={cn("pe-8 text-base font-semibold", className)} {...props} />;
}

export function DialogDescription({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return <DialogPrimitive.Description className={cn("mt-1.5 text-[13px] text-muted-fg", className)} {...props} />;
}
