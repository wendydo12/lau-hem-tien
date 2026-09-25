/* main.js — boot + router + UI serve loop (Phase 4). Engine ở js/engine/*, sprite map ở js/manifest.js. */
import { makeCFG, GAME_VERSION } from './engine/config.js';
import { ITEMS, BASE_KEYS, DIP_KEYS, TOP_KEYS, DUOC_KEYS, SECRET_KEYS, SPICY, DEF_SELL, iname } from './engine/data.js';
import { fresh, load, save, newPot } from './engine/state.js';
import { addStock, qty, take, costOf } from './engine/stock.js';
import { fmt, rating, starStr, recRev, recCost, price } from './engine/economy.js';
import { makeNameGen, levelOf, genOrder, matches } from './engine/orders.js';
import { rollDay, mkBadPlan, evText } from './engine/events.js';
import { initRuntime, spawn, serve, timeoutCustomer, closeDay, startDay, pourResult, slotCount } from './engine/loop.js';
import { makeRNG } from './engine/rng.js';
import { SPRITES } from './manifest.js';

const cfg = makeCFG();
const $ = id => document.getElementById(id);
const A = '../../assets/';   // tiền tố đường dẫn asset từ game/
let S, R, rng, ctx, names;
let pot = newPot();
let pouring = null;       // {start, raf}
let dayTimer = null;
let gameSec = 0;          // 11:00 -> 22:00 = cfg.dayMin phút thật

/* ============ util ============ */
const fmtD = n => Math.round(n).toLocaleString('vi-VN') + 'đ';
const fmtLS = n => n.toLocaleString('vi-VN') + ' 💎';
function toast(msg, cls = '', ms = 2200) {
  const t = document.createElement('div');
  t.className = 'toast ' + cls; t.textContent = msg;
  $('toastWrap').appendChild(t);
  setTimeout(() => t.remove(), ms);
}
function modal(html, btns, secret = false) {
  $('modalCard').innerHTML = html;
  $('modalCard').className = 'modal-card' + (secret ? ' secret' : '');
  const wrap = document.createElement('div');
  wrap.className = 'modal-btns';
  btns.forEach(([label, fn, primary]) => {
    const b = document.createElement('button');
    b.className = 'btn ' + (primary ? '' : 'ghost');
    b.textContent = label;
    b.onclick = () => { $('modal').hidden = true; fn && fn(); };
    wrap.appendChild(b);
  });
  $('modalCard').appendChild(wrap);
  $('modal').hidden = false;
}
const img = (src, alt = '') => { const i = new Image(); i.src = src; i.alt = alt; i.loading = 'eager'; return i; };
/* đường dẫn sprite theo key item — nồi lẩu ở SPRITES.pot, còn lại ở SPRITES.item, sup có icon riêng */
const spriteOf = k => k === 'sup' ? SPRITES.prop.pot_copper : (SPRITES.item[k] || SPRITES.pot[k] || '');
const itemImg = k => img(A + spriteOf(k), iname(k));

/* ============ boot ============ */
function boot() {
  const r = load(cfg);
  S = r.S;
  if (!S.badPlan) S.badPlan = mkBadPlan(S.day, makeRNG(S.seed));
  rng = makeRNG(S.seed);
  $('btnPlay').onclick = enterPrep;
  $('btnNew').onclick = () => modal('<div class="big-ico">🍲</div><h2>Mở quán mới?</h2><p>Toàn bộ tiến trình hiện tại sẽ mất. Chắc chứ?</p>',
    [['Huỷ', null], ['Mở quán mới', () => { S = fresh(cfg); rng = makeRNG(S.seed); save(S); toast('Đã mở quán mới', 'good'); }, true]]);
  $('btnGuide').onclick = showGuide;
  $('btnPause').onclick = pauseDlg;
  $('btnOpen').onclick = openShop;
  $('btnNextDay').onclick = nextDay;
  $('btnCook').onclick = startFire;
  $('btnServe').onclick = servePot;
  $('btnTrash').onclick = trashPot;
  updateHud();
}

