#!/usr/bin/env python3
"""Tăng số phiên bản cache-bust ?v=43 -> ?v=44 trong cây game/ (rồi đồng bộ)."""
import pathlib, re, sys

ROOT = pathlib.Path.home() / "projects/laudem-tien"
old, new = sys.argv[1] if len(sys.argv) > 1 else "?v=43", sys.argv[2] if len(sys.argv) > 2 else "?v=44"
n = 0
for p in [ROOT / "game/index.html", *sorted((ROOT / "game/js").rglob("*.js"))]:
    s = p.read_text()
    if old in s:
        p.write_text(s.replace(old, new))
        n += s.count(old)
        print(" sửa", p.relative_to(ROOT), s.count(old), "chỗ")
print("tổng:", n, "chỗ ->", new)
