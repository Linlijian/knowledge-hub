/* =========================================================================
   script.js — logic การแสดงผลและการโต้ตอบทั้งหมด
   เนื้อหาทั้งหมดอยู่ใน data.js (ไฟล์นี้ไม่เก็บเนื้อหา เก็บแต่วิธีแสดงผล)

   สารบัญ:
     0)  ตัวช่วยทั่วไป
     1)  ธีมสว่าง/มืด
     2)  Navigation แบบ SPA + progress indicator
     3)  บทที่ 1 — ตารางเทียบ, CIA Triangle, AAA, คำศัพท์
     4)  บทที่ 2 — การ์ดแฮกเกอร์, Attack Surface map
     5)  บทที่ 3 — OSI Attack Stack
     6)  บทที่ 4 — Malware + แอนิเมชัน Virus vs Worm
     7)  บทที่ 5 — Social Engineering + เกมทายเทคนิค
     8)  บทที่ 6 — MITM animation, DoS/DDoS, การ์ดการโจมตี
     9)  บทที่ 7 — ช่องโหว่เว็บ
    10)  บทที่ 8 — Crypto, PKI, TLS handshake animation
    11)  บทที่ 9 — Firewall/IDS/VPN/DMZ/Zero Trust
    12)  บทที่ 10 — รหัสผ่าน, MFA, Onion, Backup, CVSS
    13)  หน้า Quiz (+ localStorage)
    14)  หน้า Flashcards
    15)  หน้า Cheat Sheet + ปุ่มพิมพ์
   ========================================================================= */

/* ---------- 0) ตัวช่วยทั่วไป ---------- */
const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/** ป้องกัน HTML injection เวลานำข้อความจากข้อมูลมาต่อเป็น innerHTML */
function esc(s) {
  return String(s).replace(/[&<>"']/g, c => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));
}

/** สลับลำดับสมาชิกใน array (Fisher–Yates) โดยไม่แก้ array ต้นฉบับ */
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** แปลงตัวอักษร C/I/A เป็นป้ายสีประจำเสาหลักของ CIA */
function ciaBadges(list) {
  if (!list) return "";
  const map = { C: ["c", "C"], I: ["i", "I"], A: ["a", "A"] };
  return list.map(k => {
    const m = map[k]; if (!m) return "";
    return `<span class="badge ${m[0]}" title="กระทบ ${k}">${m[1]}</span>`;
  }).join("");
}

/** แถบระดับความรุนแรง 1–5 ขีด */
function sevBars(n) {
  return `<span class="sev" title="ความรุนแรงโดยประมาณ ${n}/5">` +
    [1,2,3,4,5].map(i => `<i class="${i <= n ? "on" : ""}"></i>`).join("") + `</span>`;
}

/** หาข้อมูลบทจากหมายเลขบท */
const chapterByNo = (n) => CHAPTERS.find(c => c.no === n) || { short: "อื่น ๆ", no: n };

/* ---------- 1) ธีมสว่าง / มืด ---------- */
const THEME_KEY = "cybersec_theme";

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

/* ---------- 2) Navigation แบบ SPA + progress indicator ---------- */
/* รายชื่อหน้าทั้งหมด = 10 บท + quiz + flashcards + cheatsheet */
const EXTRA_PAGES = [
  { id: "quiz",       short: "Quiz",  icon: "📝" },
  { id: "flashcards", short: "Cards", icon: "🃏" },
  { id: "cheatsheet", short: "สรุป",  icon: "📄" }
];
const PAGES = [...CHAPTERS.map(c => c.id), ...EXTRA_PAGES.map(p => p.id)];

const VISIT_KEY = "cybersec_visited";
let visited = new Set(JSON.parse(localStorage.getItem(VISIT_KEY) || '["basics"]'));

/** อัปเดตแถบ progress ตามจำนวนหน้าที่เคยเข้าไปดูแล้ว */
function updateProgress() {
  const pct = (visited.size / PAGES.length) * 100;
  $("#progressFill").style.width = pct + "%";
  // ทำเครื่องหมายจุดเล็ก ๆ บนเมนูของหน้าที่เคยเข้าแล้ว
  $$(".nav-link").forEach(b => b.classList.toggle("seen", visited.has(b.dataset.target)));
  localStorage.setItem(VISIT_KEY, JSON.stringify(Array.from(visited)));
}

/** สร้างเมนูจาก CHAPTERS เพื่อไม่ต้องแก้ทั้ง HTML และ data เวลาเพิ่มบท */
function buildNav() {
  const nav = $("#mainNav");
  const chapterBtns = CHAPTERS.map(c =>
    `<button class="nav-link" data-target="${c.id}" title="${esc(c.title)}">${c.no}. ${esc(c.short)}</button>`
  ).join("");
  const extraBtns = EXTRA_PAGES.map(p =>
    `<button class="nav-link" data-target="${p.id}">${p.icon} ${esc(p.short)}</button>`
  ).join("");
  nav.innerHTML = chapterBtns + extraBtns;
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
  buildNav();
  $$(".nav-link").forEach(btn => btn.addEventListener("click", () => goto(btn.dataset.target)));
  // ปุ่มลัดที่ฝังอยู่ในเนื้อหา เช่น "ข้ามไปดูบทที่ 3"
  $$("[data-goto]").forEach(btn => btn.addEventListener("click", () => goto(btn.dataset.goto)));

  $("#navToggle").addEventListener("click", () => {
    const nav = $("#mainNav");
    const open = nav.classList.toggle("open");
    $("#navToggle").setAttribute("aria-expanded", String(open));
  });

  // เปิดหน้าตาม hash ที่ติดมากับ URL (เช่น index.html#quiz)
  const hash = location.hash.replace("#", "");
  if (PAGES.includes(hash)) goto(hash);
  else { $$(".nav-link")[0].classList.add("is-active"); updateProgress(); }
}

/* =========================================================================
   3) บทที่ 1 — ตารางเทียบศาสตร์, CIA Triangle, AAA, คำศัพท์
   ========================================================================= */

/** ตารางเปรียบเทียบ Cyber / Network / Information Security */
function renderSecCompare() {
  $("#secCompareTable tbody").innerHTML = SEC_COMPARE.map(r => `
    <tr>
      <td class="lcell" style="--lc:${r.color}">${esc(r.name)}</td>
      <td class="muted">${esc(r.scope)}</td>
      <td class="muted">${esc(r.protect)}</td>
      <td class="muted">${esc(r.example)}</td>
      <td class="muted">${esc(r.note)}</td>
    </tr>`).join("");
}

/**
 * วาดสามเหลี่ยม CIA เป็น SVG แล้วผูก event ให้แต่ละมุมคลิกได้
 * ใช้ SVG แทนรูปภาพเพื่อให้ปรับสีตามธีมและ responsive ได้เอง
 */
function renderCiaTriangle() {
  // ตำแหน่งสามมุม: บน / ล่างซ้าย / ล่างขวา
  const pts = [
    { x: 200, y: 46 },
    { x: 48,  y: 300 },
    { x: 352, y: 300 }
  ];
  const nodes = CIA_TRIAD.map((c, i) => {
    const p = pts[i];
    return `
      <g class="cia-node" data-idx="${i}" tabindex="0" role="button" aria-label="${esc(c.name)}">
        <circle cx="${p.x}" cy="${p.y}" r="52" fill="${c.color}" fill-opacity=".2" stroke="${c.color}" stroke-width="2.5"/>
        <text x="${p.x}" y="${p.y - 4}" text-anchor="middle" font-size="26" fill="${c.color}">${c.key}</text>
        <text x="${p.x}" y="${p.y + 16}" text-anchor="middle" font-size="11" fill="${c.color}">${esc(c.name.slice(0, 12))}</text>
      </g>`;
  }).join("");

  $("#ciaTriangle").innerHTML = `
    <svg class="cia-svg" viewBox="0 0 400 360" role="img" aria-label="แผนภาพ CIA Triad">
      <polygon class="cia-tri" points="${pts.map(p => p.x + "," + p.y).join(" ")}"/>
      <text x="200" y="196" text-anchor="middle" font-size="12" fill="currentColor" opacity=".45">CIA Triad</text>
      <text x="200" y="214" text-anchor="middle" font-size="10" fill="currentColor" opacity=".35">คลิกที่มุมเพื่อดูรายละเอียด</text>
      ${nodes}
    </svg>`;

  $$(".cia-node").forEach(n => {
    const show = () => showCia(Number(n.dataset.idx));
    n.addEventListener("click", show);
    n.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); show(); } });
  });

  showCia(0); // แสดงมุมแรกเป็นค่าเริ่มต้น
}

/** แสดงรายละเอียดของเสาหลัก CIA ที่ถูกเลือก */
function showCia(idx) {
  const c = CIA_TRIAD[idx];
  $$(".cia-node").forEach((n, i) => n.classList.toggle("is-active", i === idx));

  $("#ciaDetail").style.setProperty("--cc", c.color);
  $("#ciaDetail").innerHTML = `
    <h3>${c.key} — ${esc(c.name)}</h3>
    <div class="sub">${esc(c.thai)}</div>
    <p><b>${esc(c.short)}</b></p>
    <p class="muted">${esc(c.detail)}</p>
    <div class="chips" style="margin:12px 0">
      ${c.tools.map(t => `<span class="chip" style="cursor:default">${esc(t)}</span>`).join("")}
    </div>
    <div class="cia-fail">
      <div class="fh">⚠️ ตัวอย่างเมื่อ ${esc(c.name)} ล้มเหลว</div>
      <p style="margin:0 0 6px">${esc(c.failCase)}</p>
      <p style="margin:0"><b>บทเรียน:</b> ${esc(c.failLesson)}</p>
    </div>`;
}

