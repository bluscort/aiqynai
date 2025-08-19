// ================================
// AiqynAI — Global Client Script
// (FAB with following chat panel) — FIXED
// ================================

const KEY = "aiqynai_user";

/* ---------- Storage / Points ---------- */
function loadUser(){
  try{
    return JSON.parse(localStorage.getItem(KEY)) || {
      name:"", goal:"", points:0, badges:[], firsts:{chat:false, letter:false}
    };
  }catch(e){
    return { name:"", goal:"", points:0, badges:[], firsts:{chat:false, letter:false} };
  }
}
function saveUser(u){ localStorage.setItem(KEY, JSON.stringify(u)); }
function addPoints(n, reason=""){
  const u = loadUser(); u.points += n;
  const earned=[];
  [{p:50,id:"starter",label:"Starter"},{p:150,id:"explorer",label:"Explorer"},{p:300,id:"achiever",label:"Achiever"}]
    .forEach(t=>{ if(u.points>=t.p && !u.badges.includes(t.id)){ u.badges.push(t.id); earned.push(t.label);} });
  saveUser(u); updatePointsUI(); return earned;
}
function updatePointsUI(){
  const u=loadUser(); const el=document.getElementById("pointsDisplay");
  if(el){ el.textContent=`⭐ ${u.points}`; el.title=`Badges: ${u.badges.join(", ")||"—"}`; }
}
function setName(v){ const u=loadUser(); u.name=String(v||"").trim(); saveUser(u); }
function setGoal(v){ const u=loadUser(); u.goal=String(v||"").trim(); saveUser(u); }

/* ---------- Demo AI ---------- */
function demoAIReply(text){
  const t=(text||"").toLowerCase();
  if(/ент|en[nt]/.test(t))   return "Демо: начни с плана по предметам ЕНТ и решай таймированно. Скоро подключим ИИ.";
  if(/ielts/.test(t))        return "Демо: для IELTS уделяй 60% Writing/Speaking, 40% Reading/Listening.";
  if(/sat/.test(t))          return "Демо: SAT — тренируй Math и читай EBRW ежедневно.";
  if(/универ|univ|вуз/.test(t)) return "Демо: выбери страну/язык/бюджет — бот подскажет список.";
  if(/письм|letter/.test(t)) return "Демо: открой 'Letters' и сгенерируй черновик.";
  return "Демо-ответ: скоро здесь будет настоящий AI‑помощник с разбором и советами.";
}

/* ---------- Init ---------- */
document.addEventListener("DOMContentLoaded", () => {
  updatePointsUI();
  makeHeaderBrandClickable();
  ensureFooterHomeLink();
  injectHeaderRight();        // points + profile (modals)
  injectThemeSwitch();        // iOS-like switch (Light/Dark)
  setupFabAndPanel();         // FAB + following panel (fixed)
});

/* ---------- Header helpers ---------- */
function makeHeaderBrandClickable(){
  const brand=document.querySelector(".site-header .brand");
  if(!brand || brand.dataset.homeBound==="1") return;
  brand.dataset.homeBound="1";
  const goHome=()=>location.href="index.html";
  brand.addEventListener("click",goHome);
  brand.addEventListener("keydown",(e)=>{ if(e.key==="Enter"||e.key===" ") goHome(); });
}
function ensureFooterHomeLink(){
  const footer=document.querySelector(".site-footer");
  if(!footer || footer.querySelector(".home-link")) return;
  const a=document.createElement("a"); a.href="index.html"; a.textContent="AiqynAI"; a.className="home-link"; a.style.fontWeight="700";
  footer.prepend(a, document.createTextNode(" "));
}

