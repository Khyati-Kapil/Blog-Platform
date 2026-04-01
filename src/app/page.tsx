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

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Latest posts</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Search titles and bodies. Summaries are generated when posts are published.
          </p>
        </div>
        <form method="get" className="flex w-full max-w-md gap-2 sm:w-auto">
          <input type="hidden" name="page" value="1" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Search…"
            className="min-w-0 flex-1 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
          <button
            type="submit"
            className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
          >
            Search
          </button>
        </form>
      </div>

      {error && (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100">
          Could not load posts. Check Supabase configuration and that migrations have been applied.
        </p>
      )}

      {!error && (!posts || posts.length === 0) && (
        <p className="text-zinc-600 dark:text-zinc-400">No posts match your filters yet.</p>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        {(posts ?? []).map((p) => (
          <PostCard
            key={p.id}
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

      {totalPages > 1 && (
        <nav className="mt-10 flex items-center justify-center gap-4 text-sm">
          {page > 1 ? (
            <Link
              href={`/?page=${page - 1}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
              className="text-zinc-700 underline dark:text-zinc-300"
            >
              Previous
            </Link>
          ) : (
            <span className="text-zinc-400">Previous</span>
          )}
          <span className="text-zinc-600 dark:text-zinc-400">
            Page {page} of {totalPages}
          </span>
          {page < totalPages ? (
            <Link
              href={`/?page=${page + 1}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
              className="text-zinc-700 underline dark:text-zinc-300"
            >
              Next
            </Link>
          ) : (
            <span className="text-zinc-400">Next</span>
          )}
        </nav>
      )}
    </div>
  );
}
