import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDdOVoflw125NnxhhmhiSnChZo9nU8INY",
  authDomain: "buildsync-351ed.firebaseapp.com",
  projectId: "buildsync-351ed",
  storageBucket: "buildsync-351ed.firebasestorage.app",
  messagingSenderId: "621257935373",
  appId: "1:621257935373:web:caa15090163873cdcc2344",
  measurementId: "G-42H3JC13F5"
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const KEY = "buildsync_mvp_v1";

const seed = {
  user:{name:"Felix",role:"Project Manager",company:"Nexora Demo Construction"},
  projects:[
    {id:"P-001",name:"Lekki Heights",client:"Prime Build",progress:72,status:"Active"},
    {id:"P-002",name:"Ikeja Commercial Hub",client:"UrbanWorks",progress:38,status:"Active"}
  ],
  reports:[
    {id:"R-1001",project:"P-001",date:"2026-08-31",worker:"Site Team A",weather:"Sunny",work:"Blockwork and reinforcement",workforce:24,issues:"Material delivery delayed",status:"Pending Approval"},
    {id:"R-1000",project:"P-001",date:"2026-08-30",worker:"Site Team A",weather:"Cloudy",work:"Foundation concrete pour",workforce:28,issues:"None",status:"Approved"}
  ],
  approvals:[],
  queue:[]
};

let db = JSON.parse(localStorage.getItem(KEY) || "null") || structuredClone(seed);
const $ = s => document.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
const statusClass = s => String(s || "").toLowerCase().replaceAll(" ","-");
function save(){localStorage.setItem(KEY,JSON.stringify(db));}

function friendlyAuthError(error){
  console.error("Firebase Authentication error:", error);

  const messages = {
    "auth/email-already-in-use":
      "An account already exists with this email address.",

    "auth/invalid-email":
      "Please enter a valid email address.",

    "auth/weak-password":
      "Password is too weak. Use at least 6 characters.",

    "auth/invalid-credential":
      "Email or password is incorrect.",

    "auth/user-not-found":
      "No BuildSync account was found with this email.",

    "auth/wrong-password":
      "Email or password is incorrect.",

    "auth/too-many-requests":
      "Too many attempts. Please wait and try again.",

    "auth/network-request-failed":
      "Network error. Check your internet connection and try again.",

    "auth/unauthorized-domain":
      "This website domain is not authorized in Firebase.",

    "auth/operation-not-allowed":
      "Email/password authentication is not enabled in Firebase."
  };

  return `${messages[error?.code] || "Authentication failed."} (${error?.code || "unknown"})`;
}

