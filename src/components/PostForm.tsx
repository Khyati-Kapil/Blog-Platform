"use client";

import Image from "next/image";
import { useActionState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createPost, updatePost, type ActionResult } from "@/app/posts/actions";

type Props = {
  mode: "create" | "edit";
  postId?: string;
  initial?: {
    title: string;
    body: string;
    image_url: string;
  };
};

const label = "text-sm font-semibold text-stone-800 dark:text-stone-200";
const field =
  "input-focus w-full rounded-xl border border-stone-300 bg-[var(--surface)] px-4 py-3 text-stone-900 shadow-sm dark:border-stone-600 dark:bg-stone-900/60 dark:text-stone-100";

export function PostForm({ mode, postId, initial }: Props) {
  const router = useRouter();

  const boundAction = useCallback(
    async (
      _prev: ActionResult | null,
      formData: FormData,
    ): Promise<ActionResult | null> => {
      if (mode === "edit" && postId) {
        return updatePost(postId, formData);
      }
      return createPost(formData);
    },
    [mode, postId],
  );

  const [state, formAction, pending] = useActionState(boundAction, null);

  useEffect(() => {
    if (state?.ok) {
      if (mode === "edit" && postId) {
        router.push(`/posts/${postId}`);
      } else {
        router.push("/");
      }
    }
  }, [state, mode, postId, router]);

  return (
    <form
      action={formAction}
      className="flex max-w-2xl flex-col gap-8 rounded-3xl border border-stone-200/90 bg-[var(--surface)]/80 p-6 shadow-xl shadow-stone-900/5 backdrop-blur-sm dark:border-stone-800 dark:bg-stone-900/40 dark:shadow-black/20 sm:p-8"
    >
      <label className="flex flex-col gap-2">
        <span className={label}>Title</span>
        <input name="title" required defaultValue={initial?.title} className={field} />
      </label>

      <label className="flex flex-col gap-2">
        <span className={label}>Body</span>
        <textarea
          name="body"
          required
          rows={14}
          defaultValue={initial?.body}
          className={`${field} resize-y font-mono text-[13px] leading-relaxed`}
        />
      </label>

      <div className="flex flex-col gap-3">
        <span className={label}>Featured image</span>
        <p className="text-xs leading-relaxed text-stone-500 dark:text-stone-400">
          Upload a file, or paste an image URL (used when no new file is selected).
        </p>
        {initial?.image_url && (
          <div className="relative mb-1 aspect-[16/9] w-full max-w-md overflow-hidden rounded-2xl border border-stone-200 dark:border-stone-700">
            <Image
              src={initial.image_url}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 400px"
              unoptimized={initial.image_url.startsWith("http") && !initial.image_url.includes("supabase")}
            />
          </div>
        )}
        <input
          name="image"
          type="file"
          accept="image/*"
          className="text-sm text-stone-600 file:mr-4 file:rounded-xl file:border-0 file:bg-orange-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-orange-900 hover:file:bg-orange-200 dark:text-stone-400 dark:file:bg-orange-950/60 dark:file:text-orange-200 dark:hover:file:bg-orange-900/60"
        />
        <input
          name="image_url"
          type="url"
          placeholder="https://…"
          defaultValue={mode === "edit" ? initial?.image_url : undefined}
          className={field}
        />
      </div>

      {state?.error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-100">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded-full bg-gradient-to-r from-orange-600 to-amber-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-600/25 transition hover:from-orange-500 hover:to-amber-500 disabled:opacity-50 dark:from-orange-600 dark:to-amber-600 dark:shadow-orange-900/40"
      >
        {pending ? "Saving…" : mode === "create" ? "Publish post" : "Save changes"}
      </button>
    </form>
  );
}
