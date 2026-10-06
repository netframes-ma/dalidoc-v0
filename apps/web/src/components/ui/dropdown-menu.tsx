"use client";

import { DropdownMenu as Menu } from "radix-ui";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const DropdownMenu = Menu.Root;
export const DropdownMenuTrigger = Menu.Trigger;
export const DropdownMenuRadioGroup = Menu.RadioGroup;

export function DropdownMenuContent({ className, sideOffset = 6, ...props }: React.ComponentProps<typeof Menu.Content>) {
  return (
    <Menu.Portal>
      <Menu.Content
        sideOffset={sideOffset}
        className={cn(
          "z-50 min-w-52 rounded-xl border border-border bg-popover p-1.5 text-fg shadow-lg animate-in fade-in-0 zoom-in-95",
          className,
        )}
        {...props}
      />
    </Menu.Portal>
  );
}

const itemClass =
  "relative flex h-8 cursor-default select-none items-center gap-2 rounded-lg px-2.5 text-[13px] outline-none data-[disabled]:opacity-50 data-[highlighted]:bg-soft [&_svg]:size-4 [&_svg]:text-muted-fg";

export function DropdownMenuItem({ className, ...props }: React.ComponentProps<typeof Menu.Item>) {
  return <Menu.Item className={cn(itemClass, className)} {...props} />;
}

export function DropdownMenuRadioItem({ className, children, ...props }: React.ComponentProps<typeof Menu.RadioItem>) {
  return (
    <Menu.RadioItem className={cn(itemClass, "pe-8", className)} {...props}>
      {children}
      <Menu.ItemIndicator className="absolute end-2.5 inline-flex">
        <Check className="!text-primary" />
      </Menu.ItemIndicator>
    </Menu.RadioItem>
  );
}

export function DropdownMenuLabel({ className, ...props }: React.ComponentProps<typeof Menu.Label>) {
  return <Menu.Label className={cn("eyebrow px-2.5 pt-2 pb-1", className)} {...props} />;
}

export function DropdownMenuSeparator({ className, ...props }: React.ComponentProps<typeof Menu.Separator>) {
  return <Menu.Separator className={cn("mx-1 my-1.5 h-px bg-border", className)} {...props} />;
}
