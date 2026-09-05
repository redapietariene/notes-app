# Notes app

## What this is
This is a notes app, which allows user to keep notes, categorise them and assign tags.
All data is stored in supabase — no backend or user accounts yet.

## Stack
- Next.js with the App Router
- TypeScript
- Tailwind CSS for all styling
- Supabase

## Architecture
- Data stored in supabase
- Supabase built-in authentification and authorisation

## Authentification
- Use Supabase Auth for all sign-in and session handling — never build custom auth or store passwords yourself
- Every page under /workspace requires a signed-in user; verify this on the server and redirect to /login if they are not signed in
- After a successful sign-in, redirect to /workspace
- After sign-out, redirect to /login

## Running the app
Run `npm run dev`. The app runs at http://localhost:3000.

## Conventions
- New pages go inside the `app/` folder
- Shared UI components go in `app/components/`
- Supabase client/server helpers live in `src/utils/supabase/`
- supabase credentials stored in `.env.local`
- For supabase db updates always use migrations
- Keep code clean and simple
- Always create new branch from master when creating new feature

## Do not
- Do not add npm packages without asking first
- Do not put secrets or API keys in source files — use .env.local for environment variables
- Do not create supabase db changes without migrations
- Do not add external libraries without asking first

