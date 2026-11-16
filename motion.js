(function(){
const EM={};try{for(const g in COURSE_BANK)for(const v in COURSE_BANK[g])COURSE_BANK[g][v].forEach(u=>u.items.forEach(i=>{if(!EM[i[2]])EM[i[2]]=i[0]}))}catch(e){}
const mk=a=>a.map(([k,c])=>[new RegExp('\\b('+k+')\\b','i'),c]);
const WORD=mk([['thank|sorry|thankful|respectfully','bow'],['hello|goodbye|greeting|nurse|teacher|farmer|police officer|firefighter|mother|father|sister|brother|grandma|family|customer|cashier|friend|name|engineer|designer|scientist|pilot|journalist|entrepreneur','wave'],
['happy|smile|kind|red|blue|green|yellow|black|white|circle|square|healthier|safer|cheaper|heavier|quieter|more useful','pulse'],['baby|cat|dog','wiggle'],['elephant','sway'],['turtle','crawl'],['rabbit','hop'],
['bird|butterfly|kite|airplane|fly','fly'],['fish|boat|island|swim','swim'],['sunny|hot|sun','sun'],['cold','shiver'],['windy','wind'],['rainy|stormy|waterfall|water pollution|water|juice|milk|drink clean water','rain'],
['foggy|cloudy|humid|dry','drift'],['sleep early|sleep|bed|tired|go to bed','zzz'],['jump|skip rope|exercise|excited|play','jump'],['sit down','sit'],['stand up|wake up','stand'],
['sing|dance|music|instrument|lantern|celebration|costume|tradition','dance'],['wash my face|wash my hands|wash the dishes|clean|sweep the floor|brush my teeth|make the bed|take out the rubbish|litter|recycle|reuse|repair','scrub'],
['eat breakfast|eat vegetables|bread|orange|grapes|yogurt|cheese|rice|banana|apple|egg|cook|snack','munch'],['book|read stories|read|library|bookstore|history','flip'],
['draw|pencil|crayon|ruler|eraser|desk|art|keyboard|password|website|message|search engine|research|organize|create|present|feedback|improve|map|schedule|ticket|price tag|receipt|character|setting|problem|solution|evidence|conclusion','write'],
['turn left','left'],['turn right','right'],['go straight|climb','up'],['next to|between|opposite|in|under','peek'],['stomachache|toothache|headache|medicine|worried|appointment|temperature','droop'],
['listen|look|science|computer studies','look'],['open|door','open'],['help|share|carry|protect|reduce|suggest|explain','lift'],['throw|catch','toss'],['swing','swing'],
['run|ride a bike|bus|bicycle|motorcycle|train set|train|go to school|crosswalk|traffic light|bus station|destination|luggage','run']]);
const UNIT=mk([['animal|nature','hop'],['food|snack|yummy','munch'],['body|hello|family|friends|helpers|talk','wave'],['weather','sun'],['colors?|shapes?|feelings|health|help|advice|routine','pulse'],['count','pops'],
['play|toys|games|playground|fun','jump'],['school|classroom|subjects|stories|project|technology|future','write'],['around|trip|way|town|shops|getting','run'],['environment|culture','dance']]);
const PART={rain:'💧',zzz:'💤',sun:'✨',shiver:'❄️',wind:'💨',dance:'🎵',fly:'✨',scrub:'🫧',flip:'📖',write:'✏️',bow:'💖',wave:'👋'};
function cls(w,list){for(const[r,c]of list)if(r.test(w))return c;return'bob'}
window.__eaMotion=w=>cls(w,WORD);
function seg(s){try{return[...new Intl.Segmenter(undefined,{granularity:'grapheme'}).segment(s)].map(x=>x.segment)}catch(e){return[...s]}}
function wordFor(el){const c=el.classList;
 if(c.contains('word-emoji')){const r=el.closest('.word-row');return[(r&&r.querySelector('.word-en')?.textContent)||'',WORD]}
 if(c.contains('activity-emoji'))return[EM[el.textContent.trim()]||'',WORD];
 const u=el.closest('.unit');return[(u&&u.querySelector('h3')?.textContent)||'',UNIT]}
function scan(){document.querySelectorAll('.word-emoji,.activity-emoji,.unit-emoji,.activity-choice-icon').forEach(el=>{
 if(el.dataset.ej)return;const txt=el.textContent.trim();if(!txt)return;const[w,list]=wordFor(el);const sg=seg(txt);
 const multi=sg.length>1&&new Set(sg).size===1;let c=cls(w,list);if(multi)c='pops';
 el.dataset.ej=c;el.textContent='';
 (multi?sg:[txt]).forEach((s,i)=>{const sp=document.createElement('span');sp.className='ej mv-'+c;sp.style.setProperty('--i',i);sp.textContent=s;el.appendChild(sp)})})}
let q=0;new MutationObserver(()=>{if(q)return;q=requestAnimationFrame(()=>{q=0;scan()})}).observe(document.body,{childList:true,subtree:true});scan();
const calm=matchMedia('(prefers-reduced-motion:reduce)').matches;
function burst(el){const e=el.querySelector('.ej');if(!e)return;e.classList.remove('go');void e.offsetWidth;e.classList.add('go');setTimeout(()=>e.classList.remove('go'),650);if(calm)return;
 const r=el.getBoundingClientRect(),p=PART[el.dataset.ej]||seg(el.textContent.trim())[0];
 for(let k=0;k<7;k++){const s=document.createElement('span');s.className='spark pt';s.textContent=p;s.style.left=r.left+r.width/2+'px';s.style.top=r.top+r.height/2+'px';
  const a=Math.PI*2*k/7;s.style.setProperty('--dx',Math.cos(a)*48+'px');s.style.setProperty('--dy',Math.sin(a)*48-10+'px');document.body.appendChild(s);setTimeout(()=>s.remove(),750)}}
document.addEventListener('click',e=>{
 const em=e.target.closest('[data-ej]');if(em)return burst(em);
 const b=e.target.closest('.speak-btn');if(b){const r=b.closest('.word-row');const t=r&&r.querySelector('.word-emoji');if(t)burst(t)}
 else if(e.target.closest('#listenWord')){const t=document.querySelector('.activity-emoji');if(t)burst(t)}},true);
})();
