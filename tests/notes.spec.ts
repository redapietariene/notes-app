import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

const email = process.env.E2E_EMAIL;
const password = process.env.E2E_PASSWORD;

test.skip(!email || !password, 'Set E2E_EMAIL and E2E_PASSWORD in .env.local');

let startedAt: string;

test.beforeEach(() => {
  startedAt = new Date().toISOString();
});

// Runs even when the test fails: remove any note this run created, whether it
// got the unique title or was left as an untitled draft.
test.afterEach(async () => {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email!,
    password: password!,
  });
  if (error) throw error;

  const { error: deleteError } = await supabase
    .from('notes')
    .delete()
    .eq('user_id', data.user.id)
    .gte('created_at', startedAt)
    .or('title.like.E2E note *,and(title.eq.Untitled note,body.eq.)');
  if (deleteError) throw deleteError;
});

test('a new note survives a page refresh', async ({ page }) => {
  const title = `E2E note ${Date.now()}`;

  // The home page sends signed-out users to /login.
  await page.goto('/');
  await expect(page).toHaveURL(/\/login/);
  await page.getByLabel('Email').fill(email!);
  await page.getByLabel('Password').fill(password!);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/workspace/);

  // A token used right after sign-in is sometimes rejected by Supabase with
  // "JWT issued at future" (clock skew between its services); retry the load.
  const newNote = page.getByRole('button', { name: '+ New note' });
  await expect(async () => {
    await page.goto('/workspace');
    await expect(newNote).toBeVisible({ timeout: 3000 });
  }).toPass({ intervals: [1000, 2000, 3000], timeout: 20000 });

  // The button is disabled ("Creating…") until the new note exists and is
  // selected, so typing before it is enabled again would hit the wrong note.
  await newNote.click();
  await expect(newNote).toBeEnabled();

  const titleInput = page.getByPlaceholder('Untitled note');
  await expect(titleInput).toHaveValue('Untitled note');
  await titleInput.fill(title);
  await expect(page.getByText('Saved', { exact: true })).toBeVisible();

  await page.reload();

  await expect(page.getByText(title).first()).toBeVisible();
});
