#!/bin/bash
# Dựng lại app Lẩu Hẻm Tiên native (Swift + WKWebView + server tĩnh nhúng).
# Yêu cầu: Xcode command line tools (swiftc), iconutil.
set -e
cd "$(dirname "$0")"
swiftc -O -parse-as-library -target arm64-apple-macosx14.0 \
  LauHemTien.swift -o LauHemTien \
  -framework SwiftUI -framework WebKit -framework AppKit -framework Network

APP=/Applications/LauHemTien.app
rm -rf "$APP"
mkdir -p "$APP/Contents/MacOS" "$APP/Contents/Resources"
cp LauHemTien "$APP/Contents/MacOS/LauHemTien"
# ICON: lấy từ assets/icon/LauHemTien.icns — đó mới là bản chính (icon v2 chủ dự án duyệt).
# Lỗi 08/10/2026: build.sh trước đây chép macos-app/LauHemTien.icns (bản mascot cũ),
# nên mỗi lần dựng lại là icon trong /Applications bị quay về bản cũ.
cp "$(dirname "$0")/../assets/icon/LauHemTien.icns" "$APP/Contents/Resources/LauHemTien.icns"
cat > "$APP/Contents/Info.plist" <<'PLIST'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleName</key><string>Lẩu Hẻm Tiên</string>
  <key>CFBundleDisplayName</key><string>Lẩu Hẻm Tiên</string>
  <key>CFBundleIdentifier</key><string>com.uyennhi.lau-hem-tien</string>
  <key>CFBundleVersion</key><string>1.0</string>
  <key>CFBundleShortVersionString</key><string>1.0</string>
  <key>CFBundleExecutable</key><string>LauHemTien</string>
  <key>CFBundlePackageType</key><string>APPL</string>
  <key>CFBundleIconFile</key><string>LauHemTien</string>
  <key>LSMinimumSystemVersion</key><string>14.0</string>
  <key>NSHighResolutionCapable</key><true/>
  <key>NSAppTransportSecurity</key>
  <dict><key>NSAllowsLocalNetworking</key><true/></dict>
</dict>
</plist>
PLIST
echo -n 'APPL????' > "$APP/Contents/PkgInfo"
/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister -f "$APP"
echo "OK — app dựng lại tại $APP"
