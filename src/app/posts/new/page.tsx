import { redirect } from "next/navigation";
import Link from "next/link";
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
    <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-12 sm:px-6 sm:py-16">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-1 text-sm font-medium text-orange-600 transition hover:gap-2 dark:text-orange-400"
      >
        ← Back to posts
      </Link>
      <p className="text-xs font-semibold tracking-[0.2em] text-orange-600 uppercase dark:text-orange-400">
        New post
      </p>
      <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl dark:text-stone-50">
        Create a post
      </h1>
      <p className="mt-4 max-w-lg text-sm leading-relaxed text-stone-600 dark:text-stone-400">
        When you publish, Google Gemini generates a ~200 word summary and saves it on the post for the listing and detail pages.
      </p>
      <div className="mt-10">
        <PostForm mode="create" />
      </div>
    </div>
  );
}
