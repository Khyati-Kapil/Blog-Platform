import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PostForm } from "@/components/PostForm";
import { deletePost } from "@/app/posts/actions";
import { createClient } from "@/lib/supabase/server";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: post, error } = await supabase
    .from("posts")
    .select("id, title, body, image_url, author_id")
    .eq("id", id)
    .single();

  if (error || !post) notFound();

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();

  const isAdmin = profile?.role === "admin";
  const isOwner = post.author_id === user.id;
  if (!isAdmin && !isOwner) {
    redirect(`/posts/${id}`);
  }

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-12 sm:px-6 sm:py-16">
      <Link
        href={`/posts/${id}`}
        className="mb-8 inline-flex items-center gap-1 text-sm font-medium text-orange-600 transition hover:gap-2 dark:text-orange-400"
      >
        ← Back to post
      </Link>
      <p className="text-xs font-semibold tracking-[0.2em] text-orange-600 uppercase dark:text-orange-400">
        Edit
      </p>
      <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl dark:text-stone-50">
        Edit post
      </h1>
      <p className="mt-4 text-sm text-stone-600 dark:text-stone-400">
        Saving will regenerate the AI summary from the latest body text.
      </p>
      <div className="mt-10">
        <PostForm
          mode="edit"
          postId={post.id}
          initial={{
            title: post.title,
            body: post.body,
            image_url: post.image_url,
          }}
        />
      </div>
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-red-200/70 bg-red-50/70 p-4 text-sm text-red-900 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-100">
        <div>
          <p className="font-semibold">Delete this post</p>
          <p className="text-xs opacity-90">This action cannot be undone.</p>
        </div>
        <form action={deletePost.bind(null, post.id)}>
          <button
            type="submit"
            className="rounded-full bg-red-600 px-4 py-2 text-xs font-semibold tracking-[0.2em] text-white uppercase hover:bg-red-500"
          >
            Delete post
          </button>
        </form>
      </div>
    </div>
  );
}
