/* Baylos: Supabase product gallery and variant access. */
(function () {
  'use strict';

  function client() {
    const c = window.BaylosAPI?.client;
    if (!c) throw new Error('Koneksi Supabase belum siap.');
    return c;
  }

  function value(result) {
    if (result.error) throw new Error(result.error.message);
    return result.data;
  }

  async function productDetail(productId, options = {}) {
    if (!productId) throw new Error('ID produk wajib diisi.');

    const c = client();
    const includeInactive = options.includeInactive === true;

    const [productResult, imagesResult, variantsResult] = await Promise.all([
      c.from('products')
        .select('id,name,description,category,image_url,retail_price,stock,is_active')
        .eq('id', productId)
        .single(),

      c.from('product_images')
        .select('id,product_id,image_url,sort_order')
        .eq('product_id', productId)
        .order('sort_order', { ascending: true }),

      c.from('product_variants')
        .select('id,product_id,sku,size,color,stock,price_adjustment,is_active')
        .eq('product_id', productId)
        .eq('is_active', true)
    ]);

    const product = value(productResult);

    if (!product) throw new Error('Produk tidak ditemukan.');

    if (!includeInactive && product.is_active !== true) {
      throw new Error('Produk ini belum tersedia untuk pembeli.');
    }

    const storedImages = value(imagesResult) || [];
    const variants = value(variantsResult) || [];

    const images = [...storedImages];

    // Pastikan foto utama ikut tampil jika belum ada di tabel galeri.
    if (
      product.image_url &&
      !images.some(image => image.image_url === product.image_url)
    ) {
      images.unshift({
        id: null,
        product_id: product.id,
        image_url: product.image_url,
        sort_order: -1
      });
    }

    images.sort((a, b) => a.sort_order - b.sort_order);

    return { product, images, variants };
  }

  async function adminClient() {
    const c = client();
    const auth = await c.auth.getUser();

    if (auth.error || !auth.data?.user) {
      throw new Error('Silakan masuk dengan akun admin.');
    }

    const isAdmin = value(await c.rpc('is_baylos_admin'));

    if (isAdmin !== true) {
      throw new Error('Hanya admin Baylos yang dapat mengelola produk.');
    }

    return c;
  }

  async function addImage(productId, imageUrl, sortOrder = 0) {
    const c = await adminClient();

    if (!productId || !/^https:\/\//i.test(imageUrl || '')) {
      throw new Error('ID produk dan URL gambar HTTPS wajib diisi.');
    }

    if (!Number.isInteger(Number(sortOrder))) {
      throw new Error('Urutan gambar tidak valid.');
    }

    return value(
      await c.from('product_images')
        .insert({
          product_id: productId,
          image_url: imageUrl,
          sort_order: Number(sortOrder)
        })
        .select()
        .single()
    );
  }

  async function updateImage(imageId, imageUrl, sortOrder) {
    const c = await adminClient();

    if (!imageId || !/^https:\/\//i.test(imageUrl || '')) {
      throw new Error('ID gambar dan URL HTTPS wajib diisi.');
    }

    if (!Number.isInteger(Number(sortOrder))) {
      throw new Error('Urutan gambar tidak valid.');
    }

    return value(
      await c.from('product_images')
        .update({
          image_url: imageUrl,
          sort_order: Number(sortOrder)
        })
        .eq('id', imageId)
        .select()
        .single()
    );
  }

  async function deleteImage(imageId) {
    const c = await adminClient();

    if (!imageId) throw new Error('ID gambar wajib diisi.');

    return value(
      await c.from('product_images')
        .delete()
        .eq('id', imageId)
        .select('id')
        .single()
    );
  }

  async function saveVariant(productId, input) {
    const c = await adminClient();

    const stock = Number(input?.stock);
    const adjustment = Number(input?.price_adjustment ?? 0);

    if (
      !productId ||
      !Number.isInteger(stock) ||
      stock < 0 ||
      !Number.isFinite(adjustment)
    ) {
      throw new Error('ID produk, stok, atau harga tidak valid.');
    }

    const row = {
      product_id: productId,
      sku: input.sku || null,
      size: input.size || null,
      color: input.color || null,
      stock,
      price_adjustment: adjustment,
      is_active: input.is_active !== false
    };

    const query = input.id
      ? c.from('product_variants')
          .update(row)
          .eq('id', input.id)
          .eq('product_id', productId)
      : c.from('product_variants').insert(row);

    return value(await query.select().single());
  }

  async function deleteVariant(variantId) {
    const c = await adminClient();

    if (!variantId) throw new Error('ID varian wajib diisi.');

    return value(
      await c.from('product_variants')
        .delete()
        .eq('id', variantId)
        .select('id')
        .single()
    );
  }

  window.BaylosProductData = Object.freeze({
    productDetail,
    addImage,
    updateImage,
    deleteImage,
    saveVariant,
    deleteVariant
  });
})();
