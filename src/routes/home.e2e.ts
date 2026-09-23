import { expect, test } from '@playwright/test';

test('homepage renders for a signed-out visitor', async ({ page }) => {
	await page.goto('/');
	await expect(page.locator('h1')).toHaveText('Paddock Picks');
	await expect(page.locator('header').getByRole('link', { name: 'Sign in' })).toBeVisible();
});