/* ---------- Right cluster: Rewards + Profile ---------- */
function injectHeaderRight(){
  const header=document.querySelector(".site-header"); if(!header) return;
  let right=document.querySelector(".header-right"); if(!right){ right=document.createElement("div"); right.className="header-right"; header.appendChild(right); }

  // Points button
  let points=document.getElementById("pointsDisplay");
  if(!points){ points=document.createElement("button"); points.id="pointsDisplay"; points.className="points"; points.type="button"; right.appendChild(points); }
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
          <input id="profGoal" type="text" placeholder="Цель (например: IELTS 7.0 / ЕНТ 120)"/>
          <button class="btn" id="profSave">Сохранить</button>
        </div>
        <p class="hint">Имя и цель используются в приветствиях и планах.</p>
      </div>`;
    document.body.appendChild(m);
  }

  function openModal(id){ document.getElementById(id).classList.add("open"); backdrop.classList.add("open"); }
  function closeModal(){ document.querySelectorAll(".modal.open").forEach(m=>m.classList.remove("open")); backdrop.classList.remove("open"); }

  document.getElementById("pointsDisplay").addEventListener("click", ()=>{ renderRewards(); openModal("rewardsModal"); });
  document.getElementById("profileButton").addEventListener("click", ()=>{
    const u=loadUser(); document.getElementById("profName").value=u.name||""; document.getElementById("profGoal").value=u.goal||""; openModal("profileModal");
  });
  backdrop.addEventListener("click", closeModal);
  document.querySelectorAll(".modal .close").forEach(b=>b.addEventListener("click", closeModal));
  document.getElementById("profSave").addEventListener("click", ()=>{
    setName(document.getElementById("profName").value); setGoal(document.getElementById("profGoal").value);
    addPoints(10,"profile_update"); closeModal();
  });

  function renderRewards(){
    const {badges,points}=loadUser(); const grid=document.getElementById("rewardsGrid"); grid.innerHTML="";
    const items=[{id:"starter",label:"Starter",need:50},{id:"explorer",label:"Explorer",need:150},{id:"achiever",label:"Achiever",need:300}];
    items.forEach(it=>{ const got=badges.includes(it.id); const el=document.createElement("div"); el.className="badge";
      el.innerHTML=`<div>⭐</div><div><strong>${it.label}</strong><div>${got?"получено":"нужно: "+it.need+" очков"}</div></div>`; grid.appendChild(el);});
    const s=document.createElement("div"); s.className="badge"; s.innerHTML=`<div>💠</div><div><strong>Ваши очки</strong><div>${points}</div></div>`; grid.appendChild(s);
  }
}

/* ---------- Theme switch ---------- */
function injectThemeSwitch(){
  const KEY="aiqynai_theme_choice";
  const media=matchMedia("(prefers-color-scheme: dark)");
  const header=document.querySelector(".site-header"); if(!header || header.querySelector(".theme-switch")) return;

  const sw=document.createElement("div"); sw.className="theme-switch"; sw.setAttribute("role","switch"); sw.tabIndex=0;
  const sun=document.createElement("span"); sun.className="icon"; sun.textContent="☀️";
  const moon=document.createElement("span"); moon.className="icon"; moon.textContent="🌙";
  const thumb=document.createElement("div"); thumb.className="thumb"; sw.append(sun,moon,thumb);

  const right=document.querySelector(".header-right")||header; right.appendChild(sw);

  const getSaved=()=>localStorage.getItem(KEY);
  const save=(m)=> m?localStorage.setItem(KEY,m):localStorage.removeItem(KEY);
  const apply=(m)=>{ document.body.classList.remove("theme-light","theme-dark"); if(m==="light") document.body.classList.add("theme-light"); if(m==="dark") document.body.classList.add("theme-dark"); };
  const sys=()=> media.matches?"dark":"light";

  const saved=getSaved();
  if(saved==="light"||saved==="dark"){ apply(saved); sw.dataset.mode=saved; } else { sw.dataset.mode=sys(); }

  function toggle(){ const next=(sw.dataset.mode==="light")?"dark":"light"; sw.dataset.mode=next; save(next); apply(next); }
  sw.addEventListener("click",toggle);
  sw.addEventListener("keydown",(e)=>{ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); toggle(); } });
  media.addEventListener?.("change",()=>{ if(!getSaved()) sw.dataset.mode=sys(); });
}

/* ---------- FAB + FOLLOWING PANEL (fixed) ---------- */
let aiPanelEl=null, aiFabEl=null;

function setupFabAndPanel(){
  const body=document.body;

  // FAB
  if(!document.querySelector(".ai-fab")){
    aiFabEl=document.createElement("button");
    aiFabEl.className="ai-fab"; aiFabEl.type="button"; aiFabEl.innerHTML="<span>AI</span>";
    aiFabEl.style.display="grid"; aiFabEl.style.position="fixed"; aiFabEl.style.right="20px"; aiFabEl.style.bottom="20px";
    body.appendChild(aiFabEl); body.classList.add("ai-ready");

    makeDraggableFab(aiFabEl, ()=>{ if(body.classList.contains("ai-open")) positionPanelNearFab(); });

    aiFabEl.addEventListener("click", ()=>{
      const open=body.classList.toggle("ai-open");
      if(open){
        aiqynClearNotif();
        ensureAIPanel();            // <— создаём панель (не переопределяется!)
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
      <div class="chips" id="aiqyn-fab-chips">
        <div class="chip">План к IELTS 7.0</div>
        <div class="chip">Подбор вузов</div>
        <div class="chip">Чек-лист документов</div>
        <div class="chip">Разбор ошибки ЕНТ</div>
      </div>
      <div class="inputbar">
        <input id="aiqyn-fab-input" type="text" placeholder="Спроси про ЕНТ/IELTS/SAT или вузы..." />
        <button class="btn" id="aiqyn-fab-send">Отправить</button>
      </div>
    </div>`;
  document.body.appendChild(aiPanelEl);

  aiPanelAddMsg(`Привет${loadUser().name?`, ${loadUser().name}`:""}! Это мини‑чат AI. Задай вопрос или выбери подсказку ниже.`,"bot");

  aiPanelEl.querySelector("#aiqyn-fab-close").addEventListener("click", ()=>{
    document.body.classList.remove("ai-open"); aiqynClearNotif();
  });
  aiPanelEl.querySelectorAll("#aiqyn-fab-chips .chip").forEach(ch=>{
    ch.addEventListener("click", ()=>{ const i=document.getElementById("aiqyn-fab-input"); i.value=ch.textContent.trim(); i.focus(); });
  });
  const send=()=>{
    const i=document.getElementById("aiqyn-fab-input"); const text=(i.value||"").trim(); if(!text) return;
    aiPanelAddMsg(text,"me"); i.value="";
    const u=loadUser(); if(!u.firsts?.chat){ u.firsts.chat=true; saveUser(u); addPoints(20,"first_chat"); }
    setTimeout(()=>{ aiPanelAddMsg(demoAIReply(text),"bot"); if(!document.body.classList.contains("ai-open")) aiqynSetNotif(true); },300);
  };
  aiPanelEl.querySelector("#aiqyn-fab-send").addEventListener("click",send);
  aiPanelEl.querySelector("#aiqyn-fab-input").addEventListener("keydown",(e)=>{ if(e.key==="Enter") send(); });

  return aiPanelEl;
}

