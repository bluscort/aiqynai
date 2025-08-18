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
