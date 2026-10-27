# Baylos Admin Premium — pembaruan navigasi

- Dashboard admin baru di `web/admin-dashboard.html`, dengan pemeriksaan sesi dan peran admin dari Supabase.
- Menu profil marketplace kini menyediakan Dashboard Admin, Produk, dan Pesanan.
- Navigasi konsisten pada halaman admin produk dan pesanan.
- Tampilan katalog utama dan tema premium tetap dipertahankan.
- Persetujuan reseller, payment gateway, serta perubahan status pengiriman **belum diimplementasikan**; tidak ditampilkan sebagai fitur aktif.
- Belum diuji langsung dengan database Supabase.
- Unggah **seluruh isi** paket ke branch `supabase-integration`, bukan hanya `index.html`, karena terdapat dua file baru dalam folder `web`. Jangan mengubah `main`.
