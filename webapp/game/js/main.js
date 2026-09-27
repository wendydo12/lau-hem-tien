/* main.js — boot + router + UI serve loop (Phase 4). Engine ở js/engine/*, sprite map ở js/manifest.js.
 * CHÚ Ý cache-busting: mọi import đều kèm ?v=N — khi sửa bất kỳ file engine nào, tăng N ở TẤT CẢ các dòng import + script tag. */
import { makeCFG, GAME_VERSION } from './engine/config.js?v=27';
import { ITEMS, BASE_KEYS, DIP_KEYS, TOP_KEYS, DUOC_KEYS, SECRET_KEYS, SPICY, DEF_SELL, iname, PERSONA, WHO_SPR } from './engine/data.js?v=27';
import { fresh, load, save, newPot } from './engine/state.js?v=27';
import { addStock, qty, take, costOf } from './engine/stock.js?v=27';
import { fmt, rating, starStr, recRev, recCost, price, traffic } from './engine/economy.js?v=27';
import { makeNameGen, levelOf, genOrder, matches, maxTops } from './engine/orders.js?v=27';
import { rollDay, mkBadPlan, evText, evIs, evMul } from './engine/events.js?v=27';
import { initRuntime, spawn, serve, timeoutCustomer, closeDay, startDay, pourResult, slotCount, roomDebt, payRoomDebt, roomDebtOverdue } from './engine/loop.js?v=27';
import { makeRNG } from './engine/rng.js?v=27';
import { REALMS, initCult, breakText, fireZone, fillMs as cultFillMs } from './engine/cult.js?v=27';
import { TONES, TONE_KEYS, genReply, applyReply, unanswered, journeyStats } from './engine/replies.js?v=27';
import { RUIN_TIERS } from './engine/ruin.js?v=27';
import { dayStats, rangeStats, bestLine, bestSellers, recOfDay } from './engine/stats.js?v=27';
import { UPG } from './engine/data.js?v=27';
import { SPRITES } from './manifest.js?v=27';
import { sfx, setBoil, setAmbience, toggleAudio, audioOn, setBgm, stopBgm, playGameOver, bgmError, retryBgm } from './audio.js?v=27';
import { playIntro, introSeen } from './intro.js?v=27';
import { openCreator, openShopNaming, loadCreator, saveCreator, clearCreator, ownerSprite } from './creator.js?v=27';

const cfg = makeCFG();
const $ = id => document.getElementById(id);
import { A } from './assets.js?v=27';   // 26/09: 1 nguồn sự thật prefix asset (fix ảnh vỡ GitHub Pages)
let S, R, rng, ctx, names;
let pot = newPot();
/* debug/QA handle (26/09): phơi R/S/ctx ra console để test tự động được — không ảnh hưởng gameplay */
const __lht = { get R() { return R; }, get S() { return S; }, get ctx() { return ctx; }, get pot() { return pot; }, set pot(v) { pot = v; }, renderLane, renderTicket, renderStations, spawn, serve, timeoutCustomer };
window.__lht = __lht;
let pouring = null;       // {start, raf}
let dayTimer = null;
let gameSec = 0;          // 11:00 -> 22:00 = cfg.dayMin phút thật

/* ============ util ============ */
const fmtD = n => Math.round(n).toLocaleString('vi-VN') + 'đ';
const fmtK = n => Math.round(n) >= 1000 ? (Math.round(n / 100) / 10) + 'k' : Math.round(n) + 'đ';
const fmtLS = n => n.toLocaleString('vi-VN') + ' 💎';
function toast(msg, cls = '', ms = 2200) {
  const t = document.createElement('div');
  t.className = 'toast ' + cls; t.textContent = msg;
  $('toastWrap').appendChild(t);
  setTimeout(() => t.remove(), ms);
}
/* mọi nút bấm đều kêu "cộc" gỗ (delegate 1 chỗ) */
document.addEventListener('pointerdown', e => {
  if (e.target.closest('.btn, .pill, .ing, .icon-btn')) sfx('tap');
}, true);
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
  /* gắn tên nhân vật người chơi vào save (cho intro + cutscene gọi đúng tên) */
  const cr0 = loadCreator();
  if (cr0 && !S.creatorName) { S.creatorName = cr0.name; S.creatorGender = cr0.gender; S.creatorLook = cr0.look; }
  /* DEBUG HOOK (chỉ dev, localhost): ?testday=8&testmoney=300000 — giả lập ngày/két để test
   * game over nợ phòng trọ mà không phải chơi 7 ngày thật. beforeunload của tab cũ ghi đè
   * localStorage nên không thể patch save từ ngoài. */
  try {
    const qs = new URLSearchParams(location.search);
    if (qs.has('testday')) {
      S.day = Math.max(1, parseInt(qs.get('testday'), 10) || 1);
      if (qs.has('testmoney')) S.money = parseInt(qs.get('testmoney'), 10) || 0;
      save(S);
    }
  } catch (e) {}
  if (!S.badPlan) S.badPlan = mkBadPlan(S.day, makeRNG(S.seed));
  rng = makeRNG(S.seed);
  /* mới vô game (chưa có save) → nút chính là "Mở quán" (new game);
   * có save rồi mới hiện "Chơi tiếp" + "Quán mới" (lệnh phu quân 25/09) */
  const hasSave = !!r.loaded && (S.day > 1 || S.midDay || Object.keys(S.stock).some(k => (S.stock[k] || []).length));
  const btnPlay = $('btnPlay');
  btnPlay.textContent = hasSave ? 'Chơi tiếp (Ngày ' + S.day + ')' : '🍲 Mở quán';
  $('btnNew').hidden = !hasSave;   /* không có save thì không cần nút Quán mới */
  btnPlay.onclick = () => {
    /* lần đầu mở quán mới → TẠO NHÂN VẬT → chiếu PIXEL MOVIE intro → ĐẶT TÊN QUÁN (kiểu Stardew) */
    if (!hasSave) {
      btnPlay.disabled = true;
      openCreator(document.body).then(creator => {
        S.creatorName = creator.name; S.creatorGender = creator.gender; S.creatorLook = creator.look;
        playIntro(document.body, { creator, onDone: () => {
          openShopNaming(document.body, creator).then(shopName => {
            if (shopName) S.shopName = shopName;
            save(S); updateHud();
            btnPlay.disabled = false;
            enterPrep(); firstGuide();
          });
        }});
      });
      return;
    }
    enterPrep(); firstGuide();
  };
  $('btnNew').onclick = () => modal('<div class="big-ico">🍲</div><h2>Mở quán mới?</h2><p>Toàn bộ tiến trình hiện tại sẽ mất. Chắc chứ?</p>',
    [['Huỷ', null], ['Mở quán mới', () => {
      S = fresh(cfg); rng = makeRNG(S.seed); save(S);
      updateHud();
      /* quán mới = nhân vật mới + cốt truyện mới → xóa creator + intro để chơi lại từ đầu */
      try { localStorage.removeItem('lhTienIntro'); } catch (e) {}
      clearCreator();
      history.replaceState(null, '', location.pathname + '?fresh=' + Date.now());
      openCreator(document.body).then(creator => {
        playIntro(document.body, { creator, onDone: () => {
          openShopNaming(document.body, creator).then(shopName => {
            if (shopName) S.shopName = shopName;
            save(S); updateHud();
            enterPrep(); firstGuide();
            toast('Đã mở quán mới — Ngày 1 bắt đầu!', 'good');
          });
        }});
      });
    }, true]]);
  $('btnGuide').onclick = showGuide;
  $('btnPause').onclick = pauseDlg;
  $('btnCloseReviews').onclick = () => { showScreen(rvBack); if (rvBack === 'prep') renderPrep(); };
  $('btnCloseStats').onclick = () => { showScreen(statsBack); if (statsBack === 'prep') renderPrep(); };
  $('btnAudio').onclick = () => {
    const on = toggleAudio();
    $('btnAudio').textContent = on ? '🔊' : '🔇';
    if (on && R && R.running) setAmbience(true);
    toast(on ? 'Bật âm thanh' : 'Tắt âm thanh', '', 1200);
  };
  $('btnAudio').textContent = audioOn() ? '🔊' : '🔇';
  $('btnOpen').onclick = openShop;
  $('btnNextDay').onclick = nextDay;
  $('btnCook').onclick = startFire;
  $('btnServe').onclick = servePot;
  $('btnTrash').onclick = trashPot;
  updateHud();
}
/* lần đầu chơi → tự mở hướng dẫn (ghi nhớ bằng localStorage, chỉ hiện 1 lần) */
function firstGuide() {
  try {
    if (localStorage.getItem('lhTienGuide') === '1') return;
    localStorage.setItem('lhTienGuide', '1');
    setTimeout(showGuide, 400);
  } catch (e) { showGuide(); }
}

