// ================================
// AiqynAI — Global Client Script
// ================================

const KEY = "aiqynai_user";

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
function getUser(){ return loadUser(); }

function addPoints(n, reason=""){
  const u = loadUser();
  u.points += n;
  const earned = [];
  const thresholds = [
    {p:50,  id:"starter",  label:"Starter"},
    {p:150, id:"explorer", label:"Explorer"},
    {p:300, id:"achiever", label:"Achiever"},
  ];
  thresholds.forEach(t=>{
    if(u.points>=t.p && !u.badges.includes(t.id)){
      u.badges.push(t.id);
      earned.push(t.label);
    }
  });
  saveUser(u); updatePointsUI(); return earned;
}

function updatePointsUI(){
  const u = loadUser();
  const el = document.getElementById("pointsDisplay");
  if(el){
    el.textContent = `⭐ ${u.points}`;
    el.title = `Badges: ${u.badges.join(", ") || "—"}`;
  }
}

function setName(name){ const u=loadUser(); u.name=String(name||"").trim(); saveUser(u); }
function setGoal(goal){ const u=loadUser(); u.goal=String(goal||"").trim(); saveUser(u); }

// ---- Demo AI reply router (placeholder) ----
function demoAIReply(text){
  const t = (text||"").toLowerCase();
  if(/ент|en[nt]/.test(t))   return "Демо: начни с плана по предметам ЕНТ и решай таймированно. Скоро подключим ИИ.";
  if(/ielts/.test(t))        return "Демо: для IELTS уделяй 60% Writing/Speaking, 40% Reading/Listening. В релизе бот даст разбор.";
  if(/sat/.test(t))          return "Демо: SAT — тренируй Math и читай EBRW ежедневно. Скоро будут генераторы.";
  if(/универ|univ|вуз/.test(t)) return "Демо: выбери страну/язык/бюджет — бот подскажет список. В полной версии — персональный подбор.";
  if(/письм|letter/.test(t)) return "Демо: открой 'Letters' и сгенерируй черновик; дальше подключим ИИ-редактор.";
  return "Демо-ответ: скоро здесь будет настоящий AI-помощник с разбором и советами.";
}

// ---- Init ----
document.addEventListener("DOMContentLoaded", () => {
  updatePointsUI();
  makeHeaderBrandClickable();
  ensureFooterHomeLink();
  injectAIFabAndPanel();
  injectThemeSwitch();         // iOS-like switch (Light/Dark)
  injectProfileAndRewards();   // модалки Профиль/Награды
});

// ===== Header interactions =====
function makeHeaderBrandClickable(){
  const brand = document.querySelector(".site-header .brand");
  if(!brand || brand.dataset.homeBound==="1") return;
  brand.dataset.homeBound="1";
  const goHome=()=>location.href="index.html";
  brand.addEventListener("click", goHome);
  brand.addEventListener("keydown",(e)=>{ if(e.key==="Enter"||e.key===" ") goHome(); });
}

function ensureFooterHomeLink(){
  const footer = document.querySelector(".site-footer");
  if(!footer || footer.querySelector(".home-link")) return;
  const a = document.createElement("a");
  a.href = "index.html"; a.textContent="AiqynAI"; a.className="home-link"; a.style.fontWeight="700";
  footer.prepend(a, document.createTextNode(" "));
}

// ===== FAB + mini chat =====
function injectAIFabAndPanel(){
  const body = document.body;
  if(!document.querySelector(".ai-fab")){
    const fab = document.createElement("button");
    fab.className = "ai-fab"; fab.type = "button"; fab.innerHTML = "<span>AI</span>";
    fab.style.display="grid"; fab.style.position="fixed"; fab.style.right="20px"; fab.style.bottom="20px";
    body.appendChild(fab); body.classList.add("ai-ready");
    makeDraggableFab(fab);
    fab.addEventListener("click", () => {
      const open = body.classList.toggle("ai-open");
      if(open){
        aiqynClearNotif(); ensureAIPanel();
        setTimeout(()=>{ document.getElementById("aiqyn-fab-input")?.focus(); }, 0);
      }
    });
  }
}

