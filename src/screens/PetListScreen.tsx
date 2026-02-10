// ============================================================
// PetListScreen.tsx — The main "My Pets" screen.
//
// What this screen does:
//   - Displays a list of all saved pets
//   - Shows an empty state when no pets exist yet
//   - Has a floating "+" button to navigate to the AddPet screen
//   - Allows deleting a pet by tapping the trash icon
//
// This is the first screen the user sees when they open the app.
// ============================================================

// --- React Imports ---

// useCallback: Wraps a function so React doesn't recreate it on every render.
//   We use it with useFocusEffect to avoid unnecessary re-runs.
// useState: A React "hook" that lets us store data that can change.
//   When the data changes, the screen automatically re-renders to show the update.
import { useCallback, useState } from "react";

// --- React Native UI Components ---
// These are the building blocks for the screen's visual layout.
import {
  View, // A container (like a <div> in HTML). Used to group and layout elements.
  Text, // Displays text on screen (like a <p> or <span> in HTML).
  FlatList, // A scrollable list optimized for large datasets. Renders items lazily.
  TouchableOpacity, // A button that slightly fades when pressed, giving visual feedback.
  StyleSheet, // Creates a stylesheet object for styling (like CSS but as JS objects).
  Alert, // Shows a native popup dialog (e.g. "Are you sure you want to delete?").
  ListRenderItemInfo, // TypeScript type: describes the shape of each item passed to renderItem.
} from "react-native";

// Ionicons: Icon library — gives us icons like paw, trash, plus, etc.
import { Ionicons } from "@expo/vector-icons";

// --- Navigation Imports ---

// useFocusEffect: Runs code every time this screen comes into focus (becomes visible).
//   Different from useEffect — useEffect only runs on mount/unmount.
//   useFocusEffect re-runs when navigating BACK to this screen (e.g. after adding a pet).
// useNavigation: Gives us the navigation object so we can navigate to other screens.
import { useFocusEffect, useNavigation } from "@react-navigation/native";

// NativeStackNavigationProp: TypeScript type that tells the navigation object
// which screens it can navigate to. This gives us autocomplete and type safety.
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

// --- Data Imports ---
// Pet type and storage functions from our data layer.
import { Pet, loadPets, savePets } from "../store/PetStore";

// --- TypeScript Type ---
// Defines the screens in our Pet stack navigator.
// This tells TypeScript: "navigation.navigate() can only go to 'PetList' or 'AddPet'."
type PetStackParamList = {
  PetList: undefined;
  AddPet: undefined;
};