function showGuide() {
  modal(`<div class="big-ico">📖</div><h2>Cách chơi</h2>
  <p style="text-align:left">
  1. <b>Chuẩn bị:</b> nhập nguyên liệu (trả tiền trước, có hạn dùng — để lâu là đổ bỏ). Dòng <b>👥 ~X khách</b> báo hôm nay khoảng bao nhiêu người tới — cứ thế mà trữ.<br>
  2. <b>Mở cửa:</b> khách vào hẻm, gọi món trong bong bóng. Thanh màu trên đầu là kiên nhẫn — cạn là họ bỏ về và cho 1 sao.<br>
  3. <b>Nấu:</b> chạm khách để xem đơn → chọn nồi → cỡ → độ cay → nước chấm → đồ nhúng → bấm <b>Canh lửa nấu</b>.<br>
  4. <b>Canh lửa:</b> giữ nút, thanh lửa chạy — <b>thả tay đúng vùng CHUẨN xanh lá</b>. Non lửa phải nấu lại, quá lửa khét nồi mất nguyên liệu!<br>
  5. <b>Bưng:</b> bấm "Bưng cho khách" đang chọn. Sai món = đổ bỏ. Thiếu gia vị vào nồi là phải đổ cả nồi — cẩn thận từng lần chạm nhé.<br>
  6. <b>Khách tu tiên</b> (viền tím phát sáng): trả linh thạch 💎, và khi họ ngồi xuống thì 🔮 <b>thực đơn bí mật</b> mở ra ở quầy.<br>
  7. Học công thức mới ở màn chuẩn bị: món 🔒 bấm nút trả tiền 1 lần là lên menu.<br>
  8. 22:00 đóng cửa → tổng kết → sang ngày mới.</p>
  <p style="font-size:13px;color:var(--ink-soft)">Lưu giữa ngàn vàng: nghe sự kiện hôm nay (dòng 📅 đầu ngày) để trữ hàng đúng món — khách gọi gấp đôi thì trữ gấp đôi!</p>`, [['Đã hiểu', null, true]]);
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
  /* TU VI: chip cảnh giới chủ quán trên HUD */
  const C = initCult(S);
  const realmChip = $('hudRealm');
  if (realmChip) {
    realmChip.querySelector('b').textContent = REALMS[C.realm].n;
    realmChip.className = 'realm-chip r' + C.realm;
  }
}

/* ============ PREP (bản rút gọn Phase 4 — đầy đủ ở Phase 5) ============ */
const plan = {};   // {key: qty} nhập hàng
function enterPrep() {
  /* QUÁ HẠN NỢ PHÒNG TRỌ (ngày 8 chưa trả đủ 2 triệu) → game over theo cốt truyện */
  if (roomDebtOverdue(S, cfg)) { gameOverDebt(); return; }
  /* SAVEPOINT (lệnh phu quân 25/09): reload giữa ngày bán → hỏi chơi tiếp hay đóng sớm,
   * tiền/kho/ngày giữ nguyên từ lần tự lưu gần nhất */
  if (S.midDay && S.midSnap) { askResumeMidDay(); return; }
  showScreen('prep');
  renderPrep();
}

/* ---- SAVEPOINT giữa ngày: snapshot R.today + đồng hồ, reload là nối lại được ---- */
function saveMid() {
  if (!R || !R.running) return;
  S.midDay = true;
  S.midSnap = { today: R.today, gameSec, clockHh: 11 + gameSec / 3600 };
  try { save(S); } catch (e) {}
}
function restoreRuntime() {
  R = initRuntime(S, cfg, slotCount(S, cfg));
  ctx = { R, S, cfg, rng, names: makeNameGen(S, rng) };
  const snap = S.midSnap || {};
  if (snap.today) Object.assign(R.today, snap.today);
  gameSec = snap.gameSec || 0;
  return R;
}
function askResumeMidDay() {
  const snap = S.midSnap || {};
  const served = (snap.today && snap.today.served) || 0;
  modal(`<div class="big-ico">🏮</div><h2>Quán vẫn đang mở!</h2>
  <p>Hôm qua bạn thoát giữa ngày ${S.day} — két, kho và khách đã bán (${served} nồi) vẫn được giữ nguyên.<br>
  <small style="color:var(--ink-soft)">Savepoint tự lưu mỗi 15 giây — không mất công sức đâu.</small></p>`,
  [['🏮 Tiếp tục bán ngày ' + S.day, () => resumeSell(), true],
   ['🌙 Đóng cửa sớm (tổng kết)', () => { restoreRuntime(); R.running = true; endDay(); }, false]]);
}
function resumeSell() {
  restoreRuntime();
  R.running = true;
  pot = newPot(); renderTicket(); renderNeed();
  showScreen('sell');
  drawScene();
  renderStations();
  renderLane();
  updateHud();
  setAmbience(true);
  toast('🏮 Quán mở lại — bán tiếp ngày ' + S.day + ' nào!', 'good', 2600);
  /* đồng hồ chạy tiếp từ chỗ cũ */
  const dayMs = cfg.dayMin * 60 * 1000;
  const elapsedMs = Math.min(dayMs - 1000, (gameSec / (11 * 3600)) * dayMs);
  const started = performance.now() - elapsedMs;
  let ticks = 0;
  clearInterval(dayTimer);
  dayTimer = setInterval(() => {
    if (R.paused) return;
    const el = performance.now() - started - (R.pauseMs || 0);
    gameSec = Math.min(11 * 3600, el / dayMs * 11 * 3600);
    const hh = 11 + Math.floor(gameSec / 3600), mm = Math.floor(gameSec % 3600 / 60);
    $('hudClock').textContent = String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0');
    tickCustomers();
    if (++ticks % 150 === 0) saveMid();
    if (el >= dayMs) endDay();
  }, 100);
  scheduleSpawns(dayMs);
}
function gameOverDebt() {
  playGameOver();
  showScreen('splash');
  modal(`<div class="big-ico">🏚️</div><h2>Hết hạn tiền phòng...</h2>
  <p>Đã ${S.day - 1} ngày kể từ khi Minh nghỉ việc, nhưng không gom đủ 2 triệu trả tiền phòng trọ.<br>
  Chủ nhà lấy lại phòng, chiếc xe lẩu cũng phải bán đi trả nợ...<br><br>
  <i>"Lần sau nhớ: mỗi ngày để dành một ít, hạn chót ngày 7."</i></p>`,
  [['🍲 Làm lại từ đầu', () => {
    S = fresh(cfg); rng = makeRNG(S.seed); save(S);
    updateHud();
    replayNewLife();
  }, true]]);
}

