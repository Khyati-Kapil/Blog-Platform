import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CommentForm } from "@/components/CommentForm";
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

  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <div className="relative mb-8 aspect-[21/9] w-full overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-900">
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

      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">{post.title}</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          {author?.name ? `By ${author.name}` : "Unknown author"} ·{" "}
          {new Date(post.created_at).toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
        {canEdit && (
          <Link
            href={`/posts/${post.id}/edit`}
            className="mt-4 inline-block text-sm font-medium text-zinc-900 underline dark:text-zinc-100"
          >
            Edit post
          </Link>
        )}
      </header>

      {post.summary && (
        <section className="mb-10 rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/40">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Summary
          </h2>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
            {post.summary}
          </p>
        </section>
      )}

      <div className="whitespace-pre-wrap text-base leading-relaxed text-zinc-800 dark:text-zinc-200">
        {post.body}
      </div>

      <section className="mt-14 border-t border-zinc-200 pt-10 dark:border-zinc-800">
        <h2 className="mb-6 text-lg font-semibold">Comments</h2>
        <ul className="mb-8 flex flex-col gap-4">
          {(comments ?? []).map((c) => (
            <li
              key={c.id}
              className="rounded-lg border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                {names.get(c.user_id) ?? "Reader"}
              </p>
              <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">{c.comment_text}</p>
              <p className="mt-2 text-xs text-zinc-500">
                {new Date(c.created_at).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
        {canComment ? (
          <CommentForm postId={post.id} />
        ) : (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            <Link href="/login" className="font-medium underline">
              Sign in
            </Link>{" "}
            to leave a comment.
          </p>
        )}
      </section>
    </article>
  );
}
