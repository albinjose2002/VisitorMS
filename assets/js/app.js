/* -----------------------
   App Shell + Navigation
------------------------ */
const APP = {
  company: "ACME Company",
  user: { name: "Security-01", role: "Security", shift: "Shift A" },
  gates: {
    entry: { id: "GATE_ENTRY", name: "Gate 1 - Entry" },
    exit:  { id: "GATE_EXIT",  name: "Gate 2 - Exit"  }
  },
  // mock state stored in localStorage for nice demo feel
  stateKey: "visitor_ms_state_v1"
};

function todayString(){
  const d = new Date();
  return d.toLocaleDateString(undefined, { weekday:"long", year:"numeric", month:"short", day:"numeric" });
}
function timeString(){
  const d = new Date();
  return d.toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"});
}
function gateLabel(g){
  return g === APP.gates.entry.id ? APP.gates.entry.name : APP.gates.exit.name;
}
function nextPassId(){
  const n = Math.floor(10000 + Math.random() * 90000);
  return `PASS-2026-${String(n).padStart(5,"0")}`;
}

function defaultState(){
  return {
    activeGate: APP.gates.entry.id,
    visitors: [
      { passId:"PASS-2026-00012", name:"Mariyam A M", type:"APPT", host:"Carol Solutions HR", purpose:"Final meeting", valid:"Today", status:"INSIDE", expired:false },
      { passId:"PASS-2026-00015", name:"Rahul N", type:"WALKIN", host:"IT Dept", purpose:"Delivery", valid:"Today", status:"OUTSIDE", expired:false },
      { passId:"PASS-2026-00018", name:"Anjali K", type:"APPT", host:"Admin", purpose:"Interview", valid:"Today", status:"OUTSIDE", expired:false },
      { passId:"PASS-2026-00009", name:"Sameer P", type:"APPT", host:"Finance", purpose:"Meeting", valid:"Today", status:"OUTSIDE", expired:true }
    ],
    appointments: [
      { id:"APT-0001", time:"14:00", name:"Mariyam A M", company:"—", host:"Carol Solutions HR", purpose:"Final meeting", status:"ARRIVED" },
      { id:"APT-0002", time:"15:00", name:"Anjali K", company:"Innotech", host:"Admin", purpose:"Interview", status:"SCHEDULED" },
      { id:"APT-0003", time:"16:00", name:"Vishnu R", company:"Vendor", host:"Procurement", purpose:"Quotation", status:"SCHEDULED" }
    ],
    logs: [
      { time:"13:10", gate:"GATE_ENTRY", action:"IN", passId:"PASS-2026-00012", visitor:"Mariyam A M", security:"Security-01", notes:"QR scanned" },
      { time:"12:50", gate:"GATE_EXIT", action:"OUT", passId:"PASS-2026-00007", visitor:"Joseph S", security:"Security-02", notes:"Checked out" },
      { time:"11:30", gate:"GATE_ENTRY", action:"ALERT", passId:"PASS-2026-00009", visitor:"Sameer P", security:"Security-01", notes:"Expired pass" }
    ]
  };
}

function loadState(){
  const raw = localStorage.getItem(APP.stateKey);
  if (!raw) return defaultState();
  try { return JSON.parse(raw); } catch { return defaultState(); }
}
function saveState(state){
  localStorage.setItem(APP.stateKey, JSON.stringify(state));
}

function badgeLogAction(action){
  if (action === "IN") return `<span class="badge-soft badge-good">Check-in</span>`;
  if (action === "OUT") return `<span class="badge-soft badge-warn">Check-out</span>`;
  return `<span class="badge-soft badge-bad">Alert</span>`;
}
function badgeVisitorStatus(v){
  if (v.expired) return `<span class="badge-soft badge-bad">Expired</span>`;
  if (v.status === "INSIDE") return `<span class="badge-soft badge-good">Inside</span>`;
  return `<span class="badge-soft">Outside</span>`;
}
function badgeApptStatus(s){
  if (s === "ARRIVED") return `<span class="badge-soft badge-good">Arrived</span>`;
  return `<span class="badge-soft badge-warn">Scheduled</span>`;
}

function logEvent(state, action, passId, visitor, notes=""){
  state.logs.unshift({
    time: timeString(),
    gate: state.activeGate,
    action,
    passId,
    visitor,
    security: APP.user.name,
    notes
  });
}

