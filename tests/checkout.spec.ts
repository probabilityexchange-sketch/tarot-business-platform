import { test, expect } from '@playwright/test';

test.describe('Checkout Flow', () => {
  test('successfully navigates through checkout process', async ({ page }) => {
    // Mock the availability API to return a slot
    await page.route('**/api/availability*', async route => {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      const start = nextWeek.toISOString();
      nextWeek.setMinutes(nextWeek.getMinutes() + 50);
      const end = nextWeek.toISOString();
      
      await route.fulfill({
        json: {
          slots: [{ start, end, available: true }],
          calComEventTypes: [],
        }
      });
    });

    // Mock the reservation API
    await page.route('**/api/availability/reservations', async route => {
      await route.fulfill({
        json: { reservationUid: 'test-reservation-uid-123' }
      });
    });

    // Mock the checkout API to redirect to success instead of real Stripe
    await page.route('**/api/checkout', async route => {
      await route.fulfill({
        json: { url: '/booking/success' }
      });
    });

    await page.goto('/readings');

    // Scroll to the booking section
    await page.getByText('Book Your Time').scrollIntoViewIfNeeded();

    // Fill in the details
    await page.getByPlaceholder('Your name').fill('Jane Doe');
    await page.getByPlaceholder('you@example.com').fill('jane@example.com');
    await page.getByPlaceholder('America/New_York').fill('America/New_York');
    await page.getByPlaceholder('What should Kali know before the session?').fill('Looking forward to this!');

    // Select the first available slot (the mocked one)
    // The slot button should have the 'border-outline-variant' class when unselected, or just be the only button in the grid
    const slotButton = page.locator('button', { hasText: /am|pm/i }).first();
    await slotButton.waitFor({ state: 'visible' });
    await slotButton.click();

    // Click continue
    const continueButton = page.getByRole('button', { name: /Continue to Payment/i });
    await expect(continueButton).toBeEnabled();
    await continueButton.click();

    // Verify it redirects to the success page URL returned by our mock
    await page.waitForURL('**/booking/success*');
    await expect(page).toHaveURL(/.*\/booking\/success/);
  });
});