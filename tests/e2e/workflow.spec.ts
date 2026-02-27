import { test, expect } from '@playwright/test';

test.describe('GitScore Critical Path', () => {
    test('should allow searching for a user and viewing their score', async ({ page }) => {
        // Navigate to the home page
        await page.goto('/');

        // Check for the mystical search input
        const searchInput = page.getByPlaceholder('Enter GitHub username...');
        await expect(searchInput).toBeVisible();

        // Perform a search
        await searchInput.fill('gaearon');
        await page.getByRole('button', { name: /Explore/i }).click();

        // Check for loading state (mystical loader)
        // Note: Loading might be very fast on localhost, but we should see the transition

        // Check for the results page
        await expect(page).toHaveURL(/\/score\/gaearon/);

        // Verify scorecard components
        await expect(page.getByRole('heading', { name: /gaearon/i })).toBeVisible();
        await expect(page.getByText(/Mystical Score/i)).toBeVisible();

        // Verify tabs are functional
        const analysisTab = page.getByRole('tab', { name: /Analysis/i });
        await analysisTab.click();
        await expect(page.getByRole('tabpanel', { name: /Analysis/i })).toBeVisible();
    });

    test('should show error for non-existent user', async ({ page }) => {
        await page.goto('/');
        const searchInput = page.getByPlaceholder('Enter GitHub username...');

        // Search for a likely non-existent user
        await searchInput.fill('non-existent-user-' + Math.random().toString(36).substring(7));
        await page.getByRole('button', { name: /Explore/i }).click();

        // Check for error alert
        const errorAlert = page.getByRole('alert');
        await expect(errorAlert).toBeVisible();
    });
});
