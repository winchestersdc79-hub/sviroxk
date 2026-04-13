import { Feather } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { TaskCard } from "@/components/TaskCard";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/contexts/AppContext";

const DAYS = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
const MONTHS = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
];

const quadrantColors: Record<string, string> = {
  urgentImportant: "#EF4444",
  notUrgentImportant: "#F59E0B",
  urgentNotImportant: "#22C55E",
  notUrgentNotImportant: "#6B7280",
};

export default function CalendarScreen() {
  const colors = useColors();
  const { state, getTasksForDate, completeTask } = useApp();
  const insets = useSafeAreaInsets();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  const today = new Date().toISOString().split("T")[0];

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  }, [currentMonth]);

  const tasksForSelected = getTasksForDate(selectedDate);

  const deadlineDates = useMemo(() => {
    const dates = new Set<string>();
    state.tasks.forEach((t) => {
      if (t.deadline && !t.isCompleted) dates.add(t.deadline.split("T")[0]);
    });
    return dates;
  }, [state.tasks]);

  const navigateMonth = (dir: number) => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + dir, 1));
  };

  const getDateString = (day: number) => {
    const m = (currentMonth.getMonth() + 1).toString().padStart(2, "0");
    const d = day.toString().padStart(2, "0");
    return `${currentMonth.getFullYear()}-${m}-${d}`;
  };

  const selectedLabel = new Date(selectedDate + "T12:00:00").toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
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
        <Text style={[styles.screenTitle, { color: colors.foreground }]}>Календарь</Text>

        <View style={[styles.calendarCard, { backgroundColor: colors.card }]}>
          <View style={styles.monthHeader}>
            <Pressable onPress={() => navigateMonth(-1)} hitSlop={8}>
              <Feather name="chevron-left" size={20} color={colors.foreground} />
            </Pressable>
            <Text style={[styles.monthTitle, { color: colors.foreground }]}>
              {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </Text>
            <Pressable onPress={() => navigateMonth(1)} hitSlop={8}>
              <Feather name="chevron-right" size={20} color={colors.foreground} />
            </Pressable>
          </View>

          <View style={styles.dayHeaders}>
            {DAYS.map((d) => (
              <Text key={d} style={[styles.dayHeader, { color: colors.mutedForeground }]}>{d}</Text>
            ))}
          </View>

          <View style={styles.daysGrid}>
            {calendarDays.map((day, idx) => {
              if (day === null) return <View key={`empty-${idx}`} style={styles.dayCell} />;
              const dateStr = getDateString(day);
              const isSelected = dateStr === selectedDate;
              const isToday = dateStr === today;
              const hasDeadline = deadlineDates.has(dateStr);

              return (
                <Pressable
                  key={`day-${day}`}
                  onPress={() => setSelectedDate(dateStr)}
                  style={[
                    styles.dayCell,
                    isSelected && { backgroundColor: colors.primary, borderRadius: 10 },
                    isToday && !isSelected && { borderWidth: 1, borderColor: colors.primary, borderRadius: 10 },
                  ]}
                >
                  <Text style={[styles.dayText, { color: isSelected ? colors.primaryForeground : colors.foreground }]}>
                    {day}
                  </Text>
                  {hasDeadline && (
                    <View style={[styles.deadlineDot, { backgroundColor: isSelected ? colors.primaryForeground : colors.destructive }]} />
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Задачи на {selectedLabel}
        </Text>

        {tasksForSelected.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="calendar" size={32} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Нет задач на эту дату
            </Text>
          </View>
        ) : (
          tasksForSelected.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              quadrantColor={quadrantColors[task.quadrant]}
              onComplete={() => completeTask(task.id)}
              onPress={() => {}}
            />
          ))
        )}

        <View style={{ height: Platform.OS === "web" ? 34 : 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20 },
  screenTitle: { fontSize: 24, fontFamily: "Inter_700Bold", marginBottom: 16 },
  calendarCard: { borderRadius: 16, padding: 16, marginBottom: 24 },
  monthHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  monthTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  dayHeaders: { flexDirection: "row", marginBottom: 8 },
  dayHeader: { flex: 1, textAlign: "center", fontSize: 11, fontFamily: "Inter_500Medium" },
  daysGrid: { flexDirection: "row", flexWrap: "wrap" },
  dayCell: { width: "14.28%" as any, aspectRatio: 1, justifyContent: "center", alignItems: "center" },
  dayText: { fontSize: 14, fontFamily: "Inter_500Medium" },
  deadlineDot: { width: 4, height: 4, borderRadius: 2, marginTop: 2 },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold", marginBottom: 12 },
  emptyState: { alignItems: "center", paddingVertical: 40, gap: 8 },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular" },
});
