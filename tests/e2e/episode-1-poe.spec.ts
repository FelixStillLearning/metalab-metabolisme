import { expect, test, type Page } from '@playwright/test'

const draf = (page: Page) =>
  page.evaluate(() => JSON.parse(localStorage.getItem('metalab-jawaban')!).state.draf)
const drafPoe = (page: Page) =>
  page.evaluate(() => JSON.parse(localStorage.getItem('metalab-jawaban')!).state.drafPoe)

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

  // Selesaikan soal a
  const glukosa = page.getByRole('button', { name: 'Glukosa (6 atom C)', exact: true })
  await expect(glukosa).toBeVisible({ timeout: 15000 })
  await glukosa.click()

  // Selesaikan soal b
  const duaTahap = page.getByRole('button', { name: '2 tahap', exact: true })
  await expect(duaTahap).toBeVisible({ timeout: 15000 })
  await duaTahap.click()
})

test('POE c: tebak, amati investasi energi, pembelahan 6C jadi 2 PGAL, dan jelaskan', async ({
  page,
}) => {
  // Masuk tahap Tebak
  const judulTebak = page.getByRole('heading', {
    name: 'Berapa ATP yang dibutuhkan untuk memecah glukosa?',
  })
  await expect(judulTebak).toBeVisible({ timeout: 15000 })
  await expect(page.locator('.poe-steps span.on')).toHaveText('Tebak')

  const tombolKunci = page.getByRole('button', { name: 'Kunci tebakan, lanjutkan video' })
  await expect(tombolKunci).toBeDisabled()

  await expect(page.locator('[data-petunjuk]')).toHaveText('Ketuk ATP untuk menaruhnya di glukosa.')
  await expect(page.locator('.tok .pemutar-ajakan')).toHaveCount(3)
  // Taruh 2 ATP
  await page.getByRole('button', { name: 'ATP 1', exact: true }).click()
  await page.getByRole('button', { name: 'ATP 2', exact: true }).click()
  await expect(page.locator('#cnt')).toHaveText('2 ATP')
  await expect(page.locator('.tok.placed .pemutar-ajakan')).toHaveCount(0)
  await expect(page.locator('.tok .pemutar-ajakan')).toHaveCount(1)
  await expect(page.locator('[data-petunjuk]')).toHaveText('Pilih alasan untuk tebakanmu.')

  // Pilih alasan
  const alasan2 = page.getByRole('button', {
    name: 'Glukosa perlu dua fosfat agar terbelah, dan tiap ATP memberi satu fosfat.',
  })
  const alasan1 = page.locator('.poe-reasons .chip').first()
  await alasan1.click()
  await expect(alasan1).toHaveAttribute('aria-pressed', 'true')
  await alasan2.click()
  await expect(alasan1).toHaveAttribute('aria-pressed', 'false')
  await expect(alasan2).toHaveAttribute('aria-pressed', 'true')
  await expect
    .poll(() => alasan2.evaluate((el) => getComputedStyle(el, '::before').filter))
    .toContain('hue-rotate')
  await expect(alasan2).toHaveCSS('color', 'rgb(245, 241, 232)')
  await expect(alasan2).toHaveCSS('font-family', /Atkinson Hyperlegible/)
  await expect(alasan2).toHaveCSS('font-weight', '700')
  await expect(tombolKunci).toBeEnabled()
  await expect(page.locator('[data-petunjuk]')).toContainText('Ketuk Kunci tebakan')

  // Kunci tebakan
  await tombolKunci.click()

  // Masuk tahap Amati
  await expect(page.locator('.poe-steps span.on')).toHaveText('Amati', { timeout: 15000 })
  await expect(page.locator('[data-petunjuk]')).toHaveCount(0)
  await expect(page.locator('.gtag')).toContainText('Tebakanmu: 2 ATP')

  // Glukosa menerima fosfat dan terbelah menjadi 2 PGAL
  await expect(page.locator('[data-molecule="pgal"]')).toHaveCount(2, { timeout: 25000 })
  // Total karbon tetap 6 (3 C pada masing-masing PGAL)
  await expect(page.locator('[data-molecule="pgal"] [data-carbon]')).toHaveCount(6)

  // Masuk tahap Jelaskan
  await expect(page.locator('.poe-steps span.on')).toHaveText('Jelaskan', { timeout: 15000 })
  const judulJelaskan = page.getByRole('heading', {
    name: 'Alasan mana yang menjelaskan apa yang baru kamu lihat?',
  })
  await expect(judulJelaskan).toBeVisible()

  // Pilih alasan salah terlebih dahulu
  const alasanSalah = page.getByRole('button', {
    name: 'Satu ATP sudah cukup untuk memecah glukosa.',
  })
  await alasanSalah.click()
  await expect(page.locator('.poe-feedback')).toContainText('Belum tepat')

  // Pilih alasan yang benar
  const alasanBenar = page.getByRole('button', {
    name: 'Glukosa perlu dua fosfat agar terbelah, dan tiap ATP memberi satu fosfat.',
  })
  await alasanBenar.click()
  await expect(page.locator('.poe-feedback')).toContainText('Dua ATP memberi dua fosfat')

  // Lanjutkan video
  const tombolLanjut = page.getByRole('button', { name: 'Lanjutkan video' })
  await expect(tombolLanjut).toBeVisible()
  await tombolLanjut.click()

  // Periksa data tersimpan di store jawaban
  const hasilDraf = await draf(page)
  const hasilPoe = await drafPoe(page)

  expect(hasilDraf.c).toContain('Glukosa diberi 2 fosfat lalu terbelah')
  expect(hasilPoe.c).toEqual({ tebakan: 2, alasan: 1, penjelasan: 0 })
})

