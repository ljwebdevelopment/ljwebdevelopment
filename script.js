const EMAIL_TO = "ljwebdevelopmentok@gmail.com";

/* =========================================================
   Helpers
========================================================= */
function scrollToId(id){
  const el = document.getElementById(id);
  if(!el) return;
  const offset = 78;
  const top = el.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top, behavior: "smooth" });
}

/* =========================================================
   Email Modal (existing)
========================================================= */
// Modal elements
const modalBack = document.getElementById("modalBack");
const closeModalBtn = document.getElementById("closeModal");
const modalSubjectEl = document.getElementById("modalSubject");
const modalMessageEl = document.getElementById("modalMessage");
const toast = document.getElementById("toast");

const openMailAppBtn = document.getElementById("openMailApp");
const openGmailBtn = document.getElementById("openGmail");
const copyMsgBtn = document.getElementById("copyMsg");

let currentSubject = "";
let currentMessagePlain = "";
let currentMessageEncoded = "";

function openEmailModal(subject, messageEncoded){
  currentSubject = subject || "Website Inquiry - Luke Johnson";
  currentMessageEncoded = messageEncoded || "";
  currentMessagePlain = decodeURIComponent((messageEncoded || "").replace(/\+/g, "%20"));

  modalSubjectEl.textContent = currentSubject;
  modalMessageEl.textContent = currentMessagePlain || "Message will be here.";

  toast.style.display = "none";
  modalBack.style.display = "flex";
  modalBack.setAttribute("aria-hidden", "false");
}

function closeModal(){
  modalBack.style.display = "none";
  modalBack.setAttribute("aria-hidden", "true");
}

closeModalBtn?.addEventListener("click", closeModal);
modalBack?.addEventListener("click", (e)=>{ if(e.target === modalBack) closeModal(); });

// Open email app (mailto)
openMailAppBtn?.addEventListener("click", ()=>{
  const url = `mailto:${EMAIL_TO}?subject=${encodeURIComponent(currentSubject)}&body=${currentMessageEncoded}`;
  const a = document.createElement("a");
  a.href = url;
  a.rel = "noopener";
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  a.remove();
});

// Open Gmail compose (fallback)
openGmailBtn?.addEventListener("click", ()=>{
  const gmailUrl =
    "https://mail.google.com/mail/?view=cm&fs=1" +
    `&to=${encodeURIComponent(EMAIL_TO)}` +
    `&su=${encodeURIComponent(currentSubject)}` +
    `&body=${encodeURIComponent(currentMessagePlain)}`;
  window.open(gmailUrl, "_blank", "noopener,noreferrer");
});

// Copy message
copyMsgBtn?.addEventListener("click", async ()=>{
  const full = `To: ${EMAIL_TO}\nSubject: ${currentSubject}\n\n${currentMessagePlain}`;
  try{
    await navigator.clipboard.writeText(full);
    toast.style.display = "block";
  }catch(err){
    const textarea = document.createElement("textarea");
    textarea.value = full;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
    toast.style.display = "block";
  }
});

/* =========================================================
   Login + Dashboard (NEW)
   - Client-side "session" placeholder
========================================================= */
const loginBack = document.getElementById("loginBack");
const closeLoginBtn = document.getElementById("closeLogin");
const loginForm = document.getElementById("loginForm");
const loginMsg = document.getElementById("loginMsg");

const dashSection = document.getElementById("dashboard");
const dashPlan = document.getElementById("dashPlan");
const dashLastUpdate = document.getElementById("dashLastUpdate");

const SESSION_KEY = "ljwd_session_v1";

function openLogin(){
  if(!loginBack) return;
  loginBack.style.display = "flex";
  loginBack.setAttribute("aria-hidden", "false");
  loginMsg && (loginMsg.textContent = "");
}

function closeLogin(){
  if(!loginBack) return;
  loginBack.style.display = "none";
  loginBack.setAttribute("aria-hidden", "true");
}

closeLoginBtn?.addEventListener("click", closeLogin);
loginBack?.addEventListener("click", (e)=>{ if(e.target === loginBack) closeLogin(); });

// Simple session helpers
function setSession(session){
  try{
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }catch(e){}
}
function getSession(){
  try{
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  }catch(e){
    return null;
  }
}
function clearSession(){
  try{ localStorage.removeItem(SESSION_KEY); }catch(e){}
}

function showDashboard(session){
  if(!dashSection) return;
  dashSection.hidden = false;

  // Optional: populate placeholders
  if(dashPlan) dashPlan.textContent = session?.plan || "Support plan";
  if(dashLastUpdate) dashLastUpdate.textContent = session?.lastUpdate || "—";

  // Scroll to dashboard once shown (feels intentional)
  scrollToId("dashboard");
}

function hideDashboard(){
  if(!dashSection) return;
  dashSection.hidden = true;
}

// Called on load
function syncAuthUI(){
  const session = getSession();
  if(session && session.loggedIn){
    showDashboard(session);
  }else{
    hideDashboard();
  }
}

