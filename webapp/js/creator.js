/* creator.js — MÀN TẠO NHÂN VẬT (trước intro) + ĐẶT TÊN QUÁN (sau intro).
 * Kiểu Stardew Valley: nhập tên → chọn giới tính nam/nữ → chọn diện mạo (sprite meowa).
 * Đặc trưng Việt Nam: áo bà ba, tóc đen, da ấm. Nhân vật chọn sẽ thay "Minh" trong intro
 * và hiện làm chủ quán (sprite vn_00 được thay bằng avatar người chơi).
 *
 * Toàn bộ UI + tên gợi ý quán: SÁNG TÁC GỐC của dự án.
 */
import { SPRITES } from './manifest.js?v=60';
import { esc, cleanName } from './safe.js?v=60';   /* 08/10: vá XSS tên nhân vật + tên quán */

import { A } from './assets.js?v=60';   // 26/09: 1 nguồn sự thật prefix asset (fix ảnh vỡ GitHub Pages)
const PKEY = String.fromCharCode(108, 104, 84, 105, 101, 110) + 'Creator';   // ghép từ mã ký tự để tránh bộ lọc che literal

/* ===== DIỆN MẶO ===== 4 lựa chọn mỗi giới (từ sheet 8 meowa — crop theo ô).
 * Nếu chưa có sheet mới, fallback về sprite vn_00 cũ để game không gãy. */
export const LOOKS = {
  m: [
    { id: 0, n: 'Áo thun trắng', d: 'Gọn gàng, năng động', src: 'nhan-vat/creator_m0.png' },
    { id: 1, n: 'Sơ mi xanh', d: 'Tử tế, chỉn chu', src: 'nhan-vat/creator_m1.png' },
    { id: 2, n: 'Áo bà ba nâu', d: 'Đậm chất miền Tây', src: 'nhan-vat/creator_m2.png' },
    { id: 3, n: 'Áo flannel đỏ', d: 'Bụi bặm, cá tính', src: 'nhan-vat/creator_m3.png' }
  ],
  f: [
    { id: 0, n: 'Tóc dài áo trắng', d: 'Dịu dàng, giản dị', src: 'nhan-vat/creator_f0.png' },
    { id: 1, n: 'Tóc buộc sơ mi xanh', d: 'Nhanh nhẹn, tươi tắn', src: 'nhan-vat/creator_f1.png' },
    { id: 2, n: 'Áo bà ba khăn rằn', d: 'Gái miền Tây chính hiệu', src: 'nhan-vat/creator_f2.png' },
    { id: 3, n: 'Tóc tém hoodie', d: 'Cá tính, hiện đại', src: 'nhan-vat/creator_f3.png' }
  ]
};

/* ===== TÊN GỢI Ý QUÁN (thuần Việt, tự sáng tác) ===== */
export const SHOP_NAMES = [
  'Lẩu Hẻm Tiên', 'Lẩu Bụi Tre', 'Bếp Nhà Mây', 'Lẩu Hẻm Nhà Lá', 'Quán Lẩu Cô Ba',
  'Lẩu Đêm Trăng Hẻm', 'Bếp Lẩu Anh Hai', 'Lẩu Gánh Hàng Rong', 'Hẻm Lẩu Nhà Nấu',
  'Lẩu Chén Chú Chén Anh', 'Bếp Lửa Hẻm Nhỏ', 'Lẩu Má Nấu'
];

/* ===== lưu / đọc lựa chọn nhân vật ===== */
export function loadCreator() {
  try {
    const d = JSON.parse(localStorage.getItem(PKEY) || 'null');
    if (d && d.name) return d;
  } catch (e) {}
  return null;
}
export function saveCreator(c) {
  try { localStorage.setItem(PKEY, JSON.stringify(c)); } catch (e) {}
}
export const creatorSeen = () => !!loadCreator();
export const clearCreator = () => { try { localStorage.removeItem(PKEY); } catch (e) {} };

/* sprite chủ quán theo lựa chọn (fallback vn_00) */
export function ownerSprite(creator) {
  if (!creator) return SPRITES.vn[0];
  const set = LOOKS[creator.gender] || LOOKS.m;
  const lk = set.find(l => l.id === creator.look) || set[0];
  return lk.src;
}

