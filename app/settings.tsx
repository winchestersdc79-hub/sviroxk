import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { useApp } from "@/contexts/AppContext";

function StepperRow({ label, value, min, max, onDecrease, onIncrease, unit }: {
  label: string; value: number; min: number; max: number;
  onDecrease: () => void; onIncrease: () => void; unit: string;
}) {
  const colors = useColors();
  return (
    <View style={[styles.settingRow, { borderBottomColor: colors.border }]}>
      <Text style={[styles.settingLabel, { color: colors.foreground }]}>{label}</Text>
      <View style={styles.stepper}>
        <Pressable
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onDecrease(); }}
          disabled={value <= min}
          style={[styles.stepBtn, { backgroundColor: colors.card, opacity: value <= min ? 0.4 : 1 }]}
        >
          <Feather name="minus" size={14} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.stepValue, { color: colors.foreground }]}>{value} {unit}</Text>
        <Pressable
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onIncrease(); }}
          disabled={value >= max}
          style={[styles.stepBtn, { backgroundColor: colors.card, opacity: value >= max ? 0.4 : 1 }]}
        >
          <Feather name="plus" size={14} color={colors.foreground} />
        </Pressable>
      </View>
    </View>
  );
}

export default function SettingsScreen() {
  const colors = useColors();
  const router = useRouter();
  const { state, dispatch } = useApp();
  const insets = useSafeAreaInsets();
  const s = state.pomodoroSettings;

  const update = (key: keyof typeof s, delta: number) => {
    dispatch({ type: "UPDATE_POMODORO_SETTINGS", payload: { ...s, [key]: s[key] + delta } });
  };

  const handleReset = () => {
    Alert.alert(
      "Сбросить все данные?",
      "Все задачи, привычки и архив будут удалены. Это действие нельзя отменить.",
      [
        { text: "Отмена", style: "cancel" },
        {
          text: "Сбросить",
          style: "destructive",
          onPress: () => {
            dispatch({ type: "RESET_ALL" });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: Platform.OS === "web" ? 67 : insets.top + 10 }]}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Настройки</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>POMODORO ТАЙМЕР</Text>
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <StepperRow
            label="Время работы"
            value={s.workDuration}
            min={5} max={90}
            onDecrease={() => update("workDuration", -5)}
            onIncrease={() => update("workDuration", 5)}
            unit="мин"
          />
          <StepperRow
            label="Короткий перерыв"
            value={s.shortBreakDuration}
            min={1} max={30}
            onDecrease={() => update("shortBreakDuration", -1)}
            onIncrease={() => update("shortBreakDuration", 1)}
            unit="мин"
          />
          <StepperRow
            label="Длинный перерыв"
            value={s.longBreakDuration}
            min={5} max={60}
            onDecrease={() => update("longBreakDuration", -5)}
            onIncrease={() => update("longBreakDuration", 5)}
            unit="мин"
          />
          <StepperRow
            label="Сессий до длинного перерыва"
            value={s.sessionsBeforeLongBreak}
            min={2} max={8}
            onDecrease={() => update("sessionsBeforeLongBreak", -1)}
            onIncrease={() => update("sessionsBeforeLongBreak", 1)}
            unit="шт"
          />
        </View>

        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>ИНФОРМАЦИЯ</Text>
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          {[
            { icon: "grid", label: "Версия приложения", value: "2.1.0" },
            { icon: "code", label: "Технология", value: "Expo React Native" },
            { icon: "user", label: "Разработано", value: "winchestersdc79" },
          ].map(({ icon, label, value }) => (
            <View key={label} style={[styles.infoRow, { borderBottomColor: colors.border }]}>
              <View style={styles.infoLeft}>
                <Feather name={icon as any} size={16} color={colors.mutedForeground} />
                <Text style={[styles.settingLabel, { color: colors.foreground }]}>{label}</Text>
              </View>
              <Text style={[styles.infoValue, { color: colors.mutedForeground }]}>{value}</Text>
            </View>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>СТАТИСТИКА</Text>
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          {[
            { label: "Активных задач", value: String(state.tasks.filter(t => !t.isCompleted).length) },
            { label: "Выполнено всего", value: String(state.archivedTasks.length) },
            { label: "Привычек", value: String(state.habits.length) },
          ].map(({ label, value }) => (
            <View key={label} style={[styles.infoRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.settingLabel, { color: colors.foreground }]}>{label}</Text>
              <Text style={[styles.infoValue, { color: colors.primary }]}>{value}</Text>
            </View>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>ОПАСНАЯ ЗОНА</Text>
        <Pressable
          onPress={handleReset}
          style={({ pressed }) => [styles.dangerButton, { opacity: pressed ? 0.7 : 1 }]}
        >
          <Feather name="trash-2" size={16} color="#EF4444" />
          <Text style={styles.dangerText}>Сбросить все данные</Text>
        </Pressable>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 16 },
  headerTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  content: { paddingHorizontal: 16 },
  sectionTitle: { fontSize: 11, fontFamily: "Inter_600SemiBold", marginBottom: 8, marginTop: 20, letterSpacing: 0.8 },
  section: { borderRadius: 14, overflow: "hidden" },
  settingRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  settingLabel: { fontSize: 15, fontFamily: "Inter_400Regular" },
  stepper: { flexDirection: "row", alignItems: "center", gap: 12 },
  stepBtn: { width: 28, height: 28, borderRadius: 8, justifyContent: "center", alignItems: "center" },
  stepValue: { fontSize: 15, fontFamily: "Inter_600SemiBold", minWidth: 60, textAlign: "center" },
  infoRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  infoLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  infoValue: { fontSize: 14, fontFamily: "Inter_400Regular" },
  dangerButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "#EF444415", borderRadius: 12, borderWidth: 1, borderColor: "#EF444430", padding: 14, marginTop: 0 },
  dangerText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#EF4444" },
});
