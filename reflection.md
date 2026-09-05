## code-review plugin
official claude plugin installed code-review
reviewed code of PR #1 (https://github.com/redapietariene/notes-app/pull/1) — "Add notes app baseline and collapsible collections sidebar"
Posted the review to PR #1 (https://github.com/redapietariene/notes-app/pull/1#issuecomment-5441388564).

One high-confidence issue found: NoteEditor's 600ms debounced autosave gets cleared (not flushed) when the component unmounts — which happens on every note switch since it's keyed by note.id. Type an edit, quickly click another note in the sidebar, and that edit is silently lost with no save and no warning.

Two other candidates were investigated but scored below the posting threshold and left out:
- New @supabase/* npm dependencies added without an explicit in-repo "ask" — but they're exactly what CLAUDE.md's own stack already calls for, so a reviewer wouldn't likely block on it.
- Fully open RLS policies (using (true)) — explicitly intentional per the migration's own comment and consistent with "no user accounts yet" in CLAUDE.md, so it's a documented tradeoff rather than an oversight.

## Optional feature - server side full text search
Implemented full text search. Searching in notes titles and content. Directed Claude to implement search when you type (as in the beginning agent has created search which find results just when you type full word).

## Optional feature - tags
Implemented tags feature and filtering by tags.

## Minimal design
In the beginning app design was created using sill forntend-design. It was a bit dissapointing as the UI looked very old. Asking to apply modern minimal design led to the current version of app, which looks very modern, nowadays look and feel.

## Stranged error encountered after auth build
What's wrong: This is a PostgREST error, thrown when getNotes()/getCollections()/getTags() query Postgres after you sign in (src/utils/db.ts). It means the access token's iat (issued-at timestamp) is later than Supabase's database server's own clock — a clock-skew rejection, not a data or auth-logic bug. Auth itself succeeded (you reached /workspace); it's the subsequent REST queries to Postgres that got bounced.
I checked this machine's clock — date reports 2026-09-05 17:56, matching the session's "current date." So either:
1. This VM/sandbox's system clock is genuinely off from real time, and the JWT (minted correctly by Supabase's Auth using real time) looks "future" to this environment somewhere downstream, or
2. The Supabase project's Postgres instance itself has clock drift (this happens occasionally on free-tier projects after a cold resume, before their VM's next NTP sync).
Left as is.