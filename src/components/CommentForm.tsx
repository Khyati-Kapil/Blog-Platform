"use client";

import { useActionState } from "react";
import { addComment, type ActionResult } from "@/app/posts/actions";

const field =
  "input-focus w-full rounded-xl border border-stone-300 bg-[var(--surface)] px-4 py-3 text-sm text-stone-900 dark:border-stone-600 dark:bg-stone-900/50 dark:text-stone-100";

export function CommentForm({ postId }: { postId: string }) {
  const [state, formAction, pending] = useActionState(
    async (_prev: ActionResult | null, formData: FormData) => addComment(postId, formData),
    null,
  );

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <label className="text-sm font-semibold text-stone-800 dark:text-stone-200">
        Add a comment
      </label>
      <textarea
        name="comment_text"
        required
        rows={4}
        className={field}
        placeholder="Thoughts, questions, or appreciation…"
      />
      {state?.error && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded-full bg-stone-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:opacity-50 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white"
      >
        {pending ? "Posting…" : "Post comment"}
      </button>
    </form>
  );
}
