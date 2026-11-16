const CACHE='english-adventure-v61';
const CORE=['./','./index.html','./manifest.webmanifest','./icon.svg','./icon-192.png','./icon-maskable-512.png','./app.js','./courses.js','./learning-plus.js','./polish.css','./polish.js','./motion.js','./cat.js','./translator-banner.webp','./translator-banner-clean.webp','./home-intro-poster.jpg','./animal-words.html','./word-jump-grades-3-6/index.html','./word-jump-grades-3-6/three.min.js','./phonics-p1.html','./phonics-p2.html','./phonics-p3.html','./phonics-p4.html','./phonics-p5.html','./phonics-p6.html'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
 const r=e.request,u=new URL(r.url);
 if(r.method!=='GET'||r.headers.has('range'))return;
 if(u.hostname==='api.mymemory.translated.net')return;
 if(r.mode==='navigate'){
  e.respondWith(fetch(r).then(res=>{if(res.ok){const k=u.pathname.endsWith('/')||u.pathname.endsWith('/index.html');const copy=res.clone();caches.open(CACHE).then(c=>c.put(k?'./':r,copy))}return res}).catch(()=>caches.match(r).then(h=>h||caches.match('./'))));
  return;
 }
 if(u.hostname==='fonts.googleapis.com'||u.hostname==='fonts.gstatic.com'){
  e.respondWith(caches.match(r).then(h=>h||fetch(r).then(res=>{const copy=res.clone();caches.open(CACHE).then(c=>c.put(r,copy));return res})));
  return;
 }
 e.respondWith(caches.match(r).then(h=>h||fetch(r).then(res=>{if(u.origin===location.origin&&res.ok){const copy=res.clone();caches.open(CACHE).then(c=>c.put(r,copy))}return res})));
});