function showGuide() {
  modal(`<div class="big-ico">📖</div><h2>Cách chơi</h2>
  <p style="text-align:left">
  1. <b>Chuẩn bị:</b> nhập nguyên liệu (trả tiền trước, có hạn dùng — để lâu là đổ bỏ).<br>
  2. <b>Mở cửa:</b> khách vào hẻm, gọi món trong bong bóng. Thanh màu trên đầu là kiên nhẫn — cạn là họ bỏ về và cho 1 sao.<br>
  3. <b>Nấu:</b> chạm khách để xem đơn → chọn nồi → cỡ → độ cay → nước chấm → đồ nhúng → bấm <b>Canh lửa nấu</b>.<br>
  4. <b>Canh lửa:</b> giữ nút, thanh lửa chạy — <b>thả tay đúng vùng CHUẨN xanh lá</b>. Non lửa phải nấu lại, quá lửa khét nồi mất nguyên liệu!<br>
  5. <b>Bưng:</b> bấm "Bưng cho khách" đang chọn. Sai món = đổ bỏ.<br>
  6. <b>Khách tu tiên</b> (viền tím phát sáng): trả linh thạch 💎, và khi họ ngồi xuống thì 🔮 <b>thực đơn bí mật</b> mở ra ở quầy.<br>
  7. 22:00 đóng cửa → tổng kết → sang ngày mới.</p>`, [['Đã hiểu', null, true]]);
}

function pauseDlg() {
  R.paused = true;
  modal('<div class="big-ico">❚❚</div><h2>Tạm dừng</h2><p>Quán đang nghỉ một chút.</p>',
    [['Chơi tiếp', () => { R.paused = false; }, true], ['Đóng cửa hôm nay (tổng kết sớm)', () => endDay(), false]]);
}

/* ============ HUD ============ */
function updateHud() {
  $('hudDay').textContent = 'Ngày ' + S.day;
  $('hudName').textContent = S.shopName || 'Lẩu Hẻm Tiên';
  $('hudMoney').textContent = fmtD(S.money);
  const rt = rating(S);
  $('hudStars').textContent = starStr(rt);
  $('hudRating').textContent = rt.toFixed(1).replace('.', ',') + ' · ' + (S.reviews.length) + ' đánh giá';
  const lsChip = $('hudLS');
  if (S.ls > 0) { lsChip.hidden = false; lsChip.querySelector('b').textContent = S.ls; }
}