/* làm lại cuộc đời: tạo lại nhân vật → intro → đặt tên quán (dùng chung mọi nhánh game over) */
function replayNewLife() {
  try { localStorage.removeItem('lhTienIntro'); } catch (e) {}
  clearCreator();
  openCreator(document.body).then(creator => {
    playIntro(document.body, { creator, onDone: () => {
      openShopNaming(document.body, creator).then(shopName => {
        if (shopName) S.shopName = shopName;
        save(S); updateHud();
        enterPrep(); firstGuide();
      });
    }});
  });
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
  let h = `<div class="sum-title">Ngày ${S.day} — Chuẩn bị <button class="pencil" id="btnRenameShop" title="Đổi tên quán">✏️</button></div>
  <div class="sum-sub">${ev ? '📅 ' + ev : 'Một ngày bình thường trong hẻm'}</div>`;
  /* ---- MENU HÔM NAY (port UI gốc): bảng giá các nồi đang mở + món bán chạy tuần ---- */
  const menuBases = BASE_KEYS.filter(k => S.unlocked[k]);
  if (menuBases.length) {
    const [wf, wt] = [Math.max(1, S.day - 7), S.day - 1];
    const bl = bestLine(S, wf, wt);
    /* dự báo khách hôm nay (tính từ công thức traffic + evMul — giống game gốc hiện "~41") */
    const est = Math.round(traffic(S, cfg, evMul(S)) * 14);   // hệ số 14 ≈ số khách/ngày ở rating trung bình
    const trendTxt = evIs(S, 'trend') && S.ev.k && ITEMS[S.ev.k] ? ` · 📈 ${iname(S.ev.k)} gọi gấp đôi` : '';
    h += `<div class="menu-board">
      <div class="mb-head">🧾 Menu hôm nay — ${S.shopName || 'Lẩu Hẻm Tiên'}</div>
      <div class="mb-grid">${menuBases.map(k =>
        `<span class="mb-item"><img src="${A + (SPRITES.pot[k] || '')}" alt="">${iname(k)} <b>${fmtK(S.sell[k])}</b></span>`).join('')}</div>
      <div class="mb-forecast">👥 Khoảng <b>~${est}</b> khách hôm nay${trendTxt}</div>
      ${bl ? `<div class="mb-best">🔥 Bán chạy 7 ngày qua: ${bl}</div>` : ''}
      <button class="pill small" id="btnStats">📊 Thống kê ngày/tuần/tháng</button>
    </div>`;
  }
  h += `<div style="font-size:17px;color:var(--ink-soft);margin-bottom:8px">Tiền: <b>${fmtD(S.money)}</b>${S.ls > 0 ? ' · 💎 ' + S.ls : ''} — chọn số phần muốn nhập (trả tiền ngay, có hạn dùng):</div>`;
  /* ---- BANNER NỢ PHÒNG TRỌ (cốt truyện intro) ---- */
  const rd = roomDebt(S, cfg);
  if (!rd.paid) {
    const late = rd.daysLeft < 0;
    const urgent = rd.daysLeft <= 2;
    h += `<div class="debt-banner${urgent ? ' urgent' : ''}${late ? ' late' : ''}">
      <span class="debt-ico">🏠</span>
      <div class="debt-txt"><b>Nợ tiền phòng: ${fmtD(rd.amount)}</b>
        <small>${late ? 'QUÁ HẠN! Sang ngày mai không trả là mất phòng!' : rd.daysLeft === 0 ? 'HẠN CHÓT HÔM NAY!' : 'Còn ' + rd.daysLeft + ' ngày (hạn ngày ' + rd.due + ')'}</small></div>
      <button class="pill debt-pay" id="btnPayDebt"${S.money < rd.amount ? ' disabled' : ''}>${S.money >= rd.amount ? 'Trả ngay' : 'Thiếu ' + fmtD(rd.amount - S.money)}</button>
    </div>`;
  } else {
    h += `<div class="debt-banner paid"><span class="debt-ico">✅</span><div class="debt-txt"><b>Đã trả tiền phòng!</b><small>Thoát cảnh nợ nần — yên tâm buôn bán (trả ngày ${rd.paidDay})</small></div></div>`;
  }
  /* ---- BANNER PHÁ SẢN (thang hậu quả âm tiền liên tiếp) ---- */
  if ((S.ruin || 0) > 0) {
    const T = RUIN_TIERS[S.ruin];
    h += `<div class="debt-banner urgent">
      <span class="debt-ico">⚠️</span>
      <div class="debt-txt"><b>${T.n}</b>
        <small>${T.d} — khách ngày mai còn ${Math.round(T.traffic * 100)}%. ${S.ruin >= 3 ? 'Không gượng dậy nổi là mất quán!' : 'Bán có lãi để xóa tin đồn!'}</small></div>
    </div>`;
  }
  /* ---- GATE PHA TU TIÊN (lệnh phu quân): ngày 1-7 lo trả nợ + tích 1 triệu ---- */
  if (!S.xianUnlock) {
    const g = cfg.xianGate;
    const okDay = S.day >= g.fromDay, okDebt = !!(rd.paid), okMoney = S.money >= g.surplus;
    h += `<div class="gate-banner${okDay && okDebt && okMoney ? ' ready' : ''}">
      <span class="debt-ico">🔮</span>
      <div class="debt-txt"><b>Bí ẩn hẻm nhỏ</b>
        <small>Dân hẻm đồn: khi quán vững vàng, khe không gian sẽ mở...
        ${okDay ? '✅' : '⬜'} Qua ngày ${g.fromDay - 1} · ${okDebt ? '✅' : '⬜'} Trả hết nợ phòng · ${okMoney ? '✅' : '⬜'} Dư ra ${fmtD(g.surplus)}${okMoney ? '' : ' (thiếu ' + fmtD(g.surplus - Math.max(0, S.money)) + ')'}</small></div>
    </div>`;
  } else {
    h += `<div class="gate-banner open">
      <span class="debt-ico">💎</span>
      <div class="debt-txt"><b>Pha tu tiên đã mở</b>
        <small>Tụ linh trận sáng rực — khách tu tiên sẽ đáp xuống bất cứ lúc nào, trả bằng linh thạch</small></div>
    </div>`;
  }
  /* ---- nút xem tường đánh giá (badge số review chưa trả lời) ---- */
  const un = unanswered(S);
  h += `<button class="btn ghost small rv-open" id="btnOpenReviews">📋 Đánh giá của khách${un ? ` <span class="rv-badge">${un}</span>` : ''}</button>`;
  /* ---- 26/09 (review "đoạn chọn nguyên liệu RẤT RỐI MẮT"): chia kho thành 3 nhóm có tiêu đề,
   * 2 cột song song — mắt có điểm tựa: NỒI+CHÉN → NƯỚC CHẤM → ĐỒ NHÚNG. Hàng chưa mở khóa gom 1 nhóm riêng. */
  const rowHtml = k => {
    const it = ITEMS[k];
    const cur = qty(S, k);
    const inPlan = plan[k] || 0;
    const life = it.life ? (it.life === 1 ? 'dùng trong ngày' : 'hạn ' + it.life + ' ngày') : 'không hạn';
    return `<div class="restock-row${inPlan > 0 ? ' planned' : ''}">
      <img src="${A + spriteOf(k)}" alt="">
      <div class="rn">${it.n} <small>· ${fmtD(it.cost)}/phần · ${life} · kho ${cur}</small></div>
      <button class="pill" data-dec="${k}">−</button>
      <b style="min-width:28px;text-align:center">${inPlan}</b>
      <button class="pill" data-inc="${k}">＋</button>
    </div>`;
  };
  const grp = (label, ks) => {
    const open = ks.filter(k => S.unlocked[k]);
    if (!open.length) return '';
    return `<div class="restock-group-label">${label}</div><div class="restock-grid">${open.map(rowHtml).join('')}</div>`;
  };
  h += grp('🍲 NỒI & NỒI CHÉN', [...BASE_KEYS, 'sup']);
  h += grp('🥣 NƯỚC CHẤM', DIP_KEYS);
  h += grp('🥩 ĐỒ NHÚNG LẨU', [...TOP_KEYS, ...DUOC_KEYS]);
  /* công thức chưa mở — 1 khối riêng gọn (fix 25/09: trả phí để học) */
  const locked = keys.filter(k => !S.unlocked[k]);
  if (locked.length) {
    h += `<div class="restock-group-label">🔒 CHƯA HỌC — tap để học công thức</div><div class="restock-grid">`;
    locked.forEach(k => {
      const it = ITEMS[k];
      const afford = S.money >= it.unlock;
      const verb = it.type === 'base' ? 'học công thức' : (it.type === 'dip' ? 'học cách pha' : 'tìm mối hàng');
      h += `<div class="restock-row locked">
        <img src="${A + spriteOf(k)}" alt="" style="filter:grayscale(1) brightness(.55)">
        <div class="rn">🔒 ${it.n} <small>· ${verb} ${fmtD(it.unlock)}</small></div>
        <button class="pill unlock-btn" data-unlock="${k}"${afford ? '' : ' disabled'}>${afford ? 'Trả ' + fmtD(it.unlock) : 'Thiếu ' + fmtD(it.unlock - S.money)}</button>
      </div>`;
    });
    h += '</div>';
  }
  $('prepBody').innerHTML = h;
  /* đổi tên quán (port UI gốc — bút chì cạnh tên) */
  const renameBtn = $('btnRenameShop');
  if (renameBtn) renameBtn.onclick = () => {
    openShopNaming(document.body, { name: S.creatorName || 'Chủ quán' }).then(nm => {
      if (nm) { S.shopName = nm; save(S); updateHud(); renderPrep(); sfx('coin'); toast('Bảng hiệu mới đã treo: ' + nm, 'good', 2600); }
    });
  };
  /* màn thống kê */
  const stBtn = $('btnStats');
  if (stBtn) stBtn.onclick = () => openStats('prep');
  /* mở tường đánh giá */
  const rvBtn = $('btnOpenReviews');
  if (rvBtn) rvBtn.onclick = () => openReviews('prep');
  /* trả nợ phòng trọ */
  const payBtn = $('btnPayDebt');
  if (payBtn) payBtn.onclick = () => {
    if (payRoomDebt(S, cfg)) { sfx('coin'); toast('Đã trả 2.000.000đ tiền phòng — nhẹ cả người!', 'good', 3200); save(S); updateHud(); renderPrep(); }
    else toast('Chưa đủ tiền trả nợ phòng', 'bad');
  };
  $('prepBody').querySelectorAll('[data-inc]').forEach(b => b.onclick = () => { const k = b.dataset.inc; const step = k === 'sup' ? 10 : 5; if (S.money >= planCost() + step * costOf(cfg, k)) { plan[k] = (plan[k] || 0) + step; sfx('tick'); renderPrep(); } else toast('Không đủ tiền nhập thêm', 'bad'); });
  $('prepBody').querySelectorAll('[data-dec]').forEach(b => b.onclick = () => { const k = b.dataset.dec; const step = k === 'sup' ? 10 : 5; if ((plan[k] || 0) > 0) sfx('tick'); plan[k] = Math.max(0, (plan[k] || 0) - step); if (!plan[k]) delete plan[k]; renderPrep(); });
  /* học công thức mới — trả phí 1 lần (fix 25/09) */
  $('prepBody').querySelectorAll('[data-unlock]').forEach(b => b.onclick = () => {
    const k = b.dataset.unlock;
    const it = ITEMS[k];
    if (!it || S.unlocked[k]) return;
    if (S.money < it.unlock) { toast('Chưa đủ tiền học công thức ' + it.n, 'bad'); return; }
    S.money -= it.unlock;
    S.unlocked[k] = true;
    save(S);
    sfx('lvup');
    toast('🎉 Học được công thức ' + it.n + '! Món đã lên menu quán', 'good', 3200);
    renderPrep();
    updateHud();
  });
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
  document.querySelectorAll('.ver').forEach(v => { v.textContent = 'v' + GAME_VERSION + ' — Phase 5'; });
  ['splash', 'prep', 'sell', 'summary', 'reviews', 'stats'].forEach(s => $(s).hidden = s !== name);
  $('hud').hidden = name === 'splash';
  /* BGM theo màn hình: bán hàng = không khí tiệm ăn, còn lại = lofi chill, splash = tắt */
  if (name === 'sell') setBgm('shop');
  else if (name === 'prep' || name === 'summary' || name === 'reviews' || name === 'stats') setBgm('prep');
  else stopBgm();
}
/* ---- modal biến cố (tách ra để lễ thức tỉnh nối chuỗi được) ---- */
function showBad(bad) {
  sfx('bad_ev');
  modal(`<div class="big-ico">💥</div><h2>${bad.n}</h2><p>${bad.all ? bad.all : bad.some.replace('%', '<b>' + fmtD(bad.v) + '</b>')}</p>`, [['Buồn ghê', null, true]]);
}
function showGift(gift) {
  sfx('gift');
  modal(`<div class="big-ico">🎁</div><h2>${gift.n}</h2><p>${gift.d}</p><p class="lvup">+${fmtD(gift.v)}</p>`, [['Tuyệt quá', () => updateHud(), true]]);
}

/* ---- LỄ THỨC TỈNH PHA TU TIÊN (gate ngày 7 — lệnh phu quân) ----
 * Kể chuyện bằng chữ + hiệu ứng ánh sáng (không cần asset mới): đêm mưa sao băng,
 * tu sĩ trọng thương được cứu bằng nồi lẩu, tặng linh thạch + vẽ tụ linh trận. */
