/* =========================================================================
   script.js — logic การแสดงผลและการโต้ตอบทั้งหมด
   ข้อมูลเนื้อหาทั้งหมดอยู่ใน data.js และ quiz.js (ไฟล์นี้ไม่เก็บเนื้อหา)

   สารบัญ:
     0) ตัวช่วยทั่วไป
     1) ธีมสว่าง/มืด
     2) Navigation แบบ SPA + progress bar
     3) หน้า Overview  (ตารางเทียบโมเดล)
     4) หน้า OSI 7 Layers (stack แบบคลิกได้ + mnemonic)
     5) หน้า Encapsulation Animation
     6) หน้า Protocols & Ports (ค้นหา + filter)
     7) หน้า Quiz (+ localStorage)
     8) หน้า Flashcards
     9) หน้า Cheat Sheet + ปุ่มพิมพ์
   ========================================================================= */

/* ---------- 0) ตัวช่วยทั่วไป ---------- */
const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/** หาสีประจำชั้นจากหมายเลข layer */
const layerColor = (n) => (OSI_LAYERS.find(l => l.num === n) || {}).color || "#64748b";
/** หาชื่อชั้นจากหมายเลข layer */
const layerName  = (n) => (OSI_LAYERS.find(l => l.num === n) || {}).name || "-";
/** สลับลำดับสมาชิกใน array (Fisher–Yates) โดยไม่แก้ array ต้นฉบับ */
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
/** ป้องกัน HTML injection เวลาเอาข้อความจากข้อมูลมาต่อเป็น innerHTML */
function esc(s) {
  return String(s).replace(/[&<>"']/g, c => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));
}

/* ---------- 1) ธีมสว่าง / มืด ---------- */
const THEME_KEY = "osi_theme";

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  $("#themeIcon").textContent = theme === "dark" ? "🌙" : "☀️";
  localStorage.setItem(THEME_KEY, theme);
}

function initTheme() {
  // ถ้าเคยเลือกไว้ให้ใช้ค่านั้น ถ้าไม่เคยให้ตามการตั้งค่าของระบบ
  const saved = localStorage.getItem(THEME_KEY);
  const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
  applyTheme(saved || (prefersLight ? "light" : "dark"));

  $("#themeToggle").addEventListener("click", () => {
    const now = document.documentElement.getAttribute("data-theme");
    applyTheme(now === "dark" ? "light" : "dark");
  });
}

/* ---------- 2) Navigation แบบ SPA + progress bar ---------- */
const PAGES = ["overview", "layers", "encap", "devices", "addressing", "nettypes", "protocols", "quiz", "flashcards", "cheatsheet"];
const VISIT_KEY = "osi_visited";
let visited = new Set(JSON.parse(localStorage.getItem(VISIT_KEY) || '["overview"]'));

/** อัปเดตแถบ progress ด้านบนตามจำนวนหน้าที่เคยเข้าไปดูแล้ว */
function updateProgress() {
  const pct = (visited.size / PAGES.length) * 100;
  $("#progressFill").style.width = pct + "%";
  localStorage.setItem(VISIT_KEY, JSON.stringify(Array.from(visited)));
}

/** สลับไปยัง section ที่ต้องการโดยไม่ reload หน้า */
function goto(id) {
  if (!PAGES.includes(id)) return;

  $$(".page").forEach(p => p.classList.toggle("is-active", p.id === id));
  $$(".nav-link").forEach(b => b.classList.toggle("is-active", b.dataset.target === id));

  visited.add(id);
  updateProgress();

  // ปิดเมนูบนมือถือหลังเลือกหน้า
  $("#mainNav").classList.remove("open");
  $("#navToggle").setAttribute("aria-expanded", "false");

  window.scrollTo({ top: 0, behavior: "smooth" });
  history.replaceState(null, "", "#" + id);
}

function initNav() {
  $$(".nav-link").forEach(btn => btn.addEventListener("click", () => goto(btn.dataset.target)));
  // ปุ่มลัดที่ฝังอยู่ในเนื้อหา เช่น "ไปหน้า 7 Layers"
  $$("[data-goto]").forEach(btn => btn.addEventListener("click", () => goto(btn.dataset.goto)));

  $("#navToggle").addEventListener("click", () => {
    const nav = $("#mainNav");
    const open = nav.classList.toggle("open");
    $("#navToggle").setAttribute("aria-expanded", String(open));
  });

  // เปิดหน้าตาม hash ที่ติดมากับ URL (เช่น index.html#quiz)
  const hash = location.hash.replace("#", "");
  if (PAGES.includes(hash)) goto(hash); else updateProgress();
}

/* ---------- 3) หน้า Overview: ตารางเทียบ OSI กับ TCP/IP ---------- */
function renderCompare() {
  const tbody = $("#compareTable tbody");
  tbody.innerHTML = MODEL_COMPARE.map(row => `
    <tr>
      <td class="tcpip-cell" style="--rowc:${row.color}">${esc(row.tcpip)}</td>
      <td>
        <div class="osi-list">
          ${row.osi.map(o => `<span class="osi-pill">${esc(o)}</span>`).join("")}
        </div>
      </td>
      <td class="mono" style="font-size:.82rem">${esc(row.proto)}</td>
      <td class="muted">${esc(row.note)}</td>
    </tr>
  `).join("");
}

/* ---------- 4) หน้า OSI 7 Layers ---------- */

/** กล่อง mnemonic ช่วยจำ — จับคู่คำแรกของแต่ละคำกับชื่อชั้น */
function renderMnemonics() {
  const box = $("#mnemonicBox");
  const cards = MNEMONICS.map(m => `
    <div class="mnemo">
      <div class="dir">${esc(m.dir)}</div>
      <div class="phrase">${esc(m.phrase)}</div>
      <div class="pairs">
        ${m.words.map((w, i) => `<span class="pair"><b>${esc(w[0])}</b>${esc(w.slice(1))} = ${esc(m.layers[i])}</span>`).join("")}
      </div>
    </div>
  `).join("");

  const pduCard = `
    <div class="mnemo">
      <div class="dir">จำ PDU จากล่างขึ้นบน</div>
      <div class="phrase">${esc(PDU_MNEMONIC.phrase)}</div>
      <p class="muted" style="margin:0">${esc(PDU_MNEMONIC.note)}</p>
    </div>`;

  box.innerHTML = cards + pduCard;
}

/** สร้าง stack 7 ชั้นแบบคลิกกางได้ */
function renderLayers() {
  const stack = $("#layerStack");

  stack.innerHTML = OSI_LAYERS.map(l => `
    <article class="layer" style="--lc:${l.color}" data-layer="${l.num}">
      <button class="layer-head" aria-expanded="false">
        <span class="layer-num">${l.num}</span>
        <span class="layer-title">
          <span class="ln">${esc(l.name)}<span class="lt">${esc(l.thai)}</span></span>
          <span class="ls">${esc(l.short)}</span>
        </span>
        <span class="layer-pdu">PDU: ${esc(l.pdu)}</span>
        <span class="layer-caret">▼</span>
      </button>
      <div class="layer-body"><div>
        <div class="layer-detail">
          <p class="fn">${esc(l.func)}</p>
          <div class="detail-grid">
            <div class="detail-box">
              <h5>PDU</h5>
              <div class="tag-list"><span class="tag">${esc(l.pdu)}</span></div>
            </div>
            <div class="detail-box">
              <h5>Protocol / เทคโนโลยี</h5>
              <div class="tag-list">${l.protocols.map(p => `<span class="tag">${esc(p)}</span>`).join("")}</div>
            </div>
            <div class="detail-box">
              <h5>Device ที่เกี่ยวข้อง</h5>
              <div class="tag-list">${l.devices.map(d => `<span class="tag">${esc(d)}</span>`).join("")}</div>
            </div>
          </div>
          <div class="remember-line"><b>เทคนิคจำ:</b> ${esc(l.remember)}</div>
        </div>
      </div></div>
    </article>
  `).join("");

  // คลิกที่หัวชั้นเพื่อกาง/พับ
  $$(".layer-head", stack).forEach(head => {
    head.addEventListener("click", () => {
      const layer = head.closest(".layer");
      const open = layer.classList.toggle("open");
      head.setAttribute("aria-expanded", String(open));
    });
  });

  $("#expandAll").addEventListener("click", () => {
    $$(".layer", stack).forEach(l => l.classList.add("open"));
    $$(".layer-head", stack).forEach(h => h.setAttribute("aria-expanded", "true"));
  });
  $("#collapseAll").addEventListener("click", () => {
    $$(".layer", stack).forEach(l => l.classList.remove("open"));
    $$(".layer-head", stack).forEach(h => h.setAttribute("aria-expanded", "false"));
  });
}

/* ---------- 5) หน้า Encapsulation Animation (ฉบับละเอียด A → Switch → Router → B) ---------- */
const en = {
  steps: [],        // ชุดขั้นตอนของโหมดที่เลือกอยู่ (สร้างจาก buildEncapSteps)
  idx: -1,          // ขั้นปัจจุบัน (-1 = ยังไม่เริ่ม)
  timer: null,
  playing: false,
  speed: 1800,      // มิลลิวินาทีต่อขั้น
  mode: "tcp"       // tcp | udp
};

/** วาดผังเส้นทาง Computer A → Switch → Router → Computer B */
function buildNetPath() {
  const html = [];
  NET_PATH.forEach((n, i) => {
    // แทรกเส้นลิงก์ระหว่างอุปกรณ์ (link1, link2, link3)
    if (i > 0) html.push(`<div class="np-link" data-link="link${i}"><span class="np-dot"></span></div>`);
    html.push(`
      <div class="np-node" data-dev="${n.id}" style="--lc:${layerColor(n.layer)}">
        <span class="np-ico">${n.icon}</span>
        <span class="np-name">${esc(n.label)}</span>
        <span class="np-sub">${esc(n.sub)}</span>
      </div>`);
  });
  $("#netPath").innerHTML = html.join("");
}

/** วาดกอง 7 ชั้นของทั้งสองเครื่อง */
function buildEnStacks() {
  const html = OSI_LAYERS.map(l => `
    <div class="hl" style="--lc:${l.color}" data-l="${l.num}">
      <span class="hl-n">${l.num}</span><span>${esc(l.name)}</span>
    </div>`).join("");
  $("#enStackA").innerHTML = html;
  $("#enStackB").innerHTML = html;
}

/** สร้าง HTML ตารางรายละเอียดของ header ที่กำลังถูกเพิ่มหรืออ่าน */
function fieldsHtml(f) {
  if (!f) return "";
  return `
    <div class="fields-card">
      <div class="fields-title">${esc(f.title)}</div>
      <table class="fields-tbl"><tbody>
        ${f.rows.map(r => `<tr><td>${esc(r[0])}</td><td class="mono">${esc(r[1])}</td></tr>`).join("")}
      </tbody></table>
    </div>`;
}

/** ไฮไลต์กอง layer ของทั้งสองเครื่อง และอุปกรณ์บนเส้นทาง */
function highlightEn(step) {
  $$("#enStackA .hl, #enStackB .hl").forEach(el => el.classList.remove("active", "done"));
  $$(".np-node").forEach(el => el.classList.remove("active", "done"));
  $$(".np-link").forEach(el => el.classList.remove("travel"));
  if (!step) return;

  const A = $$("#enStackA .hl"), B = $$("#enStackB .hl");

  if (step.side === "A") {
    // ฝั่งส่งไล่จากบนลงล่าง ชั้นที่อยู่เหนือกว่าถือว่าผ่านมาแล้ว
    A.forEach(el => {
      const n = +el.dataset.l;
      if (n === step.layer) el.classList.add("active");
      else if (n > step.layer) el.classList.add("done");
    });
  } else if (step.side === "B") {
    A.forEach(el => el.classList.add("done"));
    B.forEach(el => {
      const n = +el.dataset.l;
      if (n === step.layer) el.classList.add("active");
      else if (n < step.layer) el.classList.add("done");
    });
  } else {
    // ระหว่างทาง (บนสาย หรืออยู่ที่อุปกรณ์กลาง) ฝั่งส่งถือว่าทำงานครบแล้ว
    A.forEach(el => el.classList.add("done"));
  }

  // ไฮไลต์อุปกรณ์บนเส้นทาง และทำเครื่องหมายอุปกรณ์ที่ผ่านมาแล้ว
  const order = NET_PATH.map(n => n.id);
  const cur = order.indexOf(step.device);
  $$(".np-node").forEach(el => {
    const i = order.indexOf(el.dataset.dev);
    if (i === cur) el.classList.add("active");
    else if (i < cur) el.classList.add("done");
  });

  // จุดสัญญาณวิ่งบนลิงก์ที่กำลังใช้งาน
  if (step.wire) {
    const link = $(`.np-link[data-link="${step.wire}"]`);
    if (link) { void link.offsetWidth; link.classList.add("travel"); }
  }
}

/** แสดงผลขั้นที่ i */
function renderEnStep(i) {
  en.idx = i;
  const step = en.steps[i];

  if (!step) {
    $("#enPduLabel").textContent = "PDU: —";
    $("#enBlocks").innerHTML = "";
    $("#enFields").innerHTML = "";
    $("#enExplain").innerHTML = "<h4>พร้อมเริ่มแล้ว</h4><p>กด “เล่น” เพื่อดูทั้งกระบวนการรวดเดียว หรือกด “ทีละขั้น” เพื่อเดินเองช้า ๆ</p>";
    $("#enCount").textContent = `ขั้นที่ 0 / ${en.steps.length}`;
    $("#enProgressFill").style.width = "0%";
    highlightEn(null);
    return;
  }

  $("#enPduLabel").textContent = "PDU: " + step.pdu;

  // วาดกล่องข้อมูลใหม่ทุกครั้ง เพื่อให้ animation ตอนบล็อกโผล่ทำงานซ้ำได้
  $("#enBlocks").innerHTML = step.parts
    .map((p, k) => `<span class="blk ${p.k}" style="animation-delay:${k * 55}ms">${esc(p.t)}</span>`).join("");

  // ใส่คลาสบอกทิศทางว่ากล่องกำลังโตขึ้นหรือเล็กลง
  const box = $("#enBlocks");
  box.classList.remove("growing", "shrinking");
  if (step.act === "add" || step.act === "rebuild") box.classList.add("growing");
  if (step.act === "strip") box.classList.add("shrinking");

  $("#enFields").innerHTML = fieldsHtml(step.fields);
  $("#enExplain").innerHTML = `<h4>${esc(step.title)}</h4><p>${esc(step.desc)}</p>`;
  $("#enCount").textContent = `ขั้นที่ ${i + 1} / ${en.steps.length}`;
  $("#enProgressFill").style.width = ((i + 1) / en.steps.length * 100) + "%";

  highlightEn(step);
}

function enNext() {
  if (en.idx < en.steps.length - 1) { renderEnStep(en.idx + 1); return true; }
  enPause();            // ถึงขั้นสุดท้ายแล้วหยุดเอง
  return false;
}

function enPlay() {
  if (en.playing) return;
  if (en.idx >= en.steps.length - 1) renderEnStep(-1);   // เล่นจบแล้วกดเล่นอีก = เริ่มใหม่

  en.playing = true;
  $("#enPlay").disabled = true;
  $("#enPause").disabled = false;

  enNext();
  en.timer = setInterval(enNext, en.speed);
}

function enPause() {
  en.playing = false;
  clearInterval(en.timer);
  en.timer = null;
  $("#enPlay").disabled = false;
  $("#enPause").disabled = true;
}

/** สลับโหมด TCP / UDP แล้วสร้างชุดขั้นตอนใหม่ */
function setEncapMode(mode) {
  en.mode = mode;
  en.steps = buildEncapSteps(mode);
  enPause();
  renderEnStep(-1);

  $$("#tpToggle .seg-btn").forEach(b => b.classList.toggle("is-active", b.dataset.mode === mode));
  $("#tpNote").textContent = mode === "tcp"
    ? "TCP ห่อเป็น Segment มี Sequence, ACK และ Flags ครบ จึงเชื่อถือได้แต่ header ใหญ่ 20–60 ไบต์"
    : "UDP ห่อเป็น Datagram มีแค่ Port, Length, Checksum จึงเบามาก header คงที่ 8 ไบต์ แต่ไม่รับประกันว่าถึง";
}

/** ตารางสรุป PDU และสิ่งที่อยู่ข้างในแต่ละชั้น (ท้ายบท) */
function renderPduInside() {
  $("#pduInsideTable tbody").innerHTML = PDU_INSIDE.map(r => `
    <tr>
      <td class="lcell" style="--lc:${layerColor(r.layer)}">L${r.layer} — ${esc(layerName(r.layer))}</td>
      <td><b>${esc(r.pdu)}</b></td>
      <td class="muted">${esc(r.header)}</td>
      <td class="muted">${esc(r.inside)}</td>
      <td><b>${esc(r.addr)}</b></td>
    </tr>
  `).join("");
}

function initEncap() {
  buildNetPath();
  buildEnStacks();
  renderPduInside();
  setEncapMode("tcp");

  $("#enPlay").addEventListener("click", enPlay);
  $("#enPause").addEventListener("click", enPause);
  $("#enNext").addEventListener("click", () => { enPause(); enNext(); });
  $("#enPrev").addEventListener("click", () => {
    enPause();
    renderEnStep(en.idx > 0 ? en.idx - 1 : -1);
  });
  $("#enReset").addEventListener("click", () => { enPause(); renderEnStep(-1); });

  $$("#tpToggle .seg-btn").forEach(b => b.addEventListener("click", () => setEncapMode(b.dataset.mode)));

  const slider = $("#enSpeed");
  const showSpeed = () => { $("#enSpeedVal").textContent = (en.speed / 1000).toFixed(1) + " วิ/ขั้น"; };
  showSpeed();
  slider.addEventListener("input", () => {
    en.speed = +slider.value;
    showSpeed();
    if (en.playing) { enPause(); enPlay(); }   // เริ่มจับเวลาใหม่ด้วยความเร็วใหม่ทันที
  });
}

/* ---------- 6) หน้า Protocols & Ports ---------- */
let protoFilterLayer = "all";

/** วาดตารางโปรโตคอลตามคำค้นและชั้นที่เลือก */
function renderProtocols() {
  const q = $("#protoSearch").value.trim().toLowerCase();

  const rows = PROTOCOLS.filter(p => {
    const matchLayer = protoFilterLayer === "all" || String(p.layer) === protoFilterLayer;
    if (!matchLayer) return false;
    if (!q) return true;
    // ค้นได้ทั้งชื่อย่อ ชื่อเต็ม พอร์ต โปรโตคอลขนส่ง คำอธิบาย และเลขชั้น
    const hay = `${p.name} ${p.full} ${p.port} ${p.tp} ${p.desc} layer${p.layer} l${p.layer}`.toLowerCase();
    return hay.includes(q);
  });

  $("#protoCount").textContent = `พบ ${rows.length} รายการ จากทั้งหมด ${PROTOCOLS.length} รายการ`;

  const tbody = $("#protoBody");
  if (!rows.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="no-result">ไม่พบโปรโตคอลที่ตรงกับคำค้น ลองพิมพ์คำอื่นดูนะ</td></tr>`;
    return;
  }

  tbody.innerHTML = rows.map(p => `
    <tr>
      <td class="pname">${esc(p.name)}</td>
      <td class="muted">${esc(p.full)}</td>
      <td><span class="lbadge" style="background:${layerColor(p.layer)}">L${p.layer}</span></td>
      <td class="pport">${esc(p.port)}</td>
      <td><span class="tp-badge">${esc(p.tp)}</span></td>
      <td class="muted">${esc(p.desc)}</td>
    </tr>
  `).join("");
}

function renderTcpUdp() {
  $("#tcpUdpBody").innerHTML = TCP_UDP.map(r => `
    <tr>
      <td><b>${esc(r.topic)}</b></td>
      <td>${esc(r.tcp)}</td>
      <td>${esc(r.udp)}</td>
    </tr>
  `).join("");
}

function initProtocols() {
  renderProtocols();
  renderTcpUdp();

  $("#protoSearch").addEventListener("input", renderProtocols);
  $$("#layerChips .chip").forEach(chip => {
    chip.addEventListener("click", () => {
      $$("#layerChips .chip").forEach(c => c.classList.remove("is-active"));
      chip.classList.add("is-active");
      protoFilterLayer = chip.dataset.layer;
      renderProtocols();
    });
  });
}

/* ---------- 7) หน้า Quiz ---------- */
const STATS_KEY = "osi_quiz_stats";

const quizState = {
  items: [],       // ชุดข้อสอบของรอบนี้ (อาจถูกสลับลำดับแล้ว)
  cur: 0,
  score: 0,
  locked: false,   // ตอบข้อนี้ไปแล้วหรือยัง
  wrong: [],       // เก็บข้อที่ตอบผิดไว้ทบทวนตอนจบ
  byCat: {}        // สถิติแยกตามหมวด { cat: {right, total} }
};

/** อ่านสถิติที่เคยบันทึกไว้ */
function loadStats() {
  try { return JSON.parse(localStorage.getItem(STATS_KEY)) || null; }
  catch { return null; }
}

/** บันทึกผลรอบล่าสุด พร้อมอัปเดตคะแนนสูงสุดและจำนวนครั้งที่ทำ */
function saveStats(score, total) {
  const prev = loadStats() || { attempts: 0, best: 0 };
  const pct = Math.round(score / total * 100);
  const data = {
    attempts: prev.attempts + 1,
    best: Math.max(prev.best || 0, pct),
    last: pct,
    lastRaw: `${score}/${total}`,
    date: new Date().toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })
  };
  localStorage.setItem(STATS_KEY, JSON.stringify(data));
  renderStats();
}

/** แสดงการ์ดสถิติในหน้าเริ่มต้นของ quiz */
function renderStats() {
  const s = loadStats();
  const box = $("#quizStats");
  if (!s) {
    box.innerHTML = `<div class="stat" style="grid-column:1/-1"><div class="sl">ยังไม่มีสถิติ — ลองทำแบบทดสอบครั้งแรกดู</div></div>`;
    return;
  }
  box.innerHTML = `
    <div class="stat"><div class="sv">${s.last}%</div><div class="sl">คะแนนล่าสุด (${esc(s.lastRaw || "-")})</div></div>
    <div class="stat"><div class="sv">${s.best}%</div><div class="sl">คะแนนสูงสุด</div></div>
    <div class="stat"><div class="sv">${s.attempts}</div><div class="sl">จำนวนครั้งที่ทำ</div></div>
    <div class="stat"><div class="sv" style="font-size:.95rem">${esc(s.date || "-")}</div><div class="sl">ทำล่าสุดเมื่อ</div></div>
  `;
}

/** เริ่มทำแบบทดสอบรอบใหม่ */
function startQuiz() {
  const doShuffle = $("#shuffleQuiz").checked;

  // ถ้าเลือกสลับ ให้สลับทั้งลำดับข้อและลำดับตัวเลือก (พร้อมย้าย index คำตอบตาม)
  quizState.items = (doShuffle ? shuffle(QUIZ) : QUIZ.slice()).map(item => {
    if (!doShuffle) return { ...item, choices: item.choices.slice() };
    const correctText = item.choices[item.answer];
    const newChoices = shuffle(item.choices);
    return { ...item, choices: newChoices, answer: newChoices.indexOf(correctText) };
  });

  quizState.cur = 0;
  quizState.score = 0;
  quizState.locked = false;
  quizState.wrong = [];
  quizState.byCat = {};

  $("#quizStart").classList.add("hidden");
  $("#quizResult").classList.add("hidden");
  $("#quizPlay").classList.remove("hidden");
  renderQuestion();
}

/** วาดคำถามข้อปัจจุบัน */
function renderQuestion() {
  const q = quizState.items[quizState.cur];
  quizState.locked = false;

  $("#qIndex").textContent = `ข้อ ${quizState.cur + 1} / ${quizState.items.length}`;
  $("#qCat").textContent = q.cat;
  $("#qScore").textContent = `ถูก ${quizState.score}`;
  $("#quizBarFill").style.width = (quizState.cur / quizState.items.length * 100) + "%";
  $("#qText").textContent = q.q;

  $("#qChoices").innerHTML = q.choices.map((c, i) => `
    <button class="choice" data-i="${i}">
      <span class="ck">${String.fromCharCode(65 + i)}</span>
      <span>${esc(c)}</span>
    </button>
  `).join("");

  $$("#qChoices .choice").forEach(btn => btn.addEventListener("click", () => answer(+btn.dataset.i)));

  $("#qFeedback").className = "feedback hidden";
  $("#nextQ").disabled = true;
  $("#nextQ").textContent = quizState.cur === quizState.items.length - 1 ? "ดูผลคะแนน →" : "ข้อถัดไป →";
}

/** ประมวลผลคำตอบที่ผู้ใช้เลือก */
function answer(picked) {
  if (quizState.locked) return;
  quizState.locked = true;

  const q = quizState.items[quizState.cur];
  const correct = picked === q.answer;

  // นับสถิติรายหมวด
  if (!quizState.byCat[q.cat]) quizState.byCat[q.cat] = { right: 0, total: 0 };
  quizState.byCat[q.cat].total++;
  if (correct) quizState.byCat[q.cat].right++;

  if (correct) {
    quizState.score++;
  } else {
    quizState.wrong.push({ q: q.q, picked: q.choices[picked], correct: q.choices[q.answer], why: q.why });
  }

  // ระบายสีตัวเลือก: เขียว = ถูก, แดง = ที่เลือกผิด, ที่เหลือจาง
  $$("#qChoices .choice").forEach(btn => {
    const i = +btn.dataset.i;
    btn.disabled = true;
    if (i === q.answer) btn.classList.add("correct");
    else if (i === picked) btn.classList.add("wrong");
    else btn.classList.add("dim");
  });

  const fb = $("#qFeedback");
  fb.className = "feedback " + (correct ? "ok" : "bad");
  $("#fbHead").textContent = correct ? "✅ ถูกต้อง!" : "❌ ยังไม่ถูก";
  $("#fbWhy").textContent = q.why;

  $("#qScore").textContent = `ถูก ${quizState.score}`;
  $("#nextQ").disabled = false;
}

/** ไปข้อถัดไป หรือจบแล้วไปหน้าสรุปผล */
function nextQuestion() {
  if (quizState.cur < quizState.items.length - 1) {
    quizState.cur++;
    renderQuestion();
  } else {
    finishQuiz();
  }
}

/** สรุปผลคะแนนทั้งรอบ */
function finishQuiz() {
  const total = quizState.items.length;
  const score = quizState.score;
  const pct = Math.round(score / total * 100);

  $("#quizPlay").classList.add("hidden");
  $("#quizResult").classList.remove("hidden");

  $("#scoreRing").style.setProperty("--pct", pct);
  $("#scorePct").textContent = pct + "%";
  $("#scoreRaw").textContent = `${score} / ${total}`;

  // ข้อความสรุปตามช่วงคะแนน
  let verdict, advice;
  if (pct >= 90)      { verdict = "🏆 เก่งมาก พร้อมสอบแล้ว";      advice = "แม่นทุกหัวข้อ เหลือแค่ทวน Flashcards เบา ๆ ก่อนเข้าห้องสอบ"; }
  else if (pct >= 75) { verdict = "👍 ดีแล้ว เหลืออีกนิดเดียว";    advice = "กลับไปอ่านหัวข้อที่ยังพลาด แล้วลองทำใหม่อีกรอบให้เกิน 90%"; }
  else if (pct >= 50) { verdict = "📖 พอไปได้ แต่ต้องทวนอีก";      advice = "แนะนำให้กลับไปหน้า 7 Layers และ Cheat Sheet ทบทวนเรื่อง PDU กับอุปกรณ์ประจำชั้น"; }
  else                { verdict = "💪 เริ่มต้นใหม่อีกครั้ง";        advice = "ลองไล่อ่านหน้าภาพรวมและ 7 Layers ให้ครบก่อน แล้วค่อยกลับมาทำใหม่"; }

  $("#scoreVerdict").textContent = verdict;
  $("#scoreAdvice").textContent = advice;

  // แถบสรุปคะแนนแยกตามหมวด
  $("#catBreakdown").innerHTML = Object.entries(quizState.byCat).map(([cat, v]) => {
    const p = Math.round(v.right / v.total * 100);
    return `
      <div class="cat-row">
        <span class="cname">${esc(cat)}</span>
        <span class="cbar"><i style="width:${p}%;background:${p >= 70 ? "var(--ok)" : p >= 40 ? "var(--warn)" : "var(--bad)"}"></i></span>
        <span class="cnum">${v.right}/${v.total}</span>
      </div>`;
  }).join("");

  // เตรียมรายการข้อที่ตอบผิดไว้ (ซ่อนไว้ก่อน กดปุ่มถึงจะเปิด)
  const wl = $("#wrongList");
  wl.classList.add("hidden");
  $("#reviewWrong").disabled = quizState.wrong.length === 0;
  $("#reviewWrong").textContent = quizState.wrong.length
    ? `ดูข้อที่ตอบผิด (${quizState.wrong.length})`
    : "ตอบถูกทุกข้อ 🎉";

  wl.innerHTML = quizState.wrong.map(w => `
    <div class="wrong-item">
      <div class="wq">${esc(w.q)}</div>
      <div class="wa">คุณตอบ: <b class="bad">${esc(w.picked)}</b></div>
      <div class="wa">คำตอบที่ถูก: <b class="ok">${esc(w.correct)}</b></div>
      <div class="wa muted">${esc(w.why)}</div>
    </div>
  `).join("");

  saveStats(score, total);
}

function initQuiz() {
  $("#quizTotalNum").textContent = QUIZ.length;
  renderStats();

  $("#startQuiz").addEventListener("click", startQuiz);
  $("#retryQuiz").addEventListener("click", startQuiz);
  $("#nextQ").addEventListener("click", nextQuestion);

  $("#quitQuiz").addEventListener("click", () => {
    $("#quizPlay").classList.add("hidden");
    $("#quizStart").classList.remove("hidden");
  });

  $("#reviewWrong").addEventListener("click", () => $("#wrongList").classList.toggle("hidden"));

  $("#clearStats").addEventListener("click", () => {
    localStorage.removeItem(STATS_KEY);
    renderStats();
  });
}

/* ---------- 8) หน้า Flashcards ---------- */
const fc = { deck: FLASHCARDS.slice(), i: 0 };

function renderCard() {
  const card = fc.deck[fc.i];
  const el = $("#flashcard");

  el.classList.remove("flipped");          // เปลี่ยนการ์ดใหม่ให้กลับมาโชว์ด้านหน้าเสมอ
  $("#fcTag").textContent = card.tag;
  $("#fcQuestion").textContent = card.q;
  $("#fcAnswer").textContent = card.a;
  $("#fcCounter").textContent = `${fc.i + 1} / ${fc.deck.length}`;
  $("#fcProgressFill").style.width = ((fc.i + 1) / fc.deck.length * 100) + "%";
}

/** เลื่อนการ์ด (วนกลับต้น/ท้ายได้) */
function moveCard(delta) {
  fc.i = (fc.i + delta + fc.deck.length) % fc.deck.length;
  renderCard();
}

function initFlashcards() {
  renderCard();

  $("#flashcard").addEventListener("click", () => $("#flashcard").classList.toggle("flipped"));
  $("#fcFlip").addEventListener("click", () => $("#flashcard").classList.toggle("flipped"));
  $("#fcNext").addEventListener("click", () => moveCard(1));
  $("#fcPrev").addEventListener("click", () => moveCard(-1));

  $("#fcShuffle").addEventListener("click", () => { fc.deck = shuffle(FLASHCARDS); fc.i = 0; renderCard(); });
  $("#fcOrder").addEventListener("click",   () => { fc.deck = FLASHCARDS.slice();  fc.i = 0; renderCard(); });

  // คีย์บอร์ดลัด — ใช้ได้เฉพาะตอนอยู่หน้า Flashcards
  document.addEventListener("keydown", e => {
    if (!$("#flashcards").classList.contains("is-active")) return;
    if (e.key === "ArrowRight") moveCard(1);
    if (e.key === "ArrowLeft")  moveCard(-1);
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      $("#flashcard").classList.toggle("flipped");
    }
  });
}

/* ---------- 9) หน้า Cheat Sheet ---------- */
function renderCheatSheet() {
  // ตารางสรุป 7 ชั้น
  $("#cheatTable tbody").innerHTML = OSI_LAYERS.map(l => `
    <tr>
      <td class="lcell" style="--lc:${l.color}">L${l.num} — ${esc(l.name)}</td>
      <td><b>${esc(l.pdu)}</b></td>
      <td>${esc(l.short)}</td>
      <td class="muted">${l.protocols.slice(0, 6).map(esc).join(", ")}</td>
      <td class="muted">${l.devices.map(d => esc(d.split(" (")[0])).join(", ")}</td>
    </tr>
  `).join("");

  // การ์ดพอร์ตสำคัญ (เอาเฉพาะรายการที่มีเลขพอร์ตจริง)
  const ports = PROTOCOLS.filter(p => p.port !== "—").slice(0, 18);
  $("#portGrid").innerHTML = ports.map(p => `
    <div class="port-card">
      <div class="pn">${esc(p.name)}</div>
      <div class="pp">${esc(p.port)}</div>
      <div class="pt">${esc(p.tp)} · L${p.layer}</div>
    </div>
  `).join("");

  // สรุป TCP vs UDP แบบบรรทัดเดียว
  $("#cheatTcpUdp").innerHTML = TCP_UDP.map(r =>
    `<li><b>${esc(r.topic)}:</b> TCP = ${esc(r.tcp)} / UDP = ${esc(r.udp)}</li>`
  ).join("");

  // สูตรช่วยจำ
  $("#cheatMnemo").innerHTML = MNEMONICS.map(m =>
    `<li><b>${esc(m.dir)}:</b> ${esc(m.phrase)}</li>`
  ).join("") + `<li><b>PDU:</b> ${esc(PDU_MNEMONIC.phrase)}</li>
                <li><b>อุปกรณ์:</b> Hub = L1 / Switch = L2 / Router = L3</li>
                <li><b>Address:</b> MAC = L2 / IP = L3 / Port = L4</li>`;

  $("#printBtn").addEventListener("click", () => window.print());
}

/* ---------- 10) หน้า Network Devices ---------- */

/** การ์ดอุปกรณ์ทั้งหมด — ใช้สีประจำชั้นเดียวกับหน้า 7 Layers */
function renderDevices() {
  $("#devGrid").innerHTML = DEVICES.map(d => `
    <article class="dev-card" style="--lc:${layerColor(d.layer)}">
      <div class="dev-head">
        <span class="dev-ico">${d.icon}</span>
        <div class="dev-id">
          <div class="dev-name">${esc(d.name)}<span class="dev-thai">${esc(d.thai)}</span></div>
          <span class="dev-layer">Layer ${d.layer} — ${esc(layerName(d.layer))}</span>
        </div>
      </div>
      <p class="dev-tag">${esc(d.tagline)}</p>
      <p class="dev-func">${esc(d.func)}</p>
      <h5>ทำงานอย่างไร</h5>
      <ul class="tick">${d.how.map(h => `<li>${esc(h)}</li>`).join("")}</ul>
      <div class="dev-ex"><b>ใช้จริงที่ไหน</b> ${esc(d.example)}</div>
      <div class="dev-dom">
        <span><b>Collision</b> ${esc(d.collision)}</span>
        <span><b>Broadcast</b> ${esc(d.broadcast)}</span>
      </div>
    </article>
  `).join("");

  $("#domainTable").innerHTML = DOMAIN_TABLE.map(r => `
    <tr>
      <td class="lcell" style="--lc:${layerColor(r.layer)}"><b>${esc(r.dev)}</b></td>
      <td><span class="lbadge" style="background:${layerColor(r.layer)}">L${r.layer}</span></td>
      <td>${esc(r.coll)}</td>
      <td>${esc(r.bcast)}</td>
      <td class="muted">${esc(r.note)}</td>
    </tr>
  `).join("");
}

/** ผังเครือข่ายตัวอย่างแบบคลิกได้
    วาดเส้นด้วย SVG แล้ววาง node เป็น HTML ทับ เพื่อให้ใช้ไอคอน SVG เดิมของอุปกรณ์ได้ */
function renderTopoMap() {
  const m = TOPO_MAP;
  const W = 900, H = 430;
  const byId = {};
  m.nodes.forEach(n => { byId[n.id] = n; });

  // เส้นเชื่อม — เส้นทึบเป็นฐาน แล้ววางเส้นประที่วิ่งได้ทับอีกชั้น
  const lines = m.links.map(l => {
    const a = byId[l.a], b = byId[l.b];
    const cls = l.wireless ? " wireless" : "";
    return `<line class="tm-base${cls}" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"/>
            <line class="tm-flow${cls}" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"/>`;
  }).join("");

  // node แต่ละตัววางด้วยเปอร์เซ็นต์ เพื่อให้ยืดหดตามขนาดจอได้พอดีกับเส้น SVG
  const nodes = m.nodes.map(n => {
    const dev = n.dev ? DEVICES.find(d => d.id === n.dev) : null;
    const color = n.layer ? layerColor(n.layer) : "var(--text-mute)";
    const icon = dev ? dev.icon : (n.kind === "cloud" ? "🌐" : "🖥️");
    return `
      <button class="tm-node ${n.kind}" data-id="${n.id}"
              style="left:${(n.x / W * 100).toFixed(2)}%; top:${(n.y / H * 100).toFixed(2)}%; --lc:${color}">
        <span class="tm-ico">${icon}</span>
        <span class="tm-label">${esc(n.label)}</span>
        ${n.layer ? `<span class="tm-badge">L${n.layer}</span>` : ""}
      </button>`;
  }).join("");

  $("#topoCanvas").innerHTML = `
    <div class="tm-wrap">
      <svg class="tm-lines" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">${lines}</svg>
      ${nodes}
    </div>`;

  // ข้อความเริ่มต้นของแผงข้อมูลด้านข้าง
  const resetInfo = () => {
    $("#topoInfo").innerHTML = `
      <div class="ti-empty">
        <span class="ti-hand">👆</span>
        <p>คลิกที่อุปกรณ์ในผังเพื่อดูว่ามันทำงานที่ชั้นไหนและทำหน้าที่อะไรตรงจุดนั้น</p>
        <p class="muted">ลองไล่ดูตั้งแต่ Internet เข้ามาจนถึงเครื่องปลายทาง จะเห็นว่าอุปกรณ์เรียงกันตามความ “ฉลาด” พอดี</p>
      </div>`;
  };
  resetInfo();

  $$(".tm-node", $("#topoCanvas")).forEach(btn => {
    btn.addEventListener("click", () => {
      const n = byId[btn.dataset.id];
      const wasActive = btn.classList.contains("is-active");
      $$(".tm-node").forEach(b => b.classList.remove("is-active"));

      if (wasActive) { resetInfo(); return; }   // คลิกซ้ำที่เดิม = ยกเลิกการเลือก
      btn.classList.add("is-active");

      const dev = n.dev ? DEVICES.find(d => d.id === n.dev) : null;
      const color = n.layer ? layerColor(n.layer) : "var(--text-mute)";

      $("#topoInfo").innerHTML = `
        <div class="ti-card" style="--lc:${color}">
          <div class="ti-head">
            <span class="ti-ico">${dev ? dev.icon : (n.kind === "cloud" ? "🌐" : "🖥️")}</span>
            <div>
              <div class="ti-name">${esc(n.label)}</div>
              <span class="ti-layer">${n.layer ? `Layer ${n.layer} — ${esc(layerName(n.layer))}` : "อุปกรณ์ปลายทาง / นอกเครือข่าย"}</span>
            </div>
          </div>
          <p>${esc(n.info)}</p>
          ${dev ? `
            <h5>หน้าที่หลัก</h5>
            <p class="muted">${esc(dev.func)}</p>
            <div class="ti-dom">
              <span><b>Collision</b> ${esc(dev.collision)}</span>
              <span><b>Broadcast</b> ${esc(dev.broadcast)}</span>
            </div>` : `
            <p class="muted">อุปกรณ์ปลายทางอย่างคอมพิวเตอร์หรือมือถือใช้งานครบทั้ง 7 ชั้น
            เพราะต้องสร้างข้อมูลตั้งแต่ระดับแอปพลิเคชันลงไปจนถึงการยิงสัญญาณออกสาย</p>`}
        </div>`;
    });
  });
}

