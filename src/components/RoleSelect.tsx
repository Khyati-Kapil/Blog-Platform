"use client";

import { useActionState } from "react";
import { updateUserRole, type ActionResult } from "@/app/posts/actions";

export function RoleSelect({
  userId,
  current,
}: {
  userId: string;
  current: "viewer" | "author" | "admin";
}) {
  const [state, formAction, pending] = useActionState(
    async (_prev: ActionResult | null, formData: FormData) => {
      const role = formData.get("role") as "viewer" | "author" | "admin";
      return updateUserRole(userId, role);
    },
    null,
  );

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2">
      <select
        name="role"
        defaultValue={current}
        className="input-focus rounded-full border border-stone-300 bg-[var(--surface)] px-3 py-1.5 text-xs font-medium text-stone-800 dark:border-stone-600 dark:bg-stone-900/60 dark:text-stone-200"
      >
        <option value="viewer">viewer</option>
        <option value="author">author</option>
        <option value="admin">admin</option>
      </select>
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-stone-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-stone-800 disabled:opacity-50 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white"
      >
        {pending ? "…" : "Save"}
      </button>
      {state?.error && (
        <span className="text-xs font-medium text-red-600 dark:text-red-400">{state.error}</span>
      )}
    </form>
  );
}
