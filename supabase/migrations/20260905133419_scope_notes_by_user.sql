-- Scope notes, collections, and tags to the user who owns them, and replace
-- the "allow all" RLS policies (which granted every anon/authenticated
-- caller full read/write access to every user's data) with ownership checks.
--
-- Existing rows predate user accounts, so they're backfilled to a single
-- owner before user_id is made required.
do $$
declare
  backfill_owner uuid := '9f9b83d8-bf17-4530-ac36-7da8e11edc20'; -- reda.pietariene@gmail.com
begin
  -- collections: add owner, backfill, enforce.
  alter table collections add column user_id uuid references auth.users (id) on delete cascade;
  update collections set user_id = backfill_owner where user_id is null;
  alter table collections alter column user_id set not null;

  -- notes: add owner, backfill, enforce.
  alter table notes add column user_id uuid references auth.users (id) on delete cascade;
  update notes set user_id = backfill_owner where user_id is null;
  alter table notes alter column user_id set not null;

  -- tags: add owner, backfill, enforce. Tags become private per user, so the
  -- old global "name must be unique" constraint is replaced with one scoped
  -- per owner (two users can each have their own "work" tag).
  alter table tags add column user_id uuid references auth.users (id) on delete cascade;
  update tags set user_id = backfill_owner where user_id is null;
  alter table tags alter column user_id set not null;
end $$;

alter table tags drop constraint tags_name_key;
alter table tags add constraint tags_user_id_name_key unique (user_id, name);

create index notes_user_id_idx on notes (user_id);
create index collections_user_id_idx on collections (user_id);
create index tags_user_id_idx on tags (user_id);

-- Drop the old blanket-access policies.
drop policy "Allow all on collections" on collections;
drop policy "Allow all on notes" on notes;
drop policy "Allow all on tags" on tags;
drop policy "Allow all on note_tags" on note_tags;

-- collections: owner-only access.
create policy "Users can view their own collections" on collections
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert their own collections" on collections
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own collections" on collections
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own collections" on collections
  for delete to authenticated
  using ((select auth.uid()) = user_id);

-- notes: owner-only access.
create policy "Users can view their own notes" on notes
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert their own notes" on notes
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own notes" on notes
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own notes" on notes
  for delete to authenticated
  using ((select auth.uid()) = user_id);

-- tags: owner-only access.
create policy "Users can view their own tags" on tags
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert their own tags" on tags
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own tags" on tags
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own tags" on tags
  for delete to authenticated
  using ((select auth.uid()) = user_id);

-- note_tags: no owner column of its own (it's a pure join table), so
-- ownership is checked through the note and tag it links. Only insert and
-- delete are used by the app.
create policy "Users can link tags on their own notes" on note_tags
  for insert to authenticated
  with check (
    exists (
      select 1 from notes
      where notes.id = note_tags.note_id
        and notes.user_id = (select auth.uid())
    )
    and exists (
      select 1 from tags
      where tags.id = note_tags.tag_id
        and tags.user_id = (select auth.uid())
    )
  );

create policy "Users can view tags on their own notes" on note_tags
  for select to authenticated
  using (
    exists (
      select 1 from notes
      where notes.id = note_tags.note_id
        and notes.user_id = (select auth.uid())
    )
  );

create policy "Users can unlink tags on their own notes" on note_tags
  for delete to authenticated
  using (
    exists (
      select 1 from notes
      where notes.id = note_tags.note_id
        and notes.user_id = (select auth.uid())
    )
  );

-- search_notes() runs with the caller's own privileges (the Postgres
-- default), so it's automatically filtered by the notes RLS policy above —
-- no change needed there.