const ALASAN_BENAR = 'Glukosa perlu dua fosfat agar terbelah, dan tiap ATP memberi satu fosfat.'
// Salinan bayangan kertas tidak ikut dihitung
const FOSFAT = '[data-phosphate]:not([data-bayangan])'
const KARBON = '[data-carbon]:not([data-bayangan])'

type Kotak = { x: number; y: number; width: number; height: number }
const kotak = async (page: Page, pemilih: string) => (await page.locator(pemilih).boundingBox())!
const berisi = (luar: Kotak, dalam: Kotak, sela = 2) =>
  dalam.x >= luar.x - sela &&
  dalam.y >= luar.y - sela &&
  dalam.x + dalam.width <= luar.x + luar.width + sela &&
  dalam.y + dalam.height <= luar.y + luar.height + sela
// Kotak gabungan semua elemen yang cocok
const gabungan = async (page: Page, pemilih: string): Promise<Kotak> => {
  const semua = await Promise.all(
    (await page.locator(pemilih).all()).map(async (e) => (await e.boundingBox())!),
  )
  const x = Math.min(...semua.map((k) => k.x))
  const y = Math.min(...semua.map((k) => k.y))
  const kanan = Math.max(...semua.map((k) => k.x + k.width))
  const bawah = Math.max(...semua.map((k) => k.y + k.height))
  return { x, y, width: kanan - x, height: bawah - y }
}
const bertumpuk = (a: Kotak, b: Kotak) =>
  a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height

async function tebak(page: Page, n: number) {
  await expect(page.locator('#poe-tebak-judul')).toBeVisible({ timeout: 15000 })
  for (let i = 1; i <= n; i++) {
    await page.getByRole('button', { name: `ATP ${i}`, exact: true }).click()
  }
  await page.getByRole('button', { name: ALASAN_BENAR }).click()
  await page.getByRole('button', { name: 'Kunci tebakan, lanjutkan video' }).click()
}

