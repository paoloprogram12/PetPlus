import { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ListRenderItemInfo,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Pet, loadPets, savePets } from "../store/PetStore";

type PetStackParamList = {
  PetList: undefined;
  AddPet: undefined;
};

export default function PetListScreen() {
  const [pets, setPets] = useState<Pet[]>([]);
  const navigation = useNavigation<NativeStackNavigationProp<PetStackParamList>>();

  useFocusEffect(
    useCallback(() => {
      loadPets().then(setPets);
    }, [])
  );

  function handleDelete(pet: Pet) {
    Alert.alert("Delete Pet", `Remove ${pet.name}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const updated = pets.filter((p) => p.id !== pet.id);
          await savePets(updated);
          setPets(updated);
        },
      },
    ]);
  }

  function renderPet({ item }: ListRenderItemInfo<Pet>) {
    return (
      <View style={styles.card}>
        <View style={styles.cardInfo}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.detail}>
            {item.type} • {item.age} years old
          </Text>
        </View>
        <TouchableOpacity onPress={() => handleDelete(item)}>
          <Ionicons name="trash-outline" size={22} color="#ff3b30" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {pets.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="paw-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No pets yet</Text>
          <Text style={styles.emptySubtext}>Tap + to add your first pet</Text>
        </View>
      ) : (
        <FlatList
          data={pets}
          keyExtractor={(item) => item.id}
          renderItem={renderPet}
          contentContainerStyle={styles.list}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("AddPet")}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  list: { padding: 16 },
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
  cardInfo: { flex: 1 },
  name: { fontSize: 18, fontWeight: "600" },
  detail: { fontSize: 14, color: "#888", marginTop: 4 },
  empty: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { fontSize: 20, fontWeight: "600", color: "#999", marginTop: 12 },
  emptySubtext: { fontSize: 14, color: "#bbb", marginTop: 4 },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#007aff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#007aff",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
});
