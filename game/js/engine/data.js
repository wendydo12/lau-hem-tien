/* engine/data.js — DANH MỤC DATA + NỘI DUNG SÁNG TẠO.
 *
 * BẢN QUYỀN (quy tắc sắt của dự án):
 * - Cơ chế/quy tắc chơi (vòng ngày, canh nhịp, kinh tế...) là ý tưởng vận hành — được tham khảo.
 * - MỌI câu chữ ở file này (review, hội thoại, tên nhân vật, mô tả sự kiện/nâng cấp)
 *   là SÁNG TÁC GỐC của Uyển Nhi, viết riêng cho thế giới "lẩu hẻm + tu tiên".
 * - Pixel art: sinh mới hoàn toàn bằng meowa.ai theo art direction riêng (docs/99-ghi-chu.md),
 *   KHÔNG dùng/tải/sao chép bất kỳ asset nào của game tham khảo.
 */

/* ===== ITEMS =====
 * Cấu trúc mỗi nguyên liệu: [khóa, tên, tên ngắn, màu, hạn dùng(ngày), giá nhập, giá bán, giá mở khóa] */
export const ITEMS = {};
const mk = (type, g) => (k, n, sn, c, life, cost, sell, unlock) => {
  ITEMS[k] = { n, s: sn || n, type, g, c, life, cost, sell, unlock };
};

/* --- NỒI LẨU (base) — 7 nồi theo brief của phu quân --- */
const P = mk('base', 'pot');
P('ca_chua', 'Lẩu cà chua', 'Cà chua', '#e8542e', 3, 8000, 35000, 0);
P('nam', 'Lẩu nấm', 'Nấm', '#c9a86a', 3, 9000, 40000, 0);
P('suon', 'Lẩu sườn', 'Sườn', '#b5651d', 3, 12000, 50000, 0);
P('thai', 'Lẩu Thái', 'Thái', '#e8842e', 3, 10000, 45000, 150000);
P('suki', 'Lẩu sukiyaki', 'Sukiyaki', '#7a4a2a', 2, 15000, 65000, 250000);
P('dong_trung', 'Lẩu đông trùng hạ thảo', 'Đông trùng', '#d4a017', 2, 25000, 95000, 600000);
P('tu_xuyen', 'Lẩu Tứ Xuyên', 'Tứ Xuyên', '#c1121f', 3, 14000, 70000, 400000);

/* --- NƯỚC CHẤM (dip) --- */
const C = mk('dip', 'dip');
C('d_muoi_ot', 'Muối ớt xanh', '', '#9fbf3a', 7, 0, 5000, 0);
C('d_chao', 'Chao', '', '#e8c9a8', 7, 0, 5000, 0);
C('d_sa_te', 'Sa tế', '', '#d4501e', 7, 0, 6000, 120000);
C('d_sot_me', 'Sốt me', '', '#9c6b3c', 7, 0, 6000, 150000);
C('d_mix', 'Nước chấm mix', 'Chấm mix', '#6b4a2a', 7, 0, 8000, 200000); // tương+dầu hào+bơ đậu phộng+dầu mè+hành tỏi đậu phộng
C('d_hao_du', 'Tương hào du', 'Hào du', '#3a2a1a', 7, 0, 4000, 0);
C('d_bo_dau', 'Sốt bơ đậu phộng', 'Bơ đậu', '#d8b06a', 7, 0, 6000, 100000);
C('d_ot_toi', 'Ớt tỏi băm', 'Ớt tỏi', '#c1341f', 7, 0, 4000, 0);
C('d_dau_me', 'Dầu mè', '', '#8a6a3a', 7, 0, 5000, 80000);

/* --- TOPPING THƯỜNG --- */
const T = mk('top', 'top');
T('t_bo', 'Thịt bò', 'Bò', '#b5453c', 1, 8000, 15000, 0);
T('t_gau', 'Gầu bò', 'Gầu', '#d8a06a', 1, 7000, 13000, 100000);
T('t_sun', 'Sụn sườn', 'Sụn', '#e8c9a8', 1, 6000, 12000, 0);
T('t_cuu', 'Thịt cừu', 'Cừu', '#c86a6a', 1, 9000, 17000, 200000);
T('t_de', 'Thịt dê', 'Dê', '#a0453c', 1, 9000, 17000, 250000);
T('t_ba_chi', 'Ba chỉ heo mỏng', 'Ba chỉ', '#e8a0a0', 1, 7000, 13000, 150000);
T('t_tom', 'Tôm tươi', 'Tôm', '#f08a5d', 1, 10000, 18000, 150000);
T('t_muc', 'Mực ống', 'Mực', '#f4efe4', 1, 9000, 16000, 150000);
T('t_ngheu', 'Nghêu', 'Nghêu', '#a8b8a0', 1, 6000, 12000, 200000);
T('t_ca_dieu', 'Cá điêu hồng', 'Cá điêu hồng', '#e88a8a', 1, 8000, 15000, 250000);
T('t_bo_vien', 'Bò viên', 'Bò viên', '#8a5a3b', 3, 5000, 10000, 0);
T('t_ca_vien', 'Cá viên', 'Cá viên', '#e8d8b0', 3, 4000, 9000, 0);
T('t_ca_vien_chien', 'Cá viên chiên', 'Cá viên chiên', '#d4a03c', 3, 4500, 9500, 120000);
T('t_dau_hu_ky', 'Tàu hũ ky', 'Hũ ky', '#f2d16b', 2, 3000, 7000, 100000);
T('t_dau_hu_non', 'Đậu hũ non', 'Đậu hũ non', '#f4f0e4', 1, 2000, 5000, 80000);
T('t_rau_muong', 'Rau muống', 'Rau muống', '#5fa84a', 1, 2000, 5000, 0);
T('t_cai_cuc', 'Cải cúc', 'Cải cúc', '#7ab648', 1, 3000, 6000, 0);
T('t_chan_vit', 'Rau chân vịt', 'Chân vịt', '#3f7a34', 1, 2000, 5000, 80000);
T('t_cai_thia', 'Cải thìa', 'Cải thìa', '#8ac05a', 1, 2000, 5000, 0);
T('t_kim_cham', 'Nấm kim châm', 'Kim châm', '#f4ead0', 2, 4000, 8000, 100000);
T('t_dong_co', 'Nấm đông cô', 'Đông cô', '#6b4a2a', 2, 4000, 8000, 120000);
T('t_dui_ga', 'Nấm đùi gà', 'Đùi gà', '#d8c8a0', 2, 4500, 9000, 150000);
T('t_cu_sen', 'Củ sen', 'Củ sen', '#f0e8d8', 2, 3000, 7000, 100000);
T('t_mi_goi', 'Mì gói', 'Mì gói', '#f2c14e', 7, 2000, 4000, 0);
T('t_mien', 'Miến', 'Miến', '#c8c8c0', 7, 2000, 5000, 0);
T('t_bun', 'Bún tươi', 'Bún', '#fbf8f0', 1, 2000, 4000, 0);
T('t_udong', 'Mì udon', 'Udon', '#f4efe4', 3, 3000, 6000, 150000);
T('t_trung', 'Trứng gà', 'Trứng', '#f7d56b', 3, 3000, 7000, 0);

