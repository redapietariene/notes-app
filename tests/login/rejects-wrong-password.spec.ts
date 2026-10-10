// spec: specs/login.plan.md
// seed: tests/seed.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Login', () => {
  test('rejects wrong password', async ({ page }) => {
    await page.goto('/login');

    // 1. Type nobody@example.com into the Email field
    await page.getByLabel('Email').fill('nobody@example.com');

    // 2. Type not-the-password into the Password field
    await page.getByLabel('Password').fill('not-the-password');

    // 3. Click "Sign in"
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page).toHaveURL(/\/login\?error=/);
    await expect(page.getByText('Invalid login credentials')).toBeVisible();
  });
});
