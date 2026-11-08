/// <reference lib="dom" />
import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/#/peta-materi')
})

test('peta menampilkan bagian materi dan empat episode tanpa progres', async ({ page }) => {
  await expect(page.getByRole('heading', { level: 1, name: 'Peta materi' })).toBeVisible()
  for (const nama of ['Pengantar', 'Respirasi Aerob', 'Respirasi Anaerob', 'Fotosintesis']) {
    await expect(page.getByRole('heading', { level: 2, name: nama, exact: true })).toBeVisible()
  }
  const daftar = page.getByRole('list', { name: 'Episode respirasi aerob' })
  await expect(daftar.getByRole('listitem')).toHaveCount(4)
  for (const nama of [
    'Glikolisis',
    'Dekarboksilasi oksidatif',
    'Siklus Krebs',
    'Transpor elektron',
  ]) {
    await expect(daftar.getByRole('heading', { name: nama, exact: true })).toBeVisible()
  }
  await expect(daftar.getByRole('link')).toHaveCount(1)
  await expect(daftar.getByText('Belum tersedia', { exact: true })).toHaveCount(3)
  await expect(page.getByText(/Selesai|Sedang dijelajahi|Terkunci|episode selesai/)).toHaveCount(0)
  await expect(page.getByRole('progressbar')).toHaveCount(0)
  expect(await page.evaluate(() => localStorage.length)).toBe(0)
})

test('panel respirasi aerob dapat ditutup dan dibuka dengan keyboard', async ({ page }) => {
  const tombol = page.getByRole('button', { name: 'Respirasi Aerob', exact: true })
  const daftar = page.getByRole('list', { name: 'Episode respirasi aerob' })
  await expect(tombol).toHaveAttribute('aria-expanded', 'true')
  await tombol.focus()
  await page.keyboard.press('Enter')
  await expect(tombol).toHaveAttribute('aria-expanded', 'false')
  await expect(daftar).toBeHidden()
  await expect(tombol).toBeFocused()
  await page.keyboard.press('Space')
  await expect(tombol).toHaveAttribute('aria-expanded', 'true')
  await expect(daftar).toBeVisible()
})

test('navigasi beranda, peta, dan episode 1 tersambung dua arah', async ({ page }) => {
  await page.getByRole('link', { name: 'Beranda', exact: true }).click()
  await expect(page).toHaveURL(/#\/$/)
  await page.getByRole('link', { name: 'Mulai belajar' }).click()
  await page.getByRole('link', { name: 'Buka Glikolisis' }).click()
  await expect(page).toHaveURL(/#\/episode\/1$/)
  await expect(page.getByRole('heading', { level: 1, name: 'Glikolisis' })).toBeVisible()
  await page.getByRole('link', { name: 'Peta materi', exact: true }).click()
  await expect(page).toHaveURL(/#\/peta-materi$/)
})

test('aset termuat dan kartu terbaca tanpa gulir halaman ke samping', async ({ page }, info) => {
  for (const gambar of await page.locator('main img').all()) {
    await expect
      .poll(() => gambar.evaluate((el: HTMLImageElement) => el.naturalWidth))
      .toBeGreaterThan(0)
  }
  await expect(page.locator('main')).toHaveCSS('background-image', /latar-peta.*\.webp/)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  const kartu = page.getByRole('list', { name: 'Episode respirasi aerob' }).getByRole('listitem')
  const pertama = (await kartu.nth(0).boundingBox())!
  const kedua = (await kartu.nth(1).boundingBox())!
  if (info.project.name === 'desktop') {
    expect(Math.abs(pertama.y - kedua.y)).toBeLessThan(2)
    expect(kedua.x).toBeGreaterThan(pertama.x)
  } else if (info.project.name === 'hp-tegak') {
    expect(kedua.y).toBeGreaterThanOrEqual(pertama.y + pertama.height)
  }
})