/* ---------- 11) หน้า IPv4, IPv6 & MAC Address ---------- */

/** ตารางคลาส IPv4 และตารางย่อยอื่น ๆ ที่เป็นข้อมูลนิ่ง */
function renderAddressTables() {
  $("#ipClassTable").innerHTML = IP_CLASSES.map(c => `
    <tr>
      <td class="lcell" style="--lc:${c.color}"><b>Class ${esc(c.cls)}</b></td>
      <td class="mono">${esc(c.range)}</td>
      <td class="mono">${esc(c.bits)}</td>
      <td class="mono">${esc(c.mask)} <span class="muted">${esc(c.cidr)}</span></td>
      <td class="mono">${esc(c.hosts)}</td>
      <td class="muted">${esc(c.use)}</td>
    </tr>
  `).join("");

  $("#ipSpecialList").innerHTML = IP_SPECIAL.map(s => `
    <li><b>${esc(s.addr)}</b> — ${esc(s.name)}<br><span class="muted">${esc(s.note)}</span></li>
  `).join("");

  $("#privateTable").innerHTML = PRIVATE_RANGES.map(p => `
    <tr><td><b>${esc(p.cls)}</b></td><td class="mono">${esc(p.range)}</td><td class="mono">${esc(p.cidr)}</td></tr>
  `).join("");

  $("#cidrTable").innerHTML = CIDR_TABLE.map(c => `
    <tr>
      <td class="mono"><b>${esc(c.cidr)}</b></td>
      <td class="mono">${esc(c.mask)}</td>
      <td class="mono">${esc(c.hosts)}</td>
      <td class="muted">${esc(c.use)}</td>
    </tr>
  `).join("");

  $("#ipv6Why").innerHTML = IPV6_WHY.map(w => `
    <article class="card"><h3>${esc(w.head)}</h3><p class="muted">${esc(w.body)}</p></article>
  `).join("");

  $("#ipv6TypeTable").innerHTML = IPV6_TYPES.map(t => `
    <tr><td><b>${esc(t.type)}</b></td><td class="mono">${esc(t.prefix)}</td><td class="muted">${esc(t.desc)}</td></tr>
  `).join("");

  $("#ipv46Table").innerHTML = IPV4_V6.map(r => `
    <tr><td><b>${esc(r.topic)}</b></td><td>${esc(r.v4)}</td><td>${esc(r.v6)}</td></tr>
  `).join("");

  $("#macFacts").innerHTML = MAC_FACTS.map(f => `
    <article class="card"><h3>${esc(f.head)}</h3><p class="muted">${esc(f.body)}</p></article>
  `).join("");

  $("#ouiTable").innerHTML = OUI_SAMPLES.map(o => `
    <tr><td class="mono">${esc(o.oui)}</td><td>${esc(o.vendor)}</td></tr>
  `).join("");

  $("#macIpTable").innerHTML = MAC_VS_IP.map(r => `
    <tr><td><b>${esc(r.topic)}</b></td><td>${esc(r.mac)}</td><td>${esc(r.ip)}</td></tr>
  `).join("");

  // แผนภาพโครงสร้าง MAC Address 48 บิต แบ่งเป็น OUI กับ NIC
  const m = MAC_SAMPLE;
  $("#macStruct").innerHTML = `
    <div class="ms-addr mono">${esc(m.addr)}</div>
    <div class="ms-split">
      <div class="ms-half oui">
        <div class="ms-hex mono">${esc(m.oui)}</div>
        <div class="ms-name">OUI — 24 บิตแรก</div>
        <p class="muted">รหัสผู้ผลิตที่องค์กร IEEE ออกให้ ดู 3 ไบต์แรกก็รู้ว่าการ์ดใบนี้ยี่ห้ออะไร</p>
      </div>
      <div class="ms-half nic">
        <div class="ms-hex mono">${esc(m.nic)}</div>
        <div class="ms-name">NIC Specific — 24 บิตหลัง</div>
        <p class="muted">หมายเลขที่ผู้ผลิตกำหนดเองให้ไม่ซ้ำกันในโรงงานของตัวเอง</p>
      </div>
    </div>
    <p class="ms-note muted">${esc(m.note)}</p>`;
}

