import type { usePemutar } from '../../stores/pemutar'

export function petunjukInteraksi({
  pilihan,
  petunjuk,
  lengkapi,
  poe,
}: ReturnType<typeof usePemutar.getState>) {
  if (petunjuk) return petunjuk
  if (pilihan) {
    if (pilihan.opsi.every((o) => o.selesai)) return ''
    if (pilihan.konfirmasi)
      return 'Pilih jawaban, lalu tekan Jawab untuk mengisi kotak yang disorot.'
    return pilihan.opsi[0]?.posisi ? pilihan.judul : 'Pilih salah satu jawaban di kartu.'
  }
  if (lengkapi) return `Pilih jawaban untuk rumpang ${lengkapi.terisi.length + 1}.`
  if (poe?.tahap === 'tebak') {
    if (!poe.placed.length)
      return `Ketuk atau seret ${poe.zat ? 'satu zat' : 'ATP'} ke ${poe.zone.name}.`
    if (poe.alasan === null) return 'Pilih alasan tebakanmu.'
    return 'Ketuk Kunci tebakan.'
  }
  if (poe?.tahap === 'jelaskan')
    return poe.explainDone
      ? 'Ketuk Lanjutkan video.'
      : 'Pilih alasan yang sesuai dengan proses tadi.'
  return ''
}
