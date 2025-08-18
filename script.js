// ================================
// AiqynAI — Global Client Script
// ================================

// ---- User state in localStorage ----
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

  // thresholds → auto-badges
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

  saveUser(u);
  updatePointsUI();
  return earned;
}

function updatePointsUI(){
  const u = loadUser();
  const el = document.getElementById("pointsDisplay");
  if(el){
    el.textContent = `⭐ ${u.points}`;
    el.title = `Badges: ${u.badges.join(", ") || "—"}`;
  }
}

function setName(name){
  const u = loadUser();
  u.name = String(name||"").trim();
  saveUser(u);
  updatePointsUI();
}
function setGoal(goal){
  const u = loadUser();
  u.goal = String(goal||"").trim();
  saveUser(u);
  updatePointsUI();
}

// ---- Demo AI reply router (placeholder) ----
function demoAIReply(text){
  const t = (text||"").toLowerCase();
  if(/ент|en[nt]/.test(t))   return "Демо: начни с плана по предметам ЕНТ и решай таймированно. Скоро подключим ИИ.";
  if(/ielts/.test(t))        return "Демо: для IELTS уделяй 60% Writing/Speaking, 40% Reading/Listening. В релизе бот даст разбор.";
  if(/sat/.test(t))          return "Демо: SAT — тренируй Math по темам и читай EBRW каждый день. Скоро будут генераторы.";
  if(/универ|univ|вуз/.test(t)) return "Демо: выбери страну/язык/бюджет — бот подскажет список. В полной версии — персональный подбор.";
  if(/письм|letter/.test(t)) return "Демо: открой 'Letters' и сгенерируй черновик; дальше подключим ИИ-редактор.";
  return "Демо-ответ: скоро здесь будет настоящий AI-помощник с разбором и советами.";
}

// ---- Init basic UI on page load ----
document.addEventListener("DOMContentLoaded", () => {
  updatePointsUI();
  makeHeaderBrandClickable();
  ensureFooterHomeLink();
  injectAIFabAndPanel();
});

// ===============================
// Enhancements (no HTML editing)
// ===============================

// 1) Header brand → go Home
function makeHeaderBrandClickable(){
  const brand = document.querySelector(".site-header .brand");
  if(!brand) return;
  if(brand.dataset.homeBound === "1") return;
  brand.dataset.homeBound = "1";
  brand.style.cursor = "pointer";
  brand.tabIndex = 0;
  brand.setAttribute("role", "link");
  brand.setAttribute("aria-label", "Go to Home");
  const goHome = (e) => {
    if(e && e.target && e.target.closest && e.target.closest(".nav")) return;
    window.location.href = "index.html";
  };
  brand.addEventListener("click", goHome);
  brand.addEventListener("keydown", (e)=>{ if(e.key === "Enter" || e.key === " ") goHome(e); });
}

// 2) Footer: prepend "AiqynAI" → Home
function ensureFooterHomeLink(){
  const footer = document.querySelector(".site-footer");
  if(!footer) return;
  if(footer.querySelector(".home-link")) return;
  const a = document.createElement("a");
  a.href = "index.html";
  a.textContent = "AiqynAI";
  a.className = "home-link";
  a.style.marginRight = "6px";
  a.style.fontWeight = "700";
  footer.prepend(a, document.createTextNode(" "));
}

// 3) Floating AI Button (FAB) + mini chat panel
function injectAIFabAndPanel(){
  const body = document.body;

  if(!document.querySelector(".ai-fab")){
    const fab = document.createElement("button");
    fab.className = "ai-fab";
    fab.type = "button";
    fab.innerHTML = "<span>AI</span>";

    // show it even if CSS rule is missing
    fab.style.display = "grid";
    fab.style.position = "fixed";
    fab.style.right = "20px";
    fab.style.bottom = "20px";

    body.appendChild(fab);
    body.classList.add("ai-ready"); // for CSS styling if present

    makeDraggableFab(fab);

    fab.addEventListener("click", () => {
      const open = body.classList.toggle("ai-open");
      if(open){
        aiqynClearNotif();          // remove ping on open
        ensureAIPanel();            // lazy-create panel
        setTimeout(()=>{
          const input = document.getElementById("aiqyn-fab-input");
          if(input) input.focus();
        }, 0);
      }
    });
  }
}

