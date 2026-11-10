import { expect, test, type Page } from '@playwright/test'
import {
  JAWABAN,
  POE,
  RUMPANG,
  TABEL,
  type PoeE4,
} from '../../src/episodes/episode-4-transpor-elektron/isi.js'

async function mulai(page: Page, cepat = true) {
  await page.addInitScript(() => {
    if (sessionStorage.getItem('e4-siap')) return
    sessionStorage.setItem('e4-siap', '1')
    localStorage.setItem(
      'metalab-pengaturan',
      JSON.stringify({ state: { suaraAktif: false }, version: 0 }),
    )
    for (const k of [
      'metalab-jawaban',
      'metalab-jawaban-e0',
      'metalab-jawaban-e2',
      'metalab-jawaban-e3',
    ])
      localStorage.setItem(k, 'data lama')
  })
  await page.goto(`/#/episode/4${cepat ? '?cepat' : ''}`)
  await page.getByRole('button', { name: 'Mulai episode' }).click()
  await page.getByRole('button', { name: '2 ATP · glikolisis', exact: true }).click()
  await expect(page.locator('[data-gelembung]')).toContainText('ATP bukan pembawa')
  for (const teks of [
    '2 NADH · glikolisis',
    '2 NADH · dekarboksilasi',
    '6 NADH · Krebs',
    '2 FADH₂ · Krebs',
  ])
    await page.getByRole('button', { name: teks, exact: true }).click()
  await page.getByRole('button', { name: 'Kompleks II', exact: true }).click()
  await expect(page.locator('[data-gelembung]')).toContainText(
    'Kompleks II menerima elektron FADH₂',
  )
  await page.getByRole('button', { name: 'Kompleks I', exact: true }).click()
}
async function tebak(page: Page, k: PoeE4, i: number, drag = false) {
  await expect(page.locator('#poe-tebak-judul')).toHaveText(POE[k].judul, { timeout: 30000 })
  if (k === 'c') {
    const sasaran = page.getByRole('button', { name: `Pilih ${POE.c.zat[i]}`, exact: true })
    const b = (await sasaran.boundingBox())!
    expect(b.width).toBeGreaterThanOrEqual(44)
    expect(b.height).toBeGreaterThanOrEqual(44)
    if (drag) {
      const a = (await page.getByRole('button', { name: 'Seret FADH₂ ke kompleks' }).boundingBox())!
      await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2)
      await page.mouse.down()
      await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 8 })
      await page.mouse.up()
    } else {
      await sasaran.focus()
      await page.keyboard.press('Enter')
    }
  } else {
    const token = page.getByRole('button', { name: POE.h.zat[i], exact: true })
    await token.focus()
    await page.keyboard.press('Enter')
  }
  await expect(page.locator('#cnt')).toHaveText(POE[k].zat[i])
  await page.getByRole('button', { name: POE[k].alasan[0], exact: true }).click()
  await page.getByRole('button', { name: 'Kunci tebakan, lanjutkan video' }).click()
}
async function jelaskan(page: Page, k: PoeE4) {
  await expect(page.locator('#poe-explain-judul')).toBeVisible({ timeout: 30000 })
  await page.getByRole('button', { name: POE[k].alasan[2], exact: true }).click()
  await expect(page.getByRole('button', { name: 'Lanjutkan video', exact: true })).toHaveCount(0)
  await page.getByRole('button', { name: POE[k].alasan[1], exact: true }).click()
  await page.getByRole('button', { name: 'Lanjutkan video', exact: true }).click()
}
async function airDanAtp(page: Page) {
  await page.getByRole('button', { name: 'CO₂', exact: true }).click()
  await expect(page.locator('[data-gelembung]')).toContainText('menjadi air')
  await page.getByRole('button', { name: 'H₂O', exact: true }).click()
  await page.getByRole('button', { name: 'ATP sintase', exact: true }).click({ timeout: 60000 })
}

