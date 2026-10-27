# Baylos — Penyatuan tema premium

- `index.html` kini menggunakan etalase modern sebagai halaman utama.
- `portal.html` menyimpan **seluruh kode halaman utama lama** tanpa penghapusan. Tautan Portal di etalase menuju file ini.
- `web/storefront.html` tetap tersedia dan menggunakan tema premium yang sama.
- `web/baylos-premium-theme.css` menyatukan warna charcoal, gold, ivory dan kartu produk compact di semua halaman `web/*.html`.
- Unggah **seluruh isi ZIP** ke root branch `supabase-integration`, jangan ke `main`.
- GitHub Pages harus dikonfigurasi ke branch pengujian atau gunakan deployment preview terpisah agar publik tidak terdampak.
- Perubahan ini khusus UI; checkout dan payment gateway masih belum siap produksi. SQL belum dijalankan.
