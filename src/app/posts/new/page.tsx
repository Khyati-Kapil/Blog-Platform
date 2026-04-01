import { redirect } from "next/navigation";
import { PostForm } from "@/components/PostForm";
import { getSessionProfile } from "@/lib/supabase/server";

export default async function NewPostPage() {
  const session = await getSessionProfile();
  if (!session) redirect("/login");
  const role = session.profile?.role;
  if (role !== "author" && role !== "admin") {
    redirect("/");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">New post</h1>
      <p className="mb-8 text-sm text-zinc-600 dark:text-zinc-400">
        After you publish, the app calls Google Gemini to create a ~200-word summary stored with the post.
      </p>
      <PostForm mode="create" />
    </div>
  );
}
