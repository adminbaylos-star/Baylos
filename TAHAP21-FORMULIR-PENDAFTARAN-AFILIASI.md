# Tahap 21 — Formulir Pendaftaran Afiliasi

## Yang disiapkan
- Form responsif untuk nama, email, telepon, kanal promosi, tautan kanal, dan alasan mendaftar.
- Validasi input di browser, persetujuan, dan pesan status yang jelas.
- Tidak mengumpulkan atau menyimpan KTP/NIK di halaman demo.
- Status pengajuan tidak diklaim tersimpan: backend sengaja belum terhubung.

## Cara melihat
Buka `web/affiliate-register.html` melalui browser. Form hanya memvalidasi data secara lokal; tombol submit tidak mengirim data ke server.

## Nanti saat integrasi
Sambungkan submit ke endpoint yang memvalidasi sesi pengguna, menerapkan rate limiting, menyimpan pengajuan dengan RLS, dan mengembalikan status dari server. KTP harus memakai private storage dengan signed URL berumur pendek dan pemeriksaan admin berizin. Jangan letakkan service-role key di browser.

## SQL
Tidak ada SQL yang dijalankan atau ditambahkan sebagai migrasi aktif pada tahap ini. Kebutuhan skema dicatat untuk audit akhir.
