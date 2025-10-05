import { test, expect } from '@playwright/test';

test.describe('invoice creation (demo mode)', () => {
  test('can create a draft invoice in IndexedDB mode', async ({ page }) => {
    await page.goto('http://localhost:5173/auth/login');
    await page.getByLabel('Email').fill('demo@imagicity.in');
    await page.getByLabel('Password').fill('password');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.waitForURL('**/dashboard');
    await page.goto('http://localhost:5173/invoices/new');
    await page.getByLabel('Invoice number').fill('IMAGI240099');
    await page.getByLabel('Client').selectOption({ index: 1 });
    await page.getByPlaceholder('Description').first().fill('Playwright automation service');
    await page.getByLabel('Shipping').fill('0');
    await page.getByRole('button', { name: 'Save invoice' }).click();
    await expect(page).toHaveURL(/\/invoices\/.*$/);
  });
});
