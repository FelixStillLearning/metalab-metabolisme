# Audit sumber audio Episode 1

Diperiksa 9 November 2026. Catatan ini mencakup suara pilihan tim yang sebelumnya belum memiliki bukti sumber lengkap. Audio tidak diganti dalam audit ini. Ketentuan audio pihak ketiga tetap mengikuti pemiliknya.

| Berkas (OGG dan MP3) | Pembuat / sumber asli                                                                                                                                                  | Status                                                                                |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `ketuk`              | Luckius, `paper_sound_-_1.mp3`, [Various Paper Sound Effects](https://opengameart.org/content/various-paper-sound-effects)                                             | CC0-1.0 terverifikasi                                                                 |
| `tepat`              | Metadata berkas tim: Jam FX, `correct-bell-twinkle-jam-fx-1-00-05.mp3`; judul/pembuat ditemukan di [Uppbeat](https://uppbeat.io/sfx/correct-bell-twinkle/168255/61648) | Asal unduhan dan izin berkas tim belum terverifikasi; temuan katalog bukan bukti izin |
| `belum-tepat`        | Berkas tim `jawabankurangtempat.mp3`                                                                                                                                   | Pembuat, sumber, dan izin belum terverifikasi                                         |
| `musik-latar`        | Berkas tim `13b_musik_latar_cerah_pagi.mp3`                                                                                                                            | Pembuat, sumber, dan izin belum terverifikasi                                         |

## Bukti untuk suara ketuk

Berkas asli tim identik byte demi byte dengan [unduhan penerbit](https://opengameart.org/sites/default/files/paper_sound_-_1.mp3): 12.292 byte, SHA-256 `f62e6cab41a9c0a8c67b5752c95e80e6adc681110d579ada982627909be1773d`. Halaman penerbit mencantumkan [CC0-1.0](https://creativecommons.org/publicdomain/zero/1.0/). Versi aplikasi dipotong heningnya, disamakan kerasnya, dan dikonversi ke OGG/MP3.

## Bukti yang masih diperlukan

Suara tim yang belum terverifikasi memerlukan tautan penerbit dan ketentuan lisensi yang berlaku pada unduhan tim, atau izin dari pemegang hak untuk penggunaan serta distribusi di aplikasi dan repositori. Untuk karya tim sendiri, catat pembuat dan izin distribusinya.

[Ketentuan Basic Uppbeat](https://uppbeat.io/uppbeat-basic-license) adalah lisensi khusus, bukan CC0. Versi ketentuan saat mengunduh dan cakupan akun belum diketahui. Dugaan sumber Pixabay sebelumnya tidak terbukti.

Status belum terverifikasi bukan pernyataan bahwa penggunaan pasti dilarang. Catatan ini juga tidak memberikan izin baru atas suara tersebut.

## Pengganti 9 November 2026

`getar` dan `belah` (berkas tim tanpa sumber) diganti dengan suara CC0-1.0, dan slot pop episode memakai berkas sendiri.

| Berkas (OGG dan MP3) | Pembuat / sumber asli                                                                                                        | Status  |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------- |
| `getar`              | Luckius, `paper_crushed_-_2.mp3`, [Various Paper Sound Effects](https://opengameart.org/content/various-paper-sound-effects) | CC0-1.0 |
| `belah`              | Independent.nu, `impactcrunch03`, [5 break, crunch impacts](https://opengameart.org/content/5-break-crunch-impacts)          | CC0-1.0 |
| `muncul`             | cogitollc, [pop sounds](https://opengameart.org/content/pop-sounds)                                                          | CC0-1.0 |

## Gerak dan tempel Episode 1, 9 November 2026

| Berkas (OGG dan MP3) | Pemakaian                                                          | Sumber asli                                                                                                   | Lisensi |
| -------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- | ------- |
| `geser`              | Perpindahan molekul, kamera, pengumpulan hasil, pergantian susunan | artisticdude, `whoosh-swish-12.wav`, [Swishes Sound Pack](https://opengameart.org/content/swishes-sound-pack) | CC0-1.0 |
| `tempel`             | Fosfat/elektron menempel dan hasil mendarat                        | Kenney, `pluck_001.wav`, [Interface Sounds](https://kenney.nl/assets/interface-sounds)                        | CC0-1.0 |

Sumber memakai salinan lokal beserta catatan lisensi yang sudah tersedia. Versi episode: durasi maksimal 320 ms (geser) / 160 ms (tempel), mono 44,1 kHz, high-pass 90 Hz, low-pass 6.500 Hz, target −23 LUFS dan −3 dBTP, fade akhir 35 ms. MP3 dikonversi dari OGG dengan libmp3lame kualitas 4. Berkas melesat/klik lama tetap tersedia untuk pemakaian lainnya. Gerakan serentak memakai satu cue; swish dan tempel yang sedang aktif dimulai ulang agar tidak menumpuk. Semua cue mengikuti saklar efek, bisu, dan volume utama.
