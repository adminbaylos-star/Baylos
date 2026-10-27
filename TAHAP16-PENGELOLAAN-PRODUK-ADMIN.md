# Tahap 16 — Pengelolaan Produk Admin

## Ditambahkan
- Edit nama, kategori, dan deskripsi produk.
- Kontrol harga, stok utama, status publikasi, berat, verifikasi stok, varian, dan galeri tetap tersedia.
- Tombol nonaktifkan produk untuk menyembunyikan produk tanpa menghapus record atau riwayat pesanan.
- Semua operasi perubahan memeriksa sesi dan RPC `is_baylos_admin` sebelum menulis.

## Batasan yang disengaja
- Tidak ada hard-delete produk, agar relasi pesanan/riwayat tidak rusak.
- Fitur foto yang sudah ada bergantung pada konfigurasi bucket dan kebijakan Storage; konfigurasi SQL tetap ditunda.
- Kolom `category` dan `description` harus cocok dengan schema saat integrasi final.
- Perubahan kode dan pemeriksaan sintaks bukan pengganti uji browser dan Supabase nyata.

## Pengujian nanti
1. Login sebagai admin dan edit nama/kategori/deskripsi.
2. Login sebagai akun non-admin dan pastikan perubahan ditolak.
3. Nonaktifkan produk dan pastikan data/riwayat pesanan tetap ada.
4. Uji galeri dan unggah foto setelah bucket Storage diamankan.
