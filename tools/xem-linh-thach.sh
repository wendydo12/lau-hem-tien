#!/usr/bin/env bash
cd ~/projects/laudem-tien
echo "=== LINH THẠCH: kiếm ở đâu, tiêu ở đâu ==="
grep -rn "linhThach\|linh_thach\|LS\b\|costLS" game/js/engine/*.js game/js/main.js | grep -v "^game/js/engine/data.js:.*tier: 'xian'" | head -25
echo
echo "=== hệ số hiệu ứng khách/kiên nhẫn đang dùng ==="
grep -rn "evMul\|heSo\|mul\b" game/js/engine/economy.js | head -20
echo
echo "=== công cụ mô phỏng: đọc phần áp hiệu ứng ==="
grep -n "EFF\|upg\|guestCap\|traffic" tools/mo-phong-kinh-te.mjs | head -25
