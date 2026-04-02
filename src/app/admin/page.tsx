import Link from "next/link";
import { redirect } from "next/navigation";
import { RoleSelect } from "@/components/RoleSelect";
import { createClient } from "@/lib/supabase/server";

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: me } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (me?.role !== "admin") redirect("/");

  const { data: users } = await supabase
    .from("users")
    .select("id, name, email, role, created_at")
    .order("created_at", { ascending: false });

  const { data: recentComments } = await supabase
    .from("comments")
    .select("id, comment_text, created_at, post_id, user_id")
    .order("created_at", { ascending: false })
    .limit(25);

  const postIds = [...new Set((recentComments ?? []).map((c) => c.post_id))];
  const titles = new Map<string, string>();
  if (postIds.length > 0) {
    const { data: posts } = await supabase.from("posts").select("id, title").in("id", postIds);
    (posts ?? []).forEach((p) => titles.set(p.id, p.title));
  }

  const commentUserIds = [...new Set((recentComments ?? []).map((c) => c.user_id))];
  const commentNames = new Map<string, string>();
  if (commentUserIds.length > 0) {
    const { data: u } = await supabase.from("users").select("id, name").in("id", commentUserIds);
    (u ?? []).forEach((row) => commentNames.set(row.id, row.name));
  }

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-12 sm:px-6 sm:py-16">
      <p className="text-xs font-semibold tracking-[0.2em] text-orange-600 uppercase dark:text-orange-400">
        Blog admin
      </p>
      <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl dark:text-stone-50">
        Admin
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-stone-600 dark:text-stone-400">
        Promote readers to authors, watch discussion across the site, and jump to any thread.
      </p>

      <section className="mt-12">
        <h2 className="font-display text-xl font-semibold text-stone-900 dark:text-stone-50">
          People & roles
        </h2>
        <div className="mt-4 overflow-hidden rounded-2xl border border-stone-200/90 shadow-lg shadow-stone-900/5 dark:border-stone-800 dark:shadow-black/30">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-stone-200 bg-stone-100/80 text-[10px] font-bold tracking-wider text-stone-500 uppercase dark:border-stone-800 dark:bg-stone-900/80 dark:text-stone-400">
                <tr>
                  <th className="px-5 py-4">Name</th>
                  <th className="px-5 py-4">Email</th>
                  <th className="px-5 py-4">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 bg-[var(--surface)]/50 dark:divide-stone-800 dark:bg-stone-900/30">
                {(users ?? []).map((u) => (
                  <tr key={u.id}>
                    <td className="px-5 py-4 font-medium text-stone-900 dark:text-stone-100">{u.name}</td>
                    <td className="px-5 py-4 text-stone-600 dark:text-stone-400">{u.email}</td>
                    <td className="px-5 py-4">
                      <RoleSelect userId={u.id} current={u.role as "viewer" | "author" | "admin"} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="mt-14">
        <h2 className="font-display text-xl font-semibold text-stone-900 dark:text-stone-50">
          Recent comments
        </h2>
        <ul className="mt-4 flex flex-col gap-3">
          {(recentComments ?? []).map((c) => (
            <li
              key={c.id}
              className="rounded-2xl border border-stone-200/90 bg-[var(--surface)]/80 p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900/40"
            >
              <p className="text-sm leading-relaxed text-stone-800 dark:text-stone-200">{c.comment_text}</p>
              <p className="mt-3 text-xs text-stone-500 dark:text-stone-400">
                <span className="font-medium text-stone-700 dark:text-stone-300">
                  {commentNames.get(c.user_id) ?? "User"}
                </span>
                {" · "}
                <Link
                  href={`/posts/${c.post_id}`}
                  className="font-semibold text-orange-600 underline decoration-orange-600/30 underline-offset-2 dark:text-orange-400"
                >
                  {titles.get(c.post_id) ?? "Post"}
                </Link>
                {" · "}
                {new Date(c.created_at).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
        {(recentComments ?? []).length === 0 && (
          <p className="mt-3 text-sm text-stone-600 dark:text-stone-400">No comments yet.</p>
        )}
      </section>
    </div>
  );
}
