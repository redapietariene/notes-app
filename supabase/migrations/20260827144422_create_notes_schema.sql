-- Core schema: notes, collections, tags, and the note<->tag join table.

create table collections (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table notes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text,
  collection_id uuid references collections (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index notes_collection_id_idx on notes (collection_id);

create table tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique
);

create table note_tags (
  note_id uuid not null references notes (id) on delete cascade,
  tag_id uuid not null references tags (id) on delete cascade,
  primary key (note_id, tag_id)
);

create index note_tags_tag_id_idx on note_tags (tag_id);

-- Keep notes.updated_at current on every update.
create function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger notes_set_updated_at
  before update on notes
  for each row
  execute function set_updated_at();

-- No user accounts yet, so allow full access to the anon/authenticated
-- roles rather than leaving these tables unprotected by RLS.
alter table collections enable row level security;
alter table notes enable row level security;
alter table tags enable row level security;
alter table note_tags enable row level security;

create policy "Allow all on collections" on collections
  for all using (true) with check (true);

create policy "Allow all on notes" on notes
  for all using (true) with check (true);

create policy "Allow all on tags" on tags
  for all using (true) with check (true);

create policy "Allow all on note_tags" on note_tags
  for all using (true) with check (true);
