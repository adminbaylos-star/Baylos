/* Baylos customer order history — read-only; database RLS is the authority. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const money=n=>new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(Number(n)||0);
const date=v=>v?new Date(v).toLocaleString('id-ID'):'—';
const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!=null)n.textContent=String(text);if(cls)n.className=cls;return n};
function message(t,bad=false){$('status').textContent=t;$('status').className=bad?'error':''}
async function load(){
 const c=window.BaylosAPI?.client;if(!c)throw Error('Koneksi Supabase belum siap.');
 const {data:{user},error:authError}=await c.auth.getUser();if(authError||!user)throw Error('Silakan masuk melalui halaman toko untuk melihat pesanan.');
 message('Memuat riwayat pesanan…');
 const {data:orders,error}=await c.from('orders').select('id,status,payment_status,payment_method,subtotal,shipping_cost,total,created_at,shipping_courier,shipping_service,tracking_number').eq('customer_id',user.id).order('created_at',{ascending:false}).limit(100);
 if(error)throw Error(error.message);
 const ids=(orders||[]).map(o=>o.id);let items=[];
 if(ids.length){const result=await c.from('order_items').select('order_id,product_name,quantity,unit_price,variant_id').in('order_id',ids);if(result.error)throw Error(result.error.message);items=result.data||[]}
 const byOrder=new Map();for(const item of items){if(!byOrder.has(item.order_id))byOrder.set(item.order_id,[]);byOrder.get(item.order_id).push(item)}
 const root=$('orders');root.replaceChildren();
 for(const o of orders||[]){const card=el('article',null,'card');const top=el('div',null,'row');top.append(el('strong','Pesanan #'+o.id.slice(0,8)),el('span',date(o.created_at),'muted'));card.append(top);
  const badges=el('p');badges.append(el('span','Pesanan: '+(o.status||'—'),'pill'),' ',el('span','Pembayaran: '+(o.payment_status||'—'),'pill'));card.append(badges);
  const list=el('ul');for(const it of byOrder.get(o.id)||[])list.append(el('li',`${it.product_name||'Produk'} × ${it.quantity} — ${money(it.unit_price)}`));card.append(list);
  card.append(el('p',`Subtotal ${money(o.subtotal)} + Ongkir ${money(o.shipping_cost)} = ${money(o.total)}`));
  card.append(el('p',`Pengiriman: ${o.shipping_courier||'—'} / ${o.shipping_service||'—'} · Resi: ${o.tracking_number||'Belum tersedia'}`,'muted'));
  card.append(el('small','ID pesanan: '+o.id,'muted'));root.append(card);
 }
 if(!orders?.length)root.append(el('p','Belum ada pesanan pada akun ini.'));
 message(`${orders?.length||0} pesanan ditemukan. Data bersifat baca saja.`);
}
$('refresh').addEventListener('click',()=>load().catch(e=>message(e.message,true)));
load().catch(e=>message(e.message,true));
})();
