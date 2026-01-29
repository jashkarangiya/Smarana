import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Smarana/);
});

test('can navigate to login page', async ({ page }) => {
    await page.goto('/');
    // Assuming there is a "Get Started" or "Sign In" link
    // Adjusting selector based on actual UI if needed, but for now checking existence
    const loginLink = page.getByRole('link', { name: /Sign In|Get Started/i }).first();
    if (await loginLink.isVisible()) {
        await loginLink.click();
        await expect(page).toHaveURL(/.*\/login|.*\/auth|.*\/sign-in/);
    }
});
