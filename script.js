// === AiqynAI basic client state (localStorage) ===
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
    {p:50, id:"starter", label:"Starter"},
    {p:150, id:"explorer", label:"Explorer"},
    {p:300, id:"achiever", label:"Achiever"}
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
  if(el){ el.textContent = `⭐ ${u.points}`; el.title = `Badges: ${u.badges.join(", ")||"—"}`; }
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

// Demo AI reply
function demoAIReply(text){
  const t = text.toLowerCase();
  if(/ент|en[nt]/.test(t)) return "Демо: начни с плана по предметам ЕНТ и решай таймированно. Скоро подключим ИИ.";
  if(/ielts/.test(t)) return "Демо: для IELTS уделяй 60% Writing/Speaking, 40% Reading/Listening. В релизе бот даст разбор.";
  if(/sat/.test(t)) return "Демо: SAT — тренируй Math по темам и читай EBRW каждый день. Скоро будут генераторы.";
  if(/универ|univ|вуз/.test(t)) return "Демо: выбери страну/язык/бюджет — бот подскажет список. В полной версии — персональный подбор.";
  return "Демо-ответ: скоро здесь будет настоящий AI-помощник с разбором и советами.";
}

document.addEventListener("DOMContentLoaded", updatePointsUI);
// ============== AiqynAI: Brand/Home link + Floating AI (no HTML edits) ==============
document.addEventListener("DOMContentLoaded", () => {
  makeHeaderBrandClickable();
  ensureFooterHomeLink();
  injectAIFabAndPanel();
});

/* ——— 1) Лого в шапке = ссылка «Домой» ——— */
function makeHeaderBrandClickable(){
  const brand = document.querySelector(".site-header .brand");
  if(!brand) return;
  // если уже навешено — выходим
  if(brand.dataset.homeBound === "1") return;
  brand.dataset.homeBound = "1";
  brand.style.cursor = "pointer";
  brand.tabIndex = 0;
  brand.setAttribute("role", "link");
  brand.setAttribute("aria-label", "Go to Home");
  const goHome = (e) => {
    // не ломаем клик по навигации рядом
    if(e && e.target && e.target.closest && e.target.closest(".nav")) return;
    window.location.href = "index.html";
  };
  brand.addEventListener("click", goHome);
  brand.addEventListener("keydown", (e)=>{ if(e.key === "Enter" || e.key === " ") goHome(e); });
}

/* ——— 2) Ссылка «AiqynAI → Home» в футере ——— */
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
  // вставим в начало футера
  footer.prepend(a, document.createTextNode(" "));
}

/* ——— 3) Плавающая кнопка AI + мини-панель чата ——— */
function injectAIFabAndPanel(){
  const body = document.body;
  // Создаём FAB, если ещё нет
  if(!document.querySelector(".ai-fab")){
    const fab = document.createElement("button");
    fab.className = "ai-fab";
    fab.type = "button";
    fab.innerHTML = "<span>AI</span>";
    body.appendChild(fab);
    body.classList.add("ai-ready");

    // Перетаскивание FAB (desktop/mobile)
    makeDraggableFab(fab);

    // Щёлк — открыть/закрыть панель
    fab.addEventListener("click", () => {
      const open = body.classList.toggle("ai-open");
      if(open){
        ensureAIPanel(); // лениво создаём при первом открытии
        setTimeout(()=> {
          const input = document.getElementById("aiqyn-fab-input");
          if(input) input.focus();
        }, 0);
      }
    });
  }
}

/* Создание панели чата один раз */
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

  // Приветствие
  const u = loadUser();
  aiPanelAddMsg(`Привет${u.name?`, ${u.name}`:""}! Это мини-чат AI. Задай вопрос или выбери подсказку ниже.`, "bot");

  // Закрыть
  panel.querySelector("#aiqyn-fab-close").addEventListener("click", ()=>{
    document.body.classList.remove("ai-open");
  });

  // Chips → вставить быстрые запросы
  panel.querySelectorAll("#aiqyn-fab-chips .chip").forEach(ch=>{
    ch.addEventListener("click", ()=>{
      const input = document.getElementById("aiqyn-fab-input");
      input.value = ch.textContent.trim();
      input.focus();
    });
  });

  // Отправка
  const sendBtn = panel.querySelector("#aiqyn-fab-send");
  const inputEl = panel.querySelector("#aiqyn-fab-input");
  const onSend = ()=>{
    const text = (inputEl.value || "").trim();
    if(!text) return;
    aiPanelAddMsg(text, "me");
    inputEl.value = "";

    // +20 очков за первый чат (если ещё не было)
    const u = loadUser();
    if(!u.firsts.chat){
      u.firsts.chat = true;
      saveUser(u);
      addPoints(20, "first_chat");
    }

    // Демо-ответ (переиспользуем логику)
    setTimeout(()=>{
      aiPanelAddMsg(demoAIReply(text), "bot");
    }, 300);
  };
  sendBtn.addEventListener("click", onSend);
  inputEl.addEventListener("keydown", (e)=>{ if(e.key === "Enter") onSend(); });
}

/* Добавление сообщений в мини-чат */
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

/* Перетаскивание FAB */
function makeDraggableFab(el){
  let dragging = false, startX=0, startY=0, startLeft=0, startTop=0;

  const onPointerDown = (e)=>{
    dragging = true;
    el.setPointerCapture(e.pointerId);
    const rect = el.getBoundingClientRect();
    startX = e.clientX; startY = e.clientY;
    // переводим позиционирование на top/left для перетаскивания
    const cur = el.getBoundingClientRect();
    el.style.left = cur.left + "px";
    el.style.top  = cur.top  + "px";
    el.style.right = "auto";
    el.style.bottom = "auto";
    startLeft = parseFloat(el.style.left) || cur.left;
    startTop  = parseFloat(el.style.top)  || cur.top;
  };

  const onPointerMove = (e)=>{
    if(!dragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    const nl = startLeft + dx;
    const nt = startTop  + dy;
    // границы вьюпорта
    const vw = window.innerWidth, vh = window.innerHeight;
    const size = el.getBoundingClientRect();
    const clampedL = Math.max(6, Math.min(vw - size.width - 6, nl));
    const clampedT = Math.max(6, Math.min(vh - size.height - 6, nt));
    el.style.left = clampedL + "px";
    el.style.top  = clampedT + "px";
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

