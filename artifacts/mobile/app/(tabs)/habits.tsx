import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HabitCard } from "@/components/HabitCard";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/contexts/AppContext";
import { scheduleHabitReminder, cancelHabitReminder, requestNotificationPermission } from "@/hooks/useNotifications";

const HABIT_COLORS = ["#A855F7", "#EF4444", "#F59E0B", "#22C55E", "#3B82F6", "#EC4899", "#14B8A6", "#F97316"];
const HABIT_ICONS: (keyof typeof Feather.glyphMap)[] = [
  "book", "activity", "heart", "coffee", "sun", "moon", "droplet", "edit-3",
  "code", "music", "camera", "globe", "smile", "target", "award", "battery-charging",
];

const WEEK_DAYS = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

export default function HabitsScreen() {
  const colors = useColors();
  const { state, addHabit, toggleHabit, deleteHabit } = useApp();
  const insets = useSafeAreaInsets();
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [selectedColor, setSelectedColor] = useState(HABIT_COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState<keyof typeof Feather.glyphMap>(HABIT_ICONS[0]);
  const [enableReminder, setEnableReminder] = useState(false);
  const [reminderHour, setReminderHour] = useState(9);
  const [reminderMinute, setReminderMinute] = useState(0);

  const today = new Date().toISOString().split("T")[0];
  const completedToday = state.habits.filter((h) => h.completedDates.includes(today)).length;
  const totalHabits = state.habits.length;
  const completionRate = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;
  const longestStreak = state.habits.reduce((max, h) => Math.max(max, h.bestStreak ?? h.streak), 0);

  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().split("T")[0]);
    }
    return days;
  };
  const last7 = getLast7Days();

  const handleAdd = async () => {
    if (!newTitle.trim()) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addHabit({ title: newTitle.trim(), icon: selectedIcon, color: selectedColor, reminderTime: null });
    if (enableReminder) {
      const granted = await requestNotificationPermission();
      if (granted) {
        const habits = state.habits;
        const newId = Date.now().toString();
        await scheduleHabitReminder(newId, newTitle.trim(), reminderHour, reminderMinute);
      }
    }
    setNewTitle("");
    setSelectedColor(HABIT_COLORS[0]);
    setSelectedIcon(HABIT_ICONS[0]);
    setEnableReminder(false);
    setShowModal(false);
  };

  const handleDelete = async (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await cancelHabitReminder(id);
    deleteHabit(id);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingTop: Platform.OS === "web" ? 67 : insets.top + 10 }]}
      >
        <View style={styles.header}>
          <Text style={[styles.screenTitle, { color: colors.foreground }]}>Привычки</Text>
          <Pressable onPress={() => setShowModal(true)} style={[styles.addButton, { backgroundColor: colors.primary }]}>
            <Feather name="plus" size={18} color={colors.primaryForeground} />
          </Pressable>
        </View>

        {/* Progress bar */}
        {totalHabits > 0 && (
          <View style={[styles.progressCard, { backgroundColor: colors.card }]}>
            <View style={styles.progressHeader}>
              <Text style={[styles.progressLabel, { color: colors.foreground }]}>Сегодня выполнено</Text>
              <Text style={[styles.progressCount, { color: colors.primary }]}>{completedToday}/{totalHabits}</Text>
            </View>
            <View style={[styles.progressTrack, { backgroundColor: `${colors.primary}20` }]}>
              <View style={[styles.progressFill, { backgroundColor: colors.primary, width: `${completionRate}%` as any }]} />
            </View>
            <View style={styles.statsRow}>
              <View style={styles.miniStat}>
                <Text style={[styles.miniStatNum, { color: "#F59E0B" }]}>{longestStreak}</Text>
                <Text style={[styles.miniStatLabel, { color: colors.mutedForeground }]}>Лучшая серия</Text>
              </View>
              <View style={styles.miniStat}>
                <Text style={[styles.miniStatNum, { color: "#22C55E" }]}>{completionRate}%</Text>
                <Text style={[styles.miniStatLabel, { color: colors.mutedForeground }]}>Выполнение</Text>
              </View>
              <View style={styles.miniStat}>
                <Text style={[styles.miniStatNum, { color: colors.primary }]}>{totalHabits}</Text>
                <Text style={[styles.miniStatLabel, { color: colors.mutedForeground }]}>Привычек</Text>
              </View>
            </View>
          </View>
        )}

        {/* Weekly grid */}
        {state.habits.length > 0 && (
          <View style={[styles.weeklyCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.weeklyTitle, { color: colors.foreground }]}>Последние 7 дней</Text>
            <View style={styles.weekGrid}>
              {last7.map((date) => {
                const dayNum = new Date(date).getDay();
                const completedCount = state.habits.filter((h) => h.completedDates.includes(date)).length;
                const pct = totalHabits > 0 ? completedCount / totalHabits : 0;
                const isToday = date === today;
                return (
                  <View key={date} style={styles.weekDay}>
                    <Text style={[styles.weekDayLabel, { color: isToday ? colors.primary : colors.mutedForeground }]}>
                      {WEEK_DAYS[dayNum]}
                    </Text>
                    <View style={[
                      styles.weekDayDot,
                      {
                        backgroundColor: pct === 1 ? "#22C55E" : pct > 0.5 ? "#F59E0B" : pct > 0 ? `${colors.primary}60` : `${colors.foreground}10`,
                        borderColor: isToday ? colors.primary : "transparent",
                        borderWidth: isToday ? 2 : 0,
                      }
                    ]}>
                      {completedCount > 0 && <Text style={styles.weekDayCount}>{completedCount}</Text>}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {state.habits.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: `${colors.primary}20` }]}>
              <Feather name="target" size={32} color={colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Нет привычек</Text>
            <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>Добавь первую привычку и начни строить лучшую версию себя</Text>
            <Pressable onPress={() => setShowModal(true)} style={[styles.emptyButton, { backgroundColor: colors.primary }]}>
              <Feather name="plus" size={16} color={colors.primaryForeground} />
              <Text style={[styles.emptyButtonText, { color: colors.primaryForeground }]}>Добавить привычку</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.habitsList}>
            {state.habits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                onToggle={() => toggleHabit(habit.id)}
                onDelete={() => handleDelete(habit.id)}
              />
            ))}
          </View>
        )}

        <View style={{ height: Platform.OS === "web" ? 34 : 100 }} />
      </ScrollView>

      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowModal(false)}>
        <View style={[styles.modal, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setShowModal(false)} hitSlop={8}>
              <Feather name="x" size={24} color={colors.mutedForeground} />
            </Pressable>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Новая привычка</Text>
            <Pressable onPress={handleAdd} disabled={!newTitle.trim()}
              style={[styles.saveButton, { backgroundColor: newTitle.trim() ? colors.primary : colors.muted }]}>
              <Text style={[styles.saveText, { color: newTitle.trim() ? colors.primaryForeground : colors.mutedForeground }]}>Создать</Text>
            </Pressable>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <TextInput
              style={[styles.input, { color: colors.foreground, borderBottomColor: colors.primary }]}
              placeholder="Название привычки"
              placeholderTextColor={colors.mutedForeground}
              value={newTitle}
              onChangeText={setNewTitle}
              autoFocus
              returnKeyType="done"
            />

            <Text style={[styles.label, { color: colors.foreground }]}>Иконка</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.iconScroll}>
              {HABIT_ICONS.map((icon) => (
                <Pressable key={icon} onPress={() => setSelectedIcon(icon)}
                  style={[styles.iconOption, { backgroundColor: selectedIcon === icon ? `${selectedColor}25` : colors.card, borderColor: selectedIcon === icon ? selectedColor : "transparent", borderWidth: 2 }]}>
                  <Feather name={icon} size={20} color={selectedIcon === icon ? selectedColor : colors.mutedForeground} />
                </Pressable>
              ))}
            </ScrollView>

            <Text style={[styles.label, { color: colors.foreground }]}>Цвет</Text>
            <View style={styles.colorRow}>
              {HABIT_COLORS.map((color) => (
                <Pressable key={color} onPress={() => setSelectedColor(color)}
                  style={[styles.colorOption, { backgroundColor: color, opacity: selectedColor === color ? 1 : 0.4, transform: [{ scale: selectedColor === color ? 1.15 : 1 }] }]}>
                  {selectedColor === color && <Feather name="check" size={14} color="#fff" />}
                </Pressable>
              ))}
            </View>

            <Text style={[styles.label, { color: colors.foreground }]}>Предпросмотр</Text>
            <View style={[styles.previewRow, { backgroundColor: colors.card }]}>
              <View style={[styles.previewIcon, { backgroundColor: `${selectedColor}20` }]}>
                <Feather name={selectedIcon} size={22} color={selectedColor} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.previewName, { color: colors.foreground }]}>{newTitle || "Название привычки"}</Text>
                <Text style={[styles.previewStreak, { color: colors.mutedForeground }]}>🔥 0 дней подряд</Text>
              </View>
              <View style={[styles.previewToggle, { borderColor: selectedColor, borderWidth: 2 }]} />
            </View>

            <View style={{ height: 60 }} />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 16 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  screenTitle: { fontSize: 24, fontFamily: "Inter_700Bold" },
  addButton: { width: 38, height: 38, borderRadius: 19, justifyContent: "center", alignItems: "center" },
  progressCard: { borderRadius: 16, padding: 16, marginBottom: 12 },
  progressHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  progressLabel: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  progressCount: { fontSize: 18, fontFamily: "Inter_700Bold" },
  progressTrack: { height: 8, borderRadius: 4, overflow: "hidden", marginBottom: 14 },
  progressFill: { height: "100%", borderRadius: 4 },
  statsRow: { flexDirection: "row", justifyContent: "space-around" },
  miniStat: { alignItems: "center", gap: 2 },
  miniStatNum: { fontSize: 18, fontFamily: "Inter_700Bold" },
  miniStatLabel: { fontSize: 10, fontFamily: "Inter_400Regular" },
  weeklyCard: { borderRadius: 14, padding: 14, marginBottom: 14 },
  weeklyTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 12 },
  weekGrid: { flexDirection: "row", justifyContent: "space-between" },
  weekDay: { alignItems: "center", gap: 6 },
  weekDayLabel: { fontSize: 10, fontFamily: "Inter_500Medium" },
  weekDayDot: { width: 30, height: 30, borderRadius: 8, justifyContent: "center", alignItems: "center" },
  weekDayCount: { fontSize: 11, fontFamily: "Inter_700Bold", color: "#fff" },
  emptyState: { alignItems: "center", paddingVertical: 48, paddingHorizontal: 24 },
  emptyIcon: { width: 72, height: 72, borderRadius: 20, justifyContent: "center", alignItems: "center", marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontFamily: "Inter_700Bold", marginBottom: 8 },
  emptySubtitle: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20, marginBottom: 24 },
  emptyButton: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  emptyButtonText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  habitsList: { gap: 0 },
  modal: { flex: 1, paddingTop: Platform.OS === "web" ? 67 : 0 },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 16 },
  modalTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold" },
  saveButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  saveText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  modalContent: { paddingHorizontal: 20 },
  input: { fontSize: 20, fontFamily: "Inter_600SemiBold", paddingVertical: 12, borderBottomWidth: 2, marginBottom: 24 },
  label: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 10 },
  iconScroll: { marginBottom: 20 },
  iconOption: { width: 48, height: 48, borderRadius: 12, justifyContent: "center", alignItems: "center", marginRight: 8 },
  colorRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 },
  colorOption: { width: 36, height: 36, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  previewRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 14, marginBottom: 20 },
  previewIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  previewName: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  previewStreak: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  previewToggle: { width: 28, height: 28, borderRadius: 8 },
});
