/* Baylos Admin Inventory — load after web/baylos-supabase.js. */
(function () {
  'use strict';
  function api() {
    const c = window.BaylosAPI?.client;
    if (!c) throw new Error('Supabase belum terhubung.');
    return c;
  }
  function unwrap({ data, error }) {
    if (error) throw new Error(error.message);
    return data;
  }
  async function admin() {
    const c = api();
    const { data: { user }, error } = await c.auth.getUser();
    if (error || !user) throw new Error('Login admin diperlukan.');
    if (unwrap(await c.rpc('is_baylos_admin')) !== true)
      throw new Error('Akses ditolak: akun bukan admin Baylos.');
    return c;
  }
  function stockNumber(value) {
    if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0 || value > 2147483647)
      throw new Error('Stok harus bilangan bulat antara 0 dan 2.147.483.647.');
    return value;
  }
  function priceNumber(value) {
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0)
      throw new Error('Harga tidak valid.');
    return value;
  }
  async function listProducts() {
    const c = await admin();
    return unwrap(await c.from('products')
      .select('id,name,retail_price,stock,is_active,created_at')
      .order('created_at', { ascending: false }));
  }
  async function listVariants(productId) {
    const c = await admin();
    if (!productId) throw new Error('ID produk wajib diisi.');
    return unwrap(await c.from('product_variants')
      .select('id,product_id,sku,size,color,stock,price_adjustment,is_active')
      .eq('product_id', productId));
  }
  async function setProductStock(productId, stock) {
    const c = await admin();
    if (!productId) throw new Error('ID produk wajib diisi.');
    const variants = unwrap(await c.from('product_variants').select('id').eq('product_id', productId).limit(1));
    if (variants?.length) throw new Error('Produk memiliki varian. Ubah stok pada setiap varian, bukan stok utama.');
    return unwrap(await c.from('products').update({ stock: stockNumber(stock) })
      .eq('id', productId).select('id,name,stock,is_active').single());
  }
  async function setVariantStock(productId, variantId, stock) {
    const c = await admin();
    if (!productId || !variantId) throw new Error('ID produk dan varian wajib diisi.');
    return unwrap(await c.from('product_variants').update({ stock: stockNumber(stock) })
      .eq('id', variantId).eq('product_id', productId)
      .select('id,product_id,sku,size,color,stock').single());
  }
  async function updateProductDetails(productId, details) {
    const c = await admin();
    if (!productId) throw new Error('ID produk wajib diisi.');
    const name = String(details?.name ?? '').trim();
    const category = String(details?.category ?? '').trim();
    const description = String(details?.description ?? '').trim();
    if (!name || name.length > 160) throw new Error('Nama produk wajib diisi (maksimal 160 karakter).');
    if (category.length > 100) throw new Error('Kategori maksimal 100 karakter.');
    if (description.length > 5000) throw new Error('Deskripsi maksimal 5.000 karakter.');
    return unwrap(await c.from('products').update({name, category: category || null, description: description || null})
      .eq('id', productId).select('id,name,category,description').single());
  }
  async function setProductPrice(productId, price) {
    const c = await admin();
    if (!productId) throw new Error('ID produk wajib diisi.');
    return unwrap(await c.from('products').update({ retail_price: priceNumber(price) })
      .eq('id', productId).select('id,name,retail_price').single());
  }
  async function setPublished(productId, published) {
    const c = await admin();
    if (!productId || typeof published !== 'boolean') throw new Error('ID produk atau status tidak valid.');
    return unwrap(await c.from('products').update({ is_active: published })
      .eq('id', productId).select('id,name,is_active').single());
  }
  async function setShippingWeight(productId, grams) {
    const n = Number(grams);
    if (!Number.isSafeInteger(n) || n < 1 || n > 100000) throw Error('Berat tidak valid.');
    const c = await admin();
    return unwrap(await c.from('products').update({ weight_grams: n })
      .eq('id', productId).select('id,weight_grams').single());
  }
  async function setStockVerified(productId, verified) {
    if (typeof verified !== 'boolean') throw Error('Status verifikasi tidak valid.');
    const c = await admin();
    return unwrap(await c.from('products').update({ stock_verified: verified })
      .eq('id', productId).select('id,stock_verified').single());
  }
  window.BaylosAdminInventory = Object.freeze({
    listProducts, listVariants, setProductStock, setVariantStock, updateProductDetails, setProductPrice, setPublished, setShippingWeight, setStockVerified
  });
})();