// Desktop memeriksa tiga ukuran; hp-miring sudah 800x360 dan layar penuh, jadi tidak diubah
async function tiapUkuran(
  page: Page,
  proyek: string,
  periksa: (pesan: string, width: number, height: number) => Promise<void>,
) {
  const ukuran =
    proyek === 'desktop'
      ? [
          [1440, 900],
          [800, 360],
          [667, 375],
        ]
      : [[800, 360]]
  for (const [width, height] of ukuran) {
    if (page.viewportSize()?.width !== width) {
      await page.setViewportSize({ width, height })
      await page.waitForTimeout(100)
    }
    await periksa(`${width}x${height}`, width, height)
  }
}

// Kartu POE utuh di layar, di bawah bilah kontrol, dan semua tombolnya di dalam kartu
async function kartuMuat(
  page: Page,
  pemilih: string,
  pesan: string,
  width: number,
  height: number,
) {
  const kartu = await kotak(page, pemilih)
  expect(berisi({ x: 0, y: 0, width, height }, kartu), pesan).toBe(true)
  expect(bertumpuk(kartu, await kotak(page, '.pemutar-bilah')), pesan).toBe(false)
  for (const b of await page.locator(`${pemilih} button`).all()) {
    expect(berisi(kartu, (await b.boundingBox())!), pesan).toBe(true)
  }
}

// Token ATP tidak saling menempel dan tidak menutupi atom C
async function tokenAman(page: Page, pesan: string) {
  const token = await Promise.all(
    (await page.locator('.tok').all()).map(async (t) => (await t.boundingBox())!),
  )
  const karbon = await Promise.all(
    (await page.locator(KARBON).all()).map(async (c) => (await c.boundingBox())!),
  )
  token.forEach((t, i) => {
    for (const u of token.slice(i + 1)) expect(bertumpuk(t, u), `${pesan} token`).toBe(false)
    for (const c of karbon) expect(bertumpuk(t, c), `${pesan} token dan C`).toBe(false)
  })
}

for (const n of [1, 2, 3]) {
  test(`POE c tebakan ${n} ATP: glukosa membawa 2 fosfat, tiap PGAL 1 fosfat dan 3 karbon`, async ({
    page,
  }, info) => {
    await tebak(page, n)

    // Diperiksa tiap bingkai: glukosa sempat membawa tepat 2 fosfat sebelum terbelah
    await page.waitForFunction(
      (pemilih) => document.querySelectorAll(`[data-molecule="glukosa"] ${pemilih}`).length === 2,
      FOSFAT,
      { polling: 'raf', timeout: 25000 },
    )

    await expect(page.locator('#poe-explain-judul')).toBeVisible({ timeout: 25000 })
    // Vonis tebakan: hanya 2 ATP yang tepat
    const vonis = page.locator('.poe-card-explain .poe-verdict').first()
    if (n === 2) await expect(vonis).toContainText('Tebakanmu tepat')
    else await expect(vonis).toContainText(`Tebakanmu ${n} ATP belum tepat. Yang terjadi`)
    const pgal = page.locator('[data-molecule="pgal"]')
    await expect(pgal).toHaveCount(2)
    for (const h of await pgal.all()) {
      await expect(h.locator(FOSFAT)).toHaveCount(1)
      await expect(h.locator(KARBON)).toHaveCount(3)
    }

    // Setiap fosfat PGAL tergambar di dalam panggung
    const panggung = await kotak(page, '[data-panggung]')
    for (const f of await page.locator(`[data-molecule="pgal"] ${FOSFAT}`).all()) {
      expect(berisi(panggung, (await f.boundingBox())!)).toBe(true)
    }

    // Fosfat tidak hilang: 2 ADP masing-masing 2 P, ATP sisa tetap 3 P
    await expect(page.locator('[data-carrier="ADP"]')).toHaveCount(2)
    for (const adp of await page.locator('[data-carrier="ADP"]').all()) {
      await expect(adp.locator(FOSFAT)).toHaveCount(2)
    }
    await expect(page.locator('[data-carrier="ATP"]')).toHaveCount(n > 2 ? 1 : 0)
    if (n > 2) await expect(page.locator(`[data-carrier="ATP"] ${FOSFAT}`)).toHaveCount(3)

    // Panah putus-putus soal b sudah dipudarkan; lencana pembawa memakai gambar E01/E02
    // (bayangannya di gambar), ikatan fosfatnya tanpa bayangan
    await expect(page.locator('svg path[stroke-dasharray]')).toHaveCount(0)
    await expect(page.locator('[data-carrier] > [data-bayangan]')).toHaveCount(0)
    for (const c of await page.locator('[data-carrier]').all()) {
      const jenis = await c.getAttribute('data-carrier')
      await expect(c.locator('> image')).toHaveAttribute(
        'href',
        new RegExp(`pembawa-${jenis!.toLowerCase()}`),
      )
    }

    if (n !== 2) return
    // Chip tahap G07 memakai gambar tahap yang aktif
    await expect(page.locator('.poe-steps img')).toHaveAttribute('src', /tahap-poe-jelaskan/)

    // Kartu Jelaskan dengan umpan balik dan tombol Lanjutkan tetap utuh di layar
    await page.getByRole('button', { name: 'Satu ATP sudah cukup untuk memecah glukosa.' }).click()
    await page.getByRole('button', { name: ALASAN_BENAR }).click()
    await expect(page.getByRole('button', { name: 'Lanjutkan video' })).toBeVisible()
    await tiapUkuran(page, info.project.name, async (pesan, width, height) => {
      await kartuMuat(page, '.poe-card-explain', pesan, width, height)
      if (width > 1000) {
        const gelembung = await kotak(page, '.pemutar-gelembung')
        expect(bertumpuk(await kotak(page, '.poe-card-explain'), gelembung), pesan).toBe(false)
      }
    })
  })
}

