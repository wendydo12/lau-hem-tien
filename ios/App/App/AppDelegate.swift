import UIKit
import Capacitor
import AVFoundation

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        /* Lẩu Hẻm Tiên — BGM là mp3 phát qua Web Audio (audio.js).
           Mặc định iOS dùng AVAudioSession category .ambient:
             - gạt cần IM LẶNG  -> nhạc TẮT NGÚM (đây chính là bug "mất phần nhạc")
             - app khác đang phát -> nhạc mình bị trộn/tắt
           Game có nhạc nền chủ đích => phải là .playback, và .mixWithOthers
           để không cướp tiếng của app khác (podcast/nhạc chàng đang nghe). */
        do {
            try AVAudioSession.sharedInstance().setCategory(
                .playback,
                mode: .default,
                options: [.mixWithOthers]
            )
            try AVAudioSession.sharedInstance().setActive(true)
        } catch {
            print("[LauHemTien] AVAudioSession lỗi: \(error)")
        }

        // iOS có thể tạm ngưng AudioContext khi về nền -> webview cần giữ trạng thái phát
        return true
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
        /* iOS hay nhả AudioSession khi app về nền (cuộc gọi, app khác chiếm).
           audio.js đã tự resume AudioContext trong au(); ở đây chỉ cần đòi lại session. */
        try? AVAudioSession.sharedInstance().setActive(true)
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        // Đòi lại session lần nữa cho chắc (sau khi bị app khác làm gián đoạn)
        try? AVAudioSession.sharedInstance().setActive(true)
    }

    func applicationWillTerminate(_ application: UIApplication) {
        // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
    }

    func application(_ application: UIApplication,
                     configurationForConnecting connectingSceneSession: UISceneSession,
                     options: UIScene.ConnectionOptions) -> UISceneConfiguration {
        let config = UISceneConfiguration(name: "Default Configuration",
                                          sessionRole: connectingSceneSession.role)
        config.delegateClass = SceneDelegate.self
        return config
    }
}
