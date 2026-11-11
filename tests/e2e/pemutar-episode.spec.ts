import { expect, test, type Page } from '@playwright/test'

const KALIMAT_1 = /^Kamu makan nasi/
const KALIMAT_2 = /^Itu mitokondria/

const gelembung = (page: Page) => page.locator('[data-gelembung]')
const mulai = (page: Page) => page.getByRole('button', { name: 'Mulai episode' }).click()

test.beforeEach(async ({ page }) => {
  await page.goto('/#/episode/1?cepat')
})

test('sampul episode menampilkan judul dan tombol mulai', async ({ page }) => {
  await expect(page.getByRole('heading', { level: 1, name: 'Glikolisis' })).toBeVisible()
  await expect(page.getByText('Episode 1')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Mulai episode' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Peta materi', exact: true })).toBeVisible()
})

test('jeda menghentikan gerak dan kalimat', async ({ page }, info) => {
  test.skip(info.project.name === 'hp-tegak', 'HP tegak hanya menampilkan ajakan putar HP')
  // Tanpa mode cepat: kalimat pertama tampil sekitar 5,3 detik, jadi jeda 6 detik pasti melewatinya
  await page.goto('/#/episode/1')
  await page.reload()
  await mulai(page)
  await expect(gelembung(page)).toHaveText(KALIMAT_1)
  await page.getByRole('button', { name: 'Jeda (spasi)' }).click()
  await expect(page.getByRole('button', { name: 'Lanjut (spasi)' })).toBeVisible()
  await page.waitForTimeout(6000)
  await expect(gelembung(page)).toHaveText(KALIMAT_1)
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur())
  await page.keyboard.press('Space')
  await expect(page.getByRole('button', { name: 'Jeda (spasi)' })).toBeVisible()
  await expect(gelembung(page)).toHaveText(KALIMAT_2, { timeout: 10000 })
})

test('panel pengaturan menjeda dan menyimpan saklar', async ({ page }, info) => {
  test.skip(info.project.name === 'hp-tegak', 'HP tegak hanya menampilkan ajakan putar HP')
  await mulai(page)
  await expect(gelembung(page)).toBeVisible()
  await page.getByRole('button', { name: 'Pengaturan', exact: true }).click()
  const panel = page.getByRole('dialog', { name: 'Pengaturan' })
  await expect(panel).toBeVisible()
  await expect(page.getByRole('button', { name: 'Lanjut (spasi)' })).toBeVisible()
  await expect(panel.getByText('Video berhenti selama panel ini terbuka.')).toBeVisible()
  const nama = [
    'Subtitle',
    'Narasi suara',
    'Efek suara',
    'Musik latar',
    'Putar pelan',
    'Mode tenang (animasi dikurangi)',
  ]
  await expect(panel.getByRole('switch')).toHaveCount(6)
  for (const n of nama)
    await expect(panel.getByRole('switch', { name: n, exact: true })).toBeVisible()
  await expect(panel.getByRole('button', { name: /Layar penuh/ })).toBeVisible()
  await expect(panel.getByText('Soal di episode ini')).toBeVisible()
  const subtitle = panel.getByRole('switch', { name: 'Subtitle', exact: true })
  await expect(subtitle).toBeChecked()
  await subtitle.click()
  await expect(subtitle).not.toBeChecked()
  await expect(gelembung(page)).toBeHidden()
  await page.reload()
  await page.getByRole('button', { name: 'Pengaturan', exact: true }).click()
  await expect(
    page
      .getByRole('dialog', { name: 'Pengaturan' })
      .getByRole('switch', { name: 'Subtitle', exact: true }),
  ).not.toBeChecked()
})

test('Escape menutup panel dan fokus kembali', async ({ page }, info) => {
  test.skip(info.project.name === 'hp-tegak', 'HP tegak hanya menampilkan ajakan putar HP')
  const tombol = page.getByRole('button', { name: 'Pengaturan', exact: true })
  await tombol.click()
  await expect(tombol).toHaveAttribute('aria-expanded', 'true')
  const panel = page.getByRole('dialog', { name: 'Pengaturan' })
  await expect(panel.getByRole('switch').first()).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(panel).toBeHidden()
  await expect(tombol).toHaveAttribute('aria-expanded', 'false')
  await expect(tombol).toBeFocused()
})