/* --- DƯỢC THIỆN (duoc — cao cấp, khách thường đôi khi gọi) --- */
const D = mk('duoc', 'duoc');
D('du_nam_bung_de', 'Nấm bụng dê', 'Bụng dê', '#8a6a4a', 2, 8000, 16000, 350000);

/* --- THỰC ĐƠN EXTRA BÍ MẬT (secret — CHỈ hiện slot khi có khách tu tiên đang chờ.
 * Khách thường không bao giờ thấy/gọi được. Quy tắc của phu quân 25/09.) --- */
const SEC = mk('secret', 'secret');
SEC('x_linh_chi', 'Linh chi ngàn năm', 'Linh chi', '#8a3a2a', 3, 0, 2, 400000);      // sell = linh thạch hạ phẩm
SEC('x_huyet_sen', 'Huyết sen', 'Huyết sen', '#d64553', 2, 0, 3, 500000);            // sell = linh thạch
SEC('x_linh_thu', 'Thịt linh thú', 'Linh thú', '#c98d28', 1, 0, 5, 800000);          // sell = linh thạch
SEC('x_bang_tam', 'Băng tằm', 'Băng tằm', '#a8d8e8', 2, 0, 4, 600000);                // sell = linh thạch
SEC('x_nhan_sam', 'Nhân sâm ngàn năm', 'Nhân sâm', '#d8b06a', 3, 20000, 40000, 300000);   // dược liệu tiên, bán VNĐ giá cao
SEC('x_dong_trung', 'Đông trùng hạ thảo tiên', 'Đông trùng', '#e08a2e', 3, 25000, 50000, 400000);
SEC('x_tuong_tien', 'Tương tiên giới', 'Tương tiên', '#9a5fd4', 7, 0, 3, 300000);       // nước chấm bí mật, bán linh thạch
SEC('x_mat_tuong', 'Mật tương hoàng kim', 'Mật tương', '#e0a03c', 7, 0, 4, 500000);     // nước chấm bí mật 2, bán linh thạch

/* --- VẬT DỤNG --- */
ITEMS.sup = { n: 'Nồi + muỗng + chén', s: 'Nồi chén', type: 'supply', g: 'sup', c: '#c0c0c8', life: 0, cost: 2500, unlock: 0 };

export const BASE_KEYS = Object.keys(ITEMS).filter(k => ITEMS[k].type === 'base');
export const DIP_KEYS = Object.keys(ITEMS).filter(k => ITEMS[k].type === 'dip');
export const TOP_KEYS = Object.keys(ITEMS).filter(k => ITEMS[k].type === 'top');
export const DUOC_KEYS = Object.keys(ITEMS).filter(k => ITEMS[k].type === 'duoc');
export const SECRET_KEYS = Object.keys(ITEMS).filter(k => ITEMS[k].type === 'secret');
export const XTOP_KEYS = SECRET_KEYS.filter(k => ITEMS[k].sell <= 10);  // bán bằng linh thạch

/* món "chậm" (sơ chế lâu) → đơn chứa chúng được khách chờ lâu hơn một chút */
export const SLOW_KEYS = ['t_tom', 't_muc', 't_ngheu', 't_ca_dieu', 't_de'];
export const slowN = o => o.tops.filter(t => ITEMS[t]?.type === 'secret' || ITEMS[t]?.g === 'duoc' || SLOW_KEYS.includes(t)).length;

export const SPICY = ['Không cay', 'Cay vừa', 'Cay nhiều', 'Cay Tứ Xuyên'];
export const SIZES = ['N', 'L'];
export const DEF_SELL = { L: 15000 };
[...BASE_KEYS, ...DIP_KEYS, ...TOP_KEYS].forEach(k => DEF_SELL[k] = ITEMS[k].sell);

export const iname = k => ITEMS[k] ? ITEMS[k].n : k;
export const low = n => n.toLowerCase();
export const dname = o => {
  let s = ITEMS[o.base].n;
  if (o.spicy) s += ' ' + low(o.spicy);
  return s;
};

/* ===== NÂNG CẤP ===== (chữ mô tả: sáng tác gốc) */
export const UPG = [
  { id: 'sealer', n: 'Máy đậy nắp tự chế', d: 'Nấu đúng món là máy tự đậy nắp bưng tận bàn, khách vui bụng típ thêm 30%', cost: 3000000, tier: 'equip' },
  { id: 'sign', n: 'Bảng neon "LẨU"', d: 'Đèn sáng rực cả con hẻm, khách đi ngang tạt vào nhiều hơn 20%', cost: 400000, tier: 'equip' },
  { id: 'seats', n: 'Ghế nhựa + quạt máy', d: 'Có chỗ ngồi đàng hoàng, khách sẵn lòng đợi lâu hơn 25%', cost: 500000, tier: 'equip' },
  { id: 'ads', n: 'Quay clip đăng mạng', d: 'Clip lẩu sôi sùng sục lên xu hướng, khách tìm tới thêm 25%', cost: 600000, tier: 'equip' },
  { id: 'slot4', n: 'Cơi nới vỉa hè', d: 'Kê thêm bàn, phục vụ được 4 khách cùng lúc', cost: 800000, tier: 'equip' },
  { id: 'ac', n: 'Mái che + hơi nước', d: 'Chỗ chờ mát mẻ, khách đợi lâu cũng bớt cằn nhằn', cost: 900000, tier: 'equip' },
  /* tầng tiên giới — trả bằng LINH THẠCH hạ phẩm */
  { id: 'tulin', n: 'Tụ linh trận', d: 'Trận pháp dẫn linh khí về hẻm, khách tu tiên nghe mùi mà tìm tới (+20%)', costLS: 50, tier: 'xian' },
  { id: 'anthan', n: 'An thần trận', d: 'Khách tu tiên ngồi chờ mà tâm bất động, đạo tâm vững thêm 25%', costLS: 80, tier: 'xian' },
  { id: 'phap_khi', n: 'Lò địa hỏa', d: 'Lửa linh ổn định, canh lửa dễ hơn: vạch chuẩn rộng thêm 10%', costLS: 60, tier: 'xian' },
  { id: 'ho_phap', n: 'Hộ pháp quán', d: 'Một vị hộ pháp gác cửa: khách bùng tiền bị tóm, khách trả giá phải trả đủ', costLS: 120, tier: 'xian' },
  { id: 'cam_do', n: 'Chỗ quen tiệm cầm đồ', d: 'Đổi linh thạch bớt bị ép giá, spread hẹp lại 5%', costLS: 40, tier: 'xian' }
];

