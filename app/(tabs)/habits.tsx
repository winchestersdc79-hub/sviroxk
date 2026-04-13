import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HabitCard } from "@/components/HabitCard";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/contexts/AppContext";

const HABIT_COLORS = ["#A855F7", "#EF4444", "#F59E0B", "#22C55E", "#3B82F6", "#EC4899", "#14B8A6", "#F97316"];
const HABIT_ICONS: (keyof typeof Feather.glyphMap)[] = [
  "book", "activity", "heart", "coffee", "sun", "moon", "droplet", "edit-3",
  "code", "music", "camera", "globe", "smile", "target", "award", "battery-charging",
];

export default function HabitsScreen() {
  const colors = useColors();
  const { state, addHabit, toggleHabit, deleteHabit } = useApp();
  const insets = useSafeAreaInsets();
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [selectedColor, setSelectedColor] = useState(HABIT_COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState<keyof typeof Feather.glyphMap>(HABIT_ICONS[0]);

  const today = new Date().toISOString().split("T")[0];
  const completedToday = state.habits.filter((h) => h.completedDates.includes(today)).length;

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addHabit({ title: newTitle.trim(), icon: selectedIcon, color: selectedColor });
    setNewTitle("");
    setSelectedColor(HABIT_COLORS[0]);
    setSelectedIcon(HABIT_ICONS[0]);
    setShowModal(false);
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

        {state.habits.length > 0 && (
          <View style={[styles.progressCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.progressTitle, { color: colors.foreground }]}>Прогресс сегодня</Text>
            <View style={styles.progressRow}>
              <View style={[styles.progressBar, { backgroundColor: `${colors.primary}20` }]}>
                <View style={[styles.progressFill, { backgroundColor: colors.primary, width: `${state.habits.length > 0 ? (completedToday / state.habits.length) * 100 : 0}%` as any }]} />
              </View>
              <Text style={[styles.progressText, { color: colors.primary }]}>{completedToday}/{state.habits.length}</Text>
            </View>
          </View>
        )}

        {state.habits.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="target" size={40} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Нет привычек</Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Добавь привычки и отслеживай их каждый день
            </Text>
          </View>
        ) : (
          state.habits.map((habit) => (
            <HabitCard key={habit.id} habit={habit} onToggle={() => toggleHabit(habit.id)} onDelete={() => deleteHabit(habit.id)} />
          ))
        )}

        <View style={{ height: Platform.OS === "web" ? 34 : 100 }} />
      </ScrollView>

      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowModal(false)}>
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setShowModal(false)} hitSlop={8}>
              <Feather name="x" size={24} color={colors.mutedForeground} />
            </Pressable>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Новая привычка</Text>
            <Pressable onPress={handleAdd} disabled={!newTitle.trim()} style={[styles.saveButton, { backgroundColor: newTitle.trim() ? colors.primary : colors.muted }]}>
              <Text style={[styles.saveText, { color: newTitle.trim() ? colors.primaryForeground : colors.mutedForeground }]}>Сохранить</Text>
            </Pressable>
          </View>

          <ScrollView style={styles.modalForm} keyboardShouldPersistTaps="handled">
            <TextInput
              style={[styles.habitInput, { color: colors.foreground, borderBottomColor: colors.border }]}
              placeholder="Название привычки"
              placeholderTextColor={colors.mutedForeground}
              value={newTitle}
              onChangeText={setNewTitle}
              autoFocus
            />

            <Text style={[styles.sectionLabel, { color: colors.foreground }]}>Цвет</Text>
            <View style={styles.colorGrid}>
              {HABIT_COLORS.map((c) => (
                <Pressable key={c} onPress={() => setSelectedColor(c)} style={[styles.colorDot, { backgroundColor: c, borderWidth: selectedColor === c ? 3 : 0, borderColor: "#FFFFFF" }]} />
              ))}
            </View>

            <Text style={[styles.sectionLabel, { color: colors.foreground }]}>Иконка</Text>
            <View style={styles.iconGrid}>
              {HABIT_ICONS.map((icon) => (
                <Pressable key={icon} onPress={() => setSelectedIcon(icon)} style={[styles.iconButton, { backgroundColor: selectedIcon === icon ? `${selectedColor}20` : colors.card, borderColor: selectedIcon === icon ? selectedColor : colors.border, borderWidth: 1 }]}>
                  <Feather name={icon} size={20} color={selectedIcon === icon ? selectedColor : colors.mutedForeground} />
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  screenTitle: { fontSize: 24, fontFamily: "Inter_700Bold" },
  addButton: { width: 38, height: 38, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  progressCard: { borderRadius: 12, padding: 16, marginBottom: 20 },
  progressTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 10 },
  progressRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  progressBar: { flex: 1, height: 8, borderRadius: 4, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 4 },
  progressText: { fontSize: 14, fontFamily: "Inter_700Bold" },
  emptyState: { alignItems: "center", paddingVertical: 60, gap: 8 },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
  modalContainer: { flex: 1, paddingTop: Platform.OS === "web" ? 67 : 0 },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 16 },
  modalTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold" },
  saveButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  saveText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  modalForm: { paddingHorizontal: 20 },
  habitInput: { fontSize: 20, fontFamily: "Inter_600SemiBold", paddingVertical: 12, borderBottomWidth: 1, marginBottom: 24 },
  sectionLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 12 },
  colorGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 24 },
  colorDot: { width: 36, height: 36, borderRadius: 18 },
  iconGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 40 },
  iconButton: { width: 44, height: 44, borderRadius: 10, justifyContent: "center", alignItems: "center" },
});