/* ----- เครื่องมือแปลง IP เป็นเลขฐานสอง ----- */

/** แปลงเลข 32 บิตกลับเป็น dotted decimal */
const toDotted = (n) => [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join(".");
/** แปลงเลข 0–255 เป็นสตริงฐานสอง 8 หลัก */
const to8bit = (n) => n.toString(2).padStart(8, "0");

/** บอกคลาสของ IPv4 จาก octet แรก */
function ipClassOf(first) {
  if (first === 0) return { cls: "—", note: "0.x.x.x สงวนไว้ ใช้เป็นที่อยู่ของเครื่องไม่ได้" };
  if (first === 127) return { cls: "A (สงวน)", note: "ช่วง Loopback ชี้กลับมาที่ตัวเครื่องเอง" };
  if (first <= 126) return { cls: "A", note: "เครือข่ายขนาดใหญ่มาก default mask /8" };
  if (first <= 191) return { cls: "B", note: "เครือข่ายขนาดกลางถึงใหญ่ default mask /16" };
  if (first <= 223) return { cls: "C", note: "เครือข่ายขนาดเล็ก default mask /24" };
  if (first <= 239) return { cls: "D", note: "สงวนไว้สำหรับ Multicast" };
  return { cls: "E", note: "สงวนไว้สำหรับงานทดลอง ใช้งานจริงไม่ได้" };
}

/** บอกประเภทของ IP ว่าเป็น private, public, loopback หรืออื่น ๆ */
function ipTypeOf(o) {
  const [a, b] = o;
  if (a === 127) return { t: "Loopback", k: "warn", note: "ชี้กลับมาที่ตัวเครื่องเอง ไม่ได้ออกไปไหน" };
  if (a === 10) return { t: "Private", k: "ok", note: "อยู่ในช่วง 10.0.0.0/8 ต้องผ่าน NAT ถึงจะออกเน็ตได้" };
  if (a === 172 && b >= 16 && b <= 31) return { t: "Private", k: "ok", note: "อยู่ในช่วง 172.16.0.0/12" };
  if (a === 192 && b === 168) return { t: "Private", k: "ok", note: "อยู่ในช่วง 192.168.0.0/16 ที่ใช้ตามบ้าน" };
  if (a === 169 && b === 254) return { t: "APIPA", k: "bad", note: "เครื่องตั้งเองเพราะขอ IP จาก DHCP ไม่สำเร็จ" };
  if (a >= 224 && a <= 239) return { t: "Multicast", k: "warn", note: "ส่งถึงกลุ่มปลายทางพร้อมกัน ไม่ใช่ที่อยู่ของเครื่องเดียว" };
  if (a >= 240) return { t: "Reserved", k: "warn", note: "สงวนไว้สำหรับการทดลอง" };
  if (o.join(".") === "0.0.0.0") return { t: "This network", k: "warn", note: "หมายถึงยังไม่ได้กำหนดค่า" };
  return { t: "Public", k: "ok", note: "เป็นที่อยู่สาธารณะ ใช้บนอินเทอร์เน็ตได้โดยตรง" };
}

/** คำนวณและแสดงผลทั้งหมดของเครื่องมือแปลง IP */
function updateIpTool() {
  const raw = $("#ipInput").value.trim();
  const prefix = +$("#ipPrefix").value;
  const errBox = $("#ipError");

  const fail = (msg) => {
    errBox.textContent = "⚠ " + msg;
    errBox.classList.remove("hidden");
    $("#ipOctets").innerHTML = "";
    $("#ipSummary").innerHTML = "";
  };

  const m = raw.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!m) return fail("รูปแบบยังไม่ถูกต้อง ต้องเป็นตัวเลข 4 ชุดคั่นด้วยจุด เช่น 192.168.1.10");

  const oct = m.slice(1).map(Number);
  if (oct.some(o => o > 255)) return fail("แต่ละ octet ต้องอยู่ระหว่าง 0 ถึง 255 เท่านั้น เพราะเก็บด้วย 8 บิต");
  errBox.classList.add("hidden");

  // วาดแต่ละ octet พร้อมระบายสีแยกส่วน network กับ host ตาม prefix ที่เลือก
  $("#ipOctets").innerHTML = oct.map((o, i) => {
    const bits = to8bit(o).split("").map((b, j) => {
      const pos = i * 8 + j;                       // ตำแหน่งบิตที่เท่าไหร่ใน 32 บิต
      const part = pos < prefix ? "net" : "host";
      return `<span class="bit ${b === "1" ? "on" : "off"} ${part}">${b}</span>`;
    }).join("");
    return `
      <div class="octet">
        <div class="oct-dec">${o}</div>
        <div class="oct-bits">${bits}</div>
        <div class="oct-hex mono">0x${o.toString(16).toUpperCase().padStart(2, "0")}</div>
        <div class="oct-lbl">Octet ${i + 1}</div>
      </div>`;
  }).join('<span class="oct-dot">.</span>');

  // คำนวณค่าเชิงซับเน็ต
  const ip32 = (((oct[0] << 24) >>> 0) + (oct[1] << 16) + (oct[2] << 8) + oct[3]) >>> 0;
  const mask = prefix === 0 ? 0 : (0xFFFFFFFF << (32 - prefix)) >>> 0;
  const net = (ip32 & mask) >>> 0;
  const bcast = (net | (~mask >>> 0)) >>> 0;
  const total = Math.pow(2, 32 - prefix);
  const usable = prefix >= 31 ? (prefix === 32 ? 1 : 2) : total - 2;

  const cls = ipClassOf(oct[0]);
  const type = ipTypeOf(oct);
  const maskBits = toDotted(mask).split(".").map(n => to8bit(+n)).join(" ");

  const cell = (label, value, extra = "") =>
    `<div class="ips-cell"><div class="ips-l">${label}</div><div class="ips-v mono">${value}</div>${extra}</div>`;

  $("#ipSummary").innerHTML = `
    ${cell("เลขฐานสองทั้ง 32 บิต", oct.map(to8bit).join(" "))}
    ${cell("คลาสของที่อยู่", "Class " + esc(cls.cls), `<div class="ips-n">${esc(cls.note)}</div>`)}
    ${cell("ประเภท", `<span class="ips-tag ${type.k}">${esc(type.t)}</span>`, `<div class="ips-n">${esc(type.note)}</div>`)}
    ${cell(`Subnet Mask (/${prefix})`, toDotted(mask), `<div class="ips-n mono">${maskBits}</div>`)}
    ${cell("Network Address", toDotted(net))}
    ${cell("Broadcast Address", toDotted(bcast))}
    ${cell("ช่วง Host ที่ใช้ได้", prefix >= 31 ? "— (ลิงก์แบบพิเศษ)" : `${toDotted((net + 1) >>> 0)} – ${toDotted((bcast - 1) >>> 0)}`)}
    ${cell("จำนวน Host ที่ใช้ได้", usable.toLocaleString("en-US"), `<div class="ips-n">ทั้งหมด ${total.toLocaleString("en-US")} ที่อยู่ หัก network กับ broadcast ออก 2</div>`)}
  `;
}