/* ===== NHÂN VIÊN ===== (chữ mô tả: sáng tác gốc) */
export const STAFF = [
  { id: 'staff1', n: 'Đệ tử học việc', d: 'Nhận một đứa cháu vô phụ: nó bưng nồi, bỏ topping, đậy nắp. Phần nấu nước lẩu bạn vẫn lo. Không thể thuê cùng lúc với Đệ tử 2.', cost: 500000, wage: 'wage1', from: 1 },
  { id: 'staff2', n: 'Pháp khí tự nấu', d: 'Cục pháp khí biết tự nấu: hễ có từ 2 khách là nó nhận trọn đơn của người chờ lâu nhất. Sau 22:00 nó ngốn linh khí, tính tăng ca 40k/giờ.', cost: 1000000, wage: 'wage2', from: 30 },
  { id: 'staffOn', n: 'Người chăm hạc đưa tin', d: 'Chuyên trị đơn đặt từ xa: nhận trọn đơn tiên hạc, mỗi nồi chừng một giây, trật tay 0,5%.', cost: 2000000, wage: 'wageOn', from: 1, need: S => !!S.online, needT: 'Cần mở Tiên Hạc Truyền Tin' },
  { id: 'staff3', n: 'Đệ tử 2 (cứng tay)', d: 'Đứa này khá hơn: bưng nồi, đậy nắp, biết luôn cả múc topping. Bạn chỉ việc nấu. Không thể thuê cùng lúc với Đệ tử học việc.', cost: 750000, wage: 'wage3', from: 1 }
];

/* ===== SỰ KIỆN NGÀY ===== (tên + mô tả: sáng tác gốc, luật chơi theo thể loại) */
export const EVS = {
  hot: { n: 'Nắng đổ lửa', d: 'Trời oi bức lạ thường, người ta kéo nhau đi ăn lẩu giải nhiệt kiểu ngược đời: khách đông hơn 30%, gọi cay nhiều hơn', mul: 1.3 },
  rain: { n: 'Mưa sập hẻm', d: 'Mưa trắng trời, khách ngồi tại quán vơi đi 30%, bù lại đơn đặt tiên hạc tới tấp', mul: 0.7 },
  weekend: { n: 'Cuối tuần', d: 'Cả xóm rảnh rang, khách đông hơn 25%, nhiều bàn đặt hẳn 2 nồi', mul: 1.25 },
  students: { n: 'Tan ca chiều', d: 'Giữa ngày một tốp công nhân sinh viên ào vô cùng lúc', mul: 1 },
  reviewer: { n: 'TikToker ẩm thực ghé', d: 'Một vị khách cầm điện thoại quay lén: nấu ngon được khen 3 lần, nấu dở bị chê 3 lần', mul: 1 },
  trend: { n: 'Món lên xu hướng', d: '% đang là từ khóa hot, khách gọi gấp đôi — nhớ trữ hàng', mul: 1.1 },
  sale: { n: 'Mối hàng xả kho', d: 'Nhà cung cấp xả % giá rẻ hơn 30%, chỉ hôm nay', mul: 1 },
  holiday: { n: 'Lễ hội đêm trăng', d: 'Phố phường giăng đèn, khách đông gấp đôi, típ cũng gấp đôi', mul: 2 },
  linh_bao: { n: 'Linh khí bạo động', d: 'Khe không gian dao động mạnh: khách tu tiên ghé đông bất thường hôm nay', mul: 1, xianBoost: 3 }
};

/* ===== QUÀ TẶNG ===== (sáng tác gốc) */
export const GIFTS = [
  { n: 'Khách ruột trúng số', d: 'Ông khách quen vừa trúng tờ vé số, ghé quán lì xì cả bàn một phong bì', min: 50000, max: 200000 },
  { n: 'Nhặt được của rơi', d: 'Bạn nhặt được chiếc ví giữa hẻm, trả lại khổ chủ và được hậu tạ', min: 50000, max: 150000 },
  { n: 'Được phường khen', d: 'Quán được khu phố bình chọn "góc ăn ngon sạch đẹp", kèm phong bì động viên', min: 200000, max: 300000, need: S => upgCount(S) >= 2 },
  { n: 'Tông môn đặt tiệc', d: 'Một tông môn đặt lẩu cho đại hội đệ tử, ứng trước tiền cọc', min: 400000, max: 600000, need: S => S.reviews.length >= 20 && rating40(S) >= 4.5 },
  { n: 'Dọn kho bán ve chai', d: 'Mớ thùng carton với vỏ lon chất đống, ve chai ghé cân luôn', min: 20000, max: 60000 },
  { k: 'bung', n: 'Phường đòi lại tiền giúp', d: 'Mấy kẻ ôm nồi bỏ chạy hôm trước bị tóm, phường thu tiền trả lại quán', min: 50000, max: 200000, need: S => (S.bungN || 0) > 0 },
  { n: 'Vị tu sĩ hào phóng', d: 'Một tu sĩ đánh rơi túi linh thạch được bạn trả lại, người nhất quyết hậu tạ bằng được', min: 100000, max: 500000 },
  { n: 'Nhà cung cấp đền hàng', d: 'Lô tuần trước cân thiếu, mối hàng biết lỗi nên gửi bù tiền', min: 50000, max: 250000 },
  { n: 'Lên trang "ăn gì tối nay"', d: 'Quán được một trang review lớn đăng bài khen, tiền thưởng kèm theo', min: 200000, max: 500000, need: S => S.reviews.length >= 50 && rating40(S) >= 4.3 },
  { n: 'Công ty gần bên đặt cọc', d: 'Công ty đầu hẻm chốt đơn tiệc cuối tháng, chuyển cọc trước', min: 150000, max: 400000, need: S => S.day >= 15 }
];

