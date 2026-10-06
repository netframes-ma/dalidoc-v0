import { cn } from "@/lib/utils";

/** DaliDoc mark: a single-line tooth. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "grid size-11 shrink-0 place-items-center rounded-[14px] bg-primary text-primary-fg shadow-[0_6px_16px_-6px_color-mix(in_srgb,var(--primary)_70%,transparent)]",
        className,
      )}
    >
      <svg viewBox="0 0 32 32" aria-hidden className="size-7">
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
          d="M10.5 6C7.5 6 6 8.4 6 11.2c0 2.6 1.2 4.2 1.9 6.3.7 2.2.7 4.8 1.4 7.1.4 1.4 1 2.1 1.9 2.1 1.8 0 1.8-3.9 2.7-6.1.4-1 1-1.5 2.1-1.5s1.7.5 2.1 1.5c.9 2.2.9 6.1 2.7 6.1.9 0 1.5-.7 1.9-2.1.7-2.3.7-4.9 1.4-7.1.7-2.1 1.9-3.7 1.9-6.3C26 8.4 24.5 6 21.5 6c-2.3 0-3.4 1.2-5.5 1.2S12.8 6 10.5 6Z"
        />
        <path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M12 11.5c1.3.6 2.6.9 4 .9" />
      </svg>
    </span>
  );
}
