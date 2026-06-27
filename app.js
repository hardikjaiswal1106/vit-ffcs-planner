// ═══════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════
window._state = {
  sel: { QQ:"TIME", HSM:"BAHUM111", LANG:"Spanish" },
  priorities: {},
  combos: [], curCombo: 0, warnings: []
};
const S = window._state;

// ═══════════════════════════════════════════════════════════════
// GENERATE
// ═══════════════════════════════════════════════════════════════
function generate() {
  const codes = Object.keys(COURSES);
  const MAX = 50;
  const combos = [], warnings = [];

  // Per-course ordered pairs
  const coursePairs = {};
  codes.forEach(code => {
    const all = buildPairs(code);
    const prios = S.priorities[code] || [];
    const prioDisplays = prios.map(p => p.display);
    const ordered = [], rest = [];
    all.forEach(p => {
      const idx = prioDisplays.indexOf(p.display);
      if (idx >= 0) ordered[idx] = p; else rest.push(p);
    });
    coursePairs[code] = prios.length > 0 ? ordered.filter(Boolean) : rest;
    if (!coursePairs[code].length) warnings.push(`No options for ${COURSES[code].name}`);
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
      // Find what's blocking each pair
      const clashReasons = [];
      pairs.forEach(pair => {
        const keys = [
          ...(pair.theory ? slotKeys(pair.theory.slot) : []),
          ...(pair.lab    ? slotKeys(pair.lab.slot)    : [])
        ];
        keys.forEach(k => {
          if (used.has(k)) {
            // Find which placed course owns this key
            const blocker = current.find(({code:c, pair:p}) => {
              if (!p) return false;
              const bkeys = [
                ...(p.theory ? slotKeys(p.theory.slot) : []),
                ...(p.lab    ? slotKeys(p.lab.slot)    : [])
              ];
              return bkeys.includes(k);
            });
            if (blocker) {
              const type = pair.theory && slotKeys(pair.theory.slot).includes(k) ? 'theory' : 'lab';
              const btype = blocker.pair.theory && slotKeys(blocker.pair.theory.slot).includes(k) ? 'theory' : 'lab';
              clashReasons.push(COURSES[blocker.code].short + ' ' + btype);
            }
          }
        });
      });
      const uniqueReasons = [...new Set(clashReasons)].slice(0,2).join(', ');
      current.push({ code, pair: null, clashWith: uniqueReasons });
      backtrack(idx + 1, current, used);
      current.pop();
    }
  }

  backtrack(0, [], new Set());
  S.combos = combos; S.curCombo = 0; S.warnings = warnings;
  renderResults();
}

// ═══════════════════════════════════════════════════════════════
// RENDER
// ═══════════════════════════════════════════════════════════════
function render() {
  saveState();
  renderSelectors();
  renderCards();
  renderResults();
}

function renderSelectors() {
  renderSelGroup("sel-HSM", "HSM", COURSES.HSM.selectorOptions, COURSES.HSM.selectorNames);
  renderSelGroup("sel-LANG", "LANG", COURSES.LANG.selectorOptions, COURSES.LANG.selectorNames);
  renderSelGroup("sel-QQ", "QQ", COURSES.QQ.selectorOptions, {});
}

function renderSelGroup(elId, key, opts, names) {
  const el = document.getElementById(elId);
  if (!el) return;
  el.innerHTML = "";
  opts.forEach(opt => {
    const b = document.createElement("button");
    b.className = "sel-btn" + (S.sel[key] === opt ? " active" : "");
    b.textContent = names[opt] || opt;
    b.onclick = () => { S.sel[key] = opt; S.priorities[key] = []; S.combos = []; render(); };
    el.appendChild(b);
  });
}

