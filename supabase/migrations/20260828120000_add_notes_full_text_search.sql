-- Full-text search over notes: a generated tsvector column (title weighted
-- above body) backed by a GIN index, plus an RPC so PostgREST can rank and
-- embed tags in one round trip.

alter table notes
  add column search_vector tsvector
  generated always as (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(body, '')), 'B')
  ) stored;

create index notes_search_vector_idx on notes using gin (search_vector);

create or replace function search_notes(search_query text)
returns setof notes
language sql
stable
as $$
  select notes.*
  from notes
  where search_vector @@ websearch_to_tsquery('english', search_query)
  order by ts_rank(search_vector, websearch_to_tsquery('english', search_query)) desc;
$$;