/* ============ PREP (bản rút gọn Phase 4 — đầy đủ ở Phase 5) ============ */
const plan = {};   // {key: qty} nhập hàng
function enterPrep() {
  showScreen('prep');
  renderPrep();
}
function planCost() { return Object.entries(plan).reduce((a, [k, q]) => a + q * costOf(cfg, k), 0); }
function canOpen() {
  // cần ít nhất 1 nồi base + nồi chén (như gốc: chưa có hàng thì không mở cửa)
  const hasBase = BASE_KEYS.some(k => qty(S, k) + (plan[k] || 0) > 0 && S.unlocked[k]);
  const hasSup = qty(S, 'sup') + (plan.sup || 0) > 0;
  return hasBase && hasSup;
}
function renderPrep() {
  const ev = evText(S, cfg);
  const keys = [...BASE_KEYS, 'sup', ...TOP_KEYS, ...DIP_KEYS, ...DUOC_KEYS];
  let h = `<div class="sum-title">Ngày ${S.day} — Chuẩn bị</div>
  <div class="sum-sub">${ev ? '📅 ' + ev : 'Một ngày bình thường trong hẻm'}</div>`;
  h += `<div style="font-size:17px;color:var(--ink-soft);margin-bottom:8px">Tiền: <b>${fmtD(S.money)}</b>${S.ls > 0 ? ' · 💎 ' + S.ls : ''} — chọn số phần muốn nhập (trả tiền ngay, có hạn dùng):</div>`;
  keys.forEach(k => {
    if (!S.unlocked[k]) return;
    const it = ITEMS[k];
    const cur = qty(S, k);
    const inPlan = plan[k] || 0;
    h += `<div class="restock-row">
      <img src="${A + spriteOf(k)}" alt="">
      <div class="rn">${it.n} <small>· ${fmtD(it.cost)}/phần · ${it.life ? (it.life === 1 ? 'dùng trong ngày' : 'hạn ' + it.life + ' ngày') : 'không hạn'} · kho ${cur}</small></div>
      <button class="pill" data-dec="${k}">−</button>
      <b style="min-width:28px;text-align:center">${inPlan}</b>
      <button class="pill" data-inc="${k}">＋</button>
    </div>`;
  });
  $('prepBody').innerHTML = h;
  $('prepBody').querySelectorAll('[data-inc]').forEach(b => b.onclick = () => { const k = b.dataset.inc; const step = k === 'sup' ? 10 : 5; if (S.money >= planCost() + step * costOf(cfg, k)) { plan[k] = (plan[k] || 0) + step; renderPrep(); } else toast('Không đủ tiền nhập thêm', 'bad'); });
  $('prepBody').querySelectorAll('[data-dec]').forEach(b => b.onclick = () => { const k = b.dataset.dec; const step = k === 'sup' ? 10 : 5; plan[k] = Math.max(0, (plan[k] || 0) - step); if (!plan[k]) delete plan[k]; renderPrep(); });
  const btn = $('btnOpen');
  btn.textContent = canOpen() ? `Nấu & nhập · ${fmtD(planCost())} — Mở cửa ngày ${S.day}` : 'Cần nhập ít nhất 1 loại lẩu + nồi chén';
  btn.disabled = !canOpen();
}
function openShop() {
  if (!canOpen()) return;
  const cost = planCost();
  if (cost > S.money) { toast('Không đủ tiền!', 'bad'); return; }
  S.money -= cost;
  S.cur.restock = (S.cur.restock || 0) + cost;
  Object.entries(plan).forEach(([k, q]) => q > 0 && addStock(S, k, q, cfg));
  Object.keys(plan).forEach(k => delete plan[k]);
  save(S);
  startSell();
}

/* ============ SELL ============ */
function showScreen(name) {
  ['splash', 'prep', 'sell', 'summary'].forEach(s => $(s).hidden = s !== name);
  $('hud').hidden = name === 'splash';
}
function startSell() {
  R = initRuntime(S, cfg, slotCount(S, cfg));
  ctx = { R, S, cfg, rng, names: makeNameGen(S, rng) };
  R.running = true;
  pot = newPot();
  gameSec = 0;
  showScreen('sell');
  drawScene();
  renderStations();
  renderLane();
  updateHud();
  // biến cố đầu ngày (bad/gift/debt)
  const st = startDay(ctx);
  setTimeout(() => {
    if (st.bad) modal(`<div class="big-ico">💥</div><h2>${st.bad.n}</h2><p>${st.bad.all ? st.bad.all : st.bad.some.replace('%', '<b>' + fmtD(st.bad.v) + '</b>')}</p>`, [['Buồn ghê', null, true]]);
    else if (st.gift) modal(`<div class="big-ico">🎁</div><h2>${st.gift.n}</h2><p>${st.gift.d}</p><p class="lvup">+${fmtD(st.gift.v)}</p>`, [['Tuyệt quá', () => updateHud(), true]]);
  }, 600);
  // vòng lặp ngày
  const TICK = 100;
  const dayMs = cfg.dayMin * 60 * 1000;
  const started = performance.now();
  clearInterval(dayTimer);
  dayTimer = setInterval(() => {
    if (R.paused) return;
    const el = performance.now() - started - (R.pauseMs || 0);
    gameSec = Math.min(11 * 3600, el / dayMs * 11 * 3600); // 11:00 → 22:00
    const hh = 11 + Math.floor(gameSec / 3600), mm = Math.floor(gameSec % 3600 / 60);
    $('hudClock').textContent = String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0');
    tickCustomers();
    if (el >= dayMs) endDay();
  }, TICK);
  scheduleSpawns(dayMs);
}

