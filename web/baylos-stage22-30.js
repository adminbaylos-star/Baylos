(()=>{'use strict';
const $=id=>document.getElementById(id);const fmt=n=>new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(Number(n)||0);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const mode=()=>window.BaylosAPI?.ready?'Supabase tersedia; halaman ini tetap tidak menulis ke server tanpa endpoint yang terverifikasi.':'Mode pratinjau lokal — belum terhubung ke server.';
window.BaylosStage={ $,fmt,esc,mode,read(k){try{return JSON.parse(localStorage.getItem('baylos-ui-'+k)||'[]')}catch{return[]}},write(k,v){localStorage.setItem('baylos-ui-'+k,JSON.stringify(v))},status(id,msg){const e=$(id);if(e)e.textContent=msg}};
document.querySelectorAll('[data-mode]').forEach(e=>e.textContent=mode());
})();