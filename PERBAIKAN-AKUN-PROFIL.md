# Perbaikan profil dan menu admin

Masalah ditemukan: skrip `syncAccount()` pada `index.html` dijalankan sebelum elemen `profileDialog`, `profileLogout`, dan tombol terkait selesai dibaca browser. Akibatnya JavaScript berhenti dengan error `null`, sehingga menu profil/admin gagal diinisialisasi.

Perbaikan: memindahkan skrip sinkronisasi akun ke bagian paling akhir `<body>`, setelah seluruh elemen dialog tersedia. Tema dan katalog dipertahankan. Tidak mengubah SQL, data, atau konfigurasi Supabase.

Pengujian: pemeriksaan sintaks semua skrip inline dan urutan DOM lulus. Login dan hak admin belum dapat diuji langsung pada akun produksi.

Pemasangan: pada branch `supabase-integration`, cukup ganti `index.html` di root. Jika file web pendukung belum lengkap, unggah juga folder `web` dari paket ini. Jangan unggah ke `main`.

Setelah unggah: hard-refresh Chrome (atau buka tab samaran), masuk dengan akun admin, tekan Akun, periksa label Peran dan tautan Admin Produk/Pesanan. Jika profil masih gagal dibaca, salin pesan kesalahan yang tampil; kemungkinan RLS/profil perlu diperiksa.
