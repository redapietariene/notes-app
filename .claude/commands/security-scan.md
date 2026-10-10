---
description: Run the Supabase, Next.js and Vercel security scanners in parallel and merge their findings into one report
---

Run a read-only security scan of this project.

## Step 1: Dispatch all three scanners in parallel

In a SINGLE message, make three Agent tool calls at the same time so they run concurrently, not one after another:

- `subagent_type: "supabase-security-scanner"`
- `subagent_type: "nextjs-security-scanner"`
- `subagent_type: "vercel-security-scanner"`

Each prompt must say: "Report findings only. Do NOT modify, create, or delete any files or settings. Return findings grouped as Critical, High, Medium, Low, each with location, risk, and suggested fix."

Wait until all three have finished before continuing. If one fails or returns nothing, say so in the report instead of silently omitting it.

## Step 2: Merge into one report

Combine the three outputs into a single report grouped by severity, in this order: **Critical, High, Medium, Low**.

- List a finding that appears in more than one scanner's output only once, and add a note such as `Flagged by: supabase-security-scanner, nextjs-security-scanner`.
- For findings flagged by a single scanner, note that scanner too.
- If scanners rate the same issue differently, use the highest severity and mention the difference.
- Keep each finding short: title, location, risk, suggested fix.
- End with a short "Could not verify" list for anything the scanners said needed a dashboard, CLI, or live deployment check.

## Rules

- This command only reports. Do not change any code, config, or files, and do not apply fixes, even obvious ones. Ask the user what to fix after presenting the report.