test('HP tegak menampilkan ajakan putar HP', async ({ page }, info) => {
  test.skip(info.project.name !== 'hp-tegak', 'khusus HP tegak')
  await expect(page.getByRole('heading', { name: 'Putar HP-mu' })).toBeVisible()
  // Ikon I18 versi kertas komik, ditempel sekali lalu diam
  const ikon = page.getByRole('img', { name: 'Putar HP' })
  await expect(ikon).toBeVisible()
  await expect(ikon).toHaveAttribute('src', /ui-putar-hp.*\.webp/)
  await expect(ikon).toHaveCSS('animation-name', 'sampul-tempel')
  await expect(ikon).toHaveCSS('animation-iteration-count', '1')
  // Jalan kembali tetap ada walau HP belum diputar
  await expect(page.getByRole('link', { name: 'Peta materi', exact: true })).toBeVisible()
})

test('HP miring: panggung dan kontrol muat di layar', async ({ page }, info) => {
  test.skip(info.project.name !== 'hp-miring', 'khusus HP miring')
  await mulai(page)
  const kotak = (await page.locator('[data-panggung] svg').boundingBox())!
  expect(kotak.x).toBeGreaterThanOrEqual(0)
  expect(kotak.y).toBeGreaterThanOrEqual(0)
  expect(kotak.x + kotak.width).toBeLessThanOrEqual(800)
  expect(kotak.y + kotak.height).toBeLessThanOrEqual(360)
  await expect(page.getByRole('button', { name: 'Jeda (spasi)' })).toBeInViewport()
  await expect(page.getByRole('button', { name: 'Pengaturan', exact: true })).toBeInViewport()
  // Kalimat tentang mitokondria memanggil pendamping; di HP miring ia tetap tampil dan muat
  await expect(gelembung(page)).toHaveText(KALIMAT_2)
  await expect(page.locator('[data-pendamping]')).toBeVisible()
  await expect(page.locator('[data-pendamping]')).toBeInViewport({ ratio: 1 })
  expect((await page.locator('.pemutar-maskot').boundingBox())!.width).toBeGreaterThanOrEqual(130)
})

test('desktop: kedua maskot cukup besar dan muat di layar', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'khusus desktop')
  await mulai(page)
  await expect(gelembung(page)).toHaveText(KALIMAT_2)
  const maskot = page.locator('.pemutar-maskot')
  const pendamping = page.locator('[data-pendamping]')
  await expect(maskot).toBeInViewport({ ratio: 1 })
  await expect(pendamping).toBeInViewport({ ratio: 1 })
  expect((await maskot.boundingBox())!.width).toBeGreaterThanOrEqual(240)
  expect((await pendamping.boundingBox())!.width).toBeGreaterThanOrEqual(160)
})

test('saat siswa diberi tugas, maskot kembali ke ukuran kecil', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'khusus desktop')
  await mulai(page)
  await expect(page.getByRole('button', { name: 'Glukosa (6 atom C)', exact: true })).toBeVisible({
    timeout: 20000,
  })
  await expect(page.locator('[data-petunjuk]')).toBeVisible()
  await expect
    .poll(async () => (await page.locator('.pemutar-maskot').boundingBox())!.width)
    .toBeLessThanOrEqual(205)
})

