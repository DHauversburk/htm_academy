import { test, expect } from '@playwright/test';

test('should complete setup and start the game', async ({ page }) => {
  await page.goto('/');

  // Step 1: Guest Access
  await page.getByRole('button', { name: '👤 Guest Access' }).click();

  // Step 2: Enter Name
  await page.getByPlaceholder('e.g. Tech 117').fill('Test Player');
  await page.getByRole('button', { name: 'Confirm Identity →' }).click();

  // Step 3: Select Difficulty and Start
  await page.getByRole('button', { name: 'Intern (Easy)' }).click();
  await page.getByRole('button', { name: 'INITIALIZE SHIFT' }).click();

  // Verification: Check for the main game canvas
  await expect(page.locator('canvas')).toBeVisible({ timeout: 15000 });

  // Optional: Check for a specific element that only appears in the game
  await expect(page.getByText('Dept Budget')).toBeVisible();
});
