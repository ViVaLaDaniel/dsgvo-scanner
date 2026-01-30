import { test, expect } from '@playwright/test';

test.describe('Authentication Flow (E2E)', () => {
  test('should show login page', async ({ page }) => {
    await page.goto('/login');
    // Updated to match the new global metadata title
    await expect(page).toHaveTitle(/DSGVO Scanner/i);
    // Updated button text from "Einloggen" to "Anmelden"
    await expect(page.locator('button:has-text("Anmelden")')).toBeVisible();
  });

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/login');
    await page.click('text=Jetzt registrieren');
    await expect(page).toHaveURL(/\/register/);
    // CardTitle uses a div, so we search by text
    await expect(page.getByText(/Kostenfrei registrieren/i)).toBeVisible();
  });

  test('should show error on invalid login', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'wrong@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    // Updated button text
    await page.click('button:has-text("Anmelden")');

    // We expect an error message to appear
    await expect(page.locator('text=Passwort ist falsch')).toBeVisible();
  });
});
