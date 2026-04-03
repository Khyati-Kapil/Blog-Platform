import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PostForm } from "@/components/PostForm";
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
    </div>
  );
}