/** หลักเสริมของ CIA */
function renderCiaExtra() {
  $("#ciaExtra").innerHTML = CIA_EXTRA.map(e =>
    `<li><b>${esc(e.name)}</b> (${esc(e.thai)}) — ${esc(e.desc)}</li>`).join("");
}

/** การ์ด AAA + Non-repudiation */
function renderAAA() {
  $("#aaaGrid").innerHTML = AAA_ITEMS.map(a => `
    <article class="aaa-card" style="--ac:${a.color}">
      <div class="abbr">${esc(a.abbr)}</div>
      <h4>${esc(a.name)}</h4>
      <div class="thai">${esc(a.thai)}</div>
      <div class="qline">“${esc(a.q)}”</div>
      <p class="muted" style="font-size:.87rem">${esc(a.desc)}</p>
      <div class="bank"><b>🏦 ตัวอย่างธนาคาร:</b> ${esc(a.bank)}</div>
      <div class="fail">${esc(a.fail)}</div>
    </article>`).join("");
}

/** ตารางคำที่มักสับสน + สูตรความเสี่ยง */
function renderTerms() {
  $("#termTable tbody").innerHTML = TERM_CONFUSION.map(t => `
    <tr>
      <td class="lcell" style="--lc:${t.color}">${esc(t.term)}</td>
      <td class="muted">${esc(t.thai)}</td>
      <td class="muted">${esc(t.def)}</td>
      <td class="muted">🏠 ${esc(t.analogy)}</td>
    </tr>`).join("");

  $("#riskFormula").textContent = RISK_FORMULA.formula;
  $("#riskPoints").innerHTML = RISK_FORMULA.points.map(p => `<li>${esc(p)}</li>`).join("");
  $("#riskTreat").innerHTML = RISK_FORMULA.treatments.map(t =>
    `<li><b>${esc(t.name)}</b> — ${esc(t.desc)}</li>`).join("");
}

/* =========================================================================
   4) บทที่ 2 — การ์ดแฮกเกอร์ + Attack Surface map
   ========================================================================= */
function renderHackers() {
  $("#hackerGrid").innerHTML = HACKER_TYPES.map(h => `
    <article class="hacker-card" style="--hc:${h.color}">
      <div class="hacker-head">
        <div class="hacker-icon">${h.icon}</div>
        <div>
          <h4>${esc(h.name)}</h4>
          <div class="th">${esc(h.thai)}</div>
        </div>
      </div>
      <p class="muted" style="font-size:.87rem">${esc(h.desc)}</p>
      <div class="hacker-meta">
        <div class="row"><span class="k">แรงจูงใจ</span><span class="v">${esc(h.motive)}</span></div>
        <div class="row"><span class="k">ระดับทักษะ</span><span class="v">${esc(h.skill)}</span></div>
        <div class="row"><span class="k">สถานะกฎหมาย</span><span class="v">${esc(h.legal)}</span></div>
      </div>
      <div class="danger-meter">
        <span>ระดับความอันตราย</span>
        <span class="bars">${[1,2,3,4,5].map(i => `<i class="${i <= h.danger ? "on" : ""}"></i>`).join("")}</span>
        <span>${h.danger}/5</span>
      </div>
      <div class="hacker-ex"><b>ตัวอย่าง:</b> ${esc(h.example)}</div>
    </article>`).join("");
}

/** แผนภาพพื้นที่ผิวการโจมตี — วางจุดตามพิกัดเปอร์เซ็นต์ใน SURFACE_POINTS */
function renderSurfaceMap() {
  const s = SURFACE_CONCEPT.surface, v = SURFACE_CONCEPT.vector;
  $("#surfaceTitle").textContent = s.title;
  $("#surfaceDesc").textContent = s.desc;
  $("#surfaceAnalogy").textContent = s.analogy;
  $("#surfaceReduce").innerHTML = s.reduce.map(r => `<li>${esc(r)}</li>`).join("");
  $("#vectorTitle").textContent = v.title;
  $("#vectorDesc").textContent = v.desc;
  $("#vectorAnalogy").textContent = v.analogy;
  $("#vectorReduce").innerHTML = v.reduce.map(r => `<li>${esc(r)}</li>`).join("");
  $("#surfaceKeyLine").textContent = SURFACE_CONCEPT.keyLine;

  const map = $("#surfaceMap");
  SURFACE_POINTS.forEach((p, i) => {
    const el = document.createElement("div");
    el.className = `surface-point risk-${p.risk}`;
    el.style.left = p.x + "%";
    el.style.top = p.y + "%";
    el.innerHTML = `<div class="dot">${p.icon}</div><div class="lbl">${esc(p.name)}</div>`;
    el.addEventListener("click", () => {
      $$(".surface-point").forEach(o => o.classList.remove("is-active"));
      el.classList.add("is-active");
      $("#surfaceInfo").innerHTML =
        `<b>${p.icon} ${esc(p.name)}</b><br>ช่องทางโจมตีที่เป็นไปได้: ${esc(p.vector)}`;
    });
    map.appendChild(el);
  });
}

/* =========================================================================
   5) บทที่ 3 — OSI Attack Stack (หน้าเด่นที่สุดของเว็บ)
   โครงเดียวกับ stack 7 ชั้นในเว็บ Computer Networks
   แต่กางออกมาแล้วเป็น "รายการการโจมตี" แทน "หน้าที่ของชั้น"
   ========================================================================= */
function renderOsiAttacks() {
  const stack = $("#osiAttackStack");

  stack.innerHTML = OSI_ATTACKS.map(l => `
    <div class="layer" data-layer="${l.num}" style="--lc:${l.color}">
      <button class="layer-head" aria-expanded="false">
        <span class="layer-num">${l.num}</span>
        <span class="layer-title">
          <span class="ln">${esc(l.name)}<span class="lt">${esc(l.thai)} · PDU: ${esc(l.pdu)}</span></span>
          <span class="ls">${esc(l.role)}</span>
        </span>
        <span class="layer-count">${l.attacks.length} การโจมตี</span>
        <span class="layer-caret">▾</span>
      </button>
      <div class="layer-body"><div>
        <div class="layer-detail">
          <div class="layer-why"><b>ทำไมชั้นนี้ถึงถูกโจมตี:</b> ${esc(l.why)}</div>
          <div class="attack-list">
            ${l.attacks.map((a, ai) => `
              <div class="attack-item" data-attack="${l.num}-${ai}">
                <button class="attack-btn">
                  <span class="an">${esc(a.name)}</span>
                  <span class="cia-tags">${ciaBadges(a.cia)}</span>
                  ${sevBars(a.sev)}
                  <span class="plus">＋</span>
                </button>
                <div class="attack-body"><div>
                  <div class="attack-detail">
                    <div class="attack-row how"><span class="k">หลักการ</span><span class="v">${esc(a.how)}</span></div>
                    <div class="attack-row impact"><span class="k">ผลกระทบ</span><span class="v">${esc(a.impact)}</span></div>
                    <div class="attack-row def"><span class="k">ป้องกัน</span><span class="v">${esc(a.defense)}</span></div>
                  </div>
                </div></div>
              </div>`).join("")}
          </div>
        </div>
      </div></div>
    </div>`).join("");

  // คลิกที่หัวชั้นเพื่อกาง/ยุบชั้นนั้น
  $$(".layer-head", stack).forEach(head => {
    head.addEventListener("click", () => {
      const layer = head.closest(".layer");
      const open = layer.classList.toggle("open");
      head.setAttribute("aria-expanded", String(open));
    });
  });

  // คลิกที่ชื่อการโจมตีเพื่อกางรายละเอียด (หยุด event ไม่ให้ไปยุบชั้นทั้งชั้น)
  $$(".attack-btn", stack).forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      btn.closest(".attack-item").classList.toggle("open");
    });
  });

  $("#expandAllLayers").addEventListener("click", () => {
    $$(".layer", stack).forEach(l => { l.classList.add("open"); $(".layer-head", l).setAttribute("aria-expanded", "true"); });
  });
  $("#collapseAllLayers").addEventListener("click", () => {
    $$(".layer", stack).forEach(l => { l.classList.remove("open"); $(".layer-head", l).setAttribute("aria-expanded", "false"); });
    $$(".attack-item", stack).forEach(a => a.classList.remove("open"));
  });

  // กางชั้น L7 ไว้ตั้งแต่แรกเพื่อให้เห็นว่าคลิกได้
  const first = $(".layer", stack);
  if (first) { first.classList.add("open"); $(".layer-head", first).setAttribute("aria-expanded", "true"); }

  $("#bridgeGrid").innerHTML = OSI_BRIDGE_NOTES.map(b => `
    <div class="bridge-card">
      <h4><span class="ico">${b.icon}</span> ${esc(b.title)}</h4>
      <p>${esc(b.text)}</p>
    </div>`).join("");
}

/* =========================================================================
   6) บทที่ 4 — Malware + แอนิเมชัน Virus vs Worm
   ========================================================================= */
