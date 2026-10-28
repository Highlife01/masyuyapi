const {onRequest}=require('firebase-functions/v2/https');
const {initializeApp}=require('firebase-admin/app');
const {getFirestore}=require('firebase-admin/firestore');
const {randomBytes,scryptSync,timingSafeEqual,createHash}=require('node:crypto');
initializeApp();
const db=getFirestore('masyu'),statuses=['Yeni','Görüşülüyor','Teklif İletildi','Tamamlandı'];
const cookie=req=>req.headers.cookie?.match(/(?:^|; )__session=([a-f0-9]{64})(?:;|$)/)?.[1];
exports.masyuApi=onRequest({region:'europe-west1',maxInstances:2,memory:'256MiB',timeoutSeconds:30},async(req,res)=>{
 res.set('Cache-Control','private, no-store');res.set('X-Content-Type-Options','nosniff');
 const send=(status,value)=>res.status(status).json(value);
 try{
  const path=req.path,method=req.method,input=req.body||{},now=Date.now();
  const allowed=new Set(['https://masyuinsaat.web.app','https://masyuinsaat.firebaseapp.com']);
  if(method!=='GET'&&req.headers.origin&&!allowed.has(req.headers.origin))return send(403,{error:'Geçersiz kaynak'});
  if(Buffer.byteLength(JSON.stringify(input))>16000)return send(413,{error:'Mesaj çok uzun'});
  if(path==='/api/login'&&method==='POST'){
   const key=createHash('sha256').update(req.ip||'unknown').digest('hex'),ref=db.collection('loginAttempts').doc(key);
   const recent=(await ref.get()).data()||{count:0,until:0};
   if(recent.until>now&&recent.count>=8)return send(429,{error:'15 dakika sonra tekrar deneyin.'});
   const stored=process.env.ADMIN_PASSWORD_HASH;if(!stored)return send(503,{error:'Yönetici hesabı yapılandırılmadı'});
   const [salt,hash]=stored.split(':'),actual=scryptSync(String(input.password||''),salt,64),expected=Buffer.from(hash,'hex');
   if(input.email!==process.env.ADMIN_EMAIL||expected.length!==actual.length||!timingSafeEqual(expected,actual)){await db.runTransaction(async tx=>{const old=(await tx.get(ref)).data()||{count:0,until:0};tx.set(ref,{count:old.until>now?old.count+1:1,until:now+900000});});return send(401,{error:'E-posta veya şifre hatalı'});}
   await ref.delete();const id=randomBytes(32).toString('hex');await db.collection('sessions').doc(id).set({expires:now+28800000});
   res.set('Set-Cookie',`__session=${id}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=28800`);return send(200,{email:process.env.ADMIN_EMAIL,role:'superadmin'});
  }
  if(path==='/api/logout'&&method==='POST'){const id=cookie(req);if(id)await db.collection('sessions').doc(id).delete();res.set('Set-Cookie','__session=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0');return send(200,{ok:true});}
  if(path==='/api/leads'&&method==='POST'){
   if(typeof input.name!=='string'||input.name.trim().length<2||typeof input.phone!=='string'||input.phone.replace(/\D/g,'').length<10||typeof input.message!=='string'||!input.message.trim())return send(400,{error:'Ad, geçerli telefon ve mesaj gereklidir'});
   const lead={id:randomBytes(12).toString('hex'),timestamp:now,date:new Date(now).toLocaleString('tr-TR',{timeZone:'Europe/Istanbul'}),status:'Yeni'};
   for(const key of ['name','phone','email','city','service','message'])lead[key]=String(input[key]||'').trim().slice(0,key==='message'?5000:250);
   await db.collection('leads').doc(lead.id).create(lead);return send(201,{id:lead.id});
  }
  const id=cookie(req),session=id?(await db.collection('sessions').doc(id).get()).data():null;
  if(!session||session.expires<=now)return send(401,{error:'Oturum açmanız gerekiyor'});
  if(path==='/api/session')return send(200,{email:process.env.ADMIN_EMAIL,role:'superadmin'});
  if(path==='/api/leads'&&method==='GET')return send(200,(await db.collection('leads').orderBy('timestamp','desc').get()).docs.map(doc=>doc.data()));
  const match=path.match(/^\/api\/leads\/([a-f0-9]{24})$/);
  if(match&&method==='PATCH'){if(!statuses.includes(input.status))return send(400,{error:'Geçersiz durum'});const ref=db.collection('leads').doc(match[1]);const old=await ref.get();if(!old.exists)return send(404,{error:'Talep bulunamadı'});await ref.update({status:input.status});return send(200,{...old.data(),status:input.status});}
  return send(404,{error:'Bulunamadı'});
 }catch(error){console.error('Masyu API error',error.code||'unknown');return send(500,{error:'İşlem tamamlanamadı. Lütfen tekrar deneyin.'});}
});
