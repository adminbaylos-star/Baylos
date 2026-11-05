/* Baylos checkout: original flow + Biteship quotation integration.
   Order creation remains controlled by the server. */
(() => {
  'use strict';

  const $ = id => document.getElementById(id);
  const list = $('items');
  const form = $('form');
  const submit = $('submit');
  const result = $('result');
  const cart = window.BaylosVariantCart;
  const api = window.BaylosAPI;

  const money = value => new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(value);

  let itemsValid = false;
  let subtotalValue = 0;
  let selectedAreaId = '';
  let shippingOptions = [];

  function note(message, error = false) {
    result.textContent = message;
    result.style.color = error ? '#a12727' : '';
  }

  function line(label, quantity, price) {
    const li = document.createElement('li');
    li.textContent = `${label} · ${quantity} pcs` +
      (Number.isFinite(price) ? ' · ' + money(price * quantity) : '');
    return li;
  }

  // Add shipping-area controls without changing checkout.html.
  function setupShippingUI() {
    if ($('baylos-area-search')) return;

    const courierLabel = $('shipping_courier')?.closest('label');
    if (!courierLabel) {
      note('Elemen pilihan jasa kirim tidak ditemukan.', true);
      return;
    }

    const section = document.createElement('section');
    section.className = 'card';
    section.style.margin = '12px 0';
    section.innerHTML = `
      <h3>Wilayah tujuan pengiriman</h3>
      <label for="baylos-area-search">
        Cari kecamatan, kelurahan, atau kode pos pembeli
      </label>
      <input id="baylos-area-search" type="search"
        placeholder="Contoh: Pleret atau 55791"
        autocomplete="off">
      <button type="button" id="baylos-area-button">Cari wilayah</button>
      <label for="baylos-area-list">Pilih wilayah tujuan</label>
      <select id="baylos-area-list">
        <option value="">Cari wilayah terlebih dahulu</option>
      </select>
      <p id="baylos-area-status" class="muted" aria-live="polite">
        Pilih area tujuan sebelum menghitung ongkir.
      </p>
      <button type="button" id="baylos-rate-button">
        Hitung ongkir dari Biteship
      </button>
    `;

    courierLabel.before(section);

    $('baylos-area-button').addEventListener('click', searchAreas);
    $('baylos-area-search').addEventListener('keydown', event => {
      if (event.key === 'Enter') {
        event.preventDefault();
        searchAreas();
      }
    });

    $('baylos-area-list').addEventListener('change', event => {
      selectedAreaId = event.target.value;
      shippingOptions = [];
      resetShippingChoices();
      updateShippingSummary();
    });

    $('baylos-rate-button').addEventListener('click', getShippingRates);

    $('shipping_courier').addEventListener('change', updateServices);
    $('shipping_service').addEventListener('change', updateShippingSummary);

    $('shipping-estimate').textContent = 'Belum dihitung';
    $('review-total').textContent = 'Menunggu validasi server';
  }

  function resetShippingChoices() {
    const courier = $('shipping_courier');
    const service = $('shipping_service');

    courier.replaceChildren(new Option('Pilih jasa kirim', ''));
    service.replaceChildren(new Option('Pilih layanan', ''));

    courier.add(new Option(
      'Ambil sendiri (konfirmasi admin)', 'pickup'
    ));
  }

  async function searchAreas() {
    const query = $('baylos-area-search').value.trim();
    const status = $('baylos-area-status');
    const select = $('baylos-area-list');

    if (query.length < 2) {
      status.textContent = 'Masukkan minimal 2 karakter.';
      return;
    }

    if (!api?.searchBiteshipArea) {
      status.textContent = 'Fungsi pencarian area belum tersedia.';
      return;
    }

    status.textContent = 'Sedang mencari wilayah...';
    select.replaceChildren(new Option('Memuat hasil...', ''));

    try {
      const areas = await api.searchBiteshipArea(query);

      select.replaceChildren(new Option('Pilih wilayah tujuan', ''));

      areas.forEach(area => {
        const id = area.id || area.area_id;
        if (!id) return;

        const label = [
          area.name,
          area.administrative_division_level_3_name,
          area.administrative_division_level_2_name,
          area.administrative_division_level_1_name,
          area.postal_code
        ].filter(Boolean).join(', ');

        const option = new Option(label || String(id), String(id));
        select.add(option);
      });

      status.textContent = areas.length
        ? 'Pilih hasil yang paling sesuai dengan alamat pembeli.'
        : 'Wilayah tidak ditemukan. Coba nama kecamatan atau kode pos.';
    } catch (error) {
      select.replaceChildren(new Option('Pencarian gagal', ''));
      status.textContent = error.message || 'Gagal mencari wilayah.';
    }
  }

  function groupShippingItems() {
    const grouped = new Map();

    for (const item of cart.checkoutItems()) {
      const id = item.product_id;
      grouped.set(id, (grouped.get(id) || 0) + item.quantity);
    }

    return [...grouped.entries()].map(([product_id, quantity]) => ({
      product_id,
      quantity
    }));
  }

  async function getShippingRates() {
    const status = $('baylos-area-status');
    const button = $('baylos-rate-button');

    if (!selectedAreaId) {
      status.textContent = 'Cari dan pilih wilayah tujuan terlebih dahulu.';
      return;
    }

    if (!itemsValid) {
      status.textContent = 'Keranjang belum valid.';
      return;
    }

    if (!api?.client) {
      status.textContent = 'Supabase belum terhubung.';
      return;
    }

    button.disabled = true;
    button.textContent = 'Menghubungi Biteship...';
    status.textContent = 'Meminta tarif pengiriman...';

    try {
      const { data, error } = await api.client.functions.invoke(
        'shipping-rates',
        {
          body: {
            destination_area_id: selectedAreaId,
            items: groupShippingItems()
          }
        }
      );

      if (error) {
        let detail = error.message || 'Permintaan ongkir gagal.';
        try {
          if (error.context instanceof Response) {
            const response = await error.context.clone().json();
            detail = `HTTP ${error.context.status}: ${response.error || detail}`;
          }
        } catch (_) {}
        throw new Error(detail);
      }

      if (!data || !Array.isArray(data.pricing)) {
        throw new Error(data?.error || 'Respons tarif tidak valid.');
      }

      if (data.checkout_enabled !== false || data.indicative_only !== true) {
        throw new Error('Respons server tidak sesuai mode estimasi aman.');
      }

      shippingOptions = data.pricing.filter(item =>
        item &&
        typeof item.courier_code === 'string' &&
        typeof item.courier_service_code === 'string' &&
        Number.isFinite(Number(item.price)) &&
        Number(item.price) >= 0
      );

      populateCouriers();

      status.textContent = shippingOptions.length
        ? `Ditemukan ${shippingOptions.length} layanan. Pilih kurir dan layanannya. Tarif masih estimasi.`
        : 'Biteship tidak mengembalikan tarif untuk area tersebut.';
    } catch (error) {
      shippingOptions = [];
      populateCouriers();
      status.textContent = error.message || 'Gagal mengambil tarif ongkir.';
      $('shipping-estimate').textContent = 'Gagal dihitung';
      $('review-total').textContent = 'Menunggu validasi server';
    } finally {
      button.disabled = false;
      button.textContent = 'Hitung ulang ongkir';
    }
  }

  function populateCouriers() {
    const courier = $('shipping_courier');
    const service = $('shipping_service');

    courier.replaceChildren(new Option('Pilih jasa kirim', ''));
    service.replaceChildren(new Option('Pilih layanan', ''));

    const names = {
      jne: 'JNE',
      jnt: 'J&T Express',
      sicepat: 'SiCepat',
      anteraja: 'AnterAja',
      pos: 'POS Indonesia',
      tiki: 'TIKI'
    };

    const codes = [...new Set(
      shippingOptions.map(item => item.courier_code.toLowerCase())
    )];

    codes.forEach(code => {
      courier.add(new Option(names[code] || code.toUpperCase(), code));
    });

    courier.add(new Option(
      'Ambil sendiri (konfirmasi admin)', 'pickup'
    ));

    service.replaceChildren(new Option('Pilih layanan', ''));
    updateShippingSummary();
  }

  function updateServices() {
    const courier = $('shipping_courier').value;
    const service = $('shipping_service');

    service.replaceChildren(new Option('Pilih layanan', ''));

    if (courier === 'pickup') {
      service.add(new Option('Ambil sendiri', 'PICKUP'));
      updateShippingSummary();
      return;
    }

    shippingOptions
      .filter(item => item.courier_code.toLowerCase() === courier)
      .forEach(item => {
        const code = item.courier_service_code;
        const label = [
          item.courier_service_name || code,
          Number(item.price) >= 0 ? money(Number(item.price)) : '',
          item.duration || ''
        ].filter(Boolean).join(' · ');

        const option = new Option(label, code);
        option.dataset.price = String(item.price);
        service.add(option);
      });

    updateShippingSummary();
  }

  function updateShippingSummary() {
    const courier = $('shipping_courier').value;
    const service = $('shipping_service');
    const selected = service.selectedOptions[0];

    if (courier === 'pickup' && service.value === 'PICKUP') {
      $('shipping-estimate').textContent = 'Rp0 — perlu konfirmasi admin';
      $('review-total').textContent = 'Belum divalidasi server';
      return;
    }

    const price = Number(selected?.dataset?.price);

    if (courier && service.value && Number.isFinite(price) && price >= 0) {
      $('shipping-estimate').textContent = money(price) + ' (estimasi)';
      $('review-total').textContent =
        money(subtotalValue + price) + ' (perkiraan, belum final)';
    } else {
      $('shipping-estimate').textContent = 'Belum dihitung';
      $('review-total').textContent = 'Menunggu validasi server';
    }
  }

  async function render() {
    list.replaceChildren();
    itemsValid = false;

    const lines = cart?.read() || [];

    if (!lines.length) {
      list.append(line('Keranjang kosong', 0));
      $('subtotal').textContent = '—';
      $('review-subtotal').textContent = '—';
      note('Pilih produk di etalase terlebih dahulu.', true);
      submit.disabled = true;
      return;
    }

    const client = api?.client;

    if (!client) {
      lines.forEach(item =>
        list.append(line('Produk ' + item.product_id.slice(0, 8), item.quantity))
      );
      note('Koneksi Supabase belum tersedia.', true);
      submit.disabled = true;
      return;
    }

    const ids = [...new Set(lines.map(item => item.product_id))];
    const { data: products, error } = await client
      .from('products')
      .select('id,name,retail_price,is_active')
      .in('id', ids);

    if (error) {
      note('Gagal memuat rincian produk: ' + error.message, true);
      submit.disabled = true;
      return;
    }

    const map = new Map((products || []).map(p => [p.id, p]));
    let subtotal = 0;
    let valid = true;

    for (const item of lines) {
      const product = map.get(item.product_id);

      if (!product?.is_active) {
        valid = false;
        list.append(line('Produk tidak tersedia', item.quantity));
        continue;
      }

      const price = Number(product.retail_price);

      if (!Number.isFinite(price) || price < 0) {
        valid = false;
        list.append(line(product.name, item.quantity));
        continue;
      }

      subtotal += price * item.quantity;
      list.append(line(
        product.name + (item.variant_id
          ? ' · varian ' + item.variant_id.slice(0, 8) : ''),
        item.quantity,
        price
      ));
    }

    subtotalValue = subtotal;
    itemsValid = valid;

    $('subtotal').textContent = valid ? money(subtotal) : 'Perlu pemeriksaan produk';
    $('review-subtotal').textContent = valid ? money(subtotal) : '—';
    $('review-total').textContent = 'Menunggu validasi server';
    $('shipping-estimate').textContent = 'Belum dihitung';
    $('price-notice').textContent =
      'Harga ini adalah perkiraan retail; harga, stok, ongkir, dan total final harus dihitung ulang oleh server.';

    submit.disabled = !valid;
    note(valid
      ? 'Periksa kembali rincian. Ongkir masih perlu dihitung.'
      : 'Ada produk yang tidak tersedia. Perbarui keranjang.',
      !valid
    );
  }

  // Preserve original payment UI behavior.
  $('payment_bank').disabled = true;
  $('payment_method').addEventListener('change', () => {
    const manual = $('payment_method').value === 'manual_transfer';
    $('payment_bank').disabled = !manual;
    $('payment_bank').required = manual;
    if (!manual) $('payment_bank').value = '';
  });

  // Preserve the original order submission flow.
  // The server's create-order function remains authoritative and fail-closed.
  form.addEventListener('submit', async event => {
    event.preventDefault();

    if (!itemsValid || !cart?.checkoutItems().length) {
      note('Keranjang tidak valid atau kosong.', true);
      return;
    }

    const fd = new FormData(form);
    const courier = String(fd.get('shipping_courier') || '');
    const service = String(fd.get('shipping_service') || '');
    const method = String(fd.get('payment_method') || '');
    const bank = String(fd.get('payment_bank') || '');

    if (!courier || !service || !method ||
        (method === 'manual_transfer' && !bank)) {
      note('Lengkapi jasa kirim, layanan, dan metode pembayaran.', true);
      return;
    }

    if (courier !== 'pickup' && !selectedAreaId) {
      note('Cari dan pilih wilayah tujuan sebelum checkout.', true);
      return;
    }

    if ((courier === 'pickup') !== (service === 'PICKUP')) {
      note('Sesuaikan layanan ambil sendiri dengan pilihan jasa kirim.', true);
      return;
    }

    // A selected browser quote is not final server authorization.
    // Do not create an order from an unverified quote.
    note(
      'Tarif yang tampil hanya estimasi. Pembuatan pesanan tetap menunggu validasi server.',
      true
    );
    return;
  });

  $('refresh-cart')?.addEventListener('click', () =>
    render().catch(() => note('Gagal memuat keranjang.', true))
  );

  setupShippingUI();
  render().catch(() => note('Gagal memuat keranjang.', true));
})();
