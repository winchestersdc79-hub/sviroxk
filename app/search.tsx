import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { FlatList, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { TaskCard } from "@/components/TaskCard";
import { useColors } from "@/hooks/useColors";
import { TaskPriority, TaskQuadrant, useApp } from "@/contexts/AppContext";

const quadrantColors: Record<TaskQuadrant, string> = {
  urgentImportant: "#EF4444",
  notUrgentImportant: "#F59E0B",
  urgentNotImportant: "#22C55E",
  notUrgentNotImportant: "#6B7280",
};

type FilterType = "all" | TaskQuadrant | TaskPriority;

export default function SearchScreen() {
  const colors = useColors();
  const router = useRouter();
  const { state, completeTask } = useApp();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");

  const filters: { key: FilterType; label: string }[] = [
    { key: "all", label: "Все" },
    { key: "p1", label: "П1" },
    { key: "p2", label: "П2" },
    { key: "p3", label: "П3" },
    { key: "urgentImportant", label: "Срочные" },
    { key: "notUrgentImportant", label: "Важные" },
  ];

  const filteredTasks = useMemo(() => {
    let tasks = state.tasks;
    if (query.trim()) {
      const q = query.toLowerCase();
      tasks = tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    }
    if (filter !== "all") {
      if (["p1", "p2", "p3"].includes(filter)) {
        tasks = tasks.filter((t) => t.priority === filter);
      } else {
        tasks = tasks.filter((t) => t.quadrant === filter);
      }
    }
    return tasks;
  }, [state.tasks, query, filter]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: Platform.OS === "web" ? 67 : insets.top + 10 }]}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Поиск задач..."
            placeholderTextColor={colors.mutedForeground}
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery("")} hitSlop={8}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </Pressable>
          )}
        </View>
      </View>

      <View style={styles.filterRow}>
        {filters.map((f) => (
          <Pressable
            key={f.key}
            onPress={() => setFilter(f.key)}
            style={[styles.filterChip, { backgroundColor: filter === f.key ? `${colors.primary}20` : colors.card, borderColor: filter === f.key ? colors.primary : colors.border, borderWidth: 1 }]}
          >
            <Text style={[styles.filterText, { color: filter === f.key ? colors.primary : colors.mutedForeground }]}>{f.label}</Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        scrollEnabled={filteredTasks.length > 0}
        renderItem={({ item }) => (
          <TaskCard task={item} quadrantColor={quadrantColors[item.quadrant]} onComplete={() => completeTask(item.id)} onPress={() => {}} />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Feather name="search" size={32} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              {query ? "Задачи не найдены" : "Начни вводить для поиска"}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, gap: 12, paddingBottom: 12 },
  searchBar: { flex: 1, flexDirection: "row", alignItems: "center", borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, gap: 8, height: 42 },
  searchInput: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular", height: "100%" },
  filterRow: { flexDirection: "row", paddingHorizontal: 20, gap: 6, marginBottom: 12 },
  filterChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16 },
  filterText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  list: { paddingHorizontal: 20, paddingBottom: 40 },
  emptyState: { alignItems: "center", paddingVertical: 60, gap: 8 },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular" },
});
