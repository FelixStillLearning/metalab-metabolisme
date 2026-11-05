/// <reference lib="dom" />
import { expect, test } from '@playwright/test'

test('token warna dan font kertas komik dipakai', async ({ page }) => {
  await page.goto('/')
  const body = page.locator('body')
  await expect(body).toHaveCSS('background-color', 'rgb(47, 111, 115)')
  await expect(body).toHaveCSS('color', 'rgb(245, 241, 232)')
  await expect(body).toHaveCSS('font-family', /^"Atkinson Hyperlegible"/)
  await expect(page.getByRole('heading', { level: 1 })).toHaveCSS('font-family', /^Grandstander/)
})

test('font lokal termuat tanpa koneksi luar', async ({ page }) => {
  const luar: string[] = []
  page.on('request', (r) => {
    if (!r.url().startsWith('http://localhost')) luar.push(r.url())
  })
  await page.goto('/')
  const gaya = ['700 16px Grandstander', '800 16px Grandstander']
  gaya.push('400 16px "Atkinson Hyperlegible"', '700 16px "Atkinson Hyperlegible"')
  const termuat = await page.evaluate(
    (daftar) => Promise.all(daftar.map(async (g) => (await document.fonts.load(g)).length)),
    gaya,
  )
  expect(termuat).toEqual([1, 1, 1, 1])
  expect(luar).toEqual([])
})
