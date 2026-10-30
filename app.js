// ═══════════════════════════════════════════════════════════
// FFCS Planner — UI layer
// ═══════════════════════════════════════════════════════════
window._state = {
  sel: { QQ:"TIME", HSM:"BAHUM109" },
  priorities: {},
  combos: [], curCombo: 0, warnings: [],
  occupied: {},         // slot key -> {code,type}  for current combo
  focus: null,          // course code currently cross-highlighted
  pinned: false,        // focus locked by click
  theme: "light"
};
const S = window._state;

// Theory and lab periods are offset from each other — a theory slot and a
// lab slot sharing the same column number start at different real times
// (per VIT's official grid). Keep both so every cell shows its true time.
const THEORY_COL_TIMES = ["8:00","9:00","10:00","11:00","12:00","",
                          "2:00","3:00","4:00","5:00","6:00",""];
const LAB_COL_TIMES = ["8:00","8:51","9:51","10:41","11:40","12:31",
                       "2:00","2:51","3:51","4:41","5:40","6:31"];
// Back-compat alias for any stray reference — defaults to theory timing.
const COL_TIMES = THEORY_COL_TIMES;

// Source data is ALL CAPS; soften it for display, keep slot codes as-is.
const titleCase = s => String(s).toLowerCase()
  .replace(/(^|[\s.&/-])([a-z])/g, (m, a, b) => a + b.toUpperCase());
const shortFac = s => {
  const first = titleCase(s).split(" ")[0];
  return first.length > 13 ? first.slice(0, 12) + "…" : first;
};

// ── colour helpers (inline tints keep PNG export faithful) ──
const hex2rgb = h => {
  h = h.replace("#","");
  return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)];
};
const mix = (a, b, t) => {
  const A = hex2rgb(a), B = hex2rgb(b);
  return `rgb(${A.map((v,i)=>Math.round(v+(B[i]-v)*t)).join(",")})`;
};
function tints(courseHex){
  const dark = S.theme === "dark";
  const base = dark ? "#232820" : "#FAFBF8";
  const ink  = dark ? "#E9ECE4" : "#1C1F1C";
  return {
    bg:   mix(courseHex, base, dark ? .74 : .84),
    bgHi: mix(courseHex, base, dark ? .58 : .70),
    fg:   mix(courseHex, ink,  dark ? .62 : .22)
  };
}

// ═══════════════════════════════════════════════════════════
// GENERATE  (algorithm unchanged)
// ═══════════════════════════════════════════════════════════
function generate() {
  const codes = Object.keys(COURSES);
  const MAX = 50;
  const combos = [], warnings = [];

  // A course with nobody ranked is left out entirely — it is never
  // auto-filled with a random faculty. Only ranked faculty are ever used.
  const coursePairs = {}, unranked = {};
  codes.forEach(code => {
    const all = buildPairs(code);
    const prios = S.priorities[code] || [];
    const prioDisplays = prios.map(p => p.display);
    const ordered = [];
    all.forEach(p => {
      const idx = prioDisplays.indexOf(p.display);
      if (idx >= 0) ordered[idx] = p;
    });
    coursePairs[code] = ordered.filter(Boolean);
    unranked[code] = prios.length === 0;
  });

  function backtrack(idx, current, used) {
    if (combos.length >= MAX) return;
    if (idx === codes.length) { combos.push([...current]); return; }
    const code = codes[idx];
    const pairs = coursePairs[code] || [];
    let placed = false;
    for (const pair of pairs) {
      const keys = [
        ...(pair.theory ? slotKeys(pair.theory.slot) : []),
        ...(pair.lab    ? slotKeys(pair.lab.slot)    : [])
      ];
      if (keys.some(k => used.has(k))) continue;
      keys.forEach(k => used.add(k));
      current.push({ code, pair });
      backtrack(idx + 1, current, used);
      current.pop();
      keys.forEach(k => used.delete(k));
      placed = true;
      if (combos.length >= MAX) return;
    }
    if (!placed || pairs.length === 0) {
      const reasons = [];
      pairs.forEach(pair => {
        const keys = [
          ...(pair.theory ? slotKeys(pair.theory.slot) : []),
          ...(pair.lab    ? slotKeys(pair.lab.slot)    : [])
        ];
        keys.forEach(k => {
          if (!used.has(k)) return;
          const blocker = current.find(({pair:p}) => {
            if (!p) return false;
            const bk = [
              ...(p.theory ? slotKeys(p.theory.slot) : []),
              ...(p.lab    ? slotKeys(p.lab.slot)    : [])
            ];
            return bk.includes(k);
          });
          if (blocker) reasons.push(COURSES[blocker.code].short);
        });
      });
      current.push({
        code, pair: null,
        clashWith: [...new Set(reasons)].slice(0,2).join(" and "),
        noPrio: unranked[code]
      });
      backtrack(idx + 1, current, used);
      current.pop();
    }
  }

  backtrack(0, [], new Set());
  S.combos = combos; S.curCombo = 0; S.warnings = warnings;
  S.focus = null; S.pinned = false;
  renderResults();
}

