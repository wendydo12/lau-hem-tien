/* audio.js — bộ âm thanh LẨU HẺM TIÊN, 100% tổng hợp Web Audio (sáng tác gốc, không file).
 * Thiết kế âm theo bối cảnh lẩu hẻm đêm: nồi đồng, nước sôi, bếp gas, chuông cửa,
 * tiền giấy, linh thạch tinh thể, và dế đêm ngoài hẻm.
 * Mọi waveform/tần số/envelope dưới đây là tự thiết kế cho dự án này. */

const AU = { ctx: null, on: true, mus: true, started: false };
try {
  const a = JSON.parse(localStorage.getItem('lhTAudio'));
  if (a) { AU.on = a.on !== false; AU.mus = a.mus !== false; }
} catch (e) {}

function saveAu() { try { localStorage.setItem('lhTAudio', JSON.stringify({ on: AU.on, mus: AU.mus })); } catch (e) {} }

/* AudioContext chỉ được tạo sau gesture đầu tiên của người dùng */
function au() {
  if (!AU.ctx) {
    const C = window.AudioContext || window.webkitAudioContext;
    if (!C) return null;
    const c = AU.ctx = new C();
    AU.master = c.createGain(); AU.master.gain.value = .85; AU.master.connect(c.destination);
    AU.fx = c.createGain(); AU.fx.gain.value = 1; AU.fx.connect(AU.master);      // sfx
    AU.mg = c.createGain(); AU.mg.gain.value = 0; AU.mg.connect(AU.master);      // ambience
    /* buffer nhiễu trắng 1s dùng chung */
    const len = c.sampleRate;
    AU.nb = c.createBuffer(1, len, c.sampleRate);
    const d = AU.nb.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  }
  if (AU.ctx.state === 'suspended' && !document.hidden) AU.ctx.resume();
  return AU.ctx;
}
/* unlock audio bằng gesture thật đầu tiên */
function unlockAudio() {
  if (AU.started) return;
  AU.started = true;
  au();
}
document.addEventListener('pointerdown', unlockAudio, { once: true });

/* tone: 1 nốt có glide tần số */
function tn(f, at, dur, type, vol, to, dest) {
  const c = AU.ctx; if (!c) return;
  const t = c.currentTime + (at || 0);
  const o = c.createOscillator(), g = c.createGain();
  o.type = type || 'sine';
  o.frequency.setValueAtTime(f, t);
  if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(vol || .12, t + .01);
  g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  o.connect(g); g.connect(dest || AU.fx);
  o.start(t); o.stop(t + dur + .03);
}
/* noise burst qua filter */
function nz(at, dur, freq, q, vol, type) {
  const c = AU.ctx; if (!c) return;
  const t = c.currentTime + (at || 0);
  const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
  s.buffer = AU.nb;
  f.type = type || 'bandpass'; f.frequency.value = freq; f.Q.value = q || 1;
  g.gain.setValueAtTime(vol || .1, t);
  g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  s.connect(f); f.connect(g); g.connect(AU.fx);
  s.start(t, Math.random() * .5); s.stop(t + dur + .03);
}

