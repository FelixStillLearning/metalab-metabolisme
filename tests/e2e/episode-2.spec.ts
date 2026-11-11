import { expect, test, type Page } from '@playwright/test'
import { latarMemenuhiLayar } from './bantu/latar.js'
import { JAWABAN, POE, RUMPANG } from '../../src/episodes/episode-2-dekarboksilasi/isi.js'

const LAMA = { draf: { a: 'draf lama' }, hasil: { a: 'hasil lama' }, penjelasan: 'Tetap' }
async function siapkan(page: Page) {
  await page.addInitScript((lama) => {
    if (sessionStorage.getItem('e2-siap')) return
    sessionStorage.setItem('e2-siap', '1')
    localStorage.setItem(
      'metalab-pengaturan',
      JSON.stringify({ state: { suaraAktif: false }, version: 0 }),
    )
    for (const key of ['metalab-jawaban', 'metalab-jawaban-e0'])
      localStorage.setItem(key, JSON.stringify(lama))
  }, LAMA)
}
async function mulai(page: Page) {
  await siapkan(page)
  await page.goto('/#/episode/2?cepat')
  await page.getByRole('button', { name: 'Mulai episode' }).click()
  await page.getByRole('button', { name: 'Asam piruvat (3 C)', exact: true }).click()
  await page.getByRole('button', { name: 'Ada oksigen (aerob)', exact: true }).click()
  await page.getByRole('button', { name: '3 tahap', exact: true }).click()
}
async function tebak(page: Page, k: 'c' | 'b·2', i: number, drag = false) {
  await expect(page.locator('#poe-tebak-judul')).toHaveText(POE[k].judul, { timeout: 20000 })
  const button = page.getByRole('button', { name: POE[k].zat[i], exact: true })
  if (drag) {
    const dari = (await button.boundingBox())!
    const ke = (await page.locator('.poe-zone').boundingBox())!
    await page.mouse.move(dari.x + dari.width / 2, dari.y + dari.height / 2)
    await page.mouse.down()
    await page.mouse.move(ke.x + ke.width / 2, ke.y + ke.height / 2, { steps: 8 })
    await page.mouse.up()
  } else await button.click()
  await expect(page.locator('#cnt')).toHaveText(POE[k].zat[i])
  await page.getByRole('button', { name: POE[k].alasan[0], exact: true }).click()
  await page.getByRole('button', { name: 'Kunci tebakan, lanjutkan video' }).click()
}
async function jelaskan(page: Page, k: 'c' | 'b·2') {
  await expect(page.locator('#poe-explain-judul')).toBeVisible({ timeout: 25000 })
  await expect(page.locator('[data-carbon]')).toHaveCount(6)
  await page.getByRole('button', { name: POE[k].alasan[1], exact: true }).click()
  await page.getByRole('button', { name: 'Lanjutkan video', exact: true }).click()
}

