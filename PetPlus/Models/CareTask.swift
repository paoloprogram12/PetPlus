import Foundation

enum CareType: String, Codable, CaseIterable {
    case feeding = "Feeding"
    case walk = "Walk"
    case medication = "Medication"

    var icon: String {
        switch self {
        case .feeding: return "fork.knife"
        case .walk: return "figure.walk"
        case .medication: return "pill.fill"
        }
    }
}

struct CareTask: Identifiable, Codable {
    var id = UUID()
    var petId: UUID
    var type: CareType
    var note: String
    var date: Date
    var isCompleted: Bool = false
}