function xianAwakenScene(onDone) {
  sfx('xian');
  setBgm('alley');   // nhạc truyền thống tĩnh lặng cho đêm mưa sao băng
  const lines = [
    ['🌌', 'Đêm ấy trời Sài Gòn bỗng có mưa sao băng...'],
    ['💫', 'Một vệt sáng xé ngang con hẻm — có người rơi xuống cuối ngõ, áo bào rách nát, hơi thở yếu ớt.'],
    ['🍲', (S.creatorName || 'Minh') + ' chẳng hiểu gì, nhưng thấy người ta đói thì bưng nồi lẩu nóng nhất ra mời.'],
    ['✨', 'Vị tu sĩ ăn một miếng — chân khí hồi phục, hào quang sáng rực cả hẻm!'],
    ['🙏', '"Đa tạ đạo hữu cứu mạng. Nồi lẩu có đạo vận — phàm trần hiếm lắm."'],
    ['💎', 'Người tặng lại một viên LINH THẠCH và vẽ Tụ Linh Trận lên tường: "Đồng đạo ngửi mùi sẽ tìm tới quán."'],
    ['🔮', 'Từ hôm nay: khách tu tiên sẽ ghé quán, trả bằng linh thạch 💎, và thực đơn bí mật được mở!']
  ];
  const overlay = document.createElement('div');
  overlay.className = 'break-overlay awaken';
  let i = 0;
  const body = () => `
    <div class="break-rays"></div>
    <div class="break-card awaken">
      <div class="awaken-ico">${lines[i][0]}</div>
      <p class="break-txt">${lines[i][1]}</p>
      <small class="awaken-hint">${i < lines.length - 1 ? 'chạm để tiếp tục...' : ''}</small>
      ${i === lines.length - 1 ? '<button class="btn big">Mở kỷ nguyên mới!</button>' : ''}
    </div>`;
  overlay.innerHTML = body();
  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('in'));
  const finish = () => {
    overlay.classList.remove('in');
    setTimeout(() => { overlay.remove(); save(S); updateHud(); renderStations(); onDone && onDone(); }, 500);
  };
  const next = () => {
    i++;
    if (i >= lines.length - 1) { overlay.innerHTML = body(); overlay.querySelector('button').onclick = finish; return; }
    overlay.innerHTML = body();
  };
  overlay.addEventListener('pointerdown', e => { if (e.target.closest('button')) return; next(); });
}

function startSell() {
  R = initRuntime(S, cfg, slotCount(S, cfg));
  ctx = { R, S, cfg, rng, names: makeNameGen(S, rng) };
  R.running = true;
  pot = newPot();
  gameSec = 0;
  S.midDay = true;   // SAVEPOINT: đang giữa ngày bán — reload sẽ được đóng ngày sớm, giữ tiền/kho
  showScreen('sell');
  drawScene();
  renderStations();
  renderLane();
  updateHud();
  setAmbience(true);   // hẻm đêm: gió + dế rả rích
  // biến cố đầu ngày (bad/gift/debt) + GATE pha tu tiên thức tỉnh
  const st = startDay(ctx);
  save(S);             // SAVEPOINT: biến cố đầu ngày (trừ tiền tai họa...) phải nằm trong save NGAY,
                       // reload giữa ngày không bị cộng/trừ lại lần hai
  setTimeout(() => {
    if (st.xianAwaken) { xianAwakenScene(() => { if (st.bad) showBad(st.bad); else if (st.gift) showGift(st.gift); }); }
    else if (st.bad) { showBad(st.bad); }
    else if (st.gift) { showGift(st.gift); }
  }, 600);
  // vòng lặp ngày
  const TICK = 100;
  const dayMs = cfg.dayMin * 60 * 1000;
  const started = performance.now();
  let ticks = 0;
  clearInterval(dayTimer);
  dayTimer = setInterval(() => {
    if (R.paused) return;
    const el = performance.now() - started - (R.pauseMs || 0);
    gameSec = Math.min(11 * 3600, el / dayMs * 11 * 3600); // 11:00 → 22:00
    const hh = 11 + Math.floor(gameSec / 3600), mm = Math.floor(gameSec % 3600 / 60);
    $('hudClock').textContent = String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0');
    tickCustomers();
    /* SAVEPOINT mỗi 15 giây (mobile hay bị kill app không kịp beforeunload) */
    if (++ticks % 150 === 0) saveMid();
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
        if (res.kind === 'star') { sfx('xian'); toast('⭐ ' + res.c.name + ' — đại năng vi hành!', 'good', 3500); secretOpenCheck(); }
        else if (res.c.xian) { sfx('xian'); toast('🔮 ' + res.c.name + ' đáp xuống từ khe không gian...', '', 3000); secretOpenCheck(); }
        else { sfx('bell'); if (res.c.brat) toast('⚠️ ' + res.c.name + ' có vẻ khó ở...', 'bad', 2000); }
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
    if (c.pat <= 0) { timeoutCustomer(ctx, i); changed = true; sfx('left'); toast('💢 ' + c.name + ' bỏ về, để lại 1 sao', 'bad'); }
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
    if (hasXian) { sfx('secret'); toast('🔮 Thực đơn bí mật đã mở — chỉ khách tiên gọi được', '', 3000); }
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
    /* vị trí: hàng dưới (gần người xem, TRƯỚC quầy) — CHÂN CHẠM ĐẤT: cùng baseline, so le nhẹ
     * theo slot; bubble nằm trên đầu nên không cần đẩy bottom lên cao (fix khách lơ lửng 25/09) */
    const left = [22, 50, 76, 38][i % 4];
    el.style.left = left + '%';
    el.style.bottom = '3%';
    const src = c.star != null ? SPRITES.xian[c.star % 16]
      : c.xian ? SPRITES.xian[(c.id + 3) % 16]
      : SPRITES.vn[WHO_SPR[c.who % 7]];   /* sprite KHỚP tên/giới tính/tuổi (WHO_SPR map cố định) */
    el.innerHTML = `
      <div class="bubble">${c.star != null ? '⭐ ' : ''}${c.xian ? '💎 ' : ''}${(c.order && c.order.base) ? orderBubble(c.order) : '✅'}</div>
      ${c.xian ? '<div class="pay-tag">💎</div>' : ''}
      <img src="${A + src}" alt="">
      <div class="name">${c.name}</div>
      <div class="pat${c.pat / c.max < .3 ? ' danger' : c.pat / c.max < .55 ? ' warn' : ''}"><i style="width:${Math.max(0, c.pat / c.max * 100)}%"></i></div>`;
    el.onclick = e => { e.stopPropagation(); R.focus = c.id; renderLane(); renderTicket(); renderNeed(); showOrderDetail(c); };
    lane.appendChild(el);
  });
  /* 26/09: khách focus vừa rời (xong việc) → tự focus khách còn chờ để vé đơn luôn có nội dung.
   * LƯU Ý (bugfix 2): KHÔNG gọi renderLane đệ quy — nếu còn 2+ khách chưa xong, renderLane →
   * renderLane → ... → crash "Maximum call stack" làm chết cả màn bán. Chỉ đổi focus + renderTicket. */
  if (!R.slots.some(x => x && R.focus === x.id)) {
    const nxt = R.slots.find(x => x && !x.done.every(Boolean));
    if (nxt && R.focus !== nxt.id) { R.focus = nxt.id; renderTicket(); renderNeed(); }
  }
  renderTicket(); renderNeed();
}
function orderText(o) {
  if (!o || !o.base) return '...';
  const nameOf = k => { const it = ITEMS[k]; return it ? (it.s || k) : k; };
  const tops = (o.tops || []).map(nameOf).join(', ');
  return `${iname(o.base)}${o.size === 'L' ? ' lớn' : ''}${o.spicy ? ' · ' + o.spicy.toLowerCase() : ''}${o.dip ? ' · chấm ' + ITEMS[o.dip].s.toLowerCase() : ''}${tops ? ' · ' + tops : ''}`;
}
/* bong bóng "menu request": icon từng món + nhãn, khách giơ ra cho chủ quán đọc */
function orderBubble(o) {
  if (!o) return '...';
  /* 26/09: KHÔNG in chữ "lớn" dưới icon — nhãn chính bên cạnh đã ghi "lớn" (fix "lớn lớn") */
  const parts = [`<span class="ob-i"><img src="${A + (SPRITES.pot[o.base] || '')}"></span>`];
  o.tops.forEach(t => parts.push(`<span class="ob-i"><img src="${A + spriteOf(t)}"></span>`));
  if (o.dip) parts.push(`<span class="ob-i"><img src="${A + spriteOf(o.dip)}"></span>`);
  const txt = `${o.spicy ? '🌶 ' + o.spicy : ''}`;
  const nm = iname(o.base);   /* 26/09: name base L đã mang chữ "lớn" — không lặp "lớn lớn" */
  const sizeTxt = o.size === 'L' ? (nm.includes('lớn') ? '' : ' lớn') : '';
  return `<span class="ob-txt">${nm}${sizeTxt}${txt}</span><span class="ob-icons">${parts.join('')}</span>`;
}
/* THÊM ĐỒ (27/09 — lệnh phu quân): cột TRÁI = chính những món CÒN THIẾU trên đơn khách đang focus.
 * Chạm 1 cái = bỏ vào nồi (dùng chính logic .ing sẵn có — hết hàng/nồi đầy thì toast nhắc).
 * Đầy đủ rồi thì hiện "✓ Nồi khớp — canh lửa thôi". Không phải tự dò đơn + tự nhớ nữa. */
