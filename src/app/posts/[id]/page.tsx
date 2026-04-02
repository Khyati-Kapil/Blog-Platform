import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CommentForm } from "@/components/CommentForm";
import { SummaryRegenerator } from "@/components/SummaryRegenerator";
import { createClient } from "@/lib/supabase/server";

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: post, error: postErr } = await supabase
    .from("posts")
    .select("id, title, body, image_url, summary, created_at, author_id")
    .eq("id", id)
    .single();

  if (postErr || !post) notFound();

  const { data: author } = await supabase.from("users").select("name").eq("id", post.author_id).single();

  const { data: comments } = await supabase
    .from("comments")
    .select("id, comment_text, created_at, user_id")
    .eq("post_id", id)
    .order("created_at", { ascending: true });

  const userIds = [...new Set((comments ?? []).map((c) => c.user_id))];
  const names = new Map<string, string>();
  if (userIds.length > 0) {
    const { data: users } = await supabase.from("users").select("id, name").in("id", userIds);
    (users ?? []).forEach((u) => names.set(u.id, u.name));
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  let profile: { role: string } | null = null;
  if (user) {
    const { data } = await supabase.from("users").select("role").eq("id", user.id).single();
    profile = data;
  }

  const canEdit =
    user &&
    (profile?.role === "admin" ||
      (profile?.role === "author" && post.author_id === user.id));

  const canComment = !!user;

  const dateLabel = new Date(post.created_at).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <article className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6 sm:py-16">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-1 text-sm font-medium text-orange-600 transition hover:gap-2 dark:text-orange-400"
      >
        ← Back to posts
      </Link>

      <div className="animate-hero-content relative mb-10 overflow-hidden rounded-3xl border border-stone-200/90 shadow-2xl shadow-stone-900/10 dark:border-stone-800 dark:shadow-black/40">
        <div className="relative aspect-[21/10] w-full bg-stone-200 md:aspect-[21/9] dark:bg-stone-800">
          <Image
            src={post.image_url}
            alt=""
            fill
            className="object-cover"
            priority
            sizes="100vw"
            unoptimized={!post.image_url.includes("supabase")}
          />
        </div>
      </div>

      <header className="animate-section-fade mb-10">
        <p className="mb-3 text-xs font-semibold tracking-[0.2em] text-orange-600 uppercase dark:text-orange-400">
          Blog post
        </p>
        <h1 className="font-display text-4xl font-semibold tracking-tight text-stone-900 md:text-5xl dark:text-stone-50">
          {post.title}
        </h1>
        <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-stone-600 dark:text-stone-400">
          <span className="font-medium text-stone-800 dark:text-stone-200">
            {author?.name ?? "Unknown author"}
          </span>
          <span className="text-stone-300 dark:text-stone-600" aria-hidden>
            ·
          </span>
          <time dateTime={post.created_at}>{dateLabel}</time>
          {canEdit && (
            <>
              <span className="text-stone-300 dark:text-stone-600" aria-hidden>
                ·
              </span>
              <Link
                href={`/posts/${post.id}/edit`}
                className="font-semibold text-orange-600 underline decoration-orange-600/30 underline-offset-4 hover:decoration-orange-600 dark:text-orange-400 dark:decoration-orange-400/30"
              >
                Edit
              </Link>
            </>
          )}
        </div>
      </header>

      {post.summary && (
        <section className="mb-12 rounded-2xl border border-orange-200/60 bg-gradient-to-br from-orange-50/90 to-amber-50/50 p-6 dark:border-orange-900/40 dark:from-orange-950/50 dark:to-amber-950/20">
          <h2 className="text-[10px] font-bold tracking-[0.2em] text-orange-700 uppercase dark:text-orange-400">
            AI summary
          </h2>
          <p className="mt-3 whitespace-pre-wrap text-base leading-relaxed text-stone-800 dark:text-stone-200">
            {post.summary}
          </p>
        </section>
      )}
      {!post.summary && canEdit && (
        <section className="mb-12 rounded-2xl border border-amber-200/70 bg-amber-50/70 p-6 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
          <p className="font-semibold">AI summary is missing.</p>
          <p className="mt-2 opacity-90">
            Click the button below to generate it now.
          </p>
          <SummaryRegenerator postId={post.id} />
        </section>
      )}

      <div className="border-l-2 border-orange-500/50 pl-6 md:pl-8">
        <div className="whitespace-pre-wrap text-lg leading-[1.8] text-stone-800 dark:text-stone-200">
          {post.body}
        </div>
      </div>

      <section className="mt-16 border-t border-stone-200 pt-12 dark:border-stone-800">
        <h2 className="font-display text-2xl font-semibold text-stone-900 dark:text-stone-50">
          Comments
        </h2>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
          {(comments ?? []).length} {(comments ?? []).length === 1 ? "comment" : "comments"}
        </p>
        <ul className="mt-8 flex flex-col gap-4">
          {(comments ?? []).map((c) => (
            <li
              key={c.id}
              className="rounded-2xl border border-stone-200/90 bg-[var(--surface)] p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900/40"
            >
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                  {names.get(c.user_id) ?? "Reader"}
                </p>
                <time className="text-xs text-stone-400 tabular-nums dark:text-stone-500" dateTime={c.created_at}>
                  {new Date(c.created_at).toLocaleString()}
                </time>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-stone-700 dark:text-stone-300">
                {c.comment_text}
              </p>
            </li>
          ))}
        </ul>
        <div className="mt-8 rounded-2xl border border-stone-200 bg-[var(--surface)]/80 p-6 dark:border-stone-800 dark:bg-stone-900/40">
          {canComment ? (
            <CommentForm postId={post.id} />
          ) : (
            <p className="text-sm text-stone-600 dark:text-stone-400">
              <Link href="/login" className="font-semibold text-orange-600 dark:text-orange-400">
                Sign in
              </Link>{" "}
              to join the conversation.
            </p>
          )}
        </div>
      </section>
    </article>
  );
}