function initIpTool() {
  // prefix ตั้งแต่ /8 ถึง /32 ครอบคลุมที่ใช้จริงทั้งหมด
  $("#ipPrefix").innerHTML = Array.from({ length: 25 }, (_, i) => i + 8)
    .map(p => `<option value="${p}"${p === 24 ? " selected" : ""}>/${p}</option>`).join("");

  $("#ipInput").addEventListener("input", updateIpTool);
  $("#ipPrefix").addEventListener("change", updateIpTool);
  $$(".tool-presets .chip").forEach(c => c.addEventListener("click", () => {
    $("#ipInput").value = c.dataset.ip;
    updateIpTool();
  }));

  updateIpTool();
}

/* ----- เดโมย่อ IPv6 ทีละขั้น ----- */
let v6Step = 0;

function renderV6() {
  $("#v6Steps").innerHTML = IPV6_SHORTEN.steps.map((s, i) => `
    <div class="v6-step ${i <= v6Step ? "shown" : ""} ${i === v6Step ? "current" : ""}">
      <div class="v6-title">${esc(s.title)}</div>
      <div class="v6-val mono">${esc(s.value)}</div>
      <p class="muted">${esc(s.note)}</p>
    </div>
  `).join("");

  $("#v6Prev").disabled = v6Step === 0;
  $("#v6Next").disabled = v6Step === IPV6_SHORTEN.steps.length - 1;
}

