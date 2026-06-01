import { test, expect } from '@playwright/test';

test('user can browse shop and add to cart', async ({ page }) => {
  await page.goto('/shop');

  await expect(page.getByRole('heading', { name: /smart mining glasses/i })).toBeVisible();

  const addButtons = page.getByRole('button', { name: /add to cart/i });
  await expect(addButtons.first()).toBeVisible();
  await addButtons.first().click();

  await page.getByRole('link', { name: /cart/i }).first().click();
  await expect(page.getByRole('heading', { name: /your cart/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /proceed to checkout/i })).toBeVisible();
});
