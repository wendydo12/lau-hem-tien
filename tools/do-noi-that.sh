#!/usr/bin/env bash
# Đo ảnh hưởng nội thất trên NHIỀU ván (3 hạt giống) để không kết luận từ một ván may.
cd ~/projects/laudem-tien
PY=~/.venvs/crewai/bin/python3
run () { # $1 nhãn  $2 biến môi trường thêm
  tong=0
  for s in 11 22 33; do
    v=$(env EFF=0.9 SEED=$s $2 node tools/mo-phong-kinh-te.mjs 45 | grep "lãi trung bình/ngày" | sed 's/.*ngày //;s/[^0-9]//g')
    tong=$((tong+v))
    printf "  hạt giống %s: %s\n" "$s" "$v"
  done
  echo "$1 TRUNG BÌNH: $((tong/3))"
}
echo "=== lãi trung bình/ngày sau 45 ngày (người chơi EFF=0.9) ==="
run "KHÔNG NỘI THẤT" ""
run "HẺM VIỆT" "FURN=1 FURN_STYLE=hemViet"
run "ĐỘNG TIÊN" "FURN=1 FURN_STYLE=dongTien"
