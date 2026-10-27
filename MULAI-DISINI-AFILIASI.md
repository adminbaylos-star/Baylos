# Baylos — Tahap 1 Afiliasi Verifikasi KTP Manual

## Yang sudah dibuat
- Formulir afiliasi terpisah: `web/affiliate-register.html`.
- Unggah KTP ke bucket privat, validasi tipe/ukuran, status pengajuan.
- Admin: `web/admin-affiliates.html`, pemeriksaan KTP via URL sementara 60 detik, setujui/tolak/minta revisi.
- Link menu pada profil dan dashboard admin.
- Draf migrasi **belum dijalankan**: `supabase/migrations/20261022_affiliate_ktp_manual_DRAFT.sql`.

## PENTING sebelum dipublikasikan
1. Unggah `index.html` dan folder `web` ke branch `supabase-integration`, bukan `main`. Jangan hapus data lama.
2. **Jangan mulai menerima foto KTP sebelum** meninjau draf SQL, menguji RLS dengan dua akun, melengkapi pemberitahuan privasi, masa retensi, mekanisme penghapusan, serta perlindungan NIK (enkripsi/vault). Halaman ini adalah fondasi pengembangan, bukan layanan KYC siap produksi.
3. Migrasi memerlukan fungsi `public.is_baylos_admin()` yang sudah ada. Tinjau konflik policy bila migrasi pernah dijalankan.
4. Sistem komisi dan link afiliasi otomatis **belum dibuat/diaktifkan**. Tidak ada pembayaran otomatis.
5. Halaman reseller lama sengaja dipertahankan untuk kompatibilitas data; penggantian menyeluruh dilakukan setelah migrasi dan pengujian.

## Pengujian
- Akun biasa: hanya melihat pengajuan sendiri; tidak bisa melihat dokumen orang lain.
- Akun admin: dapat melihat daftar, dokumen via signed URL dan mengambil keputusan.
- Pengunjung tanpa login: tidak dapat mendaftar.
- Periksa penolakan akses database dan storage sebelum mengaktifkan produksi.
