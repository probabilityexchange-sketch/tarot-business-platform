import { test, expect } from '@playwright/test';

test.describe('Navigation User Flows', () => {
  test('homepage should load and have correct title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Kali Meister/i);
  });

  test('can navigate to Readings page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Readings' }).first().click();
    await expect(page).toHaveURL(/.*\/readings/);
    await expect(page.locator('h1')).toContainText(/Archetypal Insight/i);
  });

  test('can navigate to Courses page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Courses' }).first().click();
    await expect(page).toHaveURL(/.*\/courses/);
    await expect(page.locator('h1')).toContainText(/The Psychological Tarot Method/i);
  });

  test('can navigate to Journal/Blog page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Journal' }).first().click();
    await expect(page).toHaveURL(/.*\/blog/);
    await expect(page.locator('h1')).toContainText(/Digital Alchemist/i);
  });
});