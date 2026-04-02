"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
    router.push("/");
  }

  return (
    <button
      type="button"
      onClick={() => void signOut()}
      className="rounded-full px-3 py-1.5 text-sm font-medium text-stone-500 transition-colors hover:bg-stone-200/80 hover:text-stone-800 dark:text-stone-400 dark:hover:bg-stone-800/80 dark:hover:text-stone-100"
    >
      Sign out
    </button>
  );
}
