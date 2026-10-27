# Baylos.id — Perbaikan Login Supabase (branch pengembangan)

## Perbaikan pada paket ini
- Memperbaiki **syntax error JavaScript** pada fungsi `handleLogin` (sisa kode login lama setelah blok `catch`). Kesalahan ini dapat menghentikan seluruh JavaScript halaman.
- Mempertahankan login, registrasi, logout, dan pemulihan sesi melalui Supabase.
- Menghapus tampilan kredensial demo dari halaman login dan akun demo hardcoded dari konfigurasi.
- Mendukung tampilan tombol admin untuk `user_role` bernilai `admin` atau `super_admin` yang dibaca dari tabel `profiles`.
- Menonaktifkan pengelolaan reseller berbasis data demo `localStorage` (belum diganti backend admin nyata).
- Menambahkan permintaan email reset password, tetapi alur memasukkan password baru masih perlu dibuat.

## PENTING: admin asli belum otomatis aktif
1. Buat atau gunakan akun asli di Supabase Authentication; konfirmasi email.
2. Periksa bahwa `public.profiles` berisi baris dengan `id` sama dengan akun tersebut.
3. Periksa constraint/check dan RLS kolom `user_role` sebelum menetapkan `admin`/`super_admin`. **Jangan jalankan SQL update role tanpa memeriksa constraint dan RLS.**
4. Proteksi data admin harus diterapkan pada RLS dan fungsi backend. Tombol admin yang muncul di UI bukan bukti otorisasi aman.

## Cara memasang dengan aman
- Pertahankan jalur utama repository (`main`) dan buat backup/commit sebelum memasang perubahan.
- Jangan menimpa konfigurasi Supabase yang sudah benar dengan placeholder.
- Jangan pernah menaruh `service_role` atau secret provider di file browser.
- Uji login, logout, pemulihan sesi, dan role dengan akun Supabase nyata setelah perubahan diterapkan.
- Jangan menganggap tombol admin di UI sebagai pengganti pemeriksaan role pada RLS dan backend.

## Batasan
- Paket ini belum diuji pada server Supabase milik Anda dan belum diterbitkan ke website utama.
- Katalog, dashboard, pesanan, dan sebagian fitur admin masih memakai data/simulasi lokal; **jangan gunakan untuk transaksi produksi**.
- `supabase/functions/create-order` tetap dinonaktifkan untuk keamanan. Jangan mengaktifkan checkout sampai validasi harga, stok, dan ongkir diproses aman di server.
