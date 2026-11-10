import { create } from 'zustand'
import { carbon, el, strip, type Titik } from '../../features/pemutar-episode/kertas'
import { obj, pasangLatar, to, wait, type Panggung } from '../../features/pemutar-episode/mesin'
import { mintaPilihan } from '../../features/pemutar-episode/pilihan'
import { ucapKalimat } from '../../features/pemutar-episode/ucapKalimat'
import { bunyi, siapkan } from '../../lib/suara'
import { useJawabanE0 } from '../../stores/jawaban-episode-0'
import { usePemutar } from '../../stores/pemutar'
import latar from '../../assets/images/latar-pengantar-lebar.webp'
import terbelah from '../../assets/images/latar-terbelah-lebar.webp'
import cahaya from '../../assets/images/energi-cahaya.webp'
import panas from '../../assets/images/energi-panas.webp'
import atp from '../../assets/images/pembawa-atp.webp'
import co2 from '../../assets/images/molekul-co2.webp'
import air from '../../assets/images/molekul-h2o.webp'
import { SOAL, TABEL } from './isi'
import { mintaPilah } from './pilah'

export const useAdeganE0 = create<{ soal: number; terjawab: boolean; baris: number }>()(() => ({
  soal: -1,
  terjawab: false,
  baris: -1,
}))
const katakan = (p: Panggung, id: string, teks: string) =>
  ucapKalimat(p, id, { teks, pose: '05-menjelaskan' })

function rangka(p: Panggung, x: number, urai: boolean) {
  const hp = matchMedia('(max-height: 500px) and (orientation: landscape)').matches
  const g = obj(x, hp ? 350 : 340, p.world)
  g.dataset.rangka = urai ? 'katabolisme' : 'anabolisme'
  const hex: Titik[] = Array.from({ length: 6 }, (_, i) => [
    Math.cos((i * Math.PI) / 3) * 65,
    Math.sin((i * Math.PI) / 3) * (hp ? 40 : 65),
  ])
  const lepas: Titik[] = hex.map(([x, y]) => [x * (hp ? 1.15 : 1.4), y * (hp ? 1.15 : 1.4)])
  const ikatan = el('g', {}, g)
  const atom = hex.map((_, i) => {
    const c = obj(0, 0, g)
    const [x, y] = urai ? hex[i] : lepas[i]
    c._x = x
    c._y = y
    carbon(c, 0, 0, hp ? 18 : 22)
    void to(c, { x, y }, 0)
    return c
  })
  return async (progres: number) => {
    const f = progres / 5
    const titik: Titik[] = hex.map((h, i) => {
      const awal = urai ? h : lepas[i],
        akhir = urai ? lepas[i] : h
      return [awal[0] + (akhir[0] - awal[0]) * f, awal[1] + (akhir[1] - awal[1]) * f]
    })
    ikatan.replaceChildren()
    await Promise.all(atom.map((c, i) => to(c, { x: titik[i][0], y: titik[i][1] }, 550)))
    for (const [i, a] of titik.entries()) {
      const terlihat = urai ? progres < 5 && i >= progres : progres === 5 || i < progres
      if (terlihat)
        strip(ikatan, ...a, ...titik[(i + 1) % 6], 7, 'var(--color-paper)', {}, { bayangan: true })
    }
  }
}

export async function jalankanEpisode0(p: Panggung) {
  useAdeganE0.setState({ soal: -1, terjawab: false, baris: -1 })
  useJawabanE0.getState().mulai()
  siapkan('muncul', 'geser', 'tempel', 'atp')
  await pasangLatar(p, latar, 'pengantar')
  await katakan(
    p,
    'e0-pembuka-01',
    'Sel terus menyusun dan menguraikan zat. Semua reaksi kimia di dalam sel disebut metabolisme. Mari amati dua contohnya.',
  )
  for (const [i, s] of SOAL.entries()) {
    p.signal.throwIfAborted()
    usePemutar.setState({ bab: i })
    useAdeganE0.setState({ soal: i, terjawab: false })
    if (i === 0 || i === 3) {
      bunyi('muncul')
      await wait(p, 450)
    }
    const gambar = i === 1 ? [cahaya, atp, panas] : i === 4 ? [atp, co2, air] : []
    // Pertanyaan langsung aktif bersama petunjuk narasi, tanpa layar tunggu kosong.
    await Promise.all([
      katakan(p, `e0-${s.k}-tanya`, s.tanya),
      mintaPilihan(
        p.signal,
        {
          judul: `${s.k.replace('1.5', '1.5 ')} · ${s.judul}`,
          konfirmasi: true,
          opsi: s.opsi.map((teks, j) => ({ teks, gambar: gambar[j] })),
        },
        s.benar,
        () => katakan(p, `e0-${s.k}-balik`, s.salah),
      ).then(() => {
        useJawabanE0.getState().catat(s.k)
        useAdeganE0.setState({ terjawab: true })
        bunyi(i === 4 ? 'atp' : 'tempel')
      }),
    ])
    await katakan(p, `e0-${s.k}-jawab`, s.narasi)
  }
  useAdeganE0.setState({ soal: 6, terjawab: false })
  usePemutar.setState({ bab: 6, kalimat: '' })
  bunyi('geser')
  await pasangLatar(p, terbelah, 'terbelah')
  const kiri = rangka(p, 310, false),
    kanan = rangka(p, 1290, true)
  await Promise.all([kiri(0), kanan(0)])
  for (const [i, r] of TABEL.entries()) {
    useAdeganE0.setState({ baris: i })
    await mintaPilah(p.signal, r)
    bunyi('geser')
    await Promise.all([kiri(i + 1), kanan(i + 1)])
    bunyi('tempel')
    await wait(p, 220)
  }
  await katakan(
    p,
    'e0-selesai-01',
    'Respirasi aerob termasuk katabolisme. Berikutnya, kita mengikuti awal pemecahan glukosa pada glikolisis.',
  )
  usePemutar.setState({ bab: 7, kalimat: '' })
  useJawabanE0.getState().selesaikan()
}
