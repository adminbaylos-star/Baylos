# Catatan perapihan paket Baylos

## Perubahan yang dilakukan

- Menghapus `web/Hapusini (file sementara 123, bukan source aplikasi)` setelah memeriksa bahwa referensi lokal HTML tidak menunjuk ke file itu.
- Merapikan `README.md` menjadi panduan awal yang membedakan demo dan kesiapan produksi.
- Menghapus contoh password demo dari panduan Biteship agar tidak disebarkan sebagai kredensial yang dapat dipakai.
- Memperbarui petunjuk login admin agar tidak mengarahkan pengguna ke branch pengembangan yang berbeda dari jalur utama.
- Menambahkan `package.json`, skrip pemeriksaan sintaks JavaScript, dan `.gitignore`.
- Mempertahankan seluruh halaman aplikasi, fungsi Supabase, migrasi, dan dokumentasi tahap yang belum terbukti aman untuk dihapus.

## Hasil pemeriksaan pada paket awal

- Arsip ZIP valid dan bisa dibuka.
- Tes validasi yang tersedia lulus: 16 assertion.
- Pemeriksaan sintaks semua file JavaScript lulus.
- Tidak ditemukan referensi `href`/`src` lokal yang putus pada halaman HTML saat diperiksa.
- `supabase/functions/create-order/index.ts` masih fail-closed dan mengembalikan `SCHEMA_AUDIT_REQUIRED`; ini dipertahankan agar transaksi tidak tampak berhasil sebelum backend siap.
- Migrasi yang berstatus `pending-review`, `DRAFT`, atau `NOT_APPLIED` tetap tidak dijalankan.
- Tidak ada koneksi ke Supabase atau perubahan database yang dilakukan.

## Yang sengaja tidak dihapus

`index.html`, `portal.html`, dan `web/storefront.html` berpotensi memiliki peran/rute berbeda. Walaupun ada tumpang tindih UI, file-file itu dipertahankan untuk mencegah tautan atau jalur utama rusak. Dokumen tahap lama juga dipertahankan karena bisa berisi konteks implementasi dan instruksi migrasi.

## Batasan

Pemeriksaan ini mencakup tes lokal, sintaks JavaScript, dan referensi lokal HTML. Ini bukan audit penuh RLS, autentikasi server, pembayaran, atau skema database. Checkout produksi belum boleh diaktifkan sampai audit database dan uji transaksi end-to-end selesai.
## Perubahan pendaftaran pengguna
- Akses pendaftaran reseller lama pada halaman marketplace dihapus dari antarmuka pengguna.
- Tombol pendaftaran di portal diarahkan ke `web/affiliate-register.html` dengan label **Pendaftaran Afiliasi Pengguna**.
- Form afiliasi masih berupa validasi di browser dan belum menyimpan pengajuan ke backend; jangan menganggap pendaftaran terkirim sampai integrasi server tersedia.

## Tahap checkout dan profil pengguna (2026-10-27)
- Tombol **Pesan sekarang** pada detail produk kini membawa item yang dipilih langsung ke `checkout.html` setelah validasi pilihan/kuantitas.
- Tombol checkout dari keranjang membuka halaman checkout.
- Checkout menampilkan rincian barang, alamat penerima, pilihan jasa/layanan kirim, pilihan metode pembayaran, pilihan bank untuk transfer, dan ringkasan subtotal/ongkir/total.
- Harga dan ongkir ditandai sebagai perkiraan; server tetap menjadi sumber kebenaran. Tidak ada nomor rekening palsu atau klaim pembayaran berhasil.
- Form checkout mengirim pilihan ke `BaylosCheckout.checkout`; pesanan hanya dianggap dibuat jika Edge Function `create-order` membalas sukses.
- Profil akun sekarang membaca profil pengguna yang login dan mencoba menyimpan nama/telepon ke `profiles`, serta nama tampilan ke metadata autentikasi. Jika kebijakan RLS/skema belum sesuai, UI menampilkan error alih-alih mengklaim tersimpan.
- Batasan belum selesai: integrasi tarif kurir live, biaya ongkir dari provider, kredensial rekening resmi Baylos, gateway pembayaran, tampilan status pembayaran, dan Edge Function produksi harus dikonfigurasi serta diuji di Supabase.