// ═══════════════════════════════════════════════════════════
// RAIL
// ═══════════════════════════════════════════════════════════
function render() {
  saveState();
  renderSelectors();
  renderCards();
  renderResults();
}

function renderSelectors() {
  seg("sel-QQ", "QQ", COURSES.QQ.selectorOptions, {});
}

function seg(elId, key, opts, names) {
  const el = document.getElementById(elId);
  if (!el) return;
  el.innerHTML = "";
  opts.forEach(opt => {
    const b = document.createElement("button");
    b.className = "seg-btn" + (S.sel[key] === opt ? " on" : "");
    b.textContent = names[opt] || opt;
    b.onclick = () => { S.sel[key] = opt; S.priorities[key] = []; S.combos = []; render(); };
    el.appendChild(b);
  });
}

function renderCards() {
  const el = document.getElementById("course-cards");
  if (!el) return;
  const openNow = new Set([...el.querySelectorAll(".cc.open")].map(n => n.dataset.code));
  el.innerHTML = "";
  // Courses that make you pick a specific option first (only HSM right now —
  // the skills vendor has its own picker pinned at the top of the rail).
  const inlinePickers = Object.keys(COURSES).filter(
    code => COURSES[code].isSelector && COURSES[code].selectorKey !== "QQ"
  );

  Object.keys(COURSES).forEach(code => {
    const c = COURSES[code];
    const n = (S.priorities[code] || []).length;
    const div = document.createElement("div");
    div.className = "cc" + (openNow.has(code) ? " open" : "");
    div.dataset.code = code;
    div.style.setProperty("--c", c.color);
    const pickerHtml = inlinePickers.includes(code)
      ? `<div class="pick"><span class="pick-l">Which course</span><div class="seg" id="cc-seg-${code}"></div></div>`
      : "";
    div.innerHTML = `
      <div class="cc-hdr">
        <span class="cc-swatch"></span>
        <span class="cc-name">${c.name}</span>
        <span class="cc-count${n ? "" : " zero"}">${n}</span>
        <span class="cc-caret">▼</span>
      </div>
      <div class="cc-body">
        ${pickerHtml}
        <div class="cc-chips" id="chips-${code}"></div>
        <div class="cc-search">
          <input class="cc-input" id="ci-${code}" placeholder="Search faculty" autocomplete="off" spellcheck="false">
          <div class="cc-drop" id="cd-${code}"></div>
        </div>
      </div>`;
    div.querySelector(".cc-hdr").onclick = () => div.classList.toggle("open");
    el.appendChild(div);
    if (inlinePickers.includes(code)) {
      seg(`cc-seg-${code}`, c.selectorKey, c.selectorOptions, c.selectorNames || {});
    }
    renderChips(code);
    bindSearch(code);
  });
}