/* -----------------------
   Layout Injection
------------------------ */
function setActiveNav(){
  const file = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  document.querySelectorAll("[data-nav]").forEach(a=>{
    a.classList.toggle("active", a.getAttribute("data-nav") === file);
  });
}

function injectShell(){
  const state = loadState();

  const sidebar = `
  <aside class="col-auto sidebar">
    <div class="glass h-100 p-2 d-flex flex-column">
      <div class="brand">
        <div class="logo"><i class="bi bi-qr-code-scan"></i></div>
        <div>
          <div class="fw-bold">VisitorMS</div>
          <div class="small-note">Gate + QR Pass</div>
        </div>
      </div>

      <div class="px-2 pb-2">
        <div class="pill w-100 justify-content-between">
          <span class="d-inline-flex align-items-center gap-2">
            <i class="bi bi-shield-check"></i>
            <span>${APP.user.role}</span>
          </span>
          <span class="small-note">${APP.user.shift}</span>
        </div>
      </div>

      <div class="px-2 mb-2">
        <label class="small-note mb-1">Active Gate</label>
        <select id="gateSelect" class="form-select">
          <option value="${APP.gates.entry.id}" ${state.activeGate===APP.gates.entry.id?"selected":""}>${APP.gates.entry.name}</option>
          <option value="${APP.gates.exit.id}"  ${state.activeGate===APP.gates.exit.id?"selected":""}>${APP.gates.exit.name}</option>
        </select>
      </div>

      <nav class="nav flex-column px-2 gap-1">
        <a class="nav-link" data-nav="index.html" href="index.html"><i class="bi bi-grid-1x2"></i>Dashboard</a>
        <a class="nav-link" data-nav="scan.html" href="scan.html"><i class="bi bi-qr-code-scan"></i>Scan QR</a>
        <a class="nav-link" data-nav="appointments.html" href="appointments.html"><i class="bi bi-calendar2-check"></i>Appointments</a>
        <a class="nav-link" data-nav="walkin.html" href="walkin.html"><i class="bi bi-person-plus"></i>Walk-in</a>
        <a class="nav-link" data-nav="visitors.html" href="visitors.html"><i class="bi bi-people"></i>Visitors</a>
        <a class="nav-link" data-nav="logs.html" href="logs.html"><i class="bi bi-journal-text"></i>Logs</a>
        <hr class="hr-soft my-2">
        <a class="nav-link" data-nav="settings.html" href="settings.html"><i class="bi bi-gear"></i>Settings</a>
      </nav>

      <div class="mt-auto p-2">
        <div class="glass2 p-3">
          <div class="d-flex align-items-center justify-content-between">
            <div>
              <div class="fw-semibold">Today</div>
              <div class="small-note">${todayString()}</div>
            </div>
            <i class="bi bi-clock-history fs-4"></i>
          </div>
          <hr class="hr-soft my-2">
          <div class="small-note">Tip: Use <b>Scan QR</b> at gates for fastest operation.</div>
        </div>
      </div>
    </div>
  </aside>`;

  const topbar = `
  <div class="topbar">
    <div class="d-flex flex-wrap gap-2 align-items-center justify-content-between">
      <div class="glass px-3 py-2 d-flex align-items-center gap-2">
        <i class="bi bi-building"></i>
        <span class="fw-semibold">${APP.company}</span>
        <span class="muted">| Visitor Management</span>
      </div>

      <div class="d-flex gap-2 align-items-center">
        <div class="pill">
          <i class="bi bi-door-open"></i>
          <span id="gatePill">${gateLabel(state.activeGate)}</span>
        </div>
        <a class="btn btn-accent rounded-4 px-3" href="walkin.html">
          <i class="bi bi-ticket-perforated me-1"></i> Issue Pass
        </a>
        <a class="btn btn-outline-light rounded-4 px-3" href="appointments.html">
          <i class="bi bi-calendar-plus me-1"></i> Appointments
        </a>
      </div>
    </div>
  </div>`;

  document.getElementById("appSidebar").innerHTML = sidebar;
  document.getElementById("appTopbar").innerHTML = topbar;

  // gate change
  const gateSelect = document.getElementById("gateSelect");
  gateSelect?.addEventListener("change", (e)=>{
    const s = loadState();
    s.activeGate = e.target.value;
    saveState(s);
    const pill = document.getElementById("gatePill");
    if (pill) pill.textContent = gateLabel(s.activeGate);
  });

  setActiveNav();
}

