"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const field =
  "input-focus w-full rounded-xl border border-stone-300 bg-[var(--surface)] px-4 py-3 text-stone-900 dark:border-stone-600 dark:bg-stone-900/60 dark:text-stone-100";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    router.refresh();
    router.push("/");
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-semibold text-stone-800 dark:text-stone-200">Email</span>
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={field}
        />
      </label>
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-semibold text-stone-800 dark:text-stone-200">Password</span>
        <input
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={field}
        />
      </label>
      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-100">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="mt-2 w-full rounded-full bg-stone-900 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:opacity-50 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white"
      >
        {loading ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
