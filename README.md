# Blog Platform

A full-stack blogging app built with **Next.js (App Router)**, **Supabase Auth + Postgres**, and **Google Gemini** for automatic post summaries. It implements **viewer / author / admin** roles with row-level security in the database and server-side checks in Next.js.

## Tech stack

| Layer | Technology |
|--------|------------|
| App | Next.js 16, React 19, TypeScript, Tailwind CSS |
| Auth | Supabase Auth (email + password) |
| Database | Supabase Postgres + Row Level Security |
| Storage | Supabase Storage (`post-images` bucket, public read) |
| AI | Google Generative AI SDK (`@google/generative-ai`), model `gemini-2.0-flash` |
| Deployment | Node.js on a VPS (see below) |

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
   - Open **SQL Editor** and run the migration in `supabase/migrations/001_initial_schema.sql` (creates `users`, `posts`, `comments`, RLS policies, storage bucket, and the `on_auth_user_created` trigger).
   - Optional demo data: after you have at least one **author** or **admin** user, run `supabase/seed_sample_posts.sql` in the SQL Editor. It inserts six on-topic posts only when `posts` is empty (cover images use [picsum.photos](https://picsum.photos)).
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

   As admin, use **Admin** in the nav to promote other users to **author** so they can publish.

## Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

- **Viewer**: sign up, read posts, comment when signed in.
- **Author**: create/edit own posts (after an admin sets role to `author`).
- **Admin**: edit any post, change user roles, monitor recent comments.

## Build for production

```bash
npm run build
npm start
```

## Deployment on a VPS

High-level steps (adjust for your distro and process manager):

1. **Server**: Ubuntu LTS or similar; install Node.js 20+, `git`, and optionally `nginx` + `certbot` for HTTPS.
2. **Clone** the repo to the server and create `.env.local` (or systemd environment) with the same variables as local, using production Supabase URL and redirect URLs.
3. **Supabase**: Add your public origin (e.g. `https://blog.example.com`) and `https://blog.example.com/auth/callback` under Authentication URL settings.
4. **Build**: `npm ci && npm run build`.
5. **Process manager**: run `npm start` under **systemd**, **PM2**, or similar, binding to a local port (e.g. `3000`).
6. **Reverse proxy**: point Nginx/Caddy to `127.0.0.1:3000`, enable TLS, and ensure the site is reachable on port 443.
7. **Firewall**: allow HTTP/HTTPS only as needed.

Ensure **no secrets** are committed; only `NEXT_PUBLIC_*` and server-side keys live in the server environment.

## Database schema (assignment alignment)

| Table | Fields |
|--------|--------|
| `users` | `id` (FK → `auth.users`), `name`, `email`, `role` |
| `posts` | `id`, `title`, `body`, `image_url`, `author_id`, `summary`, timestamps |
| `comments` | `id`, `post_id`, `user_id`, `comment_text`, `created_at` |

## AI summary flow

1. Author or admin submits a new or updated post (title, body, featured image).
2. Server action `createPost` / `updatePost` calls `generatePostSummary` (`src/lib/ai/summary.ts`) using Gemini.
3. The returned text is stored in `posts.summary` and shown on the home listing and post detail.

If the API fails, the post is still saved; `summary` may be null and the UI shows a short fallback message on the listing.

## Submission notes (for evaluators)

### AI-assisted development

This project was built with **Cursor** (and similar IDE AI) for scaffolding, refactoring, and documentation. That sped up boilerplate (Supabase client setup, forms, migrations) while keeping schema and RLS rules explicit in SQL and business logic in typed server actions.

### Feature logic (short)

- **Authentication**: Supabase email/password; session in HTTP-only cookies via `@supabase/ssr`; `auth/callback` exchanges OAuth/magic-link codes if enabled.
- **Roles**: Stored in `public.users.role`; default `viewer` via trigger on `auth.users` insert. Admin can change roles on the Admin page. Middleware refreshes the session; route guards for `/posts/new` and `/admin` are enforced in server components and RLS.
- **Post creation**: Server action validates role, uploads optional image to Storage, generates summary with Gemini, inserts into `posts`.
- **AI summary**: `GOOGLE_AI_API_KEY` on the server only; prompt asks for ~200 words plain text; result persisted in `posts.summary`.

## License

Private / assignment use unless you add a license.
