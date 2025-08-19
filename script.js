// =======================================
// AiqynAI — Stable global client script
// =======================================
const KEY = "aiqynai_user";

/* ---------- Storage / Points ---------- */
function loadUser(){
  try{
    return JSON.parse(localStorage.getItem(KEY)) || {
      name:"", goal:"", points:0, badges:[], firsts:{chat:false}
    };
  }catch(e){
    return { name:"", goal:"", points:0, badges:[], firsts:{chat:false} };
  }
}
function saveUser(u){ localStorage.setItem(KEY, JSON.stringify(u)); }
function addPoints(n){
  const u=loadUser(); u.points+=n;
  const tiers=[{p:50,id:"starter"},{p:150,id:"explorer"},{p:300,id:"achiever"}];
  tiers.forEach(t=>{ if(u.points>=t.p && !u.badges.includes(t.id)) u.badges.push(t.id); });
  saveUser(u); updatePointsUI();
}
function updatePointsUI(){
  const u=loadUser(); const el=document.getElementById("pointsDisplay");
  if(el){ el.textContent=`⭐ ${u.points}`; el.title=`Badges: ${u.badges.join(", ")||"—"}`; }
}

/* ---------- Demo AI ---------- */
function demoAIReply(text){
  const t=(text||"").toLowerCase();
  if(/ент|en[nt]/.test(t))   return "Демо: тренируй предметы ЕНТ таймированно и анализируй ошибки.";
  if(/ielts/.test(t))        return "Демо: IELTS — фокус 60% Writing/Speaking, 40% Reading/Listening.";
  if(/sat/.test(t))          return "Демо: SAT — ежедневные Math и чтение EBRW.";
  if(/универ|вуз|univ/.test(t)) return "Демо: укажи страну/язык/бюджет — подберу варианты.";
  if(/мотивацион|cover|motivation/.test(t)) return "Открой мастер «Мотивационное письмо» справа на странице.";
  return "Демо‑ответ: скоро подключим реальный AI‑бэкенд.";
}

/* ---------- Init ---------- */
document.addEventListener("DOMContentLoaded", ()=>{
  updatePointsUI();
  bindBrandHome();
  ensureFooterHomeLink();
  headerRightCluster();   // points + profile + rewards (modals)
  themeSwitch();          // iOS-like, fixed

  // Если это страница AI — не вставляем плавающий мини-чат
  if(!document.body.classList.contains('page-ai')){
    fabAndPanel();        // floating AI + following panel
  }

  inlineAIHook();         // для ai.html (большой чат)
  mlWizardHook();         // мастер мотивационного письма (ai.html)
});

/* ---------- Header helpers ---------- */
function bindBrandHome(){
  const brand=document.querySelector(".site-header .brand");
  if(!brand||brand.dataset.bound) return; brand.dataset.bound="1";
  const go=()=>location.href="index.html";
  brand.addEventListener("click",go);
  brand.addEventListener("keydown",e=>{ if(e.key==="Enter"||e.key===" ") go(); });
}
function ensureFooterHomeLink(){
  const f=document.querySelector(".site-footer"); if(!f||f.querySelector(".home-link")) return;
  const a=document.createElement("a"); a.href="index.html"; a.textContent="AiqynAI"; a.className="home-link"; a.style.fontWeight="700";
  f.prepend(a," ");
}

