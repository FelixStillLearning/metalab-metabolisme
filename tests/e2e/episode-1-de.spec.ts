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
type Kotak = { x: number; y: number; width: number; height: number }
const bertumpuk = (a: Kotak, b: Kotak) =>
  a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height

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
  await expect(page.locator('[data-petunjuk]')).toHaveText(
    'Ketuk kedua NAD⁺ untuk menangkap elektron.',
    {
      timeout: 15000,
    },
  )
  const tempat = page.locator('[data-objek="label-sitosol"] text')
  await expect(tempat).toBeVisible()
  const k = (await tempat.boundingBox())!
  const panggung = (await page.locator('[data-panggung]').boundingBox())!
  expect(k.x).toBeGreaterThanOrEqual(panggung.x)
  expect(k.x + k.width).toBeLessThanOrEqual(panggung.x + panggung.width)
  expect(k.y).toBeGreaterThanOrEqual(panggung.y)
  for (const h of await page.locator('.pemutar-bilah, .pemutar-panduan').all()) {
    expect(bertumpuk(k, (await h.boundingBox())!), 'label sitosol utuh').toBe(false)
    for (const n of await page.locator('[data-carrier="NAD⁺"]').all()) {
      expect(
        bertumpuk((await n.boundingBox())!, (await h.boundingBox())!),
        'NAD⁺ bisa diketuk',
      ).toBe(false)
    }
    for (const c of await page.locator(`[data-molecule="pgal"] ${KARBON}`).all()) {
      expect(bertumpuk((await c.boundingBox())!, (await h.boundingBox())!), 'karbon terlihat').toBe(
        false,
      )
    }
  }
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
  const penghitung = (await page
    .locator('svg text', { hasText: 'ATP terbentuk: 0' })
    .boundingBox())!
  for (const h of await page.locator('.pemutar-bilah, .pemutar-panduan').all()) {
    expect(bertumpuk(penghitung, (await h.boundingBox())!), 'penghitung ATP terbaca').toBe(false)
  }
  for (const l of await bpg
    .locator('text', { hasText: '1,3-bifosfogliserat' })
    .locator('..')
    .all()) {
    for (const c of await bpg.locator(KARBON).all()) {
      expect(
        bertumpuk((await l.boundingBox())!, (await c.boundingBox())!),
        `label tidak menimpa karbon: ${JSON.stringify([await l.boundingBox(), await c.boundingBox()])}`,
      ).toBe(false)
    }
  }
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
  // Hasil soal d rapat di ruang kosong: desktop di tengah-kanan, HP miring (kartu tebakan
  // di kanan) dikecilkan ke kiri atas. Tidak saling tumpuk, tidak tertutup kartu, token,
  // nampan, atau petunjuk.
  const panggung = (await page.locator('[data-panggung]').boundingBox())!
  const s = panggung.width / 1600
  const hasil = page.locator(
    '[data-molecule="h2o"], [data-molecule="piruvat"], [data-carrier="NADH"], [data-carrier="ATP"]',
  )
  await expect(hasil).toHaveCount(10)
  const kotakHasil = await Promise.all(
    (await hasil.all()).map(async (h) => (await h.boundingBox())!),
  )
  const penghalang = await Promise.all(
    (await page.locator('.poe-card, .tok, .poe-zone, .pemutar-panduan').all()).map(
      async (h) => (await h.boundingBox())!,
    ),
  )
  const desktop = test.info().project.name === 'desktop'
  kotakHasil.forEach((k, i) => {
    if (desktop) {
      expect((k.x - panggung.x) / s, `hasil ${i} kiri`).toBeGreaterThanOrEqual(950)
      expect((k.x + k.width - panggung.x) / s, `hasil ${i} kanan`).toBeLessThanOrEqual(1430)
    }
    expect(k.x, `hasil ${i} di panggung`).toBeGreaterThanOrEqual(panggung.x)
    for (const l of kotakHasil.slice(i + 1)) expect(bertumpuk(k, l), `hasil ${i}`).toBe(false)
    for (const h of penghalang) expect(bertumpuk(k, h), `hasil ${i} tertutup`).toBe(false)
  })
  // Fosfat utuh: 4 ATP x 3 P. ADP soal c sudah keluar dari layar sebelum Jelaskan soal c.
  await expect(page.locator(`svg ${FOSFAT}`)).toHaveCount(12)
  await expect(page.locator('[data-carrier="ADP"]')).toHaveCount(0)
  expect((await draf(page)).d).toBe(
    'PGAL dioksidasi menjadi asam piruvat; terbentuk 2 NADH, 4 ATP, 2 H₂O',
  )
})

