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
    const days: { label: string; tasks: number; focus: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const tasks = state.archivedTasks.filter((t) => t.completedAt?.split("T")[0] === dateStr).length;
      const focus = state.focusSessions.filter(s => new Date(s.date).toDateString() === date.toDateString()).reduce((sum, s) => sum + s.durationMinutes, 0);
      days.push({ label: weekDays[date.getDay()], tasks, focus });
    }
    return days;
  }, [state.archivedTasks, state.focusSessions]);

  const maxTasks = Math.max(...weeklyStats.map((d) => d.tasks), 1);
  const maxFocus = Math.max(...weeklyStats.map((d) => d.focus), 1);

  const recentFocusSessions = state.focusSessions.slice(0, 5);
  const totalFocusHours = Math.floor(stats.totalFocusMinutes / 60);
  const totalFocusMins = stats.totalFocusMinutes % 60;

  const habitStats = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return {
      completedToday: state.habits.filter((h) => h.completedDates.includes(today)).length,
      total: state.habits.length,
      longestStreak: state.habits.reduce((max, h) => Math.max(max, h.bestStreak ?? h.streak), 0),
      totalCompletions: state.habits.reduce((sum, h) => sum + h.completedDates.length, 0),
    };
  }, [state.habits]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingTop: Platform.OS === "web" ? 67 : insets.top + 10 }]}>
        <Text style={[styles.screenTitle, { color: colors.foreground }]}>Статистика</Text>

        <View style={styles.overviewGrid}>
          {[
            { label: "Выполнено", value: `${completionRate}%`, color: colors.primary, icon: "percent" },
            { label: "Сделано", value: String(stats.completed), color: "#22C55E", icon: "check-circle" },
            { label: "Фокус (ч)", value: `${totalFocusHours}ч ${totalFocusMins}м`, color: "#F59E0B", icon: "clock" },
            { label: "Сессий", value: String(stats.focusSessionsCount), color: "#3B82F6", icon: "zap" },
          ].map(({ label, value, color, icon }) => (
            <View key={label} style={[styles.overviewCard, { backgroundColor: colors.card }]}>
              <View style={[styles.overviewIcon, { backgroundColor: `${color}20` }]}>
                <Feather name={icon as any} size={16} color={color} />
              </View>
              <Text style={[styles.overviewNum, { color }]}>{value}</Text>
              <Text style={[styles.overviewLabel, { color: colors.mutedForeground }]}>{label}</Text>
            </View>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Задачи за неделю</Text>
        <View style={[styles.chartCard, { backgroundColor: colors.card }]}>
          <View style={styles.barChart}>
            {weeklyStats.map((day, idx) => (
              <View key={idx} style={styles.barItem}>
                <View style={styles.barWrapper}>
                  <View style={[styles.bar, { backgroundColor: colors.primary, height: `${Math.max((day.tasks / maxTasks) * 100, 4)}%` as any }]} />
                </View>
                <Text style={[styles.barLabel, { color: colors.mutedForeground }]}>{day.label}</Text>
                <Text style={[styles.barValue, { color: colors.foreground }]}>{day.tasks}</Text>
              </View>
            ))}
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Фокус за неделю (мин)</Text>
        <View style={[styles.chartCard, { backgroundColor: colors.card }]}>
          <View style={styles.barChart}>
            {weeklyStats.map((day, idx) => (
              <View key={idx} style={styles.barItem}>
                <View style={styles.barWrapper}>
                  <View style={[styles.bar, { backgroundColor: "#F59E0B", height: `${Math.max((day.focus / maxFocus) * 100, 4)}%` as any }]} />
                </View>
                <Text style={[styles.barLabel, { color: colors.mutedForeground }]}>{day.label}</Text>
                <Text style={[styles.barValue, { color: colors.foreground }]}>{day.focus}</Text>
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
                <View style={styles.qLabelRow}>
                  <Text style={[styles.qLabel, { color: colors.foreground }]}>{quadrantInfo[q].label}</Text>
                  <Text style={[styles.qCount, { color: colors.mutedForeground }]}>{qStat.completed}/{qStat.total}</Text>
                </View>
                <View style={[styles.qBar, { backgroundColor: `${quadrantInfo[q].color}15` }]}>
                  <View style={[styles.qBarFill, { backgroundColor: quadrantInfo[q].color, width: `${pct}%` as any }]} />
                </View>
              </View>
            </View>
          );
        })}

        {recentFocusSessions.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Последние фокус-сессии</Text>
            <View style={[styles.section, { backgroundColor: colors.card }]}>
              {recentFocusSessions.map((s, i) => (
                <View key={s.id} style={[styles.sessionRow, { borderBottomColor: colors.border, borderBottomWidth: i < recentFocusSessions.length - 1 ? StyleSheet.hairlineWidth : 0 }]}>
                  <View style={[styles.sessionIcon, { backgroundColor: `${colors.primary}15` }]}>
                    <Feather name="clock" size={14} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.sessionTitle, { color: colors.foreground }]} numberOfLines={1}>{s.taskTitle}</Text>
                    <Text style={[styles.sessionDate, { color: colors.mutedForeground }]}>{new Date(s.date).toLocaleDateString("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</Text>
                  </View>
                  <Text style={[styles.sessionDuration, { color: colors.primary }]}>{s.durationMinutes} мин</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {state.habits.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Привычки</Text>
            <View style={[styles.habitGrid, { }]}>
              {[
                { label: "Сегодня", value: `${habitStats.completedToday}/${habitStats.total}`, color: "#22C55E", icon: "check-circle" },
                { label: "Лучшая серия", value: String(habitStats.longestStreak), color: "#F59E0B", icon: "zap" },
                { label: "Всего отмечено", value: String(habitStats.totalCompletions), color: "#A855F7", icon: "award" },
              ].map(({ label, value, color, icon }) => (
                <View key={label} style={[styles.habitStat, { backgroundColor: colors.card }]}>
                  <Feather name={icon as any} size={18} color={color} />
                  <Text style={[styles.habitStatNum, { color }]}>{value}</Text>
                  <Text style={[styles.habitStatLabel, { color: colors.mutedForeground }]}>{label}</Text>
                </View>
              ))}
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
  scrollContent: { paddingHorizontal: 16 },
  screenTitle: { fontSize: 24, fontFamily: "Inter_700Bold", marginBottom: 16 },
  overviewGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 24 },
  overviewCard: { width: "47%" as any, flexGrow: 1, borderRadius: 14, padding: 14, gap: 6 },
  overviewIcon: { width: 32, height: 32, borderRadius: 8, justifyContent: "center", alignItems: "center" },
  overviewNum: { fontSize: 22, fontFamily: "Inter_700Bold" },
  overviewLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold", marginBottom: 10 },
  chartCard: { borderRadius: 14, padding: 16, marginBottom: 20 },
  barChart: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", height: 100 },
  barItem: { flex: 1, alignItems: "center", gap: 4 },
  barWrapper: { width: 18, height: 72, justifyContent: "flex-end" },
  bar: { width: "100%", borderRadius: 4, minHeight: 3 },
  barLabel: { fontSize: 10, fontFamily: "Inter_400Regular" },
  barValue: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  quadrantRow: { flexDirection: "row", alignItems: "center", borderRadius: 12, padding: 12, marginBottom: 8, gap: 10 },
  qIcon: { width: 34, height: 34, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  qContent: { flex: 1, gap: 6 },
  qLabelRow: { flexDirection: "row", justifyContent: "space-between" },
  qLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  qCount: { fontSize: 12, fontFamily: "Inter_500Medium" },
  qBar: { height: 5, borderRadius: 3, overflow: "hidden" },
  qBarFill: { height: "100%", borderRadius: 3 },
  section: { borderRadius: 14, overflow: "hidden", marginBottom: 20 },
  sessionRow: { flexDirection: "row", alignItems: "center", padding: 14, gap: 10 },
  sessionIcon: { width: 32, height: 32, borderRadius: 8, justifyContent: "center", alignItems: "center" },
  sessionTitle: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  sessionDate: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  sessionDuration: { fontSize: 14, fontFamily: "Inter_700Bold" },
  habitGrid: { flexDirection: "row", gap: 10, marginBottom: 20 },
  habitStat: { flex: 1, borderRadius: 12, padding: 14, alignItems: "center", gap: 6 },
  habitStatNum: { fontSize: 18, fontFamily: "Inter_700Bold" },
  habitStatLabel: { fontSize: 10, fontFamily: "Inter_400Regular", textAlign: "center" },
});
