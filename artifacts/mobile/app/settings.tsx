import DateTimePicker from "@react-native-community/datetimepicker";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { useApp } from "@/contexts/AppContext";
import { requestNotificationPermission, scheduleDailyHabitReminders, cancelHabitReminder } from "@/hooks/useNotifications";

function StepperRow({ label, value, min, max, onDecrease, onIncrease, unit }: {
  label: string; value: number; min: number; max: number;
  onDecrease: () => void; onIncrease: () => void; unit: string;
}) {
  const colors = useColors();
  return (
    <View style={[styles.settingRow, { borderBottomColor: colors.border }]}>
      <Text style={[styles.settingLabel, { color: colors.foreground }]}>{label}</Text>
      <View style={styles.stepper}>
        <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onDecrease(); }}
          disabled={value <= min} style={[styles.stepBtn, { backgroundColor: colors.background, opacity: value <= min ? 0.4 : 1 }]}>
          <Feather name="minus" size={14} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.stepValue, { color: colors.foreground }]}>{value} {unit}</Text>
        <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onIncrease(); }}
          disabled={value >= max} style={[styles.stepBtn, { backgroundColor: colors.background, opacity: value >= max ? 0.4 : 1 }]}>
          <Feather name="plus" size={14} color={colors.foreground} />
        </Pressable>
      </View>
    </View>
  );
}

function SwitchRow({ label, subtitle, value, onToggle }: { label: string; subtitle?: string; value: boolean; onToggle: () => void }) {
  const colors = useColors();
  return (
    <View style={[styles.settingRow, { borderBottomColor: colors.border }]}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.settingLabel, { color: colors.foreground }]}>{label}</Text>
        {subtitle && <Text style={[styles.settingSubtitle, { color: colors.mutedForeground }]}>{subtitle}</Text>}
      </View>
      <Switch value={value} onValueChange={onToggle} trackColor={{ false: "#3e3e3e", true: "#A855F720" }} thumbColor={value ? "#A855F7" : "#666"} />
    </View>
  );
}

