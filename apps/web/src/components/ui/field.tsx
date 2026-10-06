import { cn } from "@/lib/utils";

export function Label({ className, ...props }: React.ComponentProps<"label">) {
  return <label className={cn("text-[12.5px] font-medium text-fg", className)} {...props} />;
}

const control =
  "w-full rounded-xl border border-input bg-card px-3 text-[13px] text-fg shadow-soft outline-none transition-[border-color,box-shadow] placeholder:text-muted-fg focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-[color-mix(in_srgb,var(--ring)_22%,transparent)] disabled:opacity-60 aria-invalid:border-danger";

export function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return <textarea className={cn(control, "min-h-20 resize-y py-2", className)} {...props} />;
}

export function NativeSelect({ className, ...props }: React.ComponentProps<"select">) {
  return <select className={cn(control, "h-9 pe-8", className)} {...props} />;
}

export function FieldError({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return <p className="text-[12px] text-danger">{children}</p>;
}
