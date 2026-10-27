# Tahap 17 — Pengelolaan Pesanan Admin (UI)

Tahap ini menambahkan filter status pesanan dan pembayaran, tombol salin ID, tampilan draf kurir/layanan/resi, cetak ringkasan, dan ekspor CSV.

## Batas integrasi saat ini
- Daftar pesanan dan item dibaca dari Supabase setelah autentikasi dan pemeriksaan `is_baylos_admin` berhasil.
- Draf kurir/layanan/resi disimpan di `localStorage` browser ini saja; tombol tidak mengubah pesanan di database.
- Perubahan status pesanan, verifikasi pembayaran, pembuatan resi pihak ketiga, dan pengiriman notifikasi belum diaktifkan sampai endpoint/RPC serta kebijakan akses diperiksa.
- Tidak ada SQL yang perlu dijalankan pada tahap ini.

## File yang diperbarui
- `web/admin-orders.html`
- `web/admin-orders.js`

## Uji kode
Jalankan `node --check web/admin-orders.js`. Tes manual di browser masih diperlukan untuk clipboard, dialog, cetak, serta koneksi Supabase.
