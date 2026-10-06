import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const badgeVariants = cva(
  "inline-flex h-6 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 text-[11.5px] font-medium [&_svg]:size-3.5",
  {
    variants: {
      tone: {
        neutral: "bg-soft text-muted-fg",
        brand: "bg-primary-tint text-primary-dark dark:text-primary",
        warning: "bg-[color-mix(in_srgb,var(--warning)_14%,transparent)] text-warning",
        success: "bg-[color-mix(in_srgb,var(--success)_14%,transparent)] text-success",
        danger: "bg-[color-mix(in_srgb,var(--danger)_12%,transparent)] text-danger",
        info: "bg-[color-mix(in_srgb,var(--info)_12%,transparent)] text-info",
        ink: "bg-ink text-ink-fg",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export interface BadgeProps extends React.ComponentProps<"span">, VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

export function Badge({ className, tone, dot = false, children, ...props }: BadgeProps) {
  return (
    <span data-slot="badge" className={cn(badgeVariants({ tone }), className)} {...props}>
      {dot && <span aria-hidden className="size-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}
