import { kendali, wait, type Panggung } from './mesin'
import { ucapkan } from '../../lib/narasi'
import { usePemutar, type PoseMaskot } from '../../stores/pemutar'

export async function ucapKalimat(
  p: Panggung,
  id: string,
  { teks, pose }: { teks: string; pose: PoseMaskot },
  { tambah = 0, pendamping }: { tambah?: number; pendamping?: PoseMaskot } = {},
) {
  usePemutar.setState({ kalimat: teks, pose, pendamping: pendamping ?? null })
  await Promise.all([
    kendali.otomatis ? undefined : ucapkan(id, teks, { signal: p.signal }),
    wait(p, Math.max(1600, teks.length * 55) + tambah, Infinity),
  ])
}
