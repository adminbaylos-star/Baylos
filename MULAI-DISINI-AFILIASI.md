# Mulai di sini — Program Afiliasi Baylos

## Perubahan pada paket ini
- Pendaftaran pengguna tidak lagi menawarkan pendaftaran reseller.
- Pemulihan kata sandi di portal mendukung penetapan kata sandi baru melalui alur Supabase Auth.
- Pengaturan akun menambahkan form ganti kata sandi dengan verifikasi kata sandi saat ini.
- Pendaftaran afiliasi disederhanakan tanpa mengumpulkan NIK/KTP.
- Tautan referral unik dan log klik memerlukan migrasi baru.
- Halaman admin afiliasi menampilkan kode dan jumlah klik; halaman admin komisi membaca dan menyimpan aturan ke tabel database setelah migrasi dipasang dan akun admin terverifikasi.

## Langkah wajib sebelum pengujian
1. Tinjau `supabase/migrations/20261103_affiliate_program_core.sql` terhadap skema proyek Supabase aktual. Jangan jalankan langsung di produksi tanpa backup dan review.
2. Terapkan ke proyek pengujian terlebih dahulu.
3. Pastikan URL `portal.html` dan halaman reset kata sandi diizinkan pada Supabase Auth Redirect URLs.
4. Uji signup, verifikasi email, login, reset password, ganti password, bergabung afiliasi, dan tautan referral dengan dua akun uji.
5. Jangan aktifkan pembayaran atau pencairan komisi. Checkout produksi saat ini tetap diblokir sampai integrasi pesanan/pembayaran dan atribusi referral server-side diselesaikan.

## Batasan yang sengaja dipertahankan
Klik referral bukan penjualan. Komisi tidak boleh dinyatakan terutang hanya karena klik atau parameter URL; atribusi pesanan harus dilakukan oleh backend tepercaya setelah pembayaran tervalidasi dan memperhitungkan pembatalan/refund.
