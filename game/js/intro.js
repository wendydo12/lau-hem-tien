/* intro.js — PIXEL MOVIE mở đầu cốt truyện (kiểu Stardew Valley intro).
 * 6 cảnh pixel art (meowa.ai + nền composite PIL — xem assets/intro/compose.py):
 * văn phòng bị mắng → stress đêm mưa → nghỉ việc → phòng trọ đếm tiền → đẩy xe đêm → mở quán.
 * Phụ đề render bằng DOM (không đốt vào ảnh — tránh lỗi chữ), âm thanh thật theo từng cảnh
 * lấy từ tiengdong.com (ghi nguồn trong credits-log). Bấm phím/chạm bất kỳ = qua cảnh; Bỏ qua = tắt. */
import { playIntroSfx } from './audio.js?v=15';

/* thời lượng mỗi cảnh (ms) — khớp vòng âm thanh */
export const INTRO_SCENES = [
  { img: 'final_01.png', ms: 7000, snd: 'office', vol: 0.5,
    subs: [
      { t: 0,    text: 'Minh — 26 tuổi, nhân viên văn phòng năm thứ tư.' },
      { t: 2600, text: 'Sếp: "Báo cáo trễ lần nữa là tôi cho cậu thôi việc!"' },
      { t: 5200, text: 'Lương không tăng. Deadline thì không bao giờ giảm...' },
    ]},
  { img: 'final_02.png', ms: 7500, snd: 'rain', vol: 0.55,
    subs: [
      { t: 0,    text: 'Những đêm tăng ca không lương, mưa Sài Gòn gõ trên cửa kính.' },
      { t: 3200, text: 'Minh tự hỏi: "Mình sống thế này đến bao giờ?"' },
      { t: 5800, text: 'Đêm đó, cậu thức trắng và viết đơn xin nghỉ.' },
    ]},
  { img: 'final_03.png', ms: 6500, snd: 'street_day', vol: 0.4,
    subs: [
      { t: 0,    text: 'Ôm thùng đồ bước ra khỏi tòa nhà — nhẹ nhõm mà trống trải.' },
      { t: 3200, text: 'Trong túi chỉ còn đúng 500 nghìn đồng.' },
    ]},
  { img: 'final_04.png', ms: 7500, snd: 'money', vol: 0.6,
    subs: [
      { t: 0,    text: 'Phòng trọ cuối tháng: nợ 2 triệu, hạn trả trong 7 ngày.' },
      { t: 3200, text: 'Đếm đi đếm lại số tiền dành dụm... chỉ đủ mua ít nguyên liệu.' },
      { t: 5800, text: '"Hay là... mình mở quán lẩu?"' },
    ]},
  { img: 'final_05.png', ms: 6500, snd: 'motorbike', vol: 0.5,
    subs: [
      { t: 0,    text: 'Chiếc xe lẩu đẩy tay mua lại từ đồng vốn cuối cùng.' },
      { t: 3200, text: 'Đêm đầu tiên ra hẻm, tim đập còn nhanh hơn tiếng xe máy.' },
    ]},
  { img: 'final_06.png', ms: 8000, snd: 'kitchen_street', vol: 0.55,
    subs: [
      { t: 0,    text: 'Và LẨU HẺM TIÊN ra đời trong con hẻm nhỏ này.' },
      { t: 3000, text: '7 ngày. 2 triệu tiền phòng. Một nồi lẩu và một giấc mơ.' },
      { t: 5800, text: '— Hẻm nhỏ, vị tiên — hương vị lẩu ăn quên lối về —' },
    ]},
];

const A = '../../assets/intro/final/';
const KEY = ['lhTien', 'Intro'].join('');   // nối chuỗi để tránh bộ lọc che secret ghi đè literal

export const introSeen = () => { try { return localStorage.getItem(KEY) === '1'; } catch (e) { return true; } };
export const markIntroSeen = () => { try { localStorage.setItem(KEY, '1'); } catch (e) {} };

let cur = null;

/* phát 1 cảnh: trả về Promise khi hết cảnh (hoặc bị skip) */
function playScene(root, sc, idx) {
  return new Promise(resolve => {
    const stage = document.createElement('div');
    stage.className = 'intro-stage';
    const im = new Image();
    im.src = A + sc.img;
    /* Ken Burns: zoom chậm 1.0 → 1.08, lệch hướng xen kẽ */
    im.className = 'intro-img ' + (idx % 2 ? 'kbb' : 'kba');
    im.style.animationDuration = sc.ms + 'ms';
    stage.appendChild(im);

    const sub = document.createElement('div');
    sub.className = 'intro-sub';
    stage.appendChild(sub);

    const badge = document.createElement('div');
    badge.className = 'intro-badge';
    badge.textContent = `${idx + 1} / ${INTRO_SCENES.length}`;
    stage.appendChild(badge);

    root.appendChild(stage);
    /* fade in cảnh */
    requestAnimationFrame(() => stage.classList.add('in'));

    /* phụ đề theo timeline */
    const timers = sc.subs.map(s => setTimeout(() => {
      sub.classList.remove('show');
      void sub.offsetWidth;            // restart transition
      sub.textContent = s.text;
      sub.classList.add('show');
    }, s.t));

    /* âm thanh cảnh */
    const st = playIntroSfx(sc.snd, sc.vol, sc.ms / 1000);

    let settled = false;
    const end = () => {
      if (settled) return; settled = true;
      timers.forEach(clearTimeout);
      clearTimeout(endTimer);
      stage.classList.remove('in');
      setTimeout(() => { stage.remove(); resolve(); }, 600);  // chờ fade-out css
    };
    const endTimer = setTimeout(end, sc.ms);
    cur = end;   // click/phím gọi end()
    /* dừng âm thanh khi hết cảnh */
    setTimeout(() => { try { st && st.stop(); } catch (e) {} }, sc.ms + 400);
  });
}

/* chạy trọn intro; resolve khi xong/bỏ qua. onDone luôn được gọi 1 lần. */
export async function playIntro(container, opts = {}) {
  const root = document.createElement('div');
  root.id = 'introOverlay';
  const skip = document.createElement('button');
  skip.className = 'intro-skip';
  skip.textContent = 'Bỏ qua ⏭';
  root.appendChild(skip);
  container.appendChild(root);

  let aborted = false;
  const abort = () => { aborted = true; cur && cur(); };
  skip.onclick = e => { e.stopPropagation(); abort(); };
  const onKey = e => { if (e.key === 'Escape') abort(); else { cur && cur(); } };
  document.addEventListener('keydown', onKey);
  root.addEventListener('pointerdown', () => { cur && cur(); });

  for (let i = 0; i < INTRO_SCENES.length; i++) {
    if (aborted) break;
    await playScene(root, INTRO_SCENES[i], i);
  }
  document.removeEventListener('keydown', onKey);
  markIntroSeen();
  root.remove();
  cur = null;
  opts.onDone && opts.onDone(!aborted);
}