/* ---------- Right cluster: Rewards + Profile ---------- */
function headerRightCluster(){
  const header=document.querySelector(".site-header"); if(!header) return;
  let right=document.querySelector(".header-right"); if(!right){ right=document.createElement("div"); right.className="header-right"; header.appendChild(right); }

  // Points
  let points=document.getElementById("pointsDisplay");
  if(!points){ points=document.createElement("button"); points.id="pointsDisplay"; points.className="points"; points.type="button"; points.textContent="⭐ 0"; right.appendChild(points); }
  updatePointsUI();

  // Profile icon
  if(!document.getElementById("profileButton")){
    const btn=document.createElement("button"); btn.id="profileButton"; btn.className="icon-btn"; btn.type="button"; btn.title="Профиль";
    btn.innerHTML=`<svg viewBox="0 0 24 24"><path d="M12 12c2.9 0 5-2.1 5-5s-2.1-5-5-5-5 2.1-5 5 2.1 5 5 5zm0 2c-4 0-8 2-8 6v2h16v-2c0-4-4-6-8-6z"/></svg>`;
    right.appendChild(btn);
  }

  // Backdrop
  if(!document.querySelector(".modal-backdrop")){
    const back=document.createElement("div"); back.className="modal-backdrop"; document.body.appendChild(back);
  }
  const backdrop=document.querySelector(".modal-backdrop");

  // Rewards modal
  if(!document.getElementById("rewardsModal")){
    const m=document.createElement("section"); m.className="modal"; m.id="rewardsModal";
    m.innerHTML=`<header><h3>Награды</h3><button class="close" data-close="rewardsModal">Закрыть</button></header><div class="rewards-grid" id="rewardsGrid"></div>`;
    document.body.appendChild(m);
  }
  // Profile modal
  if(!document.getElementById("profileModal")){
    const m=document.createElement("section"); m.className="modal"; m.id="profileModal";
    m.innerHTML=`<header><h3>Профиль</h3><button class="close" data-close="profileModal">Закрыть</button></header>
      <div class="profile-form">
        <div class="row">
          <input id="profName" type="text" placeholder="Ваше имя"/>
          <input id="profGoal" type="text" placeholder="Цель (напр. IELTS 7.0 / ЕНТ 120)"/>
          <button class="btn" id="profSave">Сохранить</button>
        </div>
        <p class="hint">Данные хранятся локально в вашем браузере.</p>
      </div>`;
    document.body.appendChild(m);
  }

  function openModal(id){ document.getElementById(id).classList.add("open"); backdrop.classList.add("open"); }
  function closeModal(){ document.querySelectorAll(".modal.open").forEach(m=>m.classList.remove("open")); backdrop.classList.remove("open"); }

  document.getElementById("pointsDisplay").addEventListener("click", ()=>{ renderRewards(); openModal("rewardsModal"); });
  document.getElementById("profileButton").addEventListener("click", ()=>{
    const u=loadUser();
    document.getElementById("profName").value=u.name||"";
    document.getElementById("profGoal").value=u.goal||"";
    openModal("profileModal");
  });
  backdrop.addEventListener("click", closeModal);
  document.addEventListener("click",(e)=>{ const c=e.target.closest(".close"); if(c){ closeModal(); }});
  document.getElementById("profSave").addEventListener("click", ()=>{
    const u=loadUser(); u.name=document.getElementById("profName").value.trim(); u.goal=document.getElementById("profGoal").value.trim();
    saveUser(u); addPoints(10); closeModal();
  });

  function renderRewards(){
    const {badges,points}=loadUser(); const grid=document.getElementById("rewardsGrid"); grid.innerHTML="";
    const items=[{id:"starter",label:"Starter",need:50},{id:"explorer",label:"Explorer",need:150},{id:"achiever",label:"Achiever",need:300}];
    items.forEach(it=>{
      const got=badges.includes(it.id);
      const el=document.createElement("div"); el.className="badge";
      el.innerHTML=`<div>⭐</div><div><strong>${it.label}</strong><div>${got?"получено":"нужно: "+it.need+" очков"}</div></div>`;
      grid.appendChild(el);
    });
    const s=document.createElement("div"); s.className="badge"; s.innerHTML=`<div>💠</div><div><strong>Ваши очки</strong><div>${points}</div></div>`; grid.appendChild(s);
  }
}

/* ---------- Theme switch (iOS-like) ---------- */
function themeSwitch(){
  const KEY="aiqynai_theme_choice";
  const mm=matchMedia("(prefers-color-scheme: dark)");
  const header=document.querySelector(".site-header"); if(!header||header.querySelector(".theme-switch")) return;

  const sw=document.createElement("div"); sw.className="theme-switch"; sw.setAttribute("role","switch"); sw.tabIndex=0;
  sw.innerHTML=`<span class="icon">☀️</span><span class="icon">🌙</span><div class="thumb"></div>`;
  (document.querySelector(".header-right")||header).appendChild(sw);

  const get=()=>localStorage.getItem(KEY);
  const set=m=>m?localStorage.setItem(KEY,m):localStorage.removeItem(KEY);
  const apply=m=>{
    document.body.classList.remove("theme-light","theme-dark");
    if(m==="light") document.body.classList.add("theme-light");
    if(m==="dark")  document.body.classList.add("theme-dark");
  };

  const sys=()=> mm.matches?"dark":"light";
  const saved=get();
  if(saved==="light"||saved==="dark"){ sw.dataset.mode=saved; apply(saved); }
  else { sw.dataset.mode=sys(); apply(sw.dataset.mode); }

  function toggle(){ const next=(sw.dataset.mode==="light")?"dark":"light"; sw.dataset.mode=next; set(next); apply(next); }
  sw.addEventListener("click",toggle);
  sw.addEventListener("keydown",(e)=>{ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); toggle(); } });

  mm.addEventListener?.("change",()=>{ if(!get()){ sw.dataset.mode=sys(); apply(sw.dataset.mode); } });
}

