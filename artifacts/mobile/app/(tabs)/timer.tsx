import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { useApp } from "@/contexts/AppContext";
import { sendPomodoroNotification } from "@/hooks/useNotifications";

type TimerMode = "work" | "shortBreak" | "longBreak";

const modeLabels: Record<TimerMode, string> = { work: "Фокус", shortBreak: "Перерыв", longBreak: "Длинный перерыв" };
const modeColors: Record<TimerMode, string> = { work: "#A855F7", shortBreak: "#22C55E", longBreak: "#3B82F6" };

export default function PomodoroScreen() {
  const colors = useColors();
  const { state, addFocusSession } = useApp();
  const insets = useSafeAreaInsets();
  const { pomodoroSettings } = state;

  const [mode, setMode] = useState<TimerMode>("work");
  const [timeLeft, setTimeLeft] = useState(pomodoroSettings.workDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [totalFocusToday, setTotalFocusToday] = useState(0);
  const [currentTask, setCurrentTask] = useState("");
  const [showTaskInput, setShowTaskInput] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  const getDuration = useCallback((m: TimerMode) => {
    switch (m) {
      case "work": return pomodoroSettings.workDuration * 60;
      case "shortBreak": return pomodoroSettings.shortBreakDuration * 60;
      case "longBreak": return pomodoroSettings.longBreakDuration * 60;
    }
  }, [pomodoroSettings]);

  useEffect(() => {
    const todayFocus = state.focusSessions
      .filter(s => new Date(s.date).toDateString() === new Date().toDateString())
      .reduce((sum, s) => sum + s.durationMinutes, 0);
    setTotalFocusToday(todayFocus);
  }, [state.focusSessions]);

  useEffect(() => {
    if (isRunning) {
      if (timeLeft === getDuration(mode)) startTimeRef.current = Date.now();
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setIsRunning(false);
            if (mode === "work") {
              const duration = pomodoroSettings.workDuration;
              addFocusSession(currentTask || "Pomodoro сессия", duration);
              setTotalFocusToday(t => t + duration);
              sendPomodoroNotification("work");
              const newSessions = sessionsCompleted + 1;
              setSessionsCompleted(newSessions);
              if (newSessions % pomodoroSettings.sessionsBeforeLongBreak === 0) {
                setMode("longBreak");
                return pomodoroSettings.longBreakDuration * 60;
              }
              setMode("shortBreak");
              return pomodoroSettings.shortBreakDuration * 60;
            }
            sendPomodoroNotification("break");
            setMode("work");
            return pomodoroSettings.workDuration * 60;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, mode, sessionsCompleted, pomodoroSettings, currentTask, getDuration, addFocusSession]);

  const toggleTimer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsRunning(false);
    setTimeLeft(getDuration(mode));
  };

  const switchMode = (newMode: TimerMode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(getDuration(newMode));
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const totalDuration = getDuration(mode);
  const progress = (totalDuration - timeLeft) / totalDuration;
  const activeColor = modeColors[mode];

  const activeTasks = state.tasks.filter(t => !t.isCompleted).slice(0, 5);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingTop: Platform.OS === "web" ? 67 : insets.top + 10 }]}>
        <Text style={[styles.screenTitle, { color: colors.foreground }]}>Фокус</Text>

        <View style={styles.modeSelector}>
          {(["work", "shortBreak", "longBreak"] as TimerMode[]).map((m) => (
            <Pressable key={m} onPress={() => switchMode(m)}
              style={[styles.modeButton, { backgroundColor: mode === m ? `${modeColors[m]}20` : "transparent", borderColor: mode === m ? modeColors[m] : colors.border, borderWidth: 1 }]}>
              <Text style={[styles.modeLabel, { color: mode === m ? modeColors[m] : colors.mutedForeground }]}>{modeLabels[m]}</Text>
            </Pressable>
          ))}
        </View>

        <View style={[styles.timerCard, { backgroundColor: colors.card }]}>
          {showTaskInput ? (
            <View style={styles.taskInputContainer}>
              <TextInput
                style={[styles.taskInput, { color: colors.foreground, borderBottomColor: activeColor }]}
                placeholder="Над чем работаешь? (необязательно)"
                placeholderTextColor={colors.mutedForeground}
                value={currentTask}
                onChangeText={setCurrentTask}
                onSubmitEditing={() => setShowTaskInput(false)}
                autoFocus
              />
              {activeTasks.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.taskSuggestions}>
                  {activeTasks.map(task => (
                    <Pressable key={task.id} onPress={() => { setCurrentTask(task.title); setShowTaskInput(false); }}
                      style={[styles.taskSuggestion, { backgroundColor: `${activeColor}15`, borderColor: `${activeColor}30` }]}>
                      <Text style={[styles.taskSuggestionText, { color: colors.foreground }]} numberOfLines={1}>{task.title}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              )}
            </View>
          ) : (
            <Pressable onPress={() => setShowTaskInput(true)} style={styles.taskDisplay}>
              <Feather name={currentTask ? "check-circle" : "plus-circle"} size={14} color={activeColor} />
              <Text style={[styles.taskDisplayText, { color: currentTask ? colors.foreground : colors.mutedForeground }]} numberOfLines={1}>
                {currentTask || "Добавить задачу..."}
              </Text>
            </Pressable>
          )}

          <View style={styles.timerContainer}>
            <View style={[styles.ringOuter, { borderColor: `${activeColor}15` }]}>
              <View style={[styles.ringProgress, { borderColor: activeColor, opacity: progress }]} />
              <View style={styles.timerContent}>
                <Text style={[styles.timerText, { color: colors.foreground }]}>
                  {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
                </Text>
                <Text style={[styles.modeText, { color: activeColor }]}>{modeLabels[mode]}</Text>
              </View>
            </View>
          </View>

          <View style={styles.controls}>
            <Pressable onPress={resetTimer}
              style={({ pressed }) => [styles.controlButton, { backgroundColor: `${colors.foreground}08`, opacity: pressed ? 0.7 : 1 }]}>
              <Feather name="rotate-ccw" size={20} color={colors.mutedForeground} />
            </Pressable>
            <Pressable onPress={toggleTimer}
              style={({ pressed }) => [styles.playButton, { backgroundColor: activeColor, transform: [{ scale: pressed ? 0.95 : 1 }], shadowColor: activeColor }]}>
              <Feather name={isRunning ? "pause" : "play"} size={28} color="#FFFFFF" />
            </Pressable>
            <Pressable onPress={() => switchMode(mode === "work" ? "shortBreak" : "work")}
              style={({ pressed }) => [styles.controlButton, { backgroundColor: `${colors.foreground}08`, opacity: pressed ? 0.7 : 1 }]}>
              <Feather name="skip-forward" size={20} color={colors.mutedForeground} />
            </Pressable>
          </View>
        </View>

        <View style={styles.sessionsRow}>
          {Array.from({ length: pomodoroSettings.sessionsBeforeLongBreak }, (_, i) => (
            <View key={i} style={[styles.sessionDot, { backgroundColor: i < (sessionsCompleted % pomodoroSettings.sessionsBeforeLongBreak) ? activeColor : `${activeColor}25` }]} />
          ))}
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.statNum, { color: activeColor }]}>{sessionsCompleted}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Сессий сегодня</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.statNum, { color: activeColor }]}>{totalFocusToday}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Минут фокуса</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.statNum, { color: activeColor }]}>{Math.floor(totalFocusToday / 60)}ч {totalFocusToday % 60}м</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Всего</Text>
          </View>
        </View>

        <View style={{ height: Platform.OS === "web" ? 34 : 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20 },
  screenTitle: { fontSize: 24, fontFamily: "Inter_700Bold", marginBottom: 16 },
  modeSelector: { flexDirection: "row", gap: 8, marginBottom: 20 },
  modeButton: { flex: 1, paddingVertical: 8, borderRadius: 20, alignItems: "center" },
  modeLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  timerCard: { borderRadius: 20, padding: 20, marginBottom: 16, alignItems: "center" },
  taskInputContainer: { width: "100%", marginBottom: 16 },
  taskInput: { fontSize: 14, fontFamily: "Inter_400Regular", paddingVertical: 8, borderBottomWidth: 2, color: "#fff" },
  taskSuggestions: { marginTop: 8 },
  taskSuggestion: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, marginRight: 8 },
  taskSuggestionText: { fontSize: 12, fontFamily: "Inter_400Regular", maxWidth: 140 },
  taskDisplay: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "center", marginBottom: 16, padding: 8 },
  taskDisplayText: { fontSize: 13, fontFamily: "Inter_500Medium", maxWidth: 220 },
  timerContainer: { alignItems: "center", justifyContent: "center", marginBottom: 24 },
  ringOuter: { width: 220, height: 220, borderRadius: 110, borderWidth: 6, justifyContent: "center", alignItems: "center" },
  ringProgress: { position: "absolute", width: 220, height: 220, borderRadius: 110, borderWidth: 6 },
  timerContent: { alignItems: "center" },
  timerText: { fontSize: 52, fontFamily: "Inter_700Bold", letterSpacing: 2 },
  modeText: { fontSize: 13, fontFamily: "Inter_500Medium", marginTop: 4 },
  controls: { flexDirection: "row", alignItems: "center", gap: 20 },
  controlButton: { width: 50, height: 50, borderRadius: 25, justifyContent: "center", alignItems: "center" },
  playButton: { width: 68, height: 68, borderRadius: 34, justifyContent: "center", alignItems: "center", elevation: 6, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.4, shadowRadius: 8 },
  sessionsRow: { flexDirection: "row", justifyContent: "center", gap: 8, marginBottom: 16 },
  sessionDot: { width: 12, height: 12, borderRadius: 6 },
  statsRow: { flexDirection: "row", gap: 10 },
  statCard: { flex: 1, borderRadius: 12, padding: 12, alignItems: "center" },
  statNum: { fontSize: 18, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 10, fontFamily: "Inter_400Regular", marginTop: 2, textAlign: "center" },
});