function authScreen(mode="login",message=""){
  const login=mode==="login";
  $("#app").innerHTML=`<div class="auth-page">
    <div class="auth-card">
      <div class="auth-brand"><div class="auth-mark">↻</div><div><strong>BuildSync</strong><small>FROM SITE TO OFFICE, INSTANTLY.</small></div></div>
      <div class="auth-heading"><h1>${login?"Welcome back":"Create your BuildSync account"}</h1>
      <p>${login?"Sign in to continue to your construction operations workspace.":"Start managing construction reports and field operations digitally."}</p></div>
      ${message?`<div class="auth-message">${esc(message)}</div>`:""}
      <form id="authForm" class="auth-form">
        ${!login?`<label>Full name<input name="name" type="text" placeholder="Your full name" required></label>
        <label>Company<input name="company" type="text" placeholder="Company name" required></label>`:""}
        <label>Email address<input name="email" type="email" autocomplete="email" placeholder="you@company.com" required></label>
        <label>Password<input name="password" type="password" autocomplete="${login?"current-password":"new-password"}" placeholder="At least 6 characters" minlength="6" required></label>
        <button class="primary auth-submit" type="submit">${login?"Sign In":"Create Account"}</button>
      </form>
      <div class="auth-switch">${login?`Don't have an account? <button id="showSignup" type="button">Create one</button>`:`Already have an account? <button id="showLogin" type="button">Sign in</button>`}</div>
    </div>
  </div>`;

  $("#authForm").onsubmit=async e=>{
    e.preventDefault();
    const button=e.target.querySelector("button[type=submit]");
    button.disabled=true;
    button.textContent=login?"Signing in…":"Creating account…";
    const f=new FormData(e.target);
    const email=String(f.get("email")||"").trim();
    const password=String(f.get("password")||"");
    try{
      if(login){
        await signInWithEmailAndPassword(auth,email,password);
      }else{
        const name=String(f.get("name")||"").trim();
        const company=String(f.get("company")||"").trim();
        const credential=await createUserWithEmailAndPassword(auth,email,password);
        await updateProfile(credential.user,{displayName:name});
        localStorage.setItem(`buildsync_profile_${credential.user.uid}`,JSON.stringify({name,company,role:"Company Admin"}));
      }
    }catch(error){authScreen(mode,friendlyAuthError(error));}
  };
  $("#showSignup")?.addEventListener("click",()=>authScreen("signup"));
  $("#showLogin")?.addEventListener("click",()=>authScreen("login"));
}

function loadUserProfile(user){
  const saved=localStorage.getItem(`buildsync_profile_${user.uid}`);
  if(saved){
    try{
      const p=JSON.parse(saved);
      db.user={name:p.name||user.displayName||user.email?.split("@")[0]||"User",role:p.role||"Company Admin",company:p.company||"BuildSync Workspace"};
      save(); return;
    }catch{}
  }
  db.user={name:user.displayName||user.email?.split("@")[0]||"User",role:"Company Admin",company:"BuildSync Workspace"};
  save();
}

function shell(view){
  $("#app").innerHTML=`<div class="layout">
    <aside><div class="brand"><span>↻</span><b>BuildSync</b></div>
      <p class="muted">${esc(db.user.company)}</p>
      <nav>
        <button data-view="dashboard"><span class="navicon">⌂</span><span class="navlabel">Dashboard</span></button>
        <button data-view="reports"><span class="navicon">▣</span><span class="navlabel">Daily Reports</span></button>
        <button data-view="projects"><span class="navicon">▤</span><span class="navlabel">Projects</span></button>
        <button data-view="approvals"><span class="navicon">✓</span><span class="navlabel">Approvals</span><i>${db.reports.filter(r=>r.status==="Pending Approval").length}</i></button>
        <button data-view="sync"><span class="navicon">↻</span><span class="navlabel">Sync Queue</span><i>${db.queue.length}</i></button>
      </nav>
      <div class="sidebar-bottom"><small>Logged in as</small><strong>${esc(db.user.name)}</strong><small>${esc(db.user.role)}</small><button id="logoutBtn" class="secondary logout-btn">Log out</button></div>
    </aside>
    <main><header><div><span class="online" id="networkDot"></span> <span id="networkText">Checking connection…</span></div><button class="primary" id="newReport">+ New Site Report</button></header>
    <section class="content" id="content"></section></main>
  </div>`;
  updateNetwork();
  $("#newReport").onclick=()=>showReportForm();
  $("#logoutBtn").onclick=()=>signOut(auth);
  document.querySelectorAll("[data-view]").forEach(b=>b.onclick=()=>render(b.dataset.view));
  render(view);
}

function render(view="dashboard"){
  const c=$("#content"); if(!c)return;
  if(view==="dashboard")c.innerHTML=dashboard();
  if(view==="reports")c.innerHTML=reports();
  if(view==="projects")c.innerHTML=projects();
  if(view==="approvals")c.innerHTML=approvals();
  if(view==="sync")c.innerHTML=syncQueue();
  bindContent(view);
}

function dashboard(){
  const pending=db.reports.filter(r=>r.status==="Pending Approval").length;
  return `<div class="title"><div><h1>Operations Dashboard</h1><p>Keep field and office teams in sync.</p></div></div>
  <div class="cards">
    <div class="card"><span>ACTIVE PROJECTS</span><b>${db.projects.length}</b><small>Across your workspace</small></div>
    <div class="card"><span>REPORTS THIS WEEK</span><b>${db.reports.length}</b><small>Digital site reports</small></div>
    <div class="card"><span>PENDING APPROVAL</span><b>${pending}</b><small>Require supervisor action</small></div>
    <div class="card"><span>OFFLINE QUEUE</span><b>${db.queue.length}</b><small>Waiting to synchronize</small></div>
  </div>
  <div class="grid2"><div class="panel"><h2>Project Progress</h2>${db.projects.map(p=>`<div class="progress-row"><div><b>${esc(p.name)}</b><span>${p.progress}%</span></div><div class="bar"><em style="width:${p.progress}%"></em></div></div>`).join("")}</div>
  <div class="panel"><h2>Recent Reports</h2>${db.reports.slice(0,5).map(r=>`<div class="listrow"><div><b>${r.id}</b><small>${esc(r.project)} · ${r.date}</small></div><span class="badge ${statusClass(r.status)}">${esc(r.status)}</span></div>`).join("")}</div></div>`;
}

function reports(){
  return `<div class="title"><div><h1>Daily Site Reports</h1><p>Capture site activity once. Make it visible everywhere.</p></div><button class="primary" id="reportBtn">+ Create Report</button></div>
  <div class="panel tablewrap"><table><thead><tr><th>Report</th><th>Project</th><th>Date</th><th>Workforce</th><th>Status</th></tr></thead><tbody>
  ${db.reports.map(r=>`<tr><td><b>${r.id}</b><small>${esc(r.worker)}</small></td><td>${esc(r.project)}</td><td>${r.date}</td><td>${r.workforce}</td><td><span class="badge ${statusClass(r.status)}">${esc(r.status)}</span></td></tr>`).join("")}</tbody></table></div>`;
}

function projects(){
  return `<div class="title"><div><h1>Projects</h1><p>Monitor construction work from the office.</p></div><button class="primary" id="projectBtn">+ New Project</button></div>
  <div class="projectgrid">${db.projects.map(p=>`<div class="panel project"><span class="badge active">${p.status}</span><h2>${esc(p.name)}</h2><p>${esc(p.client)}</p><div class="bigprogress"><b>${p.progress}%</b><div class="bar"><em style="width:${p.progress}%"></em></div></div><small>Project progress</small></div>`).join("")}</div>`;
}

function approvals(){
  const rows=db.reports.filter(r=>r.status==="Pending Approval");
  return `<div class="title"><div><h1>Approval Queue</h1><p>Review field reports before they become official records.</p></div></div>
  <div class="panel">${rows.length?rows.map(r=>`<div class="approval"><div><b>${r.id} · ${esc(r.project)}</b><p>${esc(r.work)} · ${r.workforce} workers</p><small>${esc(r.issues)}</small></div><div><button class="success" data-approve="${r.id}">Approve</button><button class="danger" data-reject="${r.id}">Request Changes</button></div></div>`).join(""):`<div class="empty">No reports are waiting for approval.</div>`}</div>`;
}

function syncQueue(){
  return `<div class="title"><div><h1>Synchronization</h1><p>Offline-first queue for unreliable site connectivity.</p></div><button class="primary" id="syncBtn">Sync Now</button></div>
  <div class="panel">${db.queue.length?db.queue.map(q=>`<div class="listrow"><div><b>${q.type}</b><small>${q.createdAt}</small></div><span class="badge queued">Queued</span></div>`).join(""):`<div class="empty">Everything is synchronized.</div>`}</div>`;
}

function showReportForm(){
  $("#content").innerHTML=`<div class="title"><div><h1>New Daily Site Report</h1><p>Works offline. Syncs when connectivity returns.</p></div></div>
  <form class="panel form" id="reportForm"><div class="formgrid">
  <label>Project<select name="project">${db.projects.map(p=>`<option value="${p.id}">${esc(p.name)}</option>`).join("")}</select></label>
  <label>Date<input name="date" type="date" value="${new Date().toISOString().slice(0,10)}"></label>
  <label>Site team<input name="worker" value="Site Team A" required></label>
  <label>Weather<select name="weather"><option>Sunny</option><option>Cloudy</option><option>Rainy</option><option>Storm</option></select></label>
  <label>Workforce<input name="workforce" type="number" min="0" value="10" required></label>
  <label>Materials received<input name="materials" placeholder="Cement, blocks, steel…"></label></div>
  <label>Work completed<textarea name="work" required placeholder="Describe work completed today…"></textarea></label>
  <label>Issues / delays<textarea name="issues" placeholder="None if there are no issues"></textarea></label>
  <div class="checkline"><label><input type="checkbox" name="safety"> Safety checklist completed</label></div>
  <div class="actions"><button type="button" class="secondary" id="cancelReport">Cancel</button><button class="primary">Save & Submit</button></div></form>`;
  $("#cancelReport").onclick=()=>render("reports");
  $("#reportForm").onsubmit=e=>{
    e.preventDefault(); const f=new FormData(e.target);
    const report={id:"R-"+Math.floor(1000+Math.random()*8999),project:f.get("project"),date:f.get("date"),worker:f.get("worker"),weather:f.get("weather"),workforce:Number(f.get("workforce")),work:f.get("work"),issues:f.get("issues")||"None",status:"Pending Approval",safety:f.get("safety")==="on"};
    db.reports.unshift(report); db.queue.push({type:"DAILY_REPORT",reportId:report.id,createdAt:new Date().toLocaleString()}); save();
    alert("Report saved locally and added to the sync queue."); shell("reports");
  };
}

function bindContent(view){
  if(view==="reports")$("#reportBtn")?.addEventListener("click",showReportForm);
  if(view==="approvals"){
    document.querySelectorAll("[data-approve]").forEach(b=>b.onclick=()=>{const r=db.reports.find(x=>x.id===b.dataset.approve);if(r)r.status="Approved";save();render("approvals")});
    document.querySelectorAll("[data-reject]").forEach(b=>b.onclick=()=>{const r=db.reports.find(x=>x.id===b.dataset.reject);if(r)r.status="Changes Requested";save();render("approvals")});
  }
  if(view==="sync")$("#syncBtn")?.addEventListener("click",syncNow);
  if(view==="projects")$("#projectBtn")?.addEventListener("click",()=>alert("Project creation is the next backend-connected module."));
}

function updateNetwork(){
  const online=navigator.onLine;
  $("#networkDot").className=online?"online":"offline";
  $("#networkText").textContent=online?"Online · Connected":"Offline · Changes saved locally";
}

function syncNow(){
  if(!navigator.onLine){alert("You are offline. The queue will sync automatically when connection returns.");return;}
  db.queue=[]; save(); shell("sync");
}

window.addEventListener("online",()=>{updateNetwork();if(db.queue.length)syncNow()});
window.addEventListener("offline",updateNetwork);

onAuthStateChanged(auth,user=>{
  if(user){loadUserProfile(user);shell("dashboard");}
  else{authScreen("login");}
});

setPersistence(auth,browserLocalPersistence).catch(()=>{});
