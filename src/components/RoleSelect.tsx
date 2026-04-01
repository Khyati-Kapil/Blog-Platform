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
    <form action={formAction} className="flex items-center gap-2">
      <select
        name="role"
        defaultValue={current}
        className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-950"
      >
        <option value="viewer">viewer</option>
        <option value="author">author</option>
        <option value="admin">admin</option>
      </select>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-zinc-200 px-2 py-1 text-xs font-medium text-zinc-900 hover:bg-zinc-300 disabled:opacity-60 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
      >
        {pending ? "…" : "Save"}
      </button>
      {state?.error && <span className="text-xs text-red-600">{state.error}</span>}
    </form>
  );
}
