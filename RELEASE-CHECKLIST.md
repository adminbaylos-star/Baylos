# Checklist sebelum produksi

- [ ] Tes login demo dan registrasi; ingat ini hanya browser/localStorage.
- [ ] Tes pencarian, kategori, galeri foto, detail produk, cart, kuantitas, dan WhatsApp.
- [ ] Tes admin: produk tambah/edit/aktif-nonaktif, daftar reseller, tier, settings.
- [ ] Verifikasi tidak ada secret di HTML/GitHub.
- [ ] Implementasikan Supabase Auth; hapus kredensial demo sebelum publikasi.
- [ ] Pastikan role admin ditentukan server-side dan tidak bisa diubah user.
- [ ] Migrasikan produk/katalog dengan pemetaan ID yang benar dan pertahankan data yang ada.
- [ ] Buat order lewat server/RPC tepercaya dengan harga, total, stok, alamat, dan status tervalidasi.
- [ ] Tambahkan alur pembayaran dan validasi pembayaran server-side.
- [ ] Uji RLS untuk anon, customer, reseller pending/approved, admin.
- [ ] Verifikasi skema `orders.id` dan `orders.customer_id` sebelum menjalankan migration shipments.
- [ ] Konfigurasikan origin area Biteship berdasarkan gudang aktual dan API resmi.
- [ ] Terapkan signature/authenticity verification webhook Biteship dan idempotensi event.
- [ ] Uji kegagalan API, webhook duplikat, retry, status pembayaran, dan pencegahan shipment ganda.
- [ ] Uji Android, desktop, dan mobile sebelum merge ke `main`.

## Uji checkout web langsung (ditambahkan)
- [ ] Keranjang kosong: checkout harus ditolak dengan pesan.
- [ ] Tambahkan produk dan beberapa varian; subtotal dan jumlah sesuai.
- [ ] Buka checkout, wajibkan nama, telepon, alamat, kurir, metode pembayaran, dan persetujuan.
- [ ] Buat pesanan; tampilkan nomor order dan simpan ke `localStorage.baylosOrders`.
- [ ] Pastikan tidak ada navigasi otomatis ke `wa.me` dari alur pesan/keranjang.
- [ ] Pastikan mode demo ditandai dengan jelas dan tidak dikira pembayaran/ongkir live.
- [ ] Sebelum live, uji order Supabase dengan harga/stok dari database, race condition stok, RLS, role reseller/admin, payment webhook, dan Biteship webhook.