test('E4 lengkap: jalur, pompa, komik, dua POE, tabel, hasil/cetak, reload dan replay', async ({
  page,
}, info) => {
  test.skip(info.project.name === 'hp-tegak', 'Episode memakai layar miring')
  test.setTimeout(180000)
  const galat: string[] = []
  page.on('pageerror', (e) => galat.push(e.message))
  page.on('response', (r) => {
    if (r.status() === 404) galat.push(r.url())
  })
  await page.addInitScript(() => {
    const w = window as unknown as { jejakE4: string[] }
    w.jejakE4 = []
    new MutationObserver(() => {
      const g = document.querySelector('[data-kompleks-aktif]')
      if (g)
        w.jejakE4.push(`${g.getAttribute('data-jalur')}:${g.getAttribute('data-kompleks-aktif')}`)
      for (const e of document.querySelectorAll('[data-effect]'))
        w.jejakE4.push(e.getAttribute('data-word') || e.getAttribute('data-effect')!)
    }).observe(document, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['data-kompleks-aktif'],
    })
  })
  await mulai(page)
  await expect(page.locator('#poe-tebak-judul')).toBeVisible({ timeout: 30000 })
  await expect(page.locator('[data-pompa="I"]')).toHaveCount(1)
  await expect(page.locator('[data-pompa="II"]')).toHaveCount(0)
  const target = (await page
    .getByRole('button', { name: 'Pilih Kompleks II', exact: true })
    .boundingBox())!
  const gambar = (await page.locator('[data-kompleks="II"]').boundingBox())!
  expect(Math.abs(target.y + target.height / 2 - gambar.y - gambar.height / 2)).toBeLessThan(2)
  await page.screenshot({ path: info.outputPath('kompleks-tebak.png') })
  await tebak(page, 'c', 1, true)
  await expect(page.locator('#poe-explain-judul')).toBeVisible({ timeout: 30000 })
  await expect(page.locator('[data-pompa="II"]')).toHaveCount(0)
  await expect(page.locator('[data-proton]')).toHaveCount(5)
  await page.screenshot({ path: info.outputPath('jalur-jelaskan.png') })
  await jelaskan(page, 'c')
  await airDanAtp(page)
  await tebak(page, 'h', 2)
  await expect(page.locator('#poe-explain-judul')).toBeVisible({ timeout: 30000 })
  await expect(page.locator('[data-objek="total-atp"]')).toContainText('34 ATP')
  await page.screenshot({ path: info.outputPath('hitung-atp.png') })
  await jelaskan(page, 'h')
  for (const r of RUMPANG)
    await page.getByRole('button', { name: r.opsi[r.benar], exact: true }).click()
  for (const row of TABEL) {
    for (const benar of row.sel)
      await page.getByRole('button', { name: benar, exact: true }).click()
  }
  await expect(page).toHaveURL(/#\/episode\/4\/hasil$/, { timeout: 20000 })
  await expect(page.getByRole('heading', { name: 'Rantai elektronmu' })).toBeVisible()
  const baca = () => page.evaluate(() => localStorage.getItem('metalab-jawaban-e4'))
  const data = JSON.parse((await baca())!).state
  expect(data.hasil.jawaban).toEqual(JAWABAN)
  expect(data.hasil.poe.c).toEqual({ tebakan: 1, alasan: 0, penjelasan: 2 })
  expect(data.hasil.poe.h).toEqual({ tebakan: 2, alasan: 0, penjelasan: 2 })
  const jejak = await page.evaluate(() => (window as unknown as { jejakE4: string[] }).jejakE4)
  for (const k of [
    'NADH:I',
    'NADH:III',
    'NADH:IV',
    'FADH2:II',
    'FADH2:III',
    'FADH2:IV',
    'LEPAS!',
    'POP!',
    'KLIK!',
  ])
    expect(jejak).toContain(k)
  expect(jejak).not.toContain('NADH:II')
  await page
    .getByRole('textbox')
    .fill('FADH₂ melewati dua pemompa. Total transpor elektron 34 ATP.')
  await page.getByRole('button', { name: 'Simpan penjelasan' }).click()
  await page.reload()
  await expect(page.getByRole('textbox')).toHaveValue(
    'FADH₂ melewati dua pemompa. Total transpor elektron 34 ATP.',
  )
  const sebelum = await baca()
  await page.setViewportSize({ width: 360, height: 800 })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.screenshot({ path: info.outputPath('hasil-tegak.png'), fullPage: true })
  await page.emulateMedia({ media: 'print' })
  await expect(page.locator('.hasil-cetak')).toContainText('Aktivitas 1.10–1.11')
  await expect(page.locator('.hasil-cetak')).toContainText('34 ATP')
  await expect(page.locator('.hasil-cetak .e4-tabel')).toHaveCount(1)
  await page.emulateMedia({ media: 'screen' })
  await page.setViewportSize(info.project.use.viewport!)
  await page.evaluate(async () => {
    const { kendali } = await import('/src/' + 'features/pemutar-episode/mesin.ts')
    kendali.cepat = 0.08
  })
  await page.getByRole('button', { name: 'Putar ulang tanpa jeda' }).click()
  await expect(page).toHaveURL(/#\/episode\/4\/hasil$/, { timeout: 60000 })
  expect(await baca()).toEqual(sebelum)
  for (const k of [
    'metalab-jawaban',
    'metalab-jawaban-e0',
    'metalab-jawaban-e2',
    'metalab-jawaban-e3',
  ])
    expect(await page.evaluate((k) => localStorage.getItem(k), k)).toBe('data lama')
  expect(galat).toEqual([])
})

test('E4 hasil kosong, orientasi dan tautan peta', async ({ page }, info) => {
  await page.goto('/#/episode/4/hasil')
  await expect(page).toHaveURL(/#\/episode\/4$/)
  if (info.project.name === 'hp-tegak')
    await expect(page.getByRole('heading', { name: 'Putar HP-mu' })).toBeVisible()
  else await expect(page.getByRole('button', { name: 'Mulai episode' })).toBeVisible()
  await page.goto('/#/peta-materi')
  await page.getByRole('button', { name: 'Respirasi Aerob', exact: true }).click()
  await page.getByRole('link', { name: 'Buka Transpor Elektron' }).click()
  await expect(page).toHaveURL(/#\/episode\/4$/)
})

for (const [c, h] of [
  [0, 0],
  [2, 1],
]) {
  test(`E4 POE alternatif ${c}/${h}, 667px dan jeda/abort`, async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop', 'Viewport tambahan')
    test.setTimeout(90000)
    await page.setViewportSize({ width: 667, height: 375 })
    if (c === 0) await page.emulateMedia({ reducedMotion: 'reduce' })
    await mulai(page)
    await tebak(page, 'c', c)
    await jelaskan(page, 'c')
    await airDanAtp(page)
    await tebak(page, 'h', h)
    await expect(page.locator('#poe-explain-judul')).toBeVisible({ timeout: 30000 })
    await page.screenshot({ path: info.outputPath('667-hitung.png') })
    await page.getByRole('button', { name: 'Jeda (spasi)' }).click()
    await expect(page.getByRole('button', { name: POE.h.alasan[1], exact: true })).toBeDisabled()
    await page.getByRole('button', { name: 'Lanjut (spasi)' }).click()
    if (c === 0) {
      await expect(page.locator('.pemutar')).toHaveAttribute('data-tenang')
      await expect(page.locator('[data-effect]')).toHaveCount(0)
    }
    await page.goto('/#/peta-materi')
    const data = await page.evaluate(
      () => JSON.parse(localStorage.getItem('metalab-jawaban-e4')!).state,
    )
    expect(data.hasil).toBeNull()
    expect(data.draf.poe.h).toBeUndefined()
    expect(data.draf.poe.c.tebakan).toBe(c)
  })
}

test('E4 tempo normal: reaksi air/ATP, jeda gerak, efek off/on dan abort', async ({
  page,
}, info) => {
  test.skip(info.project.name !== 'desktop', 'Audit tempo dan suara')
  test.setTimeout(240000)
  await page.addInitScript(() => {
    const w = window as unknown as { bunyiE4: number }
    w.bunyiE4 = 0
    const start = AudioBufferSourceNode.prototype.start
    AudioBufferSourceNode.prototype.start = function (...args) {
      if (this.buffer && this.buffer.length > 1) w.bunyiE4++
      return start.apply(this, args)
    }
  })
  await mulai(page, false)
  await expect(page.locator('[data-pompa="I"]')).toBeVisible({ timeout: 20000 })
  await page.getByRole('button', { name: 'Jeda (spasi)' }).click()
  const h = page.locator('[data-pompa="I"]')
  const tetap = await h.getAttribute('transform')
  await page.waitForTimeout(300)
  expect(await h.getAttribute('transform')).toBe(tetap)
  await page.screenshot({ path: info.outputPath('normal-pompa-jeda.png') })
  await page.getByRole('button', { name: 'Lanjut (spasi)' }).click()
  await expect.poll(() => h.getAttribute('transform')).not.toBe(tetap)
  await expect(page.locator('#poe-tebak-judul')).toBeVisible({ timeout: 45000 })
  await page.evaluate(async () => {
    const { usePengaturan } = await import('/src/' + 'stores/pengaturan.ts')
    usePengaturan.setState({ suaraAktif: true, efek: false, musik: false, narasi: false })
  })
  const bunyi = () => page.evaluate(() => (window as unknown as { bunyiE4: number }).bunyiE4)
  const awal = await bunyi()
  await page.getByRole('button', { name: POE.c.alasan[0], exact: true }).click()
  expect(await bunyi()).toBe(awal)
  await page.evaluate(async () => {
    const { usePengaturan } = await import('/src/' + 'stores/pengaturan.ts')
    usePengaturan.setState({ efek: true })
  })
  await page.getByRole('button', { name: POE.c.alasan[1], exact: true }).click()
  await expect.poll(bunyi).toBeGreaterThan(awal)
  await tebak(page, 'c', 1)
  await jelaskan(page, 'c')
  await page.getByRole('button', { name: 'H₂O', exact: true }).click({ timeout: 30000 })
  await expect(page.locator('[data-objek="air-terbentuk"]')).toHaveCount(2, { timeout: 10000 })
  await page.screenshot({ path: info.outputPath('normal-air.png') })
  await page.getByRole('button', { name: 'ATP sintase', exact: true }).click({ timeout: 60000 })
  await expect(page.locator('[data-objek="atp-terbentuk"]')).toBeVisible({ timeout: 15000 })
  await page.getByRole('button', { name: 'Jeda (spasi)' }).click()
  await page.screenshot({ path: info.outputPath('normal-atp.png') })
  await page.goto('/#/peta-materi')
  await expect(page.locator('[data-proton], [data-elektron]')).toHaveCount(0)
  const data = await page.evaluate(
    () => JSON.parse(localStorage.getItem('metalab-jawaban-e4')!).state,
  )
  expect(data.hasil).toBeNull()
})