/* ===== TAI HỌA ===== (chữ: sáng tác gốc) */
export const BAD = [
  { id: 'trom', n: 'Két bị cạy!', all: 'Sáng ra mở cửa, ổ khóa lỏng lẻo, két sắt trống trơn như vừa được lau.', some: 'Sáng ra ổ khóa bị cạy, két vơi mất %.' },
  { id: 'thue', n: 'Rắc rối sổ sách', all: 'Đoàn kiểm tra đối chiếu sổ: doanh thu lệch trắng đen. Quán bị truy thu toàn bộ.', some: 'Kê khai chậm một nhịp, quán bị phạt %.' },
  { id: 'qltt', n: 'Đoàn kiểm tra đột xuất', all: 'Tiền mặt chất két mà không chứng minh được gốc gác, toàn bộ bị tạm giữ.', some: 'Bị nhắc vụ thùng đá kê sát lối đi, phạt %.' },
  { id: 'lua', n: 'Cuộc gọi giả danh', all: 'Đầu dây bên kia xưng là ngân hàng, đọc vanh vách thông tin quán. Bạn làm theo và mất trắng két.', some: 'Đầu dây bên kia xưng là ngân hàng, bạn làm theo và mất %.' },
  { id: 'coin', n: 'Sàn linh thạch ảo sập', all: 'Bạn tất tay vào một "sàn linh thạch" được mời chào trong nhóm chat. Sáng ra trang web biến mất cùng cả két tiền.', some: 'Bạn thử vận may trên một "sàn linh thạch" lạ và lỗ %.' },
  { id: 'thu_trieu', n: 'Thú triều lạc qua hẻm!', all: 'Nửa đêm một đàn linh thú chạy lạc qua, giẫm sập nửa mái tôn, của cải tan hoang.', some: 'Đàn linh thú chạy lạc qua hẻm, quán thiệt hại %.' }
];

/* ===== ĐẠI NĂNG VI HÀNH ===== (nhân vật + thoại: sáng tác gốc của dự án) */
export const STAR_TXT = {
  hoa: {
    hi: [['Nghe dưới phàm trần có quán lẩu khiến tu sĩ phải dừng độn quang, chính là đây?', 'Nghe đồn quán này nổi tiếng lắm, ta thử xem sao.'],
         ['Trong động phủ mà ngửi được mùi này, tưởng ai luyện đan hóa ra là lẩu.', 'Đi ngang thấy khói thơm phức, ghé thử cho biết.']],
    rv: [['Nước lẩu có hậu vị như linh tuyền, lần sau ta dẫn sư huynh xuống.', 'Ngon thật đó, sẽ rủ người nhà tới nữa.'],
         ['Tay phàm mà vị giác hơn người, bổn tọa khâm phục.', 'Chủ quán dễ thương, phục vụ tốt.']]
  },
  ma: {
    hi: [['Hắc... mùi thơm nồng thế này, bản tôn vào xem kẻ nào to gan nấu.', 'Nghe nói quán này không sợ khách ma tu, tới thử gan chủ quán.'],
         ['Bản tôn không dùng đồ thanh đạm. Nồi đỏ nhất ở đâu?', 'Cho ta nồi cay nhất, khỏi hỏi lại.']],
    rv: [['Hợp khẩu vị. Bản tôn phá lệ khen một câu.', 'Ngon, sẽ quay lại.'],
         ['Phàm nhân dám bán cho ma tu, gan không nhỏ. Ta nhớ quán này.', 'Chủ quán tốt bụng, lần sau ta không phá quán nữa.']]
  },
  yeu: {
    hi: [['Mùi thơm bay tận lên chân núi, tiểu yêu lần theo xuống đây~', 'Em là hồ ly nhỏ, nghe nói lẩu ở đây ngon nhất phố~'],
         ['Cho ta một nồi thật nhiều rau nhé, ta tu hệ mộc~', 'Lần đầu ăn lẩu phàm trần, hồi hộp ghê.']],
    rv: [['Ngon~ ta rủ cả đàn xuống, chủ quán nhớ trữ hàng trước nha!', 'Ngon quá, sẽ dẫn bạn bè tới.'],
         ['Trong nồi lẩu có tâm ý, yêu tộc ta ghi nhớ.', 'Quán dễ thương, lẩu thơm, 5 sao~']]
  }
};
export const STARS = [
  { n: 'Huyền Chân Tử', t: 'Nguyên Anh hậu kỳ · Thanh Vân Tông', l: 'hoa', m: 1, f: 0 },
  { n: 'Bạch Y Tiên Tử', t: 'Nguyên Anh sơ kỳ · Quảng Hàn Cung', l: 'hoa', m: 0, f: 1 },
  { n: 'Huyết Ma Lão Tổ', t: 'Nguyên Anh đỉnh phong · Huyết Ma Tông', l: 'ma', m: 1, f: 2 },
  { n: 'U Minh Thánh Nữ', t: 'Kim Đan viên mãn · U Minh Điện', l: 'ma', m: 0, f: 3 },
  { n: 'Tiểu Bạch Hồ', t: 'Yêu tộc · Thanh Khâu ngàn năm', l: 'yeu', m: 0, f: 4 },
  { n: 'Thiết Bối Long', t: 'Tán tu · giang hồ đồn đã Kim Đan', l: 'hoa', m: 1, f: 5 },
  { n: 'Đan Vân Chân Nhân', t: 'Nguyên Anh trung kỳ · Đan Đỉnh Phái', l: 'hoa', m: 1, f: 6 },
  { n: 'Lâm tiểu thư', t: 'Trúc Cơ đại viên mãn · Lâm gia thế tộc', l: 'yeu', m: 0, f: 7 }
];

/* ===== GIỌNG GỌI MÓN ===== (sáng tác gốc) */
/* PERSONA theo who — khớp sprite/names (sửa 25/09 theo lệnh phu quân):
 * who 0 = chị trẻ (vn_06) · 1 = em nữ sinh (vn_02) · 2 = anh văn phòng (vn_03)
 * 3 = bà cụ (vn_04) · 4 = bé trai (vn_05) · 5 = ông/chú lớn tuổi (vn_01) · 6 = anh shipper (vn_07)
 * vn_00 là CHỦ QUÁN — không bao giờ spawn làm khách. */
