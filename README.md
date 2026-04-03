# Blog Platform

A full-stack blogging app built with **Next.js (App Router)**, **Supabase Auth + Postgres**, and **Google Gemini** for automatic post summaries. It implements **viewer / author / admin** roles with row-level security in the database and server-side checks in Next.js. Any signed-in user can publish, and they become the author of their own posts; admins retain full moderation control.

## Tech stack

| Layer | Technology |
|--------|------------|
| App | Next.js 16, React 19, TypeScript, Tailwind CSS |
| Auth | Supabase Auth (email + password) |
| Database | Supabase Postgres + Row Level Security |
| Storage | Supabase Storage (`post-images` bucket, public read) |
| AI | Google Generative AI SDK (`@google/generative-ai`), model set by `GOOGLE_AI_MODEL` |
| Deployment | Render or Node.js on a VPS (see below) |

## Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project
- A [Google AI Studio](https://aistudio.google.com/) API key for Gemini

## Project setup

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd Blog-Platform
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure Supabase**

   - Create a project in Supabase.
   - Open **SQL Editor** and run:
     - `supabase/migrations/001_initial_schema.sql`
     - `supabase/migrations/002_relax_post_permissions.sql` (allows any signed-in user to create posts, owners can edit/delete their own posts, admins can moderate all).
   - Optional demo data: after you have at least one user, run `supabase/seed_sample_posts.sql` in the SQL Editor. It inserts six on-topic posts only when `posts` is empty (cover images use [picsum.photos](https://picsum.photos)).
   - Under **Authentication → URL configuration**, add your site URL and redirect URL: `http://localhost:3000/auth/callback` (and your production URL + `/auth/callback` after deployment).

4. **Environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Fill in:

   - `NEXT_PUBLIC_SUPABASE_URL` — **Project Settings → API → Project URL**
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — **anon public** key
   - `GOOGLE_AI_API_KEY` — from Google AI Studio

5. **Promote your first admin**

   New sign-ups get role `viewer` by default. After you register once, run in the SQL editor (replace the email):

   ```sql
   update public.users set role = 'admin' where email = 'you@example.com';
   ```

   As admin, use **Admin** in the nav to manage user roles.

## Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

- **Viewer**: sign up, read posts, comment when signed in, create posts.
- **Author**: legacy role (kept for schema parity); behaves like viewer with ownership on posts.
- **Admin**: edit/delete any post, change user roles, monitor recent comments.

## Build for production

```bash
npm run build
npm start
```



## Database schema (assignment alignment)

| Table | Fields |
|--------|--------|
| `users` | `id` (FK → `auth.users`), `name`, `email`, `role` |
| `posts` | `id`, `title`, `body`, `image_url`, `author_id`, `summary`, timestamps |
| `comments` | `id`, `post_id`, `user_id`, `comment_text`, `created_at` |

## AI summary flow

1. Any signed-in user submits a new or updated post (title, body, featured image).
2. Server action `createPost` / `updatePost` calls `generatePostSummary` (`src/lib/ai/summary.ts`) using Gemini.
3. The returned text is stored in `posts.summary` and shown on the home listing and post detail.




### AI-assisted development

This project was built with **Cursor** (and similar IDE AI) for scaffolding, refactoring, and documentation. That sped up boilerplate (Supabase client setup, forms, migrations) while keeping schema and RLS rules explicit in SQL and business logic in typed server actions.

### Feature logic (short)

- **Authentication**: Supabase email/password; session in HTTP-only cookies via `@supabase/ssr`; `auth/callback` exchanges OAuth/magic-link codes if enabled.
- **Roles**: Stored in `public.users.role`; default `viewer` via trigger on `auth.users` insert. Admin can change roles on the Admin page. Route guards for `/admin` are enforced in server components and RLS.
- **Post creation**: Any authenticated user can create posts; the post is attributed to the signed-in user. Owners can edit/delete their own posts; admins can edit/delete any post.
- **AI summary**: `GOOGLE_AI_API_KEY` on the server only; prompt asks for ~200 words plain text; result persisted in `posts.summary`.


