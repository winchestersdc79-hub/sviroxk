import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import { Habit } from "@/contexts/AppContext";

interface HabitCardProps {
  habit: Habit;
  onToggle: () => void;
  onDelete: () => void;
}

const weekDays = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

export function HabitCard({ habit, onToggle, onDelete }: HabitCardProps) {
  const colors = useColors();
  const today = new Date().toISOString().split("T")[0];
  const isCompletedToday = habit.completedDates.includes(today);

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split("T")[0];
  });

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.row}>
        <Pressable
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onToggle(); }}
          style={[styles.checkCircle, { backgroundColor: isCompletedToday ? habit.color : "transparent", borderColor: habit.color }]}
        >
          {isCompletedToday && <Feather name="check" size={16} color="#FFFFFF" />}
        </Pressable>

        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.foreground }]}>{habit.title}</Text>
          <View style={styles.streakRow}>
            <Feather name="zap" size={12} color={habit.color} />
            <Text style={[styles.streakText, { color: habit.color }]}>
              {habit.streak} {habit.streak === 1 ? "день" : habit.streak < 5 ? "дня" : "дней"} подряд
            </Text>
          </View>
        </View>

        <Pressable onPress={onDelete} hitSlop={8} style={{ opacity: 0.5 }}>
          <Feather name="trash-2" size={16} color={colors.mutedForeground} />
        </Pressable>
      </View>

      <View style={styles.weekRow}>
        {last7Days.map((date) => {
          const completed = habit.completedDates.includes(date);
          const isToday = date === today;
          return (
            <View key={date} style={[styles.dayDot, { backgroundColor: completed ? habit.color : `${habit.color}20`, borderWidth: isToday ? 2 : 0, borderColor: habit.color }]} />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1 },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  checkCircle: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, justifyContent: "center", alignItems: "center" },
  content: { flex: 1 },
  title: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  streakRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  streakText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  weekRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 12, paddingHorizontal: 4 },
  dayDot: { width: 24, height: 24, borderRadius: 12 },
});
