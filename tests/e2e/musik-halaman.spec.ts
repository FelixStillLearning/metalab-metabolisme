import { expect, test, type Page } from '@playwright/test'

const laguAktif = (page: Page) =>
  page.evaluate(() => {
    const howler = (
      window as unknown as {
        Howler: { _howls: { _src: string; playing: () => boolean }[] }
      }
    ).Howler
    return howler._howls
      .filter((lagu) => /musik-(opening|menu|latar)\./.test(lagu._src) && lagu.playing())
      .map((lagu) => lagu._src.split('/').at(-1))
  })

test('musik mengikuti halaman, bisu, dan berganti tanpa tumpang tindih', async ({ page }, info) => {
  test.skip(info.project.name === 'hp-tegak', 'Alur sampai mulai episode dimainkan miring')
  const gagal: string[] = []
  page.on('response', (r) => {
    if (/audio\/musik-(opening|menu)\./.test(r.url()) && !r.ok()) gagal.push(r.url())
  })
  await page.goto('/')
  await page.getByRole('heading', { level: 1 }).click()
  await expect.poll(() => laguAktif(page)).toEqual(['musik-opening.ogg'])
  await page.getByRole('button', { name: 'Mulai belajar' }).click()
  await page.getByLabel('Nama', { exact: true }).fill('Siswa Uji')
  await page.getByLabel('Kelas', { exact: true }).fill('XII 1')
  await page.getByRole('button', { name: 'Lanjut ke peta materi' }).click()
  await expect.poll(() => laguAktif(page)).toEqual(['musik-menu.ogg'])
  await page.getByRole('button', { name: 'Matikan suara' }).click()
  await expect.poll(() => laguAktif(page)).toEqual([])
  await page.getByRole('button', { name: 'Nyalakan suara' }).click()
  await expect.poll(() => laguAktif(page)).toEqual(['musik-menu.ogg'])
  await page.getByRole('link', { name: 'Beranda', exact: true }).click()
  await expect.poll(() => laguAktif(page)).toEqual(['musik-opening.ogg'])
  await page.evaluate(() => {
    location.hash = '/episode/1?cepat'
  })
  await expect(page.getByRole('button', { name: 'Mulai episode' })).toBeVisible()
  await expect.poll(() => laguAktif(page)).toEqual(['musik-latar.ogg'])
  await page.getByRole('button', { name: 'Mulai episode' }).click()
  await expect.poll(() => laguAktif(page)).toEqual(['musik-latar.ogg'])
  expect(gagal).toEqual([])
})
