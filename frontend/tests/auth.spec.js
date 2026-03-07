const { test, expect } = require('@playwright/test');

test.describe('Authentication and RBAC', () => {
  test('should show login page by default', async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    await expect(page.locator('h1')).toContainText('Login');
  });

  test('should protect dashboard route', async ({ page }) => {
    await page.goto('http://localhost:5173/dashboard');
    await expect(page).toHaveURL(/.*login/);
  });

  test('should protect admin route', async ({ page }) => {
    await page.goto('http://localhost:5173/admin');
    await expect(page).toHaveURL(/.*login/);
  });
});
