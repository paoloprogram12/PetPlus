// ============================================================
// PetStore.js — The data layer of the PetPlus app.
//
// This file is responsible for:
//   1. Defining the SHAPE of our data (what a Pet and CareTask look like)
//   2. Saving and loading data to/from the device (AsyncStorage)
//   3. Providing helper functions that screens use to create and filter data
//
// Think of this as the "database" of the app. Every screen imports
// functions from here instead of managing storage on their own.
// ============================================================

// AsyncStorage: React Native's equivalent of localStorage on the web.
// It stores data as key-value pairs on the device's storage.
// Data persists even after closing the app — it's only lost if the
// user deletes the app or clears the app's data.
import AsyncStorage from "@react-native-async-storage/async-storage";

// ============================================================
// DATA SHAPES (for reference)
//
// Pet: { id, name, type, age }
//   - id: string — Unique identifier
//   - name: string — The pet's name (e.g. "Buddy")
//   - type: string — What kind of animal (e.g. "Dog", "Cat", "Bird")
//   - age: number — Age in years
//
// CareTask: { id, petId, careType, note, date, isCompleted }
//   - id: string — Unique identifier for this task
//   - petId: string — Which pet this task is for (matches a Pet's id)
//   - careType: string — What kind of care ("feeding", "walk", or "medication")
//   - note: string — Optional note the user can add
//   - date: string — When this task was created (ISO date string)
//   - isCompleted: boolean — Whether the user has marked this task as done
//
// CareTypeOption: { key, label, icon }
//   - key: string — Internal identifier (e.g. "feeding")
//   - label: string — Display text (e.g. "Feeding")
//   - icon: string — Ionicons icon name (e.g. "fast-food-outline")
// ============================================================

// ============================================================
// CONSTANTS
//
// These are fixed values that never change while the app runs.
// ============================================================

// Storage keys — these are the "names" we use to store and retrieve
// data from AsyncStorage. Think of them like file names in a folder.
// When we save pets, we save them under the key "pets".
// When we save tasks, we save them under the key "careTasks".
const PETS_KEY = "pets";
const TASKS_KEY = "careTasks";

// CARE_TYPES: The three types of care a user can log.
// Each has a key (used in code), a label (shown to user), and an icon.
// This array is used by LogCareScreen to show the care type picker
// and by TodayScreen to display the right icon and label for each task.
export const CARE_TYPES = [
  { key: "feeding", label: "Feeding", icon: "fast-food-outline" },
  { key: "walk", label: "Walk", icon: "walk-outline" },
  { key: "medication", label: "Medication", icon: "medkit-outline" },
];

// PET_TYPES: The list of animal types shown when adding a new pet.
// Used by AddPetScreen to render the type selection chips.
export const PET_TYPES = [
  "Dog",
  "Cat",
  "Bird",
  "Fish",
  "Rabbit",
  "Hamster",
  "Other",
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

// generateId: Creates a unique string ID for each new pet or task.
// It combines the current timestamp with a random number so that
// every ID is different, even if two are created at the same time.
//
// Example output: "m3k7x9a_8f2jd4k"
//
// This is NOT exported — it's only used internally by createPet and createTask.
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

// ============================================================
// PET OPERATIONS
//
// These functions handle saving, loading, and creating pets.
// They are "async" because reading/writing to AsyncStorage takes
// time (it's like reading/writing to a file on disk).
// ============================================================

// loadPets: Reads all saved pets from the device.
// Returns an array of Pet objects, or an empty array if none exist yet.
//
// How it works:
//   1. Ask AsyncStorage for the data stored under the "pets" key
//   2. If data exists, parse it from a JSON string back into an array
//   3. If no data exists (first time opening the app), return []
export async function loadPets() {
  const data = await AsyncStorage.getItem(PETS_KEY);
  return data ? JSON.parse(data) : [];
}

// savePets: Saves the entire pets array to the device.
// This OVERWRITES all previously saved pets with the new array.
//
// JSON.stringify converts the array of objects into a string,
// because AsyncStorage can only store strings (not objects directly).
export async function savePets(pets) {
  await AsyncStorage.setItem(PETS_KEY, JSON.stringify(pets));
}

// createPet: Creates a new Pet object with a unique ID.
// Does NOT save it — the screen that calls this is responsible
// for adding it to the array and calling savePets().
//
// Example: createPet("Buddy", "Dog", 3)
// Returns: { id: "m3k7x9a", name: "Buddy", type: "Dog", age: 3 }
export function createPet(name, type, age) {
  return { id: generateId(), name, type, age };
}

// ============================================================
// TASK OPERATIONS
//
// Same pattern as pets — load, save, and create care tasks.
// ============================================================

// loadTasks: Reads all saved care tasks from the device.
// Returns every task ever created (not just today's).
export async function loadTasks() {
  const data = await AsyncStorage.getItem(TASKS_KEY);
  return data ? JSON.parse(data) : [];
}

// saveTasks: Saves the entire tasks array to the device.
export async function saveTasks(tasks) {
  await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

// createTask: Creates a new CareTask object with:
//   - A unique ID
//   - The current date/time (so we know it was created today)
//   - isCompleted set to false (it's a new task, not done yet)
//
// Example: createTask("abc123", "feeding", "2 cups of kibble")
// Returns: { id: "xyz789", petId: "abc123", careType: "feeding",
//            note: "2 cups of kibble", date: "2026-02-05T10:30:00.000Z",
//            isCompleted: false }
export function createTask(petId, careType, note) {
  return {
    id: generateId(),
    petId,
    careType,
    note,
    date: new Date().toISOString(), // Current date/time in ISO format
    isCompleted: false,
  };
}

// filterTodayTasks: Takes ALL tasks and returns only the ones created today.
// Used by TodayScreen to show just today's tasks (not yesterday's or older).
//
// How it works:
//   1. Get today's date as a string (e.g. "Wed Feb 05 2026")
//   2. Filter the tasks array — keep only tasks whose date matches today
//   3. We compare using .toDateString() which ignores the time portion,
//      so a task created at 9am and one at 5pm both count as "today"
export function filterTodayTasks(tasks) {
  const today = new Date().toDateString();
  return tasks.filter((task) => new Date(task.date).toDateString() === today);
}

// filterTasksByDate: Takes ALL tasks and a Date object, returns only
// tasks created on that specific date.
// Used by TodayScreen's calendar strip to show tasks from any selected date.
export function filterTasksByDate(tasks, date) {
  const target = date.toDateString();
  return tasks.filter((task) => new Date(task.date).toDateString() === target);
}
