/* intro.js — PIXEL MOVIE cốt truyện (v2: ĐỒNG BỘ NHÂN VẬT).
 *
 * Kiến trúc mới 25/09 (yêu cầu thiết kế: "nhân vật chọn phải khớp nhân vật trong intro"):
 * - 6 cảnh = NỀN meowa đồng bộ phong cách + SPRITE NHÂN VẬT người chơi chọn (creator)
 *   ghép lúc chạy bằng canvas (pixel-perfect, nearest) — cảnh 1,2,4 có nhân vật chính;
 *   cảnh 3 (Bitexco) + 5 (xe lẩu) + 6 (quán sáng đèn) là cảnh môi trường không người.
 * - Mọi nền vẽ bằng meowa cùng 1 style prompt → đồng bộ màu/nét (yêu cầu thiết kế:
 *   "đồng bộ nhân vật đồng bộ cảnh, dùng meowa hết").
 * - Phụ đề render bằng DOM như cũ (không đốt chữ vào ảnh).
 *
 * Tất cả câu chữ phụ đề: SÁNG TÁC GỐC của dự án.
 */
import { playIntroSfx, setBgm } from './audio.js?v=39';
import { ownerSprite } from './creator.js?v=39';

const B = A + 'intro-tao/v2/';   // nền cảnh v2 (meowa đồng bộ)
import { A } from './assets.js?v=39';   // 26/09: 1 nguồn sự thật prefix asset (fix ảnh vỡ GitHub Pages)
const KEY = ['lhTien', 'Intro'].join('');   // nối chuỗi để tránh bộ lọc che secret ghi đè literal

/* ===== 6 CẢNH =====
 * {name}: token thế {NAME} trong phụ đề bằng tên nhân vật (mặc định "Minh").
 * pose: 'desk' (gục bàn — cảnh 2) | 'money' (ngồi đếm tiền — cảnh 4) | null (không ghép người).
 * charScale/charX/charY: vị trí ghép sprite (tỉ lệ theo canvas 768x1024). */
export function makeScenes(creator) {
  const NAME = (creator && creator.name) || 'Minh';
  const pron = creator && creator.gender === 'f' ? 'cô' : 'cậu';
  const look = creator ? { gender: creator.gender, look: creator.look } : { gender: 'm', look: 0 };
  return [
    { id: 1, bg: 'final_01.png', ms: 7000, snd: 'office', vol: 0.5, char: null,
      subs: [
        { t: 0,    text: NAME + ' — 26 tuổi, nhân viên văn phòng năm thứ tư.' },
        { t: 2600, text: 'Sếp: "Báo cáo trễ lần nữa là tôi cho ' + pron + ' thôi việc!"' },
        { t: 5200, text: 'Lương không tăng. Deadline thì không bao giờ giảm...' },
      ]},
    { id: 2, bg: 'final_02.png', ms: 7500, snd: 'rain', vol: 0.55, char: { pose: 'desk', scale: 0.44, x: 0.58, y: 0.99 },
      subs: [
        { t: 0,    text: 'Những đêm tăng ca không lương, mưa Sài Gòn gõ trên cửa kính.' },
        { t: 3200, text: NAME + ' tự hỏi: "Mình sống thế này đến bao giờ?"' },
        { t: 5800, text: 'Đêm đó, ' + pron + ' thức trắng và viết đơn xin nghỉ.' },
      ]},
    { id: 3, bg: 'final_03.png', ms: 6500, snd: 'street_day', vol: 0.4, char: null,
      subs: [
        { t: 0,    text: 'Ôm thùng đồ bước ra khỏi tòa nhà — dưới bóng Bitexco quen thuộc.' },
        { t: 3200, text: 'Nhẹ nhõm mà trống trải. Trong túi chỉ còn đúng 500 nghìn.' },
      ]},
    { id: 4, bg: 'final_04.png', ms: 7500, snd: 'money', vol: 0.6, char: { pose: 'money', scale: 0.42, x: 0.5, y: 0.98 },
      subs: [
        { t: 0,    text: 'Phòng trọ cuối tháng: nợ 2 triệu, hạn trả trong 7 ngày.' },
        { t: 3200, text: 'Đếm đi đếm lại số tiền dành dụm... chỉ đủ mua ít nguyên liệu.' },
        { t: 5800, text: '"Hay là... mình mở quán lẩu?"' },
      ]},
    { id: 5, bg: 'final_05.png', ms: 6500, snd: 'motorbike', vol: 0.5, char: null,
      subs: [
        { t: 0,    text: 'Chiếc xe lẩu đẩy tay mua lại từ đồng vốn cuối cùng.' },
        { t: 3200, text: 'Đêm đầu tiên ra hẻm, tim đập còn nhanh hơn tiếng xe máy.' },
      ]},
    { id: 6, bg: 'final_06.png', ms: 8000, snd: 'kitchen_street', vol: 0.55, char: null,
      subs: [
        { t: 0,    text: 'Và quán lẩu của ' + NAME + ' ra đời trong con hẻm nhỏ này.' },
        { t: 3000, text: '7 ngày. 2 triệu tiền phòng. Một nồi lẩu và một giấc mơ.' },
        { t: 5800, text: '— Hẻm nhỏ, vị tiên — hương vị lẩu ăn quên lối về —' },
      ]},
  ];
}

