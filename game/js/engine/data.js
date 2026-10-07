/* engine/data.js — DANH MỤC MÓN + TOÀN BỘ CÂU CHỮ CỦA GAME.

 * GHI CHÚ NGUỒN GỐC (ghi rõ để minh bạch):
 * - Thể loại và dòng chảy một ngày chơi (chuẩn bị → mở cửa → tổng kết) là ý tưởng chung
 *   của dòng game quản lý quán ăn; dự án có tham khảo một bản game quản lý quán trà nổi
 *   tiếng trong cộng đồng để hiểu thể loại.
 * - TOÀN BỘ dữ liệu trong tệp này (tên món, tên khách, câu review, mô tả nâng cấp/sự kiện,
 *   thoại khách tu tiên, tên theme) do dự án tự viết cho thế giới "lẩu hẻm + tu tiên".
 *   Không có câu chữ nào sao chép từ bản tham khảo — đã đối chiếu bằng script so khớp.
 * - Pixel art sinh mới bằng meowa.ai theo art direction riêng; không dùng asset của bản khác.
 * - Hình ảnh/âm thanh lấy từ nguồn ngoài (nếu có) đều ghi rõ nguồn ở credits-log/credits.md.
 */

/* ===== ITEMS =====
 * Cấu trúc mỗi nguyên liệu: [khóa, tên, tên ngắn, màu, hạn dùng(ngày), giá nhập, giá bán, giá mở khóa] */
export const ITEMS = {};
const mk = (type, g) => (k, n, sn, c, life, cost, sell, unlock) => {
  ITEMS[k] = { n, s: sn || n, type, g, c, life, cost, sell, unlock };
};

/* --- NỒI LẨU (base) — 9 nồi theo brief của chủ dự án (25/09 thêm 2 món miền Tây) --- */
const P = mk('base', 'pot');
P('ca_chua', 'Lẩu cà chua', 'Cà chua', '#e8542e', 3, 8000, 35000, 0);
P('nam', 'Lẩu nấm', 'Nấm', '#c9a86a', 3, 9000, 40000, 0);
P('suon', 'Lẩu sườn', 'Sườn', '#b5651d', 3, 12000, 50000, 0);
P('canh_chua', 'Lẩu canh chua cá', 'Canh chua', '#e8a03c', 2, 11000, 45000, 100000);
P('thai', 'Lẩu Thái', 'Thái', '#e8842e', 3, 10000, 45000, 150000);
P('mam', 'Lẩu mắm', 'Mắm', '#6b4a2a', 2, 13000, 55000, 300000);
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
 * Khách thường không bao giờ thấy/gọi được. Quy tắc của dự án 25/09.) --- */
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

export const POT_KEYS = Object.keys(ITEMS).filter(k => ITEMS[k].type === 'base');
export const DIP_KEYS = Object.keys(ITEMS).filter(k => ITEMS[k].type === 'dip');
export const TOP_KEYS = Object.keys(ITEMS).filter(k => ITEMS[k].type === 'top');
export const DUOC_KEYS = Object.keys(ITEMS).filter(k => ITEMS[k].type === 'duoc');
export const SECRET_KEYS = Object.keys(ITEMS).filter(k => ITEMS[k].type === 'secret');
export const XTOP_KEYS = SECRET_KEYS.filter(k => ITEMS[k].sell <= 10);  // bán bằng linh thạch

/* món nấu lâu (sơ chế kỹ) → đơn chứa chúng được khách chờ lâu hơn một chút */
export const SLOW_KEYS = ['t_tom', 't_muc', 't_ngheu', 't_ca_dieu', 't_de'];
export const slowN = o => o.tops.filter(t => ITEMS[t]?.type === 'secret' || ITEMS[t]?.g === 'duoc' || SLOW_KEYS.includes(t)).length;

