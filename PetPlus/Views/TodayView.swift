import SwiftUI

struct TodayView: View {
    @Environment(PetStore.self) private var store

    var body: some View {
        NavigationStack {
            Group {
                if store.todayTasks().isEmpty {
                    ContentUnavailableView(
                        "No Tasks Today",
                        systemImage: "checklist",
                        description: Text("Log some care in the Log Care tab")
                    )
                } else {
                    List {
                        ForEach(store.todayTasks()) { task in
                            HStack {
                                Button {
                                    store.toggleTask(task)
                                } label: {
                                    Image(systemName: task.isCompleted ? "checkmark.circle.fill" : "circle")
                                        .foregroundStyle(task.isCompleted ? .green : .gray)
                                        .font(.title2)
                                }
                                .buttonStyle(.plain)

                                VStack(alignment: .leading) {
                                    Text(task.type.rawValue)
                                        .font(.headline)
                                        .strikethrough(task.isCompleted)
                                    Text(store.petName(for: task.petId))
                                        .font(.subheadline)
                                        .foregroundStyle(.secondary)
                                    if !task.note.isEmpty {
                                        Text(task.note)
                                            .font(.caption)
                                            .foregroundStyle(.secondary)
                                    }
                                }

                                Spacer()

                                Image(systemName: task.type.icon)
                                    .foregroundStyle(.blue)
                            }
                        }
                    }
                }
            }
            .navigationTitle("Today's Tasks")
        }
    }
}
