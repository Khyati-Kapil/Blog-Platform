import Link from "next/link";
import { redirect } from "next/navigation";
import { SignupForm } from "@/components/SignupForm";
import { createClient } from "@/lib/supabase/server";

export default async function SignupPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/");

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col justify-center px-4 py-16 sm:px-6">
      <div className="rounded-3xl border border-stone-200/90 bg-[var(--surface)]/90 p-8 shadow-2xl shadow-stone-900/10 backdrop-blur-md dark:border-stone-800 dark:bg-stone-900/50 dark:shadow-black/40 sm:p-10">
        <p className="text-xs font-semibold tracking-[0.2em] text-orange-600 uppercase dark:text-orange-400">
          Sign up
        </p>
        <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight text-stone-900 dark:text-stone-50">
          Create account
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
          You start as a reader. An admin can promote you to author when you are ready to publish.
        </p>
        <div className="mt-8">
          <SignupForm />
        </div>
        <p className="mt-8 text-center text-sm text-stone-600 dark:text-stone-400">
          Already onboard?{" "}
          <Link
            href="/login"
            className="font-semibold text-orange-600 underline decoration-orange-600/30 underline-offset-4 hover:decoration-orange-600 dark:text-orange-400"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
