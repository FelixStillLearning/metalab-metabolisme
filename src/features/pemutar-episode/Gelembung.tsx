import type { CSSProperties } from 'react'
import mitokondria from '../../assets/images/maskot-mitokondria-ramah.webp'
import { usePemutar, type PoseMaskot } from '../../stores/pemutar'
import { tenangAktif, usePengaturan } from '../../stores/pengaturan'
import { durasi } from './mesin'

const BERKAS_POSE = import.meta.glob<string>('../../assets/images/maskot/ilmuwan/*.webp', {
  eager: true,
  import: 'default',
})
const POSE: Partial<Record<PoseMaskot, string>> = Object.fromEntries(
  Object.entries(BERKAS_POSE).map(([jalur, src]) => [jalur.match(/([^/]+)\.webp$/)![1], src]),
)
const gambarPose = (pose: PoseMaskot) => POSE[pose] ?? POSE['05-menjelaskan']

// Narator di kiri gelembung kalimat; pendamping mitokondria di kanan (disembunyikan di HP miring).
// Wadah aria-live selalu ada agar kalimat pertama juga dibacakan pembaca layar.
function Gelembung() {
  const { kalimat, pose, pendamping } = usePemutar()
  const subtitle = usePengaturan((s) => s.subtitle)
  // Gelembung muncul seperti say() di prototype: 280 ms, naik 10 px dari miring -1 derajat
  const masuk = tenangAktif()
    ? undefined
    : ({ animationDuration: `${durasi(280)}ms` } as CSSProperties)

  return (
    <div className="pemutar-narator" aria-live="polite" hidden={!subtitle || !kalimat}>
      <img
        src={gambarPose(pose)}
        alt=""
        data-pose={pose}
        width={400}
        height={400}
        className="pemutar-maskot"
      />
      <div key={kalimat} className="pemutar-gelembung" data-masuk={!!masuk} style={masuk}>
        <span data-gelembung>{kalimat}</span>
      </div>
      {pendamping && (
        <img
          src={mitokondria}
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
