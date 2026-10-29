// Read-only IMAP access to the company mailbox (pattern adapted from Safir Mail).
// The mailbox password is never stored in the repo: it comes from the Firebase secret MAIL_PASSWORD.
const dns = require('node:dns').promises;
const {isIP}=require('node:net');
const {ImapFlow}=require('imapflow');
const {simpleParser}=require('mailparser');
const sanitizeHtml=require('sanitize-html');

const silent={debug(){},info(){},warn(){},error(){},trace(){},fatal(){}};
const config=()=>({
 host:String(process.env.MAIL_IMAP_HOST||'mail.kurumsaleposta.com').toLowerCase(),
 user:process.env.MAIL_USER||'info@masyuyapi.com.tr',
 pass:process.env.MAIL_PASSWORD||''
});

const privateV4=ip=>{const [a,b]=ip.split('.').map(Number);return a===0||a===10||a===127||(a===169&&b===254)||(a===172&&b>=16&&b<=31)||(a===192&&b===168)||(a===100&&b>=64&&b<=127)||a>=224;};
const privateIp=ip=>isIP(ip)===4?privateV4(ip):isIP(ip)===6?/^(::1?$|f[cd]|fe[89ab]|::ffff:)/i.test(ip):true;

async function connect(){
 const c=config();if(!c.pass)throw Object.assign(new Error('Posta kutusu yapılandırılmadı'),{status:503});
 // Resolve once and refuse internal addresses (SSRF / DNS rebinding guard), then connect to that exact IP.
 const records=await dns.lookup(c.host,{all:true,verbatim:true});
 if(!records.length||records.some(r=>privateIp(r.address)))throw Object.assign(new Error('Bağlantı hatası'),{status:502});
 const client=new ImapFlow({host:records[0].address,port:993,secure:true,auth:{user:c.user,pass:c.pass},logger:silent,
  tls:{rejectUnauthorized:true,servername:c.host},greetingTimeout:15000,socketTimeout:30000,disableAutoIdle:true});
 client.on('error',()=>{});
 await client.connect();return client;
}

async function withMailbox(fn){
 const client=await connect();
 try{const lock=await client.getMailboxLock('INBOX',{readOnly:true});try{return await fn(client);}finally{lock.release();}}
 finally{try{await client.logout();}catch{client.close();}}
}

const names=list=>(list||[]).filter(a=>a&&(a.name||a.address)).map(a=>a.name&&a.address?`${a.name} <${a.address}>`:(a.address||a.name)).join(', ');

async function listMessages(limit=30){
 limit=Math.min(Math.max(parseInt(limit,10)||30,1),100);
 return withMailbox(async client=>{
  const total=client.mailbox.exists;if(!total)return {total:0,messages:[]};
  const messages=[];
  for await(const m of client.fetch(`${Math.max(1,total-limit+1)}:*`,{uid:true,envelope:true,flags:true,internalDate:true})){
   messages.push({uid:m.uid,subject:m.envelope?.subject||'(Konu yok)',from:names(m.envelope?.from)||'Bilinmeyen',
    date:new Date(m.internalDate||m.envelope?.date||Date.now()).toISOString(),seen:m.flags?.has('\\Seen')||false});
  }
  return {total,messages:messages.reverse()};
 });
}

async function readMessage(uid){
 return withMailbox(async client=>{
  const m=await client.fetchOne(String(uid),{source:true,uid:true},{uid:true});
  if(!m||!m.source)return null;
  const mail=await simpleParser(m.source);
  const html=mail.html?sanitizeHtml(String(mail.html),{
   allowedTags:['a','b','br','blockquote','code','div','em','h1','h2','h3','h4','hr','i','li','ol','p','pre','span','strong','table','tbody','thead','tr','td','th','u','ul','center','small'],
   allowedAttributes:{a:['href'],td:['colspan','rowspan','align'],th:['colspan','rowspan','align'],table:['width','align','border','cellpadding','cellspacing']},
   allowedSchemes:['http','https','mailto'],allowProtocolRelative:false,
   transformTags:{a:(_t,attribs)=>({tagName:'a',attribs:{target:'_blank',rel:'noreferrer noopener',...(/^(https?:|mailto:)/i.test(attribs.href||'')?{href:attribs.href}:{})}})}
  }):'';
  return {uid:Number(uid),subject:mail.subject||'(Konu yok)',from:names(mail.from?.value),to:names(mail.to?.value),
   date:(mail.date||new Date()).toISOString(),html,text:html?'':String(mail.text||'').slice(0,100000),
   attachments:(mail.attachments||[]).map(a=>({name:a.filename||'ek',size:a.size||0}))};
 });
}

module.exports={listMessages,readMessage};
