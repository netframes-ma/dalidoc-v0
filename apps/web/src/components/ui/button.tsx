import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-[background-color,color,box-shadow,opacity,transform] duration-150 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-fg shadow-[0_6px_16px_-8px_color-mix(in_srgb,var(--primary)_80%,transparent)] hover:opacity-90",
        outline: "border border-border bg-card text-fg hover:bg-soft",
        ghost: "text-fg hover:bg-soft",
        soft: "bg-soft text-fg hover:bg-[color-mix(in_srgb,var(--fg)_11%,var(--bg))]",
        ink: "bg-ink text-ink-fg hover:opacity-90",
        danger: "bg-danger text-danger-fg hover:opacity-90",
        "danger-ghost": "text-danger hover:bg-[color-mix(in_srgb,var(--danger)_10%,transparent)]",
      },
      size: {
        sm: "h-8 px-3 text-[12.5px]",
        md: "h-9 px-4 text-[13px]",
        lg: "h-10 px-5 text-sm",
        icon: "size-9",
        "icon-sm": "size-8",
      },
    },
    defaultVariants: { variant: "default", size: "md" },
  },
);

export interface ButtonProps extends React.ComponentProps<"button">, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({ className, variant, size, asChild = false, type, ...props }: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button";
  return (
    <Comp
      data-slot="button"
      type={asChild ? undefined : (type ?? "button")}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
