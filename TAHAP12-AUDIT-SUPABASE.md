# Baylos Tahap 12 — Audit Supabase Aman (Read-only)

## Tujuan
Tahap ini memeriksa struktur tabel, status RLS, kebijakan akses, fungsi/RPC, dan kolom role tanpa mengubah database. Fokusnya memastikan dasar keamanan sebelum checkout, admin, dan afiliasi diaktifkan.

## Langkah
1. Buat salinan/backup yang sesuai melalui dashboard Supabase sebelum melakukan perubahan apa pun.
2. Buka Supabase project Baylos yang benar → **SQL Editor**.
3. Buka file `supabase/audit-readonly/01_schema_access_audit.sql`.
4. Salin dan jalankan seluruh query. Isinya hanya `SELECT`/pembacaan metadata.
5. Simpan hasil tiap query sebagai CSV atau screenshot. Jangan kirim service-role key, password database, KTP/NIK, atau data pribadi pelanggan.
6. Cocokkan hasil dengan daftar di bawah; jangan menjalankan file `DRAFT`, `NOT_APPLIED`, atau `pending-review` untuk tahap ini.

## Yang harus diperiksa
- Tabel berisi data pengguna/order mempunyai RLS aktif jika diakses melalui API.
- Tidak ada policy yang memberi `anon` akses tulis atau baca data pribadi tanpa alasan yang jelas.
- Periksa `profiles` untuk mengetahui nama kolom role/status yang benar. Jangan berasumsi `role` atau `user_role` tersedia sebelum melihat hasil.
- Fungsi yang mengubah order/komisi perlu ditinjau definisi lengkapnya sebelum dipakai; daftar fungsi di query ini hanya metadata, bukan audit isi fungsi.
- Dokumen KTP tidak boleh berada di bucket publik atau direktori `public/`; storage policy harus ditinjau terpisah sebelum upload KTP diaktifkan.

## Batas tahap ini
Query ini tidak membuktikan keamanan secara menyeluruh, tidak menguji pengguna anon vs login, dan tidak mengaktifkan fitur apa pun. Hasilnya perlu ditinjau sebelum menulis migration perbaikan. Jangan tempel kredensial rahasia ke chat.

## Langkah setelah audit
Kirim hanya hasil metadata (nama tabel, status RLS, daftar policy, daftar nama kolom `profiles`, dan nama/signature fungsi). Dari situ bisa disusun perbaikan yang sesuai dengan skema nyata, tanpa menebak dan tanpa menghapus data.
