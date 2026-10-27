# Tahap 22–30 — Paket lanjutan Baylos

Paket ini melanjutkan kode dari Tahap 21 dan menyiapkan halaman UI tambahan. SQL sengaja tidak dijalankan dan tidak ada migrasi baru yang otomatis dieksekusi.

## Isi tahap
- **22** `web/affiliate-commissions.html`: tampilan riwayat komisi, filter status, ekspor CSV kosong bila server belum menyediakan data.
- **23** `web/affiliate-payout.html`: formulir pencairan dengan validasi input lokal; belum membuat permintaan pembayaran.
- **24** `web/account-settings.html`: pengaturan profil sebagai draf lokal; tidak menyimpan kata sandi.
- **25** `web/storefront.html`: filter kategori dan pengurutan katalog (bergantung pada data produk yang dikirim API).
- **26** Detail produk/varian/galeri menggunakan alur yang sudah ada pada etalase; tetap perlu uji browser.
- **27** Checkout tetap halaman persiapan sampai stok, harga, ongkir, dan pembayaran diverifikasi server.
- **28** `web/help-center.html`: pusat bantuan dan template kebijakan.
- **29** Tautan navigasi ke halaman afiliasi/akun/bantuan.
- **30** Checklist integrasi dan QA di bawah.

## Batasan yang perlu diketahui
Halaman baru tidak berarti integrasi backend sudah aktif. Data profil draf tersimpan di browser perangkat itu saja. Riwayat komisi/pencairan sengaja tidak menampilkan angka simulasi. Persetujuan afiliasi, KTP, pembayaran, resi, dan komisi membutuhkan endpoint serta kebijakan akses server. Jangan unggah KTP asli ke penyimpanan publik.

## Urutan integrasi akhir
1. Audit struktur tabel/policies yang benar-benar ada.
2. Siapkan migration SQL terpadu, review, backup, lalu jalankan sekali dalam urutan dependensi.
3. Aktifkan Storage privat dan kebijakan akses KTP.
4. Hubungkan auth/profile/admin menggunakan role yang tervalidasi server-side.
5. Hubungkan katalog, gambar, varian, keranjang dan checkout dengan validasi harga/stok server-side.
6. Hubungkan pembayaran dan pengiriman melalui server/Edge Functions; jangan taruh secret di browser.
7. Hubungkan referral dan komisi idempoten setelah pesanan lunas dan selesai, dengan pembatalan/refund diperhitungkan.
8. Uji dengan akun pembeli, admin, dan afiliator terpisah sebelum rilis.

## Checklist manual
- [ ] Buka setiap halaman di HP dan desktop.
- [ ] Uji form kosong, format salah, dan tombol batal.
- [ ] Pastikan tidak ada angka komisi atau saldo contoh yang terlihat sebagai data asli.
- [ ] Pastikan error koneksi jelas dan tidak membuat klaim berhasil palsu.
- [ ] Pastikan `service_role`, token rahasia, dan KTP tidak pernah dikirim ke frontend/public repo.
- [ ] Periksa semua link relatif dan konsol browser.
- [ ] Jangan menggabungkan ke branch `main` sampai QA selesai.
