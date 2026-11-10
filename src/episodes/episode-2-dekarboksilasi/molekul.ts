import atomO from '../../assets/images/molekul-atom-o.webp'
import gambarKoa from '../../assets/images/molekul-koa.webp'
import { carbon, el, label, skeleton, strip } from '../../features/pemutar-episode/kertas'
import { obj, type Panggung } from '../../features/pemutar-episode/mesin'

// Model hitung karbon: karboksil 1 C + 2 O bergerak terpisah dari gugus 2 C.
export function piruvat(p: Panggung, x: number, y: number) {
  const asetil = obj(x, y, p.world)
  asetil.dataset.molecule = 'asetil'
  asetil.dataset.karbon = '2'
  const ikatan = strip(asetil, 0, -12, 75, 12, 8, 'var(--color-paper)')
  skeleton(
    asetil,
    [
      [-75, 12],
      [0, -12],
    ],
    [[0, 1]],
  )
  const karboksil = obj(x + 75, y + 12, p.world)
  karboksil.dataset.molecule = 'karboksil'
  karboksil.dataset.karbon = '1'
  for (const oy of [-28, 28])
    el(
      'image',
      { href: atomO, x: 9, y: oy - 20, width: 40, height: 40, 'data-oxygen': '' },
      karboksil,
    )
  carbon(karboksil, 0, 0)
  const nama = label(asetil, 0, 92, 'Asam piruvat · 3 C', 20)
  return { asetil, karboksil, ikatan, nama }
}
export type Piruvat = ReturnType<typeof piruvat>

export function koa(p: Panggung, x: number, y: number) {
  const g = obj(x, y, p.world)
  g.dataset.molecule = 'koa'
  el('image', { href: gambarKoa, x: -64, y: -32, width: 128, height: 64 }, g)
  return g
}