/* -----------------------
   Dashboard Charts
------------------------ */
function initDashboardCharts(){
  if (!window.Chart) return;
  const state = loadState();

  // Throughput last 7 hours (mock)
  const labels = ["09:00","10:00","11:00","12:00","13:00","14:00","15:00"];
  const dataIn  = [3,5,2,7,4,6,5];
  const dataOut = [1,2,1,4,3,3,4];

  const ctx1 = document.getElementById("chartThroughput");
  if (ctx1){
    new Chart(ctx1, {
      type: "line",
      data: {
        labels,
        datasets: [
          { label:"Check-ins", data: dataIn, tension: .35 },
          { label:"Check-outs", data: dataOut, tension: .35 }
        ]
      },
      options: {
        plugins: { legend: { labels:{ color:"rgba(255,255,255,.75)" } } },
        scales: {
          x: { ticks: { color:"rgba(255,255,255,.65)" }, grid:{ color:"rgba(255,255,255,.08)" } },
          y: { ticks: { color:"rgba(255,255,255,.65)" }, grid:{ color:"rgba(255,255,255,.08)" } }
        }
      }
    });
  }

  // Visitor mix donut
  const ctx2 = document.getElementById("chartMix");
  if (ctx2){
    const appt = state.visitors.filter(v=>v.type==="APPT").length;
    const walk = state.visitors.filter(v=>v.type==="WALKIN").length;
    new Chart(ctx2, {
      type: "doughnut",
      data: {
        labels: ["Appointments","Walk-ins"],
        datasets: [{ data: [appt, walk] }]
      },
      options: {
        plugins: { legend: { labels:{ color:"rgba(255,255,255,.75)" } } }
      }
    });
  }
}

/* -----------------------
   Page Renderers
------------------------ */
function renderDashboard(){
  const s = loadState();
  const expected = s.appointments.length;
  const inside = s.visitors.filter(v=>v.status==="INSIDE" && !v.expired).length;
  const walkins = s.visitors.filter(v=>v.type==="WALKIN").length;
  const alerts = s.logs.filter(l=>l.action==="ALERT").length;

  const kExpected = document.getElementById("kpiExpected");
  const kInside = document.getElementById("kpiInside");
  const kWalk = document.getElementById("kpiWalkins");
  const kAlerts = document.getElementById("kpiAlerts");
  if (kExpected) kExpected.textContent = expected;
  if (kInside) kInside.textContent = inside;
  if (kWalk) kWalk.textContent = walkins;
  if (kAlerts) kAlerts.textContent = alerts;

  const recent = document.getElementById("recentTable");
  if (recent){
    recent.innerHTML = s.logs.slice(0,6).map(l=>{
      return `
      <tr>
        <td class="muted">${l.time}</td>
        <td class="fw-semibold">${l.visitor}</td>
        <td>${l.gate==="GATE_ENTRY" ? APP.gates.entry.name : APP.gates.exit.name}</td>
        <td>${badgeLogAction(l.action)}</td>
        <td class="muted">${l.notes}</td>
        <td class="text-end">
          <a class="btn btn-sm btn-outline-light rounded-4" href="logs.html">View</a>
        </td>
      </tr>`;
    }).join("") || `<tr><td colspan="6" class="muted">No activity</td></tr>`;
  }
}