function aiPanelAddMsg(text, who="bot"){
  const box=document.getElementById("aiqyn-fab-scroll"); if(!box) return;
  const wrap=document.createElement("div"); wrap.className="msg "+(who==="me"?"me":"bot");
  const bubble=document.createElement("div"); bubble.className="bubble"; bubble.textContent=text;
  wrap.appendChild(bubble); box.appendChild(wrap); box.scrollTop=box.scrollHeight;
}

function positionPanelNearFab(animate=false){
  const panel=document.querySelector(".ai-panel"); const fab=document.querySelector(".ai-fab"); if(!panel || !fab) return;
  const fr=fab.getBoundingClientRect();
  const pw=panel.offsetWidth||380, ph=panel.offsetHeight||480;
  const vw=innerWidth, vh=innerHeight;

  // по умолчанию — над FAB, выравнивание справа
  let top = fr.top - ph - 10;
  let left = fr.left - pw + fr.width;

  if(top < 8) top = fr.bottom + 10;           // если места сверху нет — открываем снизу
  if(left + pw > vw - 8) left = vw - pw - 8;  // правый край
  if(left < 8) left = 8;                      // левый край
  if(top + ph > vh - 8) top = Math.max(8, vh - ph - 8); // низ

  panel.style.top = `${Math.round(top)}px`;
  panel.style.left = `${Math.round(left)}px`;

  if(animate){
    panel.style.transform="translateY(8px) scale(.985)";
    requestAnimationFrame(()=>{ panel.style.transform="translateY(0) scale(1)"; });
  }
}

/* ---------- Draggable FAB ---------- */
function makeDraggableFab(el, onMove){
  let dragging=false,sx=0,sy=0,sl=0,st=0;
  const down=(e)=>{ dragging=true; try{el.setPointerCapture(e.pointerId);}catch{} const r=el.getBoundingClientRect();
    el.style.left=r.left+"px"; el.style.top=r.top+"px"; el.style.right="auto"; el.style.bottom="auto";
    sx=e.clientX; sy=e.clientY; sl=parseFloat(el.style.left)||r.left; st=parseFloat(el.style.top)||r.top; };
  const move=(e)=>{ if(!dragging) return; const nl=sl+(e.clientX-sx), nt=st+(e.clientY-sy);
    const vw=innerWidth,vh=innerHeight, sz=el.getBoundingClientRect();
    el.style.left=Math.max(6,Math.min(vw-sz.width-6,nl))+"px";
    el.style.top =Math.max(6,Math.min(vh-sz.height-6,nt))+"px";
    onMove && onMove();
  };
  const up=(e)=>{ dragging=false; try{el.releasePointerCapture(e.pointerId);}catch{} };
  el.addEventListener("pointerdown",down); addEventListener("pointermove",move); addEventListener("pointerup",up);
}

/* ---------- FAB ping helpers ---------- */
function aiqynSetNotif(on=true){ document.querySelector(".ai-fab")?.classList.toggle("has-notif", !!on); }
function aiqynClearNotif(){ aiqynSetNotif(false); }

/* ---------- Inline chat for ai.html (оставляем) ---------- */
(function(){
  const w=document.getElementById("chatWindow");
  const i=document.getElementById("chatInput");
  const s=document.getElementById("chatSend");
  if(!w||!i||!s) return;
  function add(text,who){ const wrap=document.createElement("div"); wrap.className="msg "+(who==="me"?"me":"bot");
    const b=document.createElement("div"); b.className="bubble"; b.textContent=text; wrap.appendChild(b); w.appendChild(wrap); w.scrollTop=w.scrollHeight; }
  function send(){ const t=(i.value||"").trim(); if(!t) return; add(t,"me"); i.value="";
    const u=loadUser(); if(!u.firsts?.chat){ u.firsts.chat=true; saveUser(u); addPoints(20,"first_chat"); }
    setTimeout(()=>add(demoAIReply(t),"bot"),300); }
  s.addEventListener("click",send); i.addEventListener("keydown",(e)=>{ if(e.key==="Enter") send(); });
})();
