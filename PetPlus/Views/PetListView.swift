import SwiftUI

struct PetListView: View {
    @Environment(PetStore.self) private var store
    @State private var showingAddPet = false

    var body: some View {
        NavigationStack {
            Group {
                if store.pets.isEmpty {
                    ContentUnavailableView(
                        "No Pets Yet",
                        systemImage: "pawprint",
                        description: Text("Tap + to add your first pet")
                    )
                } else {
                    List {
                        ForEach(store.pets) { pet in
                            HStack {
                                VStack(alignment: .leading) {
                                    Text(pet.name)
                                        .font(.headline)
                                    Text("\(pet.type) • \(pet.age) years old")
                                        .font(.subheadline)
                                        .foregroundStyle(.secondary)
                                }
                            }
                        }
                        .onDelete { indexSet in
                            for index in indexSet {
                                store.deletePet(store.pets[index])
                            }
                        }
                    }
                }
            }
            .navigationTitle("My Pets")
            .toolbar {
                Button(action: { showingAddPet = true }) {
                    Image(systemName: "plus")
                }
            }
            .sheet(isPresented: $showingAddPet) {
                AddPetView()
            }
        }
    }
}
