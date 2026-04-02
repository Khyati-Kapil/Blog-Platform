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

type PostCardProps = {
  post: PostCardData;
  /** Stagger index for list entrance animation (home / search results). */
  animationIndex?: number;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function PostCard({ post, animationIndex }: PostCardProps) {
  const excerpt =
    post.summary && post.summary.length > 280
      ? `${post.summary.slice(0, 280)}…`
      : post.summary;

  const staggerStyle =
    animationIndex !== undefined
      ? { animationDelay: `${animationIndex * 70}ms` }
      : undefined;

  return (
    <article
      className={`group relative overflow-hidden rounded-2xl border border-stone-200/90 bg-[var(--surface)] shadow-sm transition duration-300 ease-out hover:-translate-y-1 hover:border-orange-200/80 hover:shadow-xl hover:shadow-orange-900/10 dark:border-stone-800/90 dark:bg-stone-900/40 dark:hover:border-orange-900/50 dark:hover:shadow-orange-950/30 ${animationIndex !== undefined ? "animate-stagger-card" : ""}`}
      style={staggerStyle}
    >
      <Link href={`/posts/${post.id}`} className="block outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] dark:focus-visible:ring-offset-stone-950">
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-200 dark:bg-stone-800">
          <Image
            src={post.image_url}
            alt=""
            fill
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 100vw, 50vw"
            unoptimized={!post.image_url.includes("supabase")}
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-stone-950/10 to-transparent opacity-90 transition group-hover:opacity-100"
            aria-hidden
          />
          <div className="absolute bottom-0 left-0 right-0 p-5 pr-8 pt-12">
            <p className="mb-1 text-[11px] font-semibold tracking-[0.2em] text-orange-200/90 uppercase">
              {formatDate(post.created_at)}
            </p>
            <h2 className="font-display text-xl leading-snug font-semibold text-white drop-shadow-sm sm:text-2xl">
              {post.title}
            </h2>
          </div>
        </div>
        <div className="flex flex-col gap-3 p-5 pt-4">
          {post.authorName && (
            <p className="text-xs font-medium text-stone-500 dark:text-stone-400">
              <span className="text-stone-400 dark:text-stone-500">By</span>{" "}
              <span className="text-stone-700 dark:text-stone-300">{post.authorName}</span>
            </p>
          )}
          {excerpt ? (
            <p className="line-clamp-3 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
              {excerpt}
            </p>
          ) : (
            <p className="text-sm italic text-stone-400 dark:text-stone-500">AI summary pending…</p>
          )}
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-orange-600 transition group-hover:gap-2 dark:text-orange-400">
            Read post
            <span aria-hidden>→</span>
          </span>
        </div>
      </Link>
    </article>
  );
}
