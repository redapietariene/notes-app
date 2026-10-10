// spec: specs/login.plan.md
// seed: tests/seed.spec.ts
import { test, expect } from '@playwright/test';

const email = process.env.E2E_EMAIL;
const password = process.env.E2E_PASSWORD;

test.describe('Login', () => {
  test.skip(!email || !password, 'Set E2E_EMAIL and E2E_PASSWORD in .env.local');

  test('signs in and out', async ({ page }) => {
    await page.goto('/login');

    // 1. Type the test account email into the Email field
    await page.getByLabel('Email').fill(email!);

    // 2. Type the test account password into the Password field
    await page.getByLabel('Password').fill(password!);

    // 3. Click "Sign in"
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page).toHaveURL(/\/workspace/);

    // A token used right after sign-in is sometimes rejected by Supabase with
    // "JWT issued at future" (clock skew between its services); retry the load.
    const signOut = page.getByRole('button', { name: 'Sign out' });
    await expect(async () => {
      await page.goto('/workspace');
      await expect(signOut).toBeVisible({ timeout: 3000 });
    }).toPass({ intervals: [1000, 2000, 3000], timeout: 20000 });

    // 4. Click "Sign out"
    await signOut.click();
    await expect(page).toHaveURL(/\/login/);

    // 5. Open /workspace again: the session is gone
    await page.goto('/workspace');
    await expect(page).toHaveURL(/\/login/);
  });
});
