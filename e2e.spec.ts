import { test, expect } from '@playwright/test';

test('Game loads without crashing', async ({ page }) => {
  await page.goto('http://localhost:5173');
  // Step 1: Guest Access
  await page.getByRole('button', { name: '👤 Guest Access' }).click();
  // Step 2: Enter Name
  await page.getByPlaceholder('e.g. Tech 117').fill('Jules');
  await page.getByRole('button', { name: 'Confirm Identity →' }).click();
  // Step 3: Start Shift
  await page.getByRole('button', { name: 'INITIALIZE SHIFT' }).click();
  // Wait for the game canvas to appear
  await expect(page.locator('canvas')).toBeVisible({ timeout: 15000 });
  // Take a final screenshot to verify the game is running
  await page.screenshot({ path: '/home/jules/verification/final_screenshot.png' });
});