test('diputar ke tegak di tengah episode menjeda', async ({ page }, info) => {
  test.skip(info.project.name !== 'hp-miring', 'khusus HP miring')
  // Mulai meminta layar penuh di perangkat sentuh, padahal ukuran jendela uji hanya bisa diubah
  // di luar layar penuh; di sini browser dianggap menolaknya
  await page.evaluate(() => {
    Element.prototype.requestFullscreen = () => Promise.reject(new Error('ditolak'))
  })
  await mulai(page)
  await expect(page.getByRole('button', { name: 'Jeda (spasi)' })).toBeVisible()
  await page.setViewportSize({ width: 360, height: 800 })
  await expect(page.getByRole('heading', { name: 'Putar HP-mu' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Lanjut (spasi)' })).toBeAttached()
  await page.setViewportSize({ width: 800, height: 360 })
  await expect(page.getByRole('heading', { name: 'Putar HP-mu' })).toBeHidden()
  await page.waitForTimeout(500)
  await expect(page.getByRole('button', { name: 'Lanjut (spasi)' })).toBeVisible()
})

test('kembali ke peta di tengah episode tanpa error', async ({ page }, info) => {
  test.skip(info.project.name === 'hp-tegak', 'HP tegak hanya menampilkan ajakan putar HP')
  const galat: string[] = []
  page.on('pageerror', (e) => galat.push(e.message))
  page.on('console', (m) => {
    if (m.type() === 'error') galat.push(m.text())
  })
  // Tanpa mode cepat agar adegan masih berjalan saat halaman ditinggal
  await page.goto('/#/episode/1')
  await page.reload()
  await mulai(page)
  await expect(gelembung(page)).toHaveText(KALIMAT_1)
  await page.goto('/#/peta-materi')
  await expect(page.getByRole('heading', { level: 1, name: 'Peta materi' })).toBeVisible()
  await page.waitForTimeout(1000)
  expect(galat).toEqual([])
})

test('menutup pengaturan setelah HP diputar tetap menjeda episode', async ({ page }, info) => {
  test.skip(info.project.name !== 'hp-miring', 'khusus HP miring')
  await page.evaluate(() => {
    Element.prototype.requestFullscreen = () => Promise.reject(new Error('ditolak'))
  })
  await mulai(page)
  await expect(gelembung(page)).toHaveText(KALIMAT_1)
  await page.getByRole('button', { name: 'Pengaturan', exact: true }).click()
  // Overlay CSS dapat terlihat sebelum event orientasi diproses pemutar.
  await page.evaluate(() => {
    matchMedia('(orientation: portrait) and (max-width: 760px)').addEventListener(
      'change',
      () => {
        document.documentElement.dataset.tegakDiproses = 'true'
      },
      { once: true },
    )
  })
  await page.setViewportSize({ width: 360, height: 800 })
  await expect(page.getByRole('heading', { name: 'Putar HP-mu' })).toBeVisible()
  await expect(page.locator('html')).toHaveAttribute('data-tegak-diproses', 'true')
  await page.setViewportSize({ width: 800, height: 360 })
  await page.getByRole('button', { name: 'Tutup pengaturan' }).click()
  await expect(page.getByRole('button', { name: 'Lanjut (spasi)' })).toBeVisible()
  await page.getByRole('button', { name: 'Lanjut (spasi)' }).click()
  await expect(gelembung(page)).toHaveText(KALIMAT_2)
})

test('viewport memenuhi layar dan pemutar menjaga area aman notch', async ({ page }) => {
  await expect(page.locator('meta[name="viewport"]')).toHaveAttribute(
    'content',
    /viewport-fit=cover/,
  )
  await page.setViewportSize({ width: 844, height: 390 })
  for (const sisi of ['kiri', 'kanan']) {
    await page.locator('.pemutar').evaluate((el, sisi) => {
      const gaya = (el as HTMLElement).style
      gaya.setProperty('--aman-kiri', sisi === 'kiri' ? '44px' : '0px')
      gaya.setProperty('--aman-kanan', sisi === 'kanan' ? '44px' : '0px')
      gaya.setProperty('--aman-bawah', '21px')
    }, sisi)
    const panggung = (await page.locator('[data-panggung]').boundingBox())!
    const bilah = (await page.locator('.pemutar-bilah').boundingBox())!
    const kiri = sisi === 'kiri' ? 44 : 0
    const kanan = sisi === 'kanan' ? 800 : 844
    expect(panggung.x).toBeGreaterThanOrEqual(kiri)
    expect(panggung.x + panggung.width).toBeLessThanOrEqual(kanan)
    expect(panggung.y + panggung.height).toBeLessThanOrEqual(369)
    expect(bilah.x).toBeGreaterThanOrEqual(kiri)
    expect(bilah.x + bilah.width).toBeLessThanOrEqual(kanan)
    expect(Math.abs(panggung.width / panggung.height - 16 / 9)).toBeLessThan(0.01)
  }
})

test('pengaturan HP miring terbaca penuh tanpa menggulir pada setiap episode', async ({
  page,
}, info) => {
  test.skip(info.project.name !== 'hp-miring', 'Khusus panel HP miring')
  for (const [width, height] of [
    [667, 375],
    [800, 360],
    [932, 430],
  ]) {
    await page.setViewportSize({ width, height })
    for (const episode of [0, 1, 2, 3, 4]) {
      await page.goto(`/#/episode/${episode}`)
      await page.getByRole('button', { name: 'Pengaturan', exact: true }).click()
      const panel = page.getByRole('dialog', { name: 'Pengaturan' })
      await expect(panel.getByRole('switch')).toHaveCount(6)
      const ukuran = await panel.evaluate((el) => ({
        tinggi: el.clientHeight,
        isi: el.scrollHeight,
        lebar: el.clientWidth,
        isiLebar: el.scrollWidth,
      }))
      expect((await panel.boundingBox())!.width).toBeLessThanOrEqual(width / 2)
      expect(ukuran.isi, `episode ${episode}, ${width}`).toBeLessThanOrEqual(ukuran.tinggi)
      expect(ukuran.isiLebar).toBeLessThanOrEqual(ukuran.lebar)
      for (const item of await panel.locator('label, li, button').all())
        await expect(item).toBeInViewport({ ratio: 1 })
      if (episode === 0) await page.screenshot({ path: info.outputPath(`pengaturan-${width}.png`) })
      await panel.getByRole('button', { name: 'Tutup pengaturan' }).click()
    }
  }
})