function renderMalware() {
  // การ์ดสรุปสั้น ๆ
  $("#malwareGrid").innerHTML = MALWARE.map(m => `
    <article class="card" style="border-top:4px solid ${m.color}">
      <h3><span class="ico">${m.icon}</span> ${esc(m.name)}</h3>
      <p class="muted" style="margin-bottom:8px">${esc(m.thai)}</p>
      <p style="font-size:.87rem;color:var(--text-dim)">${esc(m.goal)}</p>
      <p class="muted" style="font-size:.82rem;border-top:1px dashed var(--border);padding-top:8px;margin:0">
        <b>ข้อสังเกต:</b> ${esc(m.note)}
      </p>
    </article>`).join("");

  // ตารางเปรียบเทียบเต็ม
  $("#malwareTable tbody").innerHTML = MALWARE.map(m => `
    <tr>
      <td class="lcell" style="--lc:${m.color}">${m.icon} ${esc(m.name)}</td>
      <td class="muted">${esc(m.spread)}</td>
      <td class="muted"><b>${esc(m.host)}</b></td>
      <td class="muted">${esc(m.action)}</td>
      <td class="muted">${esc(m.goal)}</td>
      <td class="muted">${esc(m.famous)}</td>
    </tr>`).join("");

  renderVW(0); // เริ่มต้นแสดงหัวข้ออย่างเดียว ยังไม่แสดงขั้นตอน
}

/** วาดกล่อง Virus / Worm โดยแสดงขั้นตอนทีละ n ขั้น (ใช้ทำแอนิเมชัน) */
function renderVW(shownSteps) {
  const draw = (box, d) => {
    const steps = d.steps.slice(0, shownSteps).map((s, i) => `
      <div class="vw-step" style="animation-delay:${i * .05}s">
        <span class="n">${i + 1}</span><span>${esc(s)}</span>
      </div>`).join("");
    box.innerHTML = `
      <h4>${d.title === "Virus" ? "🦠" : "🐛"} ${esc(d.title)}</h4>
      <div class="vw-steps">${steps || '<p class="muted" style="margin:0">กดปุ่ม “เล่นแอนิเมชัน” เพื่อดูลำดับการแพร่กระจาย</p>'}</div>
      ${shownSteps >= d.steps.length ? `<div class="vw-key">🔑 ${esc(d.key)}</div>` : ""}`;
  };
  draw($("#vwVirus"), VIRUS_VS_WORM.virus);
  draw($("#vwWorm"),  VIRUS_VS_WORM.worm);
}

/** แอนิเมชันเทียบการแพร่ของ Virus กับ Worm — เผยขั้นตอนทีละขั้น */
let vwTimer = null;
function initVWAnim() {
  const maxStep = Math.max(VIRUS_VS_WORM.virus.steps.length, VIRUS_VS_WORM.worm.steps.length);

  $("#playVW").addEventListener("click", () => {
    clearInterval(vwTimer);
    let step = 0;
    renderVW(0);
    vwTimer = setInterval(() => {
      step++;
      renderVW(step);
      if (step >= maxStep) clearInterval(vwTimer);
    }, 900);
  });

  $("#resetVW").addEventListener("click", () => { clearInterval(vwTimer); renderVW(0); });
}

/* =========================================================================
   7) บทที่ 5 — ตารางเทคนิค Social Engineering + เกมทายเทคนิค
   ========================================================================= */
function renderSocialTable() {
  $("#socialTable tbody").innerHTML = SOCIAL_TECHS.map(t => `
    <tr>
      <td class="rowhead">${t.icon} ${esc(t.name)}</td>
      <td><span class="badge plain">${esc(t.channel)}</span></td>
      <td class="muted">${esc(t.desc)}</td>
      <td class="muted">🚩 ${esc(t.tell)}</td>
    </tr>`).join("");
}

/* สถานะของเกมทายเทคนิค */
const seState = { order: [], idx: 0, score: 0, answered: false };

function initSocialGame() {
  $("#seNext").addEventListener("click", () => {
    seState.idx++;
    if (seState.idx >= seState.order.length) finishSocialGame();
    else showScenario();
  });
  $("#seRestart").addEventListener("click", startSocialGame);
  startSocialGame();
}

function startSocialGame() {
  seState.order = shuffle(SOCIAL_SCENARIOS.map((_, i) => i));
  seState.idx = 0;
  seState.score = 0;
  showScenario();
}

/** แสดงสถานการณ์ปัจจุบัน พร้อมสร้างตัวเลือก 4 ตัว (คำตอบถูก 1 + ตัวลวง 3) */
function showScenario() {
  const s = SOCIAL_SCENARIOS[seState.order[seState.idx]];
  seState.answered = false;

  $("#seIndex").textContent = `สถานการณ์ ${seState.idx + 1} / ${seState.order.length}`;
  $("#seScore").textContent = `ถูก ${seState.score}`;
  $("#seTitle").textContent = s.title;
  $("#seBody").textContent = s.body;
  $("#seMeta").textContent = s.meta;

  const tech = SOCIAL_TECHS.find(t => t.name === s.answer);
  $("#seChannel").textContent = tech ? "ช่องทาง: " + tech.channel : "";

  // ตัวลวง: สุ่มจากเทคนิคอื่นที่ไม่ใช่คำตอบ
  const distractors = shuffle(SOCIAL_TECHS.filter(t => t.name !== s.answer)).slice(0, 3).map(t => t.name);
  const options = shuffle([s.answer, ...distractors]);

  $("#seOptions").innerHTML = options.map(o =>
    `<button class="se-opt" data-name="${esc(o)}">${esc(o)}</button>`).join("");

  $$("#seOptions .se-opt").forEach(btn =>
    btn.addEventListener("click", () => answerScenario(btn, s)));

  $("#seFeedback").classList.add("hidden");
  $("#seNext").disabled = true;
  $("#seNext").textContent = seState.idx === seState.order.length - 1 ? "ดูผลสรุป →" : "สถานการณ์ถัดไป →";
}

function answerScenario(btn, s) {
  if (seState.answered) return;
  seState.answered = true;

  const picked = btn.dataset.name;
  const correct = picked === s.answer;
  if (correct) seState.score++;

  $$("#seOptions .se-opt").forEach(b => {
    b.disabled = true;
    if (b.dataset.name === s.answer) b.classList.add("correct");
    else if (b === btn) b.classList.add("wrong");
    else b.classList.add("dim");
  });

  const fb = $("#seFeedback");
  fb.className = "feedback " + (correct ? "ok" : "bad");
  $("#seFbHead").textContent = correct ? "✅ ถูกต้อง!" : `❌ ยังไม่ใช่ — คำตอบคือ ${s.answer}`;
  $("#seFbWhy").textContent = s.why;

  $("#seScore").textContent = `ถูก ${seState.score}`;
  $("#seNext").disabled = false;
}

function finishSocialGame() {
  const total = seState.order.length;
  const pct = Math.round((seState.score / total) * 100);
  $("#seTitle").textContent = "จบเกมแล้ว";
  $("#seBody").textContent = `คุณทายถูก ${seState.score} จาก ${total} สถานการณ์ (${pct}%)\n` +
    (pct >= 80 ? "จับสัญญาณได้ดีมาก — ระดับนี้รอดฟิชชิ่งส่วนใหญ่ในชีวิตจริงแล้ว"
     : pct >= 50 ? "พอใช้ได้ ลองกลับไปอ่านตารางเทคนิคด้านบนอีกรอบ โดยเฉพาะคอลัมน์จุดสังเกต"
     : "ยังต้องทบทวน ลองไล่อ่านตารางเทคนิคทั้ง 11 แบบแล้วเล่นใหม่อีกครั้ง");
  $("#seMeta").textContent = "";
  $("#seChannel").textContent = "";
  $("#seOptions").innerHTML = "";
  $("#seFeedback").classList.add("hidden");
  $("#seNext").disabled = true;
  $("#seIndex").textContent = "สรุปผล";
}

/* =========================================================================
   8) บทที่ 6 — MITM animation, ตาราง DoS/DDoS, การ์ดการโจมตีเครือข่าย
   ========================================================================= */
let mitmTimer = null;

