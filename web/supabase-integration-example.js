// Contoh helper browser; belum dipasang ke index.html utama.
// Inisialisasi Supabase JS v2 dengan project URL + anon key (anon key boleh di browser).
// Jangan pernah menggunakan service_role key di browser.
async function baylosLoadCatalog(supabase){
 const {data,error}=await supabase.from('products').select('id,name,slug,description,category,image_url,retail_price,stock,is_active').eq('is_active',true).order('created_at',{ascending:false});
 if(error) throw new Error('Katalog gagal dimuat'); return data||[];
}
async function baylosCheckout(supabase,order){
 const {data:{session}}=await supabase.auth.getSession(); if(!session?.access_token) throw new Error('Silakan login sebelum checkout');
 const {data,error}=await supabase.functions.invoke('create-order',{body:{items:(order.items||[]).map(x=>({product_id:x.product_id||x.id,quantity:Number(x.quantity)})),recipient_name:order.recipient_name,recipient_phone:order.recipient_phone,shipping_address:order.shipping_address,shipping_postal_code:order.shipping_postal_code||'',shipping_cost:Number(order.shipping_cost||0),payment_method:order.payment_method||'manual_transfer',notes:order.notes||''}});
 if(error||!data?.ok) throw new Error(data?.error||'Pesanan gagal dibuat'); return data.order;
}
