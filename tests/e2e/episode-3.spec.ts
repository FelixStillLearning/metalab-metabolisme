import { expect, test, type Page } from '@playwright/test'
import { JAWABAN, POE, RUMPANG, ZAT, type PoeE3 } from '../../src/episodes/episode-3-krebs/isi.js'

async function mulai(page: Page) {
  await page.addInitScript(() => {
    if (sessionStorage.getItem('e3-siap')) return
    sessionStorage.setItem('e3-siap', '1')
    localStorage.setItem(
      'metalab-pengaturan',
      JSON.stringify({ state: { suaraAktif: false }, version: 0 }),
    )
    for (const key of ['metalab-jawaban', 'metalab-jawaban-e0', 'metalab-jawaban-e2'])
      localStorage.setItem(key, 'data lama')
  })
  await page.goto('/#/episode/3?cepat')
  await page.getByRole('button', { name: 'Mulai episode' }).click()
  await page.getByRole('button', { name: 'Asetil KoA (2 C)', exact: true }).click()
  await page.getByRole('button', { name: 'Oksaloasetat (4 C)', exact: true }).click()
  await page.getByRole('button', { name: '8 tahap', exact: true }).click()
}
async function tebak(page: Page, k: PoeE3, i: number, drag = false) {
  await expect(page.locator('#poe-tebak-judul')).toHaveText(POE[k].judul, { timeout: 20000 })
  const token = page.getByRole('button', { name: POE[k].zat[i], exact: true })
  if (drag) {
    const a = (await token.boundingBox())!,
      b = (await page.locator('.poe-zone').boundingBox())!
    await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2)
    await page.mouse.down()
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 8 })
    await page.mouse.up()
  } else {
    await token.focus()
    await page.keyboard.press('Enter')
  }
  await expect(page.locator('#cnt')).toHaveText(POE[k].zat[i])
  await page.getByRole('button', { name: POE[k].alasan[0], exact: true }).click()
  await page.getByRole('button', { name: 'Kunci tebakan, lanjutkan video' }).click()
}
async function jelaskan(page: Page, k: PoeE3) {
  await expect(page.locator('#poe-explain-judul')).toBeVisible({ timeout: 30000 })
  // Pilihan pertama di Jelaskan tetap direkam walau kemudian diperbaiki.
  await page.getByRole('button', { name: POE[k].alasan[2], exact: true }).click()
  await expect(page.getByRole('button', { name: 'Lanjutkan video', exact: true })).toHaveCount(0)
  await page.getByRole('button', { name: POE[k].alasan[1], exact: true }).click()
  await page.getByRole('button', { name: 'Lanjutkan video', exact: true }).click()
}
async function tempatkan(page: Page) {
  for (const z of ZAT) {
    await page.getByRole('button', { name: `Tempatkan ${z.nama}`, exact: true }).click()
    const salah = [1, 2, 3, 4, 5, 6, 7, 8].find((n) => !(z.tahap as readonly number[]).includes(n))!
    await page.getByRole('button', { name: `${z.nama} ke tahap ${salah}`, exact: true }).click()
    await expect(page.locator('[data-gelembung]')).toContainText(z.pesan)
    for (const n of z.tahap) {
      const b = page.getByRole('button', { name: `${z.nama} ke tahap ${n}`, exact: true })
      const r = (await b.boundingBox())!
      expect(r.height).toBeGreaterThanOrEqual(44)
      expect(r.width).toBeGreaterThanOrEqual(44)
      await b.focus()
      await page.keyboard.press('Enter')
    }
  }
}