test('POE c: chip tahap, label, zona glukosa, token, dan kartu tebakan tidak bertumpuk', async ({
  page,
}, info) => {
  await expect(page.locator('#poe-tebak-judul')).toBeVisible({ timeout: 15000 })
  await tiapUkuran(page, info.project.name, async (pesan, width, height) => {
    // Label sitosol, bila tampil, tidak tertimpa chip tahap atau bilah kontrol
    const label = page.locator('[data-objek="label-sitosol"] text')
    if (await label.isVisible()) {
      const kotakLabel = (await label.boundingBox())!
      expect(bertumpuk(await kotak(page, '.poe-steps'), kotakLabel), pesan).toBe(false)
      expect(bertumpuk(await kotak(page, '.pemutar-bilah'), kotakLabel), pesan).toBe(false)
    }

    // Zona membingkai cincin glukosa dan tidak tertutup gelembung kalimat
    const zona = await kotak(page, '.poe-zone')
    const cincin = await gabungan(page, `[data-molecule="glukosa"] ${KARBON}`)
    expect(berisi(zona, cincin), pesan).toBe(true)
    expect(bertumpuk(zona, await kotak(page, '.pemutar-gelembung')), pesan).toBe(false)

    // Kartu muat di layar: semua alasan dan tombol Kunci terlihat tanpa gulir
    await kartuMuat(page, '.poe-card', pesan, width, height)
    await tokenAman(page, pesan)
  })

  // Alasan terpilih tetap berwarna terpilih walau masih disentuh penunjuk
  const alasan = page.getByRole('button', { name: ALASAN_BENAR })
  await alasan.click()
  await alasan.hover()
  await expect
    .poll(() => alasan.evaluate((el) => getComputedStyle(el, '::before').filter))
    .toContain('hue-rotate')
  await expect(alasan).toHaveCSS('color', 'rgb(245, 241, 232)')
  await expect
    .poll(() => alasan.evaluate((el) => getComputedStyle(el, '::before').borderImageSource))
    .toContain('interaksi-tombol-pilihan')

  // Ketiga token di zona glukosa
  for (let i = 1; i <= 3; i++) {
    await page.getByRole('button', { name: `ATP ${i}`, exact: true }).click()
  }
  await page.waitForTimeout(400)
  await tiapUkuran(page, info.project.name, async (pesan) => tokenAman(page, `${pesan} di zona`))
})