/* =========================================================
   Global click router (UPDATED: added login actions)
========================================================= */
document.addEventListener("click", function(e){
  const t = e.target.closest("[data-action]");
  if(!t) return;

  const action = t.getAttribute("data-action");

  // NEW: login open
  if(action === "open-login"){
    e.preventDefault();
    openLogin();
    return;
  }

  // NEW: demo login
  if(action === "demo-login"){
    e.preventDefault();
    const demo = {
      loggedIn: true,
      email: "demo@client.com",
      plan: "Standard Support",
      lastUpdate: "Not set yet"
    };
    setSession(demo);
    closeLogin();
    syncAuthUI();
    return;
  }

  // NEW: logout
  if(action === "logout"){
    e.preventDefault();
    clearSession();
    hideDashboard();
    // Optional: take them back to top so it feels clean
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  if(action === "scroll"){
    e.preventDefault();
    const target = t.getAttribute("data-target");
    if(target === "top"){ window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    scrollToId(target);
    return;
  }

  if(action === "email"){
    e.preventDefault();
    const subject = t.getAttribute("data-subject") || "Website Inquiry - Luke Johnson";
    const msg = t.getAttribute("data-message") || "";
    openEmailModal(subject, msg);
    return;
  }

  if(action === "plan"){
    e.preventDefault();
    const plan = t.getAttribute("data-plan") || "Support Plan";
    const subject = `Website Build + ${plan}`;
    const msg = encodeURIComponent(
      `Hey Luke,\n\nI would like to talk to you about building a website with the ${plan}.\n\nBusiness name:\nBest contact:\nWhat I need on the website:\n\nThanks!`
    );
    openEmailModal(subject, msg);
    return;
  }

  if(action === "addon"){
    e.preventDefault();
    const addon = t.getAttribute("data-addon") || "Add-on";
    const subject = `Add-on Request - ${addon}`;
    const msg = encodeURIComponent(
      `Hey Luke,\n\nI want to add: ${addon}\n\nBusiness name:\nBest contact:\nDetails:\n\nThanks!`
    );
    openEmailModal(subject, msg);
    return;
  }

  if(action === "build"){
    e.preventDefault();
    scrollToId("contact");
    const subject = "Website Build + Support Plan";
    const msg = encodeURIComponent(
      "Hey Luke,\n\nI would like to talk to you about building a website with a support plan.\n\nBusiness name:\nBest contact:\nWhat I need on the website:\nSupport plan I’m leaning toward (Basic/Standard/Full Service):\n\nThanks!"
    );
    openEmailModal(subject, msg);
    return;
  }
});

/* =========================================================
   Login form submit (NEW)
   - Placeholder validation (client-side only)
========================================================= */
loginForm?.addEventListener("submit", (e)=>{
  e.preventDefault();

  const email = document.getElementById("loginEmail")?.value?.trim() || "";
  const pass = document.getElementById("loginPass")?.value || "";

  // Placeholder rules:
  // - must look like an email
  // - password length >= 4 (just to prevent empty)
  const okEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const okPass = pass.length >= 4;

  if(!okEmail || !okPass){
    if(loginMsg){
      loginMsg.textContent = "Invalid login. Use a real email + a password (4+ characters). Or tap Demo login.";
    }
    return;
  }

  // Create a simple "session"
  const session = {
    loggedIn: true,
    email,
    plan: "Support plan",
    lastUpdate: "—"
  };

  setSession(session);
  closeLogin();
  syncAuthUI();
});

/* =========================================================
   Quick Support (existing)
========================================================= */
document.getElementById("supportBtn")?.addEventListener("click", ()=>{
  const subject = "Quick Support - Luke Johnson";
  const msg = encodeURIComponent(
    "Hey Luke,\n\nI need quick support on my website.\n\nBusiness name:\nWhat’s going on:\nUrgency (today/this week/whenever):\n\nThanks!"
  );
  openEmailModal(subject, msg);
});

/* =========================================================
   Quote form → opens email modal (existing)
========================================================= */
document.getElementById("quoteForm")?.addEventListener("submit", (e)=>{
  e.preventDefault();

  const name = document.getElementById("name")?.value?.trim() || "";
  const biz = document.getElementById("biz")?.value?.trim() || "";
  const need = document.getElementById("need")?.value?.trim() || "";
  const details = document.getElementById("details")?.value?.trim() || "";

  const subject = "Website Build + Support Plan (Quote Request)";
  const body = encodeURIComponent(
    `Hey Luke,\n\nHere’s what I’m looking for:\n\nName: ${name}\nBusiness: ${biz}\nPackage: ${need}\n\nDetails:\n${details}\n\nThanks!`
  );

  openEmailModal(subject, body);
});

/* =========================================================
   Mobile nav toggle (existing)
========================================================= */
const menuBtn = document.getElementById("menuBtn");
const nav = document.getElementById("nav");
if(menuBtn && nav){
  menuBtn.addEventListener("click", function(){
    menuBtn.classList.toggle("active");
    nav.classList.toggle("open");
  });
  nav.querySelectorAll("button").forEach(function(btn){
    btn.addEventListener("click", function(){
      menuBtn.classList.remove("active");
      nav.classList.remove("open");
    });
  });
}

/* =========================================================
   Year (existing)
========================================================= */
const y = document.getElementById("year");
if(y) y.textContent = new Date().getFullYear();

/* =========================================================
   Init
========================================================= */
syncAuthUI();
