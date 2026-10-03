// Lẩu Hẻm Tiên — native macOS app (SwiftUI + WKWebView + server tĩnh nhúng)
// App THẬT: tiến trình riêng, cửa sổ riêng, Dock icon riêng — như Bách Linh Đài.
// - Server HTTP tĩnh NHÚNG TRONG APP (Network.framework): bind 127.0.0.1:8793,
//   chỉ sống khi app mở → không daemon, không LaunchAgent, không lộ ra LAN.
// - Root: ~/projects/laudem-tien  ("/" → webapp/index.html; fallback webapp/ rồi root/)
// - Cửa sổ khổ điện thoại (game mobile-first max-width 480px).
import SwiftUI
import WebKit
import AppKit
import Network

let ROOT = NSString(string: "~/projects/laudem-tien").expandingTildeInPath
let PORT: UInt16 = 8793
let BASE = "http://127.0.0.1:\(PORT)"

// MARK: - Server tĩnh nhúng (NWListener, HTTP/1.1, Connection: close)

final class StaticServer {
    static let shared = StaticServer()
    private var listener: NWListener?
    private let queue = DispatchQueue(label: "lau.static-server")
    @Published var up = false

    func mime(_ ext: String) -> String {
        switch ext.lowercased() {
        case "html", "htm": return "text/html; charset=utf-8"
        case "css": return "text/css; charset=utf-8"
        case "js", "mjs": return "text/javascript; charset=utf-8"
        case "json": return "application/json"
        case "webmanifest": return "application/manifest+json"
        case "png": return "image/png"
        case "jpg", "jpeg": return "image/jpeg"
        case "gif": return "image/gif"
        case "webp": return "image/webp"
        case "svg": return "image/svg+xml"
        case "ico": return "image/x-icon"
        case "mp3": return "audio/mpeg"
        case "wav": return "audio/wav"
        case "ogg": return "audio/ogg"
        case "m4a", "aac": return "audio/mp4"
        case "mp4": return "video/mp4"
        case "webm": return "video/webm"
        case "woff": return "font/woff"
        case "woff2": return "font/woff2"
        case "ttf": return "font/ttf"
        case "txt", "md": return "text/plain; charset=utf-8"
        case "map": return "application/json"
        default: return "application/octet-stream"
        }
    }

    func start() {
        guard listener == nil else { return }
        do {
            let params = NWParameters.tcp
            params.requiredLocalEndpoint = NWEndpoint.hostPort(host: .ipv4(.loopback), port: NWEndpoint.Port(rawValue: PORT)!)
            params.acceptLocalOnly = true
            listener = try NWListener(using: params)
        } catch {
            // fallback: để NWListener tự chọn bind loopback qua port
            listener = try? NWListener(using: .tcp, on: NWEndpoint.Port(rawValue: PORT)!)
        }
        listener?.stateUpdateHandler = { [weak self] st in
            DispatchQueue.main.async { self?.up = (st == .ready) }
        }
        listener?.newConnectionHandler = { [weak self] conn in self?.handle(conn) }
        listener?.start(queue: queue)
    }

    private func handle(_ conn: NWConnection) {
        conn.start(queue: queue)
        receiveHeaders(conn, accumulated: Data())
    }

    private func receiveHeaders(_ conn: NWConnection, accumulated: Data) {
        conn.receive(minimumIncompleteLength: 1, maximumLength: 8192) { [weak self] data, _, isComplete, error in
            guard let self else { conn.cancel(); return }
            var buf = accumulated
            if let d = data { buf.append(d) }
            if error != nil { conn.cancel(); return }
            // chờ hết header
            guard let range = buf.range(of: Data("\r\n\r\n".utf8)) else {
                if isComplete || buf.count > 65536 { conn.cancel() } else { self.receiveHeaders(conn, accumulated: buf) }
                return
            }
            let head = String(data: buf.subdata(in: buf.startIndex..<range.lowerBound), encoding: .utf8) ?? ""
            let firstLine = head.split(separator: "\r\n").first.map(String.init) ?? ""
            let parts = firstLine.split(separator: " ")
            let method = parts.count > 0 ? String(parts[0]) : ""
            let rawPath = parts.count > 1 ? String(parts[1]) : "/"
            if method == "GET" || method == "HEAD" {
                self.respond(conn, path: rawPath, headOnly: method == "HEAD")
            } else {
                self.send(conn, status: "405 Method Not Allowed", type: "text/plain", body: Data("405".utf8), headOnly: false)
            }
        }
    }

