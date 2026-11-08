import { expect, test, type Page } from '@playwright/test'

const jawaban = (page: Page) =>
  page.evaluate(() => JSON.parse(localStorage.getItem('metalab-jawaban')!).state)

const ALASAN_C = 'Glukosa perlu dua fosfat agar terbelah, dan tiap ATP memberi satu fosfat.'
const ALASAN_E = 'Terbentuk 4 ATP, dikurangi 2 ATP yang dipakai di awal.'
const tombol = (page: Page, nama: string) => page.getByRole('button', { name: nama, exact: true })
const gelembung = (page: Page) => page.locator('[data-gelembung]')

test.beforeEach(async ({ page }, info) => {
  test.skip(info.project.name === 'hp-tegak', 'Soal dimainkan saat HP miring')
  await page.addInitScript(() => {
    localStorage.setItem(
      'metalab-pengaturan',
      JSON.stringify({ state: { suaraAktif: false }, version: 0 }),
    )
  })
  await page.goto('/#/episode/1?cepat')
  await page.getByRole('button', { name: 'Mulai episode' }).click()
  await tombol(page, 'Glukosa (6 atom C)').click({ timeout: 15000 })
  await tombol(page, '2 tahap').click({ timeout: 15000 })
  // POE c tebakan 2
  await tombol(page, 'ATP 1').click({ timeout: 15000 })
  await tombol(page, 'ATP 2').click()
  await page.getByRole('button', { name: ALASAN_C }).click()
  await page.getByRole('button', { name: 'Kunci tebakan, lanjutkan video' }).click()
  await page.getByRole('button', { name: ALASAN_C }).click({ timeout: 25000 })
  await page.getByRole('button', { name: 'Lanjutkan video' }).click()
  // Soal d
  await tombol(page, 'NAD⁺ 1').click({ timeout: 15000 })
  await tombol(page, 'NAD⁺ 2').click()
  for (let i = 1; i <= 4; i++) await tombol(page, `Fosfat ${i}`).click({ timeout: 15000 })
  // POE e tebakan 4 (belum tepat), supaya Lembar Hasil menampilkan tebakan asli
  await expect(page.locator('#poe-tebak-judul')).toBeVisible({ timeout: 20000 })
  for (let i = 1; i <= 4; i++) await tombol(page, `ATP ${i}`).click()
  await page.getByRole('button', { name: ALASAN_E }).click()
  await page.getByRole('button', { name: 'Kunci tebakan, lanjutkan video' }).click()
  await page.getByRole('button', { name: ALASAN_E }).click({ timeout: 30000 })
  await page.getByRole('button', { name: 'Lanjutkan video' }).click()
})