/** แอนิเมชันแพ็กเก็ตวิ่งจาก A ไป B — โหมด normal ไม่มีคนกลาง, โหมด mitm มีคนกลางดัก */
function runMitm(mode) {
  clearInterval(mitmTimer);
  const packet = $("#mitmPacket");
  const lane = $("#mitmLane");
  const attacker = $("#attackerNode");
  const cap = $("#mitmCaption");

  attacker.classList.toggle("hidden", mode !== "mitm");

  // ระยะทางที่แพ็กเก็ตต้องวิ่ง (ความกว้างของเส้น wire)
  const wire = $(".wire", lane);
  const start = wire.offsetLeft;
  const span = wire.offsetWidth;

  let t = 0;                       // ความคืบหน้า 0 → 100
  packet.classList.remove("stolen");
  packet.style.left = start + "px";
  packet.textContent = "📦";

  cap.className = "mitm-caption" + (mode === "mitm" ? " bad" : "");
  cap.innerHTML = mode === "mitm"
    ? "<b>เริ่มส่ง:</b> A คิดว่ากำลังส่งตรงถึง B แต่จริง ๆ แล้วเส้นทางถูกเปลี่ยนให้ผ่านผู้โจมตีก่อน"
    : "<b>เริ่มส่ง:</b> ข้อมูลเดินทางจาก A ไป B โดยตรง ไม่มีใครแทรกกลาง";

  mitmTimer = setInterval(() => {
    t += 1.4;
    packet.style.left = (start + (span * t / 100)) + "px";

    // ถึงกลางทาง = ตำแหน่งของผู้โจมตี
    if (mode === "mitm" && t >= 48 && t < 52) {
      packet.classList.add("stolen");
      packet.textContent = "👁";
      cap.innerHTML = "<b>ตรงกลางทาง:</b> ผู้โจมตีอ่านและอาจแก้ไขข้อมูลได้ " +
        "ถ้าข้อมูลไม่ได้เข้ารหัส ทุกอย่างจะถูกอ่านเป็นข้อความธรรมดา";
    }

    if (t >= 100) {
      clearInterval(mitmTimer);
      packet.style.left = (start + span - 17) + "px";
      if (mode === "mitm") {
        cap.innerHTML = "<b>ถึงปลายทาง:</b> B ได้รับข้อมูลตามปกติจึงไม่รู้ตัวเลยว่าถูกดักกลางทาง — " +
          "นี่คือเหตุผลที่ MITM ตรวจจับยาก ทางแก้คือ <b>เข้ารหัสตั้งแต่ต้นทางถึงปลายทาง</b> และตรวจใบรับรองทุกครั้ง";
      } else {
        packet.textContent = "✅";
        cap.innerHTML = "<b>ถึงปลายทาง:</b> ข้อมูลถึง B ครบถ้วนโดยไม่มีใครแตะต้อง — " +
          "นี่คือสิ่งที่เราต้องการ และเป็นภาพเดียวกับที่เคยเห็นในเรื่องการรับส่งข้อมูลของเครือข่าย";
      }
    }
  }, 20);
}

function initMitm() {
  $("#playNormal").addEventListener("click", () => runMitm("normal"));
  $("#playMitm").addEventListener("click", () => runMitm("mitm"));
  $("#stopMitm").addEventListener("click", () => {
    clearInterval(mitmTimer);
    $("#mitmCaption").textContent = "หยุดแล้ว — กดปุ่มด้านบนเพื่อเล่นใหม่";
  });

  $("#dosTable tbody").innerHTML = DOS_COMPARE.map(r => `
    <tr>
      <td class="rowhead">${esc(r.topic)}</td>
      <td class="muted">${esc(r.dos)}</td>
      <td class="muted">${esc(r.ddos)}</td>
    </tr>`).join("");

  $("#netAttackGrid").innerHTML = NET_ATTACKS.map(a => `
    <article class="card" style="border-top:4px solid ${a.color}">
      <h3><span class="ico">${a.icon}</span> ${esc(a.name)}</h3>
      <div class="chips" style="margin-bottom:10px">
        <span class="badge plain">${esc(a.layer)}</span>
        ${ciaBadges(a.cia)}
      </div>
      <p style="font-size:.87rem;color:var(--text-dim)"><b>หลักการ:</b> ${esc(a.how)}</p>
      <p style="font-size:.87rem;color:var(--text-dim)"><b>ผลกระทบ:</b> ${esc(a.impact)}</p>
      <p style="font-size:.87rem;color:var(--ok);margin:0"><b>ป้องกัน:</b> ${esc(a.defense)}</p>
    </article>`).join("");
}

/* =========================================================================
   9) บทที่ 7 — ช่องโหว่เว็บและแอปพลิเคชัน
   แสดงตัวอย่างโค้ดคู่กัน: แบบที่มีช่องโหว่ กับแบบที่ปิดช่องโหว่แล้ว
   (เป็นตัวอย่างสมมติเพื่ออธิบายสาเหตุ ไม่ใช่ payload ที่ใช้โจมตีจริง)
   ========================================================================= */
function renderWebAttacks() {
  $("#webAttackList").innerHTML = WEB_ATTACKS.map(w => `
    <article class="web-card" style="--wc:${w.color}">
      <div class="web-head">
        <span class="wi">${w.icon}</span>
        <h3>${esc(w.name)}</h3>
        ${sevBars(w.sev)}
      </div>
      <p class="web-idea">${esc(w.idea)}</p>

      <div class="code-pair">
        <div>
          <div class="code-label">❌ ${esc(w.badLabel)}</div>
          <pre class="code-block bad">${esc(w.badCode)}</pre>
        </div>
        <div>
          <div class="code-label">✅ ${esc(w.goodLabel)}</div>
          <pre class="code-block good">${esc(w.goodCode)}</pre>
        </div>
      </div>

      <p class="muted" style="font-size:.88rem">${esc(w.explain)}</p>

      ${w.variants ? `<div class="variant-list">${w.variants.map(v =>
        `<div class="variant"><b>${esc(v.name)}</b>${esc(v.desc)}</div>`).join("")}</div>` : ""}

      <div class="web-cols">
        <div class="web-col">
          <h5>ผลกระทบ</h5>
          <ul class="tick">${w.impact.map(i => `<li>${esc(i)}</li>`).join("")}</ul>
        </div>
        <div class="web-col">
          <h5>วิธีป้องกัน</h5>
          <ul class="tick">${w.defense.map(d => `<li>${esc(d)}</li>`).join("")}</ul>
        </div>
      </div>
    </article>`).join("");
}

/* =========================================================================
   10) บทที่ 8 — Crypto, PKI, TLS handshake animation
   ========================================================================= */
function renderCrypto() {
  // ตารางแยก Encryption / Hashing / Encoding
  $("#cryptoCompareTable tbody").innerHTML = CRYPTO_COMPARE.map(r => `
    <tr>
      <td class="rowhead">${esc(r.topic)}</td>
      <td class="muted">${esc(r.enc)}</td>
      <td class="muted">${esc(r.hash)}</td>
      <td class="muted">${esc(r.encode)}</td>
    </tr>`).join("");

  // กล่องเทียบกุญแจเดียวกับกุญแจคู่ พร้อมภาพประกอบง่าย ๆ ด้วยอีโมจิ
  const keyBox = (d, visual) => `
    <h4><span class="ico">${d.icon}</span> ${esc(d.title)} <span class="muted" style="font-size:.8rem">(${esc(d.thai)})</span></h4>
    <div class="key-visual">${visual}</div>
    <div class="key-meta">
      <div class="row"><span class="k">กุญแจ</span><span class="v">${esc(d.keys)}</span></div>
      <div class="row"><span class="k">ความเร็ว</span><span class="v">${esc(d.speed)}</span></div>
      <div class="row"><span class="k">จุดอ่อน</span><span class="v">${esc(d.problem)}</span></div>
      <div class="row"><span class="k">จำนวนกุญแจ</span><span class="v">${esc(d.keyCount)}</span></div>
      <div class="row"><span class="k">ใช้ที่ไหน</span><span class="v">${esc(d.use)}</span></div>
    </div>
    <div class="chips" style="margin-top:12px">
      ${d.algo.map(a => `<span class="chip" style="cursor:default">${esc(a)}</span>`).join("")}
    </div>`;

  $("#symBox").innerHTML = keyBox(SYM_ASYM.sym, `
    <div class="kbox">🔒 เข้ารหัส</div>
    <span class="kk">🔑</span>
    <div class="kbox">🔓 ถอดรหัส</div>
    <div style="width:100%;text-align:center;font-size:.78rem;color:var(--text-mute)">กุญแจดอกเดียวกันทั้งสองฝั่ง</div>`);

  $("#asymBox").innerHTML = keyBox(SYM_ASYM.asym, `
    <div class="kbox">🔒 เข้ารหัสด้วย<br><b>Public Key</b></div>
    <span class="arrow">➜</span>
    <div class="kbox">🔓 ถอดรหัสด้วย<br><b>Private Key</b></div>
    <div style="width:100%;text-align:center;font-size:.78rem;color:var(--text-mute)">คนละดอก แต่เป็นคู่กัน</div>`);

  $("#hybridNote").textContent = SYM_ASYM.hybrid;
  $("#keyRules").innerHTML = SYM_ASYM.rules.map(r =>
    `<li><b>${esc(r.do)}</b> → ${esc(r.result)}</li>`).join("");

  // องค์ประกอบของ PKI
  $("#pkiGrid").innerHTML = PKI_PARTS.map(p => `
    <article class="card">
      <h3><span class="ico">${p.icon}</span> ${esc(p.name)}</h3>
      <p class="muted" style="font-size:.88rem;margin:0">${esc(p.desc)}</p>
    </article>`).join("");

  // Flow ของลายเซ็นดิจิทัล
  const flow = (arr) => arr.map(s =>
    `<div class="flow-step"><span class="sn">${s.step}</span><span>${esc(s.text)}</span></div>`).join("");
  $("#signFlow").innerHTML = flow(SIGN_FLOW.sign);
  $("#verifyFlow").innerHTML = flow(SIGN_FLOW.verify);
  $("#signNote").innerHTML = `<b>ข้อควรจำ:</b> ${esc(SIGN_FLOW.note)}`;

  $("#tlsNotes").innerHTML = TLS_NOTES.map(n => `<li>${esc(n)}</li>`).join("");
  renderTlsTrack();
}