function renderCards() {
  const el = document.getElementById("course-cards");
  if (!el) return;
  el.innerHTML = "";
  Object.keys(COURSES).forEach(code => {
    const c = COURSES[code];
    const div = document.createElement("div");
    div.className = "cc";
    div.innerHTML = `
      <div class="cc-hdr" onclick="toggleCard('${code}')">
        <span class="cc-dot" style="background:${c.color}"></span>
        <span class="cc-code" style="color:${c.color}">${c.code}</span>
        <span class="cc-name">${c.name}</span>
        <span class="cc-caret" id="caret-${code}">▾</span>
      </div>
      <div class="cc-body" id="body-${code}">
        <div class="cc-lbl">Priority <span class="cc-hint">drag to reorder · × to remove</span></div>
        <div class="cc-chips" id="chips-${code}"></div>
        <div class="cc-sw">
          <input class="cc-inp" id="ci-${code}" placeholder="Search faculty..." autocomplete="off">
          <div class="cc-drop" id="cd-${code}"></div>
        </div>
      </div>`;
    el.appendChild(div);
    renderChips(code);
    bindSearch(code);
  });
}

function toggleCard(code) {
  const b = document.getElementById("body-"+code);
  const c = document.getElementById("caret-"+code);
  if (b) { const o = b.classList.toggle("open"); if(c) c.textContent = o?"▴":"▾"; }
}

function renderChips(code) {
  const el = document.getElementById("chips-"+code);
  if (!el) return;
  const prios = S.priorities[code] || [];
  el.innerHTML = "";
  if (!prios.length) {
    el.innerHTML = `<div class="cc-noprio">No priority set</div>`;
    return;
  }
  prios.forEach((pair, i) => {
    const ch = document.createElement("div");
    ch.className = "cc-chip"; ch.draggable = true; ch.dataset.idx = i;
    ch.innerHTML = `<span class="ch-n">${i+1}</span><span class="ch-t">${pair.display}</span><span class="ch-x" onclick="removePrio('${code}',${i})">×</span>`;
    ch.addEventListener("dragstart", e => { e.dataTransfer.setData("text/plain", JSON.stringify({code,idx:i})); ch.classList.add("dragging"); });
    ch.addEventListener("dragend", () => ch.classList.remove("dragging"));
    ch.addEventListener("dragover", e => { e.preventDefault(); ch.classList.add("drag-over"); });
    ch.addEventListener("dragleave", () => ch.classList.remove("drag-over"));
    ch.addEventListener("drop", e => {
      e.preventDefault(); ch.classList.remove("drag-over");
      const d = JSON.parse(e.dataTransfer.getData("text/plain"));
      if (d.code !== code) return;
      const [m] = S.priorities[code].splice(d.idx,1);
      S.priorities[code].splice(i,0,m);
      renderChips(code); saveState();
    });
    el.appendChild(ch);
  });
}

function removePrio(code, idx) {
  S.priorities[code]?.splice(idx,1);
  renderChips(code); saveState();
}

function bindSearch(code) {
  const inp = document.getElementById("ci-"+code);
  const drop = document.getElementById("cd-"+code);
  if (!inp||!drop) return;
  inp.addEventListener("input", () => {
    const q = inp.value.toLowerCase().trim();
    drop.innerHTML = "";
    if (!q) { drop.style.display="none"; return; }
    const pairs = buildPairs(code);
    const matches = pairs.filter(p => p.faculty.toLowerCase().includes(q));
    if (!matches.length) { drop.style.display="none"; return; }
    matches.slice(0,10).forEach(pair => {
      const item = document.createElement("div");
      item.className = "cc-di";
      if (pair.theory && pair.lab) {
        item.innerHTML = `<span class="di-f">${pair.faculty}</span><span class="di-th">${pair.theory.slot}</span><span class="di-a">→</span><span class="di-lb">${pair.lab.slot}</span>`;
      } else if (pair.theory) {
        item.innerHTML = `<span class="di-f">${pair.faculty}</span><span class="di-th">${pair.theory.slot}</span>`;
      } else {
        item.innerHTML = `<span class="di-f">${pair.faculty}</span><span class="di-lb">${pair.lab.slot}</span>`;
      }
      item.onmousedown = e => {
        e.preventDefault();
        if (!S.priorities[code]) S.priorities[code] = [];
        if (!S.priorities[code].find(p=>p.display===pair.display)) S.priorities[code].push(pair);
        renderChips(code); inp.value=""; drop.style.display="none"; saveState();
      };
      drop.appendChild(item);
    });
    drop.style.display = "block";
  });
  inp.addEventListener("blur", () => setTimeout(()=>drop.style.display="none", 200));
}

