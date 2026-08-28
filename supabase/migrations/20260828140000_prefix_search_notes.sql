-- Switch search_notes from whole-word matching (websearch_to_tsquery) to
-- prefix matching so results appear as soon as a few letters are typed.
-- Each typed word is tokenized/stemmed the same way the indexed column is,
-- then turned into a `word:*` prefix term; terms are ANDed together. This
-- still uses the existing notes_search_vector_idx GIN index.

create or replace function search_notes(search_query text)
returns setof notes
language sql
stable
as $$
  with query as (
    select to_tsquery('english', string_agg(lexeme || ':*', ' & ')) as tsq
    from unnest(to_tsvector('english', search_query)) as u(lexeme, positions, weights)
  )
  select notes.*
  from notes, query
  where query.tsq is not null
    and notes.search_vector @@ query.tsq
  order by ts_rank(notes.search_vector, query.tsq) desc;
$$;
