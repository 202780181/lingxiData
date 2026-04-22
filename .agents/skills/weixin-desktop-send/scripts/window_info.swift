import CoreGraphics
import Foundation

struct WindowInfo: Encodable {
    let owner: String
    let name: String?
    let x: Int
    let y: Int
    let width: Int
    let height: Int
    let layer: Int
    let alpha: Double
}

struct ProbeResult: Encodable {
    let ok: Bool
    let windows: [WindowInfo]
}

@main
struct WindowProbeMain {
    static func main() {
        let query = CommandLine.arguments.dropFirst().joined(separator: " ").lowercased()
        let options: CGWindowListOption = [.optionOnScreenOnly, .excludeDesktopElements]
        let raw = CGWindowListCopyWindowInfo(options, kCGNullWindowID) as? [[String: Any]] ?? []

        let windows: [WindowInfo] = raw.compactMap { item in
            guard let owner = item[kCGWindowOwnerName as String] as? String else {
                return nil
            }

            if !query.isEmpty && !owner.lowercased().contains(query) {
                return nil
            }

            guard let bounds = item[kCGWindowBounds as String] as? [String: Any] else {
                return nil
            }

            let x = Int((bounds["X"] as? Double) ?? 0)
            let y = Int((bounds["Y"] as? Double) ?? 0)
            let width = Int((bounds["Width"] as? Double) ?? 0)
            let height = Int((bounds["Height"] as? Double) ?? 0)
            let layer = item[kCGWindowLayer as String] as? Int ?? 0
            let alpha = item[kCGWindowAlpha as String] as? Double ?? 0

            guard width > 200, height > 200, layer == 0, alpha > 0 else {
                return nil
            }

            return WindowInfo(
                owner: owner,
                name: item[kCGWindowName as String] as? String,
                x: x,
                y: y,
                width: width,
                height: height,
                layer: layer,
                alpha: alpha
            )
        }
        .sorted { lhs, rhs in
            (lhs.width * lhs.height) > (rhs.width * rhs.height)
        }

        let encoder = JSONEncoder()
        encoder.outputFormatting = [.prettyPrinted, .withoutEscapingSlashes]
        let data = try! encoder.encode(ProbeResult(ok: true, windows: windows))
        print(String(data: data, encoding: .utf8)!)
    }
}