test('E2 alur penuh, dua POE, karbon, hasil/cetak, data terpisah dan replay', async ({
  page,
}, info) => {
  test.skip(info.project.name === 'hp-tegak', 'Episode memakai layar miring')
  test.setTimeout(120000)
  const galat: string[] = []
  page.on('response', (r) => {
    if (r.status() === 404) galat.push(r.url())
  })
  page.on('pageerror', (e) => galat.push(e.message))
  await page.addInitScript(() => {
    const w = window as unknown as { gerak: { kata: string[]; elektron: number; zoom: boolean } }
    w.gerak = { kata: [], elektron: 0, zoom: false }
    new MutationObserver(() => {
      for (const n of document.querySelectorAll<HTMLElement>('[data-word]'))
        if (!w.gerak.kata.includes(n.dataset.word!)) w.gerak.kata.push(n.dataset.word!)
      w.gerak.elektron = Math.max(
        w.gerak.elektron,
        document.querySelectorAll('[data-electron]').length,
      )
      const kamera = document.querySelector('[data-jalur-reaksi]')?.parentElement?.parentElement
      if (kamera && new DOMMatrix(getComputedStyle(kamera).transform).a > 1.05) w.gerak.zoom = true
    }).observe(document, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-word', 'style', 'transform'],
    })
  })
  await mulai(page)
  await expect(page.locator('#poe-tebak-judul')).toHaveText(POE.c.judul, { timeout: 20000 })
  await expect(page.locator('[data-carbon]')).toHaveCount(6)
  await expect(page.locator('[data-oxygen]')).toHaveCount(4)
  await latarMemenuhiLayar(page, 'matriks')
  await page.screenshot({ path: info.outputPath('karboksil-tebak.png') })
  await tebak(page, 'c', 2)
  await page.waitForFunction(() => document.querySelector('[data-word="KRAAK!"]'), null, {
    polling: 'raf',
  })
  await page.getByRole('button', { name: 'Jeda (spasi)' }).click()
  await expect(page.locator('[data-effect="split-burst"]')).toHaveCount(2)
  expect(
    await page
      .locator('[data-effect="split-burst"]')
      .evaluateAll((bs) =>
        bs.every((b) =>
          [...document.querySelectorAll('[data-carbon]')].every(
            (c) => !!(b.compareDocumentPosition(c) & Node.DOCUMENT_POSITION_FOLLOWING),
          ),
        ),
      ),
  ).toBe(true)
  await page.screenshot({ path: info.outputPath('reaksi-karboksil.png') })
  await page.getByRole('button', { name: 'Lanjut (spasi)' }).click()
  await expect(page.locator('#poe-explain-judul')).toBeVisible({ timeout: 25000 })
  await expect(page.locator('.poe-verdict').first()).toContainText('energi belum tepat')
  for (const m of await page.locator('[data-molecule="co2"]').all()) {
    await expect(m.locator('[data-carbon]')).toHaveCount(1)
    await expect(m.locator('[data-oxygen]')).toHaveCount(2)
  }
  await jelaskan(page, 'c')
  await tebak(page, 'b·2', 1, true)
  await page.waitForFunction(() => document.querySelector('[data-word="NADH!"]'), null, {
    polling: 'raf',
  })
  await page.getByRole('button', { name: 'Jeda (spasi)' }).click()
  for (const n of await page.locator('[data-carrier="NADH"]').all()) {
    const a = (await n.boundingBox())!
    for (const t of await page.locator('[data-jalur-reaksi] text').all()) {
      const b = (await t.boundingBox())!
      expect(
        a.x + a.width <= b.x ||
          b.x + b.width <= a.x ||
          a.y + a.height <= b.y ||
          b.y + b.height <= a.y,
      ).toBe(true)
    }
  }
  await page.screenshot({ path: info.outputPath('reaksi-elektron.png') })
  await page.getByRole('button', { name: 'Lanjut (spasi)' }).click()
  await expect(page.locator('#poe-explain-judul')).toBeVisible({ timeout: 25000 })
  await expect(page.locator('[data-carrier="NADH"]')).toHaveCount(2)
  await jelaskan(page, 'b·2')
  await expect(page.getByRole('button', { name: 'KoA 1', exact: true })).toBeVisible({
    timeout: 15000,
  })
  for (const co2 of await page.locator('[data-molecule="co2"]').all()) {
    const a = (await co2.boundingBox())!
    for (const nad of await page.locator('[data-carrier="NADH"]').all()) {
      const b = (await nad.boundingBox())!
      expect(
        a.x + a.width <= b.x ||
          b.x + b.width <= a.x ||
          a.y + a.height <= b.y ||
          b.y + b.height <= a.y,
      ).toBe(true)
    }
  }
  await page.screenshot({ path: info.outputPath('pengikatan-koa.png') })
  for (const i of [1, 2]) await page.getByRole('button', { name: `KoA ${i}`, exact: true }).click()
  const hasil = page.getByRole('region', { name: 'Ketuk semua hasil dekarboksilasi oksidatif.' })
  await hasil.getByRole('button', { name: '2 ATP', exact: true }).click()
  await expect(page.locator('[data-gelembung]')).toContainText('Tidak ada ATP')
  for (const teks of ['2 asetil KoA', '2 NADH', '2 CO₂'])
    await hasil.getByRole('button', { name: teks, exact: true }).click()
  await expect(
    page.getByRole('button', { name: 'Asetil KoA 1, 2 karbon', exact: true }),
  ).toBeVisible({ timeout: 15000 })
  await expect(page.locator('[data-carbon]')).toHaveCount(6)
  for (const g of await page.locator('[data-molecule="asetil-koa"], [data-molecule="co2"]').all())
    await expect(g).toHaveCSS('opacity', '1')
  await page.screenshot({ path: info.outputPath('hitung-karbon.png') })
  for (const teks of [
    'Asetil KoA 1, 2 karbon',
    'Asetil KoA 2, 2 karbon',
    'CO₂ 1, 1 karbon',
    'CO₂ 2, 1 karbon',
  ])
    await page.getByRole('button', { name: teks, exact: true }).click()
  for (const r of RUMPANG)
    await page.getByRole('button', { name: r.opsi[r.benar], exact: true }).click()
  await expect(page).toHaveURL(/#\/episode\/2\/hasil$/, { timeout: 20000 })
  await expect(
    page.getByRole('heading', { name: 'Bagan dekarboksilasimu', exact: true }),
  ).toBeVisible()
  await expect(page.locator('[data-poe="c"]')).toContainText('energi')
  await expect(page.locator('[data-poe="b·2"]')).toContainText('FAD')
  const baca = () => page.evaluate(() => JSON.parse(localStorage.getItem('metalab-jawaban-e2')!))
  expect((await baca()).state.hasil.jawaban).toEqual(JAWABAN)
  await page.getByRole('textbox').fill('Empat karbon pada gugus asetil, dua pada CO₂.')
  await page.getByRole('button', { name: 'Simpan penjelasan' }).click()
  if (info.project.name === 'desktop') {
    await page.locator('.e2-bagan').focus()
    await page.keyboard.press('End')
    await expect(page.locator('.e2-jawaban li').last()).toBeInViewport()
    await page.keyboard.press('Home')
  }
  const tersimpan = await baca()
  await page.reload()
  await expect(page.getByRole('textbox')).toHaveValue(
    'Empat karbon pada gugus asetil, dua pada CO₂.',
  )
  await page.screenshot({ path: info.outputPath('hasil.png'), fullPage: true })
  const viewport = page.viewportSize()!
  await page.setViewportSize({ width: 360, height: 800 })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.screenshot({ path: info.outputPath('hasil-tegak.png'), fullPage: true })
  await page.emulateMedia({ media: 'print' })
  await expect(page.locator('.hasil-cetak')).toBeVisible()
  await expect(page.locator('.hasil-cetak')).toContainText('Aktivitas 1.8')
  await expect(page.locator('.hasil-cetak')).toContainText('Empat karbon')
  await expect(page.locator('.hasil-cetak')).not.toContainText('1.8 e')
  await page.emulateMedia({ media: 'screen' })
  await page.setViewportSize(viewport)
  // Muat ulang hasil menghilangkan ?cepat; kecepatan tes dipulihkan sebelum replay.
  await page.evaluate(async () => {
    const modul = performance
      .getEntriesByType('resource')
      .find((r) => new URL(r.name).pathname === '/src/features/pemutar-episode/mesin.ts')
    if (!modul) throw new Error('Mesin animasi aplikasi belum dimuat')
    const { kendali } = await import(modul.name)
    kendali.cepat = 0.12
  })
  await page.getByRole('button', { name: 'Putar ulang tanpa jeda' }).click()
  await expect(page).toHaveURL(/#\/episode\/2\/hasil$/, { timeout: 45000 })
  expect(await baca()).toEqual(tersimpan)
  for (const key of ['metalab-jawaban', 'metalab-jawaban-e0'])
    expect(await page.evaluate((k) => JSON.parse(localStorage.getItem(k)!), key)).toEqual(LAMA)
  const gerak = await page.evaluate(
    () =>
      (window as unknown as { gerak: { kata: string[]; elektron: number; zoom: boolean } }).gerak,
  )
  expect(gerak.kata).toEqual(expect.arrayContaining(['DRRRT', 'KRAAK!', 'NADH!', 'KLIK!', 'WUSH!']))
  expect(gerak.elektron).toBe(4)
  expect(gerak.zoom).toBe(true)
  expect(galat).toEqual([])
})

test('E2 HP tegak, hasil kosong, dan rute dari peta', async ({ page }, info) => {
  await siapkan(page)
  await page.goto('/#/episode/2/hasil')
  await expect(page).toHaveURL(/#\/episode\/2$/)
  if (info.project.name === 'hp-tegak')
    await expect(page.getByRole('heading', { name: 'Putar HP-mu' })).toBeVisible()
  else await expect(page.getByRole('button', { name: 'Mulai episode' })).toBeVisible()
  await page.goto('/#/peta-materi')
  await page.getByRole('button', { name: 'Respirasi Aerob', exact: true }).click()
  await page.getByRole('link', { name: 'Buka Dekarboksilasi oksidatif' }).click()
  await expect(page).toHaveURL(/#\/episode\/2$/)
})

for (const [karbon, pembawa] of [
  [0, 0],
  [1, 2],
]) {
  test(`E2 POE alternatif ${karbon}/${pembawa}, keyboard, 667px dan mode tenang`, async ({
    page,
  }, info) => {
    test.skip(info.project.name !== 'desktop', 'Tambahan viewport kecil dan cabang POE')
    test.setTimeout(60000)
    await page.setViewportSize({ width: 667, height: 375 })
    if (karbon === 0) await page.emulateMedia({ reducedMotion: 'reduce' })
    await mulai(page)
    await expect(page.locator('#poe-tebak-judul')).toHaveText(POE.c.judul, { timeout: 15000 })
    for (const [k, index] of [
      ['c', karbon],
      ['b·2', pembawa],
    ] as const) {
      await expect(page.locator('#poe-tebak-judul')).toHaveText(POE[k].judul, { timeout: 15000 })
      const card = (await page.locator('.poe-card').boundingBox())!
      expect(card.x).toBeGreaterThanOrEqual(0)
      expect(card.y).toBeGreaterThanOrEqual(0)
      expect(card.x + card.width).toBeLessThanOrEqual(668)
      expect(card.y + card.height).toBeLessThanOrEqual(376)
      for (const token of await page.locator('.tok').all()) {
        const b = (await token.boundingBox())!
        expect(b.x + b.width).toBeLessThan(card.x)
        expect(b.height).toBeGreaterThanOrEqual(44)
      }
      if (k === 'c') await page.screenshot({ path: info.outputPath('667-tebak.png') })
      const token = page.getByRole('button', { name: POE[k].zat[index], exact: true })
      await token.focus()
      await page.keyboard.press('Enter')
      await page.getByRole('button', { name: POE[k].alasan[1], exact: true }).click()
      await page.getByRole('button', { name: 'Kunci tebakan, lanjutkan video' }).click()
      await jelaskan(page, k)
    }
    if (karbon === 0) {
      await expect(page.locator('.pemutar')).toHaveAttribute('data-tenang')
      await expect(page.locator('[data-effect]')).toHaveCount(0)
    }
    await page.goto('/#/peta-materi')
  })
}

test('E2 jeda menahan pemisahan karbon, keluar membatalkan, efek mematuhi saklar', async ({
  page,
}, info) => {
  test.skip(info.project.name !== 'desktop', 'Jejak gerak/audio di desktop')
  test.setTimeout(60000)
  await page.addInitScript(() => {
    const w = window as unknown as { jumlahBunyi: number }
    w.jumlahBunyi = 0
    const start = AudioBufferSourceNode.prototype.start
    AudioBufferSourceNode.prototype.start = function (...args) {
      if (this.buffer && this.buffer.length > 1) w.jumlahBunyi++
      return start.apply(this, args)
    }
  })
  await mulai(page)
  await expect(page.locator('#poe-tebak-judul')).toHaveText(POE.c.judul, { timeout: 20000 })
  await page.evaluate(async () => {
    const { usePengaturan } = await import('/src/' + 'stores/pengaturan.ts')
    usePengaturan.setState({ suaraAktif: true, efek: false, musik: false, narasi: false })
  })
  await page.getByRole('button', { name: 'CO₂', exact: true }).click()
  const bunyi = () =>
    page.evaluate(() => (window as unknown as { jumlahBunyi: number }).jumlahBunyi)
  const awal = await bunyi()
  await page.getByRole('button', { name: POE.c.alasan[1], exact: true }).click()
  expect(await bunyi()).toBe(awal)
  await page.evaluate(async () => {
    const { usePengaturan } = await import('/src/' + 'stores/pengaturan.ts')
    usePengaturan.setState({ efek: true })
    const { kendali } = await import('/src/' + 'features/pemutar-episode/mesin.ts')
    kendali.cepat = 1
  })
  await page.getByRole('button', { name: POE.c.alasan[0], exact: true }).click()
  await expect.poll(bunyi).toBeGreaterThan(awal)
  await page.getByRole('button', { name: 'Kunci tebakan, lanjutkan video' }).click()
  await expect(page.locator('[data-molecule="co2"]')).toHaveCount(2)
  await page.getByRole('button', { name: 'Jeda (spasi)' }).click()
  const posisi = await page
    .locator('[data-molecule="co2"]')
    .evaluateAll((ns) => ns.map((n) => n.getAttribute('transform')))
  await page.waitForTimeout(180)
  expect(
    await page
      .locator('[data-molecule="co2"]')
      .evaluateAll((ns) => ns.map((n) => n.getAttribute('transform'))),
  ).toEqual(posisi)
  await page.screenshot({ path: info.outputPath('karbon-dijeda.png') })
  await page.goto('/#/peta-materi')
  await expect(page.locator('[data-molecule="co2"]')).toHaveCount(0)
  const data = await page.evaluate(
    () => JSON.parse(localStorage.getItem('metalab-jawaban-e2')!).state,
  )
  expect(data.hasil).toBeNull()
  expect(data.draf.poe.c).toBeUndefined()
})

test('awal E2 tetap berilustrasi: enam karbon, konteks aerob, narasi baru dan tiga tahap', async ({
  page,
}, info) => {
  test.skip(info.project.name === 'hp-tegak', 'Adegan dimainkan miring')
  test.setTimeout(60000)
  const gagal: string[] = []
  page.on('response', (r) => {
    if (r.status() >= 400) gagal.push(r.url())
  })
  await page.addInitScript(() => {
    const w = window as unknown as { jumlahBunyi: number }
    w.jumlahBunyi = 0
    const start = AudioBufferSourceNode.prototype.start
    AudioBufferSourceNode.prototype.start = function (...args) {
      if (this.buffer && this.buffer.length > 1) w.jumlahBunyi++
      return start.apply(this, args)
    }
  })
  await siapkan(page)
  await page.goto('/#/episode/2?cepat')
  await page.getByRole('button', { name: 'Mulai episode' }).click()
  await page.getByRole('button', { name: 'Asam piruvat (3 C)', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Ada oksigen (aerob)', exact: true })).toBeVisible({
    timeout: 20000,
  })
  await expect(page.locator('[data-carbon]')).toHaveCount(6)
  await expect(page.locator('[data-oxygen]')).toHaveCount(4)
  await expect(page.locator('[data-objek="konteks-aerob"]')).toContainText(
    'Piruvat → asetil KoA belum memakai O₂.',
  )
  await expect(page.locator('[data-objek="jumlah-piruvat"]')).toContainText('2 piruvat · 6 C')
  const ukur = async (nama: string) => {
    await page.screenshot({ path: info.outputPath(`${nama}-aerob.png`) })
    const bagian = [
      '[data-objek="konteks-aerob"]',
      '[data-objek="jumlah-piruvat"]',
      '[data-molecule="asetil"]',
      '[data-molecule="karboksil"]',
    ]
    const viewport = page.viewportSize()!
    const penghalang = await Promise.all(
      (
        await page
          .locator('.pemutar-soal, .pemutar-panduan, .pemutar-gelembung:not([hidden])')
          .all()
      ).map((e) => e.boundingBox()),
    )
    for (const selector of bagian)
      for (const e of await page.locator(selector).all()) {
        const a = (await e.boundingBox())!
        expect(a.x, nama).toBeGreaterThanOrEqual(0)
        expect(a.y, nama).toBeGreaterThanOrEqual(0)
        expect(a.x + a.width, nama).toBeLessThanOrEqual(viewport.width + 1)
        expect(a.y + a.height, nama).toBeLessThanOrEqual(viewport.height + 1)
        for (const b of penghalang)
          if (b)
            expect(
              a.x + a.width <= b.x ||
                b.x + b.width <= a.x ||
                a.y + a.height <= b.y ||
                b.y + b.height <= a.y,
              `${nama}: ${selector} ${JSON.stringify(a)} bertemu ${JSON.stringify(b)}`,
            ).toBe(true)
      }
    await page.screenshot({ path: info.outputPath(`${nama}-aerob.png`) })
  }
  await ukur(info.project.name)
  if (info.project.name === 'desktop') {
    await page.setViewportSize({ width: 667, height: 375 })
    await ukur('667')
    await page.setViewportSize({ width: 1440, height: 900 })
  }
  await page.getByRole('button', { name: 'Ada oksigen (aerob)', exact: true }).click()
  await expect(page.getByRole('button', { name: '3 tahap', exact: true })).toBeVisible({
    timeout: 15000,
  })
  await expect(page.locator('[data-gelembung]')).toContainText('Ada berapa tahap utama')
  await expect(page.locator('[data-carbon]')).toHaveCount(6)
  await page.getByRole('button', { name: 'Jeda (spasi)' }).click()
  await page.screenshot({ path: info.outputPath('pertanyaan-tahap.png') })
  await page.getByRole('button', { name: 'Lanjut (spasi)' }).click()
  if (info.project.name === 'desktop')
    await page.evaluate(async () => {
      const { usePengaturan } = await import('/src/' + 'stores/pengaturan.ts')
      usePengaturan.setState({ suaraAktif: true, efek: true, musik: false, narasi: false })
    })
  await page.getByRole('button', { name: '3 tahap', exact: true }).click()
  await expect(page.locator('[data-ikhtisar-tahap]')).toHaveCount(3)
  await expect(page.locator('[data-ikhtisar-tahap="3"]')).toHaveCSS('opacity', '1')
  await expect(page.locator('[data-carbon]')).toHaveCount(6)
  await page.getByRole('button', { name: 'Jeda (spasi)' }).click()
  await expect(page.locator('[data-gelembung]')).toContainText('Tiga tahap utama')
  if (info.project.name === 'desktop') {
    await expect
      .poll(() => page.evaluate(() => (window as unknown as { jumlahBunyi: number }).jumlahBunyi))
      .toBe(4)
    await page.setViewportSize({ width: 667, height: 375 })
    await page.screenshot({ path: info.outputPath('667-tiga-tahap.png') })
    await page.setViewportSize({ width: 1440, height: 900 })
  }
  await page.screenshot({ path: info.outputPath('ikhtisar-tiga-tahap.png') })
  await page.getByRole('button', { name: 'Lanjut (spasi)' }).click()
  await expect(page.locator('#poe-tebak-judul')).toHaveText(POE.c.judul, { timeout: 15000 })
  await expect(page.locator('[data-ikhtisar-tahap]')).toHaveCount(0)
  expect(gagal).toEqual([])
  await expect(page.locator('[data-carbon]')).toHaveCount(6)
})
