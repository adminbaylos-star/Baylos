# Baylos Tahap 20 — Verifikasi Afiliasi Admin

Tahap ini melanjutkan paket Tahap 19 dan menambahkan bantuan antarmuka pada halaman `web/admin-affiliates.html`: petunjuk privasi KTP, filter status, tombol muat ulang, dan indikator mode integrasi.

## Penting
- SQL belum dijalankan dan tidak ada migrasi yang dieksekusi.
- Tombol persetujuan/penolakan hanya boleh mengubah status setelah backend memverifikasi sesi admin dan kebijakan akses. Jangan menganggap aksi aktif bila Supabase belum tersambung.
- Foto KTP/NIK harus berada di storage privat; jangan gunakan URL publik atau menyimpan dokumen di folder `public`.
- Data demo/local bukan data produksi.

## File utama
- `web/admin-affiliates.html` — UI verifikasi afiliasi.
- `web/admin-affiliates.js` — logika lama yang dipertahankan untuk audit/integrasi berikutnya.
- `TAHAP20-VERIFIKASI-AFILIASI.md` — panduan dan batasan.

## Tahap berikutnya
Lanjutkan UI pengajuan KTP sisi pengguna dan status pengajuan, tetap tanpa upload dokumen sungguhan sampai storage privat dan akses backend siap.
