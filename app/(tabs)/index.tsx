import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AddTaskModal } from "@/components/AddTaskModal";
import { QuadrantCard } from "@/components/QuadrantCard";
import { useColors } from "@/hooks/useColors";
import { TaskQuadrant, useApp } from "@/contexts/AppContext";

const quadrants: {
  key: TaskQuadrant;
  title: string;
  subtitle: string;
  color: string;
  icon: keyof typeof Feather.glyphMap;
}[] = [
  { key: "urgentImportant", title: "Сделать", subtitle: "Срочно и важно", color: "#EF4444", icon: "alert-circle" },
  { key: "notUrgentImportant", title: "Запланировать", subtitle: "Не срочно, важно", color: "#F59E0B", icon: "star" },
  { key: "urgentNotImportant", title: "Делегировать", subtitle: "Срочно, не важно", color: "#22C55E", icon: "zap" },
  { key: "notUrgentNotImportant", title: "Убрать", subtitle: "Не срочно, не важно", color: "#6B7280", icon: "inbox" },
];

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 6) return "Поздняя ночь 🌙";
  if (h < 12) return "Доброе утро ☀️";
  if (h < 17) return "Добрый день 👋";
  if (h < 22) return "Добрый вечер 🌆";
  return "Доброй ночи 🌙";
}

function getTip(total: number, completed: number, overdue: number): string {
  if (overdue > 0) return `${overdue} ${overdue === 1 ? "задача просрочена" : "задачи просрочены"} — займись ими!`;
  if (total === 0) return "Добавь первую задачу, чтобы начать";
  if (total === completed) return "Все задачи выполнены! Отличная работа 🎉";
  const left = total - completed;
  return `Осталось ${left} ${left === 1 ? "задача" : left < 5 ? "задачи" : "задач"} — ты справишься!`;
}

export default function MatrixScreen() {
  const colors = useColors();
  const { getTasksByQuadrant, state } = useApp();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedQuadrant, setSelectedQuadrant] = useState<TaskQuadrant | undefined>();

  const activeTasks = state.tasks.filter((t) => !t.isCompleted);
  const overdueTasks = state.tasks.filter(
    (t) => !t.isCompleted && t.deadline && new Date(t.deadline) < new Date()
  );
  const todayDeadlines = state.tasks.filter((t) => {
    if (!t.deadline || t.isCompleted) return false;
    const d = new Date(t.deadline);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  });
  const completedToday = state.archivedTasks.filter((t) => {
    if (!t.completedAt) return false;
    return new Date(t.completedAt).toDateString() === new Date().toDateString();
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: Platform.OS === "web" ? 67 : insets.top + 10 },
        ]}
      >
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.greeting, { color: colors.mutedForeground }]}>
              {getGreeting()}
            </Text>
            <Text style={[styles.title, { color: colors.foreground }]}>
              Матрица задач
            </Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable
              onPress={() => router.push("/search" as any)}
              style={[styles.headerButton, { backgroundColor: colors.card }]}
            >
              <Feather name="search" size={18} color={colors.mutedForeground} />
            </Pressable>
            <Pressable
              onPress={() => router.push("/archive" as any)}
              style={[styles.headerButton, { backgroundColor: colors.card }]}
            >
              <Feather name="archive" size={18} color={colors.mutedForeground} />
            </Pressable>
            <Pressable
              onPress={() => router.push("/settings" as any)}
              style={[styles.headerButton, { backgroundColor: colors.card }]}
            >
              <Feather name="settings" size={18} color={colors.mutedForeground} />
            </Pressable>
          </View>
        </View>

        <View style={[styles.tipCard, { backgroundColor: overdueTasks.length > 0 ? "#EF444415" : `${colors.primary}10`, borderColor: overdueTasks.length > 0 ? "#EF444430" : `${colors.primary}20` }]}>
          <Feather name={overdueTasks.length > 0 ? "alert-circle" : "zap"} size={14} color={overdueTasks.length > 0 ? "#EF4444" : colors.primary} />
          <Text style={[styles.tipText, { color: overdueTasks.length > 0 ? "#EF4444" : colors.primary }]}>
            {getTip(activeTasks.length, completedToday.length, overdueTasks.length)}
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>{activeTasks.length}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Активные</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.statNumber, { color: "#22C55E" }]}>{completedToday.length}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Сегодня</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.statNumber, { color: overdueTasks.length > 0 ? "#EF4444" : colors.mutedForeground }]}>{overdueTasks.length}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Просрочено</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.statNumber, { color: "#F59E0B" }]}>{todayDeadlines.length}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Сегодня срок</Text>
          </View>
        </View>

        <View style={styles.grid}>
          {quadrants.map((q) => (
            <View key={q.key} style={styles.gridItem}>
              <QuadrantCard
                title={q.title}
                subtitle={q.subtitle}
                color={q.color}
                icon={q.icon}
                tasks={getTasksByQuadrant(q.key)}
                onPress={() => router.push({ pathname: "/quadrant/[id]" as any, params: { id: q.key } })}
                onAddTask={() => {
                  setSelectedQuadrant(q.key);
                  setModalVisible(true);
                }}
              />
            </View>
          ))}
        </View>

        <View style={{ height: Platform.OS === "web" ? 34 : 100 }} />
      </ScrollView>

      <Pressable
        onPress={() => {
          setSelectedQuadrant(undefined);
          setModalVisible(true);
        }}
        style={({ pressed }) => [
          styles.fab,
          {
            backgroundColor: colors.primary,
            bottom: Platform.OS === "web" ? 34 + 84 : insets.bottom + 84,
            transform: [{ scale: pressed ? 0.92 : 1 }],
          },
        ]}
      >
        <Feather name="plus" size={24} color={colors.primaryForeground} />
      </Pressable>

      <AddTaskModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        defaultQuadrant={selectedQuadrant}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 20 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  greeting: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    marginBottom: 2,
  },
  title: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  headerActions: {
    flexDirection: "row",
    gap: 6,
    marginTop: 4,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  tipCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 14,
  },
  tipText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    flex: 1,
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
  },
  statLabel: {
    fontSize: 9,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
    textAlign: "center",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  gridItem: {
    width: "47%" as any,
    flexGrow: 1,
  },
  fab: {
    position: "absolute",
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#A855F7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
