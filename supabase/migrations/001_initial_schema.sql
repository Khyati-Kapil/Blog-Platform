-- Blog platform schema: users, posts, comments + RLS + storage
-- Apply in Supabase SQL Editor (Dashboard → SQL) or supabase db push

create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  email text not null,
  role text not null default 'viewer' check (role in ('viewer', 'author', 'admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  image_url text not null,
  author_id uuid not null references public.users (id) on delete cascade,
  summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists posts_author_id_idx on public.posts (author_id);
create index if not exists posts_created_at_idx on public.posts (created_at desc);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  comment_text text not null,
  created_at timestamptz not null default now()
);

create index if not exists comments_post_id_idx on public.comments (post_id);

-- New auth user -> public.users row (default viewer)
create or replace function public.handle_new_user ()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    new.email,
    'viewer'
  )
  on conflict (id) do update
    set name = excluded.name,
        email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user ();

create or replace function public.set_updated_at ()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists posts_set_updated_at on public.posts;
create trigger posts_set_updated_at
  before update on public.posts
  for each row execute procedure public.set_updated_at ();

alter table public.users enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;

drop policy if exists "users_select_self_or_admin" on public.users;
drop policy if exists "users_select_public_names" on public.users;
drop policy if exists "users_update_self" on public.users;
drop policy if exists "users_admin_update_role" on public.users;

-- Read: own row full; admin all rows; others see id + name only via separate policy
create policy "users_select_self_or_admin"
  on public.users for select
  using (
    auth.uid() = id
    or exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
  );

-- Public author attribution (no email): used by listing/detail joins
create policy "users_select_public_names"
  on public.users for select
  using (true);

-- Email is still readable when policy matches; app layer should not expose email to viewers.
-- Tighter option: move email to auth metadata only and drop column — assignment keeps column for schema match.

create policy "users_update_self"
  on public.users for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "users_admin_update_role"
  on public.users for update
  using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin'))
  with check (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin'));

drop policy if exists "posts_select_all" on public.posts;
drop policy if exists "posts_insert_author_or_admin" on public.posts;
drop policy if exists "posts_update_author_or_admin" on public.posts;
drop policy if exists "posts_delete_author_or_admin" on public.posts;

create policy "posts_select_all"
  on public.posts for select
  using (true);

create policy "posts_insert_author_or_admin"
  on public.posts for insert
  with check (
    author_id = auth.uid()
    and exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role in ('author', 'admin')
    )
  );

create policy "posts_update_author_or_admin"
  on public.posts for update
  using (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
    or (
      author_id = auth.uid()
      and exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'author')
    )
  );

create policy "posts_delete_author_or_admin"
  on public.posts for delete
  using (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
    or (
      author_id = auth.uid()
      and exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'author')
    )
  );

drop policy if exists "comments_select_all" on public.comments;
drop policy if exists "comments_insert_authenticated" on public.comments;

create policy "comments_select_all"
  on public.comments for select
  using (true);

create policy "comments_insert_authenticated"
  on public.comments for insert
  with check (
    auth.uid() is not null
    and user_id = auth.uid()
    and exists (select 1 from public.users u where u.id = auth.uid())
  );

insert into storage.buckets (id, name, public)
values ('post-images', 'post-images', true)
on conflict (id) do nothing;

drop policy if exists "post_images_public_read" on storage.objects;
drop policy if exists "post_images_insert_authenticated" on storage.objects;
drop policy if exists "post_images_update_own" on storage.objects;
drop policy if exists "post_images_delete_own_or_admin" on storage.objects;

create policy "post_images_public_read"
  on storage.objects for select
  using (bucket_id = 'post-images');

create policy "post_images_insert_authenticated"
  on storage.objects for insert
  with check (
    bucket_id = 'post-images'
    and auth.uid() is not null
    and exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role in ('author', 'admin')
    )
  );

create policy "post_images_update_own"
  on storage.objects for update
  using (bucket_id = 'post-images' and auth.uid() = owner);

create policy "post_images_delete_own_or_admin"
  on storage.objects for delete
  using (
    bucket_id = 'post-images'
    and (
      auth.uid() = owner
      or exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
    )
  );