/** วาดขั้นตอน TLS ทั้งหมดไว้ก่อน แล้วค่อยเปิดทีละขั้นตอนตอนเล่นแอนิเมชัน */
function renderTlsTrack() {
  $("#tlsTrack").innerHTML = TLS_STEPS.map(s => `
    <div class="tls-msg from-${s.from}" data-step="${s.n}">
      <div class="mtop">
        <span class="num">${s.n}</span>
        <span class="lbl">${esc(s.label)}</span>
        <span class="dir">${s.from === "client" ? "Client ──▶ Server" : s.from === "server" ? "Client ◀── Server" : "Client ◀──▶ Server"}</span>
      </div>
      <p class="det">${esc(s.detail)}</p>
      <div class="lay">🔗 ${esc(s.layer)}</div>
    </div>`).join("");
}

let tlsTimer = null;
function initTlsAnim() {
  const reset = () => {
    clearInterval(tlsTimer);
    $$("#tlsTrack .tls-msg").forEach(m => m.classList.remove("shown", "done"));
    $("#tlsSecure").classList.remove("shown");
  };

  $("#playTls").addEventListener("click", () => {
    reset();
    const msgs = $$("#tlsTrack .tls-msg");
    let i = 0;
    tlsTimer = setInterval(() => {
      if (i > 0) msgs[i - 1].classList.add("done");
      if (i >= msgs.length) {
        clearInterval(tlsTimer);
        $("#tlsSecure").classList.add("shown");
        return;
      }
      msgs[i].classList.add("shown");
      i++;
    }, 1000);
  });

  $("#resetTls").addEventListener("click", reset);
}

/* =========================================================================
   11) บทที่ 9 — Firewall / IDS-IPS / VPN-Proxy / Endpoint / DMZ / Zero Trust
   ========================================================================= */
function renderDefense() {
  // ตารางสามคู่เปรียบเทียบ ใช้รูปแบบเดียวกันทั้งหมด
  const twoCol = (sel, rows, k1, k2) => {
    $(sel).innerHTML = rows.map(r => `
      <tr>
        <td class="rowhead">${esc(r.topic)}</td>
        <td class="muted">${esc(r[k1])}</td>
        <td class="muted">${esc(r[k2])}</td>
      </tr>`).join("");
  };
  twoCol("#firewallTable tbody", FIREWALL_COMPARE, "stateless", "stateful");
  twoCol("#idsTable tbody", IDS_IPS, "ids", "ips");
  twoCol("#vpnTable tbody", VPN_PROXY, "vpn", "proxy");

  $("#firewallTypes").innerHTML = FIREWALL_TYPES.map(f => `
    <article class="card">
      <h3 style="font-size:.98rem">${esc(f.name)}</h3>
      <span class="badge plain">${esc(f.layer)}</span>
      <p class="muted" style="font-size:.86rem;margin:10px 0 0">${esc(f.desc)}</p>
    </article>`).join("");

  $("#endpointGrid").innerHTML = ENDPOINT_TOOLS.map(t => `
    <article class="card">
      <h3><span class="ico">${t.icon}</span> ${esc(t.name)}</h3>
      <p style="font-size:.87rem;color:var(--text-dim)"><b>ทำงานอย่างไร:</b> ${esc(t.how)}</p>
      <p style="font-size:.87rem;color:var(--warn)"><b>ข้อจำกัด:</b> ${esc(t.limit)}</p>
      <p style="font-size:.87rem;color:var(--text-dim);margin:0"><b>เหมาะกับ:</b> ${esc(t.fit)}</p>
    </article>`).join("");

  // แผนภาพ DMZ — แทรกกำแพง firewall ระหว่างโซน
  const zones = DMZ_ZONES.map((z, i) => {
    const wall = i > 0 ? `<div class="dmz-wall">🧱 FIREWALL</div>` : "";
    return wall + `
      <div class="dmz-zone" style="--zc:${z.color}">
        <div class="zi">${z.icon}</div>
        <h5>${esc(z.name)}</h5>
        <div class="zt">${esc(z.trust)}</div>
        <div class="zd">${esc(z.desc)}</div>
      </div>`;
  }).join("");
  const dmz = $("#dmzDiagram");
  dmz.style.gridTemplateColumns = "1fr auto 1fr auto 1fr auto 1fr";
  dmz.innerHTML = zones;

  $("#dmzRules").innerHTML = DMZ_RULES.map(r => `
    <div class="dmz-rule ${r.allow ? "allow" : "deny"}">
      <span class="path">${esc(r.from)} ──▶ ${esc(r.to)}</span>
      <span class="verdict">${r.allow ? "ALLOW" : "DENY"}</span>
      <span class="txt">${esc(r.text)}</span>
    </div>`).join("");

  // Zero Trust
  $("#ztSlogan").textContent = ZERO_TRUST.slogan;
  $("#ztOld").textContent = ZERO_TRUST.old;
  $("#ztWhy").textContent = ZERO_TRUST.why;
  $("#ztPrinciples").innerHTML = ZERO_TRUST.principles.map(p =>
    `<li><b>${esc(p.name)}</b> — ${esc(p.desc)}</li>`).join("");
}

/* =========================================================================
   12) บทที่ 10 — รหัสผ่าน, MFA, Onion diagram, Backup, CVSS, Framework
   ========================================================================= */
function renderPractice() {
  // นโยบายรหัสผ่าน
  $("#pwGood").innerHTML = PASSWORD_RULES.good.map(g =>
    `<li><b>${esc(g.rule)}</b> — ${esc(g.detail)}</li>`).join("");
  $("#pwBad").innerHTML = PASSWORD_RULES.bad.map(b => `<li>${esc(b)}</li>`).join("");
  $("#pwAttackTable tbody").innerHTML = PASSWORD_RULES.attacks.map(a => `
    <tr><td class="rowhead">${esc(a.name)}</td><td class="muted">${esc(a.desc)}</td></tr>`).join("");

  // การ์ดปัจจัย MFA
  $("#mfaGrid").innerHTML = MFA_FACTORS.map(m => `
    <article class="mfa-card" style="--mc:${m.color}">
      <div class="mi">${m.icon}</div>
      <h5>${esc(m.name)}</h5>
      <div class="th">${esc(m.thai)}</div>
      <ul>${m.examples.map(e => `<li>${esc(e)}</li>`).join("")}</ul>
      <div class="weak">⚠️ ${esc(m.weak)}</div>
    </article>`).join("");
  $("#mfaNotes").innerHTML = MFA_NOTES.map(n => `<li>${esc(n)}</li>`).join("");

  renderOnion();

  // กฎ 3-2-1
  $("#rule321").innerHTML = BACKUP_321.parts.map(p => `
    <div class="r">
      <div class="big">${esc(p.n)}</div>
      <h5>${esc(p.title)}</h5>
      <p>${esc(p.desc)}</p>
    </div>`).join("");
  $("#backupModern").innerHTML = `<b>รุ่นปรับปรุง:</b> ${esc(BACKUP_321.modern)}`;
  $("#backupMetrics").innerHTML = BACKUP_321.metrics.map(m =>
    `<li><b>${esc(m.name)}</b> — ${esc(m.desc)}</li>`).join("");
  $("#backupTypes tbody").innerHTML = BACKUP_321.types.map(t => `
    <tr>
      <td class="rowhead" title="${esc(t.desc)}">${esc(t.name)}</td>
      <td class="muted">${esc(t.speed)}</td>
      <td class="muted">${esc(t.space)}</td>
    </tr>`).join("");
  $("#privPrinciples").innerHTML = BACKUP_321.principles.map(p => `<li>${esc(p)}</li>`).join("");
  $("#irSteps").innerHTML = INCIDENT_STEPS.map(s =>
    `<li><b>${esc(s.name)}</b> (${esc(s.thai)}) — ${esc(s.desc)}</li>`).join("");

  // CVE / CVSS
  $("#cveWhat").textContent = CVE_INFO.what;
  $("#cveFormat").textContent = CVE_INFO.format;
  $("#cveParts").innerHTML = CVE_INFO.parts.map(p =>
    `<li><b>${esc(p.label)}</b> — ${esc(p.desc)}</li>`).join("");
  $("#cveRelated").innerHTML = CVE_INFO.related.map(r =>
    `<li><b>${esc(r.name)}</b> — ${esc(r.desc)}</li>`).join("");

  $("#cvssExamples").innerHTML = CVSS_EXAMPLES.map(e => {
    const band = CVSS_RANGES.find(b => e.score >= b.min && e.score <= b.max) || CVSS_RANGES[0];
    return `
      <div class="ex" style="--ec:${band.color}">
        <div class="top">
          <span class="s">${e.score.toFixed(1)}</span>
          <span class="badge plain">${esc(e.label)}</span>
          <span class="v">${esc(e.vector)}</span>
        </div>
        <div class="r"><b>อ่านว่า:</b> ${esc(e.read)}</div>
        <div class="vd">👉 ${esc(e.verdict)}</div>
      </div>`;
  }).join("");

  initCvssTool();

  $("#frameworkGrid").innerHTML = FRAMEWORKS.map(f => `
    <article class="card">
      <h3><span class="ico">${f.icon}</span> ${esc(f.name)}</h3>
      <p class="muted" style="font-size:.82rem;margin-bottom:8px">${esc(f.full)}</p>
      <p style="font-size:.87rem;color:var(--text-dim)">${esc(f.desc)}</p>
      <p style="font-size:.85rem;color:var(--accent);margin:0"><b>ใช้เมื่อไหร่:</b> ${esc(f.use)}</p>
    </article>`).join("");
}

