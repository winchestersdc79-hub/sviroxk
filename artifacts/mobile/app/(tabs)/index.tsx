import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AddTaskModal } from "@/components/AddTaskModal";
import { QuadrantCard } from "@/components/QuadrantCard";
import { useColors } from "@/hooks/useColors";
import { TaskQuadrant, useApp } from "@/contexts/AppContext";
import { requestNotificationPermission } from "@/hooks/useNotifications";

const quadrants: {
  key: TaskQuadrant;
  title: string;
  subtitle: string;
  color: string;
  icon: keyof typeof Feather.glyphMap;
}[] = [
  { key: "urgentImportant", title: "Сделать", subtitle: "Срочно и важно", color: "#EF4444", icon: "alert-circle" },
  { key: "notUrgentImportant", title: "Запланировать", subtitle: "Не срочно, важно", color: "#F59E0B", icon: "star" },
  { key: "urgentNotImportant", title: "Делегировать", subtitle: "Срочно, не важно", color: "#22C55E", icon: "zap" },
  { key: "notUrgentNotImportant", title: "Убрать", subtitle: "Не срочно, не важно", color: "#6B7280", icon: "inbox" },
];

const QUOTES = [
  { text: "Начни делать необходимое, затем возможное, и вдруг ты обнаружишь, что делаешь невозможное.", author: "Франциск Ассизский" },
  { text: "Единственный способ делать великую работу — любить то, что делаешь.", author: "Стив Джобс" },
  { text: "Не жди. Времени никогда не будет правильным.", author: "Наполеон Хилл" },
  { text: "Маленькие дела, сделанные, лучше великих, задуманных.", author: "Петр Маршалл" },
  { text: "Либо ты управляешь своим днём, либо день управляет тобой.", author: "Джим Рон" },
  { text: "Успех — это сумма небольших усилий, повторяемых изо дня в день.", author: "Роберт Колье" },
  { text: "Дорогу осилит идущий.", author: "Русская пословица" },
  { text: "Фокус — это умение говорить нет.", author: "Стив Джобс" },
  { text: "Ваше время ограничено. Не тратьте его на чужую жизнь.", author: "Стив Джобс" },
  { text: "Чем больше ты делаешь, тем больше можешь сделать.", author: "Уильям Хэзлитт" },
  { text: "Вчера ты говорил, что сделаешь это завтра.", author: "Nike" },
  { text: "Дисциплина — это выбор между тем, чего ты хочешь сейчас, и тем, чего ты хочешь больше всего.", author: "Abraham Lincoln" },
];

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 6) return "Поздняя ночь 🌙";
  if (h < 12) return "Доброе утро ☀️";
  if (h < 17) return "Добрый день 👋";
  if (h < 22) return "Добрый вечер 🌆";
  return "Доброй ночи 🌙";
}

function getTodayQuote() {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return QUOTES[dayOfYear % QUOTES.length];
}