/* ---------- FAB + following AI panel (skip on ai.html) ---------- */
let aiPanelEl=null, aiFabEl=null;
function fabAndPanel(){
  if(document.body.classList.contains('page-ai')) return; // не мешаем большой версии на AI‑странице
  const body=document.body;

  if(!document.querySelector(".ai-fab")){
    aiFabEl=document.createElement("button"); aiFabEl.className="ai-fab"; aiFabEl.type="button"; aiFabEl.innerHTML="<span>AI</span>";
    aiFabEl.style.display="grid"; aiFabEl.style.position="fixed"; aiFabEl.style.right="20px"; aiFabEl.style.bottom="20px";
    body.appendChild(aiFabEl); body.classList.add("ai-ready");

    makeDraggableFab(aiFabEl, ()=>{ if(body.classList.contains("ai-open")) positionPanelNearFab(); });

    aiFabEl.addEventListener("click", ()=>{
      const open=body.classList.toggle("ai-open");
      if(open){
        ensureAIPanel();
        positionPanelNearFab(true);
        setTimeout(()=>document.getElementById("aiqyn-fab-input")?.focus(),0);
      }
    });

    addEventListener("resize", ()=>{ if(document.body.classList.contains("ai-open")) positionPanelNearFab(); });
    addEventListener("scroll", ()=>{ if(document.body.classList.contains("ai-open")) positionPanelNearFab(); }, {passive:true});
  }
}
function ensureAIPanel(){
  if(aiPanelEl) return aiPanelEl;
  aiPanelEl=document.createElement("section"); aiPanelEl.className="ai-panel";
  aiPanelEl.innerHTML=`
    <header>
      <div class="title">AIqyn Assistant</div>
      <div style="display:flex;align-items:center;gap:8px">
        <span class="dot" title="online"></span>
        <button type="button" id="aiqyn-fab-close" class="btn ghost" style="padding:6px 10px;border-radius:10px">×</button>
      </div>
    </header>
    <div class="body">
      <div id="aiqyn-fab-scroll" class="scroll" aria-live="polite"></div>
      <div class="chips" id="aiqyn-fab-chips" style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">
        <div class="btn ghost chip">План к IELTS 7.0</div>
        <div class="btn ghost chip">Подбор вузов</div>
        <div class="btn ghost chip">Чек-лист документов</div>
        <div class="btn ghost chip">Разбор ошибки ЕНТ</div>
      </div>
      <div class="inputbar">
        <input id="aiqyn-fab-input" type="text" placeholder="Спроси про ЕНТ/IELTS/SAT или вузы..." />
        <button class="btn" id="aiqyn-fab-send">Отправить</button>
      </div>
    </div>`;
  document.body.appendChild(aiPanelEl);

  addMsg(`Привет${loadUser().name?`, ${loadUser().name}`:""}! Это мини‑чат AI. Задай вопрос или выбери подсказку ниже.`,"bot");

  aiPanelEl.querySelector("#aiqyn-fab-close").addEventListener("click", ()=> document.body.classList.remove("ai-open"));
  aiPanelEl.querySelectorAll("#aiqyn-fab-chips .chip").forEach(ch=>{
    ch.addEventListener("click", ()=>{ const i=document.getElementById("aiqyn-fab-input"); i.value=ch.textContent.trim(); i.focus(); });
  });
  const send=()=>{
    const i=document.getElementById("aiqyn-fab-input"); const text=(i.value||"").trim(); if(!text) return;
    addMsg(text,"me"); i.value="";
    const u=loadUser(); if(!u.firsts?.chat){ u.firsts.chat=true; saveUser(u); addPoints(20); }
    setTimeout(()=>addMsg(demoAIReply(text),"bot"),300);
  };
  aiPanelEl.querySelector("#aiqyn-fab-send").addEventListener("click",send);
  aiPanelEl.querySelector("#aiqyn-fab-input").addEventListener("keydown",(e)=>{ if(e.key==="Enter") send(); });

  function addMsg(text,who){
    const box=document.getElementById("aiqyn-fab-scroll"); if(!box) return;
    const w=document.createElement("div"); w.className="msg "+(who==="me"?"me":"bot");
    const b=document.createElement("div"); b.className="bubble"; b.textContent=text;
    w.appendChild(b); box.appendChild(w); box.scrollTop=box.scrollHeight;
  }

  return aiPanelEl;
}
function positionPanelNearFab(animate=false){
  const panel=document.querySelector(".ai-panel"); const fab=document.querySelector(".ai-fab"); if(!panel||!fab) return;
  const fr=fab.getBoundingClientRect(); const pw=panel.offsetWidth||380, ph=panel.offsetHeight||480; const vw=innerWidth, vh=innerHeight;
  let top=fr.top - ph - 10, left=fr.left - pw + fr.width;
  if(top<8) top=fr.bottom+10;
  if(left+pw>vw-8) left=vw-pw-8;
  if(left<8) left=8;
  if(top+ph>vh-8) top=Math.max(8, vh-ph-8);
  panel.style.top=`${Math.round(top)}px`; panel.style.left=`${Math.round(left)}px`;
  if(animate){ panel.style.transform="translateY(8px) scale(.985)"; requestAnimationFrame(()=>panel.style.transform="translateY(0) scale(1)"); }
}

