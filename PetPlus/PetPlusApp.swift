import SwiftUI

@main
struct PetPlusApp: App {
    @State private var store = PetStore()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environment(store)
        }
    }
}