/** วาดหัวหอม Defense in Depth เป็นวงกลมซ้อนกัน คลิกแต่ละวงได้ */
function renderOnion() {
  const total = DEFENSE_LAYERS.length;
  const maxR = 168;
  // วาดจากวงนอกสุด (ชั้นที่ 1) เข้าไปวงในสุด (ชั้นที่ 7) เพื่อให้วงในทับวงนอก
  const rings = DEFENSE_LAYERS.map((l, i) => {
    const r = maxR - (i * (maxR - 34) / total);
    const hue = 150 - i * 12;
    return `<circle class="onion-ring" data-idx="${i}" cx="190" cy="190" r="${r.toFixed(1)}"
              fill="hsl(${hue} 70% 45%)" fill-opacity="${(0.14 + i * 0.05).toFixed(2)}"
              stroke="hsl(${hue} 70% 50%)" stroke-width="1.6"><title>${esc(l.name)}</title></circle>`;
  }).join("");

  const labels = DEFENSE_LAYERS.map((l, i) => {
    const r = maxR - (i * (maxR - 34) / total);
    return `<text class="onion-label" x="190" y="${(190 - r + 15).toFixed(1)}" text-anchor="middle">${l.icon} ${esc(l.name)}</text>`;
  }).join("");

  $("#onionDiagram").innerHTML = `
    <svg class="onion-svg" viewBox="0 0 380 380" role="img" aria-label="แผนภาพ Defense in Depth">
      ${rings}${labels}
    </svg>`;

  $$(".onion-ring").forEach(c => c.addEventListener("click", () => showOnion(Number(c.dataset.idx))));
  showOnion(0);
}

function showOnion(idx) {
  const l = DEFENSE_LAYERS[idx];
  $$(".onion-ring").forEach((c, i) => c.classList.toggle("is-active", i === idx));
  $("#onionDetail").innerHTML = `
    <h3><span class="ico">${l.icon}</span> ชั้นที่ ${l.n}: ${esc(l.name)}</h3>
    <p class="muted">${esc(l.desc)}</p>
    <div class="code-label">ตัวอย่างมาตรการในชั้นนี้</div>
    <div class="chips">${l.ex.split(", ").map(e => `<span class="chip" style="cursor:default">${esc(e)}</span>`).join("")}</div>
    <p class="muted" style="margin-top:14px;font-size:.85rem">
      ชั้นที่ 1 คือวงนอกสุดที่ผู้โจมตีเจอก่อน ส่วนชั้นที่ ${DEFENSE_LAYERS.length} คือแกนกลาง —
      ต่อให้ชั้นนอกถูกเจาะ ชั้นถัดไปก็ยังต้องถูกเจาะอีก
    </p>`;
}

/**
 * เครื่องมืออ่านคะแนน CVSS แบบง่าย
 * หมายเหตุ: ใช้การถ่วงน้ำหนักอย่างง่ายเพื่อให้เห็น "แนวโน้ม" ว่าองค์ประกอบไหนดันคะแนนขึ้น
 * ไม่ใช่สูตรจริงของ CVSS v3.1 ซึ่งซับซ้อนกว่านี้มาก
 */
