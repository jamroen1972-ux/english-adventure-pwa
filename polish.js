(function(){
const MSG=[["Great job!","เก่งมาก!"],["Keep going!","สู้ต่อไปนะ"],["You can do it!","หนูทำได้!"],["Let's learn together!","มาเรียนด้วยกัน"],["Well done!","ทำได้ดีมาก"],["Try again!","ลองอีกครั้งนะ"],["High five!","ตบมือ!"],["Awesome!","สุดยอด!"]];
function tag(){document.querySelectorAll('button').forEach(b=>{if(/^\s*🎙/.test(b.textContent)&&!b.classList.contains('mic-fix'))b.classList.add('mic-fix')})}
tag();new MutationObserver(tag).observe(document.body,{childList:true,subtree:true});
const m=document.createElement('button');m.className='mascot';m.type='button';m.setAttribute('aria-label','คุณครูแมวให้กำลังใจ');m.textContent='🐱';
const bub=document.createElement('div');bub.className='mascot-bubble';bub.setAttribute('aria-live','polite');
document.body.append(bub,m);
const SHOW=['homeView','lessonsView','progressView','studyView'];
function upd(){const v=document.querySelector('.view.active');const ok=v&&SHOW.includes(v.id);m.hidden=!ok;if(!ok&&bub.classList.contains('show'))bub.classList.remove('show')}
upd();new MutationObserver(upd).observe(document.body,{attributes:true,subtree:true,attributeFilter:['class']});
let t,i=0;
m.addEventListener('click',()=>{if(sup){sup=false;return}if(window.__catTap){window.__catTap();return}const [en,th]=MSG[i++%MSG.length];bub.innerHTML=en+'<small>'+th+'</small>';pos();bub.classList.add('show');clearTimeout(t);t=setTimeout(()=>bub.classList.remove('show'),3200);
 const v=document.getElementById('voiceToggle');
 if(window.speechSynthesis&&(!v||v.getAttribute('aria-pressed')!=='false')){speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(en);u.lang='en-US';u.rate=.85;u.pitch=1.2;speechSynthesis.speak(u)}});
if(!matchMedia('(prefers-reduced-motion:reduce)').matches)document.addEventListener('pointerdown',e=>{
 if(e.target.closest('.mascot')||!e.target.closest('button,.option,.activity-choice'))return;
 for(let k=0;k<6;k++){const s=document.createElement('span');s.className='spark';s.textContent=['⭐','✨','💫'][k%3];s.style.left=e.clientX+'px';s.style.top=e.clientY+'px';
  const a=Math.PI*2*k/6;s.style.setProperty('--dx',Math.cos(a)*34+'px');s.style.setProperty('--dy',Math.sin(a)*34+'px');document.body.appendChild(s);setTimeout(()=>s.remove(),750)}
},true);

let sup=false,dg=null;
const KEY='ea-mascot',SZ=58;
function clampXY(x,y){return[Math.min(Math.max(8,x),innerWidth-SZ-8),Math.min(Math.max(8,y),innerHeight-SZ-86)]}
function put(x,y){[x,y]=clampXY(x,y);m.style.left=x+'px';m.style.top=y+'px';m.style.right='auto';m.style.bottom='auto';return[x,y]}
function pos(){const r=m.getBoundingClientRect();bub.style.right='auto';bub.style.bottom='auto';
 const w=bub.offsetWidth,h=bub.offsetHeight;
 let l=Math.min(Math.max(8,r.left+SZ/2-w/2),innerWidth-w-8),tp=r.top-h-12;if(tp<8)tp=r.bottom+12;
 bub.style.left=l+'px';bub.style.top=tp+'px'}
function restore(){try{const v=JSON.parse(localStorage.getItem(KEY)||'null');if(v)put(v.x*innerWidth,v.y*innerHeight)}catch(e){}}
restore();addEventListener('resize',()=>{if(m.style.left){const r=m.getBoundingClientRect();put(r.left,r.top)}});
m.style.touchAction='none';
m.addEventListener('pointerdown',e=>{const r=m.getBoundingClientRect();dg={x:e.clientX,y:e.clientY,ox:e.clientX-r.left,oy:e.clientY-r.top,moved:false};m.setPointerCapture(e.pointerId)});
m.addEventListener('pointermove',e=>{if(!dg)return;
 if(!dg.moved&&Math.hypot(e.clientX-dg.x,e.clientY-dg.y)<7)return;
 dg.moved=true;m.classList.add('dragging');bub.classList.remove('show');put(e.clientX-dg.ox,e.clientY-dg.oy)});
function end(){if(!dg)return;const mv=dg.moved;dg=null;m.classList.remove('dragging');
 if(mv){sup=true;setTimeout(()=>{sup=false},300);const r=m.getBoundingClientRect();try{localStorage.setItem(KEY,JSON.stringify({x:r.left/innerWidth,y:r.top/innerHeight}))}catch(e){}}}
m.addEventListener('pointerup',end);m.addEventListener('pointercancel',end);
})();
