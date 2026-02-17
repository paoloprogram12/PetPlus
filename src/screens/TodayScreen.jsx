// ============================================================
// TodayScreen.jsx — The "Today" screen.
//
// What this screen does:
//   - Shows a calendar date strip at the top with a week of dates
//   - Users can navigate weeks with < > arrows
//   - Shows all care tasks that were logged on the selected date
//   - Each task has a checkbox to mark it as done/undone
//   - Shows the care type icon, label, pet name, and optional note
//   - Completed tasks get a strikethrough and green checkmark
//   - Shows an empty state if no tasks were logged on the selected date
//
// This screen is the third tab in the bottom tab bar.
// ============================================================

// --- React Imports ---
import { useCallback, useState } from "react";

// --- React Native UI Components ---
import {
  View, // Container for layout
  Text, // Displays text
  TouchableOpacity, // Tappable button (used for the checkbox)
  FlatList, // Scrollable list for the tasks
  StyleSheet, // For creating styles
} from "react-native";

// Ionicons: Icons for checkmarks, care type icons, etc.
import { Ionicons } from "@expo/vector-icons";

// useFocusEffect: Runs code every time this screen becomes visible.
import { useFocusEffect } from "@react-navigation/native";

// --- Data Imports ---
import {
  loadPets, // Load all pets (we need pet names to display)
  loadTasks, // Load ALL tasks from storage
  saveTasks, // Save ALL tasks to storage (after toggling)
  filterTasksByDate, // Filter tasks for a specific date
  CARE_TYPES, // Care type options (to look up icons and labels)
} from "../store/PetStore";

// ============================================================
// Date helpers for the calendar strip
// ============================================================

// DAY_LABELS: Short day names for the calendar strip
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// MONTH_NAMES: Full month names for the header
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// getMonday: Returns the Monday of the week containing the given date.
// We use Monday as the start of the week for the calendar strip.
function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const diff = day === 0 ? -6 : 1 - day; // If Sunday, go back 6 days; otherwise go back to Monday
  d.setDate(d.getDate() + diff);
  // Zero out time so comparisons work cleanly
  d.setHours(0, 0, 0, 0);
  return d;
}

// getWeekDays: Returns an array of 7 Date objects (Mon–Sun) for the
// week containing the given date.
function getWeekDays(date) {
  const monday = getMonday(date);
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push(d);
  }
  return days;
}

// isSameDay: Checks if two dates are the same calendar day.
function isSameDay(a, b) {
  return a.toDateString() === b.toDateString();
}