export const PERSONA = [
  { o: ['Chị lấy', 'Cho chị', 'Em ơi chị lấy'], e: [' nha em!', ' giúp chị!', ' nghen em!'] },
  { o: ['Em lấy', 'Cho em', 'Anh chị ơi em lấy'], e: [' ạ!', ' nha!', ' với ạ!'] },
  { o: ['Cho anh', 'Anh lấy', 'Em ơi cho anh'], e: [' nha!', ' nhé!', ' nghen em!'] },
  { o: ['Cho bà', 'Bà lấy', 'Cháu ơi cho bà'], e: [' nghen cháu!', ' nha con!', ' nhé cháu!'] },
  { o: ['Con lấy', 'Cho con', 'Cô chú ơi con lấy'], e: [' ạ!', ' nha!', ' với ạ!'] },
  { o: ['Cho chú', 'Chú lấy', 'Cháu ơi cho chú'], e: [' nha con!', ' nghen cháu!', ' nhé!'] },
  { o: ['Anh ship lấy', 'Cho anh', 'Em ơi anh lấy'], e: [' nha, anh vội!', ' nhanh giùm anh!', ' nghen em!'] }
];
export const XPERSONA = [
  { o: ['Chưởng quầy, cho bản tọa', 'Đạo hữu, dọn cho ta', 'Bổn tọa muốn'], e: ['.', ' đi.', ' nhé.'] },
  { o: ['Tại hạ xin một', 'Phiền đạo hữu', 'Cho tại hạ'], e: ['.', ' giúp tại hạ.', ' nhé.'] },
  { o: ['Bổn tiên nghe mùi mà tới, cho ta', 'Cho ta một', 'Nghe đồn ngon, cho ta'], e: ['.', ' đi.', ' nào.'] }
];

/* ===== TÊN KHÁCH ===== (danh sách do Uyển Nhi tự soạn) */
export const NM_NU = ["An Nhiên","Băng Tâm","Bảo Hân","Bích Trâm","Cẩm Tú","Diệu Linh","Đài Trang","Gia Hân","Hà My","Hải Anh","Hạnh Dung","Hiền Thục","Hoa Mai","Hoài Thương","Hồng Đào","Hương Lan","Khánh Vy","Kiều Trinh","Kim Chi","Lam Giang","Lệ Thu","Liên Chi","Mỹ Hạnh","Ngọc Ánh","Nguyên Thảo","Nhã Phương","Như Quỳnh","Phương Uyên","Quế Chi","Quỳnh Anh","Sao Mai","Thanh Tâm","Thảo Vy","Thiên Hương","Thu Hằng","Thùy Dương","Trúc Lâm","Tuyết Mai","Uyên Vy","Vân Khánh","Xuân Mai","Yến Oanh","Ngọc Diệp","Cát Tiên","Diễm My","Băng Băng","Mộc Miên","Hạ Vy","Tuệ Lâm","Thục Đoan","Bảo Trâm","Kim Ngân","Mai Khôi","Nguyệt Quế","Trà Giang","Bích Ngọc","Hoàng Cúc","Tố Nga","Đan Thy","Khánh Ngọc"];
export const NM_NAM = ["Bảo Long","Chí Khang","Đăng Khoa","Đức Mạnh","Gia Hưng","Hải Nam","Hoàng Vũ","Hữu Thắng","Khai Minh","Kiến Văn","Minh Triết","Nam Phong","Quốc Huy","Tấn Tài","Thành Đạt","Thiên Bảo","Tuấn Minh","Việt Dũng","Xuân Trường","Đình Khôi","Mạnh Hùng","Nhật Hào","Phúc Thịnh","Quang Dũng","Trường An","Văn Khôi","Bảo Duy","Đông Quân","Hạo Nhiên","Khải Hoàn","Lâm Phong","Minh Khôi","Ngọc Bảo","Phi Long","Sơn Tùng","Thái Hòa","Trọng Nghĩa","Tử Khiêm","Vĩnh Khang","Hùng Cường"];
export const NM_BE = ["Bé Bắp","Bé Đậu","Bé Gạo","Su Su","Bơ Bơ","Mít Ướt","Cún Con","Mèo Bông","Kem Dâu","Tôm Tít","Na Na","Gấu Bự","Bống Bính","Bi Bi","Xoài Xanh","Ốc Mít","Nấm Nhí","Khoai Lang"];
export const NM_TIEN = ['Huyền','Bạch','Thanh','Tử','Vân','Mộc','Thủy','Hỏa','Lôi','Phong','Diệp','Tiêu','Sở','Mộ','Nam Cung','Đông Phương','Tây Môn','Bắc Đường','Âu Dương','Thượng Quan'];
export const NM_TIEN_DANH = ['Vô Kỵ','Trường Phong','Ngạo Thiên','Băng Nhi','Tử Yến','Thanh Phong','Minh Nguyệt','Tuyết Cơ','Kiếm Tâm','Đan Thanh','Ngọc Hành','Phiêu Dao','Tịch Mịch','Hàn Yên','Vấn Thiên','Nhược Thủy'];
export const NM_HO = ['Nguyễn','Trần','Lê','Phạm','Hoàng','Huỳnh','Phan','Vũ','Võ','Đặng','Bùi','Đỗ','Hồ','Ngô','Dương','Lý','Trương','Đinh','Lâm','Mai'];
/* who → chỉ số sprite vn_XX (khớp giới tính/tuổi với tên + giọng gọi):
 * 0 chị trẻ→vn_06 · 1 nữ sinh→vn_02 · 2 anh VP→vn_03 · 3 bà cụ→vn_04 · 4 bé trai→vn_05 · 5 ông chú→vn_01 · 6 shipper→vn_07
 * (vn_00 = chủ quán, không spawn làm khách) */
export const WHO_SPR = [6, 2, 3, 4, 5, 1, 7];

/* ===== MÁY SINH REVIEW ===== (toàn bộ câu chữ: sáng tác gốc, lẩu hẻm Sài Gòn)
 * {mon} = tên nồi lẩu, {top} = topping đầu, {shop} = tên quán */