function renderChips(code) {
  const el = document.getElementById("chips-" + code);
  if (!el) return;
  const prios = S.priorities[code] || [];
  el.innerHTML = "";
  if (!prios.length) {
    el.innerHTML = `<div class="cc-empty">Nobody ranked — this course won't be included.</div>`;
    return;
  }
  prios.forEach((pair, i) => {
    const slot = pair.theory
      ? pair.theory.slot + (pair.lab ? "  →  " + pair.lab.slot : "")
      : pair.lab.slot;
    const ch = document.createElement("div");
    ch.className = "chip"; ch.draggable = true;
    ch.innerHTML = `
      <span class="chip-n">${i + 1}</span>
      <span class="chip-body">
        <span class="chip-fac">${titleCase(pair.faculty)}</span>
        <span class="chip-slot">${slot}</span>
      </span>
      <button class="chip-x" aria-label="Remove">×</button>`;
    ch.querySelector(".chip-x").onclick = e => {
      e.stopPropagation();
      S.priorities[code].splice(i, 1);
      renderChips(code); bumpCount(code); saveState();
    };
    ch.addEventListener("dragstart", e => {
      e.dataTransfer.setData("text/plain", JSON.stringify({ code, idx: i }));
      ch.classList.add("dragging");
    });
    ch.addEventListener("dragend", () => ch.classList.remove("dragging"));
    ch.addEventListener("dragover", e => { e.preventDefault(); ch.classList.add("over"); });
    ch.addEventListener("dragleave", () => ch.classList.remove("over"));
    ch.addEventListener("drop", e => {
      e.preventDefault(); ch.classList.remove("over");
      const d = JSON.parse(e.dataTransfer.getData("text/plain"));
      if (d.code !== code) return;
      const [m] = S.priorities[code].splice(d.idx, 1);
      S.priorities[code].splice(i, 0, m);
      renderChips(code); saveState();
    });
    el.appendChild(ch);
  });
}

function bumpCount(code) {
  const card = document.querySelector(`.cc[data-code="${code}"] .cc-count`);
  if (!card) return;
  const n = (S.priorities[code] || []).length;
  card.textContent = n;
  card.classList.toggle("zero", n === 0);
}

function addPriority(code, pair) {
  if (!S.priorities[code]) S.priorities[code] = [];
  if (S.priorities[code].some(p => p.display === pair.display)) return false;
  S.priorities[code].push(pair);
  renderChips(code); bumpCount(code); saveState();
  return true;
}

function pairSlot(p) {
  return p.theory ? p.theory.slot + (p.lab ? " → " + p.lab.slot : "") : p.lab.slot;
}

function bindSearch(code) {
  const inp = document.getElementById("ci-" + code);
  const drop = document.getElementById("cd-" + code);
  if (!inp || !drop) return;
  inp.addEventListener("input", () => {
    const q = inp.value.toLowerCase().trim();
    drop.innerHTML = "";
    if (!q) { drop.classList.remove("on"); return; }
    const matches = buildPairs(code).filter(p => p.faculty.toLowerCase().includes(q));
    if (!matches.length) { drop.classList.remove("on"); return; }
    matches.slice(0, 12).forEach(pair => {
      const item = document.createElement("div");
      item.className = "drop-i";
      item.innerHTML = `<span class="drop-f">${titleCase(pair.faculty)}</span><span class="drop-s">${pairSlot(pair)}</span>`;
      item.onmousedown = e => {
        e.preventDefault();
        addPriority(code, pair);
        inp.value = ""; drop.classList.remove("on");
      };
      drop.appendChild(item);
    });
    drop.classList.add("on");
  });
  inp.addEventListener("blur", () => setTimeout(() => drop.classList.remove("on"), 160));
}