function renderNeed() {
  const el = $('stNeed'); if (!el) return;
  try {
    const c = R ? R.slots.find(x => x && R.focus === x.id) : null;
    const nm = $('needName');
    if (!c || !c.order || !c.order.base) {
      if (nm) nm.textContent = 'Thêm đồ';
      el.innerHTML = '<small class="need-hint">👆 Chạm khách để xem cần thêm gì</small>';
      return;
    }
    if (nm) nm.textContent = c.name;
    const o = c.order;
    const bits = [];
    if (pot.base !== o.base) bits.push(ingBtn(o.base, false));
    if (o.size === 'L' && pot.size !== 'L') bits.push(`<button class="pill need-miss" data-size="L">🍲 Nồi LỚN</button>`);
    if (o.spicy && pot.spicy !== o.spicy) bits.push(`<button class="pill need-miss" data-spicy="${o.spicy}">🌶 ${o.spicy}</button>`);
    if (pot.spicy && !o.spicy) bits.push('<span class="need-warn">⚠️ Nồi đang nêm ${0} — đơn này KHÔNG cay, 🗑 đổ lại!</span>'.replace('${0}', pot.spicy));
    if (o.dip && pot.dip !== o.dip) bits.push(ingBtn(o.dip, true, true));
    for (const k of o.tops) if (!pot.tops.includes(k)) bits.push(ingBtn(k, false));
    if (pot.tops.length) {
      const extra = pot.tops.filter(k => !o.tops.includes(k));
      if (extra.length) bits.push(`<span class="need-warn">⚠️ Nồi thừa: ${extra.map(k => iname(k)).join(', ')} — 🗑 đổ lại!</span>`);
    }
    el.innerHTML = bits.length ? bits.join('') : '<small class="need-hint">✓ Nồi khớp ly này — nhấn 🔥 canh lửa!</small>';
    bindIngs();   // gắn handler cho cả .ing mới (an toàn: bind idempotent)
  } catch (e) { el.innerHTML = ''; }
}

/* VÉ ĐƠN (26/09): hiển thị ĐƠN ĐANG CHỜ của khách focus + so với nồi đang nấu.
 * Mỗi mục = chip: ✓ mờ nếu nồi đã đúng, đỏ "← THÊM" nếu thiếu, ghi chú nếu hết hàng.
 * Người chơi chỉ cần nhìn vé → biết chính xác phải thêm gì, không phải dò đơn + tự nhớ. */
function renderTicket() {
  const t = $('ticket');
  if (!t) return;
  try {
    const c = R ? R.slots.find(x => x && R.focus === x.id) : null;
    if (!c) { t.innerHTML = '<span class="tk-empty">👆 Chạm khách để xem đơn của họ</span>'; return; }
    const o = c.order;   // getter: cup đầu tiên chưa xong (đã fix engine 26/09)
    if (!o || !o.base) { t.innerHTML = `<div class="tk-head">🎟️ <b>${c.name}</b> — sắp rời đi</div>`; return; }
    /* helper an toàn (26/09): key lạ trong đơn (save cũ) KHÔNG được phép crash cả màn bán */
    const nameOf = k => { const it = ITEMS[k]; return it ? (it.s || it.n || k) : k; };
    const chips = [];
    // base
    const has = k => qty(S, k) > 0;
    const potOkBase = pot.base === o.base;
    chips.push(`<span class="tk-item${potOkBase ? ' ok' : ' miss'}"><img src="${A + (SPRITES.pot[o.base] || '')}"${SPRITES.pot[o.base] ? '' : ' hidden'}>${iname(o.base)}</span>`);
    // size
    if (o.size === 'L') chips.push(`<span class="tk-item${pot.size === 'L' ? ' ok' : ' miss'}">🍲 Nồi LỚN</span>`);
    // cay
    if (o.spicy) {
      const spOk = pot.spicy === o.spicy;
      chips.push(`<span class="tk-item${spOk ? ' ok' : ' miss'}">🌶 ${o.spicy}</span>`);
    } else if (pot.spicy) {
      chips.push(`<span class="tk-item miss">không cay — nồi đang nêm ${pot.spicy}! 🗑 đổ lại</span>`);
    }
    // chấm
    if (o.dip) {
      const dOk = pot.dip === o.dip;
      chips.push(`<span class="tk-item${dOk ? ' ok' : ' miss'}"><img src="${A + (spriteOf(o.dip) || '')}"${spriteOf(o.dip) ? '' : ' hidden'}>${nameOf(o.dip)}</span>`);
    }
    // topping: mỗi món của đơn — thiếu thì đỏ
    for (const k of o.tops) {
      const ok = pot.tops.includes(k);
      const out = !has(k);
      const spr = spriteOf(k);
      chips.push(`<span class="tk-item${ok ? ' ok' : ' miss'}"${out ? ' title="Hết hàng — nhập thêm ở màn chuẩn bị!"' : ''}><img src="${A + (spr || '')}"${spr ? '' : ' hidden'}>${nameOf(k)}${out ? ' · hết hàng' : ''}</span>`);
    }
    // cảnh báo thừa: món trong nồi KHÔNG nằm trong đơn → cảnh báo ngay (chống "nấu thừa mà không biết")
    const extras = pot.tops.filter(k => !o.tops.includes(k));
    if (extras.length) chips.push(`<span class="tk-item miss">⚠️ nồi thừa: ${extras.map(nameOf).join(', ')} — 🗑 đổ lại</span>`);
    t.innerHTML = `<div class="tk-head">🎟️ Đơn của <b>${c.name}</b>${c.cups.length > 1 ? ` <span class="tk-qty">(nồi ${c.done.filter(x => x).length + 1}/${c.cups.length})</span>` : ''} — thiếu gì thì thêm đó:</div>
    <div class="tk-row">${chips.join('')}</div>`;
  } catch (e) {
    t.innerHTML = '<span class="tk-empty">👆 Chạm khách để xem đơn của họ</span>';
  }
}

function showOrderDetail(c) {
  let rows = c.cups.map((o, k) => `<div class="step${!c.done[k] && R.focus === c.id ? (k === c.cups.findIndex(x => !c.done[c.cups.indexOf(x)]) ? ' cur' : '') : ''}">${c.done[k] ? '✅' : '🍲'} Ly ${k + 1}: ${orderText(o)}${o.dip ? ' · chấm ' + ITEMS[o.dip].s.toLowerCase() : ''}</div>`).join('');
  modal(`<div class="big-ico">${c.xian ? '🔮' : '🗣️'}</div><h2>${c.name}</h2>
  <p style="font-style:italic">"${c.say} ${c.cups.length > 0 ? '' : ''}...${c.end}"</p>${rows}
  <p><small>${c.xian ? 'Trả bằng linh thạch 💎 · đạo tâm mỏng, nấu nhanh kẻo trễ' : 'Trả tiền mặt VNĐ'}</small></p>`,
  [['Nấu ngay', null, true]]);
}

/* ---- scene canvas: vẽ bg + hiệu ứng ----
 * 26/09 BUGFIX (review "ảnh quán bè ngang"): canvas trước đây có buffer CỐ ĐỊNH 756×996 (dọc)
 * nhưng khung hiển thị trên điện thoại là ngang (390×~320) → CSS kéo giãn buffer lệch tỉ lệ,
 * mọi chi tiết pixel (đèn lồng, biển neon, mặt tiền) bị dẹt/dãn ngang.
 * Sửa: buffer luôn được scale theo KÍCH THƯỚC THỰC của khung (×dpr) → tỉ lệ buffer = tỉ lệ khung,
 * CSS không còn co giãn lệch; ảnh cover-fit đều tay (uniform scale, cắt thừa) — không bao giờ méo. */