export const TXT = {
  great: [
    "Nồi {mon} sôi sùng sục, húp chén nước đầu là ấm tới dạ dày", "Nước {mon} ngọt từ xương chứ không ngọt đường, biết liền à",
    "{top} nhúng vài giây vớt ra còn giòn ngọt, hết sảy", "Quán hẻm mà chất lượng nhà hàng, mình thề",
    "Ngồi vỉa hè gió lùa, lẩu sôi trước mặt, đời vậy là vui", "Chủ quán nhớ mặt khách, tới là hỏi 'như cũ hả'",
    "Nước lẩu đậm, chấm chén muối ớt xanh nữa là bá cháy", "Topping tươi, bò xắt tay dày cui, ăn đã miệng",
    "Nồi giữ lửa tốt, ăn tới miếng cuối vẫn còn sôi lăn tăn", "Rủ cả phòng trọ qua, đứa nào cũng xin lưu địa chỉ",
    "Giá này thì sinh viên ăn được mỗi tuần", "Nồi đầy ụ, hai đứa ăn không hết phải xin hộp mang về",
    "Mùi lẩu bay ra đầu hẻm, đi ngang là bụng réo", "Nước trong veo mà ngọt thanh, không hề bột ngọt",
    "Đồ nhúng ra tới đâu hết tới đó, nhìn là biết tươi", "Chủ quán dễ thương, khách chờ là bưng thêm dĩa rau",
    "Ăn lần đầu mà vị quen như cơm nhà", "{mon} mà gặp {top} thì đúng bài, khỏi chê",
    "Quán nhỏ xíu mà tối nào cũng kín bàn", "Cuối bữa bỏ bún vô nước lẩu, thiên đường là đây",
    "Lửa canh chuẩn, không khét đáy nồi", "Mình ăn cay dở mà nồi cay vừa của quán vẫn theo được",
    "Bưng ra nhanh hơn mình tưởng, còn sôi sùng sục", "Chén nước chấm pha vừa miệng, khỏi chỉnh",
    "Đêm khuya đói bụng gặp nồi này là hết ý", "Đi làm về mệt, ghé làm nồi là hồi máu",
    "Thấy bảng ghi không bột ngọt là mình vô liền", "Rau rửa sạch để ráo, nhìn là biết kỹ",
    "Khói lẩu bay mờ đèn hẻm, cảnh này đáng 5 sao", "Chốt sổ quán ruột, khỏi cần nghĩ quán nào nữa"
  ],
  xgreat: [
    "Nồi {mon} này linh khí ngưng mà không tán, chủ quán có bí quyết gì chăng?",
    "Bổn tọa nếm qua linh thực trăm họ, không ngờ phàm trần có nồi lẩu khiến ta động tâm",
    "Ăn một miếng, chân khí chạy nhanh hơn nửa phần, thú vị thật",
    "Hỏa hậu trong nồi ẩn chút đạo vận, đầu bếp phàm nhân này không đơn giản",
    "Sư muội ta kén ăn ba trăm năm, vậy mà khen nồi này tới hai lần",
    "Linh tài trong nồi tươi mới, không phải hàng tồn trong túi trữ vật",
    "Đáng giá. Bổn tọa sẽ ghi tên quán này vào ngọc giản riêng"
  ],
  xbad: [
    "Bổn tọa chờ tới mức chân hỏa trong người sắp bốc lên đỉnh đầu",
    "Phàm nhân nấu chậm cũng đành, đằng này còn nấu sai?",
    "Linh khí trong nồi tán hết rồi, nhạt như nước rửa chén",
    "Hừ. Quán này không xứng để bổn tọa ghé lần hai",
    "Ngàn năm đạo hạnh suýt mất vì một nồi lẩu mặn"
  ]
};

export const PARTS = {
  great: [['{mon} ngọt nước', 'Nước lẩu đậm đà', '{top} tươi rói', 'Nồi sôi sùng sục', '{mon} thơm nhức mũi', 'Đồ nhúng đầy đặn', 'Vị vừa miệng', 'Nước chấm pha chuẩn', 'Lẩu nóng hổi', '{mon} đúng điệu'],
          ['chủ quán có tâm', 'ăn là ghiền', 'lần sau dẫn bạn tới', 'đáng từng đồng', 'quán hẻm mà xịn', 'không chê vào đâu được', 'mai lại ghé', '10 điểm', 'hết nước chấm', 'ấm bụng ghê']],
  ok: [['Ổn áp', 'Ăn được', '{mon} khá ngon', 'Vị tròn tròn', '{top} tạm ổn', 'Ưng khoảng 8 điểm'],
       ['nhưng hơi mặn chút', 'nhưng {top} hơi ít', 'lần sau thử nồi khác', 'vẫn sẽ ghé lại', 'giá ổn', 'nước chấm hơi cay', 'chờ hơi lâu xíu', 'mong có món mới']],
  meh: [['Bình thường', 'Tạm', '{mon} hơi nhạt', 'Mặn hơn mình nghĩ', 'Cũng thường', '{top} hơi dai'],
        ['không có gì đặc biệt', 'chắc không quay lại', '{top} hơi ít', 'mong quán cải thiện', 'ăn một lần biết thôi', 'giá này hơi phí']],
  bad: [['Không hợp khẩu vị', '{top} bở rệu', '{mon} khác xa kỳ vọng', 'Vị lạ hoắc', 'Nước lẩu mặn chát'],
        ['ăn không hết', 'hơi thất vọng', 'không quay lại đâu', 'tiếc tiền ghê']],
  wait: [['Ngon nhưng chờ hơi lâu', 'Đợi mỏi gối', 'Giờ cao điểm hơi chậm', 'Đông nghẹt thở', 'Chờ muốn xỉu'],
         ['bù lại {mon} ngon', 'lần sau nhanh hơn nha', 'cũng đáng chờ', 'mong quán thêm người', 'lẩu vẫn ngon']],
  timeout: [['Đợi mãi không ai nấu', 'Chờ dài cả cổ', 'Đứng cả buổi không tới lượt', 'Không ai ngó ngàng', 'Xếp hàng muốn mọc rễ', 'Gọi món xong biệt tăm', 'Chờ gần chục phút', 'Quán đông mà nấu chậm', 'Nhìn quầy mà không ai nhắc đơn', 'Chờ hoài không thấy lẩu'],
            ['bỏ về luôn', 'đi quán khác', 'thôi khỏi ăn', 'hết kiên nhẫn', 'lần sau không ghé', 'buồn ghê', 'mất hứng', 'về tay không', 'tiếc thời gian', 'quá thất vọng']],
  wrong: [['Nấu sai món', 'Gọi một đằng bưng một nẻo', 'Kêu {mon} mà ra nồi khác', 'Nhầm đơn', 'Bưng sai nồi', 'Topping lộn xộn'],
          ['phải chờ nấu lại', 'lần sau cẩn thận nha', 'hơi bực', 'mất thời gian', 'không vui lắm', 'cần tập trung hơn']],
  cheap: [['Rẻ mà ngon', 'Giá sinh viên', 'Rẻ bất ngờ', '{mon} giá mềm', 'Nồi to mà rẻ', 'Giá dễ thương'],
          ['quá hời', 'ủng hộ dài dài', 'chất lượng xịn', 'mai rủ bạn tới', 'đáng đồng tiền', 'ghé hoài luôn']],
  soldout: [['Quán hết %', 'Tới nơi hết %', 'Hết % sớm vậy', 'Muốn ăn % mà hết', 'Đến muộn mất %'],
            ['tiếc ghê', 'chuẩn bị nhiều hơn nha', 'lần sau tới sớm', 'buồn xíu', 'đành ăn nồi khác', 'hụt hẫng']],
  soldoutPartial: [['Được mấy nồi đầu ngon lành', 'Ăn dở thì hết %', 'Nhóm mình chỉ đủ % cho nửa bàn', 'Nồi đầu ổn, lượt sau hết %', 'Quán nấu kha khá rồi mới hết %'],
                   ['tiếc là chưa đủ đơn', 'cũng đỡ phần nào', 'đành chia nhau', 'thông cảm được', 'mong quán trữ dư ra']],
  soldoutOnl: [['Đặt hạc mà quán hết %', 'Đơn tiên hạc bị hủy vì hết %', 'Đặt xong mới biết hết %', 'Quán báo hết % sau khi nhận đơn'],
               ['tiếc ghê', 'đành đặt quán khác', 'mong quán cập nhật menu', 'lần sau đặt sớm hơn', 'hơi buồn']],
  refused: [['Quán không bán cho mình', 'Bị từ chối', 'Tự nhiên không bán', 'Đứng chờ rồi bị mời về'],
            ['hơi buồn', 'lần sau không ghé', 'kỳ ghê', 'không hiểu sao luôn', 'mất công ghé']],
  late: [['Hạc chờ lâu quá', 'Giao trễ', 'Đặt hạc mà chờ dài cổ', 'Tiên hạc đậu mỏi chân', 'Đơn làm chậm'],
         ['lẩu nguội tanh', 'lần sau đặt quán khác', 'nước chấm đổ lênh láng', 'mất hứng', 'không đặt nữa']],
  pricey: [['Giá hơi chát', '{mon} ngon mà hơi đắt', 'Giá cao so với mặt bằng hẻm', 'Nồi nhỏ mà giá to'],
           ['chắc không quay lại', 'mong giảm giá chút', 'ăn một lần thôi', 'ví mỏng quá']]
};