function ensureAIPanel(){
  if(document.querySelector(".ai-panel")) return;
  const panel = document.createElement("section");
  panel.className="ai-panel";
  panel.innerHTML=`
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
    </div>
  `;
  document.body.appendChild(panel);

  const u = loadUser();
  aiPanelAddMsg(`Привет${u.name?`, ${u.name}`:""}! Это мини-чат AI. Задай вопрос или выбери подсказку ниже.`, "bot");

  panel.querySelector("#aiqyn-fab-close").addEventListener("click", ()=>{
    document.body.classList.remove("ai-open"); aiqynClearNotif();
  });

  panel.querySelectorAll("#aiqyn-fab-chips .chip").forEach(ch=>{
    ch.addEventListener("click", ()=>{
      const input = document.getElementById("aiqyn-fab-input");
      input.value = ch.textContent.trim(); input.focus();
    });
  });

  const send=()=>{
    const inputEl = document.getElementById("aiqyn-fab-input");
    const text = (inputEl.value||"").trim();
    if(!text) return;
    aiPanelAddMsg(text,"me"); inputEl.value="";
    const u = loadUser();
    if(!u.firsts.chat){ u.firsts.chat=true; saveUser(u); addPoints(20,"first_chat"); }
    setTimeout(()=>{
      aiPanelAddMsg(demoAIReply(text),"bot");
      if(!document.body.classList.contains("ai-open")) aiqynSetNotif(true);
    },300);
  };
  panel.querySelector("#aiqyn-fab-send").addEventListener("click", send);
  panel.querySelector("#aiqyn-fab-input").addEventListener("keydown",(e)=>{ if(e.key==="Enter") send(); });
}

function aiPanelAddMsg(text, who="bot"){
  const box=document.getElementById("aiqyn-fab-scroll"); if(!box) return;
  const wrap=document.createElement("div"); wrap.className="msg " + (who==="me"?"me":"bot");
  const bubble=document.createElement("div"); bubble.className="bubble"; bubble.textContent=text;
  wrap.appendChild(bubble); box.appendChild(wrap); box.scrollTop = box.scrollHeight;
}

function makeDraggableFab(el){
  let dragging=false,sx=0,sy=0,sl=0,st=0;
  const down=(e)=>{ dragging=true; try{el.setPointerCapture(e.pointerId);}catch{} const r=el.getBoundingClientRect();
    el.style.left=r.left+"px"; el.style.top=r.top+"px"; el.style.right="auto"; el.style.bottom="auto";
    sx=e.clientX; sy=e.clientY; sl=parseFloat(el.style.left)||r.left; st=parseFloat(el.style.top)||r.top; };
  const move=(e)=>{ if(!dragging) return; const nl=sl+(e.clientX-sx), nt=st+(e.clientY-sy);
    const vw=innerWidth,vh=innerHeight, sz=el.getBoundingClientRect();
    el.style.left=Math.max(6,Math.min(vw-sz.width-6,nl))+"px";
    el.style.top =Math.max(6,Math.min(vh-sz.height-6,nt))+"px"; };
  const up = (e)=>{ dragging=false; try{el.releasePointerCapture(e.pointerId);}catch{} };
  el.addEventListener("pointerdown",down); addEventListener("pointermove",move); addEventListener("pointerup",up);
}

function aiqynSetNotif(on=true){ document.querySelector(".ai-fab")?.classList.toggle("has-notif", !!on); }
function aiqynClearNotif(){ aiqynSetNotif(false); }

// ===== Theme switch (Light/Dark only; default System) =====
function injectThemeSwitch(){
  const KEY="aiqynai_theme_choice"; // "light" | "dark" | null
  const media=matchMedia("(prefers-color-scheme: dark)");

  const header=document.querySelector(".site-header"); if(!header || header.querySelector(".theme-switch")) return;

  const sw=document.createElement("div"); sw.className="theme-switch"; sw.setAttribute("role","switch"); sw.tabIndex=0;
  const sun=document.createElement("span"); sun.className="icon"; sun.textContent="☀️";
  const moon=document.createElement("span"); moon.className="icon"; moon.textContent="🌙";
  const thumb=document.createElement("div"); thumb.className="thumb";
  sw.append(sun,moon,thumb);

  // place to right cluster
  const right = document.querySelector(".header-right") || header;
  right.appendChild(sw);

  const getSaved=()=>localStorage.getItem(KEY);
  const save=(m)=> m?localStorage.setItem(KEY,m):localStorage.removeItem(KEY);
  const apply=(m)=>{ document.body.classList.remove("theme-light","theme-dark"); if(m==="light") document.body.classList.add("theme-light"); if(m==="dark") document.body.classList.add("theme-dark"); };
  const sys=()=> media.matches ? "dark" : "light";

  const saved=getSaved();
  if(saved==="light"||saved==="dark"){ apply(saved); sw.dataset.mode=saved; }
  else { sw.dataset.mode=sys(); } // UI only

  function toggle(){ const next=(sw.dataset.mode==="light")?"dark":"light"; sw.dataset.mode=next; save(next); apply(next); }
  sw.addEventListener("click",toggle);
  sw.addEventListener("keydown",(e)=>{ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); toggle(); } });
  media.addEventListener?.("change",()=>{ if(!getSaved()) sw.dataset.mode=sys(); });
}

