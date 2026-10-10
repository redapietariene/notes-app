import { test } from '@playwright/test';

test('seed', async ({ page }) => {
  // The home page sends signed-out users to /login.
  await page.goto('/');
});