// ═══════════════════════════════════════════════════════════
// RESULTS
// ═══════════════════════════════════════════════════════════
function renderResults() {
  const el = document.getElementById("results");
  if (!el) return;

  if (!S.combos.length) {
    el.innerHTML = `
      ${S.warnings.map(w => `<div class="warn-row">${w}</div>`).join("")}
      <div class="blank">
        <svg class="blank-mark" viewBox="0 0 24 24">
          <rect x="1" y="1" width="6" height="6" rx="1"/><rect x="9" y="1" width="6" height="6" rx="1"/>
          <rect x="17" y="1" width="6" height="6" rx="1"/><rect x="1" y="9" width="6" height="6" rx="1"/>
          <rect x="9" y="9" width="6" height="6" rx="1"/><rect x="17" y="9" width="6" height="6" rx="1"/>
          <rect x="1" y="17" width="6" height="6" rx="1"/><rect x="9" y="17" width="6" height="6" rx="1"/>
          <rect x="17" y="17" width="6" height="6" rx="1"/>
        </svg>
        <div class="blank-t">No timetable yet</div>
        <div class="blank-s">Rank the faculty you want in the panel on the left, then generate. A course with nobody ranked is left out of the timetable.</div>
      </div>`;
    return;
  }

  const combo = S.combos[S.curCombo];
  const stats = computeStats(combo);
  S.occupied = stats.occupied;

  el.innerHTML = `
    ${S.warnings.map(w => `<div class="warn-row">${w}</div>`).join("")}
    <div class="bento">
      <div class="tile t-nav">
        <div>
          <div class="t-lbl">Timetable</div>
          <div class="t-num"><span id="n-cur">${S.curCombo + 1}</span><span class="of"> / ${S.combos.length}${S.combos.length === 50 ? "+" : ""}</span></div>
        </div>
        <div class="nav-row">
          <button class="nav-b" id="prev-b" ${S.curCombo === 0 ? "disabled" : ""} aria-label="Previous">‹</button>
          <button class="nav-b" id="next-b" ${S.curCombo === S.combos.length - 1 ? "disabled" : ""} aria-label="Next">›</button>
          <div class="nav-rail"><div class="nav-fill" style="width:${((S.curCombo + 1) / S.combos.length) * 100}%"></div></div>
        </div>
      </div>

      <div class="tile t-stat">
        <div class="t-lbl">Credits</div>
        <div><div class="t-num" id="n-cred">${stats.credits}</div>
        <div class="t-sub">${stats.placed} of ${Object.keys(COURSES).length} courses placed</div></div>
      </div>

      <div class="tile t-stat">
        <div class="t-lbl">Lab-free days</div>
        <div><div class="t-num${stats.freeDays === 0 ? " warn" : ""}" id="n-free">${stats.freeDays}</div>
        <div class="t-sub">${stats.freeNames.length ? stats.freeNames.join(", ") : "Labs every day"}</div></div>
      </div>

      <div class="tile t-load">
        <div class="t-lbl">Weekly load</div>
        ${loadMeter(stats)}
      </div>
    </div>

    <div class="tile t-grid">
      <div class="grid-head">
        <span class="grid-title">Week</span>
        <div class="legend">${legend(combo)}</div>
        <button class="btn-png" id="png-b">Save image</button>
      </div>
      ${buildGrid(combo)}
      ${buildAgenda(combo)}
    </div>

    ${stats.flags.length ? `<div class="strip">${stats.flags.join("")}</div>` : ""}`;

  wireResults();
}

function computeStats(combo) {
  let credits = 0, placed = 0;
  const occupied = {}, labDays = new Set(), dayCells = {}, flags = [], clashes = new Set();
  DAYS.forEach(d => dayCells[d] = []);

  combo.forEach(({ code, pair, clashWith, noPrio }) => {
    if (!pair) {
      const msg = noPrio
        ? "not ranked — rank a faculty to include it"
        : `doesn't fit${clashWith ? ` — ${clashWith} holds those slots` : ""}`;
      flags.push(`<div class="flag miss" data-miss="${code}">
        <span class="flag-k">${COURSES[code].short}</span>
        <span class="flag-t">${msg}</span>
      </div>`);
      return;
    }
    placed++; credits += COURSES[code].credits;
    ["theory", "lab"].forEach(kind => {
      if (!pair[kind]) return;
      slotCells(pair[kind].slot).forEach(c => {
        if (kind === "lab") labDays.add(c.day);
        dayCells[c.day].push(code);
      });
      slotKeys(pair[kind].slot).forEach(k => {
        if (occupied[k]) clashes.add(`${COURSES[code].short} overlaps ${COURSES[occupied[k].code].short}`);
        else occupied[k] = { code, type: kind };
      });
    });
  });

  [...clashes].slice(0, 3).forEach(c =>
    flags.push(`<div class="flag"><span class="flag-k">Overlap</span><span class="flag-t">${c}</span></div>`));

  const freeNames = DAYS.filter(d => !labDays.has(d));
  return { credits, placed, occupied, dayCells, labDays, freeDays: freeNames.length, freeNames, flags };
}