function renderAppointments(){
  const s = loadState();
  const tbody = document.getElementById("apptTable");
  if (!tbody) return;

  const q = (document.getElementById("apptSearch")?.value || "").toLowerCase().trim();
  const list = s.appointments.filter(a =>
    !q || (a.name+a.host+a.company+a.purpose).toLowerCase().includes(q)
  );

  tbody.innerHTML = list.map(a=>`
    <tr>
      <td class="muted">${a.time}</td>
      <td class="fw-semibold">${a.name}</td>
      <td class="muted">${a.company || "—"}</td>
      <td>${a.host}</td>
      <td class="muted">${a.purpose}</td>
      <td>${badgeApptStatus(a.status)}</td>
      <td class="text-end">
        <button class="btn btn-sm btn-accent rounded-4" data-issue="${a.id}">
          <i class="bi bi-ticket-perforated me-1"></i>Issue Pass
        </button>
      </td>
    </tr>
  `).join("") || `<tr><td colspan="7" class="muted">No appointments</td></tr>`;

  // Hook Issue buttons → open pass issue section (on this page)
  tbody.querySelectorAll("[data-issue]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const apptId = btn.getAttribute("data-issue");
      const appt = s.appointments.find(x=>x.id===apptId);
      if (!appt) return;

      // prefill quick issue form (exists in appointments.html)
      const name = document.getElementById("pName");
      const host = document.getElementById("pHost");
      const purpose = document.getElementById("pPurpose");
      const type = document.getElementById("pType");
      if (type) type.value = "APPT";
      if (name) name.value = appt.name;
      if (host) host.value = appt.host;
      if (purpose) purpose.value = appt.purpose;

      document.getElementById("issueCard")?.scrollIntoView({ behavior:"smooth", block:"start" });
    });
  });
}

function renderVisitors(){
  const s = loadState();
  const tbody = document.getElementById("visitorsTable");
  if (!tbody) return;

  const mode = document.getElementById("visitorFilter")?.value || "ALL";
  const q = (document.getElementById("visitorSearch")?.value || "").toLowerCase().trim();

  let list = [...s.visitors];
  if (mode==="INSIDE") list = list.filter(v=>v.status==="INSIDE" && !v.expired);
  if (mode==="APPT") list = list.filter(v=>v.type==="APPT");
  if (mode==="WALKIN") list = list.filter(v=>v.type==="WALKIN");
  if (q) list = list.filter(v => (v.passId+v.name+v.host+v.purpose).toLowerCase().includes(q));

  tbody.innerHTML = list.map(v=>`
    <tr>
      <td class="fw-semibold">${v.passId}</td>
      <td>${v.name}</td>
      <td>${v.type==="APPT" ? `<span class="badge-soft">Appointment</span>` : `<span class="badge-soft badge-warn">Walk-in</span>`}</td>
      <td class="muted">${v.host}</td>
      <td class="muted">${v.valid}</td>
      <td>${badgeVisitorStatus(v)}</td>
      <td class="text-end">
        <a class="btn btn-sm btn-outline-light rounded-4" href="scan.html?pass=${encodeURIComponent(v.passId)}">
          Scan
        </a>
      </td>
    </tr>
  `).join("") || `<tr><td colspan="7" class="muted">No visitors</td></tr>`;
}

function renderLogs(){
  const s = loadState();
  const tbody = document.getElementById("logsTable");
  if (!tbody) return;

  const g = document.getElementById("logGateFilter")?.value || "ALL";
  const a = document.getElementById("logActionFilter")?.value || "ALL";

  let list = [...s.logs];
  if (g !== "ALL") list = list.filter(x=>x.gate===g);
  if (a !== "ALL") list = list.filter(x=>x.action===a);

  tbody.innerHTML = list.map(l=>`
    <tr>
      <td class="muted">${l.time}</td>
      <td>${l.gate==="GATE_ENTRY" ? APP.gates.entry.name : APP.gates.exit.name}</td>
      <td>${badgeLogAction(l.action)}</td>
      <td class="fw-semibold">${l.passId}</td>
      <td>${l.visitor}</td>
      <td class="muted">${l.security}</td>
      <td class="muted">${l.notes}</td>
    </tr>
  `).join("") || `<tr><td colspan="7" class="muted">No logs</td></tr>`;
}