const cvssPick = {};
function initCvssTool() {
  $("#cvssMetrics").innerHTML = CVSS_METRICS.map(m => `
    <div class="cvss-metric" data-key="${m.key}">
      <div class="mname">${esc(m.key)} — ${esc(m.name)}</div>
      <div class="mthai">${esc(m.thai)}</div>
      <div class="cvss-opts">
        ${m.options.map((o, i) =>
          `<button class="cvss-opt ${i === 0 ? "is-active" : ""}" data-v="${esc(o.v)}" title="${esc(o.desc)}">${esc(o.label)}</button>`
        ).join("")}
      </div>
    </div>`).join("");

  // ค่าเริ่มต้นคือตัวเลือกแรกของทุกองค์ประกอบ (สถานการณ์ร้ายแรงที่สุด)
  CVSS_METRICS.forEach(m => { cvssPick[m.key] = m.options[0]; });

  $$(".cvss-opt").forEach(btn => {
    btn.addEventListener("click", () => {
      const wrap = btn.closest(".cvss-metric");
      const key = wrap.dataset.key;
      $$(".cvss-opt", wrap).forEach(b => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      const metric = CVSS_METRICS.find(m => m.key === key);
      cvssPick[key] = metric.options.find(o => o.v === btn.dataset.v);
      updateCvss();
    });
  });

  $("#cvssBands").innerHTML = CVSS_RANGES.map(b => `
    <div class="cvss-band" data-label="${b.label}">
      <i style="background:${b.color}"></i>
      <span>${b.label} · ${b.min.toFixed(1)}–${b.max.toFixed(1)}</span>
    </div>`).join("");

  updateCvss();
}

function updateCvss() {
  // รวมน้ำหนักที่เลือกแล้ว normalize ให้อยู่ในช่วง 0.0–10.0
  let got = 0, max = 0;
  CVSS_METRICS.forEach(m => {
    got += cvssPick[m.key].w;
    max += Math.max(...m.options.map(o => o.w));
  });
  const score = Math.round((got / max) * 100) / 10;
  const band = CVSS_RANGES.find(b => score >= b.min && score <= b.max) || CVSS_RANGES[0];

  $(".cvss-panel").style.setProperty("--sc", band.color);
  $("#cvssScore").textContent = score.toFixed(1);
  $("#cvssLevel").textContent = band.label;
  $("#cvssAction").textContent = band.action;
  $("#cvssVector").textContent = "CVSS:3.1/" + CVSS_METRICS.map(m => `${m.key}:${cvssPick[m.key].v}`).join("/");
  $$(".cvss-band").forEach(el => el.classList.toggle("is-active", el.dataset.label === band.label));
}

/* =========================================================================
   13) หน้า Quiz — เลือกทำทุกบทหรือเฉพาะบท, feedback ทันที, เก็บสถิติใน localStorage
   ========================================================================= */
const STATS_KEY = "cybersec_quiz_stats";
const quizState = {
  list: [],        // ชุดข้อสอบของรอบนี้
  idx: 0,
  score: 0,
  answered: false,
  wrong: [],       // เก็บข้อที่ตอบผิดไว้ทำ "ทบทวนเฉพาะข้อที่ผิด"
  chapters: new Set()
};

function loadStats() {
  try { return JSON.parse(localStorage.getItem(STATS_KEY)) || null; } catch { return null; }
}

function renderQuizStats() {
  const s = loadStats();
  const box = $("#quizStats");
  if (!s) {
    box.innerHTML = `<div class="stat"><div class="sv">—</div><div class="sl">ยังไม่มีสถิติ</div></div>`;
    return;
  }
  box.innerHTML = `
    <div class="stat"><div class="sv">${s.lastPct}%</div><div class="sl">คะแนนล่าสุด</div></div>
    <div class="stat"><div class="sv">${s.bestPct}%</div><div class="sl">คะแนนสูงสุด</div></div>
    <div class="stat"><div class="sv">${s.attempts}</div><div class="sl">จำนวนครั้งที่ทำ</div></div>
    <div class="stat"><div class="sv">${s.lastRaw}</div><div class="sl">ข้อที่ถูกครั้งล่าสุด</div></div>`;
}

function saveStats(score, total) {
  const pct = Math.round((score / total) * 100);
  const old = loadStats();
  const data = {
    lastPct: pct,
    bestPct: old ? Math.max(old.bestPct, pct) : pct,
    attempts: old ? old.attempts + 1 : 1,
    lastRaw: `${score}/${total}`,
    at: new Date().toISOString()
  };
  localStorage.setItem(STATS_KEY, JSON.stringify(data));
  renderQuizStats();
}

/** สร้างปุ่มเลือกบทสำหรับกรองข้อสอบ */
function renderQuizChips() {
  $("#quizChapterChips").innerHTML = CHAPTERS.map(c => {
    const n = QUIZ.filter(q => q.ch === c.no).length;
    return `<button class="chip" data-ch="${c.no}">${c.no}. ${esc(c.short)} (${n})</button>`;
  }).join("");

  $$("#quizChapterChips .chip").forEach(chip => {
    chip.addEventListener("click", () => {
      const n = Number(chip.dataset.ch);
      if (quizState.chapters.has(n)) quizState.chapters.delete(n);
      else quizState.chapters.add(n);
      chip.classList.toggle("is-active");
      updateQuizTotal();
    });
  });
}

/** อัปเดตตัวเลขจำนวนข้อที่จะได้ทำตามบทที่เลือก */
function pickQuizPool() {
  return quizState.chapters.size
    ? QUIZ.filter(q => quizState.chapters.has(q.ch))
    : QUIZ.slice();
}
function updateQuizTotal() {
  let n = pickQuizPool().length;
  if ($("#limitQuiz").checked) n = Math.min(n, 20);
  $("#quizTotalNum").textContent = n;
}

function initQuiz() {
  renderQuizChips();
  renderQuizStats();
  updateQuizTotal();

  $("#limitQuiz").addEventListener("change", updateQuizTotal);
  $("#startQuiz").addEventListener("click", () => startQuiz(pickQuizPool()));
  $("#retryQuiz").addEventListener("click", () => startQuiz(pickQuizPool()));
  $("#retryWrong").addEventListener("click", () => {
    if (!quizState.wrong.length) return;
    startQuiz(quizState.wrong.slice(), true);
  });
  $("#quitQuiz").addEventListener("click", showQuizStart);
  $("#backToStart").addEventListener("click", showQuizStart);
  $("#nextQ").addEventListener("click", nextQuestion);
  $("#clearStats").addEventListener("click", () => {
    localStorage.removeItem(STATS_KEY);
    renderQuizStats();
  });
}

function showPanel(which) {
  ["quizStart", "quizPlay", "quizResult"].forEach(id =>
    $("#" + id).classList.toggle("hidden", id !== which));
}
function showQuizStart() { showPanel("quizStart"); renderQuizStats(); updateQuizTotal(); }

/** เริ่มทำข้อสอบ — reviewMode = true คือโหมดทบทวนเฉพาะข้อที่ผิด (ไม่จำกัดจำนวน) */
function startQuiz(pool, reviewMode = false) {
  if (!pool.length) return;

  let list = $("#shuffleQuiz").checked ? shuffle(pool) : pool.slice();
  if (!reviewMode && $("#limitQuiz").checked) list = list.slice(0, 20);

  quizState.list = list;
  quizState.idx = 0;
  quizState.score = 0;
  quizState.wrong = [];

  showPanel("quizPlay");
  showQuestion();
}

function showQuestion() {
  const q = quizState.list[quizState.idx];
  quizState.answered = false;

  const ch = chapterByNo(q.ch);
  $("#qIndex").textContent = `ข้อ ${quizState.idx + 1} / ${quizState.list.length}`;
  $("#qCat").textContent = `บทที่ ${q.ch} · ${q.cat}`;
  $("#qScore").textContent = `ถูก ${quizState.score}`;
  $("#qText").textContent = q.q;
  $("#quizBarFill").style.width = ((quizState.idx) / quizState.list.length * 100) + "%";

  // สลับตัวเลือกด้วย แต่ยังต้องรู้ว่า index ไหนคือคำตอบที่ถูก
  const pairs = q.choices.map((text, i) => ({ text, correct: i === q.answer }));
  const shown = $("#shuffleQuiz").checked ? shuffle(pairs) : pairs;

  $("#qChoices").innerHTML = shown.map((c, i) => `
    <button class="choice" data-correct="${c.correct}">
      <span class="ck">${String.fromCharCode(65 + i)}</span>
      <span>${esc(c.text)}</span>
    </button>`).join("");

  $$("#qChoices .choice").forEach(btn =>
    btn.addEventListener("click", () => answerQuestion(btn, q)));

  $("#qFeedback").classList.add("hidden");
  $("#nextQ").disabled = true;
  $("#nextQ").textContent = quizState.idx === quizState.list.length - 1 ? "ดูผลสรุป →" : "ข้อถัดไป →";
}

function answerQuestion(btn, q) {
  if (quizState.answered) return;
  quizState.answered = true;

  const correct = btn.dataset.correct === "true";
  if (correct) quizState.score++;
  else quizState.wrong.push(q);

  $$("#qChoices .choice").forEach(b => {
    b.disabled = true;
    if (b.dataset.correct === "true") b.classList.add("correct");
    else if (b === btn) b.classList.add("wrong");
    else b.classList.add("dim");
  });

  const fb = $("#qFeedback");
  fb.className = "feedback " + (correct ? "ok" : "bad");
  $("#fbHead").textContent = correct ? "✅ ถูกต้อง!" : "❌ ยังไม่ถูก";
  $("#fbWhy").textContent = q.why;

  $("#qScore").textContent = `ถูก ${quizState.score}`;
  $("#nextQ").disabled = false;
}

function nextQuestion() {
  quizState.idx++;
  if (quizState.idx >= quizState.list.length) finishQuiz();
  else showQuestion();
}

function finishQuiz() {
  const total = quizState.list.length;
  const score = quizState.score;
  const pct = Math.round((score / total) * 100);

  showPanel("quizResult");
  $("#scoreRing").style.setProperty("--pct", pct);
  $("#scorePct").textContent = pct + "%";
  $("#scoreRaw").textContent = `${score} / ${total}`;

  // ข้อความสรุปตามช่วงคะแนน
  let verdict, advice;
  if (pct >= 90)      { verdict = "🏆 เยี่ยมมาก พร้อมสอบแล้ว"; advice = "ระดับนี้เข้าใจภาพรวมครบทุกบท ลองทบทวนเฉพาะข้อที่ผิดอีกรอบเพื่อเก็บให้เต็ม"; }
  else if (pct >= 75) { verdict = "👍 ดีมาก เหลืออีกนิดเดียว"; advice = "ดูหมวดที่ได้คะแนนน้อยที่สุดด้านล่าง แล้วกลับไปอ่านบทนั้นซ้ำหนึ่งรอบ"; }
  else if (pct >= 50) { verdict = "📚 พอใช้ได้ ต้องทบทวนเพิ่ม"; advice = "แนะนำให้ไล่อ่านบทที่ 3 และบทที่ 6 ก่อน เพราะเป็นสองบทที่มีน้ำหนักมากที่สุด"; }
  else                { verdict = "🔁 ยังต้องอ่านอีกเยอะ"; advice = "ลองเริ่มจาก Cheat Sheet และ Flashcards ก่อน แล้วค่อยกลับมาทำข้อสอบใหม่"; }
  $("#scoreVerdict").textContent = verdict;
  $("#scoreAdvice").textContent = advice;

  // แยกคะแนนตามบท
  const byCh = {};
  quizState.list.forEach(q => {
    byCh[q.ch] = byCh[q.ch] || { total: 0, correct: 0 };
    byCh[q.ch].total++;
  });
  quizState.list.forEach(q => {
    if (!quizState.wrong.includes(q)) byCh[q.ch].correct++;
  });

  $("#catBreakdown").innerHTML = Object.keys(byCh)
    .sort((a, b) => a - b)
    .map(ch => {
      const d = byCh[ch];
      const p = Math.round((d.correct / d.total) * 100);
      const c = chapterByNo(Number(ch));
      return `
        <div class="cat-row">
          <span class="cname">${ch}. ${esc(c.short)}</span>
          <span class="cbar"><i style="width:${p}%"></i></span>
          <span class="cnum">${d.correct}/${d.total}</span>
        </div>`;
    }).join("");

  // รายการข้อที่ตอบผิด พร้อมคำอธิบาย
  $("#retryWrong").classList.toggle("hidden", quizState.wrong.length === 0);
  $("#wrongList").innerHTML = quizState.wrong.length ? `
    <h4 style="font-size:1rem;margin-bottom:4px">ข้อที่ตอบผิด (${quizState.wrong.length} ข้อ)</h4>
    ${quizState.wrong.map(q => `
      <div class="wrong-item">
        <div class="wq">${esc(q.q)}</div>
        <div class="wa"><b class="ok">คำตอบที่ถูก:</b> ${esc(q.choices[q.answer])}</div>
        <div class="wa">${esc(q.why)}</div>
      </div>`).join("")}` : "";

  saveStats(score, total);
}

/* =========================================================================
   14) หน้า Flashcards — พลิกการ์ด, เลื่อนซ้าย-ขวา, สุ่มลำดับ, กรองตามบท
   ========================================================================= */
const fcState = { deck: [], idx: 0, filter: 0 };  // filter = 0 คือทุกบท

function initFlashcards() {
  // ปุ่มกรองตามบท
  $("#fcFilter").innerHTML =
    `<button class="chip is-active" data-ch="0">ทุกบท (${FLASHCARDS.length})</button>` +
    CHAPTERS.map(c => {
      const n = FLASHCARDS.filter(f => f.ch === c.no).length;
      return `<button class="chip" data-ch="${c.no}">${c.no}. ${esc(c.short)} (${n})</button>`;
    }).join("");

  $$("#fcFilter .chip").forEach(chip => {
    chip.addEventListener("click", () => {
      $$("#fcFilter .chip").forEach(c => c.classList.remove("is-active"));
      chip.classList.add("is-active");
      fcState.filter = Number(chip.dataset.ch);
      buildDeck();
    });
  });

  const card = $("#flashcard");
  const flip = () => card.classList.toggle("flipped");

  card.addEventListener("click", flip);
  card.addEventListener("keydown", e => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); flip(); }
  });
  $("#fcFlip").addEventListener("click", flip);
  $("#fcPrev").addEventListener("click", () => moveCard(-1));
  $("#fcNext").addEventListener("click", () => moveCard(1));
  $("#fcShuffle").addEventListener("click", () => { fcState.deck = shuffle(fcState.deck); fcState.idx = 0; showCard(); });
  $("#fcOrder").addEventListener("click", buildDeck);

  // ลูกศรซ้าย-ขวาบนคีย์บอร์ด ใช้ได้เฉพาะตอนอยู่หน้า Flashcards
  document.addEventListener("keydown", e => {
    if (!$("#flashcards").classList.contains("is-active")) return;
    if (e.target.tagName === "INPUT") return;
    if (e.key === "ArrowLeft")  moveCard(-1);
    if (e.key === "ArrowRight") moveCard(1);
    if (e.key === " " && e.target === document.body) { e.preventDefault(); flip(); }
  });

  buildDeck();
}