// ============================================================
// TodayScreen Component
// ============================================================
export default function TodayScreen() {
  // --- State ---

  // selectedDate: The date the user has selected on the calendar strip.
  // Defaults to today. Tasks are filtered by this date.
  const [selectedDate, setSelectedDate] = useState(new Date());

  // dateTasks: Only the tasks for the selected date (filtered).
  // This is what we display in the list.
  const [dateTasks, setDateTasks] = useState([]);

  // allTasks: ALL tasks ever created (including past days).
  // We need this because when we toggle a task, we need to save
  // the ENTIRE tasks array back to storage, not just today's.
  const [allTasks, setAllTasks] = useState([]);

  // pets: All pets — we need this to look up pet names.
  // Tasks only store a petId, so we need the pets array to find
  // the pet's name for display.
  const [pets, setPets] = useState([]);

  // --- Derived values ---
  // The 7 days (Mon–Sun) of the week containing selectedDate
  const weekDays = getWeekDays(selectedDate);
  // The month name to display above the calendar strip
  const monthName = MONTH_NAMES[selectedDate.getMonth()];
  // The year (shown next to month if it's not the current year)
  const year = selectedDate.getFullYear();
  const currentYear = new Date().getFullYear();

  // --- Load data when screen comes into focus ---
  // Every time the user switches to this tab, we reload everything.
  // Promise.all runs both loads in parallel (at the same time) for speed.
  useFocusEffect(
    useCallback(() => {
      async function load() {
        // Load pets and tasks at the same time using Promise.all.
        // This is faster than loading them one after the other.
        // The result is an array: [pets, tasks]
        const [loadedPets, loadedTasks] = await Promise.all([
          loadPets(),
          loadTasks(),
        ]);
        setPets(loadedPets);
        setAllTasks(loadedTasks);
        // Filter to only show tasks for the selected date
        setDateTasks(filterTasksByDate(loadedTasks, selectedDate));
      }
      load();
    }, [selectedDate])
  );

  // --- Navigate week backward ---
  function goBackWeek() {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 7);
    setSelectedDate(newDate);
  }

  // --- Navigate week forward ---
  function goForwardWeek() {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 7);
    setSelectedDate(newDate);
  }

  // --- Select a specific day ---
  function selectDay(date) {
    setSelectedDate(date);
    setDateTasks(filterTasksByDate(allTasks, date));
  }

  // --- Toggle Task Completion ---
  // Called when the user taps the checkbox circle.
  // Flips isCompleted between true and false.
  async function toggleTask(taskId) {
    // .map() creates a NEW array where the matching task has its
    // isCompleted flipped. All other tasks stay the same.
    //
    // The spread operator { ...t } copies all properties of the task,
    // then isCompleted: !t.isCompleted overwrites just that one field.
    const updated = allTasks.map((t) =>
      t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t
    );

    // Save the updated array to storage
    await saveTasks(updated);

    // Update both state variables so the screen re-renders
    setAllTasks(updated);
    setDateTasks(filterTasksByDate(updated, selectedDate));
  }

  // --- Helper: Get pet name from pet ID ---
  // Tasks store a petId, not the pet name.
  // This function looks up the pet by ID and returns its name.
  function getPetName(petId) {
    const pet = pets.find((p) => p.id === petId);
    return pet ? pet.name : "Unknown"; // Fallback if pet was deleted
  }

  // --- Helper: Get care type icon name from care type key ---
  // Looks up the icon name (e.g. "fast-food-outline") from the CARE_TYPES array.
  function getCareIcon(careType) {
    const ct = CARE_TYPES.find((c) => c.key === careType);
    return ct ? ct.icon : "help-outline"; // Fallback icon
  }

  // --- Helper: Get care type display label from care type key ---
  // Converts "feeding" → "Feeding", "walk" → "Walk", etc.
  function getCareLabel(careType) {
    const ct = CARE_TYPES.find((c) => c.key === careType);
    return ct ? ct.label : careType; // Fallback to the raw key
  }

  // --- Render a single task card ---
  // Called by FlatList for each task in dateTasks.
  function renderTask({ item }) {
    return (
      <View style={styles.card}>
        {/* --- Checkbox (left side) --- */}
        {/* Tapping this toggles the task between done and not done.
            Shows a green filled circle when done, gray empty circle when not. */}
        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => toggleTask(item.id)}
        >
          <Ionicons
            name={
              item.isCompleted
                ? "checkmark-circle" // Filled green circle with checkmark
                : "ellipse-outline" // Empty gray circle
            }
            size={28}
            color={item.isCompleted ? "#34c759" : "#ccc"} // Green when done, gray when not
          />
        </TouchableOpacity>

        {/* --- Task info (middle) --- */}
        <View style={styles.taskInfo}>
          {/* Care type label — gets a strikethrough when completed */}
          <Text
            style={[styles.taskTitle, item.isCompleted && styles.taskDone]}
            // [styles.taskTitle, item.isCompleted && styles.taskDone] means:
            // "always apply taskTitle style, and ALSO apply taskDone
            // (strikethrough + gray color) if the task is completed"
          >
            {getCareLabel(item.careType)}
          </Text>

          {/* Pet name */}
          <Text style={styles.taskPet}>{getPetName(item.petId)}</Text>

          {/* Optional note — only shown if the user typed one */}
          {/* The pattern {condition ? <Component /> : null} means:
              "show this component if condition is true, otherwise show nothing" */}
          {item.note ? <Text style={styles.taskNote}>{item.note}</Text> : null}
        </View>

        {/* --- Care type icon (right side) --- */}
        <Ionicons
          name={getCareIcon(item.careType)}
          size={22}
          color="#ffaa00"
        />
      </View>
    );
  }

  // ============================================================
  // SCREEN LAYOUT
  // ============================================================
  return (
    <View style={styles.container}>
      {/* ========== Calendar Date Strip ========== */}
      <View style={styles.calendarStrip}>
        {/* Month name header */}
        <Text style={styles.monthLabel}>
          {monthName}{year !== currentYear ? ` ${year}` : ""}
        </Text>

        {/* Week row: < [Mon] [Tue] ... [Sun] > */}
        <View style={styles.weekRow}>
          {/* Left arrow — go back one week */}
          <TouchableOpacity onPress={goBackWeek} style={styles.arrow}>
            <Ionicons name="chevron-back" size={22} color="#333" />
          </TouchableOpacity>

          {/* Day cells */}
          {weekDays.map((day, index) => {
            const isSelected = isSameDay(day, selectedDate);
            const isToday = isSameDay(day, new Date());
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayCell,
                  isSelected && styles.dayCellSelected,
                ]}
                onPress={() => selectDay(day)}
              >
                <Text style={[
                  styles.dayNumber,
                  isSelected && styles.dayTextSelected,
                ]}>
                  {day.getDate()}
                </Text>
                <Text style={[
                  styles.dayName,
                  isSelected && styles.dayTextSelected,
                  isToday && !isSelected && styles.dayToday,
                ]}>
                  {DAY_LABELS[index]}
                </Text>
              </TouchableOpacity>
            );
          })}

          {/* Right arrow — go forward one week */}
          <TouchableOpacity onPress={goForwardWeek} style={styles.arrow}>
            <Ionicons name="chevron-forward" size={22} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ========== Task List or Empty State ========== */}
      {/* Show empty state or the task list */}
      {dateTasks.length === 0 ? (
        // --- Empty state: no tasks on the selected date ---
        <View style={styles.empty}>
          <Ionicons name="checkmark-done-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No tasks this day</Text>
          <Text style={styles.emptySubtext}>
            Log some care in the Log Care tab
          </Text>
        </View>
      ) : (
        // --- Task list ---
        <FlatList
          data={dateTasks} // Only the selected date's tasks
          keyExtractor={(item) => item.id} // Unique key for each task
          renderItem={renderTask} // Function to render each task card
          contentContainerStyle={styles.list} // Padding around the list
        />
      )}
    </View>
  );
}

