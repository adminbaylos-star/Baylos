/* Baylos admin product creation with multi-image gallery upload. */
(function () {
  'use strict';

  const $ = id => document.getElementById(id);
  const BUCKET = 'product-images';
  let previewUrls = [];

  function client() {
    const c = window.BaylosAPI?.client;
    if (!c) throw Error('Konfigurasi Supabase belum siap.');
    return c;
  }

  function status(message, kind = '') {
    const el = $('status');
    if (el) {
      el.textContent = message;
      el.className = 'status ' + kind;
    }
  }

  function files() {
    return Array.from($('newImageFile')?.files || []);
  }

  function validate() {
    const name = $('newName').value.trim();
    const category = $('newCategory').value.trim();
    const description = $('newDescription').value.trim();
    const price = Number($('newPrice').value);
    const stock = Number($('newStock').value);
    const picked = files();
    const url = $('newImageUrl').value.trim();

    if (!name) throw Error('Nama produk wajib diisi.');
    if (!Number.isSafeInteger(price) || price < 0)
      throw Error('Harga harus bilangan bulat tidak negatif.');
    if (!Number.isSafeInteger(stock) || stock < 0 || stock > 2147483647)
      throw Error('Stok harus bilangan bulat 0 atau lebih.');
    if (picked.length + Number(Boolean(url)) < 3)
      throw Error('Tambahkan minimal 3 foto melalui pilihan file dan/atau URL.');
    if (picked.length + Number(Boolean(url)) > 10)
      throw Error('Maksimal 10 foto per produk.');
    if (url && !/^https:\/\//i.test(url))
      throw Error('URL gambar harus menggunakan HTTPS.');

    for (const file of picked) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type))
        throw Error('Foto harus berformat JPG, PNG, atau WebP.');
      if (file.size > 5 * 1024 * 1024)
        throw Error('Ukuran setiap foto maksimal 5 MB.');
    }

    return { name, category, description, price, stock, picked, url };
  }

  function clearPreviews() {
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    previewUrls = [];
  }

  function renderPreviews() {
    clearPreviews();

    const wrap = $('newImagePreviewWrap');
    const box = $('newImagePreviews');
    const picked = files();

    if (!wrap || !box) return;

    box.replaceChildren();

    picked.forEach(file => {
      const card = document.createElement('div');
      const img = document.createElement('img');
      const label = document.createElement('div');
      const url = URL.createObjectURL(file);

      previewUrls.push(url);
      card.className = 'card';
      img.src = url;
      img.alt = 'Pratinjau ' + file.name;
      img.style.cssText =
        'width:100%;height:150px;object-fit:contain;border-radius:8px';

      label.textContent = file.name;
      label.className = 'muted';

      card.append(img, label);
      box.append(card);
    });

    wrap.classList.toggle('hidden', picked.length === 0);

    const count = $('newImageCount');
    if (count) {
      count.textContent =
        `${picked.length} foto dipilih` +
        (picked.length < 3 ? ' — minimal 3 foto.' : '.');
    }
  }

  async function requireAdmin() {
    const c = client();
    const { data: auth, error } = await c.auth.getUser();

    if (error || !auth?.user)
      throw Error('Silakan masuk dengan akun admin.');

    const result = await c.rpc('is_baylos_admin');
    if (result.error) throw Error(result.error.message);
    if (result.data !== true)
      throw Error('Akses ditolak: hanya admin Baylos.');

    return c;
  }

  function resetForm() {
    $('createProductForm')?.reset();
    if ($('newStock')) $('newStock').value = '0';

    clearPreviews();

    $('newImagePreviews')?.replaceChildren();
    $('newImagePreviewWrap')?.classList.add('hidden');

    if ($('newImageCount')) $('newImageCount').textContent = '';
  }

  $('newImageFile')?.addEventListener('change', renderPreviews);

  $('clearProductForm')?.addEventListener('click', resetForm);

  $('createProductForm')?.addEventListener('submit', async event => {
    event.preventDefault();

    const button = $('createProductButton');
    if (!button || button.disabled) return;

    button.disabled = true;
    let productId = null;
    const uploadedPaths = [];

    try {
      const d = validate();
      const c = await requireAdmin();

      const { data: product, error: productError } = await c
        .from('products')
        .insert({
          name: d.name,
          category: d.category || null,
          description: d.description || null,
          retail_price: d.price,
          stock: d.stock,
          is_active: false
        })
        .select('id, name')
        .single();

      if (productError)
        throw Error('Produk belum tersimpan: ' + productError.message);

      productId = product.id;

      const images = [];

      for (const file of d.picked) {
        const ext = file.type === 'image/png'
          ? 'png'
          : file.type === 'image/webp'
            ? 'webp'
            : 'jpg';

        // Gunakan folder konsisten: products/<productId>/<nama-file>
        const path =
          `products/${productId}/${crypto.randomUUID()}.${ext}`;

        const upload = await c.storage
          .from(BUCKET)
          .upload(path, file, {
            contentType: file.type,
            upsert: false
          });

        if (upload.error) {
          throw Error(
            `Upload ${file.name} gagal pada bucket ${BUCKET}: ` +
            upload.error.message
          );
        }

        uploadedPaths.push(path);

        const publicUrl = c.storage
          .from(BUCKET)
          .getPublicUrl(path)?.data?.publicUrl;

        if (!publicUrl)
          throw Error('URL publik foto tidak tersedia.');

        images.push({
          product_id: productId,
          image_url: publicUrl,
          sort_order: images.length
        });
      }

      if (d.url) {
        images.push({
          product_id: productId,
          image_url: d.url,
          sort_order: images.length
        });
      }

      if (images.length < 3)
        throw Error('Minimal 3 foto diperlukan.');

      const galleryResult = await c
        .from('product_images')
        .insert(images);

      if (galleryResult.error)
        throw Error(
          'Penyimpanan galeri gagal: ' + galleryResult.error.message
        );

      const mainImageResult = await c
        .from('products')
        .update({ image_url: images[0].image_url })
        .eq('id', productId);

      if (mainImageResult.error)
        throw Error(
          'Galeri tersimpan, tetapi foto utama gagal diperbarui: ' +
          mainImageResult.error.message
        );

      status(
        `Produk "${product.name}" berhasil disimpan dengan ` +
        `${images.length} foto. Status NONAKTIF; periksa dahulu sebelum dipublikasikan.`,
        'success'
      );

      resetForm();

      window.dispatchEvent(
        new CustomEvent('baylos:product-created', {
          detail: { id: productId }
        })
      );

    } catch (error) {
      // Produk tetap nonaktif jika ada bagian proses yang gagal.
      // Jangan hapus file otomatis karena galeri mungkin sudah berhasil tersimpan.
      status(
        (productId ? 'Produk dibuat tetapi proses belum selesai: ' : '') +
        (error?.message || String(error)),
        'error'
      );
    } finally {
      button.disabled = false;
    }
  });
})();
