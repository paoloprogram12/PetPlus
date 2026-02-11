// ============================================================
// LogCareScreen.tsx — The "Log Care" screen.
//
// What this screen does:
//   - Shows all pets as selectable chip buttons
//   - Lets the user pick a care type (Feeding, Walk, Medication)
//   - Lets the user add an optional note
//   - Saves the care task with today's date when "Log Care" is tapped
//   - Shows an empty state if no pets exist yet
//
// This screen is the second tab in the bottom tab bar.
// ============================================================

// --- React Imports ---

// useCallback: Wraps a function to avoid recreating it on every render.
// useState: Creates state variables that trigger re-renders when updated.
import { useCallback, useState } from "react";

// --- React Native UI Components ---
import {
  View, // Container for layout
  Text, // Displays text
  TextInput, // Input field for the note
  TouchableOpacity, // Tappable button with fade effect
  StyleSheet, // For creating styles
  Alert, // Native popup dialog — used to confirm the task was saved
  ScrollView, // Scrollable container for the form
} from "react-native";

// Ionicons: Icon library for the care type icons (food, walk, medkit)
import { Ionicons } from "@expo/vector-icons";

// useFocusEffect: Runs code every time this screen becomes visible.
// We need this to reload the pet list when the user switches to this tab.
import { useFocusEffect } from "@react-navigation/native";

// --- Data Imports ---
import {
  Pet, // TypeScript type for pet objects
  loadPets, // Load all pets from storage
  loadTasks, // Load all tasks from storage
  saveTasks, // Save all tasks to storage
  createTask, // Create a new CareTask object
  CARE_TYPES, // Array of care type options: feeding, walk, medication
} from "../store/PetStore";

// ============================================================
// LogCareScreen Component
// ============================================================
export default function LogCareScreen() {
  // --- State ---

  // The list of all pets — loaded from storage when screen comes into focus.
  const [pets, setPets] = useState<Pet[]>([]);

  // Which pet is currently selected. "string | null" means it can be
  // a pet's ID string, or null if no pet is selected yet.
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);

  // Which care type is selected. Defaults to "feeding".
  const [careType, setCareType] = useState<string>("feeding");

  // The optional note text. Starts empty.
  const [note, setNote] = useState<string>("");

  // --- Load pets when screen comes into focus ---
  // Every time the user switches to this tab, we reload the pets
  // in case they added a new one on the Pets tab.
  useFocusEffect(
    useCallback(() => {
      loadPets().then((loaded) => {
        setPets(loaded);
        // Auto-select the first pet if nothing is selected yet.
        // This prevents the user from having to manually tap a pet
        // every time they open this screen.
        if (loaded.length > 0 && !selectedPetId) {
          setSelectedPetId(loaded[0].id);
        }
      });
    }, [])
  );

  // --- Log Care Handler ---
  // Called when the user taps "Log Care".
  async function handleLog(): Promise<void> {
    // Guard: can't log care if no pet is selected
    if (!selectedPetId) return;

    // Step 1: Load existing tasks from storage
    const tasks = await loadTasks();

    // Step 2: Create a new task with the selected pet, care type, and note.
    // createTask() automatically adds today's date and sets isCompleted to false.
    const newTask = createTask(selectedPetId, careType, note.trim());

    // Step 3: Add the new task to the array
    tasks.push(newTask);

    // Step 4: Save all tasks back to storage
    await saveTasks(tasks);

    // Step 5: Clear the note field (so the form is ready for the next entry)
    setNote("");

    // Step 6: Show a confirmation popup
    Alert.alert("Saved!", "Care task logged for today.");
  }

  // --- Empty state ---
  // If there are no pets, show a message telling the user to add one first.
  // We return early here — the rest of the component doesn't render.
  if (pets.length === 0) {
    return (
      <View style={styles.empty}>
        <Ionicons name="paw-outline" size={64} color="#ccc" />
        <Text style={styles.emptyText}>Add a pet first</Text>
        <Text style={styles.emptySubtext}>
          Go to the My Pets tab to add one
        </Text>
      </View>
    );
  }

  // ============================================================
  // SCREEN LAYOUT (only shown when pets exist)
  // ============================================================
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* --- Pet Selector --- */}
      {/* Shows each pet as a chip button. The selected pet is highlighted blue. */}
      <Text style={styles.label}>Select Pet</Text>
      <View style={styles.chipRow}>
        {pets.map((pet) => (
          <TouchableOpacity
            key={pet.id}
            // Apply selected style if this pet is the currently selected one
            style={[
              styles.chip,
              selectedPetId === pet.id && styles.chipSelected,
            ]}
            onPress={() => setSelectedPetId(pet.id)} // Select this pet
          >
            <Text
              style={[
                styles.chipText,
                selectedPetId === pet.id && styles.chipTextSelected,
              ]}
            >
              {pet.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* --- Care Type Selector --- */}
      {/* Three chip buttons with icons: Feeding, Walk, Medication.
          These come from the CARE_TYPES constant in PetStore.ts */}
      <Text style={styles.label}>Care Type</Text>
      <View style={styles.chipRow}>
        {CARE_TYPES.map((ct) => (
          <TouchableOpacity
            key={ct.key}
            style={[
              styles.careChip,
              careType === ct.key && styles.careChipSelected,
            ]}
            onPress={() => setCareType(ct.key)} // Select this care type
          >
            {/* Icon for the care type.
                "as keyof typeof Ionicons.glyphMap" is a TypeScript cast
                that tells TS this string is a valid icon name. */}
            <Ionicons
              name={ct.icon as keyof typeof Ionicons.glyphMap}
              size={20}
              color={careType === ct.key ? "#fff" : "#333"}
            />
            <Text
              style={[
                styles.careChipText,
                careType === ct.key && styles.careChipTextSelected,
              ]}
            >
              {ct.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* --- Note Input --- */}
      <Text style={styles.label}>Note (optional)</Text>
      <TextInput
        style={styles.input}
        value={note}
        onChangeText={setNote}
        placeholder="e.g. Fed 2 cups of kibble"
      />

      {/* --- Log Care Button --- */}
      <TouchableOpacity style={styles.logButton} onPress={handleLog}>
        <Text style={styles.logButtonText}>Log Care</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ============================================================
// STYLES
// ============================================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  content: { padding: 20 },

  // Empty state
  empty: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { fontSize: 20, fontWeight: "600", color: "#999", marginTop: 12 },
  emptySubtext: { fontSize: 14, color: "#bbb", marginTop: 4 },

  // Section labels
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 16,
    color: "#333",
  },

  // Row of chips — horizontal, wraps to next line
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  // Pet selector chip (unselected)
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },

  // Pet selector chip (selected) — blue
  chipSelected: {
    backgroundColor: "#ffaa00",
    borderColor: "#ffaa00",
  },

  chipText: { fontSize: 14, color: "#333" },
  chipTextSelected: { color: "#fff", fontWeight: "600" },

  // Care type chip — has an icon + text side by side
  careChip: {
    flexDirection: "row", // Icon and text side by side
    alignItems: "center",
    gap: 6, // Space between icon and text
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },

  careChipSelected: {
    backgroundColor: "#ffaa00",
    borderColor: "#ffaa00",
  },

  careChipText: { fontSize: 14, color: "#333" },
  careChipTextSelected: { color: "#fff", fontWeight: "600" },

  // Note input field
  input: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },

  // Log Care button
  logButton: {
    backgroundColor: "#ffaa00",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 32,
  },
  logButtonText: { color: "#fff", fontSize: 17, fontWeight: "600" },
});
