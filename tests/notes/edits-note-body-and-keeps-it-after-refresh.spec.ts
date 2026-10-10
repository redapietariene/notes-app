// spec: specs/notes.plan.md
// seed: tests/seed.spec.ts
import { test, expect, createNote } from './fixtures';

test.describe('Notes', () => {
  test('edits note body and keeps it after refresh', async ({ page, noteTitle: title }) => {
    const body = `Edited body ${Date.now()}`;

    // 1. Create a note with a unique title
    await createNote(page, title);

    // 2. Type text into the body
    await page.getByPlaceholder('Start writing…').fill(body);
    // The status still reads "Saved" from the title save until the edit
    // triggers the debounced autosave, so wait for it to start, then finish.
    await expect(page.getByText('Saving…')).toBeVisible();
    await expect(page.getByText('Saved', { exact: true })).toBeVisible();

    // 3. Reload the page
    await page.reload();

    // After a reload the editor opens the newest note, which may belong to
    // another test, so open ours from the list.
    await page.getByRole('button', { name: title }).click();
    await expect(page.getByPlaceholder('Start writing…')).toHaveValue(body);
  });
});
