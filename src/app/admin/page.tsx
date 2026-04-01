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
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Admin</h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Manage roles and monitor recent comments across all posts.
      </p>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Users</h2>
        <div className="mt-4 overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-zinc-100 text-xs uppercase text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
              </tr>
            </thead>
            <tbody>
              {(users ?? []).map((u) => (
                <tr key={u.id} className="border-t border-zinc-200 dark:border-zinc-800">
                  <td className="px-4 py-3">{u.name}</td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{u.email}</td>
                  <td className="px-4 py-3">
                    <RoleSelect userId={u.id} current={u.role as "viewer" | "author" | "admin"} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-lg font-semibold">Recent comments</h2>
        <ul className="mt-4 flex flex-col gap-3">
          {(recentComments ?? []).map((c) => (
            <li
              key={c.id}
              className="rounded-lg border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <p className="text-sm text-zinc-800 dark:text-zinc-200">{c.comment_text}</p>
              <p className="mt-2 text-xs text-zinc-500">
                {commentNames.get(c.user_id) ?? "User"} ·{" "}
                <Link href={`/posts/${c.post_id}`} className="underline">
                  {titles.get(c.post_id) ?? "Post"}
                </Link>{" "}
                · {new Date(c.created_at).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
        {(recentComments ?? []).length === 0 && (
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">No comments yet.</p>
        )}
      </section>
    </div>
  );
}
