import { expect, test, type Page } from '@playwright/test'

const draf = (page: Page) =>
  page.evaluate(() => JSON.parse(localStorage.getItem('metalab-jawaban')!).state.draf)
const drafPoe = (page: Page) =>
  page.evaluate(() => JSON.parse(localStorage.getItem('metalab-jawaban')!).state.drafPoe)

// Salinan bayangan kertas tidak ikut dihitung
const FOSFAT = '[data-phosphate]:not([data-bayangan])'
const KARBON = '[data-carbon]:not([data-bayangan])'
const ALASAN_C = 'Glukosa perlu dua fosfat agar terbelah, dan tiap ATP memberi satu fosfat.'
const ALASAN_E = 'Terbentuk 4 ATP, dikurangi 2 ATP yang dipakai di awal.'

const tombol = (page: Page, nama: string) => page.getByRole('button', { name: nama, exact: true })

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

  // POE c dengan tebakan 2 ATP
  await tombol(page, 'ATP 1').click({ timeout: 15000 })
  await tombol(page, 'ATP 2').click()
  await page.getByRole('button', { name: ALASAN_C }).click()
  await page.getByRole('button', { name: 'Kunci tebakan, lanjutkan video' }).click()
  await page.getByRole('button', { name: ALASAN_C }).click({ timeout: 25000 })
  await page.getByRole('button', { name: 'Lanjutkan video' }).click()
})

async function soalD(page: Page) {
  // Tiap NAD⁺ menangkap tepat 2 elektron dari satu PGAL
  await expect(page.locator('[data-petunjuk]')).toHaveText('Ketuk NAD⁺ untuk menangkap elektron', {
    timeout: 15000,
  })
  await tombol(page, 'NAD⁺ 1').click({ timeout: 15000 })
  await tombol(page, 'NAD⁺ 2').click()
  await expect(page.locator('[data-carrier="NADH"]')).toHaveCount(2, { timeout: 15000 })
  for (const n of await page.locator('[data-carrier="NADH"]').all()) {
    await expect(n.locator('[data-electron]')).toHaveCount(2)
  }
  await expect(page.locator('[data-carrier="NAD⁺"]')).toHaveCount(0)
  await expect(page.locator('[data-electron]')).toHaveCount(4)

  // PGAL mengikat fosfat bebas: 1,3-bifosfogliserat, 3 C dan 2 P
  const bpg = page.locator('[data-molecule="bifosfogliserat"]')
  await expect(bpg).toHaveCount(2)
  for (const m of await bpg.all()) {
    await expect(m.locator(KARBON)).toHaveCount(3)
    await expect(m.locator(FOSFAT)).toHaveCount(2)
  }

  // Panen fosfat: 4 fosfat, 4 ADP menjadi 4 ATP
  await expect(page.locator('[data-petunjuk]')).toHaveText('Ketuk tiap fosfat', { timeout: 15000 })
  for (let i = 1; i <= 4; i++) await tombol(page, `Fosfat ${i}`).click({ timeout: 15000 })
  await expect(page.locator('svg text', { hasText: 'ATP terbentuk: 4' })).toHaveCount(1, {
    timeout: 15000,
  })
}

test('soal d: 2 NADH, 4 ATP, 2 H₂O, dan 2 asam piruvat 3 C', async ({ page }) => {
  await soalD(page)

  // Akhir bab d, sebelum Tebak soal e
  await expect(page.locator('#poe-tebak-judul')).toHaveText(
    'Berapa ATP bersih yang dihasilkan glikolisis?',
    { timeout: 20000 },
  )
  await expect(page.locator('[data-carrier="NADH"]')).toHaveCount(2)
  for (const n of await page.locator('[data-carrier="NADH"]').all()) {
    await expect(n.locator('[data-electron]')).toHaveCount(2)
  }
  const atp = page.locator('[data-carrier="ATP"]')
  await expect(atp).toHaveCount(4)
  for (const a of await atp.all()) await expect(a.locator(FOSFAT)).toHaveCount(3)
  await expect(page.locator('[data-molecule="h2o"]')).toHaveCount(2)
  const piruvat = page.locator('[data-molecule="piruvat"]')
  await expect(piruvat).toHaveCount(2)
  for (const r of await piruvat.all()) {
    await expect(r.locator(KARBON)).toHaveCount(3)
    await expect(r.locator(FOSFAT)).toHaveCount(0)
  }
  // Fosfat utuh: 4 ATP x 3 P ditambah 2 ADP dari soal c x 2 P
  await expect(page.locator(`svg ${FOSFAT}`)).toHaveCount(12 + 4)
  expect((await draf(page)).d).toBe(
    'PGAL dioksidasi menjadi asam piruvat; terbentuk 2 NADH, 4 ATP, 2 H₂O',
  )
})

async function tebakE(page: Page, n: number) {
  await expect(page.locator('#poe-tebak-judul')).toBeVisible({ timeout: 20000 })
  for (let i = 1; i <= n; i++) await tombol(page, `ATP ${i}`).click()
  await expect(page.locator('#cnt')).toHaveText(`${n} ATP`)
  await page.getByRole('button', { name: ALASAN_E }).click()
  await page.getByRole('button', { name: 'Kunci tebakan, lanjutkan video' }).click()
}

test('POE e tebakan 2: tepat, 4 terbentuk dikurangi 2 dipakai, jawaban tersimpan', async ({
  page,
}) => {
  await soalD(page)
  await tebakE(page, 2)
  await expect(page.locator('.gtag')).toContainText('Tebakanmu: 2 ATP bersih')
  await expect(page.locator('svg text', { hasText: 'ATP BERSIH = 4 − 2 = 2' })).toHaveCount(1, {
    timeout: 20000,
  })
  await expect(page.locator('.gtag.ok')).toBeVisible()
  const vonis = page.locator('.poe-card-explain .poe-verdict').first()
  await expect(vonis).toContainText('Tebakanmu tepat', { timeout: 20000 })
  await page.getByRole('button', { name: ALASAN_E }).click()
  await page.getByRole('button', { name: 'Lanjutkan video' }).click()
  expect((await draf(page)).e).toBe('2 ATP bersih (4 terbentuk − 2 dipakai)')
  expect((await drafPoe(page)).e).toEqual({ tebakan: 2, alasan: 1, penjelasan: 1 })
})

test('POE e tebakan 4: narasi pembanding muncul dan vonis belum tepat', async ({ page }) => {
  await soalD(page)
  await tebakE(page, 4)
  await expect(page.locator('[data-gelembung]')).toHaveText(
    'Kalau berhenti di sini, hasilnya 4 seperti tebakanmu. Tapi ada 2 ATP yang sudah dipakai di awal.',
    { timeout: 20000 },
  )
  await expect(page.locator('.gtag.no')).toBeVisible({ timeout: 20000 })
  const vonis = page.locator('.poe-card-explain .poe-verdict').first()
  await expect(vonis).toContainText('Tebakanmu 4 ATP belum tepat', { timeout: 20000 })
})