export const SPICY = ['Không cay', 'Cay vừa', 'Cay nhiều', 'Cay Tứ Xuyên'];
export const SIZES = ['N', 'L'];
export const BASE_PRICE = { L: 15000 };
[...POT_KEYS, ...DIP_KEYS, ...TOP_KEYS].forEach(k => BASE_PRICE[k] = ITEMS[k].sell);

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
    rv: [['Nước lẩu có hậu vị như linh tuyền, lần sau ta dẫn đồng môn xuống.', 'Ngon thật đó, sẽ rủ người nhà tới nữa.'],
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
/* PERSONA theo who — khớp sprite/names (sửa 25/09 theo yêu cầu thiết kế):
 * who 0 = chị trẻ (vn_06) · 1 = em nữ sinh (vn_02) · 2 = anh văn phòng (vn_03)
 * 3 = bà cụ (vn_04) · 4 = bé trai (vn_05) · 5 = ông/chú lớn tuổi (vn_01) · 6 = anh shipper (vn_07)
 * vn_00 là CHỦ QUÁN — không bao giờ spawn làm khách. */
export const PERSONA = [
  {o: ["Chị lấy", "Bà chủ ơi cho chị", "Chị đặt"], e: [" nha cưng!", " giùm chị!", " nhé, chị cảm ơn trước!"]},
  {o: ["Em lấy", "Cho em một", "Chị ơi em gọi"], e: [" ạ, em gọi liền!", " nha chị!", " với ạ!"]},
  {o: ["Anh gọi", "Anh kêu", "Cô chủ cho anh"], e: [" nhé, anh ngồi bàn ngoài!", " nha em, ghi đơn ngay!", " giùm cái!"]},
  {o: ["Bà kêu", "Cháu cho bà", "Bà muốn"], e: [" nghen con!", " nhé cháu!", " nha, bà ngồi chờ đây!"]},
  {o: ["Con gọi", "Cho con", "Cô ơi con lấy"], e: [" ạ, con cảm ơn trước!", " nha cô!", " với ạ!"]},
  {o: ["Chú gọi", "Chú kêu", "Cháu cho chú"], e: [" nhé, chú ngồi ngoài hẻm!", " nghen cháu, bà chờ được!", " nha, thêm chén nữa!"]},
  {o: ["Shipper lấy đơn", "Cho anh đơn", "Anh lấy gấp"], e: [" nha em, gấp lắm!", " liền giùm anh!", " nhé, khách đang chờ!"]}
];
export const XPERSONA = [
  {o: ["Chưởng quầy, bản tọa muốn", "Đạo hữu, mang cho ta", "Bổn tọa gọi"], e: [" ngay.", " một phần.", " nhé, ta chờ ở trà đình."]},
  {o: ["Tại hạ xin", "Phiền đạo hữu bưng", "Cho tại hạ"], e: [" ngay.", " một phần.", " nhé, đa tạ."]},
  {o: ["Ngửi mùi mà tới, bổn tiên muốn", "Cho ta nồi", "Nghe đồn ngon, cho ta"], e: [" ngay.", " nào.", " đi, ta ngồi đây."]}
];

/* ===== TÊN KHÁCH ===== (danh sách do dự án tự soạn) */
export const NM_NU = [
    "Ánh Tuyết",
    "Bích Liên",
    "Cẩm Nhung",
    "Chi Mai",
    "Diệu Nga",
    "Đan Khanh",
    "Gia Kỳ",
    "Hạ Lam",
    "Hiền Mai",
    "Hoa Quỳnh",
    "Hoài An",
    "Hồng Ngọc",
    "Hương Thảo",
    "Khả Vy",
    "Kiều Diễm",
    "Kim Liên",
    "Lam Chi",
    "Lệ Chi",
    "Liên Hoa",
    "Mai Linh",
    "Minh Ngọc",
    "Mộng Lan",
    "Mỹ Lệ",
    "Ngân Khanh",
    "Nguyệt Minh",
    "Nhã Thanh",
    "Nhuệ Anh",
    "Phương Thảo",
    "Quỳnh Hương",
    "Sương Mai",
    "Tâm Như",
    "Thanh Vân",
    "Thiên Thanh",
    "Thùy Tiên",
    "Thương Ly",
    "Tiểu Vy",
    "Trang Nhung",
    "Tường An",
    "Uyên Nghi",
    "Vân Nhi",
    "Vy Ly",
    "Xuân Hương",
    "Yến Phương",
    "Ý Nhi",
    "Diệp Lâm",
    "Hạ Giang",
    "Mộc Lan",
    "Phượng Ly",
    "Song Ly",
    "Tiên Hương",
    "Trúc Mai",
    "Tuyết Vân",
    "Vệ Hà",
    "Xuân Cúc",
    "Yên Chi",
    "Băng Thanh",
    "Dạ Lan",
    "Kiều Loan",
    "Linh Chi",
    "Mai Hương"
];export const NM_NAM = [
    "Anh Khôi",
    "Bảo Trung",
    "Chí Thành",
    "Công Danh",
    "Đắc Thắng",
    "Đông Phong",
    "Duy Thịnh",
    "Gia Khiêm",
    "Hải Quân",
    "Hiếu Trung",
    "Hoàng Phúc",
    "Hữu Đạt",
    "Khang Kiện",
    "Khôi Vĩ",
    "Long Nhật",
    "Minh Đức",
    "Nam Trường",
    "Ngọc Lâm",
    "Nhật Quang",
    "Phong Hào",
    "Phúc Khang",
    "Sơn Lâm",
    "Tấn Lộc",
    "Thái Sơn",
    "Thanh Bình",
    "Thiện Lương",
    "Trí Tín",
    "Tuấn Vũ",
    "Vĩnh An",
    "Việt Thắng",
    "Xuân Hiếu",
    "Đình Quang",
    "Mạnh Tường",
    "Bá Hùng",
    "Cao Kiên",
    "Danh Khang",
    "Hữu Lợi",
    "Kiến Quốc",
    "Lạc Hồng"
];export const NM_BE = [
    "Bé Cà",
    "Bé Cốm",
    "Bé Quýt",
    "Bé Măng",
    "Bé Hến",
    "Bé Nếp",
    "Bé Sắn",
    "Bé Rơm",
    "Bé Trứng",
    "Bé Cua",
    "Bé Ốc",
    "Bé Bưởi",
    "Bé Chanh Dây",
    "Bé Kẹo",
    "Bé Bánh",
    "Bé Sữa",
    "Bé Tép",
    "Bé Ngô"
];export const NM_TIEN = [
    "Tống",
    "Ôn",
    "Vu",
    "Ngụy",
    "Thẩm",
    "Liêu",
    "Kỷ",
    "Tây Môn",
    "Bạch"
];export const NM_TIEN_DANH = [
    "Vô Trần",
    "Thanh Hạc",
    "Ngạo Tuyết",
    "Hàn Sương",
    "Tử Đằng",
    "Bạch Vân",
    "Tuyết Liên",
    "Kiếm Ca",
    "Đan Hà",
    "Ngọc Linh",
    "Phiêu Vân",
    "Tịch Mịch Sơn",
    "Yên Hà",
    "Vấn Kiếm",
    "Nhược Vân",
    "Trường Ca",
    "Hạo Nguyệt"
];export const NM_HO = [
    "Nguyễn",
    "Trần",
    "Lê",
    "Phạm",
    "Hoàng",
    "Huỳnh",
    "Phan",
    "Vũ",
    "Võ",
    "Đặng",
    "Bùi",
    "Đỗ",
    "Hồ",
    "Ngô",
    "Dương",
    "Lý",
    "Trương",
    "Đinh",
    "Lâm",
    "Mai"
];/* who → chỉ số sprite vn_XX (khớp giới tính/tuổi với tên + giọng gọi):
 * 0 chị trẻ→vn_06 · 1 nữ sinh→vn_02 · 2 anh VP→vn_03 · 3 bà cụ→vn_04 · 4 bé trai→vn_05 · 5 ông chú→vn_01 · 6 shipper→vn_07
 * (vn_00 = chủ quán, không spawn làm khách) */
export const WHO_SPR = [6, 2, 3, 4, 5, 1, 7];

/* ===== MÁY SINH REVIEW ===== (toàn bộ câu chữ: sáng tác gốc, lẩu hẻm Sài Gòn)
 * {mon} = tên nồi lẩu, {top} = topping đầu, {shop} = tên quán */
export const TXT = {
  great: ["Nước {mon} đậm tới giọt cuối, húp xong là thấy ấm cả người", "Nồi {mon} bưng ra còn sôi lăn tăn, thơm tới mức đứa bàn bên phải hỏi tên món", "{top} nhúng ba giây vớt lên còn giòn ngọt, đúng chuẩn dân ăn lẩu", "Chủ quán nhìn mặt là nhớ đơn, tới lần hai khỏi cần gọi lại", "Nêm nếm vừa tay ghê, cạn nồi mà không thấy khát nước", "Bàn vỉa hè mà nồi lẩu nghiêm túc hơn mấy chỗ máy lạnh", "Đồ nhúng tươi roi rói, bò xắt dày, gắp lên thấy đã con mắt", "Chén nước chấm pha khéo, chấm gì cũng hợp", "Ngồi hẻm gió thổi mà lẩu nóng hổi, đã gì đâu", "Nồi to đùng, hai người ăn muốn xỉu vẫn còn dư", "Đi làm về mệt, ghé đây làm nồi là tỉnh liền", "Nước lẩu trong veo mà ngọt hậu, không kiểu ngọt đường", "Khói lẩu quyện mùi sả, đứng đầu hẻm đã nghe", "Tươi tới mức nhìn đĩa rau là biết mới đi chợ sáng nay", "Gọi nồi {mon} kèm {top}, ăn xong chốt luôn quán ruột", "Rau để ráo nước, nhìn khâu sơ chế là thấy kỹ", "Lửa canh đều, ăn tới cuối nồi vẫn không khét đáy", "Bưng nồi ra nhanh hơn mình nghĩ, còn kịp chụp tấm hình", "Khách chờ được bưng thêm dĩa rau, chủ quán có tâm", "Vị cay nồi {mon} đã ghê, mà còn thơm nữa", "Ngồi tới khuya vẫn được tiếp, không bị nhắc giờ", "Múc chén nước đầu là biết nồi này nấu thật lòng", "Quán nhỏ chật mà xoay ca khéo, chờ xíu là có", "Từ chỗ ghét ăn lẩu mà nếm xong tự đổi ý", "Đêm mưa ghé làm nồi, nghe mưa rơi mà bụng ấm", "Bò cuộn sụn, {top} đủ vị, đúng bài", "Giá này mà chất lượng này thì đi hoài cũng được", "Cả xóm rủ nhau đi, ngồi chật mà vui", "Nước lẩu để lửa riu riu cả buổi vẫn đậm", "Có món {mon} này thôi là đủ giữ khách ở lại"],
  xgreat: [
      "Linh khí trong nồi {mon} ngưng mà không tán, bổn tọa phải hỏi thăm bí quyết",
      "Tu luyện ngàn năm, lần đầu nếm được thứ này ở cõi phàm",
      "Một ngụm vào, linh khí chạy khoan khoái khắp kinh mạch",
      "Hỏa hậu trong nồi có đạo vận, kẻ phàm nhân này không tầm thường",
      "Linh khí trong nguyên liệu còn tươi, chẳng phải hàng tồn trong túi trữ vật",
      "Sư muội bổn tọa vốn kén ăn, vậy mà gật đầu hai lượt",
      "Bổn tọa ghi tên quán này vào ngọc giản riêng",
      "Mùi hương lọt cả kết giới, bổn tọa phải tới xem cho rõ",
      "Chỉ một nồi mà linh đài sáng ra vài phần, đáng để tu luyện tiếp"
    ],
    xbad: [
      "Bổn tọa chờ tới mức chân hỏa muốn trào ra ngoài",
      "Phàm nhân nấu chậm còn thông cảm được, nấu sai thì quá đáng",
      "Linh khí tán sạch, chỉ còn nước lã",
      "Tu luyện ba trăm năm, suýt đạo tâm bất ổn vì một nồi quá mặn",
      "Bổn tọa đợi tới khi linh thạch trong túi nguội ngắt",
      "Hừ, bổn tọa nhớ mặt quán này"
    ],
};

export const PARTS = {
  great: [
    ["{mon} đậm nước", "Nồi sôi sùng sục", "{top} tươi thật", "Đồ nhúng đầy đặn", "Nêm vừa tay", "Chấm pha khéo", "Thơm nhức mũi", "Nồi nóng hổi", "{mon} đúng điệu", "Rau tươi rói"],
    ["chủ quán có tâm", "ăn là nghiền", "tuần sau kéo bạn tới", "đáng từng đồng", "hẻm nhỏ mà xịn", "không chê được câu nào", "tuần sau ghé nữa", "mười điểm không hơn", "hết sạch nước chấm", "ấm bụng tới sáng"],
  ],
  ok: [
    ["Khá được", "Ăn ổn", "{mon} tạm ngon", "Vị tròn tròn", "{top} cũng ổn", "Đâu đó tám điểm"],
    ["nhưng nêm hơi mặn", "mỗi tội {top} hơi mỏng", "lần sau đổi nồi khác", "vẫn ghé lại nữa", "giá vừa túi", "chấm hơi cay", "đợi hơi lâu chút", "mong thêm món mới"],
  ],
  meh: [
    ["Tàm tạm", "Cũng được", "{mon} nhạt nhạt", "Mặn hơn mình tưởng", "Không ấn tượng", "{top} dai dai"],
    ["chẳng có gì nhớ", "chắc thôi không ghé", "{top} ít thật", "mong quán chỉnh lại", "ăn một lần cho biết", "số tiền này thấy hơi uổng"],
  ],
  bad: [
    ["Không hợp miệng", "{top} bở rệu", "{mon} khác xa quảng cáo", "Vị lạ hoắc", "Nước mặn chát"],
    ["ăn không trôi", "hơi hụt hẫng", "thôi không quay lại", "tiếc số tiền"],
  ],
  wait: [
    ["Ngon nhưng đợi lâu", "Chờ mỏi chân", "Giờ đông nên chậm", "Đông nghẹt", "Chờ muốn bỏ"],
    ["đổi lại {mon} ngon", "kỳ sau nhanh hơn nha", "chờ vậy mà đáng", "mong quán thêm tay", "lẩu vẫn ngon"],
  ],
  timeout: [
    ["Ngồi chờ mãi không ai nấu", "Chờ mỏi cả cổ", "Đợi hoài không thấy nồi", "Không ai để ý tới bàn", "Xếp hàng muốn mọc rễ", "Gọi xong là im bặt", "Chờ gần chục phút", "Đông mà làm không kịp", "Nhìn quầy mà không ai nhắc đơn", "Chờ dài hơn cả nấu"],
    ["xách túi về", "đi chỗ khác", "thôi khỏi ăn", "hết nhẫn nại", "kỳ sau không ghé", "buồn thật", "cụt hứng", "đi về mà bụng rỗng", "mất toi buổi tối", "cụt cả hứng"],
  ],
  wrong: [
    ["Nấu sai món", "Gọi một kiểu bưng một nẻo", "Kêu {mon} mà ra nồi khác", "Nhầm đơn", "Bưng nhầm nồi", "Topping lộn tùng phèo"],
    ["phải đợi nấu lại", "kỳ sau dặn kỹ hơn", "hơi bực mình", "tốn thời gian", "không vui chút nào", "cần để ý hơn"],
  ],
  cheap: [
    ["Rẻ mà ngon", "Giá dễ kham", "Rẻ hơn mình tưởng", "{mon} tiền nhẹ", "Nồi to mà giá nhẹ", "Giá thương lượng được"],
    ["hời thật", "ủng hộ tới cùng", "chất lượng xứng giá", "mai kéo bạn tới", "đáng đồng tiền bát gạo", "ghé đều đều"],
  ],
  soldout: [
    ["Tới nơi thì quán báo hết %", "Tới nơi thì hết %", "Hết % sớm vậy", "Thèm % mà không còn", "Đến trễ mất %"],
    ["tiếc thật", "chuẩn bị thêm nha", "kỳ sau tới sớm", "thấy tiếc", "đành gọi nồi khác", "chưng hửng"],
  ],
  soldoutPartial: [
    ["Mấy nồi đầu ngon lành", "Ăn nửa chừng thì hết %", "Nhóm mình chỉ đủ % cho nửa bàn", "Nồi đầu ổn, lượt sau hết %", "Chạy được nửa buổi thì hết %"],
    ["tiếc là chưa trọn vẹn", "cũng đỡ phần nào", "chia nhau ăn đỡ", "cũng hiểu cho quán", "mong trữ dư thêm"],
  ],
  soldoutOnl: [
    ["Đặt hạc mà quán hết %", "Đơn tiên hạc bị hủy vì hết %", "Đặt xong mới hay hết %", "Nhận đơn rồi mới báo hết %"],
    ["tiếc thật", "quay sang đặt chỗ khác", "mong quán cập nhật thực đơn", "kỳ sau đặt sớm hơn", "chạnh lòng"],
  ],
  refused: [
    ["Quán từ chối bán", "Bị mời ra", "Tự dưng không bán", "Chờ một hồi rồi bị mời về"],
    ["chạnh lòng", "kỳ sau không ghé", "kỳ lạ thật", "không hiểu nổi", "mất công đi"],
  ],
  late: [
    ["Hạc chờ lâu quá", "Giao trễ hẹn", "Đặt hạc mà chờ dài cổ", "Hạc đậu mỏi cánh", "Đơn làm chậm rì"],
    ["lẩu nguội mất ngon", "kỳ sau đặt chỗ khác", "nước chấm đổ hết", "cụt hứng", "thôi không đặt nữa"],
  ],
  pricey: [
    ["Tiền hơi cao", "{mon} ngon mà đắt", "Giá cao hơn mặt bằng hẻm", "Nồi nhỏ mà tiền to"],
    ["chắc thôi không ghé", "mong bớt chút giá", "ăn một lần thôi", "túi tiền không kham nổi"],
  ],
};

/* Review dài 3 đoạn: mở - thân - kết (sáng tác gốc) */
export const LONG = {
  great: [
    ["Lần đầu mò vào hẻm theo lời rủ của đứa bạn, không ngờ đáng công.", "Thấy bảng neon cuối hẻm nên tấp vào thử.", "Nghe khen nhiều quá, hôm nay mới sắp xếp đi được.", "Thành khách quen từ dạo trước, giờ tuần nào cũng ghé.", "Trời trở lạnh, thèm gì đó nóng nên gọi nồi {mon}.", "Đặt nồi {mon} cỡ lớn mang về cho cả nhà.", "Tan ca đói bụng, chạy thẳng ra quán.", "Mình vốn khó tính chuyện nước lẩu mà quán này qua được cửa ải."],
    ["Nước {mon} ngọt hậu, mặn ngọt rõ ràng, {top} nhúng vừa tới vẫn giòn.", "Nước lẩu thơm, béo mà không ngấy, húp tới muỗng cuối.", "{top} tươi, nhìn sắc là biết hàng nhập trong ngày.", "Chủ quán hỏi từng bàn ăn cay được tới đâu, chu đáo.", "Khách đông mà nồi bưng ra chưa tới năm phút.", "Nồi đầy đặn, topping không hề bị bớt xén.", "Bàn vỉa hè lau sạch, ngồi gió thổi mát rượi.", "Nồi lớn ăn no căng bụng, giá lại nhẹ nhàng."],
    ["Chắc chắn ghé lại.", "Rủ hội bạn tới cho biết.", "Mười điểm, khỏi bàn.", "Ai chưa thử thì nên thử.", "Mong quán giữ phong độ.", "Cuối tuần ghé nếm nồi khác."],
  ],
  ok: [
    ["Ghé buổi chiều nên quán vắng, ngồi thoải mái.", "Thấy bảng đề cử {mon} nên gọi thử.", "Quán ngay gần nhà nên ghé cho tiện.", "Đặt mang về cho cả nhà ăn tối."],
    ["Lẩu ngon, chỉ hơi mặn với khẩu vị mình.", "{top} ổn nhưng hơi ít so với tiền.", "Nêm đều tay, không có gì để chê nhiều.", "Chủ quán vui vẻ mà hôm nay ra món hơi chậm.", "Nước để lâu cạn bớt nên càng về sau càng mặn."],
    ["Nhìn chung được, sẽ ghé lại.", "Bốn sao, kỳ sau thử nồi khác.", "Tàm tạm hài lòng.", "Chỉnh thêm chút là tròn năm sao."],
  ],
  meh: [
    ["Lần đầu ghé cho biết.", "Nghe khen nhiều nên tò mò.", "Ghé mua mang về ăn thử."],
    ["{mon} nhạt, nước lẩu không rõ vị.", "{top} dai, không tươi như mình nghĩ.", "Mặn gắt hơn khẩu vị.", "Nồi hơi nhỏ so với giá.", "Chật chội, ngồi hơi nóng."],
    ["Chắc thôi không ghé nữa.", "Cũng thường, chẳng nhớ gì.", "Mong quán chỉnh lại.", "Ăn một lần cho biết."],
  ],
  bad: [
    ["Thật lòng hơi hụt hẫng lần này.", "Mua về mà bỏ dở nửa nồi.", "Không còn được như lần trước."],
    ["{top} bở, nghi để qua ngày.", "{mon} vị lạ, khác hẳn mọi khi.", "Nước mặn chát, topping đếm trên đầu ngón tay.", "Bưng ra bị sóng sánh đổ cả ra bàn."],
    ["Thôi không quay lại.", "Tiếc số tiền.", "Mong quán soi lại chất lượng."],
  ],
  wait: [
    ["Giờ cao điểm đông ngoài sức tưởng tượng.", "Ghé buổi trưa, khách xếp hàng dài ra tận cửa hẻm.", "Gọi xong đứng đợi khá lâu."],
    ["Chờ gần mười lăm phút mới thấy nồi, một mình chủ quán xoay như chong chóng.", "Quán chỉ một người nấu nên đuối thấy rõ, bù lại nước lẩu vẫn đúng vị.", "Đợi lâu nước bay hơi nên mặn hơn mọi khi.", "Khách tiên hạc với khách tại bàn chen nhau, hơi rối.", "Lẩu ngon mà phải đợi, đứng mỏi cả chân.", "{mon} vẫn ngon, chỉ tội phải chờ."],
    ["Mong quán thêm người giờ cao điểm.", "Bớt sao vì phải chờ.", "Lần sau ghé giờ vắng vậy."],
  ],
  timeout: [
    ["Đứng đợi mãi mà không tới lượt.", "Gọi món xong như bị quên.", "Quán đông mà không ai chia việc."],
    ["Gần hai mươi phút không thấy nồi đâu, đành đi về.", "Thấy đơn mình ghi trên bảng mà không ai đụng tới.", "Đứng muốn rã chân, cuối cùng phải tìm chỗ khác.", "Trễ giờ học nên không đợi nổi.", "Nhắc hai ba lượt mà chủ quán còn bận nồi khác.", "Người tới sau được làm trước, hơi bực thật.", "Hỏi thì được bảo chờ chút, rồi chút mãi."],
    ["Hụt hẫng, không ghé nữa.", "Mất toi thời gian.", "Lần sau chọn chỗ khác."],
  ],
  wrong: [
    ["Đặt {mon} mà bưng ra nồi khác.", "Dặn không cay mà ăn vào cay xé lưỡi.", "Lộn sang đơn bàn bên.", "Căn dặn kỹ mà vẫn sai."],
    ["Đợi nấu lại thêm một chập.", "Topping lộn, độ cay cũng trật.", "Chủ quán xin lỗi liền mà vẫn mất vui."],
    ["Mong quán đọc đơn kỹ hơn.", "Bớt sao vì làm sai.", "Kỳ sau phải dặn hai lượt."],
  ],
  pricey: [
    ["Giá hơi cao so với mặt bằng trong hẻm.", "Nồi {mon} tính tiền khá chát."],
    ["Vị ổn nhưng chưa tới mức giá đó.", "Nồi lớn mà nhỏ hơn mình tưởng, topping lại ít."],
    ["Lâu lâu mới dám ghé.", "Mong quán cân lại giá.", "Nhẹ hơn chút là ghé liền."],
  ],
  cheap: [
    ["Tính ra quá hời cho một nồi đầy đặn.", "Vốn định tìm chỗ rẻ mà ngon, ai ngờ lại đụng trúng {shop}."],
    ["Nồi {mon} lớn mà tiền nhẹ hơn nhiều chỗ, topping đầy.", "Sinh viên như mình tuần nào ăn cũng kham nổi."],
    ["Ủng hộ quán dài lâu.", "Kéo cả lớp tới ăn liền.", "Hời quá, năm sao tròn."],
  ],
  late: [
    ["Đặt qua tiên hạc mà chờ dài cả buổi.", "Hạc báo phải đợi quán nấu xong mới đi."],
    ["Tới nơi lẩu nguội ngắt, nước chấm đổ lênh láng.", "Gần một tiếng mới nhận được nồi."],
    ["Lần sau đặt chỗ khác.", "Thôi không đặt nữa.", "Mong quán ưu tiên đơn hạc."],
  ],
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
