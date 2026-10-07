#!/usr/bin/env bash
cd ~/projects/laudem-tien
echo "=== mã game có nhắc tới phòng ở / nội thất không ==="
grep -rn "room\|phong\|noiThat\|nội thất\|Phòng" game/js/main.js | head -20
echo
echo "=== engine có file nào về phòng ==="
ls game/js/engine/
echo
echo "=== SURPRISE / events có nhắc decor ==="
grep -rn "decor\|trang tri\|trang trí" game/js | head -10
echo
echo "=== docs 06 (đầu file) ==="
head -40 docs/06-hac-thi-phong-o.md 2>/dev/null
echo
echo "=== tài liệu 08: bảng giá nội thất đã có chưa ==="
grep -n "giá\|giá bán\|đồng\|k giá\|cost" docs/08-noi-that-phong-tro.md | head -20
