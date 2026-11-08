import { expect, test } from '@playwright/test'

test('volume awal 50%, dapat diatur lewat keyboard, dan tetap tersimpan bersama pilihan bisu', async ({
  page,
}) => {
  await page.goto('/')
  const tombol = page.getByRole('button', { name: 'Atur volume', exact: true })
  await tombol.click()
  const volume = page.getByRole('slider', { name: /^Volume utama/ })
  await expect(volume).toHaveValue('50')
  await volume.focus()
  await page.keyboard.press('End')
  await expect(volume).toHaveValue('100')
  await page.keyboard.press('Home')
  await expect(volume).toHaveValue('0')
  await page.keyboard.press('ArrowRight')
  await expect(volume).toHaveValue('1')
  await page.keyboard.press('Escape')
  await expect(tombol).toBeFocused()
  await page.getByRole('button', { name: 'Matikan suara' }).click()
  await tombol.click()
  await expect(page.getByText('Suara sedang dibisukan.')).toBeVisible()
  await expect(volume).toHaveValue('1')
  await page.reload()
  await expect(page.getByRole('button', { name: 'Nyalakan suara' })).toBeVisible()
  await tombol.click()
  await expect(volume).toHaveValue('1')
  const kotak = (await page.locator('.volume-panel').boundingBox())!
  expect(kotak.x).toBeGreaterThanOrEqual(0)
  expect(kotak.x + kotak.width).toBeLessThanOrEqual(page.viewportSize()!.width)
  await page.keyboard.press('Escape')
  await page.getByRole('button', { name: 'Nyalakan suara' }).click()
  await tombol.click()
  await expect(volume).toHaveValue('1')
})

test('volume yang sama tersedia di peta, episode, hasil, dan penutup', async ({ page }, info) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      'metalab-jawaban',
      JSON.stringify({
        state: { hasil: { a: 'Glukosa (6 atom C)' }, hasilPoe: {}, penjelasan: '' },
        version: 0,
      }),
    )
  })
  await page.goto('/')
  await page.getByRole('button', { name: 'Atur volume', exact: true }).click()
  const volume = page.getByRole('slider', { name: /^Volume utama/ })
  await volume.fill('72')
  const rute =
    info.project.name === 'hp-tegak'
      ? ['peta-materi', 'episode/1/hasil']
      : ['peta-materi', 'episode/1', 'episode/1/hasil', 'episode/1/penutup']
  for (const tujuan of rute) {
    await page.goto(`/#/${tujuan}`)
    await page.getByRole('button', { name: 'Atur volume', exact: true }).click()
    await expect(volume).toHaveValue('72')
    const kotak = (await page.locator('.volume-panel').boundingBox())!
    expect(kotak.y).toBeGreaterThanOrEqual(0)
    expect(kotak.y + kotak.height).toBeLessThanOrEqual(page.viewportSize()!.height)
    await page.keyboard.press('Escape')
  }
  await page.reload()
  const pengaturan = await page.evaluate(
    () => JSON.parse(localStorage.getItem('metalab-pengaturan')!).state,
  )
  expect(pengaturan.volume).toBe(0.72)
})
