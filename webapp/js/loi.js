/* js/loi.js — SỔ GHI LỖI CỦA TRANG (08/10/2026)
 *
 * Vì sao có tệp này: app macOS chạy WKWebView KHÔNG có bảng điều khiển như trình duyệt, nên khi
 * trang hỏng (mã không chạy, tài nguyên không tải) thì nhìn bên ngoài chỉ thấy màn hình đứng im,
 * không biết vì sao. Tệp này là script THƯỜNG (không phải module) nên nó chạy được ngay cả khi
 * toàn bộ module của game chết — nó ghi lỗi vào localStorage['lhTienLoi'], rồi tra bằng:
 *     sqlite3 ~/Library/WebKit/<bundle>/…/LocalStorage/localstorage.sqlite3 \
 *       "select cast(value as text) from ItemTable where key='lhTienLoi';"
 *
 * Ghi tối đa 20 dòng gần nhất. Không gửi đi đâu, không ảnh hưởng gameplay.
 */
(function () {
  var KHOA = 'lhTienLoi';
  function ghi(loai, noiDung) {
    try {
      var ds = [];
      try { ds = JSON.parse(localStorage.getItem(KHOA) || '[]'); } catch (e) { ds = []; }
      if (!(ds instanceof Array)) ds = [];
      ds.push(new Date().toISOString().slice(11, 19) + ' [' + loai + '] ' + noiDung);
      while (ds.length > 20) ds.shift();
      localStorage.setItem(KHOA, JSON.stringify(ds));
    } catch (e) { /* máy chặn localStorage thì thôi */ }
  }

  /* lỗi tài nguyên (ảnh, script, css, font tải hỏng) — cần capture=true mới bắt được */
  window.addEventListener('error', function (e) {
    if (e && e.target && e.target.tagName) {
      var t = e.target;
      ghi('tài nguyên', t.tagName + ' ' + (t.src || t.href || '(không rõ đường dẫn)'));
    } else if (e) {
      ghi('lỗi', (e.message || 'không rõ') + ' @ ' +
        String(e.filename || '').split('/').pop() + ':' + (e.lineno || '?'));
    }
  }, true);

  /* promise bị từ chối mà không ai bắt */
  window.addEventListener('unhandledrejection', function (e) {
    var r = e && e.reason;
    ghi('promise', (r && r.message) || String(r));
  });

  /* dấu mốc: script thường này đã chạy (tức trang có tải được mã cơ bản) */
  ghi('mốc', 'loi.js chạy · ' + location.pathname);
})();