function initV6Demo() {
  renderV6();
  $("#v6Next").addEventListener("click", () => { if (v6Step < IPV6_SHORTEN.steps.length - 1) { v6Step++; renderV6(); } });
  $("#v6Prev").addEventListener("click", () => { if (v6Step > 0) { v6Step--; renderV6(); } });
  $("#v6Reset").addEventListener("click", () => { v6Step = 0; renderV6(); });
}

/* ----- Mini quiz ท้ายหัวข้อ (ใช้ซ้ำได้กับทุกหน้า) ----- */
function initMiniQuiz(sel, questions) {
  const box = $(sel);
  let answered = 0, right = 0;

  box.innerHTML = questions.map((q, qi) => `
    <div class="mq-item" data-q="${qi}">
      <div class="mq-head">
        <span class="q-cat">${esc(q.cat)}</span>
        <span class="mq-n">ข้อ ${qi + 1} / ${questions.length}</span>
      </div>
      <div class="mq-q">${esc(q.q)}</div>
      <div class="choices">
        ${q.choices.map((c, ci) => `
          <button class="choice" data-i="${ci}">
            <span class="ck">${String.fromCharCode(65 + ci)}</span><span>${esc(c)}</span>
          </button>`).join("")}
      </div>
      <div class="feedback hidden"><div class="fb-head"></div><p></p></div>
    </div>
  `).join("") + `<div class="mq-score" id="mqScore">ยังไม่ได้ตอบ — มีทั้งหมด ${questions.length} ข้อ</div>`;

  // ใช้ event delegation ครั้งเดียว แทนการผูก listener ทุกปุ่ม
  box.addEventListener("click", e => {
    const btn = e.target.closest(".choice");
    if (!btn) return;

    const item = btn.closest(".mq-item");
    if (item.classList.contains("done")) return;      // ข้อนี้ตอบไปแล้ว
    item.classList.add("done");

    const q = questions[+item.dataset.q];
    const picked = +btn.dataset.i;
    const ok = picked === q.answer;

    answered++;
    if (ok) right++;

    $$(".choice", item).forEach(b => {
      const i = +b.dataset.i;
      b.disabled = true;
      if (i === q.answer) b.classList.add("correct");
      else if (i === picked) b.classList.add("wrong");
      else b.classList.add("dim");
    });

    const fb = $(".feedback", item);
    fb.className = "feedback " + (ok ? "ok" : "bad");
    $(".fb-head", fb).textContent = ok ? "✅ ถูกต้อง!" : "❌ ยังไม่ถูก";
    $("p", fb).textContent = q.why;

    const pct = Math.round(right / answered * 100);
    $("#mqScore", box).textContent =
      `ตอบแล้ว ${answered} / ${questions.length} ข้อ — ถูก ${right} ข้อ (${pct}%)`;
  });
}

