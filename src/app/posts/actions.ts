"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { generatePostSummary } from "@/lib/ai/summary";
import { createClient } from "@/lib/supabase/server";

export type ActionResult = { ok?: true; error?: string };

async function requireAuthorOrAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "author" && profile?.role !== "admin") {
    redirect("/");
  }
  return { supabase, userId: user.id };
}

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") redirect("/");
  return { supabase, userId: user.id };
}

export async function createPost(formData: FormData): Promise<ActionResult> {
  const { supabase, userId } = await requireAuthorOrAdmin();

  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const imageFile = formData.get("image") as File | null;
  const imageUrlField = String(formData.get("image_url") ?? "").trim();

  if (!title || !body) {
    return { error: "Title and body are required." };
  }

  let image_url = imageUrlField;

  if (imageFile && imageFile.size > 0) {
    const safeName = imageFile.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const path = `${userId}/${Date.now()}-${safeName}`;
    const buf = Buffer.from(await imageFile.arrayBuffer());
    const { error: upErr } = await supabase.storage
      .from("post-images")
      .upload(path, buf, { contentType: imageFile.type || "application/octet-stream" });
    if (upErr) {
      return { error: `Image upload failed: ${upErr.message}` };
    }
    const { data: pub } = supabase.storage.from("post-images").getPublicUrl(path);
    image_url = pub.publicUrl;
  }

  if (!image_url) {
    return { error: "Provide a featured image file or image URL." };
  }

  let summary: string | null = null;
  try {
    summary = await generatePostSummary(body);
  } catch {
    summary = null;
  }

  const { error } = await supabase.from("posts").insert({
    title,
    body,
    image_url,
    author_id: userId,
    summary,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/");
  return { ok: true };
}

export async function updatePost(postId: string, formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: post } = await supabase.from("posts").select("author_id").eq("id", postId).single();
  if (!post) return { error: "Post not found." };

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.role === "admin";
  const isOwnerAuthor =
    post.author_id === user.id && profile?.role === "author";
  if (!isAdmin && !isOwnerAuthor) {
    return { error: "Not allowed to edit this post." };
  }

  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const imageFile = formData.get("image") as File | null;
  const imageUrlField = String(formData.get("image_url") ?? "").trim();

  if (!title || !body) {
    return { error: "Title and body are required." };
  }

  let image_url: string | undefined;

  if (imageFile && imageFile.size > 0) {
    const safeName = imageFile.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const path = `${user.id}/${Date.now()}-${safeName}`;
    const buf = Buffer.from(await imageFile.arrayBuffer());
    const { error: upErr } = await supabase.storage
      .from("post-images")
      .upload(path, buf, { contentType: imageFile.type || "application/octet-stream" });
    if (upErr) {
      return { error: `Image upload failed: ${upErr.message}` };
    }
    const { data: pub } = supabase.storage.from("post-images").getPublicUrl(path);
    image_url = pub.publicUrl;
  } else if (imageUrlField) {
    image_url = imageUrlField;
  }

  let summary: string | null | undefined;
  try {
    summary = await generatePostSummary(body);
  } catch {
    summary = undefined;
  }

  const patch: Record<string, unknown> = { title, body };
  if (image_url) patch.image_url = image_url;
  if (summary !== undefined) patch.summary = summary;

  const { error } = await supabase.from("posts").update(patch).eq("id", postId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/");
  revalidatePath(`/posts/${postId}`);
  return { ok: true };
}

export async function addComment(postId: string, formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const comment_text = String(formData.get("comment_text") ?? "").trim();
  if (!comment_text) {
    return { error: "Comment cannot be empty." };
  }

  const { error } = await supabase.from("comments").insert({
    post_id: postId,
    user_id: user.id,
    comment_text,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/posts/${postId}`);
  return { ok: true };
}

export async function updateUserRole(
  userId: string,
  role: "viewer" | "author" | "admin",
): Promise<ActionResult> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("users").update({ role }).eq("id", userId);
  if (error) {
    return { error: error.message };
  }
  revalidatePath("/admin");
  return { ok: true };
}