/* giờ cao điểm: 12-13h, 18-21h game-time (như gốc khách tới theo giờ) */
function spawnRate() {
  const hh = 11 + gameSec / 3600;
  const rt = rating(S);
  const base = 3.4 / Math.max(0.5, rt / 4); // giây giữa các khách ở mức thường
  const peak = (hh >= 12 && hh <= 13) || (hh >= 18 && hh <= 21) ? 0.55 : 1.35;
  return base * peak * (1 / Math.max(0.6, 0.6 + rt * 0.1));
}
function scheduleSpawns() {
  const trySpawn = () => {
    if (!R || !R.running || R.paused) { setTimeout(trySpawn, 500); return; }
    const res = spawn(ctx);
    if (res) {
      if (res.kind === 'ok' || res.kind === 'star') {
        renderLane();
        if (res.kind === 'star') { toast('⭐ ' + res.c.name + ' — đại năng vi hành!', 'good', 3500); secretOpenCheck(); }
        else if (res.c.xian) { toast('🔮 ' + res.c.name + ' đáp xuống từ khe không gian...', '', 3000); secretOpenCheck(); }
        else if (res.c.brat) toast('⚠️ ' + res.c.name + ' có vẻ khó ở...', 'bad', 2000);
      } else if (res.kind === 'soldout') toast('🚫 Hết ' + iname(res.item).toLowerCase() + ', khách bỏ về', 'bad');
      else if (res.kind === 'pricy') toast('Khách xem menu chê đắt, bỏ đi', 'bad');
    }
    setTimeout(trySpawn, spawnRate() * 1000 * (0.7 + rng.next() * 0.6));
  };
  setTimeout(trySpawn, 1500);
}

function tickCustomers() {
  let changed = false;
  R.slots.forEach((c, i) => {
    if (!c) return;
    c.pat -= 0.1;
    const bar = document.querySelector(`[data-slot="${i}"] .pat i`);
    if (bar) {
      const frac = Math.max(0, c.pat / c.max);
      bar.style.width = (frac * 100) + '%';
      const p = bar.parentElement;
      p.className = 'pat' + (frac < .3 ? ' danger' : frac < .55 ? ' warn' : '');
    }
    if (c.pat <= 0) { timeoutCustomer(ctx, i); changed = true; toast('💢 ' + c.name + ' bỏ về, để lại 1 sao', 'bad'); }
  });
  if (changed) { renderLane(); secretOpenCheck(); }
}

/* khách tu tiên đang ngồi → mở thực đơn bí mật */
function secretOpenCheck() {
  const hasXian = R && R.slots.some(c => c && c.xian);
  $('secretHint').hidden = !hasXian;
  if (hasXian !== R._secretShown) {
    R._secretShown = hasXian;
    renderStations();
    if (hasXian) toast('🔮 Thực đơn bí mật đã mở — chỉ khách tiên gọi được', '', 3000);
  }
}

/* ---- lane: vẽ khách lên scene ---- */
function renderLane() {
  const lane = $('lane');
  lane.innerHTML = '';
  R.slots.forEach((c, i) => {
    if (!c) return;
    const el = document.createElement('div');
    el.className = 'cust' + (c.xian ? ' xian' : '') + (R.focus === c.id ? ' active' : '');
    el.dataset.slot = i;
    /* vị trí: hàng dưới (gần người xem, TRƯỚC quầy) so le 3 slot */
    const left = [20, 50, 78, 35][i % 4];
    el.style.left = left + '%';
    el.style.bottom = [2, 8, 2, 8][i % 4] + '%';
    const src = c.star != null ? SPRITES.xian[c.star % 16] : c.xian ? SPRITES.xian[(c.id + 3) % 16] : SPRITES.vn[(c.who ?? c.id) % 8];
    el.innerHTML = `
      <div class="bubble">${c.star != null ? '⭐ ' : ''}${c.xian ? '💎 ' : ''}${orderText(c.order)}</div>
      ${c.xian ? '<div class="pay-tag">💎</div>' : ''}
      <img src="${A + src}" alt="">
      <div class="name">${c.name}</div>
      <div class="pat${c.pat / c.max < .3 ? ' danger' : c.pat / c.max < .55 ? ' warn' : ''}"><i style="width:${Math.max(0, c.pat / c.max * 100)}%"></i></div>`;
    el.onclick = e => { e.stopPropagation(); R.focus = c.id; renderLane(); showOrderDetail(c); };
    lane.appendChild(el);
  });
}
function orderText(o) {
  if (!o) return '...';
  const tops = o.tops.map(t => ITEMS[t].s).join(', ');
  return `${iname(o.base)}${o.size === 'L' ? ' lớn' : ''}${o.spicy ? ' · ' + o.spicy.toLowerCase() : ''}${o.dip ? ' · chấm ' + ITEMS[o.dip].s.toLowerCase() : ''}${tops ? ' · ' + tops : ''}`;
}
function showOrderDetail(c) {
  let rows = c.cups.map((o, k) => `<div class="step${!c.done[k] && R.focus === c.id ? (k === c.cups.findIndex(x => !c.done[c.cups.indexOf(x)]) ? ' cur' : '') : ''}">${c.done[k] ? '✅' : '🍲'} Ly ${k + 1}: ${orderText(o)}${o.dip ? ' · chấm ' + ITEMS[o.dip].s.toLowerCase() : ''}</div>`).join('');
  modal(`<div class="big-ico">${c.xian ? '🔮' : '🗣️'}</div><h2>${c.name}</h2>
  <p style="font-style:italic">"${c.say} ${c.cups.length > 0 ? '' : ''}...${c.end}"</p>${rows}
  <p><small>${c.xian ? 'Trả bằng linh thạch 💎 · đạo tâm mỏng, nấu nhanh kẻo trễ' : 'Trả tiền mặt VNĐ'}</small></p>`,
  [['Nấu ngay', null, true]]);
}