/* Review dài 3 đoạn: mở - thân - kết (sáng tác gốc) */
export const LONG = {
  great: [['Lần đầu mò vô hẻm theo chỉ dẫn của bạn mà không hối hận.', 'Thấy bảng neon đỏ rực cuối hẻm nên tấp vô thử.', 'Được đồng nghiệp giới thiệu hoài, nay mới đi được.', 'Thành khách quen {shop} từ tháng trước rồi.', 'Trời trở lạnh, thèm gì đó nóng hổi nên làm nồi {mon}.', 'Đặt nồi {mon} lớn đem về cho cả nhà.', 'Tan làm đói bụng, chạy thẳng ra quán.', 'Mình thuộc dạng khó tính chuyện lẩu mà quán này qua ải được.'],
          ['Nước {mon} ngọt sâu, mặn ngọt đâu ra đó, {top} nhúng vừa chín tới còn giòn.', 'Nước lẩu thơm, béo mà không ngán, vét tới muỗng cuối.', '{top} tươi rói, nhìn màu là biết hàng mới trong ngày.', 'Chủ quán hỏi han độ cay từng bàn, chu đáo dễ sợ.', 'Khách đông mà nồi ra chưa tới năm phút.', 'Nồi đầy đặn, topping không hề keo kiệt.', 'Bàn ghế vỉa hè sạch sẽ, gió mát lồng lộng.', 'Nồi lớn hai đứa ăn no căng, giá lại mềm.'],
          ['Chắc chắn quay lại.', 'Rủ hội bạn tới thử mới được.', '5 sao, miễn bàn.', 'Ai chưa thử thì thử đi.', 'Mong quán giữ phong độ.', 'Tuần sau ghé thử nồi khác.']],
  ok: [['Ghé buổi chiều nên quán vắng, ngồi thoải mái.', 'Ăn thử {mon} vì thấy bảng đề cử.', 'Quán ngay gần nhà nên tiện ghé.', 'Đặt mang về cho cả nhà ăn tối.'],
       ['Lẩu ngon, chỉ hơi mặn với khẩu vị mình.', '{top} ổn nhưng hơi ít so với giá.', 'Vị đều tay, không có gì để chê nhiều.', 'Chủ quán vui nhưng hôm nay ra món hơi chậm.', 'Nước lẩu để lâu cạn bớt nên mặn dần về cuối.'],
       ['Nhìn chung ổn, sẽ quay lại.', '4 sao, lần sau thử nồi khác.', 'Tạm hài lòng.', 'Chỉnh chút xíu nữa là tròn 5 sao.']],
  meh: [['Lần đầu ghé ăn cho biết.', 'Thấy nhiều người khen nên tò mò thử.', 'Ghé mua mang về.'],
        ['{mon} nhạt, vị nước lẩu không rõ nét.', '{top} dai, không tươi như mình hình dung.', 'Mặn gắt hơn khẩu vị mình.', 'Nồi hơi nhỏ so với giá.', 'Chỗ ngồi chật, hơi nóng.'],
        ['Chắc không quay lại.', 'Cũng thường, không có gì nhớ.', 'Mong quán cải thiện.', 'Ăn một lần cho biết vậy.']],
  bad: [['Thật lòng hơi thất vọng lần này.', 'Mua về mà bỏ mứa nửa nồi.', 'Không được như lần trước mình ăn.'],
        ['{top} bở, nghi để qua ngày.', '{mon} vị lạ, khác hẳn mọi lần.', 'Nước lẩu mặn chát, topping thì lèo tèo.', 'Bưng ra bị sóng sánh đổ ra bàn.'],
        ['Không quay lại.', 'Tiếc tiền ghê.', 'Mong quán coi lại chất lượng.']],
  wait: [['Giờ cao điểm quán đông ngoài sức tưởng tượng.', 'Ghé buổi trưa, khách xếp dài ra tận đầu hẻm.', 'Order xong đứng đợi khá lâu.'],
         ['Chờ gần 15 phút mới thấy nồi, một mình chủ quán xoay như chong chóng.', 'Quán một người nấu nên đuối thấy rõ, được cái lẩu ra vẫn đúng vị.', 'Đợi lâu nước lẩu bay hơi bớt nên mặn hơn mọi khi.', 'Khách tiên hạc với khách tại bàn chen nhau, hơi loạn.', 'Lẩu ngon nhưng chờ lâu, đứng mỏi chân.', '{mon} vẫn ngon, chỉ tội phải đợi.'],
         ['Mong quán thêm tay vào giờ cao điểm.', 'Trừ sao vì chờ lâu.', 'Lần sau mình ghé giờ vắng.']],
  timeout: [['Đứng chờ mãi không tới lượt mình.', 'Gọi món xong như bị quên lãng.', 'Quán đông mà không ai điều phối.'],
            ['Gần 20 phút không thấy lẩu đâu, đành đi về.', 'Thấy đơn mình ghi trên bảng mà không ai đụng tới.', 'Đứng muốn rã chân, cuối cùng phải tìm quán khác.', 'Trễ giờ học nên mình không đợi nổi.', 'Nhắc hai ba lần mà chủ quán vẫn bận tay nồi khác.', 'Khách tới sau được làm trước, hơi bực thật.', 'Hỏi thì được bảo chờ xíu, rồi xíu hoài.'],
            ['Thất vọng, không quay lại.', 'Mất thời gian vô ích.', 'Lần sau chọn quán khác.']],
  wrong: [['Đặt {mon} mà bưng ra nồi khác.', 'Kêu không cay mà ăn vô cay xè lưỡi.', 'Nhầm với đơn bàn bên.', 'Căn dặn kỹ rồi mà vẫn sai.'],
          ['Đứng chờ nấu lại thêm một chập.', 'Topping lộn, độ cay cũng trật.', 'Chủ quán xin lỗi liền nhưng vẫn mất vui.'],
          ['Mong quán kỹ hơn khâu đọc đơn.', 'Trừ sao vì làm sai.', 'Lần sau mình phải dặn hai lần.']],
  pricey: [['Giá hơi cao so với mặt bằng trong hẻm.', 'Nồi {mon} giá khá chát.'],
           ['Vị ổn nhưng chưa tới mức đáng giá đó.', 'Nồi lớn mà nhỏ hơn tưởng tượng, topping ít.'],
           ['Thỉnh thoảng lắm mới ghé.', 'Mong quán cân lại giá.', 'Mềm hơn chút là mình quay lại liền.']],
  cheap: [['Giá quá hợp lý luôn.', 'Đang tìm quán rẻ mà ngon thì gặp {shop}.'],
          ['Nồi {mon} lớn mà giá mềm hơn nhiều chỗ, topping đầy đặn.', 'Sinh viên như mình ăn mỗi tuần vẫn kham được.'],
          ['Ủng hộ dài dài.', 'Rủ cả lớp tới liền.', 'Quá hời, 5 sao.']],
  late: [['Đặt qua tiên hạc mà chờ lâu quá trời.', 'Hạc báo phải đợi quán nấu xong.'],
         ['Tới nơi lẩu nguội ngắt, nước chấm sóng sánh đổ.', 'Gần một tiếng mới nhận được nồi.'],
         ['Lần sau mình đặt quán khác.', 'Thôi không đặt nữa.', 'Mong quán ưu tiên đơn hạc chút.']]
};

