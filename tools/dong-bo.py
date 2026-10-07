#!/usr/bin/env python3
"""tools/dong-bo.py — đồng bộ cây mã nguồn game sang mọi bản (webapp + app di động).

Vì sao cần: game có 4 chỗ chứa cùng một bộ mã — `game/` (bản gốc để phát triển và kiểm thử),
`webapp/` (bản app macOS đang phục vụ ở 127.0.0.1:8793), `android/.../assets/public`,
`ios/App/App/public` (bản nhúng trong app di động). Sửa một chỗ mà quên đồng bộ là lỗi hiển thị
kiểu ảnh vỡ / màn trắng — đúng loại lỗi không được phép có.

Cách dùng:  python3 tools/dong-bo.py            (đồng bộ rồi tự kiểm tra)
Ghi chú:    KHÔNG đồng bộ thư mục assets — ảnh chỉ nằm ở `webapp/assets` và `assets/` gốc,
            `game/` cố ý không có assets để tránh nhân đôi 235 tệp ảnh.
"""
import filecmp
import pathlib
import shutil
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "game"
# ảnh: nguồn chân lý là assets/ ở gốc kho (trang game nằm ở /webapp/ nên "../assets/..." trỏ về đây).
# webapp/assets là bản sao để app đóng gói; thư mục icon/ giữ riêng vì bộ icon hai bên khác nhau có chủ đích.
ASSETS_SRC = ROOT / "assets"
ASSETS_DST = ROOT / "webapp/assets"
ASSETS_BO_QUA = {"icon"}
# các thư mục đích nhận bản sao của game/js, game/css, index.html, tests
DEST = [
    ROOT / "webapp",
    ROOT / "android/app/src/main/assets/public",
    ROOT / "ios/App/App/public",
]
NHOM = ["js", "css", "tests"]
TEP_LE = ["index.html"]

def copy_all(src: pathlib.Path, dst: pathlib.Path):
    dem = 0
    # tệp lẻ (index.html): rglob trên một tệp không trả gì nên phải xử riêng
    if src.is_file():
        dst.parent.mkdir(parents=True, exist_ok=True)
        if not dst.exists() or not filecmp.cmp(src, dst, shallow=False):
            shutil.copy2(src, dst); return 1
        return 0
    for p in sorted(src.rglob("*")):
        if p.is_dir():
            continue
        rel = p.relative_to(src)
        target = dst / rel
        target.parent.mkdir(parents=True, exist_ok=True)
        if not target.exists() or not filecmp.cmp(p, target, shallow=False):
            shutil.copy2(p, target)
            dem += 1
    return dem

def sync_assets():
    """chép ảnh từ assets/ gốc sang webapp/assets (bỏ qua icon/) và trả về số tệp đã chép"""
    n = 0
    for f in sorted(ASSETS_SRC.rglob("*")):
        if not f.is_file():
            continue
        rel = f.relative_to(ASSETS_SRC)
        if rel.parts and rel.parts[0] in ASSETS_BO_QUA:
            continue
        dst = ASSETS_DST / rel
        dst.parent.mkdir(parents=True, exist_ok=True)
        if not dst.exists() or not filecmp.cmp(f, dst, shallow=False):
            shutil.copy2(f, dst); n += 1
    return n


def main():
    tong = 0
    for d in DEST:
        if not d.exists():
            print("bỏ qua (không có):", d.relative_to(ROOT))
            continue
        n = 0
        for nhom in NHOM:
            base = SRC / nhom
            if base.exists():
                n += copy_all(base, d / nhom)
        for t in TEP_LE:
            if (SRC / t).exists():
                n += copy_all(SRC / t, d / t)
        print(f"→ {d.relative_to(ROOT)}: chép {n} tệp")
        tong += n
    # ảnh: assets gốc → webapp/assets
    if ASSETS_SRC.exists() and ASSETS_DST.exists():
        na = sync_assets()
        print(f"→ ảnh assets/ → webapp/assets: chép {na} tệp")
        lech = []
        for f in ASSETS_SRC.rglob("*"):
            if not f.is_file():
                continue
            rel = f.relative_to(ASSETS_SRC)
            if rel.parts and rel.parts[0] in ASSETS_BO_QUA:
                continue
            q = ASSETS_DST / rel
            if not q.exists() or not filecmp.cmp(f, q, shallow=False):
                lech.append(str(rel))
        if lech:
            print("ẢNH LỆCH SAU ĐỒNG BỘ:", lech[:10])
            return 1
        print("ảnh: assets/ và webapp/assets đã giống nhau từng tệp (không tính icon/)")
    # tự kiểm tra: game/ phải giống webapp/ từng tệp một
    loi = []
    for nhom in NHOM:
        for p in (SRC / nhom).rglob("*"):
            if p.is_dir():
                continue
            q = ROOT / "webapp" / nhom / p.relative_to(SRC / nhom)
            if not q.exists() or not filecmp.cmp(p, q, shallow=False):
                loi.append(str(p.relative_to(SRC)))
    for t in TEP_LE:
        a, b = SRC / t, ROOT / "webapp" / t
        if a.exists() and (not b.exists() or not filecmp.cmp(a, b, shallow=False)):
            loi.append(t)
    if loi:
        print("LỆCH SAU KHI ĐỒNG BỘ:", loi)
        return 1
    print(f"xong — chép {tong} tệp, game/ và webapp/ đã giống nhau từng tệp")
    return 0

if __name__ == "__main__":
    sys.exit(main())
