// spec: specs/notes.plan.md
// seed: tests/seed.spec.ts
import { test, expect, createNote } from './fixtures';

test.describe('Notes', () => {
  test('creates note and lists it', async ({ page, noteTitle: title }) => {
    // 1. Click "+ New note"
    // 2. Type a unique title into the title field
    await createNote(page, title);

    await expect(page.getByRole('button', { name: title })).toBeVisible();
  });
});
