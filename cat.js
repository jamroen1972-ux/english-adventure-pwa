(function(){
const m=document.querySelector('.mascot'),b=document.querySelector('.mascot-bubble');if(!m||!b)return;
const nm=()=>{try{return studentName()}catch(e){return'คนเก่ง'}},U=()=>{try{return activeUnit}catch(e){return null}},on=()=>{try{return voiceEnabled}catch(e){return true}};
const esc=s=>String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
let sid=0,hideT=0,tk=0,coachedAt=0,last=null,greeted='',curSig='';const W={},H={};
function place(){const r=m.getBoundingClientRect(),w=b.offsetWidth,h=b.offsetHeight;b.style.right='auto';b.style.bottom='auto';let l=Math.min(Math.max(8,r.left+29-w/2),innerWidth-w-8),t=r.top-h-12;if(t<8)t=r.bottom+12;b.style.left=l+'px';b.style.top=t+'px'}
function show(html,ms){b.innerHTML=html;place();b.classList.add('show');clearTimeout(hideT);hideT=setTimeout(()=>b.classList.remove('show'),ms||Math.max(4500,html.replace(/<[^>]+>/g,'').length*105))}
function say(parts){last=parts;const id=++sid;if(!on()||!window.speechSynthesis)return;speechSynthesis.cancel();m.classList.add('talking');let i=0;
 (function nx(){if(id!==sid)return;if(i>=parts.length){m.classList.remove('talking');return}const p=parts[i++],u=new SpeechSynthesisUtterance(p.t);u.lang=p.l||'th-TH';u.rate=p.r||(u.lang[0]==='t'?.94:.8);u.pitch=1.12;
  const v=speechSynthesis.getVoices().find(x=>x.lang.toLowerCase().startsWith(u.lang.slice(0,2)));if(v)u.voice=v;u.onend=u.onerror=nx;speechSynthesis.speak(u)})()}
const TH=t=>({t,l:'th-TH'}),EN=(t,r)=>({t,l:'en-US',r});
function talk(html,parts,ms){show(html,ms);say(parts)}
b.addEventListener('click',()=>{if(last)say(last)});
const oc=window.coach;
if(typeof oc==='function')window.coach=function(text){coachedAt=Date.now();show(esc(text),Math.max(4500,String(text).length*95));m.classList.add('talking');clearTimeout(tk);tk=setTimeout(()=>m.classList.remove('talking'),Math.min(9000,String(text).length*100));return oc.apply(this,arguments)};
function ctx(){const u=U();if(!u||!u.items)return null;const it=u.items,q=s=>document.querySelector(s);
 const tq=q('.talk-question strong');if(tq){const item=window.__talkNow&&window.__talkNow();return item&&item.en===tq.textContent.trim()?{type:'talk',item}:null}
 if(q('#spellInput')){const c=(q('.spell-clue')?.textContent||'').trim(),item=it.find(x=>x[1]===c);return item&&{type:'spell',item}}
 if(q('#answerTray')){const th=(q('.activity-card p.muted')?.textContent||'').replace(/^ความหมาย:\s*/,'').trim(),item=it.find(x=>x[4]===th);return item&&{type:'order',item}}
 if(q('.activity-option')){const e=(q('.activity-emoji')?.textContent||'').trim(),item=it.find(x=>x[2]===e);return item&&{type:'listen',item}}
 return null}
const sigOf=c=>c?c.type+'|'+(c.item[0]||c.item.en):'';let lastI=0;['pointerdown','keydown','click','input'].forEach(ev=>document.addEventListener(ev,()=>{lastI=Date.now()},true));
const RIGHT=n=>[[`เก่งมากค่ะ น้อง${n}`,'Great job!'],[`ถูกต้องเลยค่ะ น้อง${n} เยี่ยมมาก`,'Excellent!'],[`ใช่แล้วค่ะ น้อง${n} ทำได้ดีมากเลย`,'Well done!'],[`ครูภูมิใจในตัวน้อง${n} นะคะ`,'Awesome!']];
let ri=0;
const seen=new WeakMap();
function fb(){document.querySelectorAll('.feedback').forEach(el=>{const t=el.textContent.trim();if(!t||seen.get(el)===t)return;seen.set(el,t);const c=ctx();if(!c)return;const n=nm();
 if(c.type==='talk'){if(/ลอง|ยังไม่|ไม่เป็นไร/.test(t)){const s=sigOf(c);W[s]=(W[s]||0)+1;m.classList.add('help')}else if(/ถูก|เก่ง|ยอดเยี่ยม/.test(t))m.classList.remove('help');return}
 if(/^คำใบ้/.test(t)||Date.now()-lastI>3000)return;
 const later=fn=>setTimeout(()=>{if(Date.now()-coachedAt>1600)fn();},320);
 if(/น้อง/.test(t)){if(/เก่ง|ถูก/.test(t)){m.classList.remove('help');show(esc(t));}return}
 if(/^(ถูกต้อง|เรียงได้ถูกต้อง)/.test(t)){const[th,en]=RIGHT(n)[ri++%4];const nt=th+' 🌟';el.textContent=nt;seen.set(el,nt);m.classList.remove('help');show(`${esc(th)}<span class="en">${en}</span>`);later(()=>say([TH(th),EN(en)]));return}
 if(/ลอง|ยังไม่/.test(t)&&!/^ไม่เป็นไร/.test(t)){const s=sigOf(c);W[s]=(W[s]||0)+1;const nt=`ไม่เป็นไรค่ะ น้อง${n} ${t}`;el.textContent=nt;seen.set(el,nt);m.classList.add('help');show(`${esc(nt)}<small>กดครูแมวถ้าอยากได้คำใบ้ค่ะ 💡</small>`);later(()=>say([TH(nt)]))}})}
function hint(c,lv){const n=nm();
 if(c.type==='talk'){const q=c.item,ans=window.__talkAnswer?window.__talkAnswer(q):q.answer,st=ans.split(/\s+/).slice(0,3).join(' ');
  if(lv===1){const h=String(q.hint||(q.meaning?'คำถามนี้แปลว่า '+q.meaning:'ลองตอบเป็นประโยคสั้น ๆ นะคะ')).replace(/[“”]/g,'');return talk(`ใบ้ให้ค่ะ น้อง${esc(n)} ${esc(h)}`,[TH(`ใบ้ให้ค่ะ น้อง${n} ${h}`)])}
  if(lv===2)return talk(`ขึ้นต้นว่า <span class="en">${esc(st)} …</span>`,[TH('ขึ้นต้นว่า'),EN(st,.75)]);
  return talk(`ลองพูดตามครูนะคะ <span class="en">${esc(ans)}</span>`,[TH('ลองพูดตามครูนะคะ'),EN(ans,.75)])}
 const it=c.item,w=it[0],first=w.trim()[0]||'',letters=w.replace(/[^a-z]/gi,'');
 if(c.type==='listen'){const opts=[...document.querySelectorAll('.activity-option')];
  if(lv===1){document.querySelectorAll('.activity-emoji .ej').forEach(e=>{e.classList.remove('go');void e.offsetWidth;e.classList.add('go')});return talk(`ลองฟังประโยคนี้อีกครั้งนะคะ น้อง${esc(n)} แล้วดูรูปประกอบด้วยค่ะ<span class="en">${esc(it[3])}</span>`,[TH(`ลองฟังประโยคนี้อีกครั้งนะคะ น้อง${n}`),EN(it[3])])}
  if(lv===2){const bad=opts.filter(o=>o.textContent.trim()!==it[1]&&!o.disabled);if(bad.length>1){const o=bad[Math.floor(Math.random()*bad.length)];o.disabled=true;o.classList.add('cat-gone');return talk('ครูตัดตัวเลือกที่ไม่ใช่ออกให้หนึ่งข้อแล้วค่ะ ลองเลือกใหม่นะคะ',[TH('ครูตัดตัวเลือกที่ไม่ใช่ออกให้หนึ่งข้อแล้วค่ะ ลองเลือกใหม่นะคะ')])}}
  opts.forEach(o=>{if(o.textContent.trim()===it[1])o.classList.add('cat-hint')});H[sigOf(c)]=3;
  return talk(`เฉลยค่ะ <span class="en">${esc(w)}</span>แปลว่า ${esc(it[1])}`,[TH('เฉลยค่ะ'),EN(w),TH('แปลว่า '+it[1])])}
 if(c.type==='spell'){
  if(lv===1)return talk(`คำนี้แปลว่า ${esc(it[1])} มี ${letters.length} ตัวอักษรค่ะ`,[TH(`คำนี้แปลว่า ${it[1]} มี ${letters.length} ตัวอักษรค่ะ`)]);
  if(lv===2)return talk(`ขึ้นต้นด้วยตัว <span class="en">${esc(first.toUpperCase())}</span>ค่ะ`,[TH('ขึ้นต้นด้วยตัว'),EN(first.toLowerCase(),.7),TH('ค่ะ')]);
  return talk(`เฉลยค่ะ <span class="en">${esc(w)}</span>สะกดว่า ${esc(letters.toUpperCase().split('').join(' '))}`,[TH('เฉลยค่ะ'),EN(w,.7),TH('สะกดว่า'),EN(letters.split('').join(', '),.6)])}
 if(c.type==='order'){const fw=(it[3]||'').split(/\s+/)[0];
  if(lv===1)return talk(`ประโยคนี้แปลว่า ${esc(it[4]||'')} ลองหาคำแรกของประโยคนะคะ`,[TH(`ประโยคนี้แปลว่า ${it[4]||''} ลองหาคำแรกของประโยคนะคะ`)]);
  if(lv===2){document.querySelectorAll('.word-chip[data-word]').forEach(x=>{if(x.textContent.trim().toLowerCase()===fw.toLowerCase())x.classList.add('cat-hint')});return talk(`คำแรกคือ <span class="en">${esc(fw)}</span>ค่ะ`,[TH('คำแรกคือ'),EN(fw,.7)])}
  return talk(`เฉลยค่ะ<span class="en">${esc(it[3])}</span>`,[TH('เฉลยค่ะ'),EN(it[3],.7)])}}
window.__catTap=function(){const c=ctx(),n=nm();
 if(!c){const L=[`สู้ๆ นะคะ น้อง${n} ครูแมวอยู่ข้างๆ เสมอค่ะ`,`วันนี้น้อง${n} เก่งขึ้นอีกนิดแล้วนะคะ`,`ค่อยๆ เรียนไปทีละคำนะคะ น้อง${n}`,`ครูแมวเชียร์น้อง${n} อยู่ค่ะ`],t=L[Math.floor(Math.random()*L.length)];return talk(esc(t),[TH(t)])}
 const s=sigOf(c);
 if(!W[s]&&c.type!=='talk')return talk(`ลองคิดก่อนนะคะ น้อง${esc(n)} ถ้าตอบไม่ถูก กดครูแมวมาขอคำใบ้ได้เลยค่ะ`,[TH(`ลองคิดก่อนนะคะ น้อง${n} ถ้าตอบไม่ถูก กดครูแมวมาขอคำใบ้ได้เลยค่ะ`)]);
 H[s]=Math.min(3,(H[s]||0)+1);hint(c,H[s])};
function greet(){const u=U();if(!u||greeted===u.id||!document.querySelector('.activity-welcome'))return;greeted=u.id;const n=nm();
 setTimeout(()=>talk(`วันนี้เรามาเรียนเรื่อง ${esc(u.th)} กันนะคะ น้อง${esc(n)}<span class="en">${esc(u.title)}</span>`,[TH(`วันนี้เรามาเรียนเรื่อง${u.th} กันนะคะ น้อง${n}`),EN(u.title)]),700)}
function wrapCeleb(){const f=window.showSuccessCelebration;if(typeof f==='function'&&!f.__cat){const g=function(){const u=U();if(u)setTimeout(()=>{if(Date.now()-coachedAt>2000)talk(`เรียนครบ ${u.items.length} คำแล้วค่ะ น้อง${esc(nm())} เก่งมากเลย<span class="en">Well done!</span>`,[TH(`เรียนครบ ${u.items.length} คำแล้วค่ะ น้อง${nm()} เก่งมากเลย`),EN('Well done!')])},900);return f.apply(this,arguments)};g.__cat=1;window.showSuccessCelebration=g}}
let st=0;addEventListener('scroll',()=>{m.classList.add('away');clearTimeout(st);st=setTimeout(()=>m.classList.remove('away'),700)},true);
let q=0;new MutationObserver(()=>{if(q)return;q=requestAnimationFrame(()=>{q=0;fb();greet()})}).observe(document.body,{childList:true,subtree:true,characterData:true});
setInterval(()=>{const s=sigOf(ctx());if(s!==curSig){curSig=s;m.classList.toggle('help',!!W[s])}wrapCeleb()},700);
})();
