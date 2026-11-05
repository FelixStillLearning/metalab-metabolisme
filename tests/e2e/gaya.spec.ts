import { expect, test } from '@playwright/test'

test('token warna dan font kertas komik dipakai', async ({ page }) => {
  await page.goto('/')
  const body = page.locator('body')
  await expect(body).toHaveCSS('background-color', 'rgb(47, 111, 115)')
  await expect(body).toHaveCSS('color', 'rgb(245, 241, 232)')
  await expect(body).toHaveCSS('font-family', /^"Atkinson Hyperlegible"/)
  await expect(page.getByRole('heading', { level: 1 })).toHaveCSS('font-family', /^Grandstander/)
})
