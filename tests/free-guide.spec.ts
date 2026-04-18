import { test, expect } from '@playwright/test';

test.describe('Free Guide Flow', () => {
  test('successfully submits email for free guide', async ({ page }) => {
    // Mock the API response to simulate successful submission without using real Resend limits
    await page.route('/api/free-guide', async route => {
      const json = { success: true, message: 'Guide sent successfully!' };
      await route.fulfill({ json });
    });

    await page.goto('/');

    // Locate the email input and submit button in the Free Guide section
    const emailInput = page.getByPlaceholder('Enter your email');
    const submitButton = page.getByRole('button', { name: /Get Your Free Guide/i });

    // Fill out the form
    await emailInput.fill('test@example.com');
    await submitButton.click();

    // Verify success state using a more robust locator
    const successButton = page.getByRole('button', { name: /Sent! Check your email/i });
    await expect(successButton).toBeVisible();
    await expect(successButton).toBeDisabled();
  });

  test('shows error when email is missing or invalid', async ({ page }) => {
    await page.goto('/');

    const emailInput = page.getByPlaceholder('Enter your email');
    const submitButton = page.getByRole('button', { name: /Get Your Free Guide/i });

    // Click without filling the email
    await submitButton.click();
    
    // Evaluate if the input is valid according to the browser
    const isValid = await emailInput.evaluate((el: HTMLInputElement) => el.checkValidity());
    expect(isValid).toBe(false);
  });
});