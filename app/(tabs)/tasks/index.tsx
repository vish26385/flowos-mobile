import {
  Pressable,
  View,
  FlatList,
  RefreshControl,
  StyleSheet,
  Platform,
} from "react-native";
import React, { useMemo, useState, useCallback } from "react";
import {
  Searchbar,
  ActivityIndicator,
  useTheme,
  Chip,
  SegmentedButtons,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import { useTasks } from "@/context/TaskContext";
import TaskItem from "@/app/_components/tasks/TaskItem";
import EmptyState from "@/app/_components/tasks/EmptyState";
import QuickAddModal from "@/app/_components/tasks/QuickAddModal";

type SortKey = "date" | "priority";

export default function Tasks() {
  const theme = useTheme();
  const { tasks, isLoading, refetch, updateTask, deleteTask, addTask } = useTasks();
  
  const [query, setQuery] = useState("");
  const [showCompleted, setShowCompleted] = useState(true);
  const [sortBy, setSortBy] = useState<SortKey>("date");
  const [quickAddVisible, setQuickAddVisible] = useState(false);

  // ✅ Filter + Sort
  const filteredTasks = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = (tasks || []).slice();

    if (q) list = list.filter((t) => t.title.toLowerCase().includes(q));
    if (!showCompleted) list = list.filter((t) => !t.completed);

    list.sort((a, b) => {
      if (sortBy === "priority") return b.priority - a.priority;
      const aTime = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
      const bTime = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
      return aTime - bTime;
    });
    return list;
  }, [tasks, query, showCompleted, sortBy]);

  // ✅ FAB Gradient
  const fabGradient = theme.dark ? ["#7C4DFF", "#7C4DFF"] : ["#7C4DFF", "#7C4DFF"];

  // ✅ Handle Quick Add
  const handleQuickAdd = useCallback(
    async (title: string, priority: number) => {
      try {
        // call context or API method
        if (addTask) {
          await addTask({
            title,
            description: "",
            priority,
            completed: false,
            dueDate: new Date().toISOString(),
          });
        }
        refetch(); // refresh list
      } catch (err) {
        console.error("❌ Quick add failed:", err);
      }
    },
    [addTask, refetch]
  );

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: theme.colors.background }]}
      edges={["top", "left", "right", "bottom"]}
    >
      <StatusBar style="light" backgroundColor="#6F45FF" />

      {/* Searchbar */}
      <Searchbar
        value={query}
        onChangeText={setQuery}
        placeholder="Search tasks…"
        style={[
          styles.search,
          {
            backgroundColor: theme.colors.surfaceVariant,
            borderColor: theme.colors.outlineVariant,
          },
        ]}
        inputStyle={{ color: theme.colors.onSurface, fontSize: 16 }}
        iconColor={theme.colors.primary}
        placeholderTextColor={theme.colors.onSurfaceVariant}
      />

      {/* ✅ Unified Horizontal Controls */}
      <View style={styles.controlBar}>
        <Chip
          selected={!showCompleted}
          onPress={() => setShowCompleted((v) => !v)}
          style={[
            styles.controlChip,
            {
              backgroundColor: showCompleted
                ? theme.colors.surfaceVariant
                : theme.colors.primary,
            },
          ]}
          textStyle={{
            color: showCompleted
              ? theme.colors.onSurfaceVariant
              : theme.colors.onPrimary,
            fontWeight: "600",
          }}
        >
          {showCompleted ? "Hide Completed" : "Show Completed"}
        </Chip>

        <View style={{ flex: 1 }}>
          <SegmentedButtons
            value={sortBy}
            onValueChange={(val) => setSortBy(val as SortKey)}
            buttons={[
              { value: "date", label: "Date" },
              { value: "priority", label: "Priority" },
            ]}
            style={styles.segmentButtons}
          />
        </View>
      </View>

      {/* Task list */}
      {isLoading ? (
        <ActivityIndicator
          animating
          color={theme.colors.primary}
          size="large"
          style={{ marginTop: 48 }}
        />
      ) : (
        <FlatList
          data={filteredTasks}
          keyExtractor={(t) => String(t.id)}
          renderItem={({ item, index }) => (
            <TaskItem
              item={item}
              index={index}
              onToggle={updateTask}
              onDelete={deleteTask}
            />
          )}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={refetch}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
          ListEmptyComponent={<EmptyState />}
          contentContainerStyle={{ paddingBottom: 120 }}
        />
      )}

      {/* ➕ Floating Action Button */}
      <View pointerEvents="box-none" style={styles.fabWrap}>
        <Pressable style={styles.fabOuter} onPress={() => setQuickAddVisible(true)}>
          <LinearGradient colors={fabGradient as [string, string]} style={styles.fabGradient}>
            <Ionicons name="add" size={40} color="#fff" />
          </LinearGradient>
        </Pressable>
      </View>

      {/* ⚡ Quick Add Modal */}
      <QuickAddModal
        visible={quickAddVisible}
        onDismiss={() => setQuickAddVisible(false)}
        onAdd={handleQuickAdd}
      />
      
    </SafeAreaView>
  );
}

const FAB_SIZE = 56;

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: 12 },
  search: {
    marginTop: 10,
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  controlBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  controlChip: {
    borderRadius: 20,
    paddingHorizontal: 10,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentButtons: { alignSelf: "flex-end", height: 40 },
  fabWrap: {
    position: "absolute",
    right: 22,
    bottom: 28 + (Platform.OS === "ios" ? 4 : 0),
  },
  fabOuter: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    elevation: 10,
    overflow: "hidden",
  },
  fabGradient: {
    flex: 1,
    borderRadius: FAB_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
  },
});