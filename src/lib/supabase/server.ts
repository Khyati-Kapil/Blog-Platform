import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            /* Server Component cannot set cookies in some contexts */
          }
        },
      },
    },
  );
}

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: "viewer" | "author" | "admin";
};

export async function getSessionProfile(): Promise<{
  user: { id: string; email?: string };
  profile: UserProfile | null;
} | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("users")
    .select("id, name, email, role")
    .eq("id", user.id)
    .single();

  return {
    user: { id: user.id, email: user.email ?? undefined },
    profile: profile as UserProfile | null,
  };
}
