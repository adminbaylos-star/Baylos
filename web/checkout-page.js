
/* Baylos checkout + Biteship shipping quotation.
   Shipping quotes are estimates only. Order creation remains disabled
   until the server-side schema and transactional audit is complete. */
(() => {
  'use strict';

  const $ = id => document.getElementById(id);
  const list = $('items');
  const form = $('form');
  const submit = $('submit');
  const result = $('result');

  const cart = window.BaylosVariantCart;
  const client = window.BaylosAPI?.client;

  const money = value => new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(value);

  let itemsValid = false;
  let selectedArea = null;
  let shippingOptions = [];
  let subtotalValue = 0;

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

  // Create destination area search controls without changing checkout.html.
  function prepareShippingUI() {
    const courier = $('shipping_courier');
    if (!courier || $('destination-area-search')) return;

    const wrapper = document.createElement('section');
    wrapper.className = 'card';
    wrapper.style.margin = '12px 0';
    wrapper.innerHTML = `
      <h3>Wilayah tujuan pengiriman</h3>
      <label for="destination-area-search">
        Cari kecamatan, kelurahan, atau kode pos pembeli
      </label>
      <input id="destination-area-search"
        type="search"
        placeholder="Contoh: Pleret atau 55791"
        autocomplete="off">
      <button type="button" id="destination-area-button">
        Cari wilayah
      </button>
      <label for="destination-area-result">Pilih wilayah tujuan</label>
      <select id="destination-area-result">
        <option value="">Cari dan pilih wilayah terlebih dahulu</option>
      </select>
      <p id="destination-area-status" class="muted" aria-live="polite">
        Tarif ongkir akan dicari berdasarkan wilayah yang dipilih.
      </p>
      <button type="button" id="get-shipping-rates">
        Hitung ongkir dari Biteship
      </button>
    `;

    courier.closest('label')?.before(wrapper);

    $('shipping-estimate').textContent = 'Belum dihitung';
    $('review-total').textContent = 'Menunggu validasi server';

    $('destination-area-button').addEventListener('click', searchAreas);
    $('destination-area-search').addEventListener('keydown', event => {
      if (event.key === 'Enter') {
        event.preventDefault();
        searchAreas();
      }
    });

    $('destination-area-result').addEventListener('change', () => {
      const select = $('destination-area-result');
      selectedArea = select.value
        ? JSON.parse(select.selectedOptions[0].dataset.area)
        : null;

      shippingOptions = [];
      resetCourierOptions();
      updateEstimate();
    });

    $('get-shipping-rates').addEventListener('click', getShippingRates);
    resetCourierOptions();
  }

  function resetCourierOptions() {
    const courier = $('shipping_courier');
    const service = $('shipping_service');
    if (!courier || !service) return;

    courier.replaceChildren(new Option('Pilih jasa kirim', ''));
    service.replaceChildren(new Option('Pilih layanan', ''));

    // Pickup remains a manual/admin-confirmed option, not a Biteship quote.
    courier.add(new Option('Ambil sendiri (konfirmasi admin)', 'pickup'));
    courier.addEventListener('change', updateServiceOptions, { once: true });
  }

  function updateServiceOptions() {
    const courier = $('shipping_courier');
    const service = $('shipping_service');
    const chosen = courier.value;

    service.replaceChildren(new Option('Pilih layanan', ''));

    if (chosen === 'pickup') {
      service.add(new Option('Ambil sendiri', 'PICKUP'));
      updateEstimate();
      return;
    }

    shippingOptions
      .filter(item => item.courier_code === chosen)
      .forEach(item => {
        const option = new Option(
          `${item.courier_service_name || item.courier_service_code || 'Layanan'} — ${money(item.price)}${item.duration ? ' · ' + item.duration : ''}`,
          item.courier_service_code || item.courier_service_name || ''
        );
        option.dataset.price = String(item.price);
        service.add(option);
      });

    updateEstimate();
  }

  function setCourierOptions(pricing) {
    const courier = $('shipping_courier');
    const service = $('shipping_service');

    courier.replaceChildren(new Option('Pilih jasa kirim', ''));
    service.replaceChildren(new Option('Pilih layanan', ''));

    const codes = [...new Set(
      pricing.map(item => String(item.courier_code || '').toLowerCase())
        .filter(Boolean)
    )];

    const labels = {
      jne: 'JNE',
      jnt: 'J&T Express',
      sicepat: 'SiCepat',
      anteraja: 'AnterAja',
      pos: 'POS Indonesia',
      tiki: 'TIKI'
    };

    codes.forEach(code => {
      courier.add(new Option(labels[code] || code.toUpperCase(), code));
    });

    courier.add(new Option('Ambil sendiri (konfirmasi admin)', 'pickup'));
    courier.onchange = updateServiceOptions;
    service.onchange = updateEstimate;
  }

  function updateEstimate() {
    const courier = $('shipping_courier')?.value || '';
    const service = $('shipping_service');
    const selected = service?.selectedOptions?.[0];
    const shipping = $('shipping-estimate');
    const total = $('review-total');

    if (courier === 'pickup' && service?.value === 'PICKUP') {
      shipping.textContent = 'Rp0 — perlu konfirmasi admin';
      total.textContent = 'Belum divalidasi server';
      return;
    }

    const price = Number(selected?.dataset?.price);

    if (courier && service?.value && Number.isFinite(price) && price >= 0) {
      shipping.textContent = money(price) + ' (estimasi Biteship)';
      total.textContent = money(subtotalValue + price) + ' (perkiraan)';
    } else {
      shipping.textContent = 'Belum dihitung';
      total.textContent = 'Menunggu validasi server';
    }
  }

  async function searchAreas() {
    const query = $('destination-area-search').value.trim();
    const status = $('destination-area-status');
    const select = $('destination-area-result');

    if (query.length < 2) {
      status.textContent = 'Masukkan minimal 2 karakter.';
      return;
    }

    if (!window.BaylosAPI?.searchBiteshipArea) {
      status.textContent = 'Fungsi pencarian area belum tersedia.';
      return;
    }

    status.textContent = 'Mencari wilayah...';
    select.replaceChildren(new Option('Memuat hasil...', ''));

    try {
      const areas = await window.BaylosAPI.searchBiteshipArea(query);

      select.replaceChildren(new Option('Pilih wilayah tujuan', ''));

      if (!areas.length) {
        status.textContent = 'Wilayah tidak ditemukan. Coba nama kecamatan atau kode pos.';
        return;
      }

      areas.forEach(area => {
        const id = area.id || area.area_id;
        if (!id) return;

        const name = [
          area.name,
          area.administrative_division_level_3_name,
          area.administrative_division_level_2_name,
          area.administrative_division_level_1_name,
          area.postal_code
        ].filter(Boolean).join(', ');

        const option = new Option(name || String(id), String(id));
        option.dataset.area = JSON.stringify(area);
        select.add(option);
      });

      status.textContent = 'Pilih wilayah yang paling sesuai dengan alamat pembeli.';
    } catch (error) {
      select.replaceChildren(new Option('Pencarian gagal', ''));
      status.textContent = error.message || 'Gagal mencari wilayah.';
    }
  }

  async function getShippingRates() {
    const status = $('destination-area-status');
    const button = $('get-shipping-rates');

    if (!selectedArea) {
      status.textContent = 'Cari dan pilih wilayah tujuan pembeli terlebih dahulu.';
      return;
    }

    if (!itemsValid) {
      status.textContent = 'Keranjang belum valid.';
      return;
    }

    const session = await window.BaylosAPI.session().catch(() => null);
    if (!session?.user) {
      status.textContent = 'Silakan login terlebih dahulu.';
      return;
    }

    // Aggregate same product across variants because shipping-rates
    // accepts one entry per product ID.
    const grouped = new Map();
    for (const item of cart?.checkoutItems() || []) {
      const id = item.product_id || item.id;
      grouped.set(id, (grouped.get(id) || 0) + Number(item.quantity));
    }

    const items = [...grouped.entries()].map(([product_id, quantity]) => ({
      product_id,
      quantity
    }));

    if (!items.length) {
      status.textContent = 'Keranjang kosong.';
      return;
    }

    button.disabled = true;
    button.textContent = 'Menghubungi Biteship...';
    status.textContent = 'Meminta tarif pengiriman...';

    try {
      const { data, error } = await client.functions.invoke('shipping-rates', {
        body: {
          destination_area_id: selectedArea.id || selectedArea.area_id,
          items
        }
      });

      if (error) throw error;
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

      setCourierOptions(shippingOptions);

      if (!shippingOptions.length) {
        status.textContent = 'Biteship belum mengembalikan layanan untuk wilayah ini.';
        $('shipping-estimate').textContent = 'Tarif tidak tersedia';
        $('review-total').textContent = 'Menunggu validasi server';
      } else {
        status.textContent = `Ditemukan ${shippingOptions.length} pilihan layanan. Pilih jasa kirim dan layanannya. Tarif masih berupa estimasi.`;
      }
       } catch (error) {
      shippingOptions = [];
      setCourierOptions([]);

      let detail = error.message || 'Gagal mengambil tarif Biteship.';

      try {
        if (error.context instanceof Response) {
          const response = error.context.clone();
          const body = await response.json();
          detail = `HTTP ${response.status}: ${body.error || JSON.stringify(body)}`;
        }
      } catch (_) {
        // Pertahankan pesan error asli jika respons tidak bisa dibaca.
      }

      status.textContent = detail;
      $('shipping-estimate').textContent = 'Gagal dihitung';
      $('review-total').textContent = 'Menunggu validasi server';
      console.error('Baylos shipping error:', error, detail);
    } finally {
      button.disabled = false;
      button.textContent = 'Hitung ulang ongkir';
    }
    finally {
      button.disabled = false;
      button.textContent = 'Hitung ulang ongkir';
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

    const map = new Map((products || []).map(product => [product.id, product]));
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
        product.name + (item.variant_id ? ' · varian ' + item.variant_id.slice(0, 8) : ''),
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
      'Harga ini adalah perkiraan retail. Harga, stok, ongkir, dan total final harus dihitung ulang oleh server.';

    submit.disabled = true;
    submit.textContent = 'Checkout belum diaktifkan';
    note(valid
      ? 'Tarif ongkir dapat diuji. Pembuatan pesanan masih dinonaktifkan demi keamanan.'
      : 'Ada produk yang tidak tersedia. Perbarui keranjang.', !valid);
  }

  // Payment controls remain informational; no payment or order is initiated.
  $('payment_bank').disabled = true;
  $('payment_method').addEventListener('change', () => {
    const manual = $('payment_method').value === 'manual_transfer';
    $('payment_bank').disabled = !manual;
    $('payment_bank').required = manual;
    if (!manual) $('payment_bank').value = '';
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    note(
      'Pembuatan pesanan masih dinonaktifkan. Tarif yang tampil hanya estimasi; belum ada transaksi atau pembayaran.',
      true
    );
  });

  $('refresh-cart')?.addEventListener('click', () =>
    render().catch(() => note('Gagal memuat keranjang.', true))
  );

  prepareShippingUI();
  render().catch(() => note('Gagal memuat keranjang.', true));
})();
