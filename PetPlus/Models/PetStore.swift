import Foundation

@Observable
class PetStore {
    var pets: [Pet] = [] {
        didSet { savePets() }
    }

    var tasks: [CareTask] = [] {
        didSet { saveTasks() }
    }

    init() {
        loadPets()
        loadTasks()
    }

    // MARK: - Pet operations

    func addPet(_ pet: Pet) {
        pets.append(pet)
    }

    func deletePet(_ pet: Pet) {
        tasks.removeAll { $0.petId == pet.id }
        pets.removeAll { $0.id == pet.id }
    }

    // MARK: - Task operations

    func addTask(_ task: CareTask) {
        tasks.append(task)
    }

    func toggleTask(_ task: CareTask) {
        if let index = tasks.firstIndex(where: { $0.id == task.id }) {
            tasks[index].isCompleted.toggle()
        }
    }

    func todayTasks() -> [CareTask] {
        tasks.filter { Calendar.current.isDateInToday($0.date) }
    }

    func petName(for petId: UUID) -> String {
        pets.first { $0.id == petId }?.name ?? "Unknown"
    }

    // MARK: - Persistence (UserDefaults)

    private func savePets() {
        if let data = try? JSONEncoder().encode(pets) {
            UserDefaults.standard.set(data, forKey: "pets")
        }
    }

    private func loadPets() {
        if let data = UserDefaults.standard.data(forKey: "pets"),
           let decoded = try? JSONDecoder().decode([Pet].self, from: data) {
            pets = decoded
        }
    }

    private func saveTasks() {
        if let data = try? JSONEncoder().encode(tasks) {
            UserDefaults.standard.set(data, forKey: "careTasks")
        }
    }

    private func loadTasks() {
        if let data = UserDefaults.standard.data(forKey: "careTasks"),
           let decoded = try? JSONDecoder().decode([CareTask].self, from: data) {
            tasks = decoded
        }
    }
}