/** สร้างสำรับใหม่ตามตัวกรองบทที่เลือก */
function buildDeck() {
  fcState.deck = fcState.filter === 0
    ? FLASHCARDS.slice()
    : FLASHCARDS.filter(f => f.ch === fcState.filter);
  fcState.idx = 0;
  showCard();
}

function moveCard(step) {
  if (!fcState.deck.length) return;
  // วนกลับไปต้น/ท้ายสำรับเมื่อเลยขอบ
  fcState.idx = (fcState.idx + step + fcState.deck.length) % fcState.deck.length;
  showCard();
}

function showCard() {
  const card = $("#flashcard");
  card.classList.remove("flipped");     // กลับมาด้านหน้าเสมอเมื่อเปลี่ยนใบ

  if (!fcState.deck.length) {
    $("#fcQuestion").textContent = "ไม่มีการ์ดในบทนี้";
    $("#fcAnswer").textContent = "";
    $("#fcTag").textContent = "-";
    $("#fcCounter").textContent = "0 / 0";
    $("#fcProgressFill").style.width = "0%";
    return;
  }

  const c = fcState.deck[fcState.idx];
  $("#fcTag").textContent = `บทที่ ${c.ch} · ${c.tag}`;
  $("#fcQuestion").textContent = c.q;
  $("#fcAnswer").textContent = c.a;
  $("#fcCounter").textContent = `${fcState.idx + 1} / ${fcState.deck.length}`;
  $("#fcProgressFill").style.width = ((fcState.idx + 1) / fcState.deck.length * 100) + "%";
}

/* =========================================================================
   15) หน้า Cheat Sheet — ประกอบสรุปจากข้อมูลชุดเดียวกับที่ใช้ในบทต่าง ๆ
   ========================================================================= */
function renderCheatSheet() {
  const li = (html) => `<li>${html}</li>`;

  // 1) แนวคิดหลัก
  $("#sheetCia").innerHTML = CIA_TRIAD.map(c =>
    li(`<b>${c.key} — ${esc(c.name)}</b> (${esc(c.thai)}) — ${esc(c.short)}`)).join("");
  $("#sheetAaa").innerHTML = AAA_ITEMS.map(a =>
    li(`<b>${esc(a.name)}</b> — “${esc(a.q)}” ${esc(a.thai)}`)).join("");
  $("#sheetTerms").innerHTML = TERM_CONFUSION.map(t =>
    li(`<b>${esc(t.term)}</b> (${esc(t.thai)}) — ${esc(t.analogy)}`)).join("") +
    li(`<b>สูตร:</b> ${esc(RISK_FORMULA.formula)}`);

  // 2) ผู้โจมตี
  $("#sheetHackers").innerHTML = HACKER_TYPES.map(h =>
    li(`<b>${esc(h.name)}</b> — แรงจูงใจ: ${esc(h.motive)} · อันตราย ${h.danger}/5`)).join("") +
    li(`<b>Attack Surface</b> = มีกี่ทางเข้า · <b>Attack Vector</b> = เลือกเข้าทางไหน`);

  // 3) OSI (เรียงจาก L1 ขึ้นไป L7 เพื่อให้ทวนง่าย)
  $("#sheetOsi tbody").innerHTML = OSI_ATTACKS.slice().sort((a, b) => a.num - b.num).map(l => `
    <tr>
      <td class="lcell" style="--lc:${l.color}">L${l.num}</td>
      <td class="rowhead">${esc(l.name)}</td>
      <td class="muted">${l.attacks.map(a => esc(a.name)).join(" · ")}</td>
    </tr>`).join("");

  // 4) Malware
  $("#sheetMalware tbody").innerHTML = MALWARE.map(m => `
    <tr>
      <td class="rowhead">${m.icon} ${esc(m.name)}</td>
      <td class="muted">${esc(m.host)}</td>
      <td class="muted">${esc(m.action)}</td>
      <td class="muted">${esc(m.note)}</td>
    </tr>`).join("");

  // 5) Social Engineering
  $("#sheetSocial").innerHTML = SOCIAL_TECHS.map(t =>
    li(`<b>${esc(t.name)}</b> (${esc(t.channel)}) — ${esc(t.desc)}`)).join("");

  // 6) การโจมตีเครือข่าย
  $("#sheetNet").innerHTML = NET_ATTACKS.map(a =>
    li(`<b>${esc(a.name)}</b> [${esc(a.layer)}] — ${esc(a.impact)}`)).join("");
  $("#sheetDos").innerHTML = DOS_COMPARE.slice(0, 5).map(d =>
    li(`<b>${esc(d.topic)}</b> — DoS: ${esc(d.dos)} / DDoS: ${esc(d.ddos)}`)).join("");

  // 7) เว็บ
  $("#sheetWeb").innerHTML = WEB_ATTACKS.map(w =>
    li(`<b>${esc(w.name)}</b> — ${esc(w.idea)}`)).join("");

  // 8) Crypto
  $("#sheetCrypto").innerHTML = CRYPTO_COMPARE.slice(0, 5).map(c =>
    li(`<b>${esc(c.topic)}</b> — เข้ารหัส: ${esc(c.enc)} / แฮช: ${esc(c.hash)} / encode: ${esc(c.encode)}`)).join("") +
    li(`<b>Symmetric</b> กุญแจเดียว เร็ว · <b>Asymmetric</b> กุญแจคู่ ช้าแต่แก้ปัญหาการแลกกุญแจ`) +
    li(`<b>เซ็นด้วย Private Key ของผู้ส่ง</b> → Authenticity + Non-repudiation`);
  $("#sheetTls").innerHTML = TLS_STEPS.map(s =>
    li(`<b>${s.n}. ${esc(s.label)}</b> — ${esc(s.detail)}`)).join("");

  // 9) การป้องกัน
  $("#sheetDefense").innerHTML = [
    li(`<b>Stateless vs Stateful</b> — stateful จำสถานะการเชื่อมต่อ จึงอนุญาตขากลับอัตโนมัติและปลอดภัยกว่า`),
    li(`<b>IDS vs IPS</b> — IDS แจ้งเตือนอย่างเดียว (out-of-band) · IPS บล็อกได้ (in-line)`),
    li(`<b>VPN vs Proxy</b> — VPN ทั้งเครื่องและเข้ารหัส · Proxy เฉพาะแอปที่ตั้งค่าไว้`),
    li(`<b>AV vs EDR</b> — AV ใช้ signature · EDR ดูพฤติกรรมและย้อนดูเหตุการณ์ได้`)
  ].join("");
  $("#sheetZones").innerHTML = DMZ_ZONES.map(z =>
    li(`<b>${esc(z.name)}</b> — ${esc(z.trust)}: ${esc(z.desc)}`)).join("") +
    li(`<b>กฎสำคัญ:</b> DMZ ➜ Internal = DENY เป็นค่าพื้นฐาน`) +
    li(`<b>Zero Trust:</b> ${esc(ZERO_TRUST.slogan)}`);

  // 10) แนวปฏิบัติ
  $("#sheetPractice").innerHTML = MFA_FACTORS.slice(0, 3).map(m =>
    li(`<b>${esc(m.name)}</b> — ${m.examples.slice(0, 2).map(esc).join(", ")}`)).join("") +
    li(`<b>MFA จริง</b> ต้องมาจากคนละประเภทกัน`) +
    DEFENSE_LAYERS.map(l => li(`<b>ชั้น ${l.n} ${esc(l.name)}</b> — ${esc(l.ex)}`)).join("");
  $("#sheetCvss").innerHTML =
    li(`<b>กฎ 3-2-1</b> — สำเนา 3 ชุด · สื่อ 2 ประเภท · นอกสถานที่ 1 ชุด`) +
    li(`<b>RPO</b> ข้อมูลย้อนหลังที่ยอมให้หาย · <b>RTO</b> เวลาที่ต้องกู้ระบบคืน`) +
    li(`<b>CVE</b> ${esc(CVE_INFO.format)}`) +
    CVSS_RANGES.map(r => li(`<b>${r.label}</b> ${r.min.toFixed(1)}–${r.max.toFixed(1)} — ${esc(r.action)}`)).join("") +
    INCIDENT_STEPS.map(s => li(`<b>${s.n}. ${esc(s.name)}</b> ${esc(s.thai)}`)).join("");
}

function initPrint() {
  $("#printBtn").addEventListener("click", () => window.print());
}

/* =========================================================================
   เริ่มต้นระบบทั้งหมดเมื่อ DOM พร้อม
   ========================================================================= */
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initNav();

  // บทที่ 1
  renderSecCompare();
  renderCiaTriangle();
  renderCiaExtra();
  renderAAA();
  renderTerms();

  // บทที่ 2
  renderHackers();
  renderSurfaceMap();

  // บทที่ 3
  renderOsiAttacks();

  // บทที่ 4
  renderMalware();
  initVWAnim();

  // บทที่ 5
  renderSocialTable();
  initSocialGame();

  // บทที่ 6
  initMitm();

  // บทที่ 7
  renderWebAttacks();

  // บทที่ 8
  renderCrypto();
  initTlsAnim();

  // บทที่ 9
  renderDefense();

  // บทที่ 10
  renderPractice();

  // หน้าเสริม
  initQuiz();
  initFlashcards();
  renderCheatSheet();
  initPrint();
});
