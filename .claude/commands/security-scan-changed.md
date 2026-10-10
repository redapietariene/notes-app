---
description: Run the Supabase, Next.js and Vercel security scanners in parallel, focused only on files changed on the current branch vs master
---

Run a read-only security scan limited to the files changed on the current git branch.

## Step 1: Find the changed files

Use Bash to identify files changed on the current branch compared to the main branch (`master`):

- `git diff --name-only master...HEAD` (committed changes on this branch)
- `git diff --name-only HEAD` (uncommitted changes to tracked files)
- `git ls-files --others --exclude-standard` (new untracked files)

Combine and de-duplicate the results, and drop files that no longer exist. If the current branch is `master`, there is nothing to compare: tell the user and stop. If no files changed, say so and stop.

## Step 2: Dispatch all three scanners in parallel

In a SINGLE message, make three Agent tool calls at the same time so they run concurrently, not one after another:

- `subagent_type: "supabase-security-scanner"`
- `subagent_type: "nextjs-security-scanner"`
- `subagent_type: "vercel-security-scanner"`

Each prompt must include the full list of changed files and say: "Focus ONLY on these changed files. Do NOT scan the whole codebase; read other files only when needed to understand how a changed file is used. Report findings only. Do NOT modify, create, or delete any files or settings. Return findings grouped as Critical, High, Medium, Low, each with location, risk, and suggested fix. If none of the changed files are relevant to your area, say so."

Wait until all three have finished before continuing. If one fails or returns nothing, say so in the report instead of silently omitting it.

## Step 3: Merge into one report

Start the report with the list of changed files that were scanned. Then combine the three outputs into a single report grouped by severity, in this order: **Critical, High, Medium, Low**.

- List a finding that appears in more than one scanner's output only once, and add a note such as `Flagged by: supabase-security-scanner, nextjs-security-scanner`.
- For findings flagged by a single scanner, note that scanner too.
- If scanners rate the same issue differently, use the highest severity and mention the difference.
- Keep each finding short: title, location, risk, suggested fix.
- End with a short "Could not verify" list for anything the scanners said needed a dashboard, CLI, or live deployment check.

## Rules

- This command only reports. Do not change any code, config, or files, and do not apply fixes, even obvious ones. Ask the user what to fix after presenting the report.