    /// Map path → file: "/" → webapp/index.html; thử root/webapp/<p> trước, rồi root/<p>.
    private func resolve(_ rawPath: String) -> String? {
        var p = rawPath
        if let q = p.firstIndex(of: "?") { p = String(p[..<q]) }
        if let h = p.firstIndex(of: "#") { p = String(p[..<h]) }
        p = p.removingPercentEncoding ?? p
        if p == "/" || p.isEmpty { return ROOT + "/webapp/index.html" }
        guard !p.contains("..") else { return nil }
        let rel = p.hasPrefix("/") ? String(p.dropFirst()) : p
        let inWebapp = ROOT + "/webapp/" + rel
        if FileManager.default.fileExists(atPath: inWebapp) { return inWebapp }
        let inRoot = ROOT + "/" + rel
        if FileManager.default.fileExists(atPath: inRoot) { return inRoot }
        return nil
    }

    private func respond(_ conn: NWConnection, path: String, headOnly: Bool) {
        guard let file = resolve(path), FileManager.default.fileExists(atPath: file) else {
            send(conn, status: "404 Not Found", type: "text/plain; charset=utf-8", body: Data("404 — Lẩu Hẻm Tiên không tìm thấy món này".utf8), headOnly: headOnly)
            return
        }
        var isDir: ObjCBool = false
        FileManager.default.fileExists(atPath: file, isDirectory: &isDir)
        var target = file
        if isDir.boolValue { target = file + "/index.html" }
        guard let body = try? Data(contentsOf: URL(fileURLWithPath: target)) else {
            send(conn, status: "500 Internal Server Error", type: "text/plain", body: Data(), headOnly: headOnly)
            return
        }
        let ext = (target as NSString).pathExtension
        send(conn, status: "200 OK", type: mime(ext), body: body, headOnly: headOnly)
    }

    private func send(_ conn: NWConnection, status: String, type: String, body: Data, headOnly: Bool) {
        var head = "HTTP/1.1 \(status)\r\n"
        head += "Content-Type: \(type)\r\n"
        head += "Content-Length: \(body.count)\r\n"
        head += "Cache-Control: no-cache\r\n"
        head += "Access-Control-Allow-Origin: *\r\n"
        head += "Connection: close\r\n\r\n"
        var out = Data(head.utf8)
        if !headOnly { out.append(body) }
        conn.send(content: out, completion: .contentProcessed { _ in conn.cancel() })
    }
}

// MARK: - Gate: chờ server nội bộ sẵn sàng

final class Gate: ObservableObject {
    @Published var ready = false
    @Published var status = "Đang nhóm bếp Lẩu Hẻm Tiên…"

    func wake() {
        StaticServer.shared.start()
        Task {
            for attempt in 1...20 {
                if await probe() {
                    await MainActor.run { self.ready = true }
                    return
                }
                await MainActor.run { self.status = "Đang nhóm bếp… (lần \(attempt))" }
                try? await Task.sleep(nanoseconds: 300_000_000)
            }
            await MainActor.run { self.status = "Bếp không lên được. Kiểm tra port \(PORT)." }
        }
    }

    private func probe() async -> Bool {
        guard let url = URL(string: BASE + "/") else { return false }
        do {
            let (_, resp) = try await URLSession.shared.data(from: url)
            return (resp as? HTTPURLResponse)?.statusCode == 200
        } catch { return false }
    }
}

// MARK: - WebView (giữ nguyên bài học popup từ Bách Linh Đài)

