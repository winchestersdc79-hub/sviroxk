import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

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

  const totalCompleted = habit.completedDates.length;
  const bestStreak = habit.bestStreak ?? habit.streak;

  const handleDelete = () => {
    Alert.alert("Удалить привычку?", `"${habit.title}" будет удалена вместе со всей историей.`, [
      { text: "Отмена", style: "cancel" },
      { text: "Удалить", style: "destructive", onPress: onDelete },
    ]);
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <View style={styles.row}>
        <View style={[styles.iconBox, { backgroundColor: `${habit.color}20` }]}>
          <Feather name={habit.icon as any} size={18} color={habit.color} />
        </View>

        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.foreground }]}>{habit.title}</Text>
          <View style={styles.metaRow}>
            {habit.streak > 0 && (
              <View style={styles.streakBadge}>
                <Text style={styles.streakEmoji}>🔥</Text>
                <Text style={[styles.streakText, { color: habit.color }]}>
                  {habit.streak} {habit.streak === 1 ? "день" : habit.streak < 5 ? "дня" : "дней"}
                </Text>
              </View>
            )}
            {bestStreak > 0 && (
              <Text style={[styles.bestStreak, { color: colors.mutedForeground }]}>
                Рекорд: {bestStreak}
              </Text>
            )}
            <Text style={[styles.totalText, { color: colors.mutedForeground }]}>
              Всего: {totalCompleted}
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onToggle(); }}
            style={[
              styles.checkBtn,
              {
                backgroundColor: isCompletedToday ? habit.color : "transparent",
                borderColor: habit.color,
              }
            ]}
          >
            {isCompletedToday
              ? <Feather name="check" size={16} color="#fff" />
              : <Feather name="circle" size={14} color={habit.color} />
            }
          </Pressable>
          <Pressable onPress={handleDelete} hitSlop={10} style={styles.deleteBtn}>
            <Feather name="trash-2" size={14} color={colors.mutedForeground} />
          </Pressable>
        </View>
      </View>

      {/* Week dots */}
      <View style={styles.weekRow}>
        {last7Days.map((date, idx) => {
          const completed = habit.completedDates.includes(date);
          const isToday = date === today;
          const dayName = weekDays[new Date(date).getDay()];
          return (
            <View key={date} style={styles.dayItem}>
              <Text style={[styles.dayLabel, { color: isToday ? habit.color : colors.mutedForeground }]}>
                {dayName}
              </Text>
              <View style={[
                styles.dayDot,
                {
                  backgroundColor: completed ? habit.color : `${habit.color}18`,
                  borderWidth: isToday ? 2 : 0,
                  borderColor: habit.color,
                }
              ]}>
                {completed && <Feather name="check" size={10} color="#fff" />}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 14, padding: 14, marginBottom: 10 },
  row: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  iconBox: { width: 42, height: 42, borderRadius: 12, justifyContent: "center", alignItems: "center", flexShrink: 0 },
  content: { flex: 1 },
  title: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 3, flexWrap: "wrap" },
  streakBadge: { flexDirection: "row", alignItems: "center", gap: 2 },
  streakEmoji: { fontSize: 11 },
  streakText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  bestStreak: { fontSize: 11, fontFamily: "Inter_400Regular" },
  totalText: { fontSize: 11, fontFamily: "Inter_400Regular" },
  actions: { flexDirection: "column", alignItems: "center", gap: 6 },
  checkBtn: { width: 34, height: 34, borderRadius: 10, borderWidth: 2, justifyContent: "center", alignItems: "center" },
  deleteBtn: { opacity: 0.5, padding: 2 },
  weekRow: { flexDirection: "row", justifyContent: "space-between" },
  dayItem: { alignItems: "center", gap: 4 },
  dayLabel: { fontSize: 9, fontFamily: "Inter_500Medium" },
  dayDot: { width: 26, height: 26, borderRadius: 7, justifyContent: "center", alignItems: "center" },
});
