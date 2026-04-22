import AppKit
import Foundation
import Vision

struct OCRResult: Encodable {
    let ok: Bool
    let text: String
    let error: String?
}

@main
struct OCRMain {
    static func emit(_ result: OCRResult) -> Never {
        let encoder = JSONEncoder()
        encoder.outputFormatting = [.withoutEscapingSlashes]
        let data = try! encoder.encode(result)
        print(String(data: data, encoding: .utf8)!)
        exit(result.ok ? 0 : 1)
    }

    static func main() {
        guard CommandLine.arguments.count >= 2 else {
            emit(OCRResult(ok: false, text: "", error: "missing image path"))
        }

        let imagePath = CommandLine.arguments[1]
        let imageURL = URL(fileURLWithPath: imagePath)

        guard let image = NSImage(contentsOf: imageURL) else {
            emit(OCRResult(ok: false, text: "", error: "failed to load image"))
        }

        var proposedRect = NSRect(origin: .zero, size: image.size)
        guard let cgImage = image.cgImage(forProposedRect: &proposedRect, context: nil, hints: nil) else {
            emit(OCRResult(ok: false, text: "", error: "failed to create cgImage"))
        }

        var recognizedLines: [String] = []
        var requestError: String?

        let request = VNRecognizeTextRequest { request, error in
            if let error = error {
                requestError = error.localizedDescription
                return
            }

            let observations = request.results as? [VNRecognizedTextObservation] ?? []
            recognizedLines = observations.compactMap { observation in
                observation.topCandidates(1).first?.string
            }
        }

        request.recognitionLevel = .accurate
        request.usesLanguageCorrection = true
        request.recognitionLanguages = ["zh-Hans", "en-US"]

        do {
            let handler = VNImageRequestHandler(cgImage: cgImage, options: [:])
            try handler.perform([request])
        } catch {
            emit(OCRResult(ok: false, text: "", error: error.localizedDescription))
        }

        if let requestError {
            emit(OCRResult(ok: false, text: "", error: requestError))
        }

        emit(OCRResult(ok: true, text: recognizedLines.joined(separator: "\n"), error: nil))
    }
}
