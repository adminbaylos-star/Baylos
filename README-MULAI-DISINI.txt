BAYLOS.ID — PAKET MODUL INTEGRASI SUPABASE (TAHAP 1)

PENTING: Paket ini TIDAK mengganti index.html asli, sehingga desain Baylos.id tidak berubah.
Modul API telah dibuat, tetapi belum disambungkan ke event login/katalog/checkout pada index.html asli.
Checkout belum dapat digunakan: Edge Function create-order pada repo sebelumnya masih dinonaktifkan.
Jangan menganggap ini website yang sudah siap menerima pembayaran/pesanan nyata.

LANGKAH UPLOAD KE GITHUB (BRANCH supabase-integration, BUKAN main):
1. Ekstrak ZIP ini.
2. Upload kedua file di folder web/ ke folder web/ repository yang sama.
3. Buka index.html di GitHub, Edit, tambahkan TEPAT SEBELUM </body>:
   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>
   <script src="web/baylos-supabase-config.js"></script>
   <script src="web/baylos-supabase.js"></script>
4. Edit web/baylos-supabase-config.js dan isi Project URL dan publishable/anon key.
   Jangan isi service_role, sb_secret, atau password database.
5. Commit di branch supabase-integration. GitHub Pages biasanya menampilkan branch yang diatur di Settings > Pages;
   jangan ubah pengaturan Pages tanpa sengaja.
6. Uji di browser console: BaylosAPI.ready (harus true); await BaylosAPI.products().

PERINGATAN KEAMANAN:
- Jangan gunakan checkout nyata sampai Edge Function memvalidasi ongkir dari server, harga, stok, dan identitas.
- Tidak ada data database yang dihapus atau migrasi SQL yang dijalankan oleh paket ini.
- Agar UI asli benar-benar memakai API, handler demo pada index.html perlu diubah secara hati-hati.
- Jika produk kosong di Supabase, API products() akan mengembalikan array kosong.

CONTOH PENGGUNAAN DARI JAVASCRIPT:
await BaylosAPI.signIn('email@example.com','password');
await BaylosAPI.products();
await BaylosAPI.profile();
await BaylosAPI.orders();

Paket disusun berdasarkan file index.html dan helper di branch supabase-integration yang diperiksa.
