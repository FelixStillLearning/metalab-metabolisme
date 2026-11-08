// Primitif kertas potong dari prototype desain final: tepi bergerigi dengan benih tetap,
// jadi bentuk yang sama selalu tergambar sama. Bayangan kertas berupa salinan bentuk yang
// digeser di belakangnya, bukan filter SVG; hanya bentuk yang di prototype berbayangan memakainya.

const NS = 'http://www.w3.org/2000/svg'
const WARNA_BAYANGAN = '#0d2526'

export type Titik = [number, number]
type Atribut = Record<string, string | number>
type Opsi = { bayangan?: boolean }
export type Bentuk = SVGPolygonElement & { bayangan?: SVGPolygonElement }

let benih = 101
const jitter = (n: number) => (((benih = (benih * 16807) % 2147483647) / 2147483647) * 2 - 1) * n

export function el<K extends keyof SVGElementTagNameMap>(
  tag: K,
  attrs: Atribut,
  parent: Element,
): SVGElementTagNameMap[K] {
  const node = document.createElementNS(NS, tag)
  for (const [kunci, nilai] of Object.entries(attrs)) node.setAttribute(kunci, String(nilai))
  parent.append(node)
  return node
}

export function cut(
  parent: Element,
  points: Titik[],
  fill: string,
  attrs: Atribut = {},
  rough = 1,
  { bayangan = false }: Opsi = {},
): Bentuk {
  const titik = points
    .map(([x, y]) => `${(x + jitter(rough)).toFixed(2)},${(y + jitter(rough)).toFixed(2)}`)
    .join(' ')
  const salinan = bayangan
    ? el(
        'polygon',
        {
          points: titik,
          fill: WARNA_BAYANGAN,
          opacity: 0.38 * Number(attrs.opacity ?? 1),
          transform: 'translate(3 5)',
          'data-bayangan': '',
        },
        parent,
      )
    : undefined
  return Object.assign(el('polygon', { points: titik, fill, ...attrs }, parent), {
    bayangan: salinan,
  })
}

// Bentuk dan bayangannya selalu diubah bersama
export function hapusBentuk(bentuk: Bentuk) {
  bentuk.bayangan?.remove()
  bentuk.remove()
}

export function aturTitik(bentuk: Bentuk, points: string) {
  bentuk.setAttribute('points', points)
  bentuk.bayangan?.setAttribute('points', points)
}

export function disc(
  parent: Element,
  x: number,
  y: number,
  radius: number,
  fill: string,
  attrs: Atribut = {},
  opsi: Opsi = {},
) {
  const titik = Array.from({ length: 18 }, (_, i): Titik => {
    const a = (i / 18) * Math.PI * 2
    return [x + Math.cos(a) * radius, y + Math.sin(a) * radius]
  })
  return cut(parent, titik, fill, attrs, 0.65, opsi)
}

export function strip(
  parent: Element,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  width = 8,
  fill = 'var(--color-paper)',
  attrs: Atribut = {},
  opsi: Opsi = {},
) {
  const panjang = Math.hypot(x2 - x1, y2 - y1) || 1
  const nx = (-(y2 - y1) / panjang) * (width / 2)
  const ny = ((x2 - x1) / panjang) * (width / 2)
  const titik: Titik[] = [
    [x1 + nx, y1 + ny],
    [x2 + nx, y2 + ny],
    [x2 - nx, y2 - ny],
    [x1 - nx, y1 - ny],
  ]
  return cut(parent, titik, fill, attrs, 0.5, opsi)
}

export function label(parent: Element, x: number, y: number, value: string, size = 22) {
  const group = el('g', { transform: `translate(${x} ${y}) rotate(${jitter(1.6)})` }, parent)
  const w = value.length * size * 0.57 + 24
  const h = size * 1.7
  cut(
    group,
    [
      [-w / 2, -h / 2],
      [w / 2, -h / 2 - 1],
      [w / 2 + 1, h / 2],
      [-w / 2 - 1, h / 2 + 1],
    ],
    'var(--color-paper)',
    {},
    1,
    { bayangan: true },
  )
  const text = el(
    'text',
    {
      x: 0,
      y: size * 0.35,
      'text-anchor': 'middle',
      'font-size': size,
      'font-weight': 800,
      'font-family': 'Grandstander, sans-serif',
      fill: 'var(--color-ink)',
    },
    group,
  )
  text.textContent = value
  return group
}

export function carbon(parent: Element, x: number, y: number, radius = 21) {
  const group = el('g', { 'data-carbon': '' }, parent)
  disc(group, x, y, radius, 'var(--color-paper)', {}, { bayangan: true })
  const text = el(
    'text',
    {
      x,
      y: y + radius * 0.36,
      'text-anchor': 'middle',
      'font-size': radius * 1.12,
      'font-weight': 800,
      fill: 'var(--color-ink)',
    },
    group,
  )
  text.textContent = 'C'
  return group
}

export function skeleton(parent: Element, points: Titik[], pairs: [number, number][]) {
  const bonds = el('g', {}, parent)
  for (const [a, b] of pairs)
    strip(
      bonds,
      ...points[a],
      ...points[b],
      8,
      'var(--color-paper)',
      {},
      {
        bayangan: true,
      },
    )
  return points.map(([x, y]) => carbon(parent, x, y))
}