// ═══════════════════════════════════════════════════════════════
// TIMETABLE
// ═══════════════════════════════════════════════════════════════
function renderResults() {
  const el = document.getElementById("results");
  if (!el) return;
  if (!S.combos.length) {
    el.innerHTML = `<div class="empty"><div class="empty-icon">📅</div><div class="empty-t">Set priorities and click Generate</div><div class="empty-s">All clash-free combinations will appear here</div></div>`;
    return;
  }
  const total = S.combos.length, cur = S.curCombo, combo = S.combos[cur];
  let credits=0, placed=0;
  const labDays = new Set(), unplaced = [], clashInfo = [];
  const occupied = {};
  combo.forEach(({code,pair,clashWith}) => {
    if (!pair) { unplaced.push({code, clashWith: clashWith||''}); return; }
    placed++; credits += COURSES[code].credits;
    if (pair.theory) {
      slotKeys(pair.theory.slot).forEach(k => {
        if (occupied[k]) clashInfo.push(COURSES[code].short+' theory ↔ '+COURSES[occupied[k].code].short+' '+occupied[k].type);
        else occupied[k] = {code, type:'theory'};
      });
    }
    if (pair.lab) {
      slotCells(pair.lab.slot).forEach(c => labDays.add(c.day));
      slotKeys(pair.lab.slot).forEach(k => {
        if (occupied[k]) clashInfo.push(COURSES[code].short+' lab ↔ '+COURSES[occupied[k].code].short+' '+occupied[k].type);
        else occupied[k] = {code, type:'lab'};
      });
    }
  });
  const freeDays = 5 - labDays.size;
  const totalC = Object.keys(COURSES).length;
  const clashHtml = [...new Set(clashInfo)].slice(0,3).map(c=>`<span class="clash-pill">⚠️ ${c}</span>`).join('');
  const unplacedHtml = unplaced.map(({code:c, clashWith:cw})=>{
    const reason = cw ? ' clashes with '+cw : '';
    return `<span class="unplaced-pill">❌ ${COURSES[c].short}${reason}</span>`;
  }).join('');
  const warns = S.warnings.map(w=>`<div class="warn-bar">⚠️ ${w}</div>`).join('');
  el.innerHTML = `${warns}
    <div class="tt-nav">
      <button class="nbtn" onclick="navCombo(-1)" ${cur===0?'disabled':''}>← Prev</button>
      <span class="nlbl">Timetable <b>${cur+1}</b> / <b>${total}</b>${total===50?' · best 50':''}</span>
      <button class="nbtn" onclick="navCombo(1)" ${cur===total-1?'disabled':''}>Next →</button>
      <div class="nstats">
        <span>📚 <b>${credits}</b> credits</span>
        <span>🌴 <b>${freeDays}</b> free day${freeDays!==1?'s':''}</span>
        <span class="${placed<totalC?'stat-warn':''}">✅ <b>${placed}/${totalC}</b></span>
        ${unplacedHtml}${clashHtml}
      </div>
      <button class="btn-export" onclick="exportPNG()">📥 Save PNG</button>
    </div>
    <div id="tt-wrap">${buildTT(combo)}</div>`;
}

function navCombo(d) { S.curCombo = Math.max(0,Math.min(S.combos.length-1,S.curCombo+d)); renderResults(); }