/* ---- scene canvas: vẽ bg + hiệu ứng ---- */
function drawScene() {
  const cv = $('scene'), c = cv.getContext('2d');
  const bg = img(A + SPRITES.scene);
  bg.onload = () => {
    c.clearRect(0, 0, cv.width, cv.height);
    // cover-fit
    const r = Math.max(cv.width / bg.width, cv.height / bg.height);
    const w = bg.width * r, h = bg.height * r;
    c.drawImage(bg, (cv.width - w) / 2, (cv.height - h) / 2, w, h);
  };
  if (bg.complete) bg.onload();
}

/* ---- stations ---- */
function renderStations() {
  // NỒI
  const pots = BASE_KEYS.filter(k => S.unlocked[k]);
  $('stPots').innerHTML = pots.map(k => ingBtn(k, pot.base === k)).join('');
  // cỡ
  $('stSize').innerHTML = ['N', 'L'].map(sz =>
    `<button class="pill${pot.size === sz ? ' sel' : ''}" data-size="${sz}">${sz === 'N' ? 'Nồi nhỏ' : 'Nồi lớn +' + fmtD(DEF_SELL.L)}</button>`).join('');
  // cay
  $('stSpicy').innerHTML = levelOf(S.day, cfg) >= 2 ? SPICY.map(sp =>
    `<button class="pill${pot.spicy === sp ? ' sel' : ''}" data-spicy="${sp}">${sp}</button>`).join('') : '';
  // chấm
  $('stDip').innerHTML = levelOf(S.day, cfg) >= 2
    ? DIP_KEYS.filter(k => S.unlocked[k]).map(k => ingBtn(k, pot.dip === k, true)).join('')
    : '<small style="color:var(--ink-soft)">🔒 Mở từ ngày 6</small>';
  // topping
  const showSecret = R && R.slots.some(c => c && c.xian);
  const tops = [...TOP_KEYS, ...DUOC_KEYS].filter(k => S.unlocked[k]);
  const secrets = showSecret ? SECRET_KEYS.filter(k => S.unlocked[k]) : [];
  $('stTops').innerHTML = tops.map(k => ingBtn(k, pot.tops.includes(k))).join('')
    + secrets.map(k => ingBtn(k, pot.tops.includes(k), false, true)).join('');
  bindIngs();
  renderPotVisual();
}
function ingBtn(k, sel, small = false, secret = false) {
  const q = qty(S, k);
  const it = ITEMS[k];
  const src = spriteOf(k);
  return `<div class="ing${sel ? ' sel' : ''}${q <= 0 ? ' out' : ''}${secret ? ' secret' : ''}" data-k="${k}">
    <img src="${A + src}" alt="${it.s}">
    <div class="nm">${secret ? '✨' : ''}${it.s}</div>
    <div class="qty">${q > 0 ? q : ''}</div>
  </div>`;
}
function bindIngs() {
  document.querySelectorAll('.ing').forEach(el => el.onclick = () => {
    const k = el.dataset.k;
    const it = ITEMS[k];
    if (qty(S, k) <= 0) { toast(it.n + ' hết hàng rồi!', 'bad'); return; }
    if (it.type === 'base') { pot.base = pot.base === k ? null : k; pot.size = pot.size || 'N'; }
    else if (it.type === 'dip') pot.dip = pot.dip === k ? null : k;
    else if (it.type === 'top' || it.type === 'duoc' || it.type === 'secret') {
      const lv = levelOf(S.day, cfg);
      const maxT = lv >= 4 ? 4 : lv >= 3 ? 2 : 1;
      if (pot.tops.includes(k)) pot.tops = pot.tops.filter(t => t !== k);
      else if (pot.tops.length >= maxT) toast('Đơn ngày này tối đa ' + maxT + ' món nhúng', 'bad');
      else pot.tops.push(k);
    }
    renderStations();
  });
  document.querySelectorAll('[data-size]').forEach(b => b.onclick = () => { pot.size = b.dataset.size; renderStations(); });
  document.querySelectorAll('[data-spicy]').forEach(b => b.onclick = () => { pot.spicy = pot.spicy === b.dataset.spicy ? null : b.dataset.spicy; renderStations(); });
}
function renderPotVisual() {
  const v = $('potVisual');
  if (pot.base) {
    v.innerHTML = '';
    const im = img(A + SPRITES.pot[pot.base]);
    v.appendChild(im);
  } else v.innerHTML = '<div class="empty-pot">🍲</div>';
  const chips = [];
  if (pot.size) chips.push(`<span class="chip">${pot.size === 'L' ? 'Lớn' : 'Nhỏ'}</span>`);
  if (pot.spicy) chips.push(`<span class="chip">🌶 ${pot.spicy}</span>`);
  if (pot.dip) chips.push(`<span class="chip"><img src="${A + spriteOf(pot.dip)}"> ${ITEMS[pot.dip].s}</span>`);
  pot.tops.forEach(t => {
    const sec = ITEMS[t].type === 'secret';
    chips.push(`<span class="chip${sec ? ' secret' : ''}"><img src="${A + spriteOf(t)}"> ${ITEMS[t].s}</span>`);
  });
  $('potChips').innerHTML = chips.join('');
}

