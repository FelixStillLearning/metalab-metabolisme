import type { CSSProperties } from 'react'
import { usePemutar, type PoseMaskot } from '../../stores/pemutar'
import { tenangAktif, usePengaturan } from '../../stores/pengaturan'
import { durasi } from './mesin'

const perPose = (berkas: Record<string, string>): Partial<Record<PoseMaskot, string>> =>
  Object.fromEntries(
    Object.entries(berkas).map(([jalur, src]) => [jalur.match(/([^/]+)\.webp$/)![1], src]),
  )
const POSE = perPose(
  import.meta.glob<string>('../../assets/images/maskot/ilmuwan/*.webp', {
    eager: true,
    import: 'default',
  }),
)
// Mitokondria hanya pose yang dipakai naskah; pose lain jatuh ke ramah
const POSE_MITOKONDRIA = perPose(
  import.meta.glob<string>('../../assets/images/maskot/mitokondria/*.webp', {
    eager: true,
    import: 'default',
  }),
)
const gambarPose = (pose: PoseMaskot) => POSE[pose] ?? POSE['05-menjelaskan']

function petunjukInteraksi({ pilihan, lengkapi, poe }: ReturnType<typeof usePemutar.getState>) {
  if (pilihan) {
    if (pilihan.opsi.every((o) => o.selesai)) return ''
    return pilihan.opsi[0]?.posisi ? pilihan.judul : 'Pilih salah satu jawaban di kartu.'
  }
  if (lengkapi) return `Pilih jawaban untuk rumpang ${lengkapi.terisi.length + 1}.`
  if (poe?.tahap === 'tebak') {
    if (!poe.placed.length) return `Ketuk ATP untuk menaruhnya di ${poe.zone.name}.`
    if (poe.alasan === null) return 'Pilih alasan untuk tebakanmu.'
    return 'Sudah yakin? Ketuk Kunci tebakan untuk melihat prosesnya.'
  }
  if (poe?.tahap === 'jelaskan')
    return poe.explainDone
      ? 'Ketuk Lanjutkan video.'
      : 'Pilih alasan yang sesuai dengan proses tadi.'
  return ''
}

// Narator di kiri gelembung kalimat; pendamping mitokondria di kanan (disembunyikan di HP miring).
// Wadah aria-live selalu ada agar kalimat pertama juga dibacakan pembaca layar.
function Gelembung() {
  const state = usePemutar()
  const { kalimat, pose, pendamping } = state
  const petunjuk = petunjukInteraksi(state)
  const poseAktif = petunjuk ? '08-menunjuk' : pose
  const subtitle = usePengaturan((s) => s.subtitle)
  const tampilSubtitle =
    subtitle && !!kalimat && state.poe?.tahap !== 'tebak' && state.poe?.tahap !== 'jelaskan'
  // Gelembung muncul seperti say() di prototype: 280 ms, naik 10 px dari miring -1 derajat
  const masuk = tenangAktif()
    ? undefined
    : ({ animationDuration: `${durasi(280)}ms` } as CSSProperties)

  return (
    <div className="pemutar-narator" aria-live="polite" hidden={!petunjuk && !tampilSubtitle}>
      <img
        src={gambarPose(poseAktif)}
        alt=""
        data-pose={poseAktif}
        width={400}
        height={400}
        className="pemutar-maskot"
      />
      <div
        key={petunjuk || kalimat}
        className="pemutar-gelembung"
        data-masuk={!!masuk}
        style={masuk}
      >
        {petunjuk && (
          <span className="pemutar-arahan" data-petunjuk>
            {petunjuk}
          </span>
        )}
        <span data-gelembung hidden={!tampilSubtitle}>
          {kalimat}
        </span>
      </div>
      {pendamping && (
        <img
          src={POSE_MITOKONDRIA[pendamping] ?? POSE_MITOKONDRIA['01-ramah']}
          alt=""
          data-pendamping={pendamping}
          width={256}
          height={256}
          className="pemutar-pendamping"
        />
      )}
    </div>
  )
}

export default Gelembung