function loadMeter(stats) {
  const max = Math.max(1, ...DAYS.map(d => stats.dayCells[d].length));
  return `<div class="load-bars">` + DAYS.map(d => {
    const list = stats.dayCells[d];
    const isFree = !stats.labDays.has(d);
    const segs = list.length
      ? list.map((code, i) => `<div class="load-seg" style="--c:${COURSES[code].color};height:${(1 / max) * 100}%;animation-delay:${i * 28}ms"></div>`).join("")
      : `<div class="load-free"></div>`;
    return `<div class="load-col">
      <div class="load-stack">${segs}</div>
      <div class="load-d${isFree ? " free" : ""}">${d[0]}</div>
    </div>`;
  }).join("") + `</div>`;
}

function legend(combo) {
  return combo.filter(x => x.pair).map(({ code }) => {
    const c = COURSES[code];
    return `<button class="leg" data-leg="${code}" style="--c:${c.color}">
      <span class="leg-d"></span>${c.short}</button>`;
  }).join("");
}

// ── the grid ────────────────────────────────────────────────
function buildGrid(combo) {
  const grid = {};
  DAYS.forEach(d => { grid[d] = {}; });
  combo.forEach(({ code, pair }) => {
    if (!pair) return;
    ["theory", "lab"].forEach(kind => {
      if (!pair[kind]) return;
      slotCells(pair[kind].slot).forEach(cell => {
        const wantLab = kind === "lab";
        if (cell.isLab === wantLab && grid[cell.day]) grid[cell.day][cell.col] = { code, kind, entry: pair[kind] };
      });
    });
  });

  let h = `<div class="tt-scroll"><table class="tt"><thead><tr><th class="tt-corner"></th>`;
  for (let i = 0; i < 12; i++) {
    if (i === 6) h += `<th class="tt-gap"></th>`;
    const th = THEORY_COL_TIMES[i], lb = LAB_COL_TIMES[i];
    const timeLabel = th ? (th === lb ? th : `${th} / ${lb}`) : lb;
    h += `<th class="tt-col"><span class="tt-p">P${i + 1}</span><span class="tt-time">${timeLabel}</span></th>`;
  }
  h += `</tr></thead><tbody>`;

  DAYS.forEach((day, di) => {
    const restDay = !Object.values(grid[day]).some(x => x && x.kind === "lab");
    h += `<tr><th class="tt-day${restDay ? " rest" : ""}">${day}</th>`;
    for (let col = 0; col < 12; col++) {
      if (col === 6) h += `<td class="tt-gap"></td>`;
      const hit = grid[day][col];
      if (hit) {
        const c = COURSES[hit.code];
        const t = tints(c.color);
        const slot = (hit.kind === "lab" ? DAY_LAB[day][col] : DAY_THEORY[day][col]) || "";
        const cellTime = hit.kind === "lab" ? LAB_COL_TIMES[col] : THEORY_COL_TIMES[col];
        h += `<td class="cell on" data-course="${hit.code}" data-dk="${day}-${col}"
          data-fac="${hit.entry.f}" data-venue="${hit.entry.venue || ""}" data-slot="${hit.entry.slot}" data-time="${cellTime}"
          style="--c:${c.color};--bg:${t.bg};--bg-hi:${t.bgHi};--fg:${t.fg};animation-delay:${(di * 12 + col) * 7}ms">
          <div class="cell-in">
            <span class="cell-code">${c.short}</span>
            <span class="cell-fac">${shortFac(hit.entry.f)}</span>
            <span class="cell-slot">${slot}</span>
          </div></td>`;
      } else {
        const th = DAY_THEORY[day][col], lb = DAY_LAB[day][col];
        h += `<td class="cell free" data-dk="${day}-${col}"><span class="ghost">${[th, lb].filter(Boolean).join("/")}</span></td>`;
      }
    }
    h += `</tr>`;
  });
  return h + `</tbody></table></div>`;
}

