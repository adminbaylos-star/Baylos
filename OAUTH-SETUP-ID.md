# Pengaturan OAuth Baylos (Google, Facebook, GitHub)

Frontend kini memanggil Supabase Auth OAuth untuk Google, Facebook, dan GitHub. Provider belum otomatis aktif hanya karena tombol tampil; aktifkan masing-masing provider di dashboard Supabase.

## Checklist wajib sebelum menguji
1. Buka Supabase Dashboard → Authentication → Sign In / Providers.
2. Aktifkan Google dan masukkan OAuth Client ID serta Client Secret dari Google Cloud Console.
3. Aktifkan Facebook dan masukkan App ID serta App Secret dari Meta for Developers.
4. (Opsional) Aktifkan GitHub dan masukkan Client ID serta Client Secret dari GitHub OAuth App.
5. Di setiap konsol provider, daftarkan callback URL yang ditampilkan Supabase untuk proyek ini (Authentication → URL Configuration / provider settings). Callback provider adalah URL Supabase, bukan URL storefront.
6. Di Supabase → Authentication → URL Configuration, masukkan URL storefront yang sebenarnya ke Site URL / Redirect URLs, termasuk jalur `web/storefront.html` pada deployment yang digunakan. Tambahkan localhost hanya untuk pengembangan.
7. Pastikan domain HTTPS pada produksi dan uji login, pembatalan consent, akun baru, akun yang sudah ada, logout, dan pemulihan sesi.

## Catatan keamanan
- Jangan commit OAuth client secret, Supabase secret key, atau service-role key ke repository/frontend.
- Publishable/anon key di browser bukan pengganti RLS. Uji policy untuk `profiles`, produk, pesanan, chat, dan tabel reseller.
- Periksa trigger/database function yang membuat baris `profiles` untuk user baru; OAuth user juga harus mendapat profil dengan role default non-admin. Jangan percaya metadata user untuk menentukan role admin.
- Google/Facebook/GitHub harus diaktifkan dan redirect URL harus cocok di dashboard; kode frontend tidak bisa mengaktifkan provider dari sisi aplikasi.
- Checkout tetap nonaktif sampai audit skema, RLS, kalkulasi server, stok atomik, idempotensi, dan alur pembayaran selesai.
