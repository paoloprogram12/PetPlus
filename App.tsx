// ============================================================
// App.tsx — The entry point of the entire PetPlus application.
// This file sets up navigation (how users move between screens).
// Think of it as the "skeleton" that holds all screens together.
// ============================================================

// --- Library Imports ---

// NavigationContainer: Wraps the entire app and manages navigation state.
// Every React Navigation app MUST have this at the root. Without it,
// none of the navigation (tabs, screen transitions) would work.
import { NavigationContainer } from "@react-navigation/native";

// createBottomTabNavigator: Creates the tab bar at the bottom of the screen.
// This gives us the "Pets", "Log Care", and "Today" tabs the user taps on.
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

// createNativeStackNavigator: Creates a "stack" of screens that slide
// on top of each other. We use this so the user can go from the pet list
// screen → add pet screen, and then press "back" to return.
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Ionicons: A library of icons (paw, checkmark, plus circle, etc.)
// These are the small icons you see in the tab bar at the bottom.
import { Ionicons } from "@expo/vector-icons";

// StatusBar: Controls the status bar at the very top of the phone
// (where the time, battery, and wifi icons are). "auto" means it
// adapts to light/dark mode automatically.
import { StatusBar } from "expo-status-bar";

// --- Screen Imports ---
// These are the actual screens (pages) the user sees.
// Each one is a separate file in the src/screens folder.

import PetListScreen from "./src/screens/PetListScreen"; // Shows list of all pets
import AddPetScreen from "./src/screens/AddPetScreen"; // Form to add a new pet
import LogCareScreen from "./src/screens/LogCareScreen"; // Log feeding/walk/medication
import TodayScreen from "./src/screens/TodayScreen"; // Shows today's tasks

// --- TypeScript Type ---
// This defines which screens exist in the Pet stack and what
// data (parameters) they accept. "undefined" means the screen
// doesn't require any data to be passed to it.
type PetStackParamList = {
  PetList: undefined; // No params needed to show the pet list
  AddPet: undefined; // No params needed to show the add pet form
};

// --- Navigator Instances ---
// These create the actual navigator objects we use below.
// Think of them as "containers" that know how to manage screens.

// Tab: The bottom tab bar (Pets | Log Care | Today)
const Tab = createBottomTabNavigator();

// PetStack: A stack navigator specifically for pet-related screens.
// <PetStackParamList> tells TypeScript which screens this stack contains,
// so it can warn us if we try to navigate to a screen that doesn't exist.
const PetStack = createNativeStackNavigator<PetStackParamList>();

// ============================================================
// PetStackScreen — A mini navigator inside the "Pets" tab.
//
// Why do we need this? Because the "Pets" tab has TWO screens:
//   1. PetList (the main list of pets)
//   2. AddPet (the form to add a pet)
//
// When the user taps "+", they go from PetList → AddPet.
// When they tap "back" or save, they go back to PetList.
// This stack handles that back-and-forth navigation.
// ============================================================
function PetStackScreen() {
  return (
    <PetStack.Navigator id="PetStack">
      {/* First screen in the stack (shown by default) */}
      <PetStack.Screen
        name="PetList" // Internal name used for navigation
        component={PetListScreen} // Which component to render
        options={{ title: "My Pets" }} // Title shown in the header bar
      />
      {/* Second screen (pushed on top when user taps "+") */}
      <PetStack.Screen
        name="AddPet"
        component={AddPetScreen}
        options={{ title: "Add Pet" }}
      />
    </PetStack.Navigator>
  );
}

// ============================================================
// App — The root component. This is what gets rendered when
// the app starts. "export default" means this is the main
// function that Expo looks for to launch the app.
// ============================================================
export default function App() {
  return (
    // NavigationContainer: The outermost wrapper. Required for
    // any navigation to work. There should only be ONE of these
    // in the entire app.
    <NavigationContainer>
      {/* StatusBar: Controls the phone's top status bar appearance */}
      <StatusBar style="auto" />

      {/* Tab.Navigator: Creates the bottom tab bar with 3 tabs.
          id: A unique identifier required by React Navigation.
          screenOptions: A function that runs for EACH tab to configure it. */}
      <Tab.Navigator
        id="MainTabs"
        screenOptions={({ route }) => ({
          // tabBarIcon: Determines which icon to show for each tab.
          // "route" tells us which tab we're configuring.
          // "color" and "size" are provided by React Navigation
          // (color changes based on whether the tab is active or not).
          tabBarIcon: ({ color, size }: { color: string; size: number }) => {
            // Default icon
            let iconName: keyof typeof Ionicons.glyphMap = "paw";

            // Pick the right icon based on which tab this is
            if (route.name === "Pets") iconName = "paw";
            else if (route.name === "Log Care") iconName = "add-circle";
            else if (route.name === "Today") iconName = "checkmark-done";

            // Return the icon component with the chosen name, size, and color
            return <Ionicons name={iconName} size={size} color={color} />;
          },

          // tabBarActiveTintColor: The color of the icon/text when a tab
          // is selected. "#007aff" is Apple's standard blue color.
          tabBarActiveTintColor: "#ffaa00",
        })}
      >
        {/* TAB 1: "Pets" — Uses PetStackScreen (which contains PetList + AddPet).
            headerShown: false — Hides the tab's header because the stack
            navigator inside already has its own header ("My Pets").
            Without this, you'd see two headers stacked on top of each other. */}
        <Tab.Screen
          name="Pets"
          component={PetStackScreen}
          options={{ headerShown: false }}
        />

        {/* TAB 2: "Log Care" — A single screen, no stack needed */}
        <Tab.Screen name="Log Care" component={LogCareScreen} />

        {/* TAB 3: "Today" — A single screen, no stack needed */}
        <Tab.Screen name="Today" component={TodayScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
