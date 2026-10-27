/* Baylos checkout UX. Server remains authoritative for price, stock, shipping, and order creation. */
(()=>{'use strict';
const $=id=>document.getElementById(id),list=$('items'),form=$('form'),submit=$('submit'),result=$('result');
const cart=window.BaylosVariantCart;const money=v=>new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(v);
let itemsValid=false;
function note(s,error=false){result.textContent=s;result.style.color=error?'#a12727':'';}
function line(label,quantity,price){const li=document.createElement('li');li.textContent=`${label} · ${quantity} pcs${Number.isFinite(price)?' · '+money(price*quantity):''}`;return li;}
async function render(){list.replaceChildren();itemsValid=false;const lines=cart?.read()||[];
 if(!lines.length){list.append(line('Keranjang kosong',0));$('subtotal').textContent='—';$('review-subtotal').textContent='—';note('Pilih produk di etalase terlebih dahulu.',true);submit.disabled=true;return;}
 const client=window.BaylosAPI?.client;if(!client){lines.forEach(i=>list.append(line('Produk '+i.product_id.slice(0,8),i.quantity)));note('Koneksi Supabase belum tersedia.',true);submit.disabled=true;return;}
 const ids=[...new Set(lines.map(x=>x.product_id))];const {data:products,error}=await client.from('products').select('id,name,retail_price,is_active').in('id',ids);
 if(error){note('Gagal memuat rincian produk: '+error.message,true);submit.disabled=true;return;}
 const map=new Map((products||[]).map(p=>[p.id,p]));let subtotal=0,valid=true;
 for(const item of lines){const p=map.get(item.product_id);if(!p?.is_active){valid=false;list.append(line('Produk tidak tersedia ('+item.product_id.slice(0,8)+')',item.quantity));continue;}const price=Number(p.retail_price);if(!Number.isFinite(price)||price<0){valid=false;list.append(line(p.name,item.quantity));continue;}subtotal+=price*item.quantity;list.append(line(p.name+(item.variant_id?' · varian '+item.variant_id.slice(0,8):''),item.quantity,price));}
 itemsValid=valid;$('subtotal').textContent=valid?money(subtotal):'Perlu pemeriksaan produk';$('review-subtotal').textContent=valid?money(subtotal):'—';$('review-total').textContent='Menunggu validasi server';$('price-notice').textContent='Harga ini adalah perkiraan retail; harga, stok, dan ongkir final harus dihitung ulang oleh server.';submit.disabled=!valid;note(valid?'Periksa kembali rincian sebelum membuat pesanan.':'Ada produk yang tidak tersedia. Perbarui keranjang.',!valid);
}
$('payment_bank').disabled=true;$('payment_method').addEventListener('change',()=>{const manual=$('payment_method').value==='manual_transfer';$('payment_bank').disabled=!manual;$('payment_bank').required=manual;if(!manual)$('payment_bank').value='';});
form.addEventListener('submit',async e=>{e.preventDefault();if(!itemsValid||!cart?.checkoutItems().length){note('Keranjang tidak valid atau kosong.',true);return;}
 const fd=new FormData(form),courier=String(fd.get('shipping_courier')||''),service=String(fd.get('shipping_service')||''),method=String(fd.get('payment_method')||''),bank=String(fd.get('payment_bank')||'');
 if(!courier||!service||!method||(method==='manual_transfer'&&!bank)){note('Lengkapi jasa kirim, layanan, dan metode pembayaran.',true);return;}
 if((courier==='pickup')!==(service==='PICKUP')){note('Sesuaikan layanan ambil sendiri dengan pilihan jasa kirim.',true);return;}
 let session;try{session=await window.BaylosAPI.session();}catch{}if(!session?.user){note('Silakan masuk ke akun Baylos sebelum checkout.',true);return;}
 submit.disabled=true;submit.textContent='Memvalidasi pesanan…';note('Mengirim rincian ke server untuk validasi stok dan pembuatan pesanan.');
 try{const order=await window.BaylosCheckout.checkout({items:cart.checkoutItems(),recipient_name:fd.get('recipient_name'),recipient_phone:fd.get('recipient_phone'),shipping_address:fd.get('shipping_address'),shipping_postal_code:fd.get('shipping_postal_code'),shipping_courier:courier,shipping_service:service,payment_method:method,payment_bank:bank,notes:fd.get('notes')});
 cart.clear();sessionStorage.removeItem('baylos_pending_checkout_v1');note('Pesanan berhasil dibuat. Nomor pesanan: '+(order.order_number||order.id||'tersedia di Pesanan Saya'));$('readiness').textContent='Pesanan tercatat. Ikuti instruksi pembayaran resmi yang tampil di detail pesanan.';submit.textContent='Pesanan dibuat';
 }catch(err){note((err.message||'Checkout belum dapat diproses.')+' Tidak ada pembayaran yang dilakukan jika server belum mengonfirmasi pesanan.',true);submit.disabled=false;submit.textContent='Coba buat pesanan lagi';}
});
$('refresh-cart')?.addEventListener('click',()=>render().catch(()=>note('Gagal memuat keranjang.',true)));render().catch(()=>note('Gagal memuat keranjang.',true));
})();