function buildTT(combo) {
  // Build lookup: day → col → {code, pair, color, short}
  const grid = {};
  DAYS.forEach(day => { grid[day] = {}; for(let c=0;c<12;c++) grid[day][c]=null; });

  combo.forEach(({code,pair}) => {
    if (!pair) return;
    const c = COURSES[code];
    if (pair.theory) {
      slotCells(pair.theory.slot).forEach(cell => {
        if (!cell.isLab && grid[cell.day]) grid[cell.day][cell.col] = {code,pair,color:c.color,short:c.short,isTheory:true};
      });
    }
    if (pair.lab) {
      slotCells(pair.lab.slot).forEach(cell => {
        if (cell.isLab && grid[cell.day]) grid[cell.day][cell.col] = {code,pair,color:c.color,short:c.short,isLab:true};
      });
    }
  });

  // Column definitions — each L number gets its own col
  const cols = [
    {p:"P1",  time:"08:00-08:50", theory:"A1",  lab:"L1",  cidx:0},
    {p:"P2",  time:"08:51-09:40", theory:null,  lab:"L2",  cidx:1},
    {p:"P3",  time:"09:51-10:40", theory:"F1",  lab:"L3",  cidx:2},
    {p:"P4",  time:"10:41-11:30", theory:null,  lab:"L4",  cidx:3},
    {p:"P5",  time:"11:40-12:30", theory:"D1",  lab:"L5",  cidx:4},
    {p:"P6",  time:"12:31-01:20", theory:null,  lab:"L6",  cidx:5},
    null, // break
    {p:"P7",  time:"02:00-02:50", theory:"A2",  lab:"L31", cidx:6},
    {p:"P8",  time:"02:51-03:40", theory:null,  lab:"L32", cidx:7},
    {p:"P9",  time:"03:51-04:40", theory:"F2",  lab:"L33", cidx:8},
    {p:"P10", time:"04:41-05:30", theory:null,  lab:"L34", cidx:9},
    {p:"P11", time:"05:40-06:30", theory:"D2",  lab:"L35", cidx:10},
    {p:"P12", time:"06:31-07:20", theory:null,  lab:"L36", cidx:11},
  ];

  let h = `<div class="tt-scroll"><table class="tt">`;

  // Header
  h += `<thead><tr><th class="th-corner">THEORY<br><span class="th-lab-lbl">LAB</span></th>`;
  cols.forEach(col => {
    if (!col) { h += `<th class="th-brk"></th>`; return; }
    const isMorn = col.cidx < 6;
    h += `<th class="th-col ${isMorn?'morning':'evening'}">
      <div class="th-p">${col.p}</div>
      <div class="th-time">${col.time}</div>
      <div class="th-slots">${col.theory||''}${col.theory&&col.lab?'/':''}${col.lab||''}</div>
    </th>`;
  });
  h += `</tr></thead><tbody>`;

  DAYS.forEach(day => {
    h += `<tr><td class="td-day">${day}</td>`;
    cols.forEach(col => {
      if (!col) { h += `<td class="td-brk"></td>`; return; }
      const entry = grid[day][col.cidx];
      const thLbl = col.theory ? (DAY_THEORY[day][col.cidx]||col.theory) : '';
      const lbLbl = col.lab ? (DAY_LAB[day][col.cidx]||col.lab) : '';
      const slotLbl = thLbl && lbLbl ? thLbl+'/'+lbLbl : thLbl||lbLbl;
      if (entry) {
        const fac = entry.isTheory ? (entry.pair.theory?.f||'') : (entry.pair.lab?.f||'');
        h += `<td class="td-cell td-filled" style="background:${entry.color}28;border-top:3px solid ${entry.color};border:1px solid ${entry.color}55">
          <div class="cell-lbl">${slotLbl}</div>
          <div class="cell-short" style="color:${entry.color}">${entry.short}</div>
          <div class="cell-fac">${fac.split(' ')[0]}</div>
        </td>`;
      } else {
        h += `<td class="td-cell td-empty ${col.cidx<6?'m':'e'}">
          <div class="empty-lbl">${slotLbl}</div>
        </td>`;
      }
    });
    h += `</tr>`;
  });

  h += `</tbody></table></div>`;
  return h;
}

function exportPNG() {
  const el = document.getElementById("tt-wrap");
  if (!el||typeof html2canvas==="undefined") { alert("Export unavailable."); return; }
  html2canvas(el,{backgroundColor:"#0d0d18",scale:2}).then(canvas=>{
    const a=document.createElement("a"); a.download=`ffcs-tt${S.curCombo+1}.png`; a.href=canvas.toDataURL(); a.click();
  });
}

// ═══════════════════════════════════════════════════════════════
// STORAGE + INIT
// ═══════════════════════════════════════════════════════════════
function saveState() {
  try { localStorage.setItem("ffcs_v4", JSON.stringify({sel:S.sel, priorities:S.priorities})); } catch(e){}
}
function loadState() {
  try { const d=JSON.parse(localStorage.getItem("ffcs_v4")||"{}"); if(d.sel) Object.assign(S.sel,d.sel); if(d.priorities) Object.assign(S.priorities,d.priorities); } catch(e){}
}

document.addEventListener("DOMContentLoaded", () => { loadState(); render(); });