function buildAgenda(combo) {
  const byDay = {};
  DAYS.forEach(d => byDay[d] = []);
  combo.forEach(({ code, pair }) => {
    if (!pair) return;
    ["theory", "lab"].forEach(kind => {
      if (!pair[kind]) return;
      slotCells(pair[kind].slot).forEach(cell => {
        if (cell.isLab !== (kind === "lab")) return;
        byDay[cell.day].push({ code, kind, col: cell.col, entry: pair[kind] });
      });
    });
  });

  return `<div class="agenda">` + DAYS.map(day => {
    const rows = byDay[day].sort((a, b) => a.col - b.col);
    return `<div class="ag-day">
      <div class="ag-h"><span class="ag-d">${day}</span>
        <span class="ag-n">${rows.length ? rows.length + " classes" : "nothing scheduled"}</span></div>
      ${rows.map(r => {
        const c = COURSES[r.code]; const t = tints(c.color);
        return `<div class="ag-row" style="--c:${c.color};background:${t.bg}">
          <span class="ag-t">${(r.kind === "lab" ? LAB_COL_TIMES : THEORY_COL_TIMES)[r.col]}</span>
          <span class="ag-b"><span class="ag-c" style="color:${t.fg}">${c.short}${r.kind === "lab" ? " lab" : ""}</span>
          <span class="ag-f">${titleCase(r.entry.f)}</span></span>
          <span class="ag-s">${r.entry.venue || ""}</span></div>`;
      }).join("")}
    </div>`;
  }).join("") + `</div>`;
}

// ── wiring after each results render ────────────────────────
function wireResults() {
  const prev = document.getElementById("prev-b"), next = document.getElementById("next-b");
  if (prev) prev.onclick = () => navCombo(-1);
  if (next) next.onclick = () => navCombo(1);
  const png = document.getElementById("png-b");
  if (png) png.onclick = exportPNG;

  document.querySelectorAll(".cell.on").forEach(cell => {
    cell.addEventListener("mouseenter", () => { if (!S.pinned) setFocus(cell.dataset.course); showTip(cell); });
    cell.addEventListener("mousemove", moveTip);
    cell.addEventListener("mouseleave", () => { if (!S.pinned) setFocus(null); hideTip(); });
    cell.addEventListener("click", () => togglePin(cell.dataset.course));
  });

  document.querySelectorAll(".leg").forEach(btn => {
    btn.addEventListener("mouseenter", () => { if (!S.pinned) setFocus(btn.dataset.leg); });
    btn.addEventListener("mouseleave", () => { if (!S.pinned) setFocus(null); });
    btn.addEventListener("click", () => togglePin(btn.dataset.leg));
  });

  document.querySelectorAll(".flag.miss").forEach(flag => {
    flag.addEventListener("mouseenter", () => knockBlockers(flag.dataset.miss));
  });

  if (S.focus) paintFocus();
}

function setFocus(code) { S.focus = code; paintFocus(); }

function togglePin(code) {
  if (S.pinned && S.focus === code) { S.pinned = false; S.focus = null; }
  else { S.pinned = true; S.focus = code; }
  paintFocus();
}

function paintFocus() {
  const tt = document.querySelector(".tt");
  if (tt) tt.classList.toggle("focusing", !!S.focus);
  document.querySelectorAll(".cell.on").forEach(c =>
    c.classList.toggle("hit", c.dataset.course === S.focus));
  document.querySelectorAll(".leg").forEach(l => {
    l.classList.toggle("pinned", S.pinned && l.dataset.leg === S.focus);
    l.classList.toggle("muted", !!S.focus && l.dataset.leg !== S.focus);
  });
}

