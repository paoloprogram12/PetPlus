import SwiftUI

struct AddPetView: View {
    @Environment(PetStore.self) private var store
    @Environment(\.dismiss) private var dismiss

    @State private var name = ""
    @State private var type = "Dog"
    @State private var age = 1

    let petTypes = ["Dog", "Cat", "Bird", "Fish", "Rabbit", "Hamster", "Other"]

    var body: some View {
        NavigationStack {
            Form {
                Section("Pet Info") {
                    TextField("Name", text: $name)

                    Picker("Type", selection: $type) {
                        ForEach(petTypes, id: \.self) { type in
                            Text(type)
                        }
                    }

                    Stepper("Age: \(age)", value: $age, in: 0...30)
                }
            }
            .navigationTitle("Add Pet")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        let pet = Pet(name: name, type: type, age: age)
                        store.addPet(pet)
                        dismiss()
                    }
                    .disabled(name.isEmpty)
                }
            }
        }
    }
}