function sizeScene() {
  const cv = $('scene'), wrap = $('sceneWrap');
  if (!cv || !wrap || wrap.clientWidth < 4) return false;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = Math.max(1, Math.round(wrap.clientWidth * dpr));
  const h = Math.max(1, Math.round(wrap.clientHeight * dpr));
  return (cv.width !== w || cv.height !== h);
}
function fitSceneBuffer() {
  const cv = $('scene'), wrap = $('sceneWrap');
  if (!cv || !wrap) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  cv.width = Math.max(1, Math.round(wrap.clientWidth * dpr));
  cv.height = Math.max(1, Math.round(wrap.clientHeight * dpr));
}
function drawScene() {
  const cv = $('scene'), c = cv.getContext('2d');
  fitSceneBuffer();   // buffer = khung thật → CSS 100%/100% không còn méo tỉ lệ
  const bg = img(A + SPRITES.scene);
  const paint = () => {
    c.imageSmoothingEnabled = false;   // pixel art: nearest-neighbor, nét vuông
    c.clearRect(0, 0, cv.width, cv.height);
    if (!bg.width) return;
    /* 27/09 (phu quân: "giảm cái cảnh ít bè, full cảnh y vậy") — CONTAIN, không cắt:
     * vẽ TOÀN BỘ ảnh nguyên tỉ lệ, viền thừa fill màu TRỜI mẫu từ ảnh → liền mạch. */
    let sky = '#101232';
    try {
      const sc = document.createElement('canvas'); sc.width = 4; sc.height = 4;
      const sc2 = sc.getContext('2d');
      sc2.drawImage(bg, -Math.floor(bg.width / 2), 0);
      const d = sc2.getImageData(2, 2, 1, 1).data;
      sky = 'rgb(' + d[0] + ',' + d[1] + ',' + d[2] + ')';
    } catch (e) {}
    c.fillStyle = sky; c.fillRect(0, 0, cv.width, cv.height);
    try {
      const band = document.getElementById('sceneBand');
      if (band) band.style.background = sky;   // band fill = màu trời trong ảnh → liền mạch, không "rạch"
    } catch (e) {}
    const r = Math.min(cv.width / bg.width, cv.height / bg.height);
    const w = bg.width * r, h = bg.height * r;
    c.drawImage(bg, (cv.width - w) / 2, (cv.height - h) / 2, w, h);
  };
  bg.onload = paint;
  if (bg.complete) paint();
}
/* resize/xoay màn giữa ngày bán → fit lại buffer (đồng bộ web/android/ios — cùng 1 code web) */
let _sceneRsz = null;
window.addEventListener('resize', () => {
  clearTimeout(_sceneRsz);
  _sceneRsz = setTimeout(() => { if (S && R && R.running && !$('sell').hidden) drawScene(); }, 120);
});
window.addEventListener('orientationchange', () => {
  setTimeout(() => { if (S && R && R.running && !$('sell').hidden) drawScene(); }, 250);
});

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
  renderTicket(); renderNeed();   // 26/09: vé đơn cập nhật theo nồi đang nấu
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
  /* FIX 25/09 (lệnh phu quân): nguyên liệu/gia vị ĐÃ bỏ vào nồi thì KHÔNG rút ra được.
   * Bỏ nhầm → phải 🗑 Đổ bỏ cả nồi rồi chọn lại (mất thời gian, khách vẫn đang chờ).
   * Chỉ cỡ nồi là đổi lại được (cái nồi chưa bỏ gì vào). */
  const LOCK = 'Đã bỏ vào nồi rồi — muốn đổi thì 🗑 Đổ bỏ cả nồi!';
  document.querySelectorAll('.ing').forEach(el => el.onclick = () => {
    const k = el.dataset.k;
    const it = ITEMS[k];
    if (qty(S, k) <= 0) { toast(it.n + ' hết hàng rồi!', 'bad'); return; }
    if (it.type === 'base') {
      if (pot.base) { toast(LOCK, 'bad'); sfx('weak'); return; }
      pot.base = k; pot.size = pot.size || 'N'; sfx('pot');
    }
    else if (it.type === 'dip') {
      if (pot.dip) { toast('Chén nước chấm đã rót rồi — đổ nồi mới đổi được!', 'bad'); sfx('weak'); return; }
      pot.dip = k; sfx('plop');
    }
    else if (it.type === 'top' || it.type === 'duoc' || it.type === 'secret') {
      if (pot.tops.includes(k)) { toast(LOCK, 'bad'); sfx('weak'); return; }
      /* trần món nhúng = maxTops dùng chung với engine (ramp theo ngày) */
      const maxT = maxTops(S.day, cfg);
      if (pot.tops.length >= maxT) toast('Ngày này tối đa ' + maxT + ' món nhúng (ngày sau mở thêm)', 'bad');
      else { pot.tops.push(k); sfx('plop'); }
    }
    renderStations();
  });
  document.querySelectorAll('[data-size]').forEach(b => b.onclick = () => { pot.size = b.dataset.size; renderStations(); });
  document.querySelectorAll('[data-spicy]').forEach(b => b.onclick = () => {
    if (pot.spicy && pot.spicy !== b.dataset.spicy) { toast('Đã nêm cay rồi — không rút lại được, đổ nồi đi!', 'bad'); sfx('weak'); return; }
    pot.spicy = b.dataset.spicy; renderStations();
  });
}
function renderPotVisual() {
  const v = $('potVisual');
  if (pot.base) {
    v.innerHTML = '';
    const im = img(A + SPRITES.pot[pot.base]);
    v.appendChild(im);
    /* ---- COMPOSITE TOPPING TRONG NỒI (25/09 — phu quân: "bỏ topping nào lẩu phải hiện đúng topping đó, kiểu trà sữa") ----
     * Không vẽ thêm asset: thả chính icon topping đã có vào vùng miệng nồi (elip x18-82% y18-58% của sprite),
     * xếp dọc theo mặt nước, kèm animation rơi tõm vào nồi. Món tiên giới (secret) phát sáng tím. */
    if (pot.tops.length) {
      const layer = document.createElement('div');
      layer.className = 'tops';
      const n = pot.tops.length;
      const big = pot.size === 'L';
      pot.tops.forEach((t, i) => {
        const el = img(A + spriteOf(t), ITEMS[t].n);
        el.className = 't' + (ITEMS[t].type === 'secret' ? ' secret' : '') + (big ? ' big' : '');
        const f = n === 1 ? 0.5 : i / (n - 1);
        el.style.left = (26 + f * 48) + '%';
        el.style.top = (30 + Math.sin(f * Math.PI) * 10) + '%';   // vòng theo mặt nước cho có chiều sâu
        el.style.animationDelay = (i * 0.07) + 's';
        layer.appendChild(el);
      });
      v.appendChild(layer);
    }
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
  sfx('fire_on');
  setBoil(true);   // vòng sôi lăn tăn suốt lúc giữ lửa
  let [lo, hi] = cfg.pourPerfect;
  if (S.upg.phap_khi) { lo -= .05; hi += .05; }
  [lo, hi] = fireZone(S, lo, hi);   /* TU VI: cảm lửa theo cảnh giới — vẽ đúng vùng engine chấm */
  const zone = $('fireZone');
  zone.style.left = (lo * 100) + '%';
  zone.style.width = ((hi - lo) * 100) + '%';
  const fill = $('fireFill');
  const start = performance.now();
  const dur = cultFillMs(S, cfg.pot.fillMs);   /* TU VI Luyện Hư: nấu nhanh hơn */
  pouring = {};
  const anim = () => {
    if (!pouring) return;
    const f = Math.min(1.15, (performance.now() - start) / dur);
    /* BUGFIX 25/09 (phu quân báo bấm trúng xanh vẫn khét): trước đây thanh fill vẽ f/1.15
     * nhưng chấm điểm bằng f thật → nửa trên vùng xanh nhìn thấy thực chất là vùng khét.
     * Giờ vẽ 1:1 — thanh tới đâu giá trị tới đó, thấy xanh là xanh thật. */
    fill.style.width = Math.min(100, f * 100) + '%';
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
  setBoil(false);
  $('fireBar').hidden = true;
  $('btnCook').textContent = '🔥 Canh lửa nấu';
  $('btnCook').onclick = startFire;
  const res = pourResult(f, S, cfg);
  if (res === 'perfect') {
    pot.used = true;
    pot.perfect = true;
    sfx('perfect');
    toast('🔥 Lửa chuẩn! Nồi sôi sùng sục', 'good');
    renderPotVisual();
  } else if (res === 'weak') {
    sfx('weak');
    toast('Non lửa... nước lẩu chưa ngọt, nấu lại đi (mất nguyên liệu!)', 'bad', 2800);
    S.cur.spoil.n++; S.cur.spoil.v += 0; // nguyên liệu đã trừ
    pot = newPot(); renderStations();
  } else {
    sfx('burnt');
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
      sfx('ls_coin');
      toast('💎 ' + c.name + ' trả ' + fmtLS(res.ls) + (res.left ? ' · còn ' + res.left + ' nồi' : ''), 'good', 2600);
      flyMoney('+' + res.ls + ' 💎', true);
    } else {
      sfx('coin');
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
        if (last.s >= 5) setTimeout(() => sfx('star'), 250);
        if (last.x) toast('🔮 "' + last.t.slice(0, 60) + '..."', '', 3200);
      }
    }
  } else if (res.why === 'wrong') {
    sfx('wrong');
    const el = document.querySelector(`[data-slot="${idx}"]`);
    if (el) { el.classList.add('angry'); setTimeout(() => el.classList.remove('angry'), 350); }
    toast('❌ Sai món! Đổ bỏ nồi, khách giận (đạo tâm -30%)', 'bad', 2800);
    pot = newPot();
    renderStations(); renderLane();
  }
}
function trashPot() {
  if (pot.base && pot.used) { S.cur.spoil.n++; sfx('trash'); }
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
  S.midDay = false;   // hết giữa ngày — savepoint không cần nữa
  setBoil(false);
  setAmbience(false);
  sfx('end_day');
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
  <div class="sum-line total"><span>Két hiện tại</span><b>${fmtD(S.money)}</b></div>
  ${cultSummaryHtml()}
  ${ruinSummaryHtml(res)}`;
  updateHud();
  R.pendingBreak = R.today.broke;   /* đột phá trong ngày → hiện lễ khi bấm sang ngày */
  S._lastRuin = res.ruin;           /* cho enterPrep hiện cảnh báo phá sản */
}

/* ---- TU VI trong tổng kết ---- */
function cultSummaryHtml() {
  const C = initCult(S);
  const Rl = REALMS[C.realm], NX = REALMS[C.realm + 1];
  let h = `<div class="cult-box r${C.realm}">
    <div class="cult-head"><span class="cult-ico">🧘</span>
      <div><b>${Rl.n}</b><small>${NX ? 'Tu vi ' + C.exp + ' / ' + NX.exp : 'Đạo hạnh viên mãn — Lẩu Tiên Tôn'}</small></div>
    </div>`;
  if (NX) {
    const pct = Math.min(100, Math.max(0, Math.round((C.exp - Rl.exp) / (NX.exp - Rl.exp) * 100)));
    h += `<div class="cult-bar"><i style="width:${pct}%"></i></div>`;
  }
  if (Rl.buff) h += `<div class="cult-buff">✨ ${Rl.buffD}</div>`;
  h += `</div>`;
  return h;
}

/* ---- PHÁ SẢN trong tổng kết ---- */
const UPGNAME = {};
UPG.forEach(u => { UPGNAME[u.id] = u.n; });
function ruinSummaryHtml(res) {
  const ru = res && res.ruin;
  if (!ru || ru.tier === 0) return '';
  const T = RUIN_TIERS[ru.tier];
  let h = `<div class="ruin-box t${ru.tier}">
    <div class="ruin-head"><span>⚠️</span><b>${T.n}</b><small>âm ${ru.streak} ngày liên tiếp</small></div>
    <div class="ruin-d">${T.d}</div>`;
  if (ru.lostMoney) h += `<div class="ruin-loss">Chủ nợ lấy đi: −${fmtD(ru.lostMoney)}</div>`;
  if (ru.lostUpg) h += `<div class="ruin-loss">Bị kê biên: ${UPGNAME[ru.lostUpg] || ru.lostUpg}</div>`;
  if (ru.deep) h += `<div class="ruin-loss">Két ÂM quá ${fmtD(cfg.ruinDeep)} — bờ vực đóng cửa!</div>`;
  h += `<div class="ruin-traffic">Khách e dè tin đồn: mai chỉ còn ${Math.round(T.traffic * 100)}% khách</div></div>`;
  return h;
}
function nextDay() {
  /* closeDay() trong engine đã rollDay + autoBak + save + tăng S.day — ở đây chỉ chuyển màn hình */
  /* GAME OVER PHÁ SẢN: bậc 3 (ngân siết quán) + âm sâu hoặc kéo dài 6 ngày */
  if ((S.ruin || 0) >= 3 && ((S.negStreak || 0) >= 6 || S.money < -(cfg.ruinDeep || 5000000))) {
    gameOverBankrupt();
    return;
  }
  /* ĐỘT PHÁ CẢNH GIỚI: hiện lễ trước khi sang ngày */
  if (R && R.pendingBreak != null) {
    const nr = R.pendingBreak;
    R.pendingBreak = null;
    showBreakthrough(nr, () => enterPrep());
    return;
  }
  enterPrep();
}

/* ---- màn ĐỘT PHÁ CẢNH GIỚI (tính năng đặc biệt) ---- */
function showBreakthrough(nr, onDone) {
  const Rl = REALMS[nr];
  sfx('lvup');
  const overlay = document.createElement('div');
  overlay.className = 'break-overlay r' + nr;
  overlay.innerHTML = `
    <div class="break-rays"></div>
    <div class="break-card">
      <div class="break-realm">⚡ ĐỘT PHÁ ⚡</div>
      <h2>${Rl.n}</h2>
      <p class="break-txt">${breakText(nr)}</p>
      ${Rl.buff ? `<div class="break-buff">✨ ${Rl.buffD}</div>` : ''}
      <button class="btn big">Tiếp tục buôn bán</button>
    </div>`;
  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('in'));
  const done = () => {
    overlay.classList.remove('in');
    setTimeout(() => { overlay.remove(); save(S); updateHud(); onDone && onDone(); }, 500);
  };
  overlay.querySelector('button').onclick = done;
  overlay.addEventListener('pointerdown', e => { if (e.target === overlay) done(); });
}

/* ---- GAME OVER PHÁ SẢN: tổng kết hành trình rồi mới đóng ---- */
function gameOverBankrupt() {
  const j = journeyStats(S);
  const Rl = REALMS[j.realm] || REALMS[0];
  playGameOver();
  showScreen('splash');
  modal(`<div class="big-ico">🏚️</div><h2>Quán đóng cửa...</h2>
  <p>Âm tiền ${j.days} ngày trời, chủ nợ dán cáo thị trước quán. Minh tháo bảng hiệu, xếp nồi niêu vào thùng...</p>
  <div class="journey">
    <div class="jr-line"><span>📅 Số ngày trụ được</span><b>${j.days}</b></div>
    <div class="jr-line"><span>🍲 Nồi lẩu đã bưng</span><b>${j.served}</b></div>
    <div class="jr-line"><span>💵 Tổng doanh thu</span><b>${fmtD(j.totalRev)}</b></div>
    <div class="jr-line"><span>⭐ Đánh giá</span><b>${j.rating.toFixed(1).replace('.', ',')} · ${j.reviews} review</b></div>
    <div class="jr-line"><span>🧘 Cảnh giới</span><b>${Rl.n}</b></div>
    ${j.bestMon ? `<div class="jr-line"><span>🥘 Món bán chạy nhất</span><b>${iname(j.bestMon)} · ${j.bestQ} nồi</b></div>` : ''}
  </div>
  <p style="margin-top:8px"><i>"Thất bại không đáng sợ. Đáng sợ là chưa kịp nấu nồi nào ra hồn."</i></p>`,
  [['🍲 Làm lại cuộc đời', () => {
    S = fresh(cfg); rng = makeRNG(S.seed); save(S);
    updateHud();
    playIntro(document.body, { onDone: () => { enterPrep(); firstGuide(); } });
  }, true]]);
}

/* ============ MÀN THỐNG KÊ (port UI gốc: Theo ngày/Tuần/Tháng — lệnh phu quân 25/09) ============ */
let statsBack = 'prep';
let statsTab = 'day';
let statsDay = 1;
function openStats(back) {
  statsBack = back || 'prep';
  statsDay = Math.max(1, S.day - 1);
  renderStats();
  showScreen('stats');
}
function renderStats() {
  const lastClosed = Math.max(1, S.day - 1);
  let body = '';
  /* tab */
  body += `<div class="sum-title">📊 Thống kê</div>
  <div class="st-tabs">
    ${[['day', 'Theo ngày'], ['week', 'Theo tuần'], ['month', 'Theo tháng']].map(([k, n]) =>
      `<button class="st-tab${statsTab === k ? ' sel' : ''}" data-tab="${k}">${n}</button>`).join('')}
  </div>`;
  if (statsTab === 'day') {
    statsDay = Math.min(statsDay, lastClosed);
    body += `<div class="st-nav">
      <button class="pill" id="stPrev"${statsDay <= 1 ? ' disabled' : ''}>◀</button>
      <b>Ngày ${statsDay}</b>${statsDay === lastClosed && S.midDay ? ' <small>(hôm nay)</small>' : ''}
      <button class="pill" id="stNext"${statsDay >= lastClosed ? ' disabled' : ''}>▶</button>
    </div>`;
    const d = dayStats(S, statsDay, cfg);
    if (!d) body += '<div class="rv-empty">Ngày này chưa bán gì (hoặc quán chưa mở).</div>';
    else {
      body += `<div class="st-cards">
        <div class="st-card"><b>${d.served}</b><span>nồi bán</span></div>
        <div class="st-card"><b>${d.lost}</b><span>khách bỏ về</span></div>
        <div class="st-card"><b>${d.rating != null ? d.rating.toFixed(1).replace('.', ',') + '★' : '—'}</b><span>đánh giá</span></div>
      </div>
      <div class="sum-line"><span>Doanh thu</span><span class="pos">+${fmtD(d.rev)}</span></div>
      ${d.tips ? `<div class="sum-line"><span>Tiền típ</span><span class="pos">+${fmtD(d.tips)}</span></div>` : ''}
      ${d.lsEarned ? `<div class="sum-line"><span>Linh thạch</span><span class="pos">+${fmtLS(d.lsEarned)}</span></div>` : ''}
      <div class="sum-line"><span>Chi phí</span><span class="neg">−${fmtD(d.cost)}</span></div>
      <div class="sum-line total ${d.profit >= 0 ? 'profit' : ''}"><span>Lãi</span><span class="${d.profit >= 0 ? 'pos' : 'neg'}">${d.profit >= 0 ? '+' : ''}${fmtD(d.profit)}</span></div>
      ${d.bestMon ? `<div class="mb-best">🔥 Bán chạy: ${iname(d.bestMon)} (${d.bestQ} nồi)</div>` : ''}`;
    }
  } else {
    const [from, to] = statsTab === 'week' ? [Math.max(1, S.day - 7), lastClosed] : [Math.max(1, S.day - 30), lastClosed];
    const rg = to >= from ? rangeStats(S, from, to, cfg) : null;
    body += `<div class="st-nav"><b>${from === to ? 'Ngày ' + from : 'Ngày ' + from + ' → ' + to}</b></div>`;
    if (!rg) body += '<div class="rv-empty">Chưa đủ dữ liệu — bán thêm vài ngày đã!</div>';
    else {
      const bl = bestLine(S, from, to);
      body += `<div class="st-cards">
        <div class="st-card"><b>${rg.served}</b><span>nồi bán</span></div>
        <div class="st-card"><b>${rg.lost}</b><span>khách bỏ về</span></div>
        <div class="st-card"><b>${rg.rating != null ? rg.rating.toFixed(1).replace('.', ',') + '★' : '—'}</b><span>đánh giá</span></div>
      </div>
      <div class="sum-line"><span>Doanh thu ${rg.days} ngày</span><span class="pos">+${fmtD(rg.rev)}</span></div>
      ${rg.tips ? `<div class="sum-line"><span>Tiền típ</span><span class="pos">+${fmtD(rg.tips)}</span></div>` : ''}
      ${rg.lsEarned ? `<div class="sum-line"><span>Linh thạch</span><span class="pos">+${fmtLS(rg.lsEarned)}</span></div>` : ''}
      <div class="sum-line"><span>Chi phí</span><span class="neg">−${fmtD(rg.cost)}</span></div>
      <div class="sum-line total ${rg.profit >= 0 ? 'profit' : ''}"><span>Lãi</span><span class="${rg.profit >= 0 ? 'pos' : 'neg'}">${rg.profit >= 0 ? '+' : ''}${fmtD(rg.profit)}</span></div>
      ${bl ? `<div class="mb-best">🔥 Bán chạy: ${bl}</div>` : ''}`;
    }
  }
  $('statsBody').innerHTML = body;
  /* bind */
  document.querySelectorAll('.st-tab').forEach(b => b.onclick = () => { statsTab = b.dataset.tab; sfx('tick'); renderStats(); });
  const pv = $('stPrev'), nx = $('stNext');
  if (pv) pv.onclick = () => { if (statsDay > 1) { statsDay--; sfx('tick'); renderStats(); } };
  if (nx) nx.onclick = () => { if (statsDay < lastClosed) { statsDay++; sfx('tick'); renderStats(); } };
}

/* ============ TƯỜNG ĐÁNH GIÁ + PHẢN HỒI 3 TÔNG GIỌNG (tính năng đặc biệt) ============ */
let rvBack = 'prep';
function openReviews(back) {
  rvBack = back || 'prep';
  renderReviews();
  showScreen('reviews');
}
function renderReviews() {
  const C = initCult(S);
  $('rvSum').textContent = starStr(rating(S)) + ' ' + rating(S).toFixed(1).replace('.', ',') +
    ' · ' + S.reviews.length + ' đánh giá · ' + unanswered(S) + ' chưa phản hồi';
  const list = $('reviewList');
  list.innerHTML = '';
  const shown = S.reviews.slice(0, 60);
  if (!shown.length) {
    list.innerHTML = '<div class="rv-empty">Chưa có đánh giá nào. Bán vài nồi lẩu rồi khách sẽ nói về quán thôi!</div>';
    return;
  }
  shown.forEach((r, idx) => {
    const el = document.createElement('div');
    el.className = 'rv-card' + (r.x ? ' xian' : '') + (r.back ? ' backfire' : '');
    /* HÌNH MÓN MINH HỌA bên phải — review nồi nào hiện đúng hình nồi đó (như game gốc) */
    const monImg = r.b ? `<img class="rv-dish" src="${A + (SPRITES.pot[r.b] || SPRITES.pot.ca_chua)}" alt="">` : '';
    const stars = '★'.repeat(r.s) + '☆'.repeat(5 - r.s);
    let h = `<div class="rv-top">
        <span class="rv-face">${r.x ? (r.st != null ? '⭐' : '🔮') : (r.f || '🙂')}</span>
        <div class="rv-who"><b>${r.n}</b><small>Ngày ${r.d}${r.o ? ' · đơn tiên hạc' : ''}${r.back ? ' · ⚡ khách giận vì bị cà khịa' : ''}</small></div>
        ${monImg}
      </div>
      <div class="rv-stars">${stars}</div>
      <div class="rv-text">${r.t}</div>`;
    if (r.reply) {
      const T = TONES[r.reply.tone];
      const avKind = r.reply.av || 'me';
      const avHtml = avKind === 'me'
        ? `<img src="${A + ownerSprite(loadCreator())}" alt="">`
        : avKind === 'anon' ? '🕶️' : avKind === 'chef' ? '🧑‍🍳' : '🐸';
      h += `<div class="rv-reply ${r.reply.tone}">
        <div class="rv-reply-head"><span class="rv-reply-av">${avHtml}</span>${T ? 'Phản hồi của quán · ' + T.ico + ' ' + T.n : 'Phản hồi của quán'}${r.reply.edited ? ' (đã sửa)' : ''}</div>
        <div class="rv-reply-body">${r.reply.text}</div>
        <button class="rv-edit" data-i="${idx}">Sửa</button>
      </div>`;
    } else {
      h += `<button class="btn ghost small rv-replybtn" data-i="${idx}">💬 Trả lời</button>`;
    }
    el.innerHTML = h;
    list.appendChild(el);
  });
  list.querySelectorAll('.rv-replybtn').forEach(b => b.onclick = () => openReplyModal(shown[+b.dataset.i]));
  list.querySelectorAll('.rv-edit').forEach(b => b.onclick = () => openReplyModal(shown[+b.dataset.i], true));
}

let _rvSeed = 1;
const previewReply = (tone, r, mon) => genReply(makeRNG((Date.now() * 7 + _rvSeed++) >>> 0), tone, r.s, r.n, mon);
const pickSuggestions = (tone, r, mon) => {
  /* 3 câu gợi ý KHÁC NHAU theo tông — người chơi bấm chọn câu nào gửi câu đó */
  const out = [];
  const prng = makeRNG((Date.now() * 13 + _rvSeed++) >>> 0);
  for (let t = 0; t < 12 && out.length < 3; t++) {
    const s = genReply(prng, tone, r.s, r.n, mon);
    if (!out.includes(s)) out.push(s);
  }
  return out;
};
/* avatar phản hồi: mặt chủ quán (sprite creator) / ẩn danh / emoji vui */
const AV_OPTS = [
  { id: 'me', ico: '🙂', n: 'Mặt mình' },
  { id: 'anon', ico: '🕶️', n: 'Ẩn danh' },
  { id: 'chef', ico: '🧑‍🍳', n: 'Đầu bếp' },
  { id: 'fun', ico: '🐸', n: 'Cho vui' }
];

function openReplyModal(r, isEdit) {
  if (!r) return;
  const mon = r.b ? iname(r.b).toLowerCase() : 'lẩu';
  let tone = r.reply ? r.reply.tone : 'polite';
  let chosen = r.reply ? r.reply.text : null;   // câu đã chọn/đã gửi
  let av = r.reply ? (r.reply.av || 'me') : 'me';
  const render = () => {
    const sugg = pickSuggestions(tone, r, mon);
    modal(`<div class="big-ico">${r.x ? '🔮' : '💬'}</div><h2>${isEdit ? 'Sửa phản hồi' : 'Trả lời ' + r.n}</h2>
    <p class="rv-quote">"${r.t}"</p>
    <div class="tone-pick">${TONE_KEYS.map(k => {
      const T = TONES[k];
      return `<button class="tone-btn${k === tone ? ' sel' : ''}" data-tone="${k}">
        <b>${T.ico} ${T.n}</b><small>${T.d}</small></button>`;
    }).join('')}</div>
    <div class="sugg-label">Chọn câu phản hồi:</div>
    <div class="sugg-list">${sugg.map((s, i) => `<button class="sugg${chosen === s ? ' sel' : ''}" data-s="${i}">${s}</button>`).join('')}</div>
    <textarea id="replyCustom" rows="2" maxlength="400" placeholder="Hoặc tự viết câu của bạn...">${chosen && !sugg.includes(chosen) ? chosen.replace(/</g, '&lt;') : ''}</textarea>
    <div class="av-row"><span class="av-label">Hiện danh:</span>${AV_OPTS.map(o =>
      `<button class="av-btn${o.id === av ? ' sel' : ''}" data-av="${o.id}" title="${o.n}">${o.ico}</button>`).join('')}</div>`,
    [['Huỷ', null], [isEdit ? 'Lưu' : 'Gửi phản hồi', () => sendReply(r, tone, av, chosen), true]]);
    document.querySelectorAll('.tone-btn').forEach(b => b.onclick = () => {
      tone = b.dataset.tone; chosen = null; sfx('tick'); render();
    });
    document.querySelectorAll('.sugg').forEach(b => b.onclick = () => {
      chosen = b.textContent; sfx('tick');
      document.querySelectorAll('.sugg').forEach(x => x.classList.toggle('sel', x === b));
      const ta = document.getElementById('replyCustom'); if (ta) ta.value = '';
    });
    document.querySelectorAll('.av-btn').forEach(b => b.onclick = () => {
      av = b.dataset.av; sfx('tick');
      document.querySelectorAll('.av-btn').forEach(x => x.classList.toggle('sel', x === b));
    });
  };
  render();
}

function sendReply(r, tone, av, chosen) {
  const ta = document.getElementById('replyCustom');
  const custom = ta && ta.value.trim();
  const text = custom || chosen || null;   // không có gì → engine tự sinh câu theo tông
  const out = applyReply(S, cfg, rng, r, tone, { text, av });
  if (!out || !out.ok) { toast('Không phản hồi được', 'bad'); return; }
  save(S);
  if (out.backfire) {
    sfx('wrong');
    toast(r.x ? '🔮 Dám cà khịa đại năng?! Một review 1 sao giáng xuống quán!' : '🔥 Cà khịa quá đà — khách đăng bài bóc phốt quán!', 'bad', 3600);
  } else {
    sfx('coin');
    if (out.viral) toast('📈 Câu trả lời lên xu hướng! +' + fmtD(out.money) + ' từ cộng đồng mạng', 'good', 4000);
    else if (out.starUp) toast('🌸 Khách nguôi giận, sửa tăng thêm 1 sao!', 'good', 3200);
    else if (out.broke) { renderReviews(); showBreakthrough(out.newRealm, () => {}); return; }
    else toast('Đã gửi phản hồi ✨ +1 tu vi đối nhân', 'good');
  }
  renderReviews();
  updateHud();
}

/* ============ chạy ============ */
/* ?reset=1 → xoá TOÀN BỘ localStorage của game TRƯỚC KHI load
 * (không đoán tên key — xoá sạch để chống beforeunload của tab cũ ghi đè lại) */
try {
  if (new URLSearchParams(location.search).has('reset')) {
    localStorage.clear();
  }
} catch (e) {}
boot();
showScreen('splash');
window.addEventListener('beforeunload', () => { try { if (!S._wiped) save(S); } catch (e) {} });
