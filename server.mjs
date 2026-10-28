import http from 'node:http';
import { DatabaseSync } from 'node:sqlite';
import { randomBytes,scryptSync,timingSafeEqual } from 'node:crypto';
import { mkdirSync,readFileSync } from 'node:fs';
import { resolve,extname,sep } from 'node:path';
mkdirSync('data',{recursive:true});
const db=new DatabaseSync('data/masyu.sqlite');
db.exec('CREATE TABLE IF NOT EXISTS leads (id TEXT PRIMARY KEY,payload TEXT NOT NULL)');
const sessions=new Map(),attempts=new Map(),root=resolve('public');
function reply(res,status,value){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(value));}
async function body(req){let text='';for await(const part of req){text+=part;if(text.length>16000)throw Error();}return JSON.parse(text||'{}');}
function token(req){return req.headers.cookie?.match(/(?:^|; )masyu_session=([^;]+)/)?.[1];}
const statuses=['Yeni','Görüşülüyor','Teklif İletildi','Tamamlandı'];
http.createServer(async(req,res)=>{try{
 const url=new URL(req.url,'http://localhost');
 res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('X-Frame-Options','DENY');
 if(req.method!=='GET'&&req.headers.origin&&new URL(req.headers.origin).host!==req.headers.host)return reply(res,403,{error:'Geçersiz kaynak'});
 if(url.pathname==='/api/login'&&req.method==='POST'){
  const key=req.socket.remoteAddress,now=Date.now(),recent=attempts.get(key)||{count:0,until:0};
  if(recent.until>now&&recent.count>=8)return reply(res,429,{error:'15 dakika sonra tekrar deneyin.'});
  const input=await body(req),stored=process.env.ADMIN_PASSWORD_HASH;
  if(!stored)return reply(res,503,{error:'Yönetici hesabı yapılandırılmadı'});
  const [salt,hash]=stored.split(':'),actual=scryptSync(String(input.password||''),salt,64),expected=Buffer.from(hash,'hex');
  if(input.email!==process.env.ADMIN_EMAIL||expected.length!==actual.length||!timingSafeEqual(expected,actual)){attempts.set(key,{count:recent.until>now?recent.count+1:1,until:now+900000});return reply(res,401,{error:'E-posta veya şifre hatalı'});}
  attempts.delete(key);const id=randomBytes(32).toString('hex');sessions.set(id,now+28800000);
  res.setHeader('Set-Cookie',`masyu_session=${id}; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800${process.env.NODE_ENV==='production'?'; Secure':''}`);return reply(res,200,{email:process.env.ADMIN_EMAIL,role:'superadmin'});
 }
 if(url.pathname==='/api/logout'&&req.method==='POST'){sessions.delete(token(req));res.setHeader('Set-Cookie','masyu_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0');return reply(res,200,{ok:true});}
 if(url.pathname==='/api/leads'&&req.method==='POST'){
  const input=await body(req);if(typeof input.name!=='string'||input.name.trim().length<2||typeof input.phone!=='string'||input.phone.replace(/\D/g,'').length<10||typeof input.message!=='string'||!input.message.trim())return reply(res,400,{error:'Ad, geçerli telefon ve mesaj gereklidir'});
  const lead={id:randomBytes(12).toString('hex'),timestamp:Date.now(),date:new Date().toLocaleString('tr-TR',{timeZone:'Europe/Istanbul'}),status:'Yeni'};
  for(const key of ['name','phone','email','city','service','message'])lead[key]=String(input[key]||'').trim().slice(0,key==='message'?5000:250);
  db.prepare('INSERT INTO leads VALUES (?,?)').run(lead.id,JSON.stringify(lead));return reply(res,201,{id:lead.id});
 }
 if(url.pathname.startsWith('/api/')){
  if(!(sessions.get(token(req))>Date.now()))return reply(res,401,{error:'Oturum açmanız gerekiyor'});
  if(url.pathname==='/api/session')return reply(res,200,{email:process.env.ADMIN_EMAIL,role:'superadmin'});
  if(url.pathname==='/api/leads'&&req.method==='GET')return reply(res,200,db.prepare('SELECT payload FROM leads ORDER BY rowid DESC').all().map(r=>JSON.parse(r.payload)));
  const match=url.pathname.match(/^\/api\/leads\/([a-f0-9]+)$/);
  if(match&&req.method==='PATCH'){const input=await body(req);if(!statuses.includes(input.status))return reply(res,400,{error:'Geçersiz durum'});const row=db.prepare('SELECT payload FROM leads WHERE id=?').get(match[1]);if(!row)return reply(res,404,{error:'Talep bulunamadı'});const lead={...JSON.parse(row.payload),status:input.status};db.prepare('UPDATE leads SET payload=? WHERE id=?').run(JSON.stringify(lead),match[1]);return reply(res,200,lead);}
  return reply(res,404,{error:'Bulunamadı'});
 }
 if(req.method!=='GET'&&req.method!=='HEAD')return reply(res,405,{error:'Geçersiz yöntem'});
 let path=decodeURIComponent(url.pathname);if(path==='/')path='/index.html';if(!extname(path))path+='.html';
 const file=resolve(root,'.'+path);if(!file.startsWith(root+sep))return reply(res,403,{error:'Erişim yok'});
 try{const data=readFileSync(file);res.writeHead(200,{'Content-Type':({'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.xml':'application/xml','.txt':'text/plain'})[extname(file)]||'application/octet-stream'});res.end(req.method==='HEAD'?undefined:data);}catch{return reply(res,404,{error:'Sayfa bulunamadı'});}
 }catch{reply(res,400,{error:'İşlem tamamlanamadı. Lütfen tekrar deneyin.'});}}).listen(process.env.PORT||3000,'127.0.0.1',()=>console.log('Masyu Yapı: http://localhost:'+(process.env.PORT||3000)));
