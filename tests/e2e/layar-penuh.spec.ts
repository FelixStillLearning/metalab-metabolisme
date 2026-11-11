import { expect, test } from '@playwright/test'

test('beranda menyediakan layar penuh di sebelah volume sejak awal', async ({ page }) => {
  await page.goto('/')
  const tombol = page.getByRole('button', { name: 'Layar penuh', exact: true })
  await expect(tombol).toBeVisible()
  await expect(tombol).toBeInViewport()
  const volume = (await page.getByRole('button', { name: 'Atur volume' }).boundingBox())!
  const kotak = (await tombol.boundingBox())!
  expect(kotak.x).toBeGreaterThanOrEqual(volume.x + volume.width)
  await tombol.click()
  await expect.poll(() => page.evaluate(() => !!document.fullscreenElement)).toBe(true)
  await tombol.click()
  await expect.poll(() => page.evaluate(() => !!document.fullscreenElement)).toBe(false)
  const logo = (await page.getByRole('img', { name: 'MetaLab', exact: true }).boundingBox())!
  const kontrol = (await tombol.locator('..').boundingBox())!
  expect(logo.x + logo.width).toBeLessThanOrEqual(kontrol.x)
})

test('peta dengan kartu Pengantar menyediakan tombol layar penuh', async ({ page }) => {
  await page.goto('/#/peta-materi')
  await expect(page.getByRole('heading', { name: 'Pengantar', exact: true })).toBeVisible()
  const tombol = page.getByRole('button', { name: 'Layar penuh', exact: true })
  await expect(tombol).toBeInViewport()
  await tombol.click()
  await expect.poll(() => page.evaluate(() => !!document.fullscreenElement)).toBe(true)
  await tombol.click()
  await expect.poll(() => page.evaluate(() => !!document.fullscreenElement)).toBe(false)
})
