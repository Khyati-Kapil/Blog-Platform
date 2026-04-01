"use client";

import { useActionState } from "react";
import { addComment, type ActionResult } from "@/app/posts/actions";

export function CommentForm({ postId }: { postId: string }) {
  const [state, formAction, pending] = useActionState(
    async (_prev: ActionResult | null, formData: FormData) => addComment(postId, formData),
    null,
  );

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <label className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Add a comment</label>
      <textarea
        name="comment_text"
        required
        rows={3}
        className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
        placeholder="Share your thoughts…"
      />
      {state?.error && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
      >
        {pending ? "Posting…" : "Post comment"}
      </button>
    </form>
  );
}
