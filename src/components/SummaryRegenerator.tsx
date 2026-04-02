"use client";

import { useActionState, useEffect } from "react";
import { regenerateSummary, type ActionResult } from "@/app/posts/actions";

export function SummaryRegenerator({ postId }: { postId: string }) {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    async () => regenerateSummary(postId),
    null,
  );

  useEffect(() => {
    if (state?.ok) {
      // No-op: page will revalidate server-side
    }
  }, [state]);

  return (
    <form action={formAction} className="mt-4 flex flex-wrap items-center gap-3">
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-amber-600 px-4 py-2 text-xs font-semibold tracking-[0.2em] text-white uppercase hover:bg-amber-500 disabled:opacity-60"
      >
        {pending ? "Generating…" : "Generate summary"}
      </button>
      {state?.error && (
        <span className="text-xs font-medium text-amber-900 dark:text-amber-200">
          {state.error}
        </span>
      )}
      {state?.ok && !state?.error && (
        <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
          Summary generated. Refresh if needed.
        </span>
      )}
    </form>
  );
}
