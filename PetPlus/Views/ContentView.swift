import SwiftUI

struct ContentView: View {
    var body: some View {
        TabView {
            PetListView()
                .tabItem {
                    Label("My Pets", systemImage: "pawprint.fill")
                }

            LogCareView()
                .tabItem {
                    Label("Log Care", systemImage: "plus.circle.fill")
                }

            TodayView()
                .tabItem {
                    Label("Today", systemImage: "checklist")
                }
        }
    }
}