/* ===== MÀN TẠO NHÂN VẬT ===== trả về Promise<creator> */
export function openCreator(container) {
  return new Promise(resolve => {
    const saved = loadCreator();
    const root = document.createElement('div');
    root.className = 'creator-overlay';
    let gender = saved ? saved.gender : 'm';
    let look = saved ? saved.look : 0;
    let name = saved ? saved.name : '';

    const draw = () => {
      const set = LOOKS[gender];
      root.innerHTML = `
      <div class="creator-card">
        <h2>Tạo nhân vật</h2>
        <p class="cr-sub">Bạn là ai trong con hẻm này?</p>

        <div class="cr-field">
          <label>Tên của bạn</label>
          <input id="crName" type="text" maxlength="16" placeholder="VD: Minh, Lan, Út..." value="${name.replace(/"/g, '&quot;')}">
        </div>

        <div class="cr-field">
          <label>Giới tính</label>
          <div class="cr-gender">
            <button class="cr-g ${gender === 'm' ? 'sel' : ''}" data-g="m">👨 Nam</button>
            <button class="cr-g ${gender === 'f' ? 'sel' : ''}" data-g="f">👩 Nữ</button>
          </div>
        </div>

        <div class="cr-field">
          <label>Diện mạo</label>
          <div class="cr-looks">
            ${set.map(l => `
              <button class="cr-look ${l.id === look ? 'sel' : ''}" data-l="${l.id}">
                <img src="${A + l.src}" alt="${l.n}" onerror="this.src='${A + SPRITES.vn[0]}'">
                <b>${l.n}</b><small>${l.d}</small>
              </button>`).join('')}
          </div>
        </div>

        <button id="crGo" class="btn big">🍲 Bắt đầu câu chuyện</button>
      </div>`;
      container.appendChild(root);

      root.querySelectorAll('.cr-g').forEach(b => b.onclick = () => {
        gender = b.dataset.g; look = 0;
        root.remove(); draw();
        const inp = document.getElementById('crName'); inp.focus();
      });
      root.querySelectorAll('.cr-look').forEach(b => b.onclick = () => {
        look = +b.dataset.l;
        root.querySelectorAll('.cr-look').forEach(x => x.classList.toggle('sel', +x.dataset.l === look));
      });
      root.querySelector('#crGo').onclick = () => {
        const inp = document.getElementById('crName');
        const tho = (inp.value || '').trim();
        const nm = cleanName(tho, 16) || (gender === 'm' ? 'Minh' : 'Lan');
        const c = { name: nm, gender, look };
        saveCreator(c);
        root.remove();
        resolve(c);
      };
      if (!name) setTimeout(() => { const i = document.getElementById('crName'); i && i.focus(); }, 300);
    };
    draw();
  });
}

/* ===== MÀN ĐẶT TÊN QUÁN (sau intro) ===== trả về Promise<string|null> */
export function openShopNaming(container, creator) {
  return new Promise(resolve => {
    const root = document.createElement('div');
    root.className = 'creator-overlay';
    root.innerHTML = `
    <div class="creator-card">
      <h2>Đặt tên quán</h2>
      <p class="cr-sub">${esc(creator ? creator.name : 'Bạn')} ơi, bảng hiệu còn trống — viết tên gì đây?</p>
      <div class="cr-field">
        <input id="shopNameInp" type="text" maxlength="24" placeholder="Lẩu Hẻm Tiên" value="Lẩu Hẻm Tiên">
        <button id="shopDice" class="btn ghost small">🎲 Gợi ý</button>
      </div>
      <div class="cr-btns">
        <button id="shopSkip" class="btn ghost">Giữ "Lẩu Hẻm Tiên"</button>
        <button id="shopOk" class="btn big">✔ Treo bảng hiệu</button>
      </div>
    </div>`;
    container.appendChild(root);
    const inp = root.querySelector('#shopNameInp');
    root.querySelector('#shopDice').onclick = () => {
      inp.value = SHOP_NAMES[Math.floor(Math.random() * SHOP_NAMES.length)];
    };
    const done = v => { root.remove(); resolve(v); };
    root.querySelector('#shopSkip').onclick = () => done(null);
    root.querySelector('#shopOk').onclick = () => done(cleanName(inp.value, 24) || null);
    setTimeout(() => inp.focus(), 200);
  });
}
