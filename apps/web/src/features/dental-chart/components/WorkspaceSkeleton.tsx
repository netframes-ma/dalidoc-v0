/** Placeholder with the workspace's proportions while the chart engine loads. */
export function WorkspaceSkeleton() {
  const block = "animate-pulse rounded-card bg-[color-mix(in_srgb,var(--fg)_6%,transparent)]";
  return (
    <div className="mx-auto flex w-full max-w-[1680px] flex-col gap-4 px-3 py-4 sm:px-5 sm:py-5" aria-busy="true">
      <div className="h-14 w-72 animate-pulse rounded-2xl bg-[color-mix(in_srgb,var(--fg)_6%,transparent)]" />
      <div className={`${block} h-24`} />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_400px]">
        <div className="h-[560px] animate-pulse rounded-card bg-ink/90" />
        <div className={`${block} h-[560px]`} />
      </div>
    </div>
  );
}
