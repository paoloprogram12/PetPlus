// ============================================================
// AddPetScreen.tsx — The "Add Pet" form screen.
//
// What this screen does:
//   - Lets the user type a pet name
//   - Pick an animal type from chip buttons (Dog, Cat, Bird, etc.)
//   - Set the pet's age with +/- buttons or by typing
//   - Save the pet and go back to the pet list
//
// This screen is opened when the user taps the "+" button
// on the PetListScreen. It slides in from the right (stack navigation).
// ============================================================

// --- React Imports ---

// useState: Stores form data (name, type, age) that changes as the user types/taps.
import { useState } from "react";

// --- React Native UI Components ---
import {
  View, // Container for layout
  Text, // Displays text
  TextInput, // An input field the user can type into (like <input> in HTML)
  TouchableOpacity, // A tappable button with fade effect
  StyleSheet, // For creating styles
  ScrollView, // A scrollable container — used here in case the form is taller than the screen
} from "react-native";

// useNavigation: Gives us navigation.goBack() to return to the previous screen.
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";

// Data functions from our store
import { loadPets, savePets, createPet, PET_TYPES, Pet } from "../store/PetStore";


type AddPetParams = {
  AddPet: { pet: Pet } | undefined;
};

// ============================================================
// AddPetScreen Component
// ============================================================
export default function AddPetScreen() {
  // --- Navigation ---
  // We use this to call navigation.goBack() after saving the pet.
  const navigation = useNavigation();
  // gathers info from the current screen
  const route = useRoute<RouteProp<AddPetParams, "AddPet">>();
  // grabs the pet that was sent
  const editPet = route.params?.pet;

  // --- Form State ---
  // Each piece of form data is stored in its own useState.
  // When the user types or taps, we update the state,
  // and React automatically re-renders the screen.

  const [name, setName] = useState<string>(editPet?.name ?? ""); // Pet name — starts empty
  const [type, setType] = useState<string>(editPet?.type ?? "Dog"); // Pet type — defaults to "Dog"
  const [age, setAge] = useState<string>(editPet? String(editPet.age) : "1"); // Age as a STRING because TextInput works with strings

  // --- Save Handler ---
  // Called when the user taps the "Save Pet" button.
  // This is async because saving to AsyncStorage is an asynchronous operation.
  async function handleSave(): Promise<void> {
    // Guard: if the name is empty (or just spaces), don't save.
    // .trim() removes whitespace from both ends of the string.
    if (!name.trim()) return;

    // Step 1: Load the current pets array from storage
    const pets = await loadPets();

    if (editPet) {
      const index = pets.findIndex((p) => p.id === editPet.id);
      if (index !== -1) {
        pets[index] = { ...pets[index], name: name.trim(), type, age: parseInt(age) || 0 };
      }
    } else {
      const newPet = createPet(name.trim(), type, parseInt(age) || 0);
      pets.push(newPet);
    }


    // Step 4: Save the updated array back to storage
    await savePets(pets);

    // Step 5: Go back to the pet list screen.
    // The PetListScreen will reload pets via useFocusEffect and show the new pet.
    navigation.goBack();


  }

  // ============================================================
  // SCREEN LAYOUT
  // ============================================================
  return (
    // ScrollView: Makes the form scrollable if it's taller than the screen.
    // style: applies to the ScrollView container itself.
    // contentContainerStyle: applies to the CONTENT inside the scroll area.
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* --- Pet Name Input --- */}
      <Text style={styles.label}>Pet Name</Text>
      <TextInput
        style={styles.input}
        value={name} // Controlled input: the displayed value comes from state
        onChangeText={setName} // Every keystroke updates state → re-renders → shows new text
        placeholder="e.g. Buddy" // Gray placeholder text shown when the input is empty
      />

      {/* --- Pet Type Selector --- */}
      {/* We loop through PET_TYPES array and create a chip button for each type.
          .map() transforms each string in the array into a TouchableOpacity component. */}
      <Text style={styles.label}>Type</Text>
      <View style={styles.typeRow}>
        {PET_TYPES.map((t) => (
          <TouchableOpacity
            key={t} // React requires a unique "key" for each item in a list
            // Combine base style with selected style if this type is currently chosen.
            // [styleA, condition && styleB] means: "always apply styleA,
            // and also apply styleB if condition is true."
            style={[styles.typeChip, type === t && styles.typeChipSelected]}
            onPress={() => setType(t)} // When tapped, set this as the selected type
          >
            <Text
              style={[
                styles.typeChipText,
                type === t && styles.typeChipTextSelected,
              ]}
            >
              {t}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* --- Age Selector --- */}
      {/* A "-" button, a number input, and a "+" button side by side. */}
      <Text style={styles.label}>Age</Text>
      <View style={styles.ageRow}>
        {/* Minus button: decreases age by 1 (minimum 0) */}
        <TouchableOpacity
          style={styles.ageButton}
          onPress={() => setAge(String(Math.max(0, (parseInt(age) || 0) - 1)))}
          // Breakdown of the above:
          //   parseInt(age) → convert string to number
          //   || 0 → if parseInt fails, use 0
          //   - 1 → subtract 1
          //   Math.max(0, ...) → don't go below 0
          //   String(...) → convert back to string for the TextInput
        >
          <Text style={styles.ageButtonText}>-</Text>
        </TouchableOpacity>

        {/* Age input: user can also type the age directly */}
        <TextInput
          style={styles.ageInput}
          value={age}
          onChangeText={setAge}
          keyboardType="number-pad" // Shows only the number keyboard on the phone
          textAlign="center" // Center the number in the input box
        />

        {/* Plus button: increases age by 1 */}
        <TouchableOpacity
          style={styles.ageButton}
          onPress={() => setAge(String((parseInt(age) || 0) + 1))}
        >
          <Text style={styles.ageButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* --- Save Button --- */}
      {/* Disabled (faded out) when the name is empty.
          disabled={true} prevents the button from being tapped.
          The style array adds the "disabled" opacity when name is empty. */}
      <TouchableOpacity
        style={[styles.saveButton, !name.trim() && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={!name.trim()} // Can't tap if name is empty
      >
        <Text style={styles.saveButtonText}>Save Pet</Text>
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

  // Section labels ("Pet Name", "Type", "Age")
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8, // Space below the label
    marginTop: 16, // Space above the label (separates sections)
    color: "#333",
  },

  // Text input field
  input: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1, // 1px border
    borderColor: "#e0e0e0", // Light gray border
  },

  // Row of type chips — wraps to next line if they don't all fit
  typeRow: {
    flexDirection: "row", // Horizontal layout
    flexWrap: "wrap", // Wrap to next line if too wide
    gap: 8, // Space between chips
  },

  // Individual type chip (unselected state)
  typeChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20, // Pill shape
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },

  // Type chip when selected — blue background
  typeChipSelected: {
    backgroundColor: "#007aff",
    borderColor: "#007aff",
  },

  // Text inside chips
  typeChipText: { fontSize: 14, color: "#333" },
  typeChipTextSelected: { color: "#fff", fontWeight: "600" },

  // Age row: [ - ] [ input ] [ + ]
  ageRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  // +/- buttons — blue circles
  ageButton: {
    width: 44,
    height: 44,
    borderRadius: 22, // Perfect circle
    backgroundColor: "#007aff",
    justifyContent: "center",
    alignItems: "center",
  },
  ageButtonText: { color: "#fff", fontSize: 22, fontWeight: "600" },

  // Age number input
  ageInput: {
    backgroundColor: "#fff",
    width: 60,
    padding: 12,
    borderRadius: 10,
    fontSize: 18,
    fontWeight: "600",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },

  // Save button — full-width blue button
  saveButton: {
    backgroundColor: "#007aff",
    padding: 16,
    borderRadius: 12,
    alignItems: "center", // Center the text
    marginTop: 32, // Big gap above the button
  },

  // When disabled: makes the button semi-transparent (faded)
  saveButtonDisabled: { opacity: 0.4 },

  saveButtonText: { color: "#fff", fontSize: 17, fontWeight: "600" },
});
