/// <reference lib="dom" />
import { expect, test } from '@playwright/test'

test('beranda menampilkan judul, logo, dan gambar sel', async ({ page }) => {
  await page.goto('/')
  await expect(
    page.getByRole('heading', { level: 1, name: 'Jelajahi respirasi aerob' }),
  ).toBeVisible()
  for (const nama of ['MetaLab', /^Sel hewan/]) {
    const gambar = page.getByRole('img', { name: nama })
    await expect(gambar).toBeVisible()
    expect(await gambar.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0)
  }
})

test('tombol mulai belajar membuka peta materi', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Mulai belajar' }).click()
  await expect(page).toHaveURL(/#\/peta-materi$/)
  await expect(page.getByRole('heading', { level: 1, name: 'Peta materi' })).toBeVisible()
})

test('tata letak mengikuti orientasi layar', async ({ page }, info) => {
  await page.goto('/')
  const tombol = (await page.getByRole('link', { name: 'Mulai belajar' }).boundingBox())!
  const sel = (await page.getByRole('img', { name: /^Sel hewan/ }).boundingBox())!
  if (info.project.name === 'hp-tegak') {
    expect(sel.y).toBeGreaterThanOrEqual(tombol.y + tombol.height)
  } else {
    // layar mendatar: sel di kanan teks dan tombol terlihat tanpa menggulir
    expect(sel.x).toBeGreaterThanOrEqual(tombol.x + tombol.width)
    expect(tombol.y + tombol.height).toBeLessThanOrEqual(page.viewportSize()!.height)
    // judul dua baris seperti mockup: "Jelajahi" / "respirasi aerob"
    const baris = await page
      .getByRole('heading', { level: 1 })
      .evaluate((el) => Math.round(el.clientHeight / parseFloat(getComputedStyle(el).lineHeight)))
    expect(baris).toBe(2)
  }
  const latar = await page.locator('main').evaluate((el) => getComputedStyle(el).backgroundImage)
  expect(latar).toMatch(/^url\(/)
  const melebar = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  )
  expect(melebar).toBe(false)
})
