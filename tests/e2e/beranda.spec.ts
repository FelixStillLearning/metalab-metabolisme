import { expect, test } from '@playwright/test'

test('halaman utama terbuka', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'MetaLab Metabolisme' })).toBeVisible()
})
