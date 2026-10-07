#!/usr/bin/env bash
cd ~/projects/laudem-tien
node tools/tao-gallery.mjs
python3 - <<'EOF'
import re, pathlib
h = pathlib.Path("assets/gallery.html").read_text()
for ten in ("Nội thất ĐỘNG TIÊN", "Nội thất HẺM VIỆT"):
    i = h.find(ten); j = h.find("Nội thất", i + 10)
    doan = h[i:j if j > 0 else i + 9000]
    labels = re.findall(r'<div class="label">([^<]+)<small>([^<]*)</small>', doan)
    note = re.search(r'<div class="note">([^<]*)</div>', doan)
    print(f"\n{ten}: {len(labels)} món")
    if note: print("   ghi chú:", note.group(1)[:160])
    for n, g in labels:
        print("     ", n.strip(), "|", g.strip())
EOF