/* ---------- 12) หน้า Network Types & Topology ---------- */

function renderNetworkTypes() {
  $("#ntGrid").innerHTML = NETWORK_TYPES.map(n => `
    <article class="nt-card" style="--lc:${n.color}">
      <div class="nt-abbr">${esc(n.abbr)}</div>
      <div class="nt-name">${esc(n.name)}</div>
      <div class="nt-thai">${esc(n.thai)}</div>
      <dl class="nt-meta">
        <div><dt>ครอบคลุม</dt><dd>${esc(n.range)}</dd></div>
        <div><dt>ความเร็ว</dt><dd>${esc(n.speed)}</dd></div>
        <div><dt>เทคโนโลยี</dt><dd>${esc(n.tech)}</dd></div>
      </dl>
      <p class="nt-ex">${esc(n.example)}</p>
      <div class="nt-note">${esc(n.note)}</div>
    </article>
  `).join("");

  $("#ntTable").innerHTML = NETWORK_TYPES.map(n => `
    <tr>
      <td class="lcell" style="--lc:${n.color}"><b>${esc(n.abbr)}</b></td>
      <td>${esc(n.range)}</td>
      <td class="mono">${esc(n.speed)}</td>
      <td class="muted">${esc(n.owner)}</td>
      <td class="muted">${esc(n.example)}</td>
    </tr>
  `).join("");

  $("#ntExtra").innerHTML = NETWORK_TYPES_EXTRA.map(e => `
    <span class="nt-chip"><b>${esc(e.abbr)}</b> ${esc(e.desc)}</span>
  `).join("");
}

