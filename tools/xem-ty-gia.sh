#!/usr/bin/env bash
cd ~/projects/laudem-tien
echo "=== khối cfg.ls ==="
grep -n -A 14 "ls: {" game/js/engine/config.js
echo
echo "=== tỷ giá mua/bán linh thạch ==="
sed -n '235,260p' game/js/engine/economy.js
echo
echo "=== tài nguyên khác: uy tín (rep) ==="
grep -rn "rep\b\|uy tín" game/js/engine/*.js | head -10