/* ---- minigame canh lửa ---- */
function startFire() {
  if (pouring) return;
  if (!pot.base) { toast('Chọn nồi lẩu trước đã', 'bad'); return; }
  // trừ nguyên liệu NGAY khi bắt đầu nấu (sai/khét = mất, như gốc)
  if (!take(S, 'sup')) { toast('Hết nồi chén! Nhập thêm đi', 'bad'); return; }
  if (!take(S, pot.base)) { toast('Hết ' + iname(pot.base) + '!', 'bad'); take(S, 'sup'); return; }
  const missing = [];
  if (pot.dip && !take(S, pot.dip)) missing.push(pot.dip);
  for (const t of pot.tops) if (!take(S, t)) missing.push(t);
  if (missing.length) {
    // hoàn lại những thứ đã trừ
    toast('Thiếu nguyên liệu: ' + missing.map(iname).join(', '), 'bad');
    addStock(S, 'sup', 1, cfg); addStock(S, pot.base, 1, cfg);
    if (pot.dip && !missing.includes(pot.dip)) addStock(S, pot.dip, 1, cfg);
    pot.tops.filter(t => !missing.includes(t)).forEach(t => addStock(S, t, 1, cfg));
    return;
  }
  $('fireBar').hidden = false;
  const [lo, hi] = cfg.pourPerfect;
  const zone = $('fireZone');
  const w = S.upg.phap_khi ? 0.1 : 0;
  zone.style.left = ((lo - w / 2) * 100) + '%';
  zone.style.width = ((hi - lo + w) * 100) + '%';
  const fill = $('fireFill');
  const start = performance.now();
  const dur = cfg.pot.fillMs;
  pouring = {};
  const anim = () => {
    if (!pouring) return;
    const f = Math.min(1.15, (performance.now() - start) / dur);
    fill.style.width = Math.min(100, f / 1.15 * 100) + '%';
    if (f >= 1.15) { finishFire(1.15); return; } // để quá = tự khét
    pouring.raf = requestAnimationFrame(anim);
  };
  pouring.raf = requestAnimationFrame(anim);
  $('btnCook').textContent = '🔥 THẢ TAY!';
  $('btnCook').onclick = () => finishFire(Math.min(1.15, (performance.now() - start) / dur));
}
function finishFire(f) {
  if (!pouring) return;
  cancelAnimationFrame(pouring.raf);
  pouring = null;
  $('fireBar').hidden = true;
  $('btnCook').textContent = '🔥 Canh lửa nấu';
  $('btnCook').onclick = startFire;
  const res = pourResult(f, S, cfg);
  if (res === 'perfect') {
    pot.used = true;
    toast('🔥 Lửa chuẩn! Nồi sôi sùng sục', 'good');
    renderPotVisual();
  } else if (res === 'weak') {
    toast('Non lửa... nước lẩu chưa ngọt, nấu lại đi (mất nguyên liệu!)', 'bad', 2800);
    S.cur.spoil.n++; S.cur.spoil.v += 0; // nguyên liệu đã trừ
    pot = newPot(); renderStations();
  } else {
    toast('💥 KHÉT NỒI! Đổ bỏ, mất nguyên liệu', 'bad', 2800);
    S.cur.spoil.n++;
    S.cur.spoil.v += costOf(cfg, pot.base) + pot.tops.reduce((a, t) => a + costOf(cfg, t), 0);
    pot = newPot(); renderStations();
  }
}