test('soal g dan h, lalu Lembar Hasil dari jawaban putaran ini', async ({ page }) => {
  // g: pengecoh ditolak dengan umpan balik, tetap di tempat
  const co2 = page.locator('[data-chip="co2"]')
  await expect(co2).toHaveCount(1, { timeout: 20000 })
  await expect(co2.locator('[data-molecule="co2"]')).toHaveAttribute('data-karbon', '1')
  await expect(co2.locator('[data-molecule="co2"]')).toHaveAttribute('data-oksigen', '2')
  await expect(page.locator('[data-chip="o2"] [data-molecule="o2"]')).toHaveAttribute(
    'data-oksigen',
    '2',
  )
  await expect(page.locator('[data-chip="pir"] [data-carbon]:not([data-bayangan])')).toHaveCount(3)
  await expect(page.locator('[data-petunjuk]')).toHaveText('Ketuk hasil glikolisis', {
    timeout: 15000,
  })
  await tombol(page, 'CO₂').click({ timeout: 15000 })
  await expect(gelembung(page)).toHaveText(
    'CO₂ belum dilepas di glikolisis: karbon masih utuh di asam piruvat (3 + 3 = 6).',
  )
  await tombol(page, 'O₂').click()
  await expect(gelembung(page)).toHaveText(
    'Glikolisis tidak menghasilkan dan tidak memakai oksigen.',
  )
  await expect(page.locator('[data-terkumpul]')).toHaveCount(0)
  for (const nama of ['2 asam piruvat', '2 NADH', '2 ATP bersih', '2 H₂O'])
    await tombol(page, nama).click()
  await expect(page.locator('[data-terkumpul]')).toHaveCount(4)
  await expect(gelembung(page)).toHaveText(
    'Hasil glikolisis: 2 asam piruvat, 2 NADH, 2 ATP bersih, dan 2 molekul air.',
    { timeout: 15000 },
  )
  await expect(co2).toHaveCount(0)
  expect((await jawaban(page)).draf.g).toBe('2 asam piruvat, 2 NADH, 2 ATP (bersih), 2 H₂O')

  // h: rumpang diisi berurutan, pilihan salah menahan
  const terisi = page.locator('[data-rumpang="terisi"]')
  await tombol(page, '6 CO₂').click({ timeout: 20000 })
  await expect(tombol(page, '6 CO₂')).toHaveAttribute('aria-pressed', 'true')
  await expect
    .poll(() => tombol(page, '6 CO₂').evaluate((el) => getComputedStyle(el, '::before').filter))
    .toContain('hue-rotate')
  await expect(tombol(page, '6 CO₂')).toHaveCSS('font-family', /Atkinson Hyperlegible/)
  await expect(gelembung(page)).toHaveText(
    'Karbon glukosa masih utuh di asam piruvat: 3 + 3 = 6, belum ada CO₂.',
  )
  await expect(terisi).toHaveCount(0)
  await expect(page.locator('[data-petunjuk]')).toHaveText('Pilih jawaban untuk rumpang 1.')
  await tombol(page, '2 asam piruvat (3 C)').click()
  await expect(terisi).toHaveCount(1)
  await expect(page.locator('[data-petunjuk]')).toHaveText('Pilih jawaban untuk rumpang 2.')
  await expect(page.locator('.pemutar-lengkapi [aria-pressed="true"]')).toHaveCount(0)
  await tombol(page, 'membran krista').click()
  await expect(gelembung(page)).toHaveText('Membran krista adalah tempat transpor elektron.')
  await tombol(page, 'sitosol').click()
  await tombol(page, 'aerob (memakai oksigen)').click()
  await expect(gelembung(page)).toHaveText(
    'Lihat lagi: tidak ada oksigen yang dipakai sepanjang episode ini.',
  )
  await expect(terisi).toHaveCount(2)
  await tombol(page, 'anaerob (tanpa oksigen)').click()
  await tombol(page, '2 NADH dan 4 ATP').click()
  await expect(gelembung(page)).toHaveText(
    '4 ATP terbentuk, tetapi 2 dipakai di awal; bersihnya 2.',
  )
  await expect(terisi).toHaveCount(3)
  await tombol(page, '2 NADH dan 2 ATP').click()
  await expect(page.locator('svg text', { hasText: 'GLIKOLISIS' })).toHaveCount(1, {
    timeout: 15000,
  })
  expect((await jawaban(page)).draf.h).toBe(
    'Glikolisis adalah pemecahan satu glukosa (6 C) menjadi 2 asam piruvat (3 C) di sitosol dalam kondisi anaerob (tanpa oksigen), dengan hasil sampingan 2 NADH dan 2 ATP.',
  )

  // Akhir episode: draf menjadi hasil, lalu Lembar Hasil
  await page.waitForURL(/#\/episode\/1\/hasil/, { timeout: 30000 })
  const { hasil, hasilPoe } = await jawaban(page)
  expect(Object.keys(hasil).sort()).toEqual(['a', 'b', 'c', 'd', 'e', 'g', 'h'])
  expect(hasilPoe.e).toEqual({ tebakan: 4, alasan: 1, penjelasan: 1 })
  await expect(page.getByRole('heading', { name: 'Bagan glikolisismu' })).toBeVisible()
  await expect(page.locator('[data-pin]')).toHaveCount(7)
  await expect(page.locator('[data-poe="e"] .guess s')).toHaveText('4')
})
