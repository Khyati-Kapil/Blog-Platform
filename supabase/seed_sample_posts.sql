-- Sample blog posts for demos and local testing.
-- Prerequisites: run 001_initial_schema.sql first; at least one user with role author or admin.
-- Safe: runs only when public.posts is empty (won't duplicate on re-run).

WITH author AS (
  SELECT id
  FROM public.users
  WHERE role IN ('author', 'admin')
  ORDER BY created_at ASC
  LIMIT 1
),
sample_rows (title, body, image_url, summary) AS (
  VALUES
    (
      'Why we chose Next.js for a role-based blog',
      $body$This project sits on the App Router because we want server components for the post list, cookie-backed Supabase sessions in server actions, and straightforward layouts for public vs. authenticated views.

Server actions handle creates and updates: they verify the signed-in user, optionally upload a cover image to Storage, call the Gemini API for a summary, and insert or patch the row. That keeps secrets off the client and avoids an extra API layer.

Pagination and search stay on the database: ilike filters and range queries respect the same RLS policies that protect writes. Viewers only comment; authors own their posts; admins can moderate roles and read the admin dashboard.

The takeaway is not “use Next for everything,” but when your UI, auth, and data access all share one runtime, fewer moving parts end up in your mental model—and in your deployment checklist.$body$,
      'https://picsum.photos/seed/nextblog/1200/630',
      $sum$This article explains why Next.js App Router fits a blog that combines public reading, auth, and AI summaries. It highlights server actions for secure post creation, Supabase RLS for roles, and simple patterns for search and pagination without exposing API keys in the browser.$sum$
    ),
    (
      'Row-level security that matches product roles',
      $body$Supabase Auth gives you auth.users; public.users mirrors id, name, email, and role. Row Level Security then encodes what “viewer,” “author,” and “admin” mean at the database layer, not only in React conditionals.

Posts are world-readable, but only authors or admins can insert. Updates allow admins to edit any row while authors may only touch their own work. Comments require an authenticated user_id matching auth.uid(). Storage policies mirror the same role checks for featured images.

Duplicating rules in middleware or Server Components is still useful for UX—fast redirects—but RLS is the backstop when someone bypasses your UI. Tests and code reviews should reflect both layers.$body$,
      'https://picsum.photos/seed/rlsrocks/1200/630',
      $sum$An overview of aligning Supabase RLS with viewer, author, and admin capabilities. It compares policy intent with UI guards, stresses defense in depth, and describes typical select, insert, and update rules for posts, comments, and storage.$sum$
    ),
    (
      'Summaries with Gemini: prompting and failure modes',
      $body$When a post is saved, the backend sends the body text—trimmed to a safe length—to a small, structured prompt that asks for roughly two hundred words of plain language. The reply is stored on the posts.summary column and shown on cards and detail pages.

Failures should not block publishing: if the API returns an error or times out, we still insert the post and leave summary null or refresh it on the next edit. Rate limits and key rotation belong in environment configuration on the server only.

Tuning the prompt matters more than swapping models: specify tone, length, and “no markdown” so the listing stays visually consistent. Log errors sparingly in production to avoid leaking content.$body$,
      'https://picsum.photos/seed/gemini/1200/630',
      $sum$Describes generating AI summaries with Google Gemini after each save, including prompt shape, storing results in Postgres, and degrading gracefully when the API fails so authors are never blocked from publishing.$sum$
    ),
    (
      'Search and pagination without breaking RLS',
      $body$PostgREST combines filters with RLS automatically. Our feed uses count exact plus range for page size, and optional or() clauses for title and body search. Escaping % and _ in user input avoids accidental wildcard matches.

Indexes on created_at and author_id keep sorts cheap as the library grows. For larger catalogs, consider full-text search or materialized views—but for a class project or MVP, btree plus ilike is predictable and easy to reason about.

Client state only tracks query strings; the server remains the source of truth for every page of results.$body$,
      'https://picsum.photos/seed/searchpage/1200/630',
      $sum$Covers ilike search, keyset or offset pagination with Supabase, and why RLS still applies to filtered queries. Mentions indexing basics and when to graduate to full-text search for bigger archives.$sum$
    ),
    (
      'Deploying the blog to your own VPS',
      $body$A Node process running next start behind nginx or Caddy is enough for many assignments. Build with production env vars: public Supabase URL and anon key for the browser bundle, plus the Google API key only where generateContent runs.

Use systemd or pm2 for restarts, point TLS at the reverse proxy, and register redirect URLs in Supabase Auth for your real domain. Smoke-test signup, post publish, comment, and admin role changes after each deploy.

Document the steps in README so reviewers can reproduce your environment without guesswork.$body$,
      'https://picsum.photos/seed/vpsdeploy/1200/630',
      $sum$Practical notes on shipping the stack to a VPS: process management, TLS termination, env separation for public vs. server-only keys, and Supabase auth URL configuration after you have a stable domain.$sum$
    ),
    (
      'Comments as a lightweight community layer',
      $body$Threaded replies are out of scope here, but a simple chronologic list under each post already teaches joins, attribution, and moderation. Each row stores post_id, user_id, and comment_text with foreign keys for integrity.

Authors see discussion on their posts in the same view as everyone else; admins get an aggregate recent feed for spot checks. Reporting or blocking can grow from this baseline if requirements expand.

Keeping comments plain text avoids XSS surprises; render without dangerouslySetInnerHTML and rely on CSS for presentation.$body$,
      'https://picsum.photos/seed/comments/1200/630',
      $sum$Explains a minimal comment model for blog posts: FKs to posts and users, RLS for inserts, plain-text rendering for safety, and how authors and admins observe activity without a heavy moderation suite.$sum$
    )
)
INSERT INTO public.posts (title, body, image_url, author_id, summary)
SELECT r.title, r.body, r.image_url, a.id, r.summary
FROM author a
CROSS JOIN sample_rows r
WHERE NOT EXISTS (SELECT 1 FROM public.posts LIMIT 1);