function processScan(){
  const s = loadState();
  const token = (document.getElementById("scanInput")?.value || "").trim();
  const result = document.getElementById("scanResult");
  if (!result) return;

  const show = (type, title, details) => {
    const badgeClass = type==="ok" ? "badge-good" : type==="warn" ? "badge-warn" : "badge-bad";
    result.innerHTML = `
      <div class="glass2 p-3">
        <div class="d-flex justify-content-between align-items-center">
          <div class="fw-semibold">${title}</div>
          <span class="badge-soft ${badgeClass}">${type.toUpperCase()}</span>
        </div>
        <div class="small-note mt-2">${details}</div>
      </div>
    `;
  };

  if (!token){
    show("bad","Missing token","Please scan/paste a Pass ID.");
    return;
  }

  const v = s.visitors.find(x=>x.passId===token);
  if (!v){
    show("bad","Pass not found",`No visitor pass exists for <b>${token}</b>.`);
    logEvent(s,"ALERT",token,"Unknown","Invalid pass");
    saveState(s); renderLogs();
    return;
  }

  if (v.expired){
    show("bad","Expired pass",`Pass <b>${v.passId}</b> for <b>${v.name}</b> is expired. Re-issue required.`);
    logEvent(s,"ALERT",v.passId,v.name,"Expired pass used");
    saveState(s);
    return;
  }

  if (s.activeGate === APP.gates.entry.id){
    if (v.status==="INSIDE"){
      show("warn","Already inside",`${v.name} is already inside. Duplicate entry blocked.`);
      logEvent(s,"ALERT",v.passId,v.name,"Duplicate entry attempt");
    } else {
      v.status = "INSIDE";
      show("ok","Check-in successful",`${v.name} checked in at <b>${gateLabel(s.activeGate)}</b>.`);
      logEvent(s,"IN",v.passId,v.name,"QR scanned");
    }
  } else {
    if (v.status!=="INSIDE"){
      show("warn","Not inside",`${v.name} is not marked inside. Exit blocked.`);
      logEvent(s,"ALERT",v.passId,v.name,"Exit without entry");
    } else {
      v.status = "OUTSIDE";
      show("ok","Check-out successful",`${v.name} checked out at <b>${gateLabel(s.activeGate)}</b>.`);
      logEvent(s,"OUT",v.passId,v.name,"QR scanned");
    }
  }

  saveState(s);
}

function issuePassFromForm(){
  const s = loadState();
  const type = document.getElementById("pType")?.value || "WALKIN";
  const name = (document.getElementById("pName")?.value || "").trim() || "Visitor";
  const host = (document.getElementById("pHost")?.value || "").trim() || "—";
  const purpose = (document.getElementById("pPurpose")?.value || "").trim() || "—";
  const passId = nextPassId();

  s.visitors.unshift({
    passId, name, type, host, purpose,
    valid:"Today",
    status:"OUTSIDE",
    expired:false
  });

  logEvent(s,"IN",passId,name,"Pass issued (not checked in)");
  saveState(s);

  const qr = document.getElementById("qrPreview");
  const passLabel = document.getElementById("passIdLabel");
  if (passLabel) passLabel.textContent = passId;
  if (qr && window.QRCode){
    qr.innerHTML = "";
    new QRCode(qr, { text: passId, width:160, height:160 });
  }
}

/* -----------------------
   Boot per page
------------------------ */
document.addEventListener("DOMContentLoaded", ()=>{
  injectShell();

  // page-specific
  const page = document.body.getAttribute("data-page");

  if (page === "dashboard"){
    renderDashboard();
    initDashboardCharts();
  }
  if (page === "appointments"){
    renderAppointments();
    document.getElementById("apptSearch")?.addEventListener("input", renderAppointments);
    document.getElementById("btnIssuePass")?.addEventListener("click", issuePassFromForm);
  }
  if (page === "walkin"){
    document.getElementById("btnIssuePass")?.addEventListener("click", issuePassFromForm);
  }
  if (page === "visitors"){
    renderVisitors();
    document.getElementById("visitorFilter")?.addEventListener("change", renderVisitors);
    document.getElementById("visitorSearch")?.addEventListener("input", renderVisitors);
  }
  if (page === "logs"){
    renderLogs();
    document.getElementById("logGateFilter")?.addEventListener("change", renderLogs);
    document.getElementById("logActionFilter")?.addEventListener("change", renderLogs);
  }
  if (page === "scan"){
    // prefill pass from query
    const params = new URLSearchParams(location.search);
    const pass = params.get("pass");
    if (pass) document.getElementById("scanInput").value = pass;

    document.getElementById("btnProcessScan")?.addEventListener("click", ()=>{
      processScan();
    });
    document.getElementById("btnDemoToken")?.addEventListener("click", ()=>{
      document.getElementById("scanInput").value = "PASS-2026-00018";
    });
  }
});
