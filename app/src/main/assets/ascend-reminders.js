/* Ascend reminders made simple and verifiable:
   - "Remind me" inside the task form, using the task's own time;
   - a clear warning on Today whenever reminders cannot reach you, with a one-tap fix;
   - the exact list of reminders Android has scheduled, and a real "Test in 1 minute". */
(function(){'use strict';
const ar=()=>document.documentElement.lang==='ar';const tr=(en,a)=>ar()?a:en;
const $=id=>document.getElementById(id);
const N=()=>window.SteadyDayNative||null;
const toast=m=>window.ascendToast&&ascendToast(m);
const cfg=()=>window.ascendReminderCfg?ascendReminderCfg():{items:{}};
function status(){const n=N();if(!n||typeof n.status!=='function')return null;try{return JSON.parse(n.status()||'{}')}catch(e){return null}}
function ensurePermission(){const st=status();if(st&&!(st.permission&&st.notificationsEnabled))N().requestPermission()}
const fmt=ms=>new Date(ms).toLocaleString(ar()?'ar-SA':'en-US',{weekday:'short',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});
const hhmm=ms=>new Date(ms).toLocaleTimeString(ar()?'ar-SA':'en-US',{hour:'2-digit',minute:'2-digit'});

/* ---------- 1. "Remind me" in the task form ---------- */
let pending=null;
function addToForm(){
 if($('kind')?.value!=='task'||$('taskRemindBox'))return;
 const extra=$('extra');if(!extra)return;
 const id=$('editId').value,item=(cfg().items||{})[id]||{},task=(data.tasks||[]).find(t=>String(t.id)===String(id));
 const box=document.createElement('div');box.id='taskRemindBox';box.className='ascend-remind-box';
 box.innerHTML=`<label class="ascend-remind-toggle"><input type="checkbox" id="taskRemind"> 🔔 <span>${tr('Remind me','ذكّرني')}</span></label><label class="ascend-remind-time"><span>${tr('at','في')}</span><input type="time" id="taskRemindTime" class="field"></label><p class="reminder-note" id="taskRemindNote"></p>`;
 extra.append(box);
 const on=$('taskRemind'),time=$('taskRemindTime'),taskTime=$('taskTime');
 on.checked=!!item.enabled;time.value=item.time||task?.time||taskTime?.value||cfg().time||'09:00';
 let touched=!!item.time;time.addEventListener('input',()=>{touched=true;note()});
 taskTime?.addEventListener('input',()=>{if(!touched&&taskTime.value)time.value=taskTime.value;note()});
 $('taskDate')?.addEventListener('input',note);on.addEventListener('change',note);
 function note(){const n=$('taskRemindNote');if(!n)return;const d=$('taskDate')?.value;let msg='';
  if(on.checked){if(d){const when=new Date(d+'T'+time.value+':00');msg=when<=new Date()?tr('This time has already passed, so no reminder will be sent.','هذا الوقت مضى، لذلك لن يُرسل تذكير.'):tr('One reminder on ','تذكير واحد في ')+fmt(when.getTime())}else msg=tr('No date: you will be reminded every day at this time until the task is done.','بدون تاريخ: ستُذكَّر يوميًا في هذا الوقت حتى تُنجز المهمة.')}
  n.textContent=msg}
 note();
}
/* Task form shows one language at a time (older labels mixed English and Arabic). */
function localizeForm(){
 const ex=$('extra');if(!ex)return;
 const map={'Emoji / الرمز':['Emoji','الرمز التعبيري'],'Date / التاريخ':['Date','التاريخ'],'Time (optional) / الوقت':['Time (optional)','الوقت (اختياري)']};
 ex.querySelectorAll('label').forEach(l=>{const k=(l._ascOrig=l._ascOrig||l.textContent.trim());if(map[k])l.textContent=tr(map[k][0],map[k][1])});
 const pr=$('priority');if(pr)[...pr.options].forEach(o=>{const v=o.value||o.textContent;o.value=v;o.textContent=tr(v,{Normal:'عادية',High:'عالية',Low:'منخفضة'}[v]||v)});
 const n=$('name');if(n)n.placeholder=$('kind')?.value==='task'?tr('e.g. Dentist appointment','مثال: موعد طبيب الأسنان'):$('kind')?.value==='goal'?tr('e.g. Read 12 books','مثال: قراءة ١٢ كتابًا'):tr('e.g. Read for 15 minutes','مثال: القراءة ١٥ دقيقة');
 const em=$('taskEmoji');if(em)em.placeholder=tr('Optional emoji','رمز اختياري');
}
function captureSubmit(){
 if($('kind')?.value!=='task'||!$('taskRemind'))return;
 pending={editId:$('editId').value,before:(data.tasks||[]).length,on:$('taskRemind').checked,time:$('taskRemindTime').value};
 setTimeout(applyPending,0);
}
function applyPending(){
 const p=pending;pending=null;if(!p||!window.ascendSetReminderItem)return;
 let t=null;if(p.editId)t=data.tasks.find(x=>String(x.id)===String(p.editId));else if(data.tasks.length>p.before)t=data.tasks[data.tasks.length-1];
 if(!t)return;
 if(p.on&&/^\d{2}:\d{2}$/.test(p.time)){ascendSetReminderItem(String(t.id),{enabled:true,time:p.time});ensurePermission();
  if(cfg().mode==='inapp')toast(tr('Reminder saved, but your style is In-app only. Tap the banner on Today to hear it.','تم حفظ التذكير، لكن الطريقة «داخل التطبيق فقط». اضغط الشريط في الشاشة الرئيسية لتسمعه.'));
  else toast(tr('Reminder set for ','تم ضبط التذكير الساعة ')+p.time)}
 else if((cfg().items||{})[t.id]?.enabled)ascendSetReminderItem(String(t.id),{enabled:false});
 drawBanner();setTimeout(drawUpcoming,900);
}

/* ---------- 2. Today warning when reminders cannot reach the user ---------- */
function problem(){
 const c=cfg();const any=c.enabled&&Object.values(c.items||{}).some(i=>i&&i.enabled);if(!any)return null;
 if(c.mode==='inapp')return{text:tr('Your reminders are set to “In-app only”, so Android will not notify you when Ascend is closed.','تذكيراتك مضبوطة على «داخل التطبيق فقط»، لذلك لن يصلك إشعار عندما يكون أسيند مغلقًا.'),btn:tr('Use sound + vibration','استخدم الصوت والاهتزاز'),fix:()=>{ascendSetReminder('mode','both');if(typeof render==='function')render();ensurePermission();toast(tr('Reminders will now ring and vibrate.','ستصدر التذكيرات صوتًا واهتزازًا الآن.'))}};
 const st=status();if(!st)return null;
 if(!(st.permission&&st.notificationsEnabled&&!st.channelBlocked))return{text:tr('Android is blocking Ascend’s notifications, so reminders cannot appear.','أندرويد يمنع إشعارات أسيند، لذلك لن تظهر التذكيرات.'),btn:tr('Allow notifications','السماح بالإشعارات'),fix:()=>{st.permission?N().openNotificationSettings():N().requestPermission()}};
 if(!st.exactAlarms)return{text:tr('Reminders may arrive a few minutes late because “Alarms & reminders” is off for Ascend.','قد تتأخر التذكيرات بضع دقائق لأن «المنبهات والتذكيرات» متوقف لأسيند.'),btn:tr('Turn it on','تفعيله'),fix:()=>N().openExactAlarmSettings()};
 return null;
}
function drawBanner(){
 const dash=$('dashboard');if(!dash)return;let b=$('ascendReminderAlert');const p=problem();
 if(!p){if(b)b.remove();return}
 if(!b){b=document.createElement('section');b.id='ascendReminderAlert';b.setAttribute('role','alert');const anchor=$('atHero');if(anchor)anchor.before(b);else dash.prepend(b)}
 b.replaceChildren();const t=document.createElement('p');t.textContent='🔔 '+p.text;const btn=document.createElement('button');btn.type='button';btn.className='btn';btn.textContent=p.btn;btn.onclick=()=>{p.fix();setTimeout(drawBanner,300)};b.append(t,btn);
}

/* ---------- 3. What Android has scheduled + a real test ---------- */
function drawUpcoming(){
 const panel=$('reminderSettings');if(!panel)return;let box=$('ascendUpcoming');
 if(!box){box=document.createElement('div');box.id='ascendUpcoming';const status=$('ascend61ReminderStatus');if(status)status.after(box);else panel.append(box)}
 box.replaceChildren();const h=document.createElement('h3');h.textContent=tr('Scheduled on this device','المجدول على هذا الجهاز');box.append(h);
 const n=N();
 if(!n||typeof n.scheduled!=='function'){const p=document.createElement('p');p.className='reminder-note';p.textContent=tr('Available in the Android app.','متاح في تطبيق أندرويد.');box.append(p);return}
 let list=[];try{list=JSON.parse(n.scheduled()||'[]')}catch(e){}
 list.sort((a,b)=>a.when-b.when);
 const ul=document.createElement('ul');ul.className='ascend-upcoming';
 if(!list.length){const li=document.createElement('li');li.textContent=cfg().mode==='inapp'?tr('Nothing is scheduled with Android because the style is “In-app only”.','لا شيء مجدول مع أندرويد لأن الطريقة «داخل التطبيق فقط».'):tr('Nothing scheduled. Add “Remind me” to a task, or turn on a reminder below.','لا شيء مجدول. فعّل «ذكّرني» في مهمة، أو شغّل تذكيرًا أدناه.');ul.append(li)}
 list.slice(0,12).forEach(r=>{const li=document.createElement('li');const b=document.createElement('b');b.textContent=fmt(r.when);const s=document.createElement('span');s.textContent=(r.habit?tr('Habit · ','عادة · '):tr('Task · ','مهمة · '))+r.name+(r.exact?'':tr(' · may be late',' · قد يتأخر'));li.append(b,s);ul.append(li)});
 box.append(ul);
 const test=document.createElement('button');test.type='button';test.className='btn';test.id='ascendTestMinute';test.textContent=tr('⏱ Test in 1 minute','⏱ اختبار بعد دقيقة');
 const res=document.createElement('p');res.className='reminder-note';res.id='ascendTestResult';
 test.onclick=()=>{if(cfg().mode==='inapp'){res.textContent=tr('Choose a sound or vibration style first; “In-app only” never shows Android notifications.','اختر طريقة الصوت أو الاهتزاز أولًا؛ «داخل التطبيق فقط» لا يُظهر إشعارات أندرويد.');return}
  const when=Number(n.testScheduled(document.documentElement.lang))||0;
  res.textContent=when?tr(`A test notification will arrive at exactly ${hhmm(when)}. You can close Ascend now to check it works when the app is closed.`,`سيصل إشعار تجريبي عند ${hhmm(when)} تمامًا. يمكنك إغلاق أسيند الآن للتأكد من وصوله والتطبيق مغلق.`):tr('Notifications are blocked. Allow them, then try again.','الإشعارات محظورة. اسمح بها ثم حاول مرة أخرى.')};
 box.append(test,res);
}

/* ---------- Wire up ---------- */
function init(){
 const o=window.openModal;window.openModal=function(k,id){o(k,id);localizeForm();if(k==='task')addToForm()};
 $('editor')?.addEventListener('submit',captureSubmit,true);
 const r=window.render;window.render=function(){const x=r.apply(this,arguments);drawBanner();return x};
 const ev=window.ascendNativeEvent;window.ascendNativeEvent=function(t,v){if(ev)ev(t,v);if(t==='permission'||t==='resume'){drawBanner();drawUpcoming()}};
 document.addEventListener('change',e=>{if(e.target.closest&&e.target.closest('#reminderSettings')){if((e.target.id==='rEnabled'||e.target.matches('[data-reminder-toggle]'))&&e.target.checked)ensurePermission();setTimeout(()=>{drawBanner();drawUpcoming()},700)}});
 const rs=$('reminderSettings');if(rs)new MutationObserver(()=>{if(!$('ascendUpcoming'))drawUpcoming()}).observe(rs,{childList:true});
 drawBanner();drawUpcoming();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