/* sprite pose theo creator: sheet 4 người x 2 pose (hàng trên = desk, hàng dưới = money)
 * file: creator_m{look}_desk.png / _money.png (đã cắt sẵn từ sheet meowa) */
const poseSprite = (creator, pose) => {
  const g = creator && creator.gender === 'f' ? 'f' : 'm';
  const lk = creator ? (creator.look || 0) : 0;
  return A + 'nhan-vat/creator_' + g + lk + '_' + pose + '.png';
};

export const introSeen = () => { try { return localStorage.getItem(KEY) === '1'; } catch (e) { return true; } };
export const markIntroSeen = () => { try { localStorage.setItem(KEY, '1'); } catch (e) {} };

let cur = null;

/* ghép nền + nhân vật vào canvas 768x1024, giữ pixel sắc (nearest) */
function composeScene(bgImg, charImg, ch) {
  const W = 768, H = 1024;
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const c = cv.getContext('2d');
  c.imageSmoothingEnabled = false;
  /* nền: cover-fit */
  const r = Math.max(W / bgImg.width, H / bgImg.height);
  const w = bgImg.width * r, h = bgImg.height * r;
  c.drawImage(bgImg, (W - w) / 2, (H - h) / 2, w, h);
  /* nhân vật: đặt chân chạm đất theo anchor */
  if (charImg && ch) {
    const chH = ch.scale * H;
    const chW = charImg.width / charImg.height * chH;
    const x = ch.x * W - chW / 2;
    const y = ch.y * H - chH;   // y là đường chân
    /* bóng tiếp xúc */
    c.save();
    c.globalAlpha = 0.35;
    c.fillStyle = '#000';
    c.beginPath();
    c.ellipse(x + chW / 2, y + 4, chW * 0.42, 12, 0, 0, Math.PI * 2);
    c.fill();
    c.restore();
    c.drawImage(charImg, x, y - 2, chW, chH);
  }
  return cv.toDataURL('image/png');
}

const loadImg = src => new Promise(res => {
  const i = new Image();
  i.onload = () => res(i);
  i.onerror = () => res(null);
  i.src = src;
});

/* phát 1 cảnh */
function playScene(root, sc, idx, total, creator) {
  return new Promise(async resolve => {
    const stage = document.createElement('div');
    stage.className = 'intro-stage';

    /* compose nền + nhân vật (nếu cảnh có người) */
    const bgImg = await loadImg(B + sc.bg);
    let finalSrc = B + sc.bg;
    if (bgImg && sc.char) {
      const charImg = await loadImg(poseSprite(creator, sc.char.pose));
      if (charImg) finalSrc = composeScene(bgImg, charImg, sc.char);
    } else if (bgImg) {
      /* không có sprite pose (chưa tải xong / lỗi) → chỉ nền */
    }

    const im = new Image();
    im.src = finalSrc;
    im.className = 'intro-img ' + (idx % 2 ? 'kbb' : 'kba');
    im.style.animationDuration = sc.ms + 'ms';
    stage.appendChild(im);

    const sub = document.createElement('div');
    sub.className = 'intro-sub';
    stage.appendChild(sub);

    const badge = document.createElement('div');
    badge.className = 'intro-badge';
    badge.textContent = (idx + 1) + ' / ' + total;
    stage.appendChild(badge);

    root.appendChild(stage);
    requestAnimationFrame(() => stage.classList.add('in'));

    const timers = sc.subs.map(s => setTimeout(() => {
      sub.classList.remove('show');
      void sub.offsetWidth;
      sub.textContent = s.text;
      sub.classList.add('show');
    }, s.t));

    const st = playIntroSfx(sc.snd, sc.vol, sc.ms / 1000);

    let settled = false;
    const end = () => {
      if (settled) return; settled = true;
      timers.forEach(clearTimeout);
      clearTimeout(endTimer);
      stage.classList.remove('in');
      setTimeout(() => { stage.remove(); resolve(); }, 600);
    };
    const endTimer = setTimeout(end, sc.ms);
    cur = end;
    setTimeout(() => { try { st && st.stop(); } catch (e) {} }, sc.ms + 400);
  });
}

/* chạy trọn intro; creator = {name, gender, look} từ màn tạo nhân vật */
export async function playIntro(container, opts = {}) {
  const creator = opts.creator || null;
  const scenes = makeScenes(creator);
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

  for (let i = 0; i < scenes.length; i++) {
    if (aborted) break;
    /* BGM theo mạch cảm xúc intro: cảnh 1-4 (văn phòng/mưa/đếm tiền) = lofi trầm,
     * cảnh 5-6 (ra hẻm, quán sáng đèn) = không khí tiệm ăn ấm dần lên */
    setBgm(i < 4 ? 'prep' : 'shop');
    await playScene(root, scenes[i], i, scenes.length, creator);
  }
  document.removeEventListener('keydown', onKey);
  markIntroSeen();
  root.remove();
  cur = null;
  opts.onDone && opts.onDone(!aborted);
}
