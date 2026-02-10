import AsyncStorage from "@react-native-async-storage/async-storage";

// --- Types ---

export interface Pet {
  id: string;
  name: string;
  type: string;
  age: number;
}

export interface CareTask {
  id: string;
  petId: string;
  careType: string;
  note: string;
  date: string;
  isCompleted: boolean;
}

export interface CareTypeOption {
  key: string;
  label: string;
  icon: string;
}

// --- Constants ---

const PETS_KEY = "pets";
const TASKS_KEY = "careTasks";

export const CARE_TYPES: CareTypeOption[] = [
  { key: "feeding", label: "Feeding", icon: "fast-food-outline" },
  { key: "walk", label: "Walk", icon: "walk-outline" },
  { key: "medication", label: "Medication", icon: "medkit-outline" },
];

export const PET_TYPES: string[] = [
  "Dog",
  "Cat",
  "Bird",
  "Fish",
  "Rabbit",
  "Hamster",
  "Other",
];

// --- Helpers ---

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

// --- Pet operations ---

export async function loadPets(): Promise<Pet[]> {
  const data = await AsyncStorage.getItem(PETS_KEY);
  return data ? JSON.parse(data) : [];
}

export async function savePets(pets: Pet[]): Promise<void> {
  await AsyncStorage.setItem(PETS_KEY, JSON.stringify(pets));
}

export function createPet(name: string, type: string, age: number): Pet {
  return { id: generateId(), name, type, age };
}

// --- Task operations ---

export async function loadTasks(): Promise<CareTask[]> {
  const data = await AsyncStorage.getItem(TASKS_KEY);
  return data ? JSON.parse(data) : [];
}

export async function saveTasks(tasks: CareTask[]): Promise<void> {
  await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

export function createTask(petId: string, careType: string, note: string): CareTask {
  return {
    id: generateId(),
    petId,
    careType,
    note,
    date: new Date().toISOString(),
    isCompleted: false,
  };
}

export function filterTodayTasks(tasks: CareTask[]): CareTask[] {
  const today = new Date().toDateString();
  return tasks.filter((task) => new Date(task.date).toDateString() === today);
}
