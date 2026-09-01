const KEY="buildsync_mvp_v1";
const seed={
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
let db=JSON.parse(localStorage.getItem(KEY)||"null")||seed;
function save(){localStorage.setItem(KEY,JSON.stringify(db));}
const $=s=>document.querySelector(s);
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
function statusClass(s){return s.toLowerCase().replaceAll(" ","-");}
function shell(view){
  $("#app").innerHTML=`<div class="layout">
    <aside><div class="brand"><span>↻</span><b>BuildSync</b></div>
      <p class="muted">${esc(db.user.company)}</p>
      <nav>
        <button data-view="dashboard">Dashboard</button>
        <button data-view="reports">Daily Reports</button>
        <button data-view="projects">Projects</button>
        <button data-view="approvals">Approvals <i>${db.reports.filter(r=>r.status==="Pending Approval").length}</i></button>
        <button data-view="sync">Sync Queue <i>${db.queue.length}</i></button>
      </nav>
      <div class="sidebar-bottom"><small>Logged in as</small><strong>${esc(db.user.name)}</strong><small>${esc(db.user.role)}</small></div>
    </aside>
    <main><header><div><span class="online" id="networkDot"></span> <span id="networkText">Checking connection…</span></div><button class="primary" id="newReport">+ New Site Report</button></header>
    <section class="content" id="content"></section></main>
  </div>`;
  updateNetwork();
  $("#newReport").onclick=()=>showReportForm();
  document.querySelectorAll("[data-view]").forEach(b=>b.onclick=()=>render(b.dataset.view));
  render(view);
}
function render(view="dashboard"){
  const c=$("#content"); if(!c)return;
  if(view==="dashboard") c.innerHTML=dashboard();
  if(view==="reports") c.innerHTML=reports();
  if(view==="projects") c.innerHTML=projects();
  if(view==="approvals") c.innerHTML=approvals();
  if(view==="sync") c.innerHTML=syncQueue();
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
 <form class="panel form" id="reportForm">
 <div class="formgrid"><label>Project<select name="project">${db.projects.map(p=>`<option value="${p.id}">${esc(p.name)}</option>`).join("")}</select></label>
 <label>Date<input name="date" type="date" value="${new Date().toISOString().slice(0,10)}"></label>
 <label>Site team<input name="worker" value="Site Team A" required></label>
 <label>Weather<select name="weather"><option>Sunny</option><option>Cloudy</option><option>Rainy</option><option>Storm</option></select></label>
 <label>Workforce<input name="workforce" type="number" min="0" value="10" required></label>
 <label>Materials received<input name="materials" placeholder="Cement, blocks, steel…"></label></div>
 <label>Work completed<textarea name="work" required placeholder="Describe work completed today…"></textarea></label>
 <label>Issues / delays<textarea name="issues" placeholder="None if there are no issues"></textarea></label>
 <div class="checkline"><label><input type="checkbox" name="safety"> Safety checklist completed</label></div>
 <div class="actions"><button type="button" class="secondary" id="cancelReport">Cancel</button><button class="primary">Save & Submit</button></div>
 </form>`;
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
   document.querySelectorAll("[data-approve]").forEach(b=>b.onclick=()=>{let r=db.reports.find(x=>x.id===b.dataset.approve);r.status="Approved";save();render("approvals")});
   document.querySelectorAll("[data-reject]").forEach(b=>b.onclick=()=>{let r=db.reports.find(x=>x.id===b.dataset.reject);r.status="Changes Requested";save();render("approvals")});
 }
 if(view==="sync")$("#syncBtn")?.addEventListener("click",syncNow);
 if(view==="projects")$("#projectBtn")?.addEventListener("click",()=>alert("Project creation is the next backend-connected module."));
}
function updateNetwork(){
 const online=navigator.onLine; $("#networkDot").className=online?"online":"offline";$("#networkText").textContent=online?"Online · Connected":"Offline · Changes saved locally";
}
function syncNow(){
 if(!navigator.onLine){alert("You are offline. The queue will sync automatically when connection returns.");return}
 db.queue=[];save();shell("sync");
}
window.addEventListener("online",()=>{updateNetwork();if(db.queue.length)syncNow()});
window.addEventListener("offline",updateNetwork);
shell("dashboard");
