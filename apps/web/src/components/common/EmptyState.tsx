import { cn } from "@/lib/utils";

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center gap-2 px-6 py-10 text-center", className)}>
      {icon && <div className="mb-1 grid size-11 place-items-center rounded-2xl bg-soft text-muted-fg [&_svg]:size-5">{icon}</div>}
      <p className="text-[14px] font-semibold">{title}</p>
      {description && <p className="max-w-sm text-[12.5px] text-muted-fg">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