struct GameWebView: NSViewRepresentable {
    let url: URL
    @ObservedObject var nav: NavState

    func makeNSView(context: Context) -> WKWebView {
        let cfg = WKWebViewConfiguration()
        cfg.preferences.javaScriptCanOpenWindowsAutomatically = true
        cfg.websiteDataStore = .default()
        // App native không có tab: window.open → điều hướng trong cửa sổ (link ngoài → trình duyệt thật)
        let js = """
        (function(){
          const _open = window.open;
          window.open = function(url, name, features){
            if (url && url !== 'about:blank') {
              const abs = new URL(url, location.href).href;
              if (abs.startsWith('http://127.0.0.1') || abs.startsWith('http://localhost')) {
                location.href = abs;
              } else { _open.apply(window, arguments); }
            }
            return null;
          };
        })();
        """
        cfg.userContentController.addUserScript(
            WKUserScript(source: js, injectionTime: .atDocumentStart, forMainFrameOnly: false))
        let wv = WKWebView(frame: .zero, configuration: cfg)
        wv.load(URLRequest(url: url))
        wv.allowsBackForwardNavigationGestures = true
        wv.setValue(false, forKey: "drawsBackground")
        context.coordinator.observe(wv)
        nav.webView = wv
        return wv
    }
    func updateNSView(_ nsView: WKWebView, context: Context) {}
    func makeCoordinator() -> Coordinator { Coordinator(nav: nav) }

    final class Coordinator: NSObject, WKNavigationDelegate, WKUIDelegate {
        let nav: NavState
        init(nav: NavState) { self.nav = nav }
        func observe(_ wv: WKWebView) { wv.navigationDelegate = self; wv.uiDelegate = self }
        func webView(_ wv: WKWebView, didFinish navigation: WKNavigation!) {
            DispatchQueue.main.async { self.nav.sync(wv) }
        }
        func webView(_ webView: WKWebView, createWebViewWith configuration: WKWebViewConfiguration,
                     for navigationAction: WKNavigationAction, windowFeatures: WKWindowFeatures) -> WKWebView? {
            if let url = navigationAction.request.url { webView.load(URLRequest(url: url)) }
            return nil
        }
        // game mobile cần touch/audio autoplay: cho phép media không cần gesture
        func webView(_ webView: WKWebView,
                     decidePolicyFor navigationAction: WKNavigationAction) async -> WKNavigationActionPolicy { .allow }
    }
}

final class NavState: ObservableObject {
    weak var webView: WKWebView?
    @Published var canBack = false
    @Published var canForward = false
    func sync(_ wv: WKWebView) { canBack = wv.canGoBack; canForward = wv.canGoForward }
}

struct ContentView: View {
    @StateObject private var gate = Gate()
    @StateObject private var nav = NavState()

    var body: some View {
        Group {
            if gate.ready, let url = URL(string: BASE + "/") {
                GameWebView(url: url, nav: nav)
                    .toolbar {
                        ToolbarItemGroup(placement: .navigation) {
                            Button(action: { nav.webView?.goBack() }) {
                                Image(systemName: "chevron.left")
                            }.disabled(!nav.canBack)
                            Button(action: { nav.webView?.reload() }) {
                                Image(systemName: "arrow.clockwise")
                            }
                        }
                    }
            } else {
                VStack(spacing: 14) {
                    Text("🍲").font(.system(size: 56))
                    ProgressView()
                    Text(gate.status).font(.system(.body, design: .monospaced))
                    Button("Thử lại") { gate.wake() }
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .background(Color(red: 0.14, green: 0.08, blue: 0.04))
            }
        }
        .onAppear { if !gate.ready { gate.wake() } }
    }
}

@main
struct LauHemTienApp: App {
    var body: some Scene {
        WindowGroup("Lẩu Hẻm Tiên") {
            ContentView()
                .frame(minWidth: 400, idealWidth: 480, minHeight: 680, idealHeight: 880)
        }
        .commands {
            CommandGroup(replacing: .newItem) {}
        }
    }
}
