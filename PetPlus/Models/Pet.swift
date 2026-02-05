import Foundation

struct Pet: Identifiable, Codable {
    var id = UUID()
    var name: String
    var type: String
    var age: Int
}
