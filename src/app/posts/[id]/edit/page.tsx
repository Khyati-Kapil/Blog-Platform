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
  const isOwnerAuthor = profile?.role === "author" && post.author_id === user.id;
  if (!isAdmin && !isOwnerAuthor) {
    redirect(`/posts/${id}`);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Edit post</h1>
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
  );
}