/* ============ SFX — thiết kế riêng cho tiệm lẩu ============ */
const SFX = {
  /* chạm nút: tiếng gõ gỗ ngắn "cộc" */
  tap() { tn(320, 0, .05, 'triangle', .07, 200); nz(0, .03, 900, 1, .04); },
  /* đặt nồi đồng xuống bếp: "keng" trầm ấm */
  pot() { tn(196, 0, .28, 'sine', .16, 150); tn(392, .01, .18, 'sine', .05); nz(0, .06, 600, .8, .07, 'lowpass'); },
  /* thả đồ nhúng vào nồi: "tõm" nước bắn nhẹ */
  plop() { tn(440, 0, .13, 'sine', .17, 130); nz(.02, .09, 1100, 1.4, .07); },
  /* bật bếp gas: "phựt" + rít nhẹ */
  fire_on() { nz(0, .16, 2600, .7, .1, 'highpass'); tn(140, .02, .1, 'sawtooth', .05, 90); nz(.03, .3, 700, .5, .05, 'lowpass'); },
  /* lửa chuẩn: 2 nốt chuông pentatonic sáng (Sol→Rê) */
  perfect() { tn(784, 0, .22, 'triangle', .09); tn(1175, .09, .3, 'triangle', .07); },
  /* non lửa: "bụp" xìu */
  weak() { tn(220, 0, .18, 'sine', .1, 110); nz(.02, .12, 400, .6, .05, 'lowpass'); },
  /* khét nồi: rè gắt + tiếng nổ lách tách */
  burnt() { tn(110, 0, .35, 'square', .06, 70); nz(0, .4, 900, .4, .12, 'lowpass'); for (let i = 0; i < 5; i++) nz(.05 + i * .07, .03, 2500 + Math.random() * 1500, 3, .04); },
  /* tiền giấy vào két: "xoẹt-xoẹt" 2 tờ + ting */
  coin() { nz(0, .07, 3200, 1.2, .06, 'highpass'); nz(.08, .07, 3000, 1.2, .05, 'highpass'); tn(1319, .14, .22, 'square', .045); tn(1760, .2, .3, 'square', .035); },
  /* linh thạch: chuông pha lê ngân dài (khác hẳn tiền giấy) */
  ls_coin() { [1568, 2093, 2637].forEach((f, i) => tn(f, i * .07, .6, 'sine', .05)); tn(3136, .24, .8, 'sine', .025); },
  /* khách thường vào quán: chuông cửa "kính coong" 2 âm */
  bell() { tn(1047, 0, .5, 'sine', .06); tn(1397, .14, .55, 'sine', .045); },
  /* khách tu tiên đáp xuống: chùm âm huyền bí bay lên + ngân */
  xian() { [523, 659, 784, 1047].forEach((f, i) => tn(f, i * .09, .5, 'sine', .05)); tn(1568, .4, .9, 'sine', .03); nz(0, .5, 2200, .4, .025, 'bandpass'); },
  /* mở thực đơn bí mật: shimmer quét lên */
  secret() { const c = AU.ctx; if (!c) return; const t = c.currentTime; const o = c.createOscillator(), g = c.createGain(), f = c.createBiquadFilter();
    o.type = 'sawtooth'; f.type = 'bandpass'; f.Q.value = 6;
    f.frequency.setValueAtTime(400, t); f.frequency.exponentialRampToValueAtTime(4000, t + .5);
    g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(.05, t + .1); g.gain.exponentialRampToValueAtTime(.0001, t + .6);
    o.connect(f); f.connect(g); g.connect(AU.fx); o.start(t); o.stop(t + .65);
    tn(2093, .3, .5, 'sine', .03); },
  /* review 5 sao: arpeggio 4 nốt vui */
  star() { [880, 1109, 1319, 1760].forEach((f, i) => tn(f, i * .07, .3, 'triangle', .065)); },
  /* sai món / khách giận: 2 nốt tụt "ố ồ" */
  wrong() { tn(330, 0, .16, 'sawtooth', .05); tn(247, .14, .28, 'sawtooth', .05); },
  /* khách bỏ về: cửa đóng "cạch" trầm */
  left() { tn(150, 0, .12, 'square', .05, 80); nz(0, .1, 500, .8, .06, 'lowpass'); },
  /* đổ nồi: nước đổ ụp + kim loại */
  trash() { nz(0, .3, 700, .5, .14, 'lowpass'); tn(160, 0, .22, 'sine', .09, 70); },
  /* quà / sự kiện vui: 2 nốt nhảy "teng-teng" */
  gift() { tn(988, 0, .15, 'triangle', .08); tn(1319, .12, .25, 'triangle', .07); },
  /* tai họa: rumble trầm + sét nhỏ */
  bad_ev() { tn(70, 0, .6, 'sine', .1, 45); nz(.1, .5, 300, .3, .1, 'lowpass'); nz(.3, .15, 3000, .5, .05, 'highpass'); },
  /* hết ngày: hợp âm ấm buông dần (Đô-Trưởng thêm Sol) */
  end_day() { [523, 659, 784].forEach((f, i) => tn(f, i * .05, .9, 'sine', .05)); tn(1047, .2, 1.1, 'sine', .03); },
  /* lên cấp / mở khóa: fanfare 3 nốt */
  lvup() { [659, 784, 1047].forEach((f, i) => tn(f, i * .12, .4, 'triangle', .08)); tn(1319, .36, .6, 'triangle', .05); },
  /* cộng/trừ số lượng ở màn kho: tick nhẹ */
  tick() { tn(600, 0, .04, 'square', .035); },
};

