import { expect, test, type Page } from '@playwright/test'
import { latarMemenuhiLayar } from './bantu/latar.js'

async function siapkan(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem(
      'metalab-pengaturan',
      JSON.stringify({ state: { suaraAktif: false }, version: 0 }),
    )
  })
}

test('peta penutup: glikolisis selesai, asam piruvat menuju mitokondria, lalu ke peta materi', async ({
  page,
}, info) => {
  test.skip(info.project.name === 'hp-tegak', 'Penutup dipakai saat HP miring')
  await siapkan(page)
  await page.goto('/#/episode/1/penutup?cepat')
  // Mulai sendiri tanpa sampul
  await expect(page.getByRole('button', { name: 'Mulai episode' })).toHaveCount(0)
  await expect(page.locator('[data-simpul]')).toHaveCount(4)
  await latarMemenuhiLayar(page, 'peta-penutup')
  await expect(page.locator('[data-simpul="1"]')).toHaveAttribute('data-status', 'selesai')
  await expect(page.locator('[data-simpul="2"]')).toHaveAttribute('data-status', 'menyala')
  await expect(page.locator('[data-simpul="3"]')).toHaveAttribute('data-status', 'belum')
  await expect(page.locator('[data-simpul="4"]')).toHaveAttribute('data-status', 'belum')
  for (const nama of [
    'Glikolisis',
    'Dekarboksilasi Oksidatif',
    'Siklus Krebs',
    'Transpor Elektron',
  ])
    await expect(page.locator('svg text', { hasText: nama })).toHaveCount(1)

  const piruvat = page.locator('[data-molecule="piruvat"]')
  await expect(piruvat).toHaveCount(2, { timeout: 15000 })
  for (const r of await piruvat.all()) await expect(r.locator('[data-carbon]')).toHaveCount(3)
  await expect(page.locator('[data-objek="mitokondria"]')).toHaveCount(1)
  await expect(page.locator('[data-gelembung]')).toContainText('masuk ke mitokondria', {
    timeout: 15000,
  })

  const ke = page.getByRole('link', { name: 'Ke peta materi' })
  await expect(ke).toBeVisible({ timeout: 15000 })
  await expect(page.locator('[data-gelembung]')).toContainText('Sampai jumpa')
  // Jumlah karbon tetap di akhir: 3 + 3
  await expect(page.locator('[data-molecule="piruvat"] [data-carbon]')).toHaveCount(6)
  await ke.click()
  await page.waitForURL(/#\/peta-materi$/)
})

test('HP tegak: penutup mengajak memutar HP dan menunggu', async ({ page }, info) => {
  test.skip(info.project.name !== 'hp-tegak', 'Khusus HP tegak')
  await siapkan(page)
  await page.goto('/#/episode/1/penutup?cepat')
  await expect(page.getByRole('heading', { name: 'Putar HP-mu' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Lanjut (spasi)' })).toBeAttached()
})
