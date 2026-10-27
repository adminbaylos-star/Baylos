(()=>{'use strict';const $=id=>document.getElementById(id);let session=null,profile=null,loading=false;
function error(e){$('profileError').textContent=e?.message||String(e)}
async function sync(){if(loading)return;loading=true;try{if(!window.BaylosAPI?.ready)throw Error('Koneksi Supabase belum siap. Periksa konfigurasi.');session=await BaylosAPI.session();const user=session?.user;profile=null;let profileError='';if(user){try{profile=await BaylosAPI.profile()}catch(e){profileError=e.message}}
const admin=!!user&&profile?.user_role==='admin';for(const id of ['adminLink','adminOrdersLink','profileDashboard','profileAdmin','profileOrders'])$(id).hidden=!admin;
$('loginBtn').textContent=user?'👤 Akun':'Masuk / Daftar';$('signOut').hidden=!user;$('profileLogout').hidden=!user;$('editProfileBtn').hidden=!user;
$('accountName').textContent=profile?.full_name||user?.user_metadata?.full_name||'Pengguna Baylos';$('accountEmail').textContent=user?.email||'Belum masuk';$('accountAvatar').textContent=($('accountName').textContent[0]||'B').toUpperCase();$('accountBadges').textContent=user?`${admin?'ADMINISTRATOR':'PELANGGAN'} · PENGGUNA`:'';
$('profileSummary').textContent=user?`ID Akun: ${user.id.slice(0,8)}…\nTelepon: ${profile?.phone||'Belum diisi'}\nStatus email: ${user.email_confirmed_at?'Terverifikasi':'Belum diverifikasi'}`:'Silakan masuk atau buat akun untuk mengakses profil dan pesanan.';
$('accountStatus').textContent=user?`Masuk sebagai ${profile?.full_name||user.email} · ${admin?'Admin':'Pelanggan'}`:'Silakan masuk atau daftar.';
$('editFullName').value=profile?.full_name||user?.user_metadata?.full_name||'';$('editPhone').value=profile?.phone||'';$('profileError').textContent=profileError?`Profil gagal dimuat: ${profileError}. Menu admin memerlukan profil dengan peran admin.`:'';
}catch(e){error(e)}finally{loading=false}}
async function openAccount(){await sync();if(session){$('authDialog').close();if(!$('profileDialog').open)$('profileDialog').showModal()}else if(!$('authDialog').open)$('authDialog').showModal()}
// Capture phase prevents the older login handler from opening the login dialog for authenticated users.
$('loginBtn').addEventListener('click',e=>{e.stopImmediatePropagation();openAccount()},true);
$('bottomAccount').addEventListener('click',e=>{e.stopImmediatePropagation();openAccount()},true);
$('editProfileBtn').onclick=()=>{$('profileEdit').hidden=!$('profileEdit').hidden};
$('saveProfile').onclick=async()=>{try{if(!session?.user)throw Error('Silakan login kembali.');const full_name=$('editFullName').value.trim(),phone=$('editPhone').value.trim();if(full_name.length<2)throw Error('Nama minimal 2 karakter.');$('saveProfile').disabled=true;const {error:e}=await BaylosAPI.client.from('profiles').update({full_name,phone}).eq('id',session.user.id);if(e)throw e;$('profileEdit').hidden=true;await sync();$('profileError').textContent='Profil berhasil disimpan.'}catch(e){error(e)}finally{$('saveProfile').disabled=false}};
$('profileLogout').onclick=async()=>{try{await BaylosAPI.signOut();session=null;profile=null;$('profileDialog').close();await sync()}catch(e){error(e)}};

if(window.BaylosAPI?.client)BaylosAPI.client.auth.onAuthStateChange(()=>setTimeout(sync,100));document.addEventListener('visibilitychange',()=>{if(!document.hidden)sync()});setTimeout(sync,200);
})();