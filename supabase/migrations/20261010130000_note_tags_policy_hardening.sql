-- note_tags: make the policies symmetric. Every operation now requires the
-- caller to own both the note and the tag being linked (previously select
-- and delete only checked the note, and there was no update policy).

drop policy "Users can view tags on their own notes" on note_tags;
drop policy "Users can unlink tags on their own notes" on note_tags;

create policy "Users can view tags on their own notes" on note_tags
  for select to authenticated
  using (
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

create policy "Users can relink tags on their own notes" on note_tags
  for update to authenticated
  using (
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
  )
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

create policy "Users can unlink tags on their own notes" on note_tags
  for delete to authenticated
  using (
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
