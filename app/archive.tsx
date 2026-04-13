import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React from "react";
import { FlatList, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { Task, TaskQuadrant, useApp } from "@/contexts/AppContext";

const quadrantColors: Record<TaskQuadrant, string> = {
  urgentImportant: "#EF4444",
  notUrgentImportant: "#F59E0B",
  urgentNotImportant: "#22C55E",
  notUrgentNotImportant: "#6B7280",
};

export default function ArchiveScreen() {
  const colors = useColors();
  const router = useRouter();
  const { state, restoreTask, deleteArchivedTask } = useApp();
  const insets = useSafeAreaInsets();

  const renderItem = ({ item }: { item: Task }) => (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <View style={[styles.leftBar, { backgroundColor: quadrantColors[item.quadrant] }]} />
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={1}>{item.title}</Text>
        {item.completedAt && (
          <Text style={[styles.date, { color: colors.mutedForeground }]}>
            Выполнено {new Date(item.completedAt).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}
          </Text>
        )}
      </View>
      <View style={styles.actions}>
        <Pressable
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); restoreTask(item.id); }}
          hitSlop={8}
          style={[styles.actionBtn, { backgroundColor: `${colors.primary}15` }]}
        >
          <Feather name="rotate-ccw" size={14} color={colors.primary} />
        </Pressable>
        <Pressable
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); deleteArchivedTask(item.id); }}
          hitSlop={8}
          style={[styles.actionBtn, { backgroundColor: `${colors.destructive}15` }]}
        >
          <Feather name="trash-2" size={14} color={colors.destructive} />
        </Pressable>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: Platform.OS === "web" ? 67 : insets.top + 10 }]}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Архив</Text>
        <View style={{ width: 22 }} />
      </View>

      <FlatList
        data={state.archivedTasks}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        scrollEnabled={state.archivedTasks.length > 0}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Feather name="archive" size={40} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Архив пуст</Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Выполненные задачи будут здесь</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 16 },
  headerTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  list: { paddingHorizontal: 20, paddingBottom: 40 },
  card: { flexDirection: "row", alignItems: "center", borderRadius: 12, marginBottom: 8, overflow: "hidden" },
  leftBar: { width: 4, height: "100%" },
  content: { flex: 1, paddingVertical: 12, paddingHorizontal: 12 },
  title: { fontSize: 14, fontFamily: "Inter_500Medium" },
  date: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  actions: { flexDirection: "row", gap: 6, paddingRight: 12 },
  actionBtn: { width: 30, height: 30, borderRadius: 8, justifyContent: "center", alignItems: "center" },
  emptyState: { alignItems: "center", paddingVertical: 60, gap: 8 },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
});
