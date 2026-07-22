import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should display login form on homepage', async ({ page }) => {
    await page.goto('/');
    
    // Check if login form is visible
    await expect(page.getByTestId('login-form')).toBeVisible();
    await expect(page.getByPlaceholder('Email')).toBeVisible();
    await expect(page.getByPlaceholder('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('should show validation errors for invalid login', async ({ page }) => {
    await page.goto('/');
    
    // Try to submit with empty fields
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Check for validation errors
    await expect(page.getByText(/email is required/i)).toBeVisible();
    await expect(page.getByText(/password is required/i)).toBeVisible();
  });

  test('should navigate to signup when clicking signup link', async ({ page }) => {
    await page.goto('/');
    
    // Click signup link
    await page.getByRole('link', { name: /create account/i }).click();
    
    // Should show signup form
    await expect(page.getByTestId('signup-form')).toBeVisible();
    await expect(page.getByPlaceholder('Full Name')).toBeVisible();
  });

  test('should be keyboard accessible', async ({ page }) => {
    await page.goto('/');
    
    // Tab through form elements
    await page.keyboard.press('Tab');
    await expect(page.getByPlaceholder('Email')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.getByPlaceholder('Password')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: /sign in/i })).toBeFocused();
  });
});