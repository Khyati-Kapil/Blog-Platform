import Link from "next/link";
import { PostCard } from "@/components/PostCard";
import { escapeIlike } from "@/lib/search";
import { createClient } from "@/lib/supabase/server";

const PAGE_SIZE = 6;

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();

  let listQuery = supabase
    .from("posts")
    .select("id, title, image_url, summary, created_at, author_id", { count: "exact" })
    .order("created_at", { ascending: false });

  if (q) {
    const esc = escapeIlike(q);
    listQuery = listQuery.or(`title.ilike.%${esc}%,body.ilike.%${esc}%`);
  }

  const { data: posts, count, error } = await listQuery.range(from, to);

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const authorIds = [...new Set((posts ?? []).map((p) => p.author_id))];
  const names = new Map<string, string>();

  if (authorIds.length > 0) {
    const { data: users } = await supabase.from("users").select("id, name").in("id", authorIds);
    (users ?? []).forEach((u) => names.set(u.id, u.name));
  }

  const hasPosts = !error && posts && posts.length > 0;

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-12 sm:px-6 sm:py-16">
      <div className="relative mb-12 sm:mb-16">
        <div className="animate-hero-line absolute -left-4 top-0 h-24 w-1 rounded-full bg-gradient-to-b from-orange-500 to-amber-500 opacity-80 dark:from-orange-400 dark:to-amber-600 sm:left-0" />
        <div className="grid gap-10 pl-4 sm:pl-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="animate-hero-content">
            <p className="animate-hero-content mb-3 text-xs font-semibold tracking-[0.25em] text-orange-600 uppercase dark:text-orange-400">
              Blog platform
            </p>
            <h1 className="animate-hero-title font-display max-w-3xl text-4xl leading-[1.1] font-semibold tracking-tight text-stone-900 sm:text-5xl md:text-6xl dark:text-stone-50">
              Read, search, and discuss posts with AI-powered summaries.
            </h1>
            <p className="animate-hero-subtitle mt-5 max-w-xl text-base leading-relaxed text-stone-600 dark:text-stone-400">
              Each post includes an automatic ~200 word summary so you can scan the feed before you open the full article.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                href="/posts/new"
                className="rounded-full bg-gradient-to-r from-orange-600 to-amber-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-600/20 transition hover:-translate-y-0.5 hover:from-orange-500 hover:to-amber-500"
              >
                Start writing
              </Link>
              <Link
                href="#posts"
                className="rounded-full border border-stone-300 px-6 py-3 text-sm font-semibold text-stone-700 transition hover:border-stone-400 hover:text-stone-900 dark:border-stone-700 dark:text-stone-300 dark:hover:border-stone-500 dark:hover:text-stone-100"
              >
                Browse posts
              </Link>
            </div>
           
          </div>
          
        </div>
      </div>

      <div
        id="posts"
        className="animate-section-fade mb-10 flex flex-col gap-6 border-b border-stone-200 pb-10 dark:border-stone-800 lg:flex-row lg:items-end lg:justify-between"
      >
        <div>
          <h2 className="font-display text-2xl font-semibold text-stone-900 dark:text-stone-50">
            {q ? "Search results" : "Latest posts"}
          </h2>
          {q && (
            <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
              Matching “{q}”
            </p>
          )}
        </div>
        <form method="get" className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:gap-2 lg:max-w-md">
          <input type="hidden" name="page" value="1" />
          <div className="relative min-w-0 flex-1">
            <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-stone-400" aria-hidden>
              ⌕
            </span>
            <input
              name="q"
              defaultValue={q}
              placeholder="Search titles and bodies..."
              className="input-focus w-full rounded-full border border-stone-300 bg-[var(--surface)] py-2.5 pr-4 pl-10 text-sm shadow-inner shadow-stone-200/40 dark:border-stone-700 dark:bg-stone-900/60 dark:shadow-none"
            />
          </div>
          <button
            type="submit"
            className="w-full shrink-0 rounded-full bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white sm:w-auto"
          >
            Search
          </button>
        </form>
      </div>

      {error && (
        <div className="rounded-2xl border border-amber-200/80 bg-amber-50/90 px-5 py-4 text-sm text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-100">
          <p className="font-semibold">Could not load posts.</p>
          <p className="mt-2 opacity-90">
            Check Supabase URL and anon key in <code className="rounded bg-amber-100/90 px-1.5 py-0.5 text-xs dark:bg-amber-900/80">.env.local</code>,
            restart dev, and run{" "}
            <code className="rounded bg-amber-100/90 px-1.5 py-0.5 text-xs dark:bg-amber-900/80">supabase/migrations/001_initial_schema.sql</code>.
          </p>
          {process.env.NODE_ENV === "development" && (
            <pre className="mt-3 max-h-40 overflow-auto whitespace-pre-wrap rounded-xl border border-amber-200 bg-white/80 p-3 text-xs dark:border-amber-800 dark:bg-stone-950/60">
              {error.message}
              {error.details ? `\n${error.details}` : ""}
              {error.hint ? `\nHint: ${error.hint}` : ""}
            </pre>
          )}
        </div>
      )}

      {!error && (!posts || posts.length === 0) && (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-[var(--surface)]/60 px-8 py-14 text-center dark:border-stone-700 dark:bg-stone-900/30">
          {q ? (
            <p className="text-stone-600 dark:text-stone-400">No posts match your search.</p>
          ) : (
            <>
              <p className="font-display text-lg font-semibold text-stone-900 dark:text-stone-100">
                No posts yet—your blog is ready for the first one.
              </p>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-stone-600 dark:text-stone-400">
                The feed is empty because no posts exist yet. Sign in and use{" "}
                <strong className="text-stone-800 dark:text-stone-200">New post</strong> to publish your first entry.
              </p>
            </>
          )}
        </div>
      )}

      {hasPosts && (
        <div className="grid gap-8 sm:grid-cols-2 lg:gap-10 xl:grid-cols-3">
          {(posts ?? []).map((p, i) => (
            <PostCard
              key={p.id}
              animationIndex={i}
              post={{
                id: p.id,
                title: p.title,
                image_url: p.image_url,
                summary: p.summary,
                created_at: p.created_at,
                authorName: names.get(p.author_id) ?? null,
              }}
            />
          ))}
        </div>
      )}

      {hasPosts && totalPages > 1 && (
        <nav className="mt-14 flex items-center justify-center gap-2 text-sm">
          {page > 1 ? (
            <Link
              href={`/?page=${page - 1}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
              className="rounded-full border border-stone-300 px-4 py-2 font-medium text-stone-700 transition hover:bg-stone-100 dark:border-stone-600 dark:text-stone-300 dark:hover:bg-stone-800"
            >
              ← Previous
            </Link>
          ) : (
            <span className="rounded-full px-4 py-2 text-stone-400">← Previous</span>
          )}
          <span className="px-3 font-medium text-stone-500 dark:text-stone-400">
            {page} / {totalPages}
          </span>
          {page < totalPages ? (
            <Link
              href={`/?page=${page + 1}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
              className="rounded-full border border-stone-300 px-4 py-2 font-medium text-stone-700 transition hover:bg-stone-100 dark:border-stone-600 dark:text-stone-300 dark:hover:bg-stone-800"
            >
              Next →
            </Link>
          ) : (
            <span className="rounded-full px-4 py-2 text-stone-400">Next →</span>
          )}
        </nav>
      )}
    </div>
  );
}
