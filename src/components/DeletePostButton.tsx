"use client";

import { useActionState } from "react";
import { deletePost, type ActionResult } from "@/app/posts/actions";

export function DeletePostButton({ postId }: { postId: string }) {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    async () => deletePost(postId),
    null,
  );

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (!confirm("Are you sure you want to delete this post? This cannot be undone.")) {
          event.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        disabled={pending}
        className="text-xs font-semibold uppercase tracking-[0.2em] text-red-600 hover:text-red-500 disabled:opacity-60 dark:text-red-400"
      >
        {pending ? "Deleting…" : "Delete"}
      </button>
      {state?.error && (
        <span className="ml-2 text-xs font-medium text-red-500">{state.error}</span>
      )}
    </form>
  );
}
