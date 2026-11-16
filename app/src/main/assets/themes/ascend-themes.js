/* Ascend Theme Studio — 20 themes (2 free + 18 premium), applied app-wide.
   Every palette is checked for readable contrast at runtime, so no theme can ship unreadable text. */
(function(){'use strict';
const T=[
 // id, scene, free, darkOnly, [name EN, AR], [desc EN, AR], swatches, light {bg,ink,accent,top}, dark {…}
 ['premium-minimal','minimal',1,0,['Premium Minimal','البسيط الفاخر'],['Clean, modern, and focused','نظيف وعصري ومركّز'],['#e9ece6','#b9c9bb','#8fa596','#4b5a50'],{bg:'#eef2ec',ink:'#24332b',accent:'#4f7a62',top:'#f4f6f2'},{bg:'#1a221f',ink:'#e6eee8',accent:'#8cc3a2',top:'#1c2622'}],
 ['modern-colorful','colorful',1,0,['Modern Colorful','العصري الملوّن'],['Vibrant, energetic, and lively','حيوي ونشيط ومفعم بالحياة'],['#38c6f4','#ff6fb5','#b06cff','#ffd34d'],{bg:'#f5efff',ink:'#2e2450',accent:'#7c4ddb',top:'#f7e9ff'},{bg:'#1d1640',ink:'#efeaff',accent:'#c3a3ff',top:'#1d1640'}],
 ['midnight-focus','midnight',0,1,['Midnight Focus','تركيز منتصف الليل'],['Dark, sleek, and productive','داكن وأنيق ومنتج'],['#0f1a3d','#2c4fa3','#6f8cff','#9b7bff'],{bg:'#111a3d',ink:'#e8ecff',accent:'#8aa4ff',top:'#1a2552'},{bg:'#0b1028',ink:'#e8ecff',accent:'#7f9cff',top:'#070b1f'}],
 ['soft-cozy','cozy',0,0,['Soft & Cozy','دافئ ومريح'],['Warm, calm, and comfortable','دافئ وهادئ ومريح'],['#fbe7d6','#e8c3a6','#c98a6a','#8a5a44'],{bg:'#f8ece2',ink:'#4a3226',accent:'#a55e42',top:'#fbe7d6'},{bg:'#2a1f1a',ink:'#f4e6da',accent:'#e8a07a',top:'#3a2a24'}],
 ['nature-balance','nature',0,0,['Nature & Balance','الطبيعة والتوازن'],['Natural, fresh, and balanced','طبيعي ومنعش ومتوازن'],['#2f6b3a','#4f9a55','#8fca86','#d6efc4'],{bg:'#eaf5e4',ink:'#1f3a25',accent:'#3a8049',top:'#dff2d0'},{bg:'#0f1f17',ink:'#e3f3e6',accent:'#7fd39a',top:'#0d1f1a'}],
 ['aurora-glass','auroraGlass',0,0,['Aurora Glass','زجاج الشفق'],['Modern, glassy, and elegant','عصري وزجاجي وأنيق'],['#5fd6ff','#6f8cff','#9b7bff','#c06cff'],{bg:'#ece8ff',ink:'#28245a',accent:'#6a5cd8',top:'#cfc4ff'},{bg:'#151236',ink:'#ecebff',accent:'#a99cff',top:'#120c35'}],
 ['zen-garden','zen',0,0,['Zen Garden','حديقة الزن'],['Peaceful, minimal, and mindful','هادئ وبسيط وواعٍ'],['#d7ddd5','#a9b5a8','#7d8a7c','#e6a6b8'],{bg:'#eef1ec',ink:'#2a332d',accent:'#5f7263',top:'#eef2ea'},{bg:'#1c231f',ink:'#e7ece8',accent:'#a9c2ae',top:'#1c2420'}],
 ['joyful-progress','joyful',0,0,['Joyful Progress','تقدّم مبهج'],['Bright, optimistic, and motivating','مشرق ومتفائل ومحفّز'],['#ffd166','#7fc8ff','#ff9ec0','#ff7a6e'],{bg:'#fff6e8',ink:'#4a2f2a',accent:'#d0533e',top:'#fff4c6'},{bg:'#2a1f3a',ink:'#fdeee8',accent:'#ffa08a',top:'#2a1f4a'}],
 ['emerald-night','emerald',0,1,['Emerald Night','ليلة الزمرد'],['Rich, elegant, and immersive','غني وأنيق وغامر'],['#0e3a2e','#1f8a6a','#3dffb0','#0b1f1a'],{bg:'#082820',ink:'#e4fff4',accent:'#3fd6a0',top:'#0b2a24'},{bg:'#06201a',ink:'#e4fff4',accent:'#3fd6a0',top:'#03140f'}],
 ['tranquil-horizon','tranquil',0,0,['Tranquil Horizon','الأفق الهادئ'],['Serene, spacious, and inspiring','صافٍ ورحب وملهم'],['#f2d7e8','#e8c6f0','#cbb8e6','#2e2a44'],{bg:'#f4ecfa',ink:'#3a2f52',accent:'#7f5fc0',top:'#efe6ff'},{bg:'#1e1a36',ink:'#f0eaff',accent:'#c4b0ff',top:'#1e1a3a'}],
 ['sunset-calm','sunset',0,0,['Sunset Calm','هدوء الغروب'],['Warm, soothing, and uplifting','دافئ ومريح ومبهج'],['#ffc2a8','#ff9a9a','#f7e3d6','#b58ab8'],{bg:'#fbe9e4',ink:'#4a2a38',accent:'#b84a5f',top:'#ffd9a8'},{bg:'#24182c',ink:'#fbe8ea',accent:'#ff9a8a',top:'#2a1a3a'}],
 ['ocean-breeze','ocean',0,0,['Ocean Breeze','نسيم المحيط'],['Fresh, clear, and refreshing','منعش وصافٍ ومنشّط'],['#38c2d8','#9fe9f5','#58b8e8','#1a6ab8'],{bg:'#e8f8fc',ink:'#0f3a4a',accent:'#0b7c99',top:'#bfeeff'},{bg:'#0b2236',ink:'#e4f6ff',accent:'#5fd0e8',top:'#0b2340'}],
 ['dreamy-twilight','twilight',0,0,['Dreamy Twilight','شفق حالم'],['Calming, dreamy, and focused','هادئ وحالم ومركّز'],['#a68af0','#c7b8ff','#b69cff','#7a5ae0'],{bg:'#efeaff',ink:'#2e2660',accent:'#6450c8',top:'#cfc2ff'},{bg:'#17123a',ink:'#eeeaff',accent:'#b8a4ff',top:'#1a1440'}],
 ['cherry-blossom','cherry',0,0,['Cherry Blossom','زهر الكرز'],['Elegant, soft, and graceful','أنيق وناعم ورقيق'],['#ffd6e2','#ffb9d0','#f78ab0','#a8436e'],{bg:'#fff0f4',ink:'#4a2433',accent:'#c03c6e',top:'#fff0f4'},{bg:'#25161f',ink:'#ffe9f0',accent:'#ff8fb5',top:'#2a1a2e'}],
 ['desert-harmony','desert',0,0,['Desert Harmony','انسجام الصحراء'],['Earthy, warm, and grounded','ترابي ودافئ ومتزن'],['#f2d2b0','#f0b070','#d98f4f','#8a4a2a'],{bg:'#fbefe0',ink:'#4a2f1c',accent:'#a85a24',top:'#ffe8c4'},{bg:'#2a1c16',ink:'#fbeee0',accent:'#f0a060',top:'#2a1a2a'}],
 ['polar-aurora','polar',0,1,['Polar Aurora','الشفق القطبي'],['Bold, vibrant, and inspiring','جريء وحيوي وملهم'],['#2a6ad8','#7affd6','#c07aff','#0e1440'],{bg:'#121640',ink:'#eef0ff',accent:'#86c0ff',top:'#1a2a6a'},{bg:'#0e1236',ink:'#eef0ff',accent:'#7ab8ff',top:'#080c2a'}],
 ['mediterranean','med',0,0,['Mediterranean','البحر المتوسط'],['Bright, serene, and travel-inspired','مشرق وهادئ ومستوحى من السفر'],['#1a62c8','#ffffff','#f2ede4','#e0479e'],{bg:'#f1f7ff',ink:'#12305a',accent:'#1a5cbc',top:'#cfeaff'},{bg:'#0e1c38',ink:'#e8f1ff',accent:'#6aa8ff',top:'#0e2450'}],
 ['garden-bloom','garden',0,0,['Garden Bloom','إزهار الحديقة'],['Lively, natural, and positive','نابض وطبيعي وإيجابي'],['#4a9a3a','#c8eab0','#ff9ec0','#ffd34d'],{bg:'#f1fae6',ink:'#24401f',accent:'#3f8a30',top:'#f2ffe0'},{bg:'#14231a',ink:'#eaf7e4',accent:'#8fd47a',top:'#1a2a1e'}],
 ['cozy-coffee','coffee',0,0,['Cozy Coffee','قهوة دافئة'],['Warm, cozy, and productive','دافئ ومريح ومنتج'],['#d9b896','#fff6e8','#c98a5a','#4a2c1a'],{bg:'#f6ebe0',ink:'#3e2a1c',accent:'#85552f',top:'#e8cdb0'},{bg:'#1e150f',ink:'#f4e8dc',accent:'#d9a070',top:'#24170f'}],
 ['cosmic-focus','cosmic',0,1,['Cosmic Focus','تركيز كوني'],['Modern, deep, and motivating','عصري وعميق ومحفّز'],['#3ad6ff','#6a8aff','#9a8aff','#c07aff'],{bg:'#110d38',ink:'#eeeaff',accent:'#a99cff',top:'#120c3a'},{bg:'#0b0a2a',ink:'#eeeaff',accent:'#9a8aff',top:'#04041a'}],
].map((t,i)=>({n:i+1,id:t[0],scene:t[1],free:!!t[2],darkOnly:!!t[3],name:t[4],desc:t[5],sw:t[6],L:t[7],D:t[8]}));
const byId=Object.fromEntries(T.map(t=>[t.id,t]));
const KEY='steadyday-theme';
const ar=()=>document.documentElement.lang==='ar';const tr=(en,a)=>ar()?a:en;

/* ---------- Edition ----------
   Ascend is built twice: "full" (everything unlocked) and "free". The edition is fixed when the APK is
   built (Android product flavour) and read from the app — never from storage the user could edit.
   A future store purchase would also unlock here, from a verified purchase only. */
const EDITION=(()=>{try{return window.SteadyDayNative&&typeof SteadyDayNative.edition==='function'&&SteadyDayNative.edition()==='full'?'full':'free'}catch(e){return'free'}})();
window.AscendPremium={edition:EDITION,isUnlocked:()=>EDITION==='full'};
const PREVIEW_SECONDS=8;
const ACCENTS=['#2f7a5a','#1a6ab8','#6a4cd0','#b0367a','#c0482e','#a86a12','#0f8a8a','#4a5a6a','#8a3ab8','#d0477a','#3a8a2a','#24315e'];
const accentPref=()=>{const a=localStorage.getItem('ascend-accent');return AscendPremium.isUnlocked()&&/^#[0-9a-f]{6}$/i.test(a||'')?a:null};
const unlocked=t=>t.free||AscendPremium.isUnlocked();

/* ---------- Colour maths & contrast guarantee ---------- */
const hx=h=>{h=h.replace('#','');if(h.length===3)h=h.split('').map(c=>c+c).join('');return[0,2,4].map(i=>parseInt(h.slice(i,i+2),16))};
const toHex=c=>'#'+c.map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('');
const mix=(a,b,t)=>{const x=hx(a),y=hx(b);return toHex(x.map((v,i)=>v+(y[i]-v)*t))};
const lum=h=>{const c=hx(h).map(v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)});return .2126*c[0]+.7152*c[1]+.0722*c[2]};
const contrast=(a,b)=>{const x=lum(a),y=lum(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
function ensure(fg,bg,min,dark){let c=fg;for(let i=0;i<40&&contrast(c,bg)<min;i++)c=mix(c,dark?'#ffffff':'#000000',.08);return c}
function palette(t,dark,noCustom){
 const m0=(t.darkOnly||dark)?t.D:t.L,D=t.darkOnly||dark,acc=noCustom?null:accentPref();
 const m=acc?{...m0,accent:D?mix(acc,'#ffffff',.35):acc}:m0;
 const surface=D?mix(m.bg,'#ffffff',.07):mix(m.bg,'#ffffff',.8);
 const surface2=D?mix(m.bg,'#ffffff',.12):mix(mix(m.bg,'#ffffff',.55),m.accent,.06);
 const ink=ensure(m.ink,surface,7,D);
 const muted=ensure(mix(ink,surface,.38),surface,4.6,D);
 const accentText=ensure(m.accent,surface,4.6,D);
 let btn=m.accent;const onW=contrast('#ffffff',btn),onK=contrast('#141414',btn);let on=onW>=onK?'#ffffff':'#141414';
 for(let i=0;i<40&&contrast(on,btn)<4.6;i++)btn=mix(btn,on==='#ffffff'?'#000000':'#ffffff',.06);
 const chip=D?mix(m.bg,m.accent,.22):mix(mix(m.bg,'#ffffff',.6),m.accent,.14);
 const chipText=ensure(accentText,chip,4.6,D);
 const border=D?mix(m.bg,'#ffffff',.18):mix(m.bg,ink,.14);
 const input=D?mix(m.bg,'#ffffff',.1):'#ffffff';
 const topDark=lum(m.top)<.3;
 const artInk=topDark?'#ffffff':ensure(m.ink,m.top,7,false);
 return{D,bg:m.bg,surface,surface2,ink,muted,accent:m.accent,accentText,btn,on,chip,chipText,border,input,top:m.top,topDark,artInk,track:D?mix(m.bg,'#ffffff',.2):mix(m.bg,m.accent,.18)};
}
window.AscendThemePalette=palette;window.AscendThemeContrast=contrast;window.AscendThemes=T;

/* ---------- Artwork cache (data URIs isolate each SVG's ids) ---------- */
const artCache={};
function artURL(t,dark){const k=t.scene+(dark?'D':'L');if(!artCache[k])artCache[k]='url("data:image/svg+xml,'+encodeURIComponent(AscendArt.render(t.scene,dark))+'")';return artCache[k]}
window.AscendArtURL=(id,dark)=>artURL(byId[id]||T[0],dark);

/* ---------- Apply ---------- */
let saved=localStorage.getItem(KEY)||'premium-minimal';
if(!byId[saved]||!unlocked(byId[saved]))saved='premium-minimal';
let preview=null;
const current=()=>byId[preview||saved];
const wantDark=()=>!!(typeof data==='object'&&data&&data.dark);
function apply(){
 const t=current(),dark=t.darkOnly||wantDark(),p=palette(t,dark),b=document.body;if(!b)return;
 b.classList.add('at');b.classList.toggle('at-dark',p.D);b.classList.toggle('dark',p.D);
 b.dataset.theme='ascend';b.dataset.ascendTheme=t.id;
 const set=(k,v)=>b.style.setProperty('--at-'+k,v);
 ['bg','surface','surface2','ink','muted','accent','accentText','btn','on','chip','chipText','border','input','top','artInk','track'].forEach(k=>set(k.replace(/[A-Z]/g,c=>'-'+c.toLowerCase()),p[k]));
 set('art',artURL(t,dark));
 const meta=document.querySelector('meta[name=theme-color]');if(meta)meta.content=p.top;
 if(window.SteadyDayNative&&SteadyDayNative.setChrome&&window.__atChrome!==p.top+p.topDark){window.__atChrome=p.top+p.topDark;try{SteadyDayNative.setChrome(p.top,p.topDark)}catch(e){}}
 drawBanner();
}
window.ascendThemeChrome=()=>{const t=current(),p=palette(t,t.darkOnly||wantDark());return{color:p.top,dark:p.topDark}};
function choose(id){const t=byId[id];if(!t)return;if(!unlocked(t)){startPreview(id);return}preview=null;saved=id;try{localStorage.setItem(KEY,id)}catch(e){}apply();drawStudio();toastMsg(tr('Theme applied: ','تم تطبيق السمة: ')+t.name[ar()?1:0])}
let previewTimer=null,previewLeft=0;
function startPreview(id){clearInterval(previewTimer);preview=id;previewLeft=PREVIEW_SECONDS;apply();drawStudio();window.scrollTo({top:0,behavior:'smooth'});
 previewTimer=setInterval(()=>{previewLeft--;if(previewLeft<=0){endPreview();toastMsg(tr('Preview ended. Premium themes are included in Ascend Full.','انتهت المعاينة. السمات المميزة متاحة في أسيند الكامل.'))}else drawBanner()},1000)}
function endPreview(){clearInterval(previewTimer);previewTimer=null;preview=null;apply();drawStudio()}
window.ascendSetTheme=choose;window.ascendPreviewTheme=startPreview;window.ascendEndPreview=endPreview;
window.ascendCurrentTheme=()=>({saved,preview});
// Older code paths call setSteadyTheme(); route them through the engine.
window.setSteadyTheme=id=>{if(byId[id]&&unlocked(byId[id])){saved=id;try{localStorage.setItem(KEY,id)}catch(e){}}apply()};
function toastMsg(m){if(window.ascendToast)ascendToast(m)}

/* ---------- Preview banner ---------- */
function drawBanner(){
 let el=document.getElementById('atPreviewBar');
 if(!preview){if(el)el.remove();document.body.classList.remove('at-previewing');return}
 if(!el){el=document.createElement('div');el.id='atPreviewBar';el.setAttribute('role','status');document.body.append(el)}
 document.body.classList.add('at-previewing');
 const t=byId[preview];el.replaceChildren();
 const txt=document.createElement('span');txt.textContent=tr('Preview: ','معاينة: ')+t.name[ar()?1:0]+' · '+previewLeft+tr('s',' ث');
 const b=document.createElement('button');b.type='button';b.textContent=tr('End','إنهاء');b.setAttribute('aria-label',tr('End preview','إنهاء المعاينة'));b.onclick=endPreview;
 el.append(txt,b);
}

/* ---------- Today: progress ring + Habits / Tasks / Goals ---------- */
function todayStats(){
 const d=new Date(),k=typeof today==='function'?today():d.toISOString().slice(0,10);
 const hs=(data.habits||[]).filter(h=>Array.isArray(h.days)&&h.days.includes(d.getDay()));
 const hd=hs.filter(h=>h.log&&h.log[k]).length;
 const tt=(data.tasks||[]).filter(t=>t.date===k&&!t.cancelled),td=tt.filter(t=>t.done).length;
 const pending=(data.tasks||[]).filter(t=>!t.done&&!t.cancelled&&t.date&&t.date<=k).length;
 const goals=(data.goals||[]).filter(g=>Number(g.value)<Number(g.target)).length;
 const total=hs.length+tt.length,pct=total?Math.round((hd+td)/total*100):0;
 return{hd,hs:hs.length,pending,goals,pct};
}
const ICON={habits:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M8 3v4M16 3v4M3.5 10h17M8.5 15l2 2 4-4"/></svg>',tasks:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1.2"/><circle cx="4.5" cy="12" r="1.2"/><circle cx="4.5" cy="18" r="1.2"/></svg>',goals:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><path d="M12 12l7-7M15.5 5H19v3.5"/></svg>'};
function ringSVG(p,size,stroke){const r=(size-stroke)/2,c=2*Math.PI*r;return`<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" aria-hidden="true"><circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="var(--at-track)" stroke-width="${stroke}"/><circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="var(--at-accent)" stroke-width="${stroke}" stroke-linecap="round" stroke-opacity="${p>0?1:0}" stroke-dasharray="${(c*p/100).toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 ${size/2} ${size/2})"/></svg>`}
function drawHero(){
 const dash=document.getElementById('dashboard');if(!dash||typeof data!=='object')return;
 let h=document.getElementById('atHero');
 if(!h){h=document.createElement('section');h.id='atHero';h.addEventListener('click',e=>{const b=e.target.closest('[data-go]');if(b)page(b.dataset.go)});const anchor=document.getElementById('ascend61Today');dash.insertBefore(h,anchor||dash.firstChild)}
 const s=todayStats();
 h.innerHTML=`<div class="at-ring" role="img" aria-label="${tr('Daily progress','إنجاز اليوم')} ${s.pct}%">${ringSVG(s.pct,124,11)}<div><b>${s.pct}%</b><small>${tr('Daily progress','إنجاز اليوم')}</small></div></div>
 <div class="at-rows">
  <button type="button" data-go="habits">${ICON.habits}<span>${tr('Habits','العادات')}</span><b>${s.hd} / ${s.hs}</b></button>
  <button type="button" data-go="tasksPage">${ICON.tasks}<span>${tr('Tasks','المهام')}</span><b>${tr(s.pending+' pending',s.pending+' متبقية')}</b></button>
  <button type="button" data-go="goals">${ICON.goals}<span>${tr('Goals','الأهداف')}</span><b>${tr(s.goals+' in progress',s.goals+' قيد التقدم')}</b></button>
 </div>`;
}

/* ---------- Theme Studio (Settings › Appearance) ---------- */
let viewer=null;
function openArt(t){
 const dark=t.darkOnly||wantDark();
 if(!viewer){viewer=document.createElement('div');viewer.id='atViewer';viewer.innerHTML='<div class="at-viewer-box" role="dialog" aria-modal="true"><header><h3></h3><button type="button" class="at-close">×</button></header><img alt=""><p></p></div>';document.body.append(viewer);viewer.addEventListener('click',e=>{if(e.target===viewer||e.target.closest('.at-close'))viewer.hidden=true})}
 viewer.querySelector('h3').textContent=t.name[ar()?1:0];
 const img=viewer.querySelector('img');img.src='data:image/svg+xml,'+encodeURIComponent(AscendArt.render(t.scene,dark));img.alt=t.name[0]+' artwork';
 viewer.querySelector('p').textContent=tr('Full artwork · '+(dark?'dark':'light')+' version','الرسم كاملًا · النسخة '+(dark?'الداكنة':'الفاتحة'));
 viewer.querySelector('.at-close').setAttribute('aria-label',tr('Close','إغلاق'));viewer.hidden=false;viewer.querySelector('.at-close').focus();
}
window.ascendCloseArt=()=>{if(viewer&&!viewer.hidden){viewer.hidden=true;return true}return false};
function drawStudio(){
 const host=document.getElementById('ascendThemeStudio');if(!host||typeof data!=='object')return;
 const s=todayStats(),cur=current(),dark=wantDark();
 const card=t=>{const p=palette(t,t.darkOnly||dark),active=t.id===saved,pv=t.id===preview,lock=!unlocked(t);
  return`<article class="at-card${active?' is-active':''}${pv?' is-preview':''}" style="--c-bg:${p.bg};--c-surface:${p.surface};--c-ink:${p.ink};--c-muted:${p.muted};--c-accent:${p.accent};--c-track:${p.track};--c-art-ink:${p.artInk}">
   <div class="at-phone" data-art-id="${t.id}"><div class="at-mini-top"><b>${tr('Today','اليوم')}</b></div><div class="at-mini-ring">${ringSVG(s.pct,46,5).replace(/var\(--at-track\)/g,'var(--c-track)').replace(/var\(--at-accent\)/g,'var(--c-accent)')}<span>${s.pct}%</span></div>
    <div class="at-mini-rows"><i><span>${tr('Habits','العادات')}</span><span>${s.hd}/${s.hs}</span></i><i><span>${tr('Tasks','المهام')}</span><span>${s.pending}</span></i><i><span>${tr('Goals','الأهداف')}</span><span>${s.goals}</span></i></div></div>
   <h4>${t.n}. ${t.name[ar()?1:0]}</h4><span class="at-badge ${t.free?'free':'premium'}">${t.free?tr('FREE','مجانية'):tr('♛ Premium','♛ مميزة')}</span>
   <p>${t.desc[ar()?1:0]}${t.darkOnly?tr(' · Dark theme',' · سمة داكنة'):''}</p>
   <div class="at-sw" aria-hidden="true">${t.sw.map(c=>`<i style="background:${c}"></i>`).join('')}</div>
   <div class="at-actions">${active?`<button type="button" class="at-btn" disabled>✓ ${tr('In use','مستخدمة')}</button>`:lock?`<button type="button" class="at-btn" data-preview="${t.id}">${pv?tr('Previewing…','قيد المعاينة…'):tr('Preview','معاينة')}</button>`:`<button type="button" class="at-btn primary" data-use="${t.id}">${tr('Use theme','استخدام')}</button>`}<button type="button" class="at-btn ghost" data-art="${t.id}">${tr('Artwork','الرسم')}</button></div>
  </article>`};
 host.innerHTML=`<div class="at-studio-head"><div><h3>${tr('Theme Studio','استوديو السمات')}</h3><p class="muted">${tr('20 themes · 2 free + 18 premium','٢٠ سمة · ٢ مجانية + ١٨ مميزة')}</p></div>
  <div class="at-seg" role="group" aria-label="${tr('Appearance','المظهر')}"><button type="button" data-mode="light" aria-pressed="${!dark}">☀ ${tr('Light','فاتح')}</button><button type="button" data-mode="dark" aria-pressed="${dark}">☾ ${tr('Dark','داكن')}</button></div></div>
  <div class="at-accents"><span>${tr('Accent colour','لون التمييز')}${AscendPremium.isUnlocked()?'':' 🔒'}</span><div role="group" aria-label="${tr('Accent colour','لون التمييز')}"><button type="button" class="at-acc at-acc-default" data-accent="" aria-pressed="${!accentPref()}" title="${tr('Theme default','لون السمة')}">${tr('Auto','تلقائي')}</button>${ACCENTS.map(c=>`<button type="button" class="at-acc" data-accent="${c}" style="background:${c}" aria-label="${c}" aria-pressed="${accentPref()===c}"></button>`).join('')}</div></div>
  ${cur.darkOnly?`<p class="at-note">${tr(cur.name[0]+' is a dark theme, so it stays dark in both modes.',cur.name[1]+' سمة داكنة، لذلك تبقى داكنة في الوضعين.')}</p>`:''}
  <div class="at-grid">${T.map(card).join('')}</div>`;
 host.querySelectorAll('[data-art-id]').forEach(el=>{const t=byId[el.dataset.artId];el.style.backgroundImage=artURL(t,t.darkOnly||dark)});
 drawPremium();
}
const BENEFITS=[
 ['All 18 premium themes','جميع السمات المميزة الـ١٨','Every design in the Theme Studio, with its own artwork in light and dark.','كل تصاميم استوديو السمات، ولكل منها رسمه الخاص بالوضعين.'],
 ['Custom accent colour','لون تمييز مخصص','Pick your own button and highlight colour on any theme.','اختر لون الأزرار والتمييز بنفسك مع أي سمة.'],
 ['5 extra reminder sounds','٥ أصوات تذكير إضافية','Soft Bell, Marimba, Harp Rise, Sparkle and Singing Bowl.','جرس ناعم، ماريمبا، صعود القيثارة، بريق، والوعاء الغنائي.'],
 ['Insights Pro','إحصاءات متقدمة','30-day habit heatmaps, best streaks, daily trend and focus totals.','خرائط العادات لـ٣٠ يومًا، أفضل السلاسل، اتجاه يومي، ومجموع التركيز.'],
 ['Focus Pro','تركيز متقدم','Choose focus lengths from 15 to 90 minutes and your own breaks.','اختر مدة التركيز من ١٥ إلى ٩٠ دقيقة والاستراحة التي تناسبك.'],
 ['Daily motivation','تحفيز يومي','A new encouraging line on your Today screen every day, in English and Arabic.','عبارة مشجعة جديدة كل يوم في شاشة اليوم، بالعربية والإنجليزية.'],
 ['Journal export','تصدير المذكرات','Save all your journal entries as a text file you can keep or print.','احفظ جميع مذكراتك في ملف نصي للاحتفاظ به أو طباعته.'],
];
window.AscendBenefits=BENEFITS;
function drawPremium(){
 const host=document.getElementById('ascendPremiumPanel');if(!host)return;
 const on=AscendPremium.isUnlocked(),A=ar()?1:0;
 host.innerHTML=`<h2>♛ ${on?tr('Ascend Full','أسيند الكامل'):tr('Ascend Premium','أسيند المميز')}</h2>
 <p class="muted">${on?tr('Everything is unlocked in this edition.','كل الميزات مفتوحة في هذا الإصدار.'):tr('Included in Ascend Full · no subscription · no ads','متاح في أسيند الكامل · بدون اشتراك · بدون إعلانات')}</p>
 <ul class="at-benefits">${BENEFITS.map(b=>`<li class="${on?'on':'off'}"><b>${on?'✓':'🔒'} ${b[A]}</b><span>${b[2+A]}</span></li>`).join('')}</ul>
 ${on?'':`<p class="at-note">${tr('You can preview premium themes for '+PREVIEW_SECONDS+' seconds. The full features come with the Ascend Full app.','يمكنك معاينة السمات المميزة لمدة '+PREVIEW_SECONDS+' ثوانٍ. الميزات الكاملة تأتي مع تطبيق أسيند الكامل.')}</p>`}`;
}
function studioClicks(e){
 const ac=e.target.closest('[data-accent]');
 if(ac){if(!AscendPremium.isUnlocked()){toastMsg(tr('Custom accent colours are part of Ascend Full.','ألوان التمييز المخصصة متاحة في أسيند الكامل.'));return}
  if(ac.dataset.accent)localStorage.setItem('ascend-accent',ac.dataset.accent);else localStorage.removeItem('ascend-accent');apply();drawStudio();return}
 const u=e.target.closest('[data-use]'),pv=e.target.closest('[data-preview]'),a=e.target.closest('[data-art]'),m=e.target.closest('[data-mode]');
 if(u)choose(u.dataset.use);else if(pv)startPreview(pv.dataset.preview);else if(a)openArt(byId[a.dataset.art]);
 else if(m){const want=m.dataset.mode==='dark';if(want!==wantDark()&&typeof toggleTheme==='function')toggleTheme()}
}

/* ---------- Wire up ---------- */
function init(){
 const studio=document.getElementById('ascendThemeStudio');
 if(studio){studio.addEventListener('click',studioClicks);const panel=studio.closest('.panel');if(panel&&!document.getElementById('ascendPremiumPanel')){const pp=document.createElement('section');pp.id='ascendPremiumPanel';pp.className='panel';panel.after(pp)}}
 const art=document.createElement('div');art.id='atArt';art.setAttribute('aria-hidden','true');document.querySelector('.main')?.prepend(art);
 const base=window.render;window.render=function(){const r=base.apply(this,arguments);apply();drawHero();if(document.getElementById('settings')?.classList.contains('active'))drawStudio();return r};
 const basePage=window.page;window.page=function(p){basePage(p);document.body.dataset.page=document.querySelector('.section.active')?.id||'';if(p==='settings')drawStudio()};
 const baseLang=window.switchLanguage;window.switchLanguage=function(){baseLang();drawHero();drawStudio();drawBanner()};
 document.body.dataset.page='dashboard';apply();drawHero();drawStudio();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
