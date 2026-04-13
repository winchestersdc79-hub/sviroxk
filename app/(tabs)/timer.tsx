import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { useApp } from "@/contexts/AppContext";

type TimerMode = "work" | "shortBreak" | "longBreak";

const modeLabels: Record<TimerMode, string> = {
  work: "Фокус",
  shortBreak: "Короткий перерыв",
  longBreak: "Длинный перерыв",
};

const modeColors: Record<TimerMode, string> = {
  work: "#A855F7",
  shortBreak: "#22C55E",
  longBreak: "#3B82F6",
};

export default function PomodoroScreen() {
  const colors = useColors();
  const { state } = useApp();
  const insets = useSafeAreaInsets();
  const { pomodoroSettings } = state;

  const [mode, setMode] = useState<TimerMode>("work");
  const [timeLeft, setTimeLeft] = useState(pomodoroSettings.workDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const getDuration = useCallback(
    (m: TimerMode) => {
      switch (m) {
        case "work": return pomodoroSettings.workDuration * 60;
        case "shortBreak": return pomodoroSettings.shortBreakDuration * 60;
        case "longBreak": return pomodoroSettings.longBreakDuration * 60;
      }
    },
    [pomodoroSettings]
  );

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setIsRunning(false);
            if (mode === "work") {
              const newSessions = sessionsCompleted + 1;
              setSessionsCompleted(newSessions);
              if (newSessions % pomodoroSettings.sessionsBeforeLongBreak === 0) {
                setMode("longBreak");
                return pomodoroSettings.longBreakDuration * 60;
              }
              setMode("shortBreak");
              return pomodoroSettings.shortBreakDuration * 60;
            }
            setMode("work");
            return pomodoroSettings.workDuration * 60;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, mode, sessionsCompleted, pomodoroSettings]);

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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.content, { paddingTop: Platform.OS === "web" ? 67 : insets.top + 10 }]}>
        <Text style={[styles.screenTitle, { color: colors.foreground }]}>Pomodoro</Text>

        <View style={styles.modeSelector}>
          {(["work", "shortBreak", "longBreak"] as TimerMode[]).map((m) => (
            <Pressable
              key={m}
              onPress={() => switchMode(m)}
              style={[
                styles.modeButton,
                {
                  backgroundColor: mode === m ? `${modeColors[m]}20` : "transparent",
                  borderColor: mode === m ? modeColors[m] : colors.border,
                  borderWidth: 1,
                },
              ]}
            >
              <Text style={[styles.modeLabel, { color: mode === m ? modeColors[m] : colors.mutedForeground }]}>
                {modeLabels[m]}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.timerContainer}>
          <View style={styles.timerRing}>
            <View style={[styles.ringBg, { borderColor: `${activeColor}15` }]} />
            <View style={[styles.progressArc, {
              borderColor: activeColor,
              borderTopColor: "transparent",
              borderRightColor: progress > 0.25 ? activeColor : "transparent",
              borderBottomColor: progress > 0.5 ? activeColor : "transparent",
              borderLeftColor: progress > 0.75 ? activeColor : "transparent",
              transform: [{ rotate: `${progress * 360}deg` }],
            }]} />
            <View style={styles.timerContent}>
              <Text style={[styles.timerText, { color: colors.foreground }]}>
                {minutes.toString().padStart(2, "0")}:{seconds.toString().padStart(2, "0")}
              </Text>
              <Text style={[styles.modeText, { color: activeColor }]}>{modeLabels[mode]}</Text>
            </View>
          </View>
        </View>

        <View style={styles.controls}>
          <Pressable
            onPress={resetTimer}
            style={({ pressed }) => [styles.controlButton, { backgroundColor: colors.card, opacity: pressed ? 0.7 : 1 }]}
          >
            <Feather name="rotate-ccw" size={20} color={colors.mutedForeground} />
          </Pressable>
          <Pressable
            onPress={toggleTimer}
            style={({ pressed }) => [styles.playButton, { backgroundColor: activeColor, transform: [{ scale: pressed ? 0.95 : 1 }] }]}
          >
            <Feather name={isRunning ? "pause" : "play"} size={28} color="#FFFFFF" />
          </Pressable>
          <Pressable
            onPress={() => {
              const nextMode = mode === "work"
                ? (sessionsCompleted > 0 && (sessionsCompleted + 1) % pomodoroSettings.sessionsBeforeLongBreak === 0 ? "longBreak" : "shortBreak")
                : "work";
              switchMode(nextMode);
            }}
            style={({ pressed }) => [styles.controlButton, { backgroundColor: colors.card, opacity: pressed ? 0.7 : 1 }]}
          >
            <Feather name="skip-forward" size={20} color={colors.mutedForeground} />
          </Pressable>
        </View>

        <View style={styles.sessionsRow}>
          {Array.from({ length: pomodoroSettings.sessionsBeforeLongBreak }, (_, i) => (
            <View
              key={i}
              style={[styles.sessionDot, {
                backgroundColor: i < sessionsCompleted % pomodoroSettings.sessionsBeforeLongBreak
                  ? activeColor : `${activeColor}30`,
              }]}
            />
          ))}
        </View>
        <Text style={[styles.sessionCount, { color: colors.mutedForeground }]}>
          Завершено сессий: {sessionsCompleted}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 20, alignItems: "center" },
  screenTitle: { fontSize: 24, fontFamily: "Inter_700Bold", marginBottom: 20, alignSelf: "flex-start" },
  modeSelector: { flexDirection: "row", gap: 8, marginBottom: 40 },
  modeButton: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
  modeLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  timerContainer: { alignItems: "center", justifyContent: "center", marginBottom: 40 },
  timerRing: { width: 240, height: 240, justifyContent: "center", alignItems: "center" },
  ringBg: { position: "absolute", width: 240, height: 240, borderRadius: 120, borderWidth: 4 },
  progressArc: { position: "absolute", width: 240, height: 240, borderRadius: 120, borderWidth: 4 },
  timerContent: { alignItems: "center" },
  timerText: { fontSize: 52, fontFamily: "Inter_700Bold", letterSpacing: 2 },
  modeText: { fontSize: 14, fontFamily: "Inter_500Medium", marginTop: 4 },
  controls: { flexDirection: "row", alignItems: "center", gap: 20, marginBottom: 32 },
  controlButton: { width: 48, height: 48, borderRadius: 24, justifyContent: "center", alignItems: "center" },
  playButton: { width: 64, height: 64, borderRadius: 32, justifyContent: "center", alignItems: "center", elevation: 4, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4 },
  sessionsRow: { flexDirection: "row", gap: 8, marginBottom: 8 },
  sessionDot: { width: 12, height: 12, borderRadius: 6 },
  sessionCount: { fontSize: 13, fontFamily: "Inter_400Regular" },
});