/* ---------- Draggable FAB ---------- */
function makeDraggableFab(el,onMove){
  let dragging=false,sx=0,sy=0,sl=0,st=0;
  const down=e=>{ dragging=true; try{el.setPointerCapture(e.pointerId);}catch{} const r=el.getBoundingClientRect();
    el.style.left=r.left+"px"; el.style.top=r.top+"px"; el.style.right="auto"; el.style.bottom="auto";
    sx=e.clientX; sy=e.clientY; sl=parseFloat(el.style.left)||r.left; st=parseFloat(el.style.top)||r.top; };
  const move=e=>{ if(!dragging) return; const nl=sl+(e.clientX-sx), nt=st+(e.clientY-sy); const vw=innerWidth,vh=innerHeight, s=el.getBoundingClientRect();
    el.style.left=Math.max(6,Math.min(vw-s.width-6,nl))+"px"; el.style.top=Math.max(6,Math.min(vh-s.height-6,nt))+"px"; onMove&&onMove(); };
  const up=e=>{ dragging=false; try{el.releasePointerCapture(e.pointerId);}catch{} };
  el.addEventListener("pointerdown",down); addEventListener("pointermove",move); addEventListener("pointerup",up);
}

/* ---------- Inline AI for ai.html (большой чат + chips + приветствие) ---------- */
function inlineAIHook(){
  const w=document.getElementById("chatWindow");
  const i=document.getElementById("chatInput");
  const s=document.getElementById("chatSend");
  const chips=document.getElementById("chatChips");
  if(!w||!i||!s) return;

  const add=(text,who)=>{
    const wrap=document.createElement("div");
    wrap.className="msg "+(who==="me"?"me":"bot");
    const b=document.createElement("div");
    b.className="bubble"+(who==="bot"?" bot":"");
    b.textContent=text;
    wrap.appendChild(b);
    w.appendChild(wrap);
    w.scrollTop=w.scrollHeight;
  };

  // Приветствие один раз
  if(!w.dataset.greeted){
    w.dataset.greeted="1";
    const u=loadUser();
    add(`Привет${u.name?`, ${u.name}`:""}! Я помогу с ЕНТ/IELTS/SAT и подбором вузов. Выбери подсказку ниже или задай вопрос.`, "bot");
  }

  // Chips → ввести текст и отправить
  if(chips){
    chips.querySelectorAll(".chip").forEach(ch=>{
      ch.addEventListener("click", ()=>{
        i.value = ch.textContent.trim();
        i.focus();
      });
    });
  }

  const send=()=>{
    const t=(i.value||"").trim(); if(!t) return;
    add(t,"me"); i.value="";
    const u=loadUser(); if(!u.firsts?.chat){ u.firsts.chat=true; saveUser(u); addPoints(20); }
    setTimeout(()=>add(demoAIReply(t),"bot"),300);
  };

  s.addEventListener("click",send);
  i.addEventListener("keydown",e=>{ if(e.key==="Enter") send(); });
}

/* ---------- Motivation Letter Wizard (ai.html) ---------- */
function mlWizardHook(){
  const form=document.getElementById('mlForm');
  if(!form) return;

  const out=document.getElementById('mlOutput');
  const btn=form.querySelector('#mlGenerate');
  const btnCopy=document.getElementById('mlCopy');

  btn.addEventListener('click', ()=>{
    const v = (id)=> (form.querySelector('#'+id)?.value||'').trim();
    const data={
      name: v('mlName')||'Имя Фамилия',
      program: v('mlProgram')||'программа',
      uni: v('mlUni')||'университет',
      country: v('mlCountry')||'страна',
      goals: v('mlGoals')||'краткие цели',
      achievements: v('mlAchievements')||'достижения/опыт',
      why: v('mlWhy')||'почему вам подходит программа/университет'
    };
    const letter = makeMotivationLetter(data);
    out.value = letter;
    addPoints(10);
  });

  btnCopy.addEventListener('click', ()=>{
    out.select(); document.execCommand('copy');
    alert('Скопировано в буфер обмена!');
  });

  function makeMotivationLetter(d){
    return `Dear Admissions Committee,

My name is ${d.name}. I am applying to the ${d.program} program at ${d.uni} (${d.country}). 
Over the last years I have focused on ${d.achievements}.

I am particularly motivated to join ${d.uni} because ${d.why}. 
Your curriculum and learning environment align with my goals: ${d.goals}.

I believe my background and motivation will allow me to contribute to the ${d.program} cohort and the wider university community.

Thank you for considering my application.

Sincerely,
${d.name}`;
  }
}

