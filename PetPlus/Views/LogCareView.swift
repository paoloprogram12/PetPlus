import SwiftUI

struct LogCareView: View {
    @Environment(PetStore.self) private var store
    @State private var selectedPetId: UUID?
    @State private var careType: CareType = .feeding
    @State private var note = ""
    @State private var showingSaved = false

    var body: some View {
        NavigationStack {
            Form {
                if store.pets.isEmpty {
                    Section {
                        Text("Add a pet first in the My Pets tab.")
                            .foregroundStyle(.secondary)
                    }
                } else {
                    Section("Select Pet") {
                        Picker("Pet", selection: $selectedPetId) {
                            Text("Choose a pet").tag(nil as UUID?)
                            ForEach(store.pets) { pet in
                                Text(pet.name).tag(pet.id as UUID?)
                            }
                        }
                    }

                    Section("Care Type") {
                        Picker("Type", selection: $careType) {
                            ForEach(CareType.allCases, id: \.self) { type in
                                Label(type.rawValue, systemImage: type.icon)
                            }
                        }
                        .pickerStyle(.segmented)
                    }

                    Section("Note (optional)") {
                        TextField("e.g. Fed 2 cups of kibble", text: $note)
                    }

                    Section {
                        Button(action: logCare) {
                            HStack {
                                Spacer()
                                Text("Log Care")
                                    .fontWeight(.semibold)
                                Spacer()
                            }
                        }
                        .disabled(selectedPetId == nil)
                    }
                }
            }
            .navigationTitle("Log Care")
            .alert("Saved!", isPresented: $showingSaved) {
                Button("OK", role: .cancel) { }
            } message: {
                Text("Care task logged for today.")
            }
            .onAppear {
                if selectedPetId == nil {
                    selectedPetId = store.pets.first?.id
                }
            }
        }
    }

    private func logCare() {
        guard let petId = selectedPetId else { return }
        let task = CareTask(petId: petId, type: careType, note: note, date: .now)
        store.addTask(task)
        note = ""
        showingSaved = true
    }
}