/* ---- bưng / đổ ---- */
function servePot() {
  if (!pot.base || !pot.used) { toast('Nấu chín đã rồi bưng', 'bad'); return; }
  /* tìm khách CÓ ĐƠN KHỚP nồi đang bưng trước (như người chơi thật nghĩ);
   * không ai khớp → đưa cho khách đang focus để engine báo sai món đúng luật */
  let idx = R.slots.findIndex(c => c && c.cups.some((o, k) => !c.done[k] && matches(pot, o)));
  if (idx < 0) {
    const fi = R.slots.findIndex(c => c && R.focus === c.id);
    idx = fi >= 0 ? fi : R.slots.findIndex(c => c && c.done.includes(false));
  }
  if (idx < 0) { toast('Chưa có khách nào đợi nồi', 'bad'); return; }
  R.focus = R.slots[idx].id;  // đồng bộ focus với khách sẽ nhận
  const before = S.money, lsBefore = S.ls;
  const res = serve(ctx, idx, pot);
  if (res.ok) {
    const c = res.c;
    if (res.ls) {
      toast('💎 ' + c.name + ' trả ' + fmtLS(res.ls) + (res.left ? ' · còn ' + res.left + ' nồi' : ''), 'good', 2600);
      flyMoney('+' + res.ls + ' 💎', true);
    } else {
      toast('+' + fmtD(res.vnd) + (res.left ? ' · còn ' + res.left + ' nồi' : ''), 'good');
      flyMoney('+' + fmtD(res.vnd), false);
    }
    pot = newPot();
    renderStations(); renderLane(); updateHud(); secretOpenCheck();
    if (res.left === 0 && R.slots[idx] === null) {
      // khách vừa rời đi — hiện sao
      const last = S.reviews[0];
      if (last) {
        const sp = document.createElement('div');
        sp.className = 'star-pop'; sp.textContent = '★'.repeat(last.s);
        sp.style.left = '40%'; sp.style.top = '30%';
        $('lane').appendChild(sp); setTimeout(() => sp.remove(), 1200);
        if (last.x) toast('🔮 "' + last.t.slice(0, 60) + '..."', '', 3200);
      }
    }
  } else if (res.why === 'wrong') {
    const el = document.querySelector(`[data-slot="${idx}"]`);
    if (el) { el.classList.add('angry'); setTimeout(() => el.classList.remove('angry'), 350); }
    toast('❌ Sai món! Đổ bỏ nồi, khách giận (đạo tâm -30%)', 'bad', 2800);
    pot = newPot();
    renderStations(); renderLane();
  }
}
function trashPot() {
  if (pot.base && pot.used) { S.cur.spoil.n++; }
  pot = newPot(); renderStations();
  toast('Đã dọn nồi cũ', '', 1200);
}
function flyMoney(text, ls) {
  const el = document.createElement('div');
  el.className = 'money-fly' + (ls ? ' ls' : '');
  el.textContent = text;
  el.style.left = (30 + Math.random() * 30) + '%';
  el.style.top = '45%';
  $('sceneWrap').appendChild(el);
  setTimeout(() => el.remove(), 1000);
}

