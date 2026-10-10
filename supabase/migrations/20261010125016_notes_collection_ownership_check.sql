-- A note's collection must belong to the same user as the note. The previous
-- insert/update policies only checked notes.user_id, so a user could attach
-- their own note to another user's collection by its id (foreign-key checks
-- bypass RLS).
drop policy "Users can insert their own notes" on notes;
drop policy "Users can update their own notes" on notes;

create policy "Users can insert their own notes" on notes
  for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and (
      collection_id is null
      or exists (
        select 1 from collections
        where collections.id = notes.collection_id
          and collections.user_id = (select auth.uid())
      )
    )
  );

create policy "Users can update their own notes" on notes
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and (
      collection_id is null
      or exists (
        select 1 from collections
        where collections.id = notes.collection_id
          and collections.user_id = (select auth.uid())
      )
    )
  );
