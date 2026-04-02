import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/SignOutButton";

export async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile: { role: string } | null = null;
  if (user) {
    const { data } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();
    profile = data;
  }

  const canWrite = profile?.role === "author" || profile?.role === "admin";
  const isAdmin = profile?.role === "admin";

  const navLink =
    "rounded-full px-3 py-1.5 text-sm font-medium text-stone-600 transition-all duration-200 hover:bg-stone-200/80 hover:text-stone-900 active:scale-95 dark:text-stone-400 dark:hover:bg-stone-800/80 dark:hover:text-stone-100";

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200/70 bg-[var(--surface)]/75 backdrop-blur-xl dark:border-stone-800/70 dark:bg-stone-950/75">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-4 sm:px-6">
        <Link
          href="/"
          className="group flex items-baseline gap-2 transition-transform duration-300 ease-out hover:scale-[1.02] active:scale-[0.98]"
        >
          <span className="font-display text-xl font-semibold tracking-tight text-stone-900 transition-colors group-hover:text-orange-700 dark:text-stone-50 dark:group-hover:text-orange-400 sm:text-2xl">
            Blog Platform
          </span>
          <span className="hidden font-medium text-xs text-orange-600/90 tracking-wide uppercase sm:inline dark:text-orange-400/90">
            Full-stack blog
          </span>
        </Link>
        <nav className="flex flex-wrap items-center justify-end gap-1 sm:gap-2">
          <Link href="/" className={navLink}>
            Posts
          </Link>
          {canWrite && (
            <Link
              href="/posts/new"
              className={`${navLink} text-orange-700 dark:text-orange-400`}
            >
              New post
            </Link>
          )}
          {isAdmin && (
            <Link href="/admin" className={navLink}>
              Admin
            </Link>
          )}
          {user ? (
            <SignOutButton />
          ) : (
            <>
              <Link href="/login" className={navLink}>
                Sign in
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-gradient-to-r from-orange-600 to-amber-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-orange-600/25 transition-all duration-200 hover:from-orange-500 hover:to-amber-500 hover:shadow-orange-500/30 active:scale-95 dark:from-orange-500 dark:to-amber-500 dark:shadow-orange-900/40"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