/* ============ END DAY ============ */
function endDay() {
  if (!R || !R.running) return;
  clearInterval(dayTimer);
  R.running = false;
  const res = closeDay(ctx);
  save(S);
  renderSummary(res);
  showScreen('summary');
}
function renderSummary(res) {
  const hist = S.history[0];
  const rev = recRev(hist), cost = recCost(hist, cfg);
  $('summaryBody').innerHTML = `
  <div class="sum-title">🌙 Hết ngày ${S.day - 1}</div>
  <div class="sum-sub">${S.shopName || 'Lẩu Hẻm Tiên'}</div>
  <div class="sum-stats">
    <div class="sum-stat"><b>${R.today.served}</b><span>nồi đã bán</span></div>
    <div class="sum-stat"><b>${R.today.lost}</b><span>khách bỏ về</span></div>
    <div class="sum-stat"><b>${R.today.wrong}</b><span>nồi nấu sai</span></div>
    <div class="sum-stat"><b>${(R.today.stars.reduce((a, b) => a + b, 0) / Math.max(1, R.today.stars.length)).toFixed(1).replace('.', ',')}</b><span>sao hôm nay</span></div>
  </div>
  <div class="sum-line"><span>Doanh thu</span><span class="pos">+${fmtD(rev)}</span></div>
  ${R.today.tips ? `<div class="sum-line"><span>Tiền típ</span><span class="pos">+${fmtD(R.today.tips)}</span></div>` : ''}
  ${hist.lsEarned ? `<div class="sum-line"><span>Linh thạch thu được</span><span class="pos">+${fmtLS(hist.lsEarned)}</span></div>` : ''}
  <div class="sum-line"><span>Nhập nguyên liệu (đã trả)</span><span class="neg">−${fmtD(hist.restock || 0)}</span></div>
  ${hist.spoil.n ? `<div class="sum-line"><span>Hỏng/hết hạn ${hist.spoil.n} phần</span><span class="neg">(đã gồm trong nhập)</span></div>` : ''}
  <div class="sum-line"><span>Tiền nhà + điện nước</span><span class="neg">−${fmtD(res.rent + res.util)}</span></div>
  ${res.wage ? `<div class="sum-line"><span>Lương nhân viên</span><span class="neg">−${fmtD(res.wage)}</span></div>` : ''}
  ${res.loanOut ? `<div class="sum-line"><span>Trả nợ</span><span class="neg">−${fmtD(res.loanOut)}</span></div>` : ''}
  ${res.tax ? `<div class="sum-line"><span>Thuế</span><span class="neg">−${fmtD(res.tax)}</span></div>` : ''}
  <div class="sum-line total profit"><span>Lãi hôm nay</span><span class="${rev - cost >= 0 ? 'pos' : 'neg'}">${rev - cost >= 0 ? '+' : ''}${fmtD(rev - cost)}</span></div>
  <div class="sum-line total"><span>Két hiện tại</span><b>${fmtD(S.money)}</b></div>`;
  updateHud();
}
function nextDay() {
  /* closeDay() trong engine đã rollDay + autoBak + save + tăng S.day — ở đây chỉ chuyển màn hình */
  enterPrep();
}

/* ============ chạy ============ */
boot();
showScreen('splash');
window.addEventListener('beforeunload', () => { try { save(S); } catch (e) {} });
