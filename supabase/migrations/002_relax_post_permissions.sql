-- Allow any authenticated user to create posts and manage their own posts.

drop policy if exists "posts_insert_author_or_admin" on public.posts;
create policy "posts_insert_authenticated"
  on public.posts for insert
  with check (
    author_id = auth.uid()
    and auth.uid() is not null
  );

drop policy if exists "posts_update_author_or_admin" on public.posts;
create policy "posts_update_owner_or_admin"
  on public.posts for update
  using (
    auth.uid() is not null
    and (
      author_id = auth.uid()
      or exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
    )
  );

drop policy if exists "posts_delete_author_or_admin" on public.posts;
create policy "posts_delete_owner_or_admin"
  on public.posts for delete
  using (
    auth.uid() is not null
    and (
      author_id = auth.uid()
      or exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
    )
  );

drop policy if exists "post_images_insert_authenticated" on storage.objects;
create policy "post_images_insert_authenticated"
  on storage.objects for insert
  with check (
    bucket_id = 'post-images'
    and auth.uid() is not null
  );