// hovering an unplaced course knocks the cells standing in its way
function knockBlockers(code) {
  const blocked = new Set();
  buildPairs(code).forEach(pair => {
    ["theory", "lab"].forEach(kind => {
      if (!pair[kind]) return;
      slotKeys(pair[kind].slot).forEach(k => {
        if (S.occupied[k]) blocked.add(k.split("-").slice(0, 2).join("-"));
      });
    });
  });
  blocked.forEach(dk => {
    const cell = document.querySelector(`.cell[data-dk="${dk}"]`);
    if (!cell) return;
    cell.classList.remove("blocked");
    void cell.offsetWidth;
    cell.classList.add("blocked");
    setTimeout(() => cell.classList.remove("blocked"), 1200);
  });
}

function navCombo(d) {
  const n = Math.max(0, Math.min(S.combos.length - 1, S.curCombo + d));
  if (n === S.curCombo) return;
  S.curCombo = n;
  S.focus = null; S.pinned = false;
  renderResults();
}

// ═══════════════════════════════════════════════════════════
// TOOLTIP
// ═══════════════════════════════════════════════════════════
const tip = () => document.getElementById("tip");
function showTip(cell) {
  const t = tip(); if (!t) return;
  const c = COURSES[cell.dataset.course];
  t.innerHTML = `<div class="tip-f">${titleCase(cell.dataset.fac)}</div>
    <div class="tip-m">${c.name}</div>
    <div class="tip-m">${cell.dataset.slot}${cell.dataset.venue ? " · " + cell.dataset.venue : ""}${cell.dataset.time ? " · " + cell.dataset.time : ""}</div>`;
  t.hidden = false;
}
function moveTip(e) {
  const t = tip(); if (!t || t.hidden) return;
  const pad = 14;
  let x = e.clientX + pad, y = e.clientY + pad;
  const r = t.getBoundingClientRect();
  if (x + r.width > innerWidth - 8) x = e.clientX - r.width - pad;
  if (y + r.height > innerHeight - 8) y = e.clientY - r.height - pad;
  t.style.left = x + "px"; t.style.top = y + "px";
}
function hideTip() { const t = tip(); if (t) t.hidden = true; }

// ═══════════════════════════════════════════════════════════
// COMMAND PALETTE
// ═══════════════════════════════════════════════════════════
let palItems = [], palCursor = 0;

function openPalette() {
  const p = document.getElementById("palette");
  p.hidden = false;
  const inp = document.getElementById("palette-input");
  inp.value = ""; inp.focus();
  fillPalette("");
}
function closePalette() { document.getElementById("palette").hidden = true; }

function fillPalette(q) {
  q = q.toLowerCase().trim();
  const list = document.getElementById("palette-list");
  palItems = [];
  Object.keys(COURSES).forEach(code => {
    buildPairs(code).forEach(pair => {
      if (q && !pair.faculty.toLowerCase().includes(q)) return;
      palItems.push({ code, pair });
    });
  });
  palItems = palItems.slice(0, 60);
  palCursor = 0;
  if (!palItems.length) {
    list.innerHTML = `<div class="pal-none">No faculty matches that name.</div>`;
    return;
  }
  list.innerHTML = palItems.map(({ code, pair }, i) => {
    const c = COURSES[code];
    return `<div class="pal-i${i === 0 ? " cursor" : ""}" data-i="${i}" style="--c:${c.color}">
      <span class="pal-d"></span>
      <span class="pal-f">${titleCase(pair.faculty)}</span>
      <span class="pal-c">${c.short}</span>
      <span class="pal-s">${pairSlot(pair)}</span>
    </div>`;
  }).join("");
  list.querySelectorAll(".pal-i").forEach(n => {
    n.onmousedown = e => { e.preventDefault(); choosePal(+n.dataset.i); };
  });
}

