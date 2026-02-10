import { useCallback, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import {
  Pet,
  loadPets,
  loadTasks,
  saveTasks,
  createTask,
  CARE_TYPES,
} from "../store/PetStore";

export default function LogCareScreen() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [careType, setCareType] = useState<string>("feeding");
  const [note, setNote] = useState<string>("");

  useFocusEffect(
    useCallback(() => {
      loadPets().then((loaded) => {
        setPets(loaded);
        if (loaded.length > 0 && !selectedPetId) {
          setSelectedPetId(loaded[0].id);
        }
      });
    }, [])
  );

  async function handleLog(): Promise<void> {
    if (!selectedPetId) return;
    const tasks = await loadTasks();
    const newTask = createTask(selectedPetId, careType, note.trim());
    tasks.push(newTask);
    await saveTasks(tasks);
    setNote("");
    Alert.alert("Saved!", "Care task logged for today.");
  }

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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Select Pet</Text>
      <View style={styles.chipRow}>
        {pets.map((pet) => (
          <TouchableOpacity
            key={pet.id}
            style={[
              styles.chip,
              selectedPetId === pet.id && styles.chipSelected,
            ]}
            onPress={() => setSelectedPetId(pet.id)}
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

      <Text style={styles.label}>Care Type</Text>
      <View style={styles.chipRow}>
        {CARE_TYPES.map((ct) => (
          <TouchableOpacity
            key={ct.key}
            style={[
              styles.careChip,
              careType === ct.key && styles.careChipSelected,
            ]}
            onPress={() => setCareType(ct.key)}
          >
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

      <Text style={styles.label}>Note (optional)</Text>
      <TextInput
        style={styles.input}
        value={note}
        onChangeText={setNote}
        placeholder="e.g. Fed 2 cups of kibble"
      />

      <TouchableOpacity style={styles.logButton} onPress={handleLog}>
        <Text style={styles.logButtonText}>Log Care</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  content: { padding: 20 },
  empty: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { fontSize: 20, fontWeight: "600", color: "#999", marginTop: 12 },
  emptySubtext: { fontSize: 14, color: "#bbb", marginTop: 4 },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 16,
    color: "#333",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  chipSelected: {
    backgroundColor: "#007aff",
    borderColor: "#007aff",
  },
  chipText: { fontSize: 14, color: "#333" },
  chipTextSelected: { color: "#fff", fontWeight: "600" },
  careChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  careChipSelected: {
    backgroundColor: "#007aff",
    borderColor: "#007aff",
  },
  careChipText: { fontSize: 14, color: "#333" },
  careChipTextSelected: { color: "#fff", fontWeight: "600" },
  input: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  logButton: {
    backgroundColor: "#007aff",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 32,
  },
  logButtonText: { color: "#fff", fontSize: 17, fontWeight: "600" },
});
