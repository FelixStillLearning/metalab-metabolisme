import { expect, test, type Page } from '@playwright/test'
import { latarMemenuhiLayar } from './bantu/latar.js'

const gelembung = (page: Page) => page.locator('[data-gelembung]')
const tombolMulai = (page: Page) => page.getByRole('button', { name: 'Mulai episode' })
const glukosa = (page: Page) => page.locator('[data-molecule="glukosa"]')
const sitosol = (page: Page) => page.locator('[data-latar="sitosol"]')

// Mencatat efek komik yang pernah muncul selama adegan, walau hanya sekejap
const pantauEfek = (page: Page) =>
  page.evaluate(() => {
    const w = window as unknown as { efekTerlihat: string[] }
    w.efekTerlihat = []
    new MutationObserver((daftar) => {
      for (const m of daftar)
        for (const n of m.addedNodes)
          if (n instanceof Element && n.getAttribute('data-effect'))
            w.efekTerlihat.push(n.getAttribute('data-effect')!)
    }).observe(document.body, { childList: true, subtree: true })
  })
const efekTerlihat = (page: Page) =>
  page.evaluate(() => (window as unknown as { efekTerlihat: string[] }).efekTerlihat)

// Gerak glukosa ditulis GSAP sebagai atribut transform pada elemen SVG
const transformGlukosa = (page: Page) =>
  page.evaluate(() =>
    document.querySelector('[data-molecule="glukosa"]')!.getAttribute('transform'),
  )

// Tunggu per bingkai sampai glukosa muncul: geraknya masuk hanya sekitar 0,7 detik
const tungguGlukosaBergerak = (page: Page) =>
  page.waitForFunction(() => document.querySelector('[data-molecule="glukosa"]'), null, {
    polling: 'raf',
    timeout: 15000,
  })

let galat: string[]
let hilang: string[]
let audio: string[]

test.beforeEach(async ({ page }, info) => {
  test.skip(info.project.name === 'hp-tegak', 'HP tegak hanya menampilkan ajakan putar HP')
  galat = []
  hilang = []
  audio = []
  page.on('pageerror', (e) => galat.push(e.message))
  page.on('console', (m) => {
    if (m.type() === 'error') galat.push(m.text())
  })
  page.on('response', (r) => {
    if (r.status() === 404) hilang.push(r.url())
    if (r.url().includes('/audio/')) audio.push(r.url())
  })
  await page.goto('/#/episode/1?cepat')
})

test('pembuka: sel, penanda di mitokondria, lalu sitosol', async ({ page }) => {
  await pantauEfek(page)
  await tombolMulai(page).click()
  await expect(gelembung(page)).toContainText('Kamu makan nasi')
  await expect(page.locator('[data-objek="sel"]')).toHaveCount(1)
  await expect(gelembung(page)).toContainText('Itu mitokondria')
  await expect(page.locator('[data-objek="penanda-zoom"]')).toBeVisible()
  await expect(page.locator('[data-pose]')).toHaveAttribute('data-pose', '08-menunjuk')
  await expect(sitosol(page)).toHaveCSS('opacity', '1', { timeout: 15000 })
  await expect(page.getByText('SITOSOL · TANPA OKSIGEN')).toBeAttached()
  await latarMemenuhiLayar(page, 'sitosol')
  // Pembanding untuk tes mode tenang: tanpa mode tenang garis gerak memang muncul
  expect(await efekTerlihat(page)).toContain('speed-lines')
  expect(galat).toEqual([])
})

test('glukosa pembuka membawa enam atom karbon', async ({ page }) => {
  await tombolMulai(page).click()
  await expect(gelembung(page)).toContainText('Itu mitokondria')
  await expect(glukosa(page)).toHaveAttribute('data-karbon', '6')
  await expect(glukosa(page).locator('[data-carbon]')).toHaveCount(6)
})

test('mode tenang: tanpa onomatope dan garis gerak', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await pantauEfek(page)
  await tombolMulai(page).click()
  await expect(sitosol(page)).toHaveCSS('opacity', '1', { timeout: 15000 })
  const efek = await efekTerlihat(page)
  expect(efek).not.toContain('onomatope')
  expect(efek).not.toContain('speed-lines')
  await expect(page.locator('[data-effect="onomatope"], [data-effect="speed-lines"]')).toHaveCount(
    0,
  )
})

test('mulai diketuk dua kali tetap satu putaran', async ({ page }) => {
  await tombolMulai(page).dblclick()
  await expect(gelembung(page)).toContainText('Itu mitokondria')
  await expect(glukosa(page)).toHaveCount(1)
  await expect(page.locator('[data-objek="sel"]')).toHaveCount(1)
})

test('jeda menghentikan gerak glukosa', async ({ page }) => {
  // Kecepatan normal agar gerak glukosa cukup lama untuk dijeda di tengah jalan
  await page.goto('/#/episode/1')
  await page.reload()
  await tombolMulai(page).click()
  await tungguGlukosaBergerak(page)
  await page.getByRole('button', { name: 'Jeda (spasi)' }).click()
  await expect(page.getByRole('button', { name: 'Lanjut (spasi)' })).toBeVisible()
  const dijeda = await transformGlukosa(page)
  await page.waitForTimeout(1000)
  expect(await transformGlukosa(page)).toBe(dijeda)
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur())
  await page.keyboard.press('Space')
  await expect(page.getByRole('button', { name: 'Jeda (spasi)' })).toBeVisible()
  await expect.poll(() => transformGlukosa(page)).not.toBe(dijeda)
})

test('kembali ke peta di tengah pembuka menghentikan episode', async ({ page }) => {
  await page.goto('/#/episode/1')
  await page.reload()
  await tombolMulai(page).click()
  await expect(gelembung(page)).toContainText('Kamu makan nasi')
  await tungguGlukosaBergerak(page)
  // Simpan panggung sebelum dilepas dari halaman, untuk melihat adegannya benar-benar berhenti
  await page.evaluate(() => {
    const w = window as unknown as { panggungLama: Element; glukosaLama: Element }
    w.panggungLama = document.querySelector('[data-panggung] svg')!
    w.glukosaLama = document.querySelector('[data-molecule="glukosa"]')!
  })
  await page.goto('/#/peta-materi')
  await expect(page.getByRole('heading', { level: 1, name: 'Peta materi' })).toBeVisible()
  const keadaan = () =>
    page.evaluate(() => {
      const w = window as unknown as { panggungLama: Element; glukosaLama: Element }
      return {
        simpul: w.panggungLama.querySelectorAll('*').length,
        transform: w.glukosaLama.getAttribute('transform'),
      }
    })
  const awal = await keadaan()
  await page.waitForTimeout(1500)
  expect(await keadaan()).toEqual(awal)
  expect(await page.evaluate(() => window.speechSynthesis.speaking)).toBe(false)
  expect(galat).toEqual([])
})

test('suara episode dimuat tanpa berkas yang hilang', async ({ page }) => {
  await tombolMulai(page).click()
  await expect(sitosol(page)).toHaveCSS('opacity', '1', { timeout: 15000 })
  expect(audio.some((u) => /audio\/musik-latar\.(ogg|mp3)$/.test(u))).toBe(true)
  expect(audio.some((u) => /audio\/melesat\.(ogg|mp3)$/.test(u))).toBe(true)
  expect(hilang).toEqual([])
})