// ============================================================
// PetListScreen Component
//
// "export default" means this is the main thing this file exports.
// Other files import it like: import PetListScreen from "./PetListScreen"
// ============================================================
export default function PetListScreen() {
  // --- State ---
  // useState creates a piece of state. It returns two things:
  //   1. The current value (pets)
  //   2. A function to update it (setPets)
  // When setPets is called, React re-renders the screen with the new data.
  const [pets, setPets] = useState<Pet[]>([]); // Start with an empty array

  // Get the navigation object so we can navigate to the AddPet screen.
  // The <NativeStackNavigationProp<PetStackParamList>> part is TypeScript
  // telling it which screens are valid navigation targets.
  const navigation = useNavigation<NativeStackNavigationProp<PetStackParamList>>();

  // --- Load pets when screen comes into focus ---
  // useFocusEffect runs every time the user navigates to this screen.
  // This ensures the pet list is always up-to-date (e.g. after adding a new pet).
  //
  // useCallback wraps the function so it's not recreated on every render.
  // The empty array [] means: "only create this function once."
  useFocusEffect(
    useCallback(() => {
      // loadPets() reads from AsyncStorage and returns a Promise.
      // .then(setPets) means: "when the data arrives, call setPets with it."
      // This updates the state, which causes the screen to re-render with the pets.
      loadPets().then(setPets);
    }, [])
  );

  // --- Delete a pet ---
  // Shows a confirmation dialog before deleting.
  function handleDelete(pet: Pet) {
    Alert.alert(
      "Delete Pet", // Dialog title
      `Remove ${pet.name}?`, // Dialog message (uses template literal for the pet's name)
      [
        // Button 1: Cancel — does nothing, just closes the dialog
        { text: "Cancel", style: "cancel" },
        // Button 2: Delete — removes the pet from the array and saves
        {
          text: "Delete",
          style: "destructive", // Makes the button red on iOS
          onPress: async () => {
            // Filter out the pet we want to delete.
            // .filter() creates a NEW array with only the pets whose id
            // does NOT match the deleted pet's id.
            const updated = pets.filter((p) => p.id !== pet.id);
            await savePets(updated); // Save the updated array to storage
            setPets(updated); // Update the screen to reflect the change
          },
        },
      ]
    );
  }

  // --- Render a single pet card ---
  // This function is called by FlatList for EACH pet in the array.
  // "item" is the current Pet object being rendered.
  // ListRenderItemInfo<Pet> is the TypeScript type for FlatList's render callback.
  function renderPet({ item }: ListRenderItemInfo<Pet>) {
    return (
      // Card container — a white rounded card with a subtle shadow
      <View style={styles.card}>
        {/* Left side: pet name and details */}
        <View style={styles.cardInfo}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.detail}>
            {item.type} • {item.age} years old
          </Text>
        </View>

        {/* Right side: delete button (trash icon) */}
        <TouchableOpacity onPress={() => handleDelete(item)}>
          <Ionicons name="ellipsis-horizontal" size={24} color="#333" />
        </TouchableOpacity>
      </View>
    );
  }

  // ============================================================
  // SCREEN LAYOUT (what the user sees)
  // ============================================================
  return (
    <View style={styles.container}>
      {/* Conditional rendering: show empty state OR the pet list.
          The ternary operator (condition ? A : B) means:
          "if pets is empty, show A; otherwise, show B" */}
      {pets.length === 0 ? (
        // --- Empty state: shown when no pets exist yet ---
        <View style={styles.empty}>
          <Ionicons name="paw-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No pets yet</Text>
          <Text style={styles.emptySubtext}>Tap + to add your first pet</Text>
        </View>
      ) : (
        // --- Pet list: shown when pets exist ---
        // FlatList efficiently renders a scrollable list.
        // It only renders items that are visible on screen (good for performance).
        <FlatList
          data={pets} // The array of pets to display
          keyExtractor={(item) => item.id} // Unique key for each item (required by React)
          renderItem={renderPet} // Function that renders each pet card
          contentContainerStyle={styles.list} // Padding around the list
        />
      )}

      {/* --- Floating Action Button (FAB) --- */}
      {/* The blue "+" button in the bottom-right corner.
          "position: absolute" takes it out of normal layout flow
          and pins it to the bottom-right of the screen. */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("AddPet")} // Navigate to the AddPet screen
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

// ============================================================
// STYLES
//
// StyleSheet.create() works like CSS but uses JavaScript objects.
// Key differences from CSS:
//   - camelCase instead of kebab-case (fontSize, not font-size)
//   - Values are numbers (no "px" needed) or strings (for colors)
//   - flex: 1 means "take up all available space"
//   - flexDirection: "row" lays children out horizontally (default is vertical)
// ============================================================
const styles = StyleSheet.create({
  // Main container — fills the whole screen with a light gray background
  container: { flex: 1, backgroundColor: "#f5f5f5" },

  // Padding around the list of pet cards
  list: { padding: 16 },

  // Individual pet card — white box with rounded corners and a shadow
  card: {
    flexDirection: "row", // Lay out children horizontally (name on left, trash on right)
    alignItems: "center", // Vertically center the content
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12, // Rounded corners
    marginBottom: 12, // Space between cards
    // Shadow properties (iOS)
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2, // Shadow on Android (Android uses "elevation" instead of shadow properties)
  },

  // flex: 1 makes the info section take up all remaining space
  // (pushes the trash icon to the right edge)
  cardInfo: { flex: 1 },

  name: { fontSize: 18, fontWeight: "600" }, // Semi-bold pet name
  detail: { fontSize: 14, color: "#888", marginTop: 4 }, // Gray subtitle text

  // Empty state — centered vertically and horizontally
  empty: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { fontSize: 20, fontWeight: "600", color: "#999", marginTop: 12 },
  emptySubtext: { fontSize: 14, color: "#bbb", marginTop: 4 },

  // Floating Action Button — the blue "+" circle
  fab: {
    position: "absolute", // Takes it out of normal layout, positions relative to container
    bottom: 24, // 24px from the bottom of the screen
    right: 24, // 24px from the right edge
    width: 56,
    height: 56,
    borderRadius: 28, // Half of width/height = perfect circle
    backgroundColor: "#007aff", // Apple blue
    justifyContent: "center", // Center the "+" icon vertically
    alignItems: "center", // Center the "+" icon horizontally
    // Blue shadow under the button for depth effect
    shadowColor: "#007aff",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
});