export default function MatrixScreen() {
  const colors = useColors();
  const { getTasksByQuadrant, state } = useApp();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedQuadrant, setSelectedQuadrant] = useState<TaskQuadrant | undefined>();
  const [showQuote, setShowQuote] = useState(true);
  const quote = getTodayQuote();

  useEffect(() => {
    requestNotificationPermission().catch(() => {});
  }, []);

  const activeTasks = state.tasks.filter((t) => !t.isCompleted);
  const overdueTasks = activeTasks.filter((t) => t.deadline && new Date(t.deadline) < new Date());
  const todayTasks = activeTasks.filter((t) => {
    const today = new Date().toISOString().split("T")[0];
    return t.deadline?.split("T")[0] === today;
  });
  const completedToday = state.archivedTasks.filter((t) => {
    const today = new Date().toISOString().split("T")[0];
    return t.completedAt?.split("T")[0] === today;
  }).length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingTop: Platform.OS === "web" ? 67 : insets.top + 10 }]}
      >
        {/* Header */}
        <View style={styles.topBar}>
          <View>
            <Text style={[styles.greeting, { color: colors.mutedForeground }]}>{getGreeting()}</Text>
            <Text style={[styles.screenTitle, { color: colors.foreground }]}>Матрица задач</Text>
          </View>
          <View style={styles.topActions}>
            <Pressable onPress={() => router.push("/search")} style={[styles.iconBtn, { backgroundColor: colors.card }]} hitSlop={8}>
              <Feather name="search" size={18} color={colors.foreground} />
            </Pressable>
            <Pressable onPress={() => router.push("/settings")} style={[styles.iconBtn, { backgroundColor: colors.card }]} hitSlop={8}>
              <Feather name="settings" size={18} color={colors.foreground} />
            </Pressable>
          </View>
        </View>

        {/* Stats strip */}
        <View style={styles.statsStrip}>
          {[
            { label: "Активных", value: activeTasks.length, color: colors.primary, icon: "list" as const },
            { label: "Сегодня", value: todayTasks.length, color: "#F59E0B", icon: "clock" as const },
            { label: "Просрочено", value: overdueTasks.length, color: overdueTasks.length > 0 ? "#EF4444" : colors.mutedForeground, icon: "alert-triangle" as const },
            { label: "Выполнено", value: completedToday, color: "#22C55E", icon: "check-circle" as const },
          ].map(({ label, value, color, icon }) => (
            <View key={label} style={[styles.statItem, { backgroundColor: colors.card }]}>
              <Feather name={icon} size={14} color={color} />
              <Text style={[styles.statNum, { color }]}>{value}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{label}</Text>
            </View>
          ))}
        </View>

        {/* Daily Quote */}
        {showQuote && (
          <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setShowQuote(false); }}
            style={[styles.quoteCard, { backgroundColor: `${colors.primary}12`, borderColor: `${colors.primary}30` }]}>
            <View style={styles.quoteHeader}>
              <Feather name="zap" size={14} color={colors.primary} />
              <Text style={[styles.quoteLabel, { color: colors.primary }]}>Цитата дня</Text>
              <Feather name="x" size={14} color={colors.mutedForeground} />
            </View>
            <Text style={[styles.quoteText, { color: colors.foreground }]}>"{quote.text}"</Text>
            <Text style={[styles.quoteAuthor, { color: colors.mutedForeground }]}>— {quote.author}</Text>
          </Pressable>
        )}

        {/* Overdue alert */}
        {overdueTasks.length > 0 && (
          <Pressable
            onPress={() => router.push("/search")}
            style={[styles.alertBanner, { backgroundColor: "#EF444412", borderColor: "#EF444430" }]}
          >
            <Feather name="alert-triangle" size={14} color="#EF4444" />
            <Text style={[styles.alertText, { color: "#EF4444" }]}>
              {overdueTasks.length} {overdueTasks.length === 1 ? "просроченная задача" : "просроченных задачи"} — требуют внимания
            </Text>
            <Feather name="chevron-right" size={14} color="#EF4444" />
          </Pressable>
        )}

        {/* Quadrant Grid */}
        <View style={styles.grid}>
          {quadrants.map((q) => {
            const tasks = getTasksByQuadrant(q.key);
            return (
              <QuadrantCard
                key={q.key}
                title={q.title}
                subtitle={q.subtitle}
                color={q.color}
                icon={q.icon}
                tasks={tasks}
                onPress={() => router.push(`/quadrant/${q.key}`)}
                onAddTask={() => {
                  setSelectedQuadrant(q.key);
                  setModalVisible(true);
                }}
              />
            );
          })}
        </View>

        {/* Shortcuts */}
        <View style={styles.shortcuts}>
          <Pressable onPress={() => router.push("/archive")}
            style={[styles.shortcut, { backgroundColor: colors.card }]}>
            <Feather name="archive" size={16} color={colors.mutedForeground} />
            <Text style={[styles.shortcutLabel, { color: colors.mutedForeground }]}>Архив</Text>
            {state.archivedTasks.length > 0 && (
              <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                <Text style={styles.badgeText}>{state.archivedTasks.length}</Text>
              </View>
            )}
          </Pressable>
          <Pressable onPress={() => router.push("/search")}
            style={[styles.shortcut, { backgroundColor: colors.card }]}>
            <Feather name="search" size={16} color={colors.mutedForeground} />
            <Text style={[styles.shortcutLabel, { color: colors.mutedForeground }]}>Поиск</Text>
          </Pressable>
        </View>

        <View style={{ height: Platform.OS === "web" ? 34 : 100 }} />
      </ScrollView>

      {/* FAB */}
      <Pressable
        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setSelectedQuadrant(undefined); setModalVisible(true); }}
        style={({ pressed }) => [styles.fab, { backgroundColor: colors.primary, transform: [{ scale: pressed ? 0.93 : 1 }], shadowColor: colors.primary }]}
      >
        <Feather name="plus" size={26} color={colors.primaryForeground} />
      </Pressable>

      <AddTaskModal
        visible={modalVisible}
        onClose={() => { setModalVisible(false); setSelectedQuadrant(undefined); }}
        defaultQuadrant={selectedQuadrant}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 16 },
  topBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  greeting: { fontSize: 13, fontFamily: "Inter_400Regular" },
  screenTitle: { fontSize: 24, fontFamily: "Inter_700Bold", marginTop: 2 },
  topActions: { flexDirection: "row", gap: 8, alignItems: "center" },
  iconBtn: { width: 38, height: 38, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  statsStrip: { flexDirection: "row", gap: 8, marginBottom: 14 },
  statItem: { flex: 1, borderRadius: 10, padding: 10, alignItems: "center", gap: 4 },
  statNum: { fontSize: 18, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 9, fontFamily: "Inter_400Regular", textAlign: "center" },
  quoteCard: { borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1 },
  quoteHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8, justifyContent: "space-between" },
  quoteLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", flex: 1 },
  quoteText: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 19, fontStyle: "italic", marginBottom: 6 },
  quoteAuthor: { fontSize: 11, fontFamily: "Inter_500Medium" },
  alertBanner: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 14 },
  alertText: { flex: 1, fontSize: 13, fontFamily: "Inter_500Medium" },
  grid: { gap: 10, marginBottom: 12 },
  shortcuts: { flexDirection: "row", gap: 10 },
  shortcut: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 10, padding: 12 },
  shortcutLabel: { fontSize: 13, fontFamily: "Inter_500Medium" },
  badge: { marginLeft: "auto" as any, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  badgeText: { fontSize: 10, fontFamily: "Inter_700Bold", color: "#fff" },
  fab: { position: "absolute", bottom: 94, right: 20, width: 56, height: 56, borderRadius: 28, justifyContent: "center", alignItems: "center", elevation: 8, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12 },
});