export const TAIL_MOOD = { pos: [' 😍', ' 🥰', ' 🔥', ' 💯', ' 🍲', ' ✨', ' 😋', ' 🤩', ' ❤️', ' 👏'], ok: [' 👍', ' 🙂', ' 😋', ' 👌', ''], mid: [' 😐', ' 🤔', ' 😅', ''], neg: [' 😞', ' 😤', ' 💔', ' 😢', ' 🙁'] };
export const MOOD = { great: 'pos', cheap: 'pos', ok: 'ok', meh: 'mid', wait: 'mid', pricey: 'mid', bad: 'neg', wrong: 'neg', timeout: 'neg', soldout: 'neg', soldoutPartial: 'mid', soldoutOnl: 'neg', refused: 'neg', late: 'neg' };

/* helper dùng trong GIFTS.need(S) */
export function upgCount(S) { return UPG.filter(u => u.tier === 'equip' && S.upg && S.upg[u.id]).length; }
export function rating40(S) { const r = (S.reviews || []).slice(0, 40); if (!r.length) return 4; return r.reduce((a, x) => a + x.s, 0) / r.length; }

/* ===== 12 THEME MÀU (tên + phối màu: thiết kế gốc của dự án) ===== */
export const THEMES = [
  { id: 'tuvan', n: 'Tử Vân Các', bg: '#2a1f3d', panel: '#f3e5c2', wood: '#b8894c', accent: '#9a5fd4', glow: '#74cfbf' },
  { id: 'honghoang', n: 'Hồng Hoang', bg: '#3d1f1f', panel: '#f7e8d0', wood: '#a0522d', accent: '#e0a03c', glow: '#ff8c42' },
  { id: 'thanhtruc', n: 'Thanh Trúc', bg: '#1f3d2a', panel: '#eef5e0', wood: '#8a9a5b', accent: '#7fbf5f', glow: '#c4e0a0' },
  { id: 'uminh', n: 'U Minh', bg: '#141020', panel: '#d8d0e8', wood: '#5a4a6a', accent: '#6a3fa0', glow: '#9a5fd4' },
  { id: 'kimho', n: 'Kim Hồ', bg: '#2a2418', panel: '#faf0d8', wood: '#c9a04a', accent: '#e0c060', glow: '#ffe8a0' },
  { id: 'bachtuyet', n: 'Bạch Tuyết', bg: '#28323d', panel: '#f4f8fb', wood: '#8a9aa8', accent: '#5f8fd4', glow: '#a8d8e8' },
  { id: 'dautrang', n: 'Đào Trăng', bg: '#3d2830', panel: '#fbe8ee', wood: '#b8788a', accent: '#e0568c', glow: '#f8a8c8' },
  { id: 'dailoi', n: 'Đại Lửa', bg: '#3d2018', panel: '#f8e0d0', wood: '#c06030', accent: '#e8542e', glow: '#ff9a5c' },
  { id: 'matrong', n: 'Mặc Rồng', bg: '#18282a', panel: '#e0ecea', wood: '#4a7a70', accent: '#2b7d63', glow: '#74cfbf' },
  { id: 'vanlam', n: 'Vân Lâm', bg: '#2a3320', panel: '#f0f0dc', wood: '#9a8a4a', accent: '#a8b04a', glow: '#d8e08a' },
  { id: 'camnang', n: 'Cẩm Nang', bg: '#33281f', panel: '#f3e5c2', wood: '#8a6a3a', accent: '#c98d28', glow: '#f2c14e' },
  { id: 'binhminh', n: 'Bình Minh', bg: '#3d3028', panel: '#fdf3e3', wood: '#c99a5b', accent: '#e8842e', glow: '#ffd8a0' }
];

/* ===== KHÁCH KHÓ CHỊU ===== (chữ: sáng tác gốc) */
export const BRATS = {
  hoi: { n: 'Khách vội', d: 'Đang chạy deadline, kiên nhẫn chỉ bằng 60% người thường' },
  doi: { n: 'Khách đổi ý', d: 'Đứng giữa chừng đổi sang món khác' },
  mac: { n: 'Khách kỳ kèo', d: 'Nhận nồi rồi mới nài giá, chỉ chịu trả 80%' },
  bung: { n: 'Khách bùng', d: 'Ôm nồi chạy mất hút, không trả một đồng' }
};
