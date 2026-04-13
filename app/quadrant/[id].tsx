import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { FlatList, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AddTaskModal } from "@/components/AddTaskModal";
import { TaskCard } from "@/components/TaskCard";
import { useColors } from "@/hooks/useColors";
import { TaskQuadrant, useApp } from "@/contexts/AppContext";

const quadrantMeta: Record<TaskQuadrant, { title: string; subtitle: string; color: string; icon: keyof typeof Feather.glyphMap }> = {
  urgentImportant: { title: "Сделать", subtitle: "Срочно и важно", color: "#EF4444", icon: "alert-circle" },
  notUrgentImportant: { title: "Запланировать", subtitle: "Не срочно, важно", color: "#F59E0B", icon: "star" },
  urgentNotImportant: { title: "Делегировать", subtitle: "Срочно, не важно", color: "#22C55E", icon: "zap" },
  notUrgentNotImportant: { title: "Убрать", subtitle: "Не срочно, не важно", color: "#6B7280", icon: "inbox" },
};

export default function QuadrantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const quadrant = id as TaskQuadrant;
  const colors = useColors();
  const router = useRouter();
  const { getTasksByQuadrant, completeTask, pinTask } = useApp();
  const insets = useSafeAreaInsets();
  const [modalVisible, setModalVisible] = useState(false);

  const meta = quadrantMeta[quadrant];
  const tasks = getTasksByQuadrant(quadrant);

  if (!meta) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: Platform.OS === "web" ? 67 : insets.top + 10 }]}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.backButton}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <View style={styles.headerContent}>
          <View style={[styles.headerIcon, { backgroundColor: `${meta.color}20` }]}>
            <Feather name={meta.icon} size={20} color={meta.color} />
          </View>
          <View>
            <Text style={[styles.headerTitle, { color: colors.foreground }]}>{meta.title}</Text>
            <Text style={[styles.headerSubtitle, { color: colors.mutedForeground }]}>{meta.subtitle}</Text>
          </View>
        </View>
        <Pressable onPress={() => setModalVisible(true)} style={[styles.addBtn, { backgroundColor: meta.color }]}>
          <Feather name="plus" size={18} color="#FFFFFF" />
        </Pressable>
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        scrollEnabled={tasks.length > 0}
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            quadrantColor={meta.color}
            onComplete={() => completeTask(item.id)}
            onPress={() => {}}
            onPin={() => pinTask(item.id)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Feather name={meta.icon} size={40} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Нет задач</Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Добавь первую задачу</Text>
          </View>
        }
      />

      <AddTaskModal visible={modalVisible} onClose={() => setModalVisible(false)} defaultQuadrant={quadrant} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingBottom: 16, gap: 12 },
  backButton: { width: 38, height: 38, justifyContent: "center", alignItems: "center" },
  headerContent: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
  headerIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  headerTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  headerSubtitle: { fontSize: 12, fontFamily: "Inter_400Regular" },
  addBtn: { width: 38, height: 38, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  list: { paddingHorizontal: 20, paddingBottom: 40 },
  emptyState: { alignItems: "center", paddingVertical: 60, gap: 8 },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
});