/** สร้าง SVG ของ topology หนึ่งแบบ — เส้นทึบเป็นฐาน + เส้นประวิ่งทับเพื่อให้เห็นการไหลของข้อมูล */
function topoSvg(t) {
  const line = (x1, y1, x2, y2) =>
    `<line class="tp-base" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>
     <line class="tp-flow" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;

  let wires = "";

  // แบบ Bus มีสายแกนกลาง แล้วแต่ละเครื่องหย่อนสายลงมาต่อ
  if (t.backbone) {
    const b = t.backbone;
    wires += line(b.x1, b.y1, b.x2, b.y2);
    wires += t.nodes.map(n => line(n.x, n.y, n.x, b.y1)).join("");
  }

  wires += (t.edges || []).map(([a, z]) =>
    line(t.nodes[a].x, t.nodes[a].y, t.nodes[z].x, t.nodes[z].y)
  ).join("");

  const dots = t.nodes.map((n, i) =>
    `<circle class="tp-node${n.hub ? " hub" : ""}" cx="${n.x}" cy="${n.y}" r="${n.hub ? 8.5 : 5.5}"
             style="animation-delay:${i * 140}ms"/>`
  ).join("");

  return `<svg class="tp-svg" viewBox="0 0 200 150" role="img" aria-label="ผัง ${esc(t.name)}">${wires}${dots}</svg>`;
}

function renderTopologies() {
  $("#topoGrid").innerHTML = TOPOLOGIES.map(t => `
    <article class="tp-card" style="--lc:${t.color}" data-id="${t.id}">
      <button class="tp-head">
        <div class="tp-figure">${topoSvg(t)}</div>
        <div class="tp-title">
          <div class="tp-name">${esc(t.name)}<span class="tp-thai">${esc(t.thai)}</span></div>
          <div class="tp-tag">${esc(t.tagline)}</div>
        </div>
        <span class="layer-caret">▼</span>
      </button>
      <div class="tp-body"><div>
        <div class="tp-detail">
          <p class="muted">${esc(t.desc)}</p>
          <div class="tp-cols">
            <div class="tp-col ok">
              <h5>✅ ข้อดี</h5>
              <ul class="tick">${t.pros.map(p => `<li>${esc(p)}</li>`).join("")}</ul>
            </div>
            <div class="tp-col bad">
              <h5>⚠️ ข้อเสีย</h5>
              <ul class="tick">${t.cons.map(c => `<li>${esc(c)}</li>`).join("")}</ul>
            </div>
          </div>
          <div class="tp-best"><b>เหมาะกับ</b> ${esc(t.best)}</div>
        </div>
      </div></div>
    </article>
  `).join("");

  // กางหรือพับการ์ดด้วยวิธีเดียวกับ layer stack ในหน้า 7 Layers
  $$("#topoGrid .tp-head").forEach(head => {
    head.addEventListener("click", () => head.closest(".tp-card").classList.toggle("open"));
  });

  $("#topoCompare").innerHTML = TOPO_COMPARE.map(r => `
    <tr>
      <td><b>${esc(r.name)}</b></td>
      <td>${esc(r.cable)}</td>
      <td>${esc(r.cost)}</td>
      <td>${esc(r.fault)}</td>
      <td>${esc(r.scale)}</td>
      <td class="muted">${esc(r.fix)}</td>
    </tr>
  `).join("");
}

/* ---------- 13) เนื้อหาเพิ่มเติมในหน้า Cheat Sheet ---------- */
function renderCheatExtra() {
  // ตารางอุปกรณ์กับชั้นที่สังกัด
  $("#cheatDevices").innerHTML = DEVICES.map(d => `
    <tr>
      <td class="lcell" style="--lc:${layerColor(d.layer)}"><b>${esc(d.name)}</b></td>
      <td><span class="lbadge" style="background:${layerColor(d.layer)}">L${d.layer}</span></td>
      <td class="muted">${esc(d.tagline)}</td>
      <td class="muted">${esc(d.collision)}</td>
      <td class="muted">${esc(d.broadcast)}</td>
    </tr>
  `).join("");

  // สรุปเรื่องที่อยู่แบบสั้น
  $("#cheatAddr").innerHTML = `
    <li><b>IPv4</b> 32 บิต เขียนเป็น dotted decimal 4 octet เช่น 192.168.1.10</li>
    <li><b>IPv6</b> 128 บิต เขียนเป็นฐานสิบหก 8 กลุ่ม ย่อด้วย :: ได้ครั้งเดียว</li>
    <li><b>MAC</b> 48 บิต = OUI 24 บิตแรก (ยี่ห้อ) + NIC 24 บิตหลัง</li>
    <li><b>Private IP</b> 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16</li>
    <li><b>APIPA</b> 169.254.0.0/16 แปลว่าขอ IP จาก DHCP ไม่ได้</li>
    <li><b>Loopback</b> 127.0.0.1 (IPv4) และ ::1 (IPv6)</li>
    <li><b>MAC เปลี่ยนทุก hop / IP คงเดิมตลอดทาง</b> — ข้อนี้ออกสอบบ่อยที่สุด</li>
    <li><b>ARP</b> แปลง IP เป็น MAC ส่วน <b>DHCP</b> แจก IP ให้อัตโนมัติ</li>
    <li><b>คลาส:</b> A = 1–126, B = 128–191, C = 192–223, D = multicast, E = ทดลอง</li>`;

  // สรุปประเภทเครือข่ายและ topology
  $("#cheatNet").innerHTML = NETWORK_TYPES.map(n =>
    `<li><b>${esc(n.abbr)}</b> — ${esc(n.range)}</li>`
  ).join("") + `<li><b>ลำดับขนาด:</b> PAN &lt; LAN &lt; CAN &lt; MAN &lt; WAN</li>`;

  $("#cheatTopo").innerHTML = TOPOLOGIES.map(t =>
    `<li><b>${esc(t.name)}</b> — ${esc(t.tagline)}</li>`
  ).join("") + `<li><b>ที่ใช้จริงมากที่สุดวันนี้:</b> Star และ Tree (Star หลายวงต่อกันเป็นชั้น)</li>`;
}

/* ---------- เริ่มต้นระบบทั้งหมดเมื่อ DOM พร้อม ---------- */
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initNav();
  renderCompare();
  renderMnemonics();
  renderLayers();
  initEncap();
  renderDevices();
  renderTopoMap();
  renderAddressTables();
  initIpTool();
  initV6Demo();
  initMiniQuiz("#addrQuiz", ADDR_QUIZ);
  renderNetworkTypes();
  renderTopologies();
  initProtocols();
  initQuiz();
  initFlashcards();
  renderCheatSheet();
  renderCheatExtra();
});