test('E3 lengkap: delapan tahap, dua POE, zat, hasil/cetak dan replay terpisah', async ({
  page,
}, info) => {
  test.skip(info.project.name === 'hp-tegak', 'Episode memakai layar miring')
  test.setTimeout(150000)
  const galat: string[] = []
  page.on('pageerror', (e) => galat.push(e.message))
  page.on('response', (r) => {
    if (r.status() === 404) galat.push(r.url())
  })
  await mulai(page)
  await expect(page.locator('#poe-tebak-judul')).toHaveText(POE['i·1'].judul, { timeout: 20000 })
  const angkaC = (await page.locator('[data-molecule="Sitrat"] text').last().boundingBox())!
  const zona = (await page.locator('.poe-zone').boundingBox())!
  expect(angkaC.y + angkaC.height).toBeLessThan(zona.y + zona.height - 8)
  await page.screenshot({ path: info.outputPath('tebak-karbon.png') })
  await page.evaluate(() => {
    const w = window as unknown as { jejak: { tahap: string; karbon: number; total: number }[] }
    w.jejak = []
    new MutationObserver(() => {
      const g = document.querySelector('[data-molecule][data-karbon]')
      if (g)
        w.jejak.push({
          tahap: g.getAttribute('data-tahap')!,
          karbon: g.querySelectorAll('[data-carbon]').length,
          total: document.querySelectorAll('[data-carbon]').length,
        })
    }).observe(
      document.querySelector('.pemutar-world') || document.querySelector('.pemutar svg')!,
      { subtree: true, attributes: true, childList: true },
    )
  })
  await tebak(page, 'i·1', 0)
  await expect(page.locator('#poe-explain-judul')).toBeVisible({ timeout: 30000 })
  await expect(page.locator('[data-molecule="Oksaloasetat"] [data-carbon]')).toHaveCount(4)
  await expect(page.locator('[data-molecule="co2"]')).toHaveCount(2)
  await expect(page.locator('[data-carbon]')).toHaveCount(6)
  const jejak = await page.evaluate(
    () =>
      (window as unknown as { jejak: { tahap: string; karbon: number; total: number }[] }).jejak,
  )
  for (const [i, n] of [6, 6, 5, 4, 4, 4, 4, 4].entries())
    expect(jejak).toContainEqual({ tahap: String(i + 1), karbon: n, total: 6 })
  await page.screenshot({ path: info.outputPath('oksaloasetat-kembali.png') })
  await jelaskan(page, 'i·1')
  await tempatkan(page)
  await expect(page.locator('#poe-tebak-judul')).toHaveText(POE['i·2'].judul)
  const penanda = page.locator('[data-penanda-tahap]')
  await expect(penanda).toHaveCount(7)
  const rodaBox = (await page.locator('[data-objek="roda-krebs"]').boundingBox())!
  for (const marker of await penanda.all()) {
    const box = (await marker.boundingBox())!
    const cx = rodaBox.x + rodaBox.width / 2
    const cy = rodaBox.y + rodaBox.height / 2
    expect(Math.abs(box.x + box.width / 2 - cx) + box.width / 2).toBeLessThan(rodaBox.width * 0.28)
    expect(Math.abs(box.y + box.height / 2 - cy) + box.height / 2).toBeLessThan(
      rodaBox.height * 0.28,
    )
  }
  await page.screenshot({ path: info.outputPath('penanda-tahap.png') })
  await tebak(page, 'i·2', 2, true)
  await expect(page.locator('[data-putaran="1"]')).toContainText('3 NADH', { timeout: 15000 })
  await expect(page.locator('[data-putaran="2"]')).toContainText('6 NADH', { timeout: 15000 })
  const judulPanen = (await page.locator('[data-objek="judul-panen"]').boundingBox())!
  const nomorPutaran = (await page.locator('[data-objek="putaran-panen"]').boundingBox())!
  expect(judulPanen.y + judulPanen.height).toBeLessThan(nomorPutaran.y)
  await page.screenshot({ path: info.outputPath('panen-dua-putaran.png') })
  await expect(page.locator('#poe-explain-judul')).toBeVisible({ timeout: 15000 })
  await page.screenshot({ path: info.outputPath('dua-putaran.png') })
  await jelaskan(page, 'i·2')
  for (const r of RUMPANG)
    await page.getByRole('button', { name: r.opsi[r.benar], exact: true }).click()
  await expect(page).toHaveURL(/#\/episode\/3\/hasil$/, { timeout: 20000 })
  await expect(page.getByRole('heading', { name: 'Roda siklus Krebsmu' })).toBeVisible()
  const baca = () => page.evaluate(() => localStorage.getItem('metalab-jawaban-e3'))
  const data = JSON.parse((await baca())!).state
  expect(data.hasil.jawaban).toEqual(JAWABAN)
  expect(data.hasil.poe['i·1']).toEqual({ tebakan: 0, alasan: 0, penjelasan: 2 })
  expect(data.hasil.poe['i·2']).toEqual({ tebakan: 2, alasan: 0, penjelasan: 2 })
  await page.getByRole('textbox').fill('Dua asetil KoA, dua putaran. OAA terbentuk kembali.')
  await page.getByRole('button', { name: 'Simpan penjelasan' }).click()
  await page.reload()
  await expect(page.getByRole('textbox')).toHaveValue(
    'Dua asetil KoA, dua putaran. OAA terbentuk kembali.',
  )
  const sebelum = await baca()
  await page.screenshot({ path: info.outputPath('hasil.png'), fullPage: true })
  await page.setViewportSize({ width: 360, height: 800 })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.screenshot({ path: info.outputPath('hasil-tegak.png'), fullPage: true })
  await page.emulateMedia({ media: 'print' })
  await expect(page.locator('.hasil-cetak')).toContainText('Aktivitas 1.9')
  await expect(page.locator('.hasil-cetak')).toContainText('Dua asetil KoA, dua putaran.')
  await expect(page.locator('.hasil-cetak')).not.toContainText('1.9 h')
  await page.emulateMedia({ media: 'screen' })
  await page.setViewportSize(info.project.use.viewport!)
  await page.evaluate(async () => {
    const { kendali } = await import('/src/' + 'features/pemutar-episode/mesin.ts')
    kendali.cepat = 0.12
  })
  await page.getByRole('button', { name: 'Putar ulang tanpa jeda' }).click()
  await expect(page).toHaveURL(/#\/episode\/3\/hasil$/, { timeout: 60000 })
  expect(await baca()).toEqual(sebelum)
  for (const key of ['metalab-jawaban', 'metalab-jawaban-e0', 'metalab-jawaban-e2'])
    expect(await page.evaluate((k) => localStorage.getItem(k), key)).toBe('data lama')
  expect(galat).toEqual([])
})

test('E3 hasil kosong, orientasi dan navigasi dari peta', async ({ page }, info) => {
  await page.goto('/#/episode/3/hasil')
  await expect(page).toHaveURL(/#\/episode\/3$/)
  if (info.project.name === 'hp-tegak')
    await expect(page.getByRole('heading', { name: 'Putar HP-mu' })).toBeVisible()
  else await expect(page.getByRole('button', { name: 'Mulai episode' })).toBeVisible()
  await page.goto('/#/peta-materi')
  await page.getByRole('button', { name: 'Respirasi Aerob', exact: true }).click()
  await page.getByRole('link', { name: 'Buka Siklus Krebs' }).click()
  await expect(page).toHaveURL(/#\/episode\/3$/)
})

for (const [karbon, putaran] of [
  [1, 0],
  [2, 1],
]) {
  test(`E3 POE alternatif ${karbon}/${putaran}, 667px dan mode tenang`, async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop', 'Viewport tambahan')
    test.setTimeout(60000)
    await page.setViewportSize({ width: 667, height: 375 })
    if (karbon === 1) await page.emulateMedia({ reducedMotion: 'reduce' })
    await mulai(page)
    await expect(page.locator('#poe-tebak-judul')).toBeVisible({ timeout: 15000 })
    const card = (await page.locator('.poe-card').boundingBox())!
    for (const token of await page.locator('.tok').all()) {
      const b = (await token.boundingBox())!
      expect(b.height).toBeGreaterThanOrEqual(44)
      expect(b.x + b.width).toBeLessThanOrEqual(card.x)
    }
    await page.screenshot({ path: info.outputPath('667-tebak.png') })
    await tebak(page, 'i·1', karbon, true)
    await expect(page.locator('#poe-explain-judul')).toBeVisible({ timeout: 25000 })
    const molekul = (await page.locator('[data-molecule="Oksaloasetat"]').boundingBox())!
    const kartu = (await page.locator('.poe-card-explain').boundingBox())!
    expect(molekul.x + molekul.width).toBeLessThan(kartu.x)
    await page.screenshot({ path: info.outputPath('667-oksaloasetat.png') })
    await jelaskan(page, 'i·1')
    await page.getByRole('button', { name: 'Tempatkan H₂O', exact: true }).click()
    for (const b of await page.getByRole('button', { name: /H₂O ke tahap/ }).all()) {
      const r = (await b.boundingBox())!
      expect(r.height).toBeGreaterThanOrEqual(44)
      expect(r.y).toBeGreaterThanOrEqual(84)
      expect(r.y + r.height).toBeLessThanOrEqual(325)
    }
    await page.screenshot({ path: info.outputPath('667-penempatan.png') })
    for (const n of [1, 7])
      await page.getByRole('button', { name: `H₂O ke tahap ${n}`, exact: true }).click()
    for (const z of ZAT.slice(1)) {
      await page.getByRole('button', { name: `Tempatkan ${z.nama}`, exact: true }).click()
      for (const n of z.tahap)
        await page.getByRole('button', { name: `${z.nama} ke tahap ${n}`, exact: true }).click()
    }
    await tebak(page, 'i·2', putaran)
    await jelaskan(page, 'i·2')
    if (karbon === 1) {
      await expect(page.locator('.pemutar')).toHaveAttribute('data-tenang')
      await expect(page.locator('[data-effect]')).toHaveCount(0)
    }
    await page.goto('/#/peta-materi')
  })
}

test('E3 jeda/lanjut, abort dan efek suara mengikuti pengaturan', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'Jejak animasi dan audio')
  test.setTimeout(60000)
  await page.addInitScript(() => {
    const w = window as unknown as { bunyiE3: number }
    w.bunyiE3 = 0
    const start = AudioBufferSourceNode.prototype.start
    AudioBufferSourceNode.prototype.start = function (...args) {
      if (this.buffer && this.buffer.length > 1) w.bunyiE3++
      return start.apply(this, args)
    }
  })
  await mulai(page)
  await expect(page.locator('#poe-tebak-judul')).toBeVisible({ timeout: 15000 })
  await page.evaluate(async () => {
    const { usePengaturan } = await import('/src/' + 'stores/pengaturan.ts')
    usePengaturan.setState({ suaraAktif: true, efek: false, musik: false, narasi: false })
  })
  const hitung = () => page.evaluate(() => (window as unknown as { bunyiE3: number }).bunyiE3)
  const awal = await hitung()
  await page.getByRole('button', { name: 'Tidak ada', exact: true }).click()
  await page.getByRole('button', { name: POE['i·1'].alasan[0], exact: true }).click()
  expect(await hitung()).toBe(awal)
  await page.evaluate(async () => {
    const { usePengaturan } = await import('/src/' + 'stores/pengaturan.ts')
    usePengaturan.setState({ efek: true })
    const { kendali } = await import('/src/' + 'features/pemutar-episode/mesin.ts')
    kendali.cepat = 0.4
  })
  await page.getByRole('button', { name: POE['i·1'].alasan[1], exact: true }).click()
  await expect.poll(hitung).toBeGreaterThan(awal)
  await page.getByRole('button', { name: 'Kunci tebakan, lanjutkan video' }).click()
  await expect(page.locator('[data-molecule="co2"]')).toHaveCount(1, { timeout: 15000 })
  await page.getByRole('button', { name: 'Jeda (spasi)' }).click()
  const c = page.locator('[data-molecule="co2"]').first()
  const tetap = await c.getAttribute('transform')
  await page.waitForTimeout(200)
  expect(await c.getAttribute('transform')).toBe(tetap)
  await page.screenshot({ path: info.outputPath('jeda-karbon.png') })
  await page.getByRole('button', { name: 'Lanjut (spasi)' }).click()
  await expect.poll(() => c.getAttribute('transform')).not.toBe(tetap)
  await page.goto('/#/peta-materi')
  await expect(page.locator('[data-molecule="co2"]')).toHaveCount(0)
  const data = await page.evaluate(
    () => JSON.parse(localStorage.getItem('metalab-jawaban-e3')!).state,
  )
  expect(data.hasil).toBeNull()
  expect(data.draf.poe['i·1']).toBeUndefined()
})

test('E3 komik: enam atom yang sama bergabung, model tetap terlihat dan CO₂ terlepas', async ({
  page,
}, info) => {
  test.skip(info.project.name === 'hp-tegak', 'Episode layar miring')
  test.setTimeout(60000)
  await page.addInitScript(() =>
    localStorage.setItem(
      'metalab-pengaturan',
      JSON.stringify({ state: { suaraAktif: false }, version: 0 }),
    ),
  )
  await page.goto('/#/episode/3?cepat')
  await page.getByRole('button', { name: 'Mulai episode' }).click()
  await page.getByRole('button', { name: 'Asetil KoA (2 C)', exact: true }).click()
  await page.evaluate(() => {
    const w = window as unknown as { sumberC: Element[] }
    w.sumberC = []
    new MutationObserver(() => {
      if (w.sumberC.length) return
      const a = document.querySelector('[data-objek="asetil-bergabung"]')
      const b = document.querySelector('[data-objek="oksaloasetat-bergabung"]')
      if (a && b)
        w.sumberC = [...a.querySelectorAll('[data-carbon]'), ...b.querySelectorAll('[data-carbon]')]
    }).observe(document.querySelector('.pemutar svg')!, {
      subtree: true,
      childList: true,
      attributes: true,
    })
  })
  await page.getByRole('button', { name: 'Oksaloasetat (4 C)', exact: true }).click()
  await expect(page.getByRole('button', { name: '8 tahap', exact: true })).toBeVisible({
    timeout: 15000,
  })
  expect(
    await page.evaluate(() => {
      const w = window as unknown as { sumberC: Element[] }
      const sekarang = [
        ...document.querySelectorAll('[data-objek="sitrat-ikhtisar"] [data-carbon]'),
      ]
      return (
        w.sumberC.length === 6 &&
        sekarang.length === 6 &&
        sekarang.every((c) => w.sumberC.includes(c))
      )
    }),
  ).toBe(true)
  const m = (await page.locator('[data-objek="sitrat-ikhtisar"]').boundingBox())!
  const q = (await page.locator('.pemutar-soal').boundingBox())!
  expect(m.x + m.width).toBeLessThan(q.x)
  await page.screenshot({ path: info.outputPath('komik-gabung-enam-c.png') })
  await page.getByRole('button', { name: '8 tahap', exact: true }).click()
  await expect(page.locator('#poe-tebak-judul')).toHaveText(POE['i·1'].judul, { timeout: 15000 })
  await expect(page.locator('[data-carbon]')).toHaveCount(6)
  await tebak(page, 'i·1', 1)
  await expect(page.locator('[data-gelembung]')).toContainText('Tahap 3.', { timeout: 15000 })
  await page.getByRole('button', { name: 'Jeda (spasi)' }).click()
  await expect(page.locator('[data-molecule="α-ketoglutarat"] [data-carbon]')).toHaveCount(5)
  await expect(page.locator('[data-molecule="co2"] [data-carbon]')).toHaveCount(1)
  await expect(page.locator('[data-carbon]')).toHaveCount(6)
  await page.screenshot({ path: info.outputPath('komik-lepas-co2.png') })
  await page.goto('/#/peta-materi')
})
