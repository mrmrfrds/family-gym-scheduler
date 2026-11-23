/* FORM — mobile-first multipage home gym planner. No build tools required.
   Google Sheets is the persistent store; connection is preconfigured in config.js. */
(() => {
  'use strict';

  const STARTERS = [
    {id:'amir',name:'Amir',height:170,weight:54,startWeight:54,goal:'muscle',calories:2500,protein:110,water:2.5},
    {id:'nabilah',name:'Nabilah',height:154,weight:86,startWeight:86,goal:'fatloss',calories:1700,protein:115,water:2.3},
    {id:'hana',name:'Hana',height:165,weight:68,startWeight:68,goal:'fatloss',calories:1750,protein:105,water:2.2}
  ];
  const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  const DAY_SHORT = ['MON','TUE','WED','THU','FRI','SAT','SUN'];
  const GOALS = {
    muscle: {title:'Strength & muscle',tagline:'Build a stronger, fuller physique with progressive resistance training.',bias:'A gentle calorie surplus and steady strength progress.'},
    fatloss: {title:'Lean & strong',tagline:'Grow glutes and shoulders, strengthen your back, and gradually lose fat.',bias:'A manageable calorie deficit while maintaining strength.'}
  };
  // Format: [name, sets, reps, equipment / coaching cue]
  const E = (name,sets,reps,cue) => ({name,sets,reps,cue});
  const S = (title,focus,type,minutes,exercises=[]) => ({title,focus,type,minutes,exercises});
  const MUSCLE_WEEK = [
    S('Upper body A','Chest · Back · Shoulders','strength',45,[E('Push-up board push-ups',3,'8–12','Use the chest-position handles; elevate hands if needed'),E('Dumbbell bench press',3,'8–12','Controlled descent, shoulder blades supported'),E('One-arm dumbbell row',3,'10 each','Support one hand on the bench'),E('Dumbbell shoulder press',3,'8–10','Keep ribs down'),E('Resistance-band face pull',2,'12–15','Pull to eye level')]),
    S('Lower body A','Legs · Glutes','strength',45,[E('Dumbbell goblet squat',3,'8–12','Hold one dumbbell at your chest'),E('Dumbbell Romanian deadlift',3,'8–12','Hinge hips back, flat back'),E('Bench leg extension',3,'12–15','Only if machine attachment is secure'),E('Reverse dumbbell lunge',2,'10 each','Start light for balance'),E('Standing calf raise',3,'15','Pause at the top')]),
    S('Active recovery','Mobility · Easy steps','recovery',25,[E('Brisk walk',1,'20 min','Comfortable conversation pace'),E('Band shoulder mobility',2,'10','Gentle, pain-free movement'),E('Hip mobility',1,'5 min','No forced stretches')]),
    S('Upper body B','Back · Chest · Arms','strength',45,[E('Pull-up or band-assisted pull-up',3,'4–8','Use assistance or slow negatives'),E('Dip on stable rack',3,'6–10','Only if rack is rated for dips and shoulders feel good'),E('Dumbbell chest press',3,'8–12','Use bench or floor'),E('Dumbbell lateral raise',3,'12–15','Light weights, no swinging'),E('Dumbbell hammer curl',2,'10–12','Elbows stay near ribs')]),
    S('Rest day','Eat well · Recover','rest',0,[]),
    S('Lower body B + core','Legs · Abs','strength',40,[E('Bulgarian split squat',3,'8 each','Rear foot on a stable bench'),E('Dumbbell Romanian deadlift',3,'10','Control the lowering'),E('Bench leg extension',3,'12','Skip if attachment is unstable'),E('Glute bridge with dumbbell',3,'12–15','Pad hips if needed'),E('Forearm plank',3,'30–45 sec','Brace without holding breath')]),
    S('Rest & reset','Hydrate · Sleep','rest',0,[])
  ];
  const FAT_WEEK = [
    S('Glutes & legs A','Glutes · Quads','strength',40,[E('Goblet squat',3,'8–12','Use a comfortable weight'),E('Dumbbell glute bridge',3,'12','Squeeze glutes at top'),E('Bench leg extension',2,'12–15','Skip if attachment is unstable'),E('Low step-up',2,'10 each','Use a very stable low step'),E('Band lateral walk',2,'12 each','Small controlled steps')]),
    S('Walk & mobility','Low-impact cardio','recovery',30,[E('Brisk walk',1,'20–30 min','Can be split into shorter walks'),E('Gentle hip and shoulder stretches',1,'5 min','Move without pain')]),
    S('Back & shoulders','Upper-body shape · Posture','strength',40,[E('One-arm dumbbell row',3,'10 each','Support yourself on the bench'),E('Dumbbell shoulder press',3,'8–10','Choose manageable weight'),E('Band pull-apart',3,'12–15','Keep shoulders down'),E('Incline push-up',2,'8–12','Hands on secure raised surface'),E('Dumbbell lateral raise',2,'12–15','Use light weight')]),
    S('Easy movement','Walk · Stretch','recovery',25,[E('Comfortable walk',1,'20 min','Recover from yesterday'),E('Resistance-band mobility',1,'5 min','Gentle range of motion')]),
    S('Glutes & legs B','Glutes · Hamstrings','strength',40,[E('Dumbbell Romanian deadlift',3,'10','Hinge at hips'),E('Dumbbell reverse lunge',2,'8 each','Hold on to support if needed'),E('Dumbbell hip thrust on bench',3,'10–12','Use a stable bench'),E('Band glute kickback',2,'12 each','Avoid arching lower back'),E('Dead bug',2,'10 each','Slow and controlled')]),
    S('Full body + core','Strength · Stability','strength',35,[E('Goblet squat',2,'10','Moderate effort'),E('Dumbbell bench press',2,'10','Controlled tempo'),E('One-arm dumbbell row',2,'10 each','Stable bench support'),E('Farmer carry with dumbbells',3,'30 sec','Walk tall in a clear space'),E('Side plank',2,'20 sec/side','Knees down if easier')]),
    S('Rest & recharge','Sleep · Hydration','rest',0,[])
  ];
  const FAT_HANA_WEEK = [FAT_WEEK[0],FAT_WEEK[2],FAT_WEEK[1],FAT_WEEK[4],FAT_WEEK[3],FAT_WEEK[5],FAT_WEEK[6]];

  // Meals are simple illustrative portions; calories vary by brand, oil and cooking method.
  const MEALS = {
    muscle: [
      {key:'breakfast',time:'7:30 AM',label:'Breakfast',name:'Eggs, toast & banana',detail:'2 eggs · 3 slices wholemeal bread · 1 tbsp peanut butter · 1 banana',kcal:580},
      {key:'snack1',time:'10:30 AM',label:'Morning snack',name:'Milk & fruit',detail:'250 mL milk · 1 medium banana',kcal:255},
      {key:'lunch',time:'1:00 PM',label:'Lunch',name:'Chicken rice bowl',detail:'180 g cooked chicken · 250 g cooked rice · vegetables · 1 tsp oil',kcal:725},
      {key:'snack2',time:'4:30 PM',label:'Afternoon snack',name:'Peanut butter toast',detail:'2 slices wholemeal bread · 2 tbsp peanut butter',kcal:350},
      {key:'dinner',time:'7:30 PM',label:'Dinner',name:'Chicken, rice & greens',detail:'160 g cooked chicken · 200 g cooked rice · vegetables · 1 tsp oil',kcal:630}
    ],
    fatloss: [
      {key:'breakfast',time:'7:30 AM',label:'Breakfast',name:'Eggs, toast & fruit',detail:'2 eggs · 2 slices wholemeal bread · 1 apple',kcal:395},
      {key:'snack1',time:'10:30 AM',label:'Morning snack',name:'Fruit break',detail:'1 medium banana or similar-sized fruit',kcal:105},
      {key:'lunch',time:'1:00 PM',label:'Lunch',name:'Chicken, rice & vegetables',detail:'150 g cooked chicken · 150 g cooked rice · vegetables · 1 tsp oil',kcal:550},
      {key:'snack2',time:'4:30 PM',label:'Afternoon snack',name:'Yogurt & peanut butter',detail:'170 g plain yogurt · 1 tbsp peanut butter',kcal:195},
      {key:'dinner',time:'7:00 PM',label:'Dinner',name:'Lean chicken dinner',detail:'140 g cooked chicken · 120 g cooked rice · generous vegetables',kcal:450}
    ]
  };

  // Color theme lives in this browser only; Sheets remains the only workout data store.
  const updateThemeControl = () => {
    const toggle = document.querySelector('.theme-toggle');
    if (!toggle) return;
    const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
    const label = `Switch to ${next} mode`;
    toggle.setAttribute('aria-label',label);
    toggle.title = label;
  };
  const setTheme = (theme, persist = true) => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content',theme === 'light' ? '#f5f7f2' : '#0d1115');
    if (persist) {
      try { localStorage.setItem('form_theme',theme); } catch (e) { /* Private browsing may block storage. */ }
    }
    updateThemeControl();
  };
  updateThemeControl();
  // Until the user makes a choice, follow system appearance changes.
  const systemTheme = window.matchMedia?.('(prefers-color-scheme: light)');
  systemTheme?.addEventListener?.('change',e => {
    try {
      if (localStorage.getItem('form_theme') === 'light' || localStorage.getItem('form_theme') === 'dark') return;
    } catch (error) { /* Follow system when browser storage is unavailable. */ }
    setTheme(e.matches ? 'light' : 'dark',false);
  });

  const $ = (sel) => document.querySelector(sel);
  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const round = (n,d=0) => Number(Number(n).toFixed(d));
  const dateISO = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const today = () => dateISO(new Date());
  const weekday = (dateStr) => { const d = new Date(`${dateStr}T12:00:00`); return (d.getDay()+6)%7; };
  const weekDate = (day) => { const d=new Date(); d.setHours(12,0,0,0);d.setDate(d.getDate()-((d.getDay()+6)%7)+day); return dateISO(d); };
  const labelDate = (date) => new Date(`${date}T12:00:00`).toLocaleDateString('en-MY',{day:'numeric',month:'short'});
  const pct = (v,max) => Math.max(0,Math.min(100,Math.round((v/max)*100)));
  const coin = (p) => Number(p.calories||0).toLocaleString('en-MY');
  const initialDB = () => ({profiles:structuredClone(STARTERS),activity:[],weights:[],workoutSchedule:[],workoutExercises:[],dietPlans:[],mealSchedule:[]});
  const PAGE = document.body.dataset.page || 'home';
  const pageUrl = (page) => (page === 'home' ? 'index' : page) + '.html';
  const validPages = new Set(['home','plans','schedule','diet','meals','builder','add-member']);
  let db = initialDB();
  // The active profile is a browser preference. It is not workout data.
  let currentProfile = sessionStorage.getItem('form_active_profile') || 'amir';
  // A profile must be explicitly chosen once per browser tab/session. Navigation
  // between pages does not prompt again. This is a convenience gate, not sign-in.
  let memberConfirmed = false;
  try { memberConfirmed = sessionStorage.getItem('form_member_confirmed') === '1'; } catch (error) {}
  if (new URLSearchParams(window.location.search).has('choose')) { memberConfirmed = false; sessionStorage.removeItem('form_member_confirmed'); }

  let selectedDay = (new Date().getDay()+6)%7;
  let selectedMealKey = 'breakfast';
  // All persistent writes require a confirmed Google Sheets connection.
  // Never pretend a new member or workout was saved when the API is offline.
  const rememberDemo = () => {};
  const rememberProfile = () => { try { sessionStorage.setItem('form_active_profile',currentProfile); } catch(error) {} };
  // All navigation points to real files so browsers can use Back, Forward and bookmarks.
  document.querySelectorAll('[data-page-link]').forEach(link => {
    const target = link.dataset.pageLink;
    if (validPages.has(target)) link.href = pageUrl(target);
    if (target === PAGE) link.setAttribute('aria-current','page');
  });
  const endpoint = window.FORM_CONFIG?.endpoint || '';
  const accessKey = window.FORM_CONFIG?.apiKey || '';
  let connected = false;
  let connectionState = 'connecting';
  let connectionError = '';
  let busy = false;
  let toastTimer;
  const profile = () => db.profiles.find(p => p.id===currentProfile) || db.profiles[0];
  // Google Sheets is the source of truth when connected. All IDs are stable keys.
  const plan = (p=profile()) => {
    const workouts=(db.workoutSchedule||[]).filter(w=>w.profileId===p.id).sort((a,b)=>Number(a.dayIndex)-Number(b.dayIndex));
    if(workouts.length===7 && workouts.every((w,i)=>Number(w.dayIndex)===i)) {
      return workouts.map(w=>({
        workoutId:w.workoutId,title:w.title,focus:w.focus,type:w.type,minutes:Number(w.minutes),
        exercises:(db.workoutExercises||[]).filter(e=>e.workoutId===w.workoutId)
          .sort((a,b)=>Number(a.displayOrder)-Number(b.displayOrder))
          .map(e=>({exerciseId:e.exerciseId,name:e.name,sets:Number(e.sets),reps:e.reps,cue:e.cue}))
      }));
    }
    return p.goal==='muscle' ? MUSCLE_WEEK : p.id==='hana' ? FAT_HANA_WEEK : FAT_WEEK;
  };
  const mealsFor=(p=profile())=>{
    const rows=(db.mealSchedule||[]).filter(m=>m.profileId===p.id)
      .sort((a,b)=>Number(a.displayOrder)-Number(b.displayOrder));
    if(rows.length) return rows.map(m=>({
      mealId:m.mealId,key:m.mealKey,time:m.time,label:m.mealType,
      name:m.name,detail:m.detail,kcal:Number(m.kcal)
    }));
    return MEALS[p.goal]||MEALS.fatloss;
  };
  const dietFor=(p=profile())=>(db.dietPlans||[]).find(d=>d.profileId===p.id);
  const activityValue = (pid,date,type,key) => {
    const a = db.activity.find(r=>r.profileId===pid && r.date===date && r.type===type && r.itemKey===key);
    return a ? Number(a.value) : 0;
  };
  const isDone = (d) => activityValue(currentProfile,weekDate(d),'workout','session')===1;
  const doneCount = () => plan().filter((s,i)=>s.type==='strength' && isDone(i)).length;
  const strengthDays = () => plan().filter(s=>s.type==='strength').length;
  const waterLogged = (date=today()) => activityValue(currentProfile,date,'water','ml');
  const eatenMeals = (date) => mealsFor().filter(m => activityValue(currentProfile,date,'meal',m.key)===1);
  const markSync = () => {
    const pill=$('#syncStatus');
    if(pill){
      pill.classList.toggle('connected',connected);
      pill.innerHTML=`<span class="status-dot"></span>${connected?'Sheets connected':connectionState==='connecting'?'Connecting…':'Sheets offline'}`;
    }
    const notice=$('#modeNotice');
    if(notice){
      notice.classList.toggle('hidden',connected);
      notice.innerHTML=connectionState==='connecting'
        ? 'Connecting to your family Google Sheet automatically…'
        : 'Google Sheets is offline. Changes cannot be saved until it reconnects. <button type="button" data-action="retry-connect">Retry connection ↗</button>';
    }
  };
  const toast = (msg,err=false) => { const el=$('#toast');el.textContent=msg;el.style.background=err?'#f7b9a4':'#d9ff81'; el.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('visible'),3300); };

  function syncWelcomeGate(){
    const gate = $('#entryGate');
    if (!gate) return;
    if (!memberConfirmed) {
      $('#entryProfileOptions').innerHTML = db.profiles.map((p,i) => `
        <button class="entry-profile" type="button" data-enter-profile="${esc(p.id)}" aria-label="Continue as ${esc(p.name)}">
          <span class="entry-avatar entry-avatar-${i%4}">${esc(p.name.charAt(0).toUpperCase())}</span>
          <span class="entry-person"><strong>${esc(p.name)}</strong><small>${p.goal === 'muscle' ? 'Build muscle' : 'Lean & strong'}</small></span>
          <span class="entry-arrow" aria-hidden="true">↗</span>
        </button>`).join('');
    }
    document.documentElement.classList.toggle('profile-gate-open', !memberConfirmed);
    document.querySelector('.app-shell')?.toggleAttribute('inert',!memberConfirmed);
    document.querySelector('.mobile-dock')?.toggleAttribute('inert',!memberConfirmed);
    gate.setAttribute('aria-hidden',memberConfirmed ? 'true' : 'false');
  }
  function chooseMember(id){
    if (!db.profiles.some(p => p.id === id)) return;
    currentProfile=id;
    memberConfirmed=true;
    try { sessionStorage.setItem('form_member_confirmed','1'); } catch (error) {}
    rememberProfile();
    render();
    window.scrollTo({top:0,behavior:'instant'});
  }
  function showMemberPicker(){
    memberConfirmed=false;
    try { sessionStorage.removeItem('form_member_confirmed'); } catch (error) {}
    syncWelcomeGate();
    if(!$('#entryGate'))window.location.assign('index.html?choose=1');
    else $('#entryProfileOptions')?.querySelector('button')?.focus({preventScroll:true});
  }

  function renderDashboard(){
    const p=profile(), d=weekday(today()), session=plan()[d], done=doneCount(), total=strengthDays(), water=waterLogged(), meals=eatenMeals(today());
    const todayDone=activityValue(currentProfile,today(),'workout','session')===1;
    const greet = new Date().getHours()<12?'Good morning':new Date().getHours()<18?'Good afternoon':'Good evening';
    $('#dashboard').innerHTML=`
      <div class="dashboard-top"><div><span class="section-overline">PERSONAL DASHBOARD</span><h2>${greet}, ${esc(p.name)} <span aria-hidden="true">↗</span></h2><p class="dashboard-sub">Your goals. Your pace. Your progress.</p></div><div class="dash-actions"><a href="builder.html" class="button-outline">Edit training & meals ↗</a><button type="button" class="button-outline" data-action="edit-profile">Edit profile</button></div></div>
      <div class="dashboard-grid">
        <div class="card today-card"><div><span class="card-overline">TODAY'S SESSION · ${DAY_SHORT[d]}</span><h3>${esc(session.title)}</h3><p>${esc(session.focus)} · ${session.minutes?`${session.minutes} min`:'Recovery day'}</p><button type="button" class="accent-button" data-action="today-plan">${session.type==='strength'?(todayDone?'Workout completed ✓':'See today’s workout ↗'):'See your weekly plan ↗'}</button></div><div class="today-symbol ${session.type==='rest'?'rest':''}" aria-hidden="true">${session.type==='strength'?'↗':session.type==='rest'?'☾':'◌'}</div></div>
        <div class="card goal-card"><div><span class="card-overline">WEEKLY TRAINING</span><h3>${done} of ${total} sessions</h3><p>${esc(GOALS[p.goal].title)}</p></div><div class="circle-progress" style="--pct:${pct(done,total)}%"><div class="circle-inner"><strong>${pct(done,total)}%</strong><small>COMPLETE</small></div></div></div>
      </div>
      <div class="stats-grid">
        <div class="stat-card"><div class="stat-top">Body weight <span class="stat-icon">↗</span></div><div class="stat-num">${round(p.weight,1)}<small> kg</small></div><div class="stat-foot">Current check-in</div></div>
        <div class="stat-card"><div class="stat-top">Daily energy <span class="stat-icon">◈</span></div><div class="stat-num">${coin(p)}</div><div class="stat-foot">kcal / day · estimate</div></div>
        <div class="stat-card"><div class="stat-top">Daily protein <span class="stat-icon">◎</span></div><div class="stat-num">${p.protein}<small> g</small></div><div class="stat-foot">Muscle recovery</div></div>
        <div class="stat-card"><div class="stat-top">Water today <span class="stat-icon">◌</span></div><div class="stat-num">${round(water/1000,2)}<small> L</small></div><div class="stat-foot">Goal ${p.water} L <button type="button" data-action="water-add" data-amount="250" title="Add 250 mL of water">+250 mL</button></div></div>
      </div>
      <div class="meal-summary" style="margin-top:15px"><span>Today's meal check-ins: <strong>${meals.length}/${mealsFor().length}</strong></span><span class="muted-text">Track simple chicken, eggs, grains and vegetables <button class="subtle-link" type="button" data-view="meals">View meal schedule ↗</button></span></div>`;
  }
  const weekHeading = (title,descr) => `<div class="view-heading"><div><span class="section-overline">${esc(profile().name.toUpperCase())} / HOME TRAINING</span><h2>${title}</h2></div><p>${descr}</p></div>`;
  const weekSelector = () => `<div class="week-grid">${DAYS.map((day,i)=>{const s=plan()[i],date=weekDate(i);return `<button type="button" class="day-card ${i===selectedDay?'selected':''}" data-day="${i}" aria-pressed="${i===selectedDay}"><span class="day-name">${DAY_SHORT[i]}</span><span class="day-num">${new Date(`${date}T12:00:00`).getDate()}</span><span class="day-label">${s.type==='strength'?'Train':s.type==='rest'?'Rest':'Move'}</span>${isDone(i)?'<span class="day-done">✓ DONE</span>':''}</button>`}).join('')}</div>`;
  function exerciseMarkup(exercises) {return exercises.map((e,i)=>`<div class="detail-exercise"><strong>${String(i+1).padStart(2,'0')}. ${esc(e.name)}</strong><small>${e.sets} sets × ${esc(e.reps)}<br>${esc(e.cue)}</small></div>`).join('');}
  function detailWorkout(day) {
    const s=plan()[day],done=isDone(day),date=weekDate(day);
    return `<div class="detail-panel"><div class="detail-title"><div><span class="section-overline">${DAY_SHORT[day]} ${labelDate(date).toUpperCase()} · ${s.minutes||'REST'} ${s.minutes?'MIN':''}</span><h3>${esc(s.title)}</h3><p>${esc(s.focus)}${s.type==='strength'?'. Rest 60–120 seconds between sets; choose a load that leaves about 2 repetitions in reserve.':''}</p></div><span class="detail-badge">${s.type==='strength'?'STRENGTH':s.type==='recovery'?'ACTIVE':'REST'}</span></div>
      ${s.exercises.length?`<div class="detail-exercises">${exerciseMarkup(s.exercises)}</div>`:'<div class="empty-state">Recovery is part of training. Prioritize sleep, food and gentle movement.</div>'}
      ${s.type==='strength'?`<div class="detail-actions"><button type="button" class="button-primary" data-action="toggle-workout" data-day="${day}">${done?'↶ Undo completion':'✓ Mark workout complete'}</button><span class="mini-legend">${done?'Session completed':'Finish all sets at your own pace'}</span></div>`:''}</div>`;
  }
  function renderPlans(){
    const list=plan();
    $('#content').innerHTML=weekHeading('Workout plans','Strength training designed for your home equipment. Start light, progress when sets feel controlled.')+
      `<div class="builder-cta"><span>Want to change your training?</span><a class="button-outline" href="builder.html">Edit workouts ↗</a></div>`+
      `<div class="program-grid">${list.filter(s=>s.type==='strength').map(s=>`<details class="program-card"><summary><div><span class="section-overline">${esc(s.focus.toUpperCase())}</span><h3>${esc(s.title)}</h3><p>${s.minutes} MIN · ${s.exercises.length} exercises</p></div><span class="summary-right">＋</span></summary><div class="program-exercises">${s.exercises.map(e=>`<p><strong>${esc(e.name)}</strong> — ${e.sets} × ${esc(e.reps)}</p>`).join('')}</div></details>`).join('')}</div>`+
      `<div style="margin-top:30px"><div class="section-label-line"><div><span class="section-overline">THIS WEEK</span><h2>Pick a day to train</h2></div></div>${weekSelector()}${detailWorkout(selectedDay)}</div>`;
  }
  function renderSchedule(){
    $('#content').innerHTML=weekHeading('Your weekly schedule','A clear Monday–Sunday routine with strength, easy movement and recovery days.')+
      `<div class="week-grid">${DAYS.map((d,i)=>{const s=plan()[i];return `<button class="day-card ${selectedDay===i?'selected':''}" type="button" data-day="${i}"><span class="day-name">${DAY_SHORT[i]}</span><span class="day-num">${new Date(`${weekDate(i)}T12:00:00`).getDate()}</span><span class="day-label">${s.type==='strength'?'Strength':s.type==='rest'?'Rest':'Walk'}</span>${isDone(i)?'<span class="day-done">✓ DONE</span>':''}</button>`}).join('')}</div>`+
      `<div class="meal-summary"><span>Training: <strong>${doneCount()} of ${strengthDays()}</strong> complete</span><span class="muted-text">${esc(DAYS[selectedDay])}: ${esc(plan()[selectedDay].title)}</span></div>${detailWorkout(selectedDay)}`+
      `<div class="diet-info-grid"><div class="card"><span class="section-overline">PROGRESSION</span><h3>Get a little stronger</h3><p>When all prescribed reps feel good for two sessions, increase dumbbell weight by the smallest possible increment. Record form and consistency before adding load.</p></div><div class="card"><span class="section-overline">FORM FIRST</span><h3>Your setup matters</h3><p>Inspect your pull-up/dip rack and bench attachments before use. Warm up 5–8 minutes. Stop if you feel sharp pain, dizziness or joint instability.</p></div></div>`;
  }
  function renderDiet(){
    const p=profile(),target=mealsFor(p).reduce((n,m)=>n+m.kcal,0),diet=dietFor(p);
    $('#content').innerHTML=weekHeading('Your nutrition plan','Simple food. Practical portions. A sustainable routine you can repeat.')+
      `<div class="builder-cta"><span>Adjust your food and portion choices.</span><a class="button-outline" href="builder.html#meals-editor">Edit meals ↗</a></div>`+
      `<div class="diet-hero"><span class="section-overline">${esc(p.name.toUpperCase())} · ${p.goal==='muscle'?'CALORIE SURPLUS':'CALORIE DEFICIT'}</span><h2 style="font-size:27px;margin:10px 0 8px">${esc(GOALS[p.goal].bias)}</h2><p class="muted-text">${diet?.approach?`${esc(diet.approach)}. `:''}Suggested starting targets, not a calculated medical or nutrition prescription. Age, activity and health details may change your needs.</p>
      <div class="diet-targets"><div class="diet-target"><span class="label">Calories / day</span><strong>${coin(p)}</strong><small>kcal target</small></div><div class="diet-target"><span class="label">Protein / day</span><strong>${p.protein} g</strong><small>Include protein in meals</small></div><div class="diet-target"><span class="label">Water / day</span><strong>${p.water} L</strong><small>Adjust for heat & sweat</small></div></div></div>`+
      `<div class="diet-info-grid"><div class="card"><span class="section-overline">BUY THE BASICS</span><h3>Easy grocery list</h3><div class="food-tags">${['Chicken','Eggs','Rice','Wholemeal bread','Peanut butter','Vegetables','Bananas','Apples','Plain yogurt','Milk','Water'].map(f=>`<span>${esc(f)}</span>`).join('')}</div></div>
      <div class="card"><span class="section-overline">YOUR APPROACH</span><h3>${p.goal==='muscle'?'Build size gradually':'Lose fat without crash dieting'}</h3><p>${p.goal==='muscle'?'Start with a modest surplus, train with progressive overload and review your 2–4-week weight trend. Aim for gradual changes rather than rushing weight gain.':'Strength training plus daily walking supports fitness and muscle retention. You cannot choose where fat comes off; growing glutes and shoulders may help create the visual proportions you want.'}</p></div>
      <div class="card"><span class="section-overline">COOKING NOTE</span><h3>Watch the extras</h3><p>Rice and chicken portions in this app are approximate <strong>cooked weights</strong>. Weigh foods consistently. Oil, sauces, drinks and the exact bread or peanut butter brand change calorie totals.</p></div>
      <div class="card"><span class="section-overline">ADJUSTMENTS</span><h3>Check the trend</h3><p>Track your weight a few mornings per week under similar conditions. Review the multi-week trend and energy levels; adjust by small amounts if the target is not working. Your sample menu is about ${target.toLocaleString('en-MY')} kcal, so you can alter portions to approach your editable ${coin(p)} kcal goal.</p></div></div>`;
  }
  function renderMeals(){
    const p=profile(),date=weekDate(selectedDay),meals=mealsFor(p),planned=meals.reduce((n,m)=>n+m.kcal,0), consumed=eatenMeals(date).reduce((n,m)=>n+m.kcal,0), water=waterLogged(date);
    $('#content').innerHTML=weekHeading('Your eating schedule','A repeatable sample menu for each day. Check off meals as you go.')+
      `<div class="builder-cta"><span>Customize your daily meals.</span><a class="button-outline" href="builder.html#meals-editor">Edit meals ↗</a></div>`+
      `${weekSelector()}<div class="meal-summary"><span>${esc(DAYS[selectedDay])}, ${labelDate(date)} · <strong>${consumed.toLocaleString('en-MY')} / ${planned.toLocaleString('en-MY')} kcal</strong> checked</span><span class="mini-legend">Personal target: ${coin(p)} kcal</span><div class="progress-bar"><span style="width:${pct(consumed,planned)}%"></span></div></div>`+
      `<div class="meal-list">${meals.map(m=>{const done=activityValue(currentProfile,date,'meal',m.key)===1;return `<label class="meal-card ${done?'eaten':''}"><input class="meal-check" type="checkbox" data-meal="${m.key}" data-date="${date}" ${done?'checked':''}/><span><div class="meal-type">${esc(m.time)} · ${esc(m.label)}</div><h3>${esc(m.name)}</h3><p>${esc(m.detail)}</p><small>≈ ${m.kcal} kcal ${done?'· LOGGED':''}</small></span></label>`}).join('')}</div>`+
      `<div class="card" style="margin-top:15px"><span class="section-overline">HYDRATION</span><h3 style="margin:10px 0 5px">Water check-in</h3><p class="muted-text">${round(water/1000,2)} of ${p.water} litres · ${Math.round(water)} mL recorded for ${esc(labelDate(date))}</p><div class="progress-bar"><span style="width:${pct(water,p.water*1000)}%"></span></div><div class="water-tools"><button type="button" data-action="water-add" data-amount="250" data-date="${date}">+ 250 mL</button><button type="button" data-action="water-add" data-amount="500" data-date="${date}">+ 500 mL</button><button type="button" data-action="water-add" data-amount="-250" data-date="${date}">− 250 mL</button></div></div>`+
      `<p class="muted-text" style="line-height:1.7;margin:17px 3px">Portions and calories are estimates, not measured food intake. Drink according to thirst, activity, weather and individual needs. Speak with a qualified professional for personal medical or dietary advice.</p>`;
  }
  const MEAL_KEYS = ['breakfast','snack1','lunch','snack2','dinner'];
  const PLAN_DAYS = ['MON','TUE','WED','THU','FRI','SAT','SUN'];
  const makeWorkouts = (p, mode, sourceId) => {
    const src = mode==='blank' ? DAYS.map(()=>S('Build your session','Customize this day','rest',0,[])) :
      mode==='template' && db.profiles.some(x=>x.id===sourceId) ? plan(db.profiles.find(x=>x.id===sourceId)) :
      (p.goal==='muscle'?MUSCLE_WEEK:FAT_WEEK);
    return src.map((w,i)=>({dayIndex:i,title:w.title,focus:w.focus,type:w.type,minutes:Number(w.minutes)||0,
      exercises:(w.exercises||[]).map(x=>({name:x.name,sets:Number(x.sets)||1,reps:String(x.reps||''),cue:String(x.cue||'')}))}));
  };
  const makeMeals = (p, mode, sourceId) => {
    const src = mode==='blank' ? MEALS.fatloss.map(m=>({...m,name:'Add your meal',detail:'Customize your ingredients',kcal:0})) :
      mode==='template' && db.profiles.some(x=>x.id===sourceId) ? mealsFor(db.profiles.find(x=>x.id===sourceId)) :
      MEALS[p.goal];
    return src.map((m,i)=>({mealKey:MEAL_KEYS[i],time:String(m.time),mealType:String(m.label||m.mealType||''),name:String(m.name),detail:String(m.detail),kcal:Number(m.kcal)||0}));
  };
  const workoutKey = (pid,di) => `WO-${pid.toUpperCase()}-${PLAN_DAYS[di]}`;
  const mealKeyId = (pid,key) => `MP-${pid.toUpperCase()}-${String(MEAL_KEYS.indexOf(key)+1).padStart(2,'0')}`;
  function applyWorkoutDayLocal(pid,day,seed=false) {
    const workoutId=workoutKey(pid,day.dayIndex);
    db.workoutSchedule=db.workoutSchedule.filter(w=>w.workoutId!==workoutId);
    db.workoutSchedule.push({workoutId,profileId:pid,dayIndex:day.dayIndex,day:DAYS[day.dayIndex],
      title:day.title,focus:day.focus,type:day.type,minutes:Number(day.minutes)||0});
    db.workoutExercises=db.workoutExercises.filter(x=>x.workoutId!==workoutId);
    day.exercises.forEach((x,i)=>db.workoutExercises.push({exerciseId:`EX-${pid.toUpperCase()}-${PLAN_DAYS[day.dayIndex]}-${String(i+1).padStart(2,'0')}`,
      workoutId,profileId:pid,displayOrder:i+1,name:x.name,sets:Number(x.sets),reps:x.reps,cue:x.cue}));
  }
  function applyMealLocal(pid,m) {
    const index=MEAL_KEYS.indexOf(m.mealKey),dietId=`DP-${pid.toUpperCase()}`;
    db.mealSchedule=db.mealSchedule.filter(r=>!(r.profileId===pid&&r.mealKey===m.mealKey));
    db.mealSchedule.push({mealId:mealKeyId(pid,m.mealKey),dietId,profileId:pid,displayOrder:index+1,
      ...m});
  }
  function materializeLocal(pid) {
    const p=db.profiles.find(x=>x.id===pid);
    if(!p)return;
    if(db.workoutSchedule.filter(x=>x.profileId===pid).length!==7)makeWorkouts(p,'recommended').forEach(day=>applyWorkoutDayLocal(pid,day));
    if(!db.mealSchedule.some(x=>x.profileId===pid))makeMeals(p,'recommended').forEach(m=>applyMealLocal(pid,m));
    if(!db.dietPlans.some(x=>x.profileId===pid))db.dietPlans.push({dietId:`DP-${pid.toUpperCase()}`,profileId:pid,goal:p.goal,dailyCalories:p.calories,proteinGrams:p.protein,waterLitres:p.water,approach:'Personal starting estimate'});
  }
  function renderNewMember(){
    const el=$('#templateMember');if(!el)return;
    const prev=el.value;el.innerHTML=db.profiles.map(p=>`<option value="${esc(p.id)}">${esc(p.name)} — ${p.goal==='muscle'?'Build muscle':'Lean & strong'}</option>`).join('');
    if(db.profiles.some(x=>x.id===prev))el.value=prev;
    updateProgramChoice();
  }
  function updateProgramChoice(){
    const f=$('#newMemberForm');if(!f)return;
    const mode=f.elements.programMode.value;
    $('#templatePicker')?.classList.toggle('hidden',mode!=='template');
    const labels={recommended:'A prebuilt seven-day home workout schedule and five simple daily meals will be created for this member.',template:'Copy the selected family member’s current workouts and meals. Your new copy can be edited independently.',blank:'Start with seven editable rest days and five blank meal slots. Fill them in from Plan Builder after joining.'};
    $('#programDescription').textContent=labels[mode];
  }
  function renderBuilder(){
    const w=plan()[selectedDay], m=mealsFor().find(m=>m.key===selectedMealKey)||mealsFor()[0];
    selectedMealKey=m.key;
    $('#content').innerHTML=weekHeading('Build your own plan','All changes are saved to your profile only. Edit any day, exercises or meal without changing another family member’s plan.')+
      `<div class="builder-cta"><span>Active member: <strong>${esc(profile().name)}</strong>. Need a different person?</span><button class="button-outline" type="button" data-action="switch-member">Switch member</button></div>`+
      `<section class="editor-panel"><div class="section-label-line"><div><span class="section-overline">WORKOUT EDITOR</span><h2>Customize your week</h2></div></div>${weekSelector()}
        <form id="workoutEditor" class="editor-form"><h3>${esc(DAYS[selectedDay])} workout</h3>
          <div class="form-grid"><label>Session name<input class="text-input" name="title" maxlength="70" required value="${esc(w.title)}"></label>
          <label>Focus<input class="text-input" name="focus" maxlength="100" required value="${esc(w.focus)}"></label>
          <label>Session type<select class="text-input" name="type">${['strength','recovery','rest'].map(v=>`<option value="${v}" ${w.type===v?'selected':''}>${v[0].toUpperCase()+v.slice(1)}</option>`).join('')}</select></label>
          <label>Duration (minutes)<input class="text-input" name="minutes" type="number" min="0" max="240" required value="${w.minutes}"></label></div>
          <div class="editor-section-head"><strong>Exercises</strong><button class="button-outline" type="button" data-action="exercise-add">+ Add exercise</button></div>
          <div id="exerciseRows">${w.exercises.map((e,i)=>exerciseEditRow(e,i)).join('')}</div>
          <p class="fine-print">Use strength/recovery to add exercises. For a rest day, leave this list empty. Changing a session does not erase past completion logs.</p>
          <div class="editor-actions"><button class="button-primary" type="submit">Save ${esc(DAYS[selectedDay])} workout ↗</button></div>
        </form></section>
      <section class="editor-panel" id="meals-editor"><div class="section-label-line"><div><span class="section-overline">MEAL EDITOR</span><h2>Customize your daily menu</h2></div></div>
        <div class="meal-select-grid">${mealsFor().map(x=>`<button class="meal-slot ${x.key===selectedMealKey?'active':''}" type="button" data-select-meal="${esc(x.key)}">${esc(x.label)}</button>`).join('')}</div>
        <form id="mealEditor" class="editor-form"><h3>${esc(m.label)}</h3>
          <div class="form-grid"><label>Meal time<input class="text-input" name="time" maxlength="30" required value="${esc(m.time)}"></label>
          <label>Meal label<input class="text-input" name="mealType" maxlength="50" required value="${esc(m.label)}"></label>
          <label class="full">Meal name<input class="text-input" name="name" maxlength="90" required value="${esc(m.name)}"></label>
          <label class="full">Ingredients & portions<textarea class="text-input" name="detail" rows="3" maxlength="500" required>${esc(m.detail)}</textarea></label>
          <label>Estimated calories<input class="text-input" name="kcal" type="number" min="0" max="3000" step="1" required value="${m.kcal}"></label></div>
          <div class="editor-actions"><button class="button-primary" type="submit">Save ${esc(m.label)} ↗</button></div>
        </form></section>`;
  }
  function exerciseEditRow(e={},idx=0){return `<div class="exercise-edit-row" data-exercise-row><div class="exercise-edit-top"><strong>Exercise ${idx+1}</strong><button type="button" class="remove-exercise" data-action="exercise-remove">Remove</button></div>
    <div class="form-grid"><label class="full">Exercise<input class="text-input" name="exerciseName" maxlength="90" required value="${esc(e.name||'')}"></label>
    <label>Sets<input class="text-input" name="exerciseSets" type="number" min="1" max="10" value="${Number(e.sets)||3}" required></label>
    <label>Reps / time<input class="text-input" name="exerciseReps" maxlength="35" required value="${esc(e.reps||'8–12')}"></label>
    <label class="full">Equipment / cue<input class="text-input" name="exerciseCue" maxlength="200" value="${esc(e.cue||'')}"></label></div></div>`;}
  function collectExercises(){return [...document.querySelectorAll('#exerciseRows [data-exercise-row]')].map(el=>({name:el.querySelector('[name=exerciseName]').value.trim(),sets:Number(el.querySelector('[name=exerciseSets]').value),reps:el.querySelector('[name=exerciseReps]').value.trim(),cue:el.querySelector('[name=exerciseCue]').value.trim()}));}
  function render(){
    if (!profile()) { currentProfile=db.profiles[0]?.id || 'amir'; }
    rememberProfile();
    markSync();
    const badge=$('#activeMemberBadge'); if(badge) badge.textContent=PAGE==='add-member'?'NEW MEMBER':`ACTIVE · ${profile()?.name||'Choose profile'}`;
    syncWelcomeGate();
    if(PAGE==='home') renderDashboard();
    if(PAGE==='plans') renderPlans();
    if(PAGE==='schedule') renderSchedule();
    if(PAGE==='diet') renderDiet();
    if(PAGE==='meals') renderMeals();
    if(PAGE==='builder') renderBuilder();
    if(PAGE==='add-member') renderNewMember();
    document.querySelectorAll('[data-page-link]').forEach(link => {
      const active=link.dataset.pageLink===PAGE;
      link.classList.toggle('active',active);
      if(active)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');
    });
  }
  function selectView(view){ if (validPages.has(view)) window.location.assign(pageUrl(view)); }
  function openSettings(){
    const feedback=$('#connectFeedback');
    if(feedback) feedback.textContent=connected?'Connected to your family Google Sheet.':connectionState==='connecting'?'Connecting automatically…':`Not connected: ${connectionError || 'please retry.'}`;
    $('#settingsDialog')?.showModal();
  }
  function openProfileDialog(newProfile=false){
    const p=newProfile?{id:'',name:'',goal:'muscle',height:170,weight:65,calories:2400,protein:110,water:2.2}:profile();
    $('#profileFormTitle').textContent=newProfile?'Add member':`Edit ${p.name}`;
    const f=$('#profileForm'); ['id','name','goal','height','weight','calories','protein','water'].forEach(k => {f.elements[k].value=p[k]??'';});
    $('#profileDialog').showModal();
  }
  function applyLocal(action){
    if(action.action==='saveActivity'){
      let found=db.activity.find(a=>a.profileId===action.profileId && a.date===action.date && a.type===action.type && a.itemKey===action.itemKey);
      if(found)found.value=Number(action.value);else db.activity.push({profileId:action.profileId,date:action.date,type:action.type,itemKey:action.itemKey,value:Number(action.value)});
    }
    if(action.action==='createMember'){
      const p=action.profile;db.profiles.push({...p,startWeight:p.weight});
      db.dietPlans.push({dietId:`DP-${p.id.toUpperCase()}`,profileId:p.id,goal:p.goal,dailyCalories:p.calories,proteinGrams:p.protein,waterLitres:p.water,approach:'Personal starting estimate'});
      action.workouts.forEach(day=>applyWorkoutDayLocal(p.id,day));
      action.meals.forEach(m=>applyMealLocal(p.id,m));
    }
    if(action.action==='saveWorkoutDay'){
      materializeLocal(action.profileId);
      applyWorkoutDayLocal(action.profileId,action.day);
    }
    if(action.action==='saveMeal'){
      materializeLocal(action.profileId);
      applyMealLocal(action.profileId,action.meal);
    }
    if(action.action==='saveProfile'){
      const {profile:newP}=action;const i=db.profiles.findIndex(p=>p.id===newP.id);
      if(i>=0)db.profiles[i]={...db.profiles[i],...newP}; else db.profiles.push({...newP,startWeight:newP.weight});
      if(newP.weight && (!db.weights.some(w=>w.profileId===newP.id && w.date===today()))) db.weights.push({profileId:newP.id,date:today(),weight:newP.weight});
    }
    rememberDemo();
  }
  function dataMatches(action){
    if(action.action==='saveActivity') return db.activity.some(a=>a.profileId===action.profileId&&a.date===action.date&&a.type===action.type&&a.itemKey===action.itemKey&&Number(a.value)===Number(action.value));
    if(action.action==='saveProfile')return db.profiles.some(p=>p.id===action.profile.id && p.name===action.profile.name && Number(p.weight)===Number(action.profile.weight) && Number(p.calories)===Number(action.profile.calories));
    if(action.action==='createMember')return db.profiles.some(p=>p.id===action.profile.id) && db.workoutSchedule.filter(w=>w.profileId===action.profile.id).length===7 && db.mealSchedule.filter(m=>m.profileId===action.profile.id).length===5;
    if(action.action==='saveWorkoutDay'){const w=db.workoutSchedule.find(w=>w.profileId===action.profileId&&w.dayIndex===action.day.dayIndex);return !!w && w.title===action.day.title && db.workoutExercises.filter(x=>x.workoutId===w.workoutId).length===action.day.exercises.length && db.workoutExercises.filter(x=>x.workoutId===w.workoutId).every((e,i)=>e.name===action.day.exercises[i].name);}
    if(action.action==='saveMeal')return db.mealSchedule.some(m=>m.profileId===action.profileId&&m.mealKey===action.meal.mealKey&&m.name===action.meal.name&&Number(m.kcal)===action.meal.kcal);
    return false;
  }
  function jsonpRead(url,key,limit=18000){
    return new Promise((resolve,reject)=>{
      const cb='formcb'+Math.random().toString(36).slice(2);
      const tag=document.createElement('script');let finished=false;
      const cleanup=()=>{if(finished)return;finished=true;delete window[cb];tag.remove();clearTimeout(timer);};
      const timer=setTimeout(()=>{cleanup();reject(new Error('Google Sheets request timed out. Check deployment and access.'));},limit);
      window[cb]=(payload)=>{cleanup();if(payload&&payload.ok)resolve(payload);else reject(new Error(payload?.error||'Access key rejected or Sheet not ready.'));};
      tag.onerror=()=>{cleanup();reject(new Error('Cannot load Google Apps Script. Check the deployment URL and access.'));};
      const u=new URL(url);u.searchParams.set('action','read');u.searchParams.set('key',key);u.searchParams.set('callback',cb);u.searchParams.set('_',String(Date.now()));
      tag.src=u.toString();document.head.appendChild(tag);
    });
  }
  async function reloadSheets(url=endpoint,key=accessKey){
    const payload=await jsonpRead(url,key);
    if(!Array.isArray(payload.profiles)||!Array.isArray(payload.activity)||
       !Array.isArray(payload.workoutSchedule)||!Array.isArray(payload.workoutExercises)||
       !Array.isArray(payload.dietPlans)||!Array.isArray(payload.mealSchedule))
      throw new Error('Please deploy the updated Code.gs with workout and meal reference tables.');
    db={profiles:payload.profiles,activity:payload.activity,weights:payload.weights||[],
      workoutSchedule:payload.workoutSchedule,workoutExercises:payload.workoutExercises,
      dietPlans:payload.dietPlans,mealSchedule:payload.mealSchedule};
    if(!db.profiles.some(p=>p.id===currentProfile))currentProfile=db.profiles[0]?.id||'amir';
    rememberProfile();
    connected=true;connectionState='connected';connectionError='';render();
  }
  async function mutate(action){
    if(busy){toast('Save already in progress.');return false;}
    if(!connected){toast('Google Sheets is not connected. No changes were saved. Please retry the connection.',true);return false;}
    busy=true;document.body.style.cursor='progress';
    try{
      // A simple text/plain POST avoids a CORS preflight. Browsers hide the response
      // in no-cors mode, so we re-read and VERIFY the value before reporting success.
      await fetch(endpoint,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain'},body:JSON.stringify({...action,key:accessKey})});
      await reloadSheets();
      if(!dataMatches(action))throw new Error('Could not confirm the updated value in Google Sheets. Please check your spreadsheet before retrying.');
      toast('Saved to Google Sheets ✓');
      return true;
    }catch(err){toast(err.message||'Could not save',true);return false;}
    finally{busy=false;document.body.style.cursor='';}
  }
  const getID = (name) => name.toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,35) || `person-${Math.floor(Math.random()*1e6)}`;
  function toNumber(v){return Number.parseFloat(v);}

  document.addEventListener('click', async (e)=>{
    if(e.target.closest('[data-close]')){e.target.closest('dialog')?.close();return;}
    const target=e.target.closest('[data-enter-profile], [data-profile], [data-day], [data-select-meal], [data-view], [data-action]');
    if(!target)return;
    if(target.dataset.enterProfile){chooseMember(target.dataset.enterProfile);return;}
    if(target.dataset.profile){currentProfile=target.dataset.profile;rememberProfile();render();return;}
    if(target.dataset.day!==undefined && !target.dataset.action){selectedDay=Number(target.dataset.day);render();return;}
    if(target.dataset.selectMeal){selectedMealKey=target.dataset.selectMeal;render();window.location.hash='meals-editor';return;}
    if(target.dataset.view){selectView(target.dataset.view);return;}
    const a=target.dataset.action;
    if(a==='switch-member'){showMemberPicker();return;}
    if(a==='return-welcome'){sessionStorage.removeItem('form_member_confirmed');window.location.assign('index.html?choose=1');return;}
    if(a==='toggle-theme'){setTheme(document.documentElement.dataset.theme === 'light' ? 'dark' : 'light');return;}
    if(a==='settings')openSettings();
    if(a==='retry-connect'){await autoConnect(true);return;}
    if(a==='edit-profile')openProfileDialog(false);
    if(a==='add-profile')window.location.assign('add-member.html');
    if(a==='exercise-add'){const rows=$('#exerciseRows');if(rows.children.length>=12){toast('Limit 12 exercises per day.',true);return;}rows.insertAdjacentHTML('beforeend',exerciseEditRow({},rows.children.length));return;}
    if(a==='exercise-remove'){target.closest('[data-exercise-row]')?.remove();return;}
    if(a==='home'){selectView('home');return;}
    if(a==='today-plan'){selectedDay=weekday(today());selectView('plans');return;}
    if(a==='toggle-workout'){
      const day=Number(target.dataset.day);const date=weekDate(day);
      await mutate({action:'saveActivity',profileId:currentProfile,date,type:'workout',itemKey:'session',value:isDone(day)?0:1});
    }
    if(a==='water-add'){
      const date=target.dataset.date||today();const delta=Number(target.dataset.amount);
      await mutate({action:'saveActivity',profileId:currentProfile,date,type:'water',itemKey:'ml',value:Math.max(0,waterLogged(date)+delta)});
    }

  });
  document.addEventListener('change',async (e)=>{
    const m=e.target.closest('[data-meal]');if(!m)return;
    const wanted=m.checked?1:0;
    const saved=await mutate({action:'saveActivity',profileId:currentProfile,date:m.dataset.date,type:'meal',itemKey:m.dataset.meal,value:wanted});
    if(!saved)render();
  });
  document.addEventListener('change',e=>{
    if(e.target.name==='programMode')updateProgramChoice();
    if(e.target.id==='newGoal'){
      const f=$('#newMemberForm');if(!f)return;
      if(e.target.value==='muscle'){f.elements.calories.value=2400;f.elements.protein.value=110;}
      else{f.elements.calories.value=1800;f.elements.protein.value=105;}
    }
  });
  $('#newMemberForm')?.addEventListener('submit',async(e)=>{
    e.preventDefault();const f=e.currentTarget,name=f.elements.name.value.trim();
    if(!name){toast('Please enter your name.',true);return;}
    if(db.profiles.some(p=>p.name.toLowerCase()===name.toLowerCase())){toast('This name is already used. Select the profile on the welcome page.',true);return;}
    let id='usr-'+getID(name).slice(0,30), i=2;
    while(db.profiles.some(p=>p.id===id)){id=`usr-${getID(name).slice(0,25)}-${i++}`;}
    const p={id,name,height:Number(f.elements.height.value),weight:Number(f.elements.weight.value),startWeight:Number(f.elements.weight.value),goal:f.elements.goal.value,
      calories:Number(f.elements.calories.value),protein:Number(f.elements.protein.value),water:Number(f.elements.water.value)};
    const mode=f.elements.programMode.value,source=f.elements.templateProfile.value;
    const action={action:'createMember',profile:p,workouts:makeWorkouts(p,mode,source),meals:makeMeals(p,mode,source)};
    const b=f.querySelector('[type=submit]');b.disabled=true;
    try{
      const done=await mutate(action);
      if(done){currentProfile=id;memberConfirmed=true;sessionStorage.setItem('form_member_confirmed','1');rememberProfile();window.location.assign('index.html');}
    }finally{b.disabled=false;}
  });
  document.addEventListener('submit',async(e)=>{
    if(e.target.id==='workoutEditor'){
      e.preventDefault();const f=e.target,exercises=collectExercises();
      const day={dayIndex:selectedDay,title:f.elements.title.value.trim(),focus:f.elements.focus.value.trim(),type:f.elements.type.value,minutes:Number(f.elements.minutes.value),exercises};
      if(day.type==='rest' && exercises.length){toast('Remove exercises if this is a rest day, or change the session type.',true);return;}
      const b=f.querySelector('[type=submit]');b.disabled=true;try{await mutate({action:'saveWorkoutDay',profileId:currentProfile,day});}finally{b.disabled=false;}
    }
    if(e.target.id==='mealEditor'){
      e.preventDefault();const f=e.target,meal={mealKey:selectedMealKey,time:f.elements.time.value.trim(),mealType:f.elements.mealType.value.trim(),name:f.elements.name.value.trim(),detail:f.elements.detail.value.trim(),kcal:Number(f.elements.kcal.value)};
      const b=f.querySelector('[type=submit]');b.disabled=true;try{await mutate({action:'saveMeal',profileId:currentProfile,meal});}finally{b.disabled=false;}
    }
  });
  $('#profileForm').addEventListener('submit',async (e)=>{
    e.preventDefault();const f=e.currentTarget,oldId=f.elements.id.value,name=f.elements.name.value.trim();
    if(!name){toast('Enter a member name.',true);return;}
    const id=oldId||getID(name);
    if(!oldId && db.profiles.some(p=>p.id===id)){toast('A member with this name already exists.',true);return;}
    const newP={id,name,goal:f.elements.goal.value,height:toNumber(f.elements.height.value),weight:toNumber(f.elements.weight.value),calories:toNumber(f.elements.calories.value),protein:toNumber(f.elements.protein.value),water:toNumber(f.elements.water.value),startWeight:oldId?profile().startWeight:toNumber(f.elements.weight.value)};
    if([newP.height,newP.weight,newP.calories,newP.protein,newP.water].some(n=>!Number.isFinite(n))){toast('Check the numbers.',true);return;}
    if(newP.calories<1200||newP.water<1){toast('Please use realistic starting targets.',true);return;}
    const done=await mutate({action:'saveProfile',profile:newP});
    if(done){currentProfile=id;f.closest('dialog').close();render();}
  });
  async function autoConnect(manual=false){
    if (!endpoint || !accessKey){
      connected=false;connectionState='error';connectionError='Missing config.js values.';
      render();
      if(manual)toast('Connection settings are missing from config.js.',true);
      return;
    }
    connectionState='connecting';connectionError='';render();
    const feedback=$('#connectFeedback');
    if(feedback)feedback.textContent='Connecting automatically…';
    try{
      await reloadSheets();
      if(feedback)feedback.textContent='Connected to your family Google Sheet.';
      if(manual)toast('Google Sheets connected ✓');
    }catch(err){
      connected=false;connectionState='error';connectionError=err.message||'Unable to connect';
      render();
      if(feedback)feedback.textContent=`Unable to connect: ${connectionError}`;
      if(manual)toast(`Google Sheets unavailable: ${connectionError}`,true);
    }
  }
  // Automatically connect on every page load; no URL/key entry necessary.
  autoConnect();
  if (!memberConfirmed) $('#entryProfileOptions')?.querySelector('button')?.focus({preventScroll:true});
})();
