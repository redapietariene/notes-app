// spec: specs/notes.plan.md
// seed: tests/seed.spec.ts
import { test, expect, createNote } from './fixtures';

test.describe('Notes', () => {
  test('deletes note and it stays gone after refresh', async ({ page, noteTitle: title }) => {
    // 1. Create a note with a unique title
    await createNote(page, title);
    const listItem = page.getByRole('button', { name: title });
    await expect(listItem).toBeVisible();

    // 2. Click the editor's "Delete" button and accept the confirmation dialog.
    // Collections have their own "Delete" buttons, so scope to the editor, the
    // part of the page that holds the collection dropdown.
    page.once('dialog', (dialog) => dialog.accept());
    await page
      .locator('div')
      .filter({ has: page.getByRole('combobox') })
      .last()
      .getByRole('button', { name: 'Delete' })
      .click();
    await expect(listItem).toHaveCount(0);

    // 3. Reload the page
    await page.reload();

    await expect(page.getByRole('button', { name: '+ New note' })).toBeVisible();
    await expect(listItem).toHaveCount(0);
  });
});
