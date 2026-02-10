import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { loadPets, savePets, createPet, PET_TYPES } from "../store/PetStore";

export default function AddPetScreen() {
  const navigation = useNavigation();
  const [name, setName] = useState<string>("");
  const [type, setType] = useState<string>("Dog");
  const [age, setAge] = useState<string>("1");

  async function handleSave(): Promise<void> {
    if (!name.trim()) return;
    const pets = await loadPets();
    const newPet = createPet(name.trim(), type, parseInt(age) || 0);
    pets.push(newPet);
    await savePets(pets);
    navigation.goBack();
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Pet Name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="e.g. Buddy"
      />

      <Text style={styles.label}>Type</Text>
      <View style={styles.typeRow}>
        {PET_TYPES.map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.typeChip, type === t && styles.typeChipSelected]}
            onPress={() => setType(t)}
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

      <Text style={styles.label}>Age</Text>
      <View style={styles.ageRow}>
        <TouchableOpacity
          style={styles.ageButton}
          onPress={() => setAge(String(Math.max(0, (parseInt(age) || 0) - 1)))}
        >
          <Text style={styles.ageButtonText}>-</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.ageInput}
          value={age}
          onChangeText={setAge}
          keyboardType="number-pad"
          textAlign="center"
        />
        <TouchableOpacity
          style={styles.ageButton}
          onPress={() => setAge(String((parseInt(age) || 0) + 1))}
        >
          <Text style={styles.ageButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.saveButton, !name.trim() && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={!name.trim()}
      >
        <Text style={styles.saveButtonText}>Save Pet</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  content: { padding: 20 },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 16,
    color: "#333",
  },
  input: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  typeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  typeChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  typeChipSelected: {
    backgroundColor: "#007aff",
    borderColor: "#007aff",
  },
  typeChipText: { fontSize: 14, color: "#333" },
  typeChipTextSelected: { color: "#fff", fontWeight: "600" },
  ageRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  ageButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#007aff",
    justifyContent: "center",
    alignItems: "center",
  },
  ageButtonText: { color: "#fff", fontSize: 22, fontWeight: "600" },
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
  saveButton: {
    backgroundColor: "#007aff",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 32,
  },
  saveButtonDisabled: { opacity: 0.4 },
  saveButtonText: { color: "#fff", fontSize: 17, fontWeight: "600" },
});