export default function SettingsScreen() {
  const colors = useColors();
  const router = useRouter();
  const { state, dispatch, updatePomodoroSettings, updateNotificationSettings } = useApp();
  const insets = useSafeAreaInsets();
  const s = state.pomodoroSettings;
  const n = state.notificationSettings;
  const [showTimePicker, setShowTimePicker] = useState(false);

  const update = (key: keyof typeof s, delta: number) => {
    updatePomodoroSettings({ ...s, [key]: s[key] + delta });
  };

  const toggleNotif = async (key: keyof typeof n) => {
    if (!n[key as keyof typeof n] && typeof n[key as keyof typeof n] === "boolean") {
      const granted = await requestNotificationPermission();
      if (!granted) {
        Alert.alert("Нет разрешения", "Разреши уведомления в настройках телефона");
        return;
      }
    }
    const updated = { ...n, [key]: !n[key as keyof typeof n] };
    updateNotificationSettings(updated);
    if (key === "habitReminders") {
      if (updated.habitReminders) {
        await scheduleDailyHabitReminders(state.habits, n.habitReminderHour, n.habitReminderMinute);
      } else {
        for (const h of state.habits) await cancelHabitReminder(h.id);
      }
    }
  };

  const handleReminderTimeChange = async (_: any, date?: Date) => {
    setShowTimePicker(false);
    if (!date) return;
    const updated = { ...n, habitReminderHour: date.getHours(), habitReminderMinute: date.getMinutes() };
    updateNotificationSettings(updated);
    if (n.habitReminders) await scheduleDailyHabitReminders(state.habits, date.getHours(), date.getMinutes());
  };

  const handleReset = () => {
    Alert.alert("Сбросить все данные?", "Все задачи, привычки, фокус-сессии и архив будут удалены. Это нельзя отменить.", [
      { text: "Отмена", style: "cancel" },
      { text: "Сбросить", style: "destructive", onPress: () => { dispatch({ type: "RESET_ALL" }); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); } },
    ]);
  };

  const totalFocusHours = Math.floor(state.focusSessions.reduce((s, f) => s + f.durationMinutes, 0) / 60);

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
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>УВЕДОМЛЕНИЯ</Text>
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <SwitchRow label="Напоминания о привычках" subtitle="Ежедневное уведомление" value={n.habitReminders} onToggle={() => toggleNotif("habitReminders")} />
          {n.habitReminders && (
            <Pressable onPress={() => setShowTimePicker(true)} style={[styles.settingRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.settingLabel, { color: colors.foreground }]}>Время напоминания</Text>
              <View style={[styles.timeChip, { backgroundColor: `${colors.primary}20` }]}>
                <Text style={[styles.timeText, { color: colors.primary }]}>
                  {String(n.habitReminderHour).padStart(2, "0")}:{String(n.habitReminderMinute).padStart(2, "0")}
                </Text>
              </View>
            </Pressable>
          )}
          {showTimePicker && Platform.OS !== "web" && (
            <DateTimePicker
              value={new Date(2000, 0, 1, n.habitReminderHour, n.habitReminderMinute)}
              mode="time" display="spinner"
              onChange={handleReminderTimeChange}
            />
          )}
          <SwitchRow label="Дедлайны задач" subtitle="За 1 день и в день дедлайна" value={n.deadlineReminders} onToggle={() => toggleNotif("deadlineReminders")} />
          <SwitchRow label="Pomodoro завершён" subtitle="Уведомление по окончании сессии" value={n.pomodoroAlerts} onToggle={() => toggleNotif("pomodoroAlerts")} />
        </View>

        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>POMODORO ТАЙМЕР</Text>
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <StepperRow label="Время работы" value={s.workDuration} min={5} max={90} onDecrease={() => update("workDuration", -5)} onIncrease={() => update("workDuration", 5)} unit="мин" />
          <StepperRow label="Короткий перерыв" value={s.shortBreakDuration} min={1} max={30} onDecrease={() => update("shortBreakDuration", -1)} onIncrease={() => update("shortBreakDuration", 1)} unit="мин" />
          <StepperRow label="Длинный перерыв" value={s.longBreakDuration} min={5} max={60} onDecrease={() => update("longBreakDuration", -5)} onIncrease={() => update("longBreakDuration", 5)} unit="мин" />
          <StepperRow label="Сессий до длинного перерыва" value={s.sessionsBeforeLongBreak} min={2} max={8} onDecrease={() => update("sessionsBeforeLongBreak", -1)} onIncrease={() => update("sessionsBeforeLongBreak", 1)} unit="шт" />
        </View>

        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>МОЯ СТАТИСТИКА</Text>
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          {[
            { icon: "check-square", label: "Выполнено задач", value: String(state.archivedTasks.length), color: "#22C55E" },
            { icon: "clock", label: "Часов в фокусе", value: String(totalFocusHours), color: "#A855F7" },
            { icon: "zap", label: "Фокус-сессий", value: String(state.focusSessions.length), color: "#F59E0B" },
            { icon: "target", label: "Привычек", value: String(state.habits.length), color: "#3B82F6" },
          ].map(({ icon, label, value, color }) => (
            <View key={label} style={[styles.infoRow, { borderBottomColor: colors.border }]}>
              <View style={styles.infoLeft}>
                <View style={[styles.infoIcon, { backgroundColor: `${color}20` }]}>
                  <Feather name={icon as any} size={14} color={color} />
                </View>
                <Text style={[styles.settingLabel, { color: colors.foreground }]}>{label}</Text>
              </View>
              <Text style={[styles.infoValue, { color }]}>{value}</Text>
            </View>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>О ПРИЛОЖЕНИИ</Text>
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          {[
            { label: "Версия", value: "2.2.0" },
            { label: "Технология", value: "Expo React Native" },
            { label: "Разработчик", value: "winchestersdc79" },
          ].map(({ label, value }) => (
            <View key={label} style={[styles.infoRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.settingLabel, { color: colors.foreground }]}>{label}</Text>
              <Text style={[styles.infoValue, { color: colors.mutedForeground }]}>{value}</Text>
            </View>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>ОПАСНАЯ ЗОНА</Text>
        <Pressable onPress={handleReset} style={({ pressed }) => [styles.dangerButton, { opacity: pressed ? 0.7 : 1 }]}>
          <Feather name="trash-2" size={16} color="#EF4444" />
          <Text style={styles.dangerText}>Сбросить все данные</Text>
        </Pressable>
        <View style={{ height: 60 }} />
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
  settingSubtitle: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  stepper: { flexDirection: "row", alignItems: "center", gap: 10 },
  stepBtn: { width: 28, height: 28, borderRadius: 8, justifyContent: "center", alignItems: "center" },
  stepValue: { fontSize: 14, fontFamily: "Inter_600SemiBold", minWidth: 60, textAlign: "center" },
  timeChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  timeText: { fontSize: 15, fontFamily: "Inter_700Bold" },
  infoRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  infoLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  infoIcon: { width: 28, height: 28, borderRadius: 8, justifyContent: "center", alignItems: "center" },
  infoValue: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  dangerButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "#EF444415", borderRadius: 12, borderWidth: 1, borderColor: "#EF444430", padding: 14 },
  dangerText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#EF4444" },
});