// ============================================================
// STYLES
// ============================================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  list: { padding: 16 },

  // ---- Calendar Strip ----
  calendarStrip: {
    backgroundColor: "#fff",
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  monthLabel: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  weekRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  arrow: {
    padding: 6,
  },
  dayCell: {
    alignItems: "center",
    justifyContent: "center",
    width: 42,
    paddingVertical: 6,
    borderRadius: 10,
    marginHorizontal: 1,
  },
  dayCellSelected: {
    backgroundColor: "#ffaa00",
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  dayName: {
    fontSize: 11,
    color: "#888",
    marginTop: 2,
  },
  dayTextSelected: {
    color: "#fff",
  },
  dayToday: {
    color: "#ffaa00",
    fontWeight: "600",
  },

  // Empty state
  empty: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { fontSize: 20, fontWeight: "600", color: "#999", marginTop: 12 },
  emptySubtext: { fontSize: 14, color: "#bbb", marginTop: 4 },

  // Task card — horizontal layout: [checkbox] [info] [icon]
  card: {
    flexDirection: "row", // Lay out children horizontally
    alignItems: "center", // Vertically center everything
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    // Subtle shadow
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  // Space between checkbox and text
  checkbox: { marginRight: 12 },

  // flex: 1 makes the info section expand to fill available space
  // (pushes the care type icon to the right edge)
  taskInfo: { flex: 1 },

  // Task title (e.g. "Feeding")
  taskTitle: { fontSize: 17, fontWeight: "600" },

  // When task is done: strikethrough text + gray color
  taskDone: { textDecorationLine: "line-through", color: "#999" },

  // Pet name below the title
  taskPet: { fontSize: 14, color: "#888", marginTop: 2 },

  // Optional note below the pet name
  taskNote: { fontSize: 13, color: "#aaa", marginTop: 2 },
});
