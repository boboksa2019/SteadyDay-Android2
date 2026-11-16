/* Ascend premium features (Ascend Premium on Google Play; always on in the Full edition). Everything is calculated from the
   user's own data on the device; nothing here is sample or placeholder data. */
(function(){'use strict';
const ar=()=>document.documentElement.lang==='ar';const tr=(en,a)=>ar()?a:en;
const full=()=>window.AscendPremium&&AscendPremium.isUnlocked();
const $=id=>document.getElementById(id);
const toast=m=>window.ascendToast&&ascendToast(m);
const locked=what=>toast(tr(what+' is part of Ascend Premium.',what+' متاح في أسيند المميز.'));
const iso=d=>[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
const day=(n,base)=>{const d=base?new Date(base):new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()+n);return d};
const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n};

/* ---------- 1. Reminder sounds ---------- */
const SOUNDS=[['chime','Ascend Chime','نغمة أسيند',1],['default','Phone default','نغمة الهاتف',1],['bell','Soft Bell','جرس ناعم',0],['marimba','Marimba','ماريمبا',0],['harp','Harp Rise','صعود القيثارة',0],['sparkle','Sparkle','بريق',0],['bowl','Singing Bowl','الوعاء الغنائي',0]];
function soundRow(){
 const panel=$('reminderSettings');if(!panel||$('ascendSoundRow'))return;
 const cfg=window.ascendReminderCfg?ascendReminderCfg():{};const cur=SOUNDS.some(s=>s[0]===cfg.sound)?cfg.sound:'chime';
 const row=el('div','ascend-sound-row');row.id='ascendSoundRow';
 const lab=el('label',null,tr('Reminder sound','صوت التذكير'));lab.htmlFor='ascendSound';
 const sel=el('select');sel.id='ascendSound';
 SOUNDS.forEach(([id,en,a,free])=>{const o=el('option',null,(ar()?a:en)+(free||full()?'':' 🔒'));o.value=id;sel.append(o)});sel.value=cur;
 const play=el('button','btn secondary',tr('▶ Play','▶ تشغيل'));play.type='button';
 const note=el('p','reminder-note',tr('Used for Sound and Sound + vibration. Android keeps each sound in its own notification category.','يُستخدم مع الصوت أو الصوت والاهتزاز. يحفظ أندرويد كل صوت في فئة إشعارات خاصة.'));
 sel.onchange=()=>{const s=SOUNDS.find(x=>x[0]===sel.value);if(!s[3]&&!full()){locked(tr('This sound','هذا الصوت'));sel.value=cur;return}if(window.ascendSetReminder)ascendSetReminder('sound',sel.value);if(window.SteadyDayNative&&SteadyDayNative.previewSound)SteadyDayNative.previewSound(sel.value)};
 play.onclick=()=>{if(window.SteadyDayNative&&SteadyDayNative.previewSound)SteadyDayNative.previewSound(sel.value);else toast(tr('Sound preview works in the Android app.','معاينة الصوت تعمل في تطبيق أندرويد.'))};
 const line=el('div','ascend-sound-line');line.append(sel,play);row.append(lab,line,note);
 const grid=panel.querySelector('.reminder-grid');(grid||panel).after(row);
}

/* ---------- 2. Focus Pro: custom lengths ---------- */
const FOCUS=[15,20,25,30,45,50,60,90],BREAK=[5,10,15,20,30];
window.ascendFocusLengths=()=>{let v={focus:25,brk:5};if(full()){try{const s=JSON.parse(localStorage.getItem('ascend-focus-lengths')||'{}');if(FOCUS.includes(s.focus))v.focus=s.focus;if(BREAK.includes(s.brk))v.brk=s.brk}catch(e){}}return v};
window.ascendWeekFocusMinutes=()=>{const since=day(-6);since.setHours(0,0,0,0);return(Array.isArray(data.focusHistory)?data.focusHistory:[]).filter(e=>Date.parse(e.at)>=since.getTime()).reduce((n,e)=>n+(Number(e.minutes)||25),0)};
function focusRow(){
 const root=$('ascend45Focus');if(!root||$('ascendFocusLen'))return;
 const L=ascendFocusLengths();const row=el('div','ascend-focus-len');row.id='ascendFocusLen';
 const mk=(id,label,list,val,unit)=>{const w=el('label');w.append(el('span',null,label));const s=el('select');s.id=id;list.forEach(m=>{const o=el('option',null,m+' '+unit);o.value=m;s.append(o)});s.value=val;s.disabled=!full();w.append(s);return[w,s]};
 const [a,fs]=mk('ascendFocusMin',tr('Focus','التركيز'),FOCUS,L.focus,tr('min','د'));const [b,bs]=mk('ascendBreakMin',tr('Break','الاستراحة'),BREAK,L.brk,tr('min','د'));
 row.append(a,b);if(!full()){const lk=el('button','ascend-lock',tr('🔒 Custom lengths: Ascend Premium','🔒 مدد مخصصة: أسيند المميز'));lk.type='button';lk.onclick=()=>locked(tr('Focus Pro','التركيز المتقدم'));row.append(lk)}
 const save=()=>{localStorage.setItem('ascend-focus-lengths',JSON.stringify({focus:+fs.value,brk:+bs.value}));const start=$('ascend45Start');if(start&&!/Pause|إيقاف/.test(start.textContent))$('ascend45Reset')?.click()};
 fs.onchange=save;bs.onchange=save;
 const clock=$('ascend45Clock');(clock?clock.previousElementSibling:root.firstChild).before(row);
}

/* ---------- 3. Insights Pro ---------- */
function streaks(h){let best=0,cur=0,run=0;const logs=Object.keys(h.log||{}).filter(k=>h.log[k]).sort();if(!logs.length)return{best:0,cur:0};
 const start=new Date(logs[0]+'T12:00:00'),today=day(0);for(let d=new Date(start);d<=today;d.setDate(d.getDate()+1)){if(!h.days.includes(d.getDay()))continue;if(h.log[iso(d)]){run++;best=Math.max(best,run)}else if(iso(d)!==iso(today))run=0}cur=run;return{best,cur}}
function insightsPro(){
 const host=$('progress');if(!host||typeof data!=='object')return;let box=$('ascendInsightsPro');
 if(!box){box=el('section','panel');box.id='ascendInsightsPro';(($('progress-insights'))||host).after(box)}
 box.replaceChildren();const head=el('div','ascend-pro-head');head.append(el('h2',null,tr('Insights Pro','إحصاءات متقدمة')),el('span','ascend-pro-badge',full()?'♛':'🔒'));box.append(head);
 if(!full()){box.append(el('p','muted',tr('30-day habit heatmaps, best streaks, a daily completion trend, your most productive weekday and focus totals — calculated from your own data. Included in Ascend Premium.','خرائط العادات لـ٣٠ يومًا، أفضل السلاسل، اتجاه الإنجاز اليومي، أكثر أيامك إنتاجًا ومجموع التركيز — من بياناتك أنت. متاح في أسيند المميز.')));return}
 const days=Array.from({length:30},(_,i)=>day(i-29));const tasks=(data.tasks||[]).filter(t=>!t.cancelled),habits=data.habits||[];
 // daily completion trend
 const pct=days.map(d=>{const k=iso(d),hs=habits.filter(h=>h.days.includes(d.getDay())),ts=tasks.filter(t=>t.date===k);const tot=hs.length+ts.length;return tot?Math.round((hs.filter(h=>h.log&&h.log[k]).length+ts.filter(t=>t.done).length)/tot*100):null});
 const valid=pct.filter(v=>v!==null),avg=valid.length?Math.round(valid.reduce((a,b)=>a+b,0)/valid.length):0;
 const doneTasks=tasks.filter(t=>t.done&&t.date&&t.date>=iso(days[0])&&t.date<=iso(days[29])).length;
 const focus=(Array.isArray(data.focusHistory)?data.focusHistory:[]).filter(e=>Date.parse(e.at)>=days[0].getTime()-432e5);
 const wk=[0,0,0,0,0,0,0];tasks.filter(t=>t.done&&t.date&&t.date>=iso(day(-89))).forEach(t=>wk[new Date(t.date+'T12:00:00').getDay()]++);
 const bestDay=Math.max(...wk)>0?new Date(2026,0,4+wk.indexOf(Math.max(...wk))).toLocaleDateString(ar()?'ar-SA':'en-US',{weekday:'long'}):tr('Not enough data yet','لا توجد بيانات كافية بعد');
 const stats=el('div','ascend-pro-stats');[[avg+'%',tr('30-day average','متوسط ٣٠ يومًا')],[String(doneTasks),tr('Tasks done (30 days)','مهام منجزة (٣٠ يومًا)')],[String(focus.reduce((n,e)=>n+(Number(e.minutes)||25),0)),tr('Focus minutes (30 days)','دقائق التركيز (٣٠ يومًا)')],[bestDay,tr('Most productive day','أكثر الأيام إنتاجًا')]].forEach(([v,l])=>{const c=el('div');c.append(el('strong',null,v),el('span',null,l));stats.append(c)});box.append(stats);
 box.append(el('h3',null,tr('Daily completion · last 30 days','الإنجاز اليومي · آخر ٣٠ يومًا')));
 const chart=el('div','ascend-pro-trend');chart.setAttribute('role','img');chart.setAttribute('aria-label',tr('Daily completion over the last 30 days, average ','الإنجاز اليومي خلال ٣٠ يومًا، المتوسط ')+avg+'%');
 pct.forEach((v,i)=>{const b=el('i');b.style.height=(v===null?2:Math.max(4,v))+'%';if(v===null)b.className='none';b.title=iso(days[i])+': '+(v===null?tr('nothing scheduled','لا شيء مجدول'):v+'%');chart.append(b)});box.append(chart);
 box.append(el('h3',null,tr('Habit heatmap & streaks','خريطة العادات والسلاسل')));
 if(!habits.length)box.append(el('p','muted',tr('Add a habit to see its heatmap.','أضف عادة لرؤية خريطتها.')));
 habits.forEach(h=>{const s=streaks(h);const r=el('div','ascend-heat-row');const t=el('div','ascend-heat-head');t.append(el('strong',null,h.name),el('span',null,tr(`current ${s.cur} · best ${s.best}`,`الحالية ${s.cur} · الأفضل ${s.best}`)));r.append(t);
  const g=el('div','ascend-heat');days.forEach(d=>{const k=iso(d),sch=h.days.includes(d.getDay()),ok=sch&&h.log&&h.log[k];const c=el('i',!sch?'rest':ok?'done':'miss');c.title=k+' · '+(!sch?tr('not scheduled','غير مجدول'):ok?tr('done','تم'):tr('missed','لم يتم'));g.append(c)});r.append(g);box.append(r)});
 const legend=el('p','ascend-heat-legend');legend.innerHTML=`<i class="done"></i>${tr('done','تم')} <i class="miss"></i>${tr('missed','لم يتم')} <i class="rest"></i>${tr('not scheduled','غير مجدول')}`;box.append(legend);
}

/* ---------- 4. Daily motivation (original lines) ---------- */
const LINES=[['Small steps still climb mountains.','الخطوات الصغيرة تصعد الجبال أيضًا.'],['Do the next right thing, then the next.','افعل الصواب التالي، ثم الذي يليه.'],['Progress loves consistency more than intensity.','التقدم يحب الاستمرار أكثر من الحماس.'],['Today counts, even if it is imperfect.','اليوم مهم، حتى لو لم يكن مثاليًا.'],['Start with five minutes. Momentum does the rest.','ابدأ بخمس دقائق، والزخم يكمل الباقي.'],['Your future self is built by today’s habits.','عاداتك اليوم تبني نسختك القادمة.'],['Focus on one thing and do it well.','ركّز على أمر واحد وأتقنه.'],['Rest is part of the plan, not a break from it.','الراحة جزء من الخطة، لا خروج عنها.'],['A clear list makes a calm mind.','القائمة الواضحة تصنع ذهنًا هادئًا.'],['Show up, even quietly.','احضر، ولو بهدوء.'],['Finish what matters before what is urgent.','أنجز المهم قبل العاجل.'],['Every checkmark is a promise kept to yourself.','كل علامة إنجاز وعد أوفيت به لنفسك.'],['You don’t need more time, just a clearer first step.','لا تحتاج وقتًا أكثر، بل خطوة أولى أوضح.'],['Gentle and steady beats rushed and scattered.','الهدوء والثبات يتفوقان على العجلة والتشتت.'],['Make it easy to begin.','اجعل البداية سهلة.'],['Celebrate the small wins today.','احتفل بانتصاراتك الصغيرة اليوم.'],['One focused hour can change your whole day.','ساعة تركيز واحدة قد تغيّر يومك كله.'],['Plan the day, then let it breathe.','خطّط ليومك، ثم امنحه مساحة.'],['Discipline is remembering what you want most.','الانضباط أن تتذكر ما تريده أكثر.'],['A missed day is a pause, not the end.','اليوم الضائع توقف مؤقت، لا نهاية.'],['Write it down, and your mind can rest.','اكتبه، ودع عقلك يرتاح.'],['Choose three things. Do them well.','اختر ثلاثة أمور، وأنجزها جيدًا.'],['Your pace is still progress.','وتيرتك الخاصة تقدّم أيضًا.'],['Begin where you are, with what you have.','ابدأ من حيث أنت، بما لديك.'],['Clarity first, speed later.','الوضوح أولًا، والسرعة لاحقًا.'],['Good habits are kind to your future.','العادات الجيدة لطفٌ بمستقبلك.'],['Do less, but finish more.','افعل أقل، وأنجز أكثر.'],['A calm morning starts the night before.','الصباح الهادئ يبدأ من الليلة السابقة.'],['Trust the process you are building.','ثق بالمسار الذي تبنيه.'],['Keep the promise small enough to keep.','اجعل وعدك صغيرًا بما يكفي للوفاء به.'],['Today is a good day to try again.','اليوم يوم جيد لتحاول من جديد.'],['Make room for what matters most.','افسح المجال لما يهمك أكثر.'],['Steady effort, quiet confidence.','جهد ثابت، وثقة هادئة.'],['The best plan is the one you start.','أفضل خطة هي التي تبدأ بها.'],['Notice how far you’ve already come.','لاحظ كم قطعت من الطريق.'],['Turn intentions into one small action.','حوّل نيتك إلى خطوة صغيرة.'],['Your effort today is never wasted.','جهدك اليوم لا يضيع أبدًا.'],['Protect your focus like your time.','احمِ تركيزك كما تحمي وقتك.'],['Ascend one step at a time.','ارتقِ خطوة بعد خطوة.'],['Finish the day kindly, then begin again tomorrow.','اختم يومك بلطف، وابدأ غدًا من جديد.']];
function motivation(){
 const dash=$('dashboard');if(!dash)return;let c=$('ascendMotivation');
 if(!full()){if(c)c.remove();return}
 if(!c){c=el('section','ascend-motivation');c.id='ascendMotivation';const hero=$('atHero');if(hero)hero.after(c);else dash.prepend(c)}
 const n=Math.floor((day(0)-new Date(2026,0,1,12))/864e5);const L=LINES[((n%LINES.length)+LINES.length)%LINES.length];
 c.replaceChildren(el('span','ascend-mot-label',tr('Today’s motivation','تحفيز اليوم')),el('p',null,ar()?L[1]:L[0]));
}
window.AscendMotivationLines=LINES;

/* ---------- 5. Journal export ---------- */
function journalButton(){
 const tools=$('ascend57Tools');if(!tools||$('ascendJournalExport'))return;
 const b=el('button','btn secondary',tr('Export journal (.txt)','تصدير المذكرات (.txt)')+(full()?'':' 🔒'));b.id='ascendJournalExport';b.type='button';
 b.onclick=()=>{if(!full()){locked(tr('Journal export','تصدير المذكرات'));return}
  const entries=Object.entries(data.journal||{}).filter(([,v])=>String(v).trim()).sort(([a],[b])=>a.localeCompare(b));
  if(!entries.length){toast(tr('Your journal is empty.','مذكراتك فارغة.'));return}
  const text='﻿'+tr('Ascend journal','مذكرات أسيند')+'\r\n'+tr('Exported ','تاريخ التصدير ')+(typeof today==='function'?today():iso(new Date()))+'\r\n\r\n'+entries.map(([d,v])=>{let h='';try{h=new Intl.DateTimeFormat(ar()?'ar-SA-u-ca-islamic-umalqura':'en-US-u-ca-islamic-umalqura',{day:'numeric',month:'long',year:'numeric'}).format(new Date(d+'T12:00:00'))}catch(e){}return'=== '+d+(h?' · '+h:'')+' ===\r\n'+String(v).replace(/\r?\n/g,'\r\n')}).join('\r\n\r\n')+'\r\n';
  ascendSaveFile('Ascend-journal-'+(typeof today==='function'?today():iso(new Date()))+'.txt','text/plain',text)};
 const anchor=$('ascend59CalendarHelp')||$('ascend59CalendarExport');(anchor||tools.lastChild).after(b);
}

/* ---------- Wire up ---------- */
function refresh(){soundRow();focusRow();motivation();journalButton();if($('progress')?.classList.contains('active'))insightsPro()}
function init(){
 const r=window.render;window.render=function(){const o=r.apply(this,arguments);refresh();return o};
 const p=window.page;window.page=function(x){p(x);if($('progress')?.classList.contains('active'))insightsPro()};
 const s=window.switchLanguage;window.switchLanguage=function(){s();['ascendSoundRow','ascendFocusLen','ascendJournalExport'].forEach(id=>$(id)?.remove());refresh();insightsPro()};
 const rs=$('reminderSettings');if(rs)new MutationObserver(()=>{if(!$('ascendSoundRow'))soundRow()}).observe(rs,{childList:true});
 refresh();insightsPro();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