/* ============ vòng sôi lăn tăn khi giữ lửa ============ */
let bubbleTimer = null;
function bubbleLoop(on) {
  if (!AU.on) return;
  if (on && !bubbleTimer) {
    au(); if (!AU.ctx) return;
    /* nền sôi: nhiễu lowpass rất nhỏ + bọt nổ ngẫu nhiên */
    const c = AU.ctx;
    const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    s.buffer = AU.nb; s.loop = true;
    f.type = 'lowpass'; f.frequency.value = 240;
    g.gain.setValueAtTime(0, c.currentTime);
    g.gain.linearRampToValueAtTime(.05, c.currentTime + .3);
    s.connect(f); f.connect(g); g.connect(AU.fx);
    s.start();
    AU._boil = { s, g };
    bubbleTimer = setInterval(() => {
      if (!AU.ctx) return;
      const n = 1 + Math.floor(Math.random() * 2);
      for (let i = 0; i < n; i++) {
        const at = Math.random() * .2;
        tn(180 + Math.random() * 260, at, .06, 'sine', .025, 90);
      }
      if (Math.random() < .25) nz(Math.random() * .2, .05, 900 + Math.random() * 600, 2, .02);
    }, 320);
  } else if (!on && bubbleTimer) {
    clearInterval(bubbleTimer); bubbleTimer = null;
    if (AU._boil) {
      try {
        AU._boil.g.gain.linearRampToValueAtTime(.0001, AU.ctx.currentTime + .2);
        const s = AU._boil.s; setTimeout(() => { try { s.stop(); } catch (e) {} }, 300);
      } catch (e) {}
      AU._boil = null;
    }
  }
}

/* ============ ambience hẻm đêm: gió nhẹ + dế kêu ============ */
let ambTimer = null;
function ambience(on) {
  if (!AU.on || !AU.mus) { ambOff(); return; }
  if (on && !ambTimer) {
    au(); if (!AU.ctx) return;
    const c = AU.ctx;
    /* nền phố đêm: nhiễu nâu rất nhỏ qua lowpass */
    const s = c.createBufferSource(), f = c.createBiquadFilter();
    s.buffer = AU.nb; s.loop = true;
    f.type = 'lowpass'; f.frequency.value = 160;
    AU.mg.gain.setValueAtTime(0, c.currentTime);
    AU.mg.gain.linearRampToValueAtTime(.028, c.currentTime + 2);
    s.connect(f); f.connect(AU.mg);
    s.start();
    AU._amb = s;
    /* dế: chùm chirp 4.2kHz ngẫu nhiên mỗi 2-6s */
    ambTimer = setInterval(() => {
      if (!AU.ctx || !AU.on) return;
      if (Math.random() < .7) {
        const n = 2 + Math.floor(Math.random() * 3);
        for (let i = 0; i < n; i++) {
          tn(4100 + Math.random() * 500, i * .09, .045, 'sine', .012);
        }
      }
    }, 3500);
  } else if (!on) ambOff();
}
function ambOff() {
  if (ambTimer) { clearInterval(ambTimer); ambTimer = null; }
  if (AU._amb && AU.ctx) {
    try { AU.mg.gain.linearRampToValueAtTime(.0001, AU.ctx.currentTime + .5); const s = AU._amb; setTimeout(() => { try { s.stop(); } catch (e) {} }, 600); } catch (e) {}
    AU._amb = null;
  }
}

/* ============ API ============ */
export function sfx(n) {
  if (!AU.on) return;
  if (!au()) return;
  try { SFX[n] && SFX[n](); } catch (e) {}
}
export function setBoil(on) { bubbleLoop(on); }
export function setAmbience(on) { ambience(on); }
export function toggleAudio() {
  AU.on = !AU.on;
  if (!AU.on) { setBoil(false); ambOff(); }
  saveAu();
  return AU.on;
}
export const audioOn = () => AU.on;
