# Tahap 19 — Pengaturan Komisi Admin

## Perubahan
- `web/admin-commission.html`: UI untuk menambah dan mengedit aturan komisi.
- `web/admin-commission.js`: validasi nilai, daftar aturan, ubah status lokal, hapus draf, riwayat perubahan lokal, ekspor JSON.
- Tidak ada query SQL yang dijalankan dan tidak ada permintaan ke Supabase dari halaman ini.

## Penting
Semua data pada halaman ini adalah draf `localStorage` di browser saat ini. Status “Aktif (lokal)” bukan status produksi dan tidak menghitung atau membayar komisi nyata. Tombol ini tidak aman sebagai kontrol otorisasi produksi; backend harus memverifikasi role admin, menyimpan aturan di database, mencatat audit server-side, serta menghitung komisi dari pesanan valid.

## Cara membuka
Buka `web/admin-commission.html` melalui server lokal atau halaman situs saat struktur folder `web/` tersedia. Halaman ini berdiri sendiri untuk perancangan UI. Hubungkan ke navigasi admin setelah integrasi diuji.

## Pemeriksaan
Jalankan `node --check web/admin-commission.js`. Uji tambah/edit, validasi persentase 0–100, jeda/aktif lokal, ekspor JSON, dan hapus draf. Jangan memasukkan data pribadi/rahasia.