// ===== Profile & Rewards (modals) =====
function injectProfileAndRewards(){
  // Ensure header-right cluster exists & buttons IDs are present
  const header = document.querySelector(".site-header");
  if(!header) return;
  let right = document.querySelector(".header-right");
  if(!right){ right = document.createElement("div"); right.className="header-right"; header.appendChild(right); }

  // Rewards button (pointsDisplay) — clickable
  let points = document.getElementById("pointsDisplay");
  if(!points){
    points = document.createElement("button");
    points.id="pointsDisplay"; points.className="points"; points.type="button"; points.title="Награды";
    right.appendChild(points);
  }
  updatePointsUI();

  // Profile icon button
  if(!document.getElementById("profileButton")){
    const btn = document.createElement("button");
    btn.id="profileButton"; btn.className="icon-btn"; btn.type="button"; btn.title="Профиль";
    btn.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 12c2.9 0 5-2.1 5-5s-2.1-5-5-5-5 2.1-5 5 2.1 5 5 5zm0 2c-4 0-8 2-8 6v2h16v-2c0-4-4-6-8-6z"/></svg>`;
    right.appendChild(btn);
  }

  // Backdrop + modals
  if(!document.querySelector(".modal-backdrop")){
    const back = document.createElement("div"); back.className="modal-backdrop"; document.body.appendChild(back);
  }
  const backdrop = document.querySelector(".modal-backdrop");

  // Rewards modal
  if(!document.getElementById("rewardsModal")){
    const m = document.createElement("section");
    m.className="modal"; m.id="rewardsModal";
    m.innerHTML = `
      <header><h3>Награды</h3><button class="close" data-close="rewardsModal">Закрыть</button></header>
      <div class="rewards-grid" id="rewardsGrid"></div>
    `;
    document.body.appendChild(m);
  }

  // Profile modal
  if(!document.getElementById("profileModal")){
    const m = document.createElement("section");
    m.className="modal"; m.id="profileModal";
    m.innerHTML = `
      <header><h3>Профиль</h3><button class="close" data-close="profileModal">Закрыть</button></header>
      <div class="profile-form">
        <div class="row">
          <input id="profName" type="text" placeholder="Ваше имя" />
          <input id="profGoal" type="text" placeholder="Цель (например: IELTS 7.0 / ЕНТ 120)" />
          <button class="btn" id="profSave">Сохранить</button>
        </div>
        <p class="hint">Имя и цель используются в приветствиях и планах.</p>
      </div>
    `;
    document.body.appendChild(m);
  }

  // Open/close helpers
  function openModal(id){ document.getElementById(id).classList.add("open"); backdrop.classList.add("open"); }
  function closeModal(){ document.querySelectorAll(".modal.open").forEach(m=>m.classList.remove("open")); backdrop.classList.remove("open"); }

  // Bind buttons
  document.getElementById("pointsDisplay").addEventListener("click", ()=>{
    renderRewards(); openModal("rewardsModal");
  });
  document.getElementById("profileButton").addEventListener("click", ()=>{
    const u=loadUser(); document.getElementById("profName").value=u.name||""; document.getElementById("profGoal").value=u.goal||"";
    openModal("profileModal");
  });

  // Close hooks
  backdrop.addEventListener("click", closeModal);
  document.querySelectorAll(".modal .close").forEach(b=> b.addEventListener("click", closeModal));

  // Save profile
  document.getElementById("profSave").addEventListener("click", ()=>{
    setName(document.getElementById("profName").value);
    setGoal(document.getElementById("profGoal").value);
    addPoints(10,"profile_update"); // маленький бонус
    closeModal();
  });

  function renderRewards(){
    const {badges, points} = loadUser();
    const grid = document.getElementById("rewardsGrid");
    grid.innerHTML = "";
    const items = [
      {id:"starter",  label:"Starter",  need:50},
      {id:"explorer", label:"Explorer", need:150},
      {id:"achiever", label:"Achiever", need:300},
    ];
    items.forEach(it=>{
      const got = badges.includes(it.id);
      const el = document.createElement("div");
      el.className = "badge";
      el.innerHTML = `<div>⭐</div><div><strong>${it.label}</strong><div>${got?"получено":"нужно: "+it.need+" очков"}</div></div>`;
      grid.appendChild(el);
    });
    // summary item
    const s = document.createElement("div");
    s.className="badge"; s.innerHTML=`<div>💠</div><div><strong>Ваши очки</strong><div>${points}</div></div>`;
    grid.appendChild(s);
  }
}

// ============== THE END ==============