function movePal(d) {
  if (!palItems.length) return;
  palCursor = (palCursor + d + palItems.length) % palItems.length;
  const list = document.getElementById("palette-list");
  list.querySelectorAll(".pal-i").forEach((n, i) => n.classList.toggle("cursor", i === palCursor));
  const cur = list.querySelector(".pal-i.cursor");
  if (cur) cur.scrollIntoView({ block: "nearest" });
}

function choosePal(i) {
  const it = palItems[i];
  if (!it) return;
  addPriority(it.code, it.pair);
  const card = document.querySelector(`.cc[data-code="${it.code}"]`);
  if (card) card.classList.add("open");
  closePalette();
}

// ═══════════════════════════════════════════════════════════
// THEME
// ═══════════════════════════════════════════════════════════
function setTheme(t) {
  S.theme = t;
  document.documentElement.setAttribute("data-theme", t);
  try { localStorage.setItem("ffcs_theme", t); } catch (e) {}
  if (S.combos.length) renderResults();   // re-tint cells for the new ground
}
function toggleTheme() { setTheme(S.theme === "dark" ? "light" : "dark"); }

// ═══════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════
function exportPNG() {
  const el = document.querySelector(".t-grid");
  if (!el || typeof html2canvas === "undefined") return;
  const bg = getComputedStyle(document.body).backgroundColor;
  html2canvas(el, { backgroundColor: bg, scale: 2, logging: false }).then(canvas => {
    const a = document.createElement("a");
    a.download = `ffcs-timetable-${S.curCombo + 1}.png`;
    a.href = canvas.toDataURL();
    a.click();
  });
}

// ═══════════════════════════════════════════════════════════
// STORAGE + INIT
// ═══════════════════════════════════════════════════════════
function saveState() {
  try { localStorage.setItem("ffcs_v4_sem4", JSON.stringify({ sel: S.sel, priorities: S.priorities })); } catch (e) {}
}
function loadState() {
  try {
    const d = JSON.parse(localStorage.getItem("ffcs_v4_sem4") || "{}");
    if (d.sel) Object.assign(S.sel, d.sel);
    if (d.priorities) Object.assign(S.priorities, d.priorities);
  } catch (e) {}
  let t = null;
  try { t = localStorage.getItem("ffcs_theme"); } catch (e) {}
  if (!t) t = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  S.theme = t;
  document.documentElement.setAttribute("data-theme", t);
}

document.addEventListener("DOMContentLoaded", () => {
  loadState();
  render();

  document.getElementById("gen-btn").onclick = generate;
  document.getElementById("theme-btn").onclick = toggleTheme;
  document.getElementById("palette-btn").onclick = openPalette;
  document.getElementById("clear-btn").onclick = () => {
    S.priorities = {}; S.combos = []; S.focus = null; S.pinned = false;
    render();
  };

  if (!/Mac|iPhone|iPad/.test(navigator.platform)) {
    const k = document.getElementById("kbd-hint");
    if (k) k.textContent = "Ctrl K";
  }

  const palInput = document.getElementById("palette-input");
  palInput.addEventListener("input", () => fillPalette(palInput.value));
  palInput.addEventListener("keydown", e => {
    if (e.key === "ArrowDown") { e.preventDefault(); movePal(1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); movePal(-1); }
    else if (e.key === "Enter") { e.preventDefault(); choosePal(palCursor); }
  });
  document.getElementById("palette").addEventListener("mousedown", e => {
    if (e.target.id === "palette") closePalette();
  });

  document.addEventListener("keydown", e => {
    const typing = /^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName);
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); openPalette(); return; }
    if (e.key === "Escape") {
      closePalette();
      if (S.pinned) { S.pinned = false; S.focus = null; paintFocus(); }
      return;
    }
    if (typing) return;
    if (e.key === "ArrowRight") navCombo(1);
    else if (e.key === "ArrowLeft") navCombo(-1);
    else if (e.key.toLowerCase() === "g") generate();
    else if (e.key.toLowerCase() === "t") toggleTheme();
    else if (e.key === "/") { e.preventDefault(); openPalette(); }
  });
});