async function tebakE(page: Page, n: number) {
  await expect(page.locator('#poe-tebak-judul')).toBeVisible({ timeout: 20000 })
  await expect(page.locator('svg text', { hasText: 'ATP terbentuk:' })).toHaveCount(0)
  const nampan = (await page.locator('.poe-zone').boundingBox())!
  expect(bertumpuk(nampan, (await page.locator('.poe-card').boundingBox())!)).toBe(false)
  for (let i = 1; i <= n; i++) await tombol(page, `ATP ${i}`).click()
  await expect(page.locator('#cnt')).toHaveText(`${n} ATP`)
  await expect(async () => {
    for (const t of await page.locator('.tok.placed').all()) {
      const k = (await t.boundingBox())!
      expect(k.x).toBeGreaterThanOrEqual(nampan.x)
      expect(k.x + k.width).toBeLessThanOrEqual(nampan.x + nampan.width)
      expect(k.y).toBeGreaterThanOrEqual(nampan.y)
      expect(k.y + k.height).toBeLessThanOrEqual(nampan.y + nampan.height)
    }
  }).toPass()
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
  // Penanda vonis dan jumlah tebakan sebaris
  const penanda = (await page.locator('.gtag.ok img').boundingBox())!
  const jumlah = (await page.locator('.gtag.ok span').boundingBox())!
  expect(Math.abs(penanda.y + penanda.height / 2 - (jumlah.y + jumlah.height / 2))).toBeLessThan(4)
  const hasilTebakan = (await page.locator('.gtag.ok').boundingBox())!
  const kontrol = (await page.locator('.pemutar-bilah').boundingBox())!
  expect(Math.abs(hasilTebakan.x - kontrol.x)).toBeLessThan(2)
  expect(hasilTebakan.y).toBeGreaterThanOrEqual(kontrol.y + kontrol.height)
  expect(hasilTebakan.width).toBeLessThanOrEqual(360)
  const vonis = page.locator('.poe-card-explain .poe-verdict').first()
  await expect(vonis).toContainText('Tebakanmu tepat', { timeout: 20000 })
  const kartu = (await page.locator('.poe-card-explain').boundingBox())!
  const persamaan = (await page
    .locator('svg text', { hasText: 'ATP BERSIH = 4 − 2 = 2' })
    .boundingBox())!
  expect(
    bertumpuk(kartu, persamaan),
    `persamaan dan kartu: ${JSON.stringify([persamaan, kartu])}`,
  ).toBe(false)
  const petunjuk = (await page.locator('.pemutar-panduan').boundingBox())!
  expect(
    bertumpuk(persamaan, petunjuk),
    `persamaan dan petunjuk: ${JSON.stringify([persamaan, petunjuk])}`,
  ).toBe(false)
  const bersih = page.locator('[data-carrier="ATP"]')
  await expect(bersih).toHaveCount(2)
  for (const atp of await bersih.all())
    expect(bertumpuk(kartu, (await atp.boundingBox())!), 'dua ATP bersih tetap terlihat').toBe(
      false,
    )
  for (const r of await page.locator('[data-molecule="piruvat"]').all())
    await expect(r).toHaveCSS('opacity', '0')
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

test('POE e tebakan 6: seluruh token muat di nampan dan narasi mengoreksi penjumlahan', async ({
  page,
}) => {
  await soalD(page)
  await tebakE(page, 6)
  await expect(page.locator('[data-gelembung]')).toHaveText(
    'Tebakanmu 6 menjumlahkan keduanya. Tapi ATP yang dipakai di awal bukan hasil; ATP itu habis terpakai.',
    { timeout: 20000 },
  )
  await expect(page.locator('.poe-card-explain .poe-verdict').first()).toContainText(
    'Tebakanmu 6 ATP belum tepat',
    { timeout: 20000 },
  )
})
