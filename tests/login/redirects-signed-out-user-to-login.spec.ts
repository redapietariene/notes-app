// spec: specs/login.plan.md
// seed: tests/seed.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Login', () => {
  test('redirects signed-out user to login', async ({ page }) => {
    // 1. Open /workspace while signed out
    await page.goto('/workspace');

    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
  });
});