// Create mini chat panel once (lazy)
function ensureAIPanel(){
  if(document.querySelector(".ai-panel")) return;

  const panel = document.createElement("section");
  panel.className = "ai-panel";
  panel.innerHTML = `
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

  // Greeting
  const u = loadUser();
  aiPanelAddMsg(`Привет${u.name?`, ${u.name}`:""}! Это мини-чат AI. Задай вопрос или выбери подсказку ниже.`, "bot");

  // Close panel
  panel.querySelector("#aiqyn-fab-close").addEventListener("click", ()=>{
    document.body.classList.remove("ai-open");
    aiqynClearNotif();
  });

  // Chips → quick fill
  panel.querySelectorAll("#aiqyn-fab-chips .chip").forEach(ch=>{
    ch.addEventListener("click", ()=>{
      const input = document.getElementById("aiqyn-fab-input");
      input.value = ch.textContent.trim();
      input.focus();
    });
  });

  // Send logic
  const sendBtn = panel.querySelector("#aiqyn-fab-send");
  const inputEl = panel.querySelector("#aiqyn-fab-input");
  const onSend = ()=>{
    const text = (inputEl.value || "").trim();
    if(!text) return;
    aiPanelAddMsg(text, "me");
    inputEl.value = "";

    // +20 points on first chat ever
    const u = loadUser();
    if(!u.firsts.chat){
      u.firsts.chat = true;
      saveUser(u);
      addPoints(20, "first_chat");
    }

    // Demo answer & notif
    setTimeout(()=>{
      aiPanelAddMsg(demoAIReply(text), "bot");
      if(!document.body.classList.contains("ai-open")){
        aiqynSetNotif(true); // show ping if panel is closed
      }
    }, 300);
  };
  sendBtn.addEventListener("click", onSend);
  inputEl.addEventListener("keydown", (e)=>{ if(e.key === "Enter") onSend(); });
}

// Add message to FAB panel
function aiPanelAddMsg(text, who="bot"){
  const box = document.getElementById("aiqyn-fab-scroll");
  if(!box) return;
  const wrap = document.createElement("div");
  wrap.className = "msg " + (who === "me" ? "me" : "bot");
  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = text;
  wrap.appendChild(bubble);
  box.appendChild(wrap);
  box.scrollTop = box.scrollHeight;
}

// Draggable FAB
function makeDraggableFab(el){
  let dragging = false, startX=0, startY=0, startLeft=0, startTop=0;

  const onPointerDown = (e)=>{
    dragging = true;
    try{ el.setPointerCapture(e.pointerId); }catch(_){}
    const cur = el.getBoundingClientRect();
    el.style.left   = cur.left + "px";
    el.style.top    = cur.top  + "px";
    el.style.right  = "auto";
    el.style.bottom = "auto";
    startX = e.clientX; startY = e.clientY;
    startLeft = parseFloat(el.style.left) || cur.left;
    startTop  = parseFloat(el.style.top)  || cur.top;
  };

  const onPointerMove = (e)=>{
    if(!dragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    const nl = startLeft + dx;
    const nt = startTop  + dy;

    // viewport clamp
    const vw = window.innerWidth, vh = window.innerHeight;
    const sz = el.getBoundingClientRect();
    const cl = Math.max(6, Math.min(vw - sz.width - 6, nl));
    const ct = Math.max(6, Math.min(vh - sz.height - 6, nt));
    el.style.left = cl + "px";
    el.style.top  = ct + "px";
  };

  const onPointerUp = (e)=>{
    dragging = false;
    try{ el.releasePointerCapture(e.pointerId); }catch(_){}
  };

  el.style.position = "fixed";
  el.style.right = "20px";
  el.style.bottom = "20px";
  el.addEventListener("pointerdown", onPointerDown);
  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", onPointerUp);
}

// FAB notification ping helpers
function aiqynSetNotif(on=true){
  const fab = document.querySelector(".ai-fab");
  if(!fab) return;
  fab.classList.toggle("has-notif", !!on);
}
function aiqynClearNotif(){ aiqynSetNotif(false); }

