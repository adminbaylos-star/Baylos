# Tahap 31 — Tambah Produk dengan Galeri Multi-Foto

- Form admin menerima hingga 10 gambar per produk; minimal 3 foto gabungan berkas dan/atau URL HTTPS.
- Format JPG/PNG/WebP, maksimal 5 MB per gambar. Pratinjau lokal ditampilkan sebelum simpan.
- Upload memerlukan bucket Supabase Storage `baylos-products` (atau `window.BAYLOS_PRODUCT_IMAGE_BUCKET`) dan policies yang membatasi unggah ke admin.
- Produk dibuat `is_active=false` agar admin meninjau foto, harga, dan stok sebelum tayang.
- Tidak menjalankan SQL atau mengubah database otomatis.
- Belum diuji end-to-end terhadap Supabase produksi; perlu pengujian setelah bucket dan policies disiapkan.
