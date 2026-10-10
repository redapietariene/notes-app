import { test as baseTest, expect, type Page } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

export { expect };

const email = process.env.E2E_EMAIL;
const password = process.env.E2E_PASSWORD;

export const test = baseTest.extend<{ noteTitle: string }>({
  // A title unique to this test. After the test its note is removed, even when
  // the test failed. Matching the exact title (not a prefix) keeps parallel
  // tests from deleting each other's notes.
  noteTitle: [
    async ({}, use, testInfo) => {
      const noteTitle = `Notes e2e ${Date.now()}-${testInfo.workerIndex}`;
      await use(noteTitle);

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
        .eq('title', noteTitle);
      if (deleteError) throw deleteError;
    },
    { auto: true },
  ],

  // Every test starts signed in on /workspace.
  page: async ({ page }, use) => {
    test.skip(!email || !password, 'Set E2E_EMAIL and E2E_PASSWORD in .env.local');

    await page.goto('/login');
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

    await use(page);
  },
});

// Creates a note and gives it a unique title. The button is disabled
// ("Creating…") until the new note exists and is selected, so typing before it
// is enabled again would hit the wrong note.
export async function createNote(page: Page, title: string) {
  const newNote = page.getByRole('button', { name: '+ New note' });
  await newNote.click();
  await expect(newNote).toBeEnabled();

  const titleInput = page.getByPlaceholder('Untitled note');
  await expect(titleInput).toHaveValue('Untitled note');
  await titleInput.fill(title);
  await expect(page.getByText('Saved', { exact: true })).toBeVisible();
}
