import Image from "next/image";
import Link from "next/link";

export type PostCardData = {
  id: string;
  title: string;
  image_url: string;
  summary: string | null;
  created_at: string;
  authorName?: string | null;
};

export function PostCard({ post }: { post: PostCardData }) {
  const excerpt =
    post.summary && post.summary.length > 320
      ? `${post.summary.slice(0, 320)}…`
      : post.summary;

  return (
    <article className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950">
      <Link href={`/posts/${post.id}`} className="block">
        <div className="relative aspect-[16/9] w-full bg-zinc-100 dark:bg-zinc-900">
          <Image
            src={post.image_url}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            unoptimized={!post.image_url.includes("supabase")}
          />
        </div>
        <div className="flex flex-col gap-2 p-5">
          <h2 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {post.title}
          </h2>
          {post.authorName && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400">By {post.authorName}</p>
          )}
          {excerpt ? (
            <p className="line-clamp-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              {excerpt}
            </p>
          ) : (
            <p className="text-sm italic text-zinc-500 dark:text-zinc-500">No summary yet.</p>
          )}
        </div>
      </Link>
    </article>
  );
}
