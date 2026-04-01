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
    <form action={formAction} className="flex max-w-2xl flex-col gap-6">
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-zinc-800 dark:text-zinc-200">Title</span>
        <input
          name="title"
          required
          defaultValue={initial?.title}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-zinc-800 dark:text-zinc-200">Body</span>
        <textarea
          name="body"
          required
          rows={14}
          defaultValue={initial?.body}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 font-mono text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
        />
      </label>

      <div className="flex flex-col gap-2 text-sm">
        <span className="font-medium text-zinc-800 dark:text-zinc-200">Featured image</span>
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          Upload a file, or paste an image URL (used when no new file is selected).
        </p>
        {initial?.image_url && (
          <div className="relative mb-2 aspect-[16/9] w-full max-w-md overflow-hidden rounded-md border border-zinc-200 dark:border-zinc-800">
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
          className="text-sm text-zinc-700 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-100 file:px-3 file:py-1.5 file:text-sm dark:text-zinc-300 dark:file:bg-zinc-800"
        />
        <input
          name="image_url"
          type="url"
          placeholder="https://…"
          defaultValue={mode === "edit" ? initial?.image_url : undefined}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
        />
      </div>

      {state?.error && (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
      >
        {pending ? "Saving…" : mode === "create" ? "Publish" : "Save changes"}
      </button>
    </form>
  );
}
