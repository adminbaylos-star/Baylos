/* Baylos: admin orders dashboard, read-only until backend status RPC is audited. */
(()=>{'use strict';
const $=id=>document.getElementById(id), esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=v=>new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(Number(v)||0);
const date=v=>v?new Date(v).toLocaleString('id-ID'):'—';
function status(s,bad=false){$('status').textContent=s;$('status').className=bad?'notice error':'notice'}
async function start(){
 const api=window.BaylosAPI;
 if(!api?.ready||!api.client)throw Error('Konfigurasi Supabase belum tersedia.');
 const c=api.client;
 const {data:auth,error:authErr}=await c.auth.getUser();if(authErr||!auth?.user)throw Error('Masuk dengan akun admin terlebih dahulu.');
 const {data:allowed,error:roleErr}=await c.rpc('is_baylos_admin');
 if(roleErr||allowed!==true)throw Error('Akses ditolak. Halaman ini hanya untuk admin Baylos.');
 $('workspace').hidden=false;
 let cachedOrders=[]; let cachedItems=[];
 function filtered(){const term=$('filter').value.trim().toLowerCase(), sf=$('statusFilter')?.value||'', pf=$('paymentFilter')?.value||'';return cachedOrders.filter(o=>(!sf||o.status===sf)&&(!pf||o.payment_status===pf)&&(!term||[o.id,o.recipient_name,o.recipient_phone,o.status,o.payment_status].some(v=>String(v||'').toLowerCase().includes(term))))}
 function render(){
 const orders=cachedOrders, items=cachedItems;
  const byOrder=new Map();for(const it of items){if(!byOrder.has(it.order_id))byOrder.set(it.order_id,[]);byOrder.get(it.order_id).push(it)}
  const rows=filtered();
  $('count').textContent=`${rows.length} pesanan ditampilkan (maksimal 100 terbaru)`;
  $('orders').innerHTML=rows.map(o=>`<article class="order"><div class="top"><strong>#${esc(o.id.slice(0,8))}</strong><span>${esc(date(o.created_at))}</span></div><div class="badges"><span>Pesanan: ${esc(o.status)}</span><span>Pembayaran: ${esc(o.payment_status)}</span></div><p><strong>${esc(o.recipient_name||'Penerima belum tercatat')}</strong> · ${esc(o.recipient_phone||'—')}</p><p>${esc(o.shipping_address||'Alamat belum tercatat')} ${esc(o.shipping_postal_code||'')}</p><p>Kurir: ${esc(o.shipping_courier||'—')} / ${esc(o.shipping_service||'—')} · Resi: ${esc(o.tracking_number||'Belum tersedia')}</p><details><summary>Detail barang (${(byOrder.get(o.id)||[]).length})</summary><ul>${(byOrder.get(o.id)||[]).map(i=>`<li>${esc(i.product_name)} × ${esc(i.quantity)} — ${money(i.unit_price)}${i.variant_id?' · Varian '+esc(i.variant_id.slice(0,8)):''}</li>`).join('')||'<li>Belum ada rincian barang</li>'}</ul></details><p class="total">Subtotal ${money(o.subtotal)} + Ongkir ${money(o.shipping_cost)} = ${money(o.total)}</p><small>ID lengkap: ${esc(o.id)}</small><div class="actions"><button type="button" data-copy="${esc(o.id)}">Salin ID</button><button type="button" data-shipment="${esc(o.id)}">Siapkan resi</button><button type="button" data-print="${esc(o.id)}">Cetak ringkasan</button></div></article>`).join('')||'<p>Tidak ada pesanan yang cocok.</p>';
 }
 async function load(){
  status('Memuat pesanan…');
  const {data:orders,error}=await c.from('orders').select('id,customer_id,status,payment_status,payment_method,subtotal,shipping_cost,total,recipient_name,recipient_phone,shipping_address,shipping_postal_code,shipping_courier,shipping_service,tracking_number,created_at').order('created_at',{ascending:false}).limit(100);
  if(error)throw error;
  const ids=(orders||[]).map(x=>x.id);
  let items=[];
  if(ids.length){const result=await c.from('order_items').select('order_id,product_name,quantity,unit_price,variant_id').in('order_id',ids);if(result.error)throw result.error;items=result.data||[]}
  cachedOrders=orders||[]; cachedItems=items; $('export').disabled=false; render();
  status('Data pesanan berhasil dimuat. Mode baca saja.');
 }
 $('reload').addEventListener('click',()=>load().catch(e=>status(e.message,true)));
 $('filter').addEventListener('input',render); $('statusFilter')?.addEventListener('change',render); $('paymentFilter')?.addEventListener('change',render);
 const dlg=$('orderDialog'); let selectedOrder=null;
 $('orders').addEventListener('click',async ev=>{
  const copy=ev.target.closest('[data-copy]'); if(copy){try{await navigator.clipboard.writeText(copy.dataset.copy);status('ID pesanan disalin.')}catch{status('Tidak bisa menyalin otomatis. Salin ID lengkap dari detail pesanan.',true)}return}
  const ship=ev.target.closest('[data-shipment]'); if(ship){selectedOrder=cachedOrders.find(o=>o.id===ship.dataset.shipment);if(!selectedOrder)return;$('dialogOrderId').textContent='Pesanan #'+selectedOrder.id;$('draftCourier').value=selectedOrder.shipping_courier||'';$('draftService').value=selectedOrder.shipping_service||'';$('draftTracking').value=selectedOrder.tracking_number||'';$('draftMessage').textContent='';dlg.showModal();return}
  const print=ev.target.closest('[data-print]');if(print){const o=cachedOrders.find(x=>x.id===print.dataset.print);if(o){const w=window.open('','_blank','noopener');if(!w){status('Izinkan pop-up untuk mencetak ringkasan.',true);return}w.document.write('<title>Ringkasan pesanan Baylos</title><h1>Baylos · Ringkasan Pesanan</h1><pre>'+esc(JSON.stringify({id:o.id,tanggal:o.created_at,status:o.status,pembayaran:o.payment_status,penerima:o.recipient_name,telepon:o.recipient_phone,alamat:o.shipping_address,kurir:o.shipping_courier,layanan:o.shipping_service,resi:o.tracking_number,subtotal:o.subtotal,ongkir:o.shipping_cost,total:o.total},null,2))+'</pre><button onclick="print()">Cetak</button>');w.document.close()}return}
 });
 $('closeDialog').addEventListener('click',()=>dlg.close());
 $('shipmentForm').addEventListener('submit',ev=>{ev.preventDefault();if(!selectedOrder)return;const key='baylos-order-shipment-draft-v1';let all={};try{all=JSON.parse(localStorage.getItem(key)||'{}')}catch{}all[selectedOrder.id]={courier:$('draftCourier').value.trim(),service:$('draftService').value.trim(),tracking_number:$('draftTracking').value.trim(),saved_at:new Date().toISOString()};localStorage.setItem(key,JSON.stringify(all));$('draftMessage').textContent='Draf tersimpan di browser ini saja. Belum memperbarui pesanan di server.';});
 $('printOrder').addEventListener('click',()=>window.print());
 // Export only rows visible after filtering; escape formulas to prevent CSV injection.
 $('export').addEventListener('click',()=>{
  const fields=['id','created_at','status','payment_status','payment_method','recipient_name','recipient_phone','shipping_courier','shipping_service','tracking_number','subtotal','shipping_cost','total'];
  const cell=value=>{let v=String(value??'');if(/^[\s]*[=+@-]/.test(v))v="'"+v;return '"'+v.replace(/"/g,'""')+'"'};
  const csv='\uFEFF'+[fields.map(cell).join(','),...filtered().map(o=>fields.map(f=>cell(o[f])).join(','))].join('\r\n');
  const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));
  const a=document.createElement('a');a.href=url;a.download='baylos-pesanan-'+new Date().toISOString().slice(0,10)+'.csv';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
 });
 await load();
}
start().catch(e=>status(e.message||String(e),true));
})();
