import { useCallback, useState } from "react";
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ListRenderItemInfo } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import {
  Pet,
  CareTask,
  loadPets,
  loadTasks,
  saveTasks,
  filterTodayTasks,
  CARE_TYPES,
} from "../store/PetStore";

export default function TodayScreen() {
  const [todayTasks, setTodayTasks] = useState<CareTask[]>([]);
  const [allTasks, setAllTasks] = useState<CareTask[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);

  useFocusEffect(
    useCallback(() => {
      async function load() {
        const [loadedPets, loadedTasks] = await Promise.all([
          loadPets(),
          loadTasks(),
        ]);
        setPets(loadedPets);
        setAllTasks(loadedTasks);
        setTodayTasks(filterTodayTasks(loadedTasks));
      }
      load();
    }, [])
  );

  async function toggleTask(taskId: string): Promise<void> {
    const updated = allTasks.map((t) =>
      t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t
    );
    await saveTasks(updated);
    setAllTasks(updated);
    setTodayTasks(filterTodayTasks(updated));
  }

  function getPetName(petId: string): string {
    const pet = pets.find((p) => p.id === petId);
    return pet ? pet.name : "Unknown";
  }

  function getCareIcon(careType: string): string {
    const ct = CARE_TYPES.find((c) => c.key === careType);
    return ct ? ct.icon : "help-outline";
  }

  function getCareLabel(careType: string): string {
    const ct = CARE_TYPES.find((c) => c.key === careType);
    return ct ? ct.label : careType;
  }

  function renderTask({ item }: ListRenderItemInfo<CareTask>) {
    return (
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => toggleTask(item.id)}
        >
          <Ionicons
            name={
              item.isCompleted
                ? "checkmark-circle"
                : "ellipse-outline"
            }
            size={28}
            color={item.isCompleted ? "#34c759" : "#ccc"}
          />
        </TouchableOpacity>

        <View style={styles.taskInfo}>
          <Text
            style={[styles.taskTitle, item.isCompleted && styles.taskDone]}
          >
            {getCareLabel(item.careType)}
          </Text>
          <Text style={styles.taskPet}>{getPetName(item.petId)}</Text>
          {item.note ? <Text style={styles.taskNote}>{item.note}</Text> : null}
        </View>

        <Ionicons
          name={getCareIcon(item.careType) as keyof typeof Ionicons.glyphMap}
          size={22}
          color="#007aff"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {todayTasks.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="checkmark-done-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No tasks today</Text>
          <Text style={styles.emptySubtext}>
            Log some care in the Log Care tab
          </Text>
        </View>
      ) : (
        <FlatList
          data={todayTasks}
          keyExtractor={(item) => item.id}
          renderItem={renderTask}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  list: { padding: 16 },
  empty: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { fontSize: 20, fontWeight: "600", color: "#999", marginTop: 12 },
  emptySubtext: { fontSize: 14, color: "#bbb", marginTop: 4 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  checkbox: { marginRight: 12 },
  taskInfo: { flex: 1 },
  taskTitle: { fontSize: 17, fontWeight: "600" },
  taskDone: { textDecorationLine: "line-through", color: "#999" },
  taskPet: { fontSize: 14, color: "#888", marginTop: 2 },
  taskNote: { fontSize: 13, color: "#aaa", marginTop: 2 },
});
