export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-12 sm:px-6 sm:py-16">
      <div className="animate-page-enter space-y-6">
        <div className="h-3 w-28 rounded-full bg-stone-200/80 dark:bg-stone-800" />
        <div className="h-10 w-full max-w-3xl rounded-2xl bg-stone-200/80 dark:bg-stone-800" />
        <div className="h-4 w-full max-w-xl rounded-full bg-stone-200/70 dark:bg-stone-800" />
      </div>

      <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="h-6 w-40 rounded-full bg-stone-200/70 dark:bg-stone-800" />
        <div className="flex w-full max-w-md flex-col gap-3 sm:flex-row">
          <div className="h-10 flex-1 rounded-full bg-stone-200/70 dark:bg-stone-800" />
          <div className="h-10 w-full rounded-full bg-stone-200/70 dark:bg-stone-800 sm:w-28" />
        </div>
      </div>

      <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:gap-10 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-2xl border border-stone-200/80 bg-[var(--surface)]/70 p-4 shadow-sm dark:border-stone-800/80 dark:bg-stone-900/40"
          >
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-stone-200/80 dark:bg-stone-800">
              <div className="absolute inset-0 animate-shimmer bg-[length:200%_100%] bg-gradient-to-r from-transparent via-white/30 to-transparent dark:via-white/10" />
            </div>
            <div className="mt-4 space-y-3">
              <div className="h-3 w-24 rounded-full bg-stone-200/70 dark:bg-stone-800" />
              <div className="h-5 w-4/5 rounded-full bg-stone-200/70 dark:bg-stone-800" />
              <div className="h-4 w-full rounded-full bg-stone-200/60 dark:bg-stone-800" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
