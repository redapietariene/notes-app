-- Pin search_path on SECURITY-sensitive functions to satisfy the Supabase
-- Security Advisor "Function Search Path Mutable" warning. Without a fixed
-- search_path, unqualified identifiers resolve using the caller's session
-- search_path, which could be manipulated to reference unexpected objects.

create or replace function set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function search_notes(search_query text)
returns setof public.notes
language sql
stable
set search_path = ''
as $$
  with query as (
    select to_tsquery('english', string_agg(lexeme || ':*', ' & ')) as tsq
    from unnest(to_tsvector('english', search_query)) as u(lexeme, positions, weights)
  )
  select notes.*
  from public.notes as notes, query
  where query.tsq is not null
    and notes.search_vector @@ query.tsq
  order by ts_rank(notes.search_vector, query.tsq) desc;
$$;
