import type { SoalPilihan } from '../../stores/pemutar'

export function sasaranSeret(opsi: SoalPilihan['opsi'], x: number, y: number) {
  let terdekat = -1
  let jarak = Infinity
  opsi.forEach((o, i) => {
    if (!o.posisi) return
    const d = Math.hypot(x - o.posisi[0], y - o.posisi[1])
    if (d < jarak) {
      jarak = d
      terdekat = i
    }
  })
  const o = opsi[terdekat]
  if (!o?.posisi || o.selesai) return -1
  const tetangga = Math.min(
    ...opsi.map((t, i) =>
      i !== terdekat && t.posisi
        ? Math.hypot(t.posisi[0] - o.posisi![0], t.posisi[1] - o.posisi![1])
        : Infinity,
    ),
  )
  const radius = Math.min(...(o.ukuran ?? [150, 125])) / 2
  return jarak <= Math.min(radius, tetangga * 0.45) ? terdekat : -1
}
