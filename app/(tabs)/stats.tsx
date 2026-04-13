import { Feather } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { TaskQuadrant, useApp } from "@/contexts/AppContext";

const quadrantInfo: Record<TaskQuadrant, { label: string; color: string; icon: keyof typeof Feather.glyphMap }> = {
  urgentImportant: { label: "Сделать", color: "#EF4444", icon: "alert-circle" },
  notUrgentImportant: { label: "Запланировать", color: "#F59E0B", icon: "star" },
  urgentNotImportant: { label: "Делегировать", color: "#22C55E", icon: "zap" },
  notUrgentNotImportant: { label: "Убрать", color: "#6B7280", icon: "inbox" },
};

const weekDays = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

export default function StatsScreen() {
  const colors = useColors();
  const { state, getCompletionStats } = useApp();
  const insets = useSafeAreaInsets();

  const stats = getCompletionStats();
  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  const weeklyStats = useMemo(() => {
    const days: { label: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const count = state.archivedTasks.filter((t) => t.completedAt?.split("T")[0] === dateStr).length;
      days.push({ label: weekDays[date.getDay()], count });
    }
    return days;
  }, [state.archivedTasks]);

  const maxWeekly = Math.max(...weeklyStats.map((d) => d.count), 1);

  const priorityStats = useMemo(() => {
    const all = [...state.tasks, ...state.archivedTasks];
    return {
      p1: { total: all.filter((t) => t.priority === "p1").length, completed: all.filter((t) => t.priority === "p1" && t.isCompleted).length },
      p2: { total: all.filter((t) => t.priority === "p2").length, completed: all.filter((t) => t.priority === "p2" && t.isCompleted).length },
      p3: { total: all.filter((t) => t.priority === "p3").length, completed: all.filter((t) => t.priority === "p3" && t.isCompleted).length },
    };
  }, [state.tasks, state.archivedTasks]);

  const habitStats = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    const completedToday = state.habits.filter((h) => h.completedDates.includes(today)).length;
    const longestStreak = state.habits.reduce((max, h) => Math.max(max, h.streak), 0);
    return { completedToday, total: state.habits.length, longestStreak };
  }, [state.habits]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingTop: Platform.OS === "web" ? 67 : insets.top + 10 }]}
      >
        <Text style={[styles.screenTitle, { color: colors.foreground }]}>Статистика</Text>

        <View style={[styles.overviewCard, { backgroundColor: colors.card }]}>
          <View style={styles.overviewRow}>
            <View style={styles.overviewStat}>
              <Text style={[styles.bigNumber, { color: colors.primary }]}>{completionRate}%</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Выполнено</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.overviewStat}>
              <Text style={[styles.bigNumber, { color: colors.success }]}>{stats.completed}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Сделано</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.overviewStat}>
              <Text style={[styles.bigNumber, { color: colors.foreground }]}>{stats.total}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Всего</Text>
            </View>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Активность за неделю</Text>
        <View style={[styles.chartCard, { backgroundColor: colors.card }]}>
          <View style={styles.barChart}>
            {weeklyStats.map((day, idx) => (
              <View key={idx} style={styles.barItem}>
                <View style={styles.barWrapper}>
                  <View style={[styles.bar, { backgroundColor: colors.primary, height: `${Math.max((day.count / maxWeekly) * 100, 4)}%` as any }]} />
                </View>
                <Text style={[styles.barLabel, { color: colors.mutedForeground }]}>{day.label}</Text>
                <Text style={[styles.barValue, { color: colors.foreground }]}>{day.count}</Text>
              </View>
            ))}
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>По квадрантам</Text>
        {(Object.keys(quadrantInfo) as TaskQuadrant[]).map((q) => {
          const qStat = stats.byQuadrant[q];
          const pct = qStat.total > 0 ? (qStat.completed / qStat.total) * 100 : 0;
          return (
            <View key={q} style={[styles.quadrantRow, { backgroundColor: colors.card }]}>
              <View style={[styles.qIcon, { backgroundColor: `${quadrantInfo[q].color}20` }]}>
                <Feather name={quadrantInfo[q].icon} size={16} color={quadrantInfo[q].color} />
              </View>
              <View style={styles.qContent}>
                <Text style={[styles.qLabel, { color: colors.foreground }]}>{quadrantInfo[q].label}</Text>
                <View style={[styles.qBar, { backgroundColor: `${quadrantInfo[q].color}20` }]}>
                  <View style={[styles.qBarFill, { backgroundColor: quadrantInfo[q].color, width: `${pct}%` as any }]} />
                </View>
              </View>
              <Text style={[styles.qCount, { color: colors.mutedForeground }]}>{qStat.completed}/{qStat.total}</Text>
            </View>
          );
        })}

        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>По приоритетам</Text>
        <View style={styles.priorityGrid}>
          {([
            { key: "p1", label: "Высокий", color: "#EF4444" },
            { key: "p2", label: "Средний", color: "#F59E0B" },
            { key: "p3", label: "Низкий", color: "#6B7280" },
          ] as const).map((p) => (
            <View key={p.key} style={[styles.priorityCard, { backgroundColor: colors.card }]}>
              <View style={[styles.priorityDot, { backgroundColor: p.color }]} />
              <Text style={[styles.priorityLabel, { color: colors.foreground }]}>{p.label}</Text>
              <Text style={[styles.priorityCount, { color: p.color }]}>{priorityStats[p.key].completed}/{priorityStats[p.key].total}</Text>
            </View>
          ))}
        </View>

        {state.habits.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Привычки</Text>
            <View style={[styles.habitStatsCard, { backgroundColor: colors.card }]}>
              <View style={styles.habitStatRow}>
                <View style={styles.habitStat}>
                  <Feather name="check-circle" size={18} color={colors.success} />
                  <Text style={[styles.habitStatNum, { color: colors.foreground }]}>{habitStats.completedToday}</Text>
                  <Text style={[styles.habitStatLabel, { color: colors.mutedForeground }]}>Сегодня</Text>
                </View>
                <View style={styles.habitStat}>
                  <Feather name="zap" size={18} color={colors.warning} />
                  <Text style={[styles.habitStatNum, { color: colors.foreground }]}>{habitStats.longestStreak}</Text>
                  <Text style={[styles.habitStatLabel, { color: colors.mutedForeground }]}>Лучшая серия</Text>
                </View>
                <View style={styles.habitStat}>
                  <Feather name="target" size={18} color={colors.primary} />
                  <Text style={[styles.habitStatNum, { color: colors.foreground }]}>{habitStats.total}</Text>
                  <Text style={[styles.habitStatLabel, { color: colors.mutedForeground }]}>Привычек</Text>
                </View>
              </View>
            </View>
          </>
        )}

        <View style={{ height: Platform.OS === "web" ? 34 : 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20 },
  screenTitle: { fontSize: 24, fontFamily: "Inter_700Bold", marginBottom: 20 },
  overviewCard: { borderRadius: 16, padding: 20, marginBottom: 24 },
  overviewRow: { flexDirection: "row", alignItems: "center" },
  overviewStat: { flex: 1, alignItems: "center" },
  bigNumber: { fontSize: 28, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  divider: { width: 1, height: 40 },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold", marginBottom: 12 },
  chartCard: { borderRadius: 16, padding: 20, marginBottom: 24 },
  barChart: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", height: 120 },
  barItem: { flex: 1, alignItems: "center", gap: 4 },
  barWrapper: { width: 20, height: 80, justifyContent: "flex-end" },
  bar: { width: "100%", borderRadius: 4, minHeight: 3 },
  barLabel: { fontSize: 10, fontFamily: "Inter_400Regular" },
  barValue: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  quadrantRow: { flexDirection: "row", alignItems: "center", borderRadius: 12, padding: 14, marginBottom: 8, gap: 12 },
  qIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  qContent: { flex: 1, gap: 6 },
  qLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  qBar: { height: 6, borderRadius: 3, overflow: "hidden" },
  qBarFill: { height: "100%", borderRadius: 3 },
  qCount: { fontSize: 13, fontFamily: "Inter_500Medium" },
  priorityGrid: { flexDirection: "row", gap: 8, marginBottom: 24 },
  priorityCard: { flex: 1, borderRadius: 12, padding: 14, alignItems: "center", gap: 6 },
  priorityDot: { width: 8, height: 8, borderRadius: 4 },
  priorityLabel: { fontSize: 12, fontFamily: "Inter_500Medium" },
  priorityCount: { fontSize: 16, fontFamily: "Inter_700Bold" },
  habitStatsCard: { borderRadius: 16, padding: 20, marginBottom: 24 },
  habitStatRow: { flexDirection: "row", justifyContent: "space-around" },
  habitStat: { alignItems: "center", gap: 6 },
  habitStatNum: { fontSize: 20, fontFamily: "Inter_700Bold" },
  habitStatLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
});
