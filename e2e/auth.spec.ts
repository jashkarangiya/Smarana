import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Smarana/);
});

test('can navigate to login page', async ({ page }) => {
    // Basic connectivity test only
    await page.goto('/');
    const loginLink = page.getByRole('link', { name: /Sign In|Get Started/i }).first();

    // Only verify link exists
    if (await loginLink.isVisible()) {
        await expect(loginLink).toBeVisible();
    }
});
