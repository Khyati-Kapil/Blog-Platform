"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signUpAction, type AuthActionResult } from "@/app/auth/actions";

const field =
  "input-focus w-full rounded-xl border border-stone-300 bg-[var(--surface)] px-4 py-3 text-stone-900 dark:border-stone-600 dark:bg-stone-900/60 dark:text-stone-100";

export function SignupForm() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<AuthActionResult | null, FormData>(
    signUpAction,
    null,
  );

  useEffect(() => {
    if (state?.ok) {
      router.refresh();
      router.push("/");
    }
  }, [state, router]);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-semibold text-stone-800 dark:text-stone-200">Display name</span>
        <input
          type="text"
          required
          autoComplete="name"
          name="name"
          className={field}
        />
      </label>
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-semibold text-stone-800 dark:text-stone-200">Email</span>
        <input
          type="email"
          required
          autoComplete="email"
          name="email"
          className={field}
        />
      </label>
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-semibold text-stone-800 dark:text-stone-200">Password</span>
        <input
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          name="password"
          className={field}
        />
      </label>
      {state?.error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-100">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="mt-2 w-full rounded-full bg-gradient-to-r from-orange-600 to-amber-600 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-600/20 transition hover:from-orange-500 hover:to-amber-500 disabled:opacity-50 dark:shadow-orange-900/30"
      >
        {pending ? "Creating…" : "Create account"}
      </button>
    </form>
  );
}
