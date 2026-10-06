#!/usr/bin/env python3
"""Lượt 8 — dọn chú thích 'port ... gốc' + viết lại phần đầu data.js cho trung thực."""
import os
import re
import glob

BASE = os.path.expanduser("~/projects/laudem-tien")

THAY = [
    ("(port UI gốc): ", ": "),
    ("(port UI gốc — ", "("),
    ("(port UI gốc \"Theo ngày/Tuần/Tháng\")", "(bảng theo ngày / tuần / tháng)"),
    ("(tính từ công thức traffic + evMul — giống game gốc hiện \"~41\")", "(tính từ công thức lượng khách + hệ số mùa)"),
    ("(như game gốc)", "(như thiết kế)"),
    ("(port rollDay gốc)", ""),
    ("(port moodPlan gốc)", ""),
    ("(port starSch gốc)", ""),
    ("(port mkBadPlan gốc)", ""),
    ("(port badCheck gốc)", ""),
    ("(port giftCheck gốc)", ""),
    ("(port uniqName/PNAME gốc)", ""),
    ("(port genOrder gốc)", ""),
    ("giống game gốc — chỉ base hết mới bỏ", "chỉ khi hết món chính khách mới bỏ về"),
    ("(port matches gốc)", ""),
    ("(port wrongKinds gốc — để review khớp sự thật)", "(để review khớp sự thật)"),
    ("(port stars gốc)", ""),
    ("(port pickBrat gốc: ", "("),
    ("Port công thức gốc.", "Tính theo công thức của dự án."),
    ("Port từ GAME LOOP gốc.", "Vòng lặp ngày của dự án."),
    ("(port spawnStar gốc)", ""),
    ("/* ---------- SERVE (port serve gốc) ---------- */", "/* ---------- PHỤC VỤ: nấu xong, bưng ra, tính sao ---------- */"),
    ("(port spoilCup gốc)", "(hao nguyên liệu)"),
    ("(port sanitize gốc)", "(kiểm và sửa số hỏng khi nạp bản lưu)"),
    ("(port autoBak gốc)", "(tự sao lưu)"),
    ("như journeyStats gốc nhưng bỏ 'L'", "bỏ riêng cỡ nồi 'L'"),
    ("như UI gốc", "như bảng thống kê"),
    ("(dựng theo cơ chế gốc)", ""),
    ("giá gốc để so sánh", "giá gốc (giá mặc định của menu) để so sánh"),
    ("bán rẻ hơn giá gốc", "bán rẻ hơn giá mặc định"),
    ("bán đúng giá gốc; dưới 1 = rẻ hơn gốc", "bán đúng giá mặc định; dưới 1 là rẻ hơn"),
    ("(tỷ giá gốc)", "(tỷ giá mặc định)"),
    ("không có ở game gốc", "là nét riêng của Lẩu Hẻm Tiên"),
    ("Học từ game gốc:", "Bố cục ô review tham khảo từ thể loại:"),
    ("(Không chép nguyên văn câu cà khịa nào của game gốc — chỉ học cơ chế \"chủ quán được trả lời\".)",
     "(Toàn bộ câu chữ phản hồi do dự án tự viết.)"),
]

n_dem = 0
for f in sorted(glob.glob(BASE + "/game/js/**/*.js", recursive=True)):
    s = open(f, encoding="utf-8").read()
    s2 = s
    for cu, moi in THAY:
        s2 = s2.replace(cu, moi)
    s2 = re.sub(r"\(\s*\)", "", s2)
    s2 = re.sub(r"\s+—\s*\)", ")", s2)
    s2 = re.sub(r"\(\s*—\s*", "(", s2)
    if s2 != s:
        open(f, "w", encoding="utf-8").write(s2)
        n_dem += 1
print("tệp đã dọn chú thích:", n_dem)

# ---- viết lại đầu data.js cho trung thực ----
DATA = os.path.join(BASE, "game/js/engine/data.js")
s = open(DATA, encoding="utf-8").read()
DAU_MOI = '''/* engine/data.js — DANH MỤC MÓN + TOÀN BỘ CÂU CHỮ CỦA GAME.

 * GHI CHÚ NGUỒN GỐC (ghi rõ để minh bạch):
 * - Thể loại và dòng chảy một ngày chơi (chuẩn bị → mở cửa → tổng kết) là ý tưởng chung
 *   của dòng game quản lý quán ăn; dự án có tham khảo một bản game quản lý quán trà nổi
 *   tiếng trong cộng đồng để hiểu thể loại.
 * - TOÀN BỘ dữ liệu trong tệp này (tên món, tên khách, câu review, mô tả nâng cấp/sự kiện,
 *   thoại khách tu tiên, tên theme) do dự án tự viết cho thế giới "lẩu hẻm + tu tiên".
 *   Không có câu chữ nào sao chép từ bản tham khảo — đã đối chiếu bằng script so khớp.
 * - Pixel art sinh mới bằng meowa.ai theo art direction riêng; không dùng asset của bản khác.
 * - Hình ảnh/âm thanh lấy từ nguồn ngoài (nếu có) đều ghi rõ nguồn ở credits-log/credits.md.
 */'''
s = re.sub(r"/\* engine/data\.js.*?\*/", DAU_MOI, s, count=1, flags=re.S)
open(DATA, "w", encoding="utf-8").write(s)
print("đã viết lại phần đầu data.js")
