import { expect, test } from '@playwright/test'

test('home page renders primary storefront content', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: /welcome to cute & creative toppers/i })).toBeVisible()
  await expect(page.getByRole('link', { name: /shop now/i })).toBeVisible()
})

test('products page links into a product detail page', async ({ page }) => {
  await page.goto('/products')

  const firstProductLink = page.locator('a[href^="/product/"]').first()
  await expect(firstProductLink).toBeVisible()
  await firstProductLink.click()

  await page.waitForURL(/\/product\//)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(page.getByRole('button', { name: /add to cart/i }).first()).toBeVisible()
  await expect(page.getByText(/^Product details$/)).toBeVisible()
})

test.describe('mobile product detail layout', () => {
  test.skip(({ browserName, isMobile }) => browserName !== 'chromium' || !isMobile, 'Mobile-only viewport assertion')

  test('stays within the viewport without horizontal overflow', async ({ page }) => {
    await page.goto('/products')

    const firstProductLink = page.locator('a[href^="/product/"]').first()
    await expect(firstProductLink).toBeVisible()
    await firstProductLink.click()

    await page.waitForURL(/\/product\//)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByRole('button', { name: /add to cart/i }).first()).toBeVisible()

    const viewportMetrics = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }))

    expect(viewportMetrics.scrollWidth).toBeLessThanOrEqual(viewportMetrics.clientWidth + 1)
  })
})