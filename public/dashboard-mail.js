(()=>{
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const main=document.querySelector('main');
const hide=[...main.children].filter(el=>el.matches('.metrics')||el.matches('section.card:not(#mailSection)'));
let loaded=false;
async function api(path){
 const r=await fetch('/api/'+path,{credentials:'same-origin'});
 const data=await r.json().catch(()=>({}));
 if(!r.ok)throw new Error(data.error||'İşlem tamamlanamadı');
 return data;
}
const fmt=iso=>new Date(iso).toLocaleString('tr-TR',{dateStyle:'short',timeStyle:'short'});
async function loadList(){
 const status=$('mailStatus'),list=$('mailList');
 status.textContent='Posta kutusu yükleniyor…';
 try{
  const {total,messages}=await api('mail/messages?limit=50');
  status.textContent=`info@masyuyapi.com.tr · ${total} ileti · ${new Date().toLocaleTimeString('tr-TR')}`;
  list.replaceChildren();
  $('mailEmpty').classList.toggle('hidden',messages.length>0);
  for(const m of messages){
   const b=document.createElement('button');b.className='mail-item'+(m.seen?'':' unread');
   b.innerHTML=`<span class="mail-from">${esc(m.from)}</span><span class="mail-date">${esc(fmt(m.date))}</span><span class="mail-subject">${esc(m.subject)}</span>`;
   b.onclick=()=>open(m.uid,b);list.append(b);
  }
 }catch(e){status.textContent=e.message;}
}
async function open(uid,btn){
 document.querySelectorAll('.mail-item.active').forEach(x=>x.classList.remove('active'));btn.classList.add('active');
 const view=$('mailView');view.innerHTML='<p class="muted">Yükleniyor…</p>';
 try{
  const m=await api('mail/messages/'+uid);
  view.innerHTML=`<h3>${esc(m.subject)}</h3><p class="mail-meta"><b>Kimden:</b> ${esc(m.from)}<br><b>Kime:</b> ${esc(m.to)}<br><b>Tarih:</b> ${esc(fmt(m.date))}</p>`;
  const body=document.createElement('iframe');
  body.setAttribute('sandbox','allow-popups allow-popups-to-escape-sandbox');body.className='mail-body';
  const css='<style>body{font:14px Arial,sans-serif;color:#222;margin:12px;overflow-wrap:anywhere}pre{white-space:pre-wrap;font:inherit}</style><base target="_blank">';
  body.srcdoc=css+(m.html||'<pre>'+esc(m.text)+'</pre>');view.append(body);
  if(m.attachments.length){const p=document.createElement('p');p.className='muted';p.textContent='Ekler: '+m.attachments.map(a=>a.name).join(', ')+' (eklerin indirilmesi bu panelde kapalıdır)';view.append(p);}
 }catch(e){view.innerHTML='<p class="error">'+esc(e.message)+'</p>';}
}
function show(view){
 const mail=view==='mail';
 hide.forEach(el=>el.classList.toggle('hidden',mail));
 $('mailSection').classList.toggle('hidden',!mail);
 if(mail){
  $('heading').textContent='Posta kutusu';
  $('intro').textContent='info@masyuyapi.com.tr gelen kutusu (salt okunur).';
  if(!loaded){loaded=true;loadList();}
 }
}
document.querySelectorAll('[data-view]').forEach(btn=>btn.addEventListener('click',()=>show(btn.dataset.view)));
$('mailRefresh').onclick=loadList;
$('logout').addEventListener('click',()=>{loaded=false;show('overview');});
})();
