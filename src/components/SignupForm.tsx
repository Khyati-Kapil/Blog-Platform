"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const field =
  "input-focus w-full rounded-xl border border-stone-300 bg-[var(--surface)] px-4 py-3 text-stone-900 dark:border-stone-600 dark:bg-stone-900/60 dark:text-stone-100";

export function SignupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
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
        <span className="font-semibold text-stone-800 dark:text-stone-200">Display name</span>
        <input
          type="text"
          required
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={field}
        />
      </label>
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
          minLength={6}
          autoComplete="new-password"
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
        className="mt-2 w-full rounded-full bg-gradient-to-r from-orange-600 to-amber-600 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-600/20 transition hover:from-orange-500 hover:to-amber-500 disabled:opacity-50 dark:shadow-orange-900/30"
      >
        {loading ? "Creating…" : "Create account"}
      </button>
    </form>
  );
}
