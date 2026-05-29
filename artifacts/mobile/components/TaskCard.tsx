import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import { Task, TaskPriority, TaskQuadrant, useApp } from "@/contexts/AppContext";
import { EditTaskModal } from "@/components/EditTaskModal";

interface TaskCardProps {
  task: Task;
  quadrantColor: string;
  onComplete: () => void;
  onPress: () => void;
  onPin?: () => void;
}

const priorityLabels: Record<TaskPriority, string> = { p1: "П1", p2: "П2", p3: "П3" };
const priorityColors: Record<TaskPriority, string> = { p1: "#EF4444", p2: "#F59E0B", p3: "#6B7280" };

const quadrantNames: Record<TaskQuadrant, string> = {
  urgentImportant: "Сделать",
  notUrgentImportant: "Запланировать",
  urgentNotImportant: "Делегировать",
  notUrgentNotImportant: "Убрать",
};

function formatDeadline(deadline: string): string {
  const date = new Date(deadline);
  const today = new Date();
  const tomorrow = new Date(); tomorrow.setDate(today.getDate() + 1);
  const diff = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (date.toDateString() === today.toDateString()) return "Сегодня";
  if (date.toDateString() === tomorrow.toDateString()) return "Завтра";
  if (diff > 0 && diff <= 7) return `Через ${diff} дн.`;
  if (diff < 0) return `${Math.abs(diff)} дн. назад`;
  return date.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

export function TaskCard({ task, quadrantColor, onComplete, onPress, onPin }: TaskCardProps) {
  const colors = useColors();
  const { deleteTask, moveTask } = useApp();
  const [menuVisible, setMenuVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [photoIndex, setPhotoIndex] = useState<number | null>(null);

  const doneSubtasks = task.subtasks.filter((s) => s.isDone).length;
  const totalSubtasks = task.subtasks.length;
  const subtaskProgress = totalSubtasks > 0 ? doneSubtasks / totalSubtasks : null;
  const isOverdue = task.deadline && new Date(task.deadline) < new Date() && !task.isCompleted;
  const imageUris = task.imageUris ?? [];

  const otherQuadrants: TaskQuadrant[] = (
    ["urgentImportant", "notUrgentImportant", "urgentNotImportant", "notUrgentNotImportant"] as TaskQuadrant[]
  ).filter(q => q !== task.quadrant);

  return (
    <>
      <Pressable
        onPress={onPress}
        onLongPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          setMenuVisible(true);
        }}
        style={({ pressed }) => [
          styles.card,
          { backgroundColor: colors.card, borderLeftColor: quadrantColor, opacity: task.isCompleted ? 0.55 : pressed ? 0.88 : 1 }
        ]}
      >
        <View style={styles.row}>
          <Pressable
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onComplete(); }}
            hitSlop={10}
            style={[styles.checkbox, { borderColor: quadrantColor, backgroundColor: task.isCompleted ? `${quadrantColor}25` : "transparent" }]}
          >
            {task.isCompleted && <Feather name="check" size={12} color={quadrantColor} />}
          </Pressable>

          <View style={styles.content}>
            <View style={styles.titleRow}>
              {task.isPinned && <Feather name="bookmark" size={11} color={colors.primary} style={{ marginTop: 1 }} />}
              <Text style={[styles.title, { color: colors.foreground }, task.isCompleted && styles.completedTitle]} numberOfLines={2}>
                {task.title}
              </Text>
            </View>
            {task.description ? (
              <Text style={[styles.description, { color: colors.mutedForeground }]} numberOfLines={1}>{task.description}</Text>
            ) : null}

            {/* Attached photos */}
            {imageUris.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoScroll}>
                {imageUris.map((uri, idx) => (
                  <Pressable key={idx} onPress={() => setPhotoIndex(idx)}>
                    <Image source={{ uri }} style={styles.photoThumb} />
                  </Pressable>
                ))}
              </ScrollView>
            )}

            {subtaskProgress !== null && (
              <View style={styles.subtaskRow}>
                <View style={[styles.subtaskTrack, { backgroundColor: `${quadrantColor}20` }]}>
                  <View style={[styles.subtaskFill, { backgroundColor: quadrantColor, width: `${subtaskProgress * 100}%` as any }]} />
                </View>
                <Text style={[styles.subtaskCount, { color: colors.mutedForeground }]}>{doneSubtasks}/{totalSubtasks}</Text>
              </View>
            )}

            <View style={styles.meta}>
              <View style={[styles.priorityBadge, { backgroundColor: `${priorityColors[task.priority]}20` }]}>
                <Text style={[styles.priorityText, { color: priorityColors[task.priority] }]}>{priorityLabels[task.priority]}</Text>
              </View>
              {task.deadline && (
                <View style={[styles.deadlineChip, { backgroundColor: isOverdue ? "#EF444415" : `${colors.mutedForeground}10` }]}>
                  <Feather name="clock" size={9} color={isOverdue ? "#EF4444" : colors.mutedForeground} />
                  <Text style={[styles.deadlineText, { color: isOverdue ? "#EF4444" : colors.mutedForeground }]}>{formatDeadline(task.deadline)}</Text>
                </View>
              )}
              {imageUris.length > 0 && (
                <View style={styles.attachBadge}>
                  <Feather name="image" size={9} color={colors.mutedForeground} />
                  <Text style={[styles.attachText, { color: colors.mutedForeground }]}>{imageUris.length}</Text>
                </View>
              )}
              {task.tags.slice(0, 1).map(tag => (
                <Text key={tag} style={[styles.tagText, { color: colors.primary }]}>#{tag}</Text>
              ))}
            </View>
          </View>

          <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setMenuVisible(true); }} hitSlop={8} style={styles.menuBtn}>
            <Feather name="more-vertical" size={14} color={colors.mutedForeground} />
          </Pressable>
        </View>
      </Pressable>

      {/* Context menu */}
      <Modal visible={menuVisible} transparent animationType="fade" onRequestClose={() => setMenuVisible(false)}>
        <Pressable style={styles.overlay} onPress={() => setMenuVisible(false)}>
          <View style={[styles.menu, { backgroundColor: colors.card, shadowColor: "#000" }]}>
            <Text style={[styles.menuTitle, { color: colors.mutedForeground }]} numberOfLines={1}>{task.title}</Text>
            <View style={[styles.menuDivider, { backgroundColor: colors.border }]} />

            <Pressable style={styles.menuItem} onPress={() => { setMenuVisible(false); setTimeout(() => setEditVisible(true), 200); }}>
              <Feather name="edit-2" size={16} color={colors.foreground} />
              <Text style={[styles.menuItemText, { color: colors.foreground }]}>Редактировать</Text>
            </Pressable>

            <Pressable style={styles.menuItem} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onPin?.(); setMenuVisible(false); }}>
              <Feather name="bookmark" size={16} color={task.isPinned ? colors.primary : colors.foreground} />
              <Text style={[styles.menuItemText, { color: task.isPinned ? colors.primary : colors.foreground }]}>
                {task.isPinned ? "Открепить" : "Закрепить"}
              </Text>
            </Pressable>

            <Pressable style={styles.menuItem} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onComplete(); setMenuVisible(false); }}>
              <Feather name="check-circle" size={16} color="#22C55E" />
              <Text style={[styles.menuItemText, { color: "#22C55E" }]}>Выполнено</Text>
            </Pressable>

            <View style={[styles.menuDivider, { backgroundColor: colors.border }]} />
            <Text style={[styles.menuSubTitle, { color: colors.mutedForeground }]}>Переместить в:</Text>
            {otherQuadrants.map(q => (
              <Pressable key={q} style={styles.menuItem} onPress={() => { moveTask(task.id, q); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setMenuVisible(false); }}>
                <Feather name="arrow-right" size={14} color={colors.mutedForeground} />
                <Text style={[styles.menuItemText, { color: colors.mutedForeground }]}>{quadrantNames[q]}</Text>
              </Pressable>
            ))}

            <View style={[styles.menuDivider, { backgroundColor: colors.border }]} />
            <Pressable style={styles.menuItem} onPress={() => { deleteTask(task.id); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); setMenuVisible(false); }}>
              <Feather name="trash-2" size={16} color="#EF4444" />
              <Text style={[styles.menuItemText, { color: "#EF4444" }]}>Удалить</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* Full-screen photo viewer */}
      <Modal visible={photoIndex !== null} transparent animationType="fade" onRequestClose={() => setPhotoIndex(null)}>
        <Pressable style={styles.photoViewer} onPress={() => setPhotoIndex(null)}>
          <Pressable onPress={(e) => e.stopPropagation()}>
            {photoIndex !== null && imageUris[photoIndex] && (
              <Image source={{ uri: imageUris[photoIndex] }} style={styles.photoFull} resizeMode="contain" />
            )}
          </Pressable>
          <Pressable style={styles.closePhoto} onPress={() => setPhotoIndex(null)}>
            <Feather name="x" size={20} color="#fff" />
          </Pressable>
          {photoIndex !== null && imageUris.length > 1 && (
            <View style={styles.photoDots}>
              {imageUris.map((_, i) => (
                <View key={i} style={[styles.photoDot, { backgroundColor: i === photoIndex ? "#fff" : "rgba(255,255,255,0.4)" }]} />
              ))}
            </View>
          )}
        </Pressable>
      </Modal>

      <EditTaskModal visible={editVisible} task={task} onClose={() => setEditVisible(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 12, padding: 12, marginBottom: 8, borderLeftWidth: 3 },
  row: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, justifyContent: "center", alignItems: "center", marginTop: 2, flexShrink: 0 },
  content: { flex: 1 },
  titleRow: { flexDirection: "row", alignItems: "flex-start", gap: 5 },
  title: { fontSize: 14, fontFamily: "Inter_600SemiBold", flex: 1, lineHeight: 19 },
  completedTitle: { textDecorationLine: "line-through", opacity: 0.45 },
  description: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 3, lineHeight: 16 },
  photoScroll: { marginTop: 8, marginBottom: 2 },
  photoThumb: { width: 52, height: 52, borderRadius: 8, marginRight: 6 },
  subtaskRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8 },
  subtaskTrack: { flex: 1, height: 3, borderRadius: 2, overflow: "hidden" },
  subtaskFill: { height: "100%", borderRadius: 2 },
  subtaskCount: { fontSize: 10, fontFamily: "Inter_500Medium" },
  meta: { flexDirection: "row", alignItems: "center", marginTop: 8, gap: 6, flexWrap: "wrap" },
  priorityBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  priorityText: { fontSize: 10, fontFamily: "Inter_700Bold" },
  deadlineChip: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  deadlineText: { fontSize: 10, fontFamily: "Inter_500Medium" },
  attachBadge: { flexDirection: "row", alignItems: "center", gap: 2, opacity: 0.6 },
  attachText: { fontSize: 10, fontFamily: "Inter_400Regular" },
  tagText: { fontSize: 10, fontFamily: "Inter_500Medium", opacity: 0.7 },
  menuBtn: { padding: 4, alignSelf: "flex-start", marginTop: 2 },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "center", alignItems: "center", padding: 20 },
  menu: { width: "100%", maxWidth: 320, borderRadius: 16, padding: 4, elevation: 20, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16 },
  menuTitle: { fontSize: 12, fontFamily: "Inter_500Medium", paddingHorizontal: 16, paddingVertical: 12 },
  menuDivider: { height: StyleSheet.hairlineWidth, marginVertical: 4 },
  menuSubTitle: { fontSize: 11, fontFamily: "Inter_500Medium", paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
  menuItem: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8 },
  menuItemText: { fontSize: 15, fontFamily: "Inter_400Regular" },
  photoViewer: { flex: 1, backgroundColor: "rgba(0,0,0,0.95)", justifyContent: "center", alignItems: "center" },
  photoFull: { width: 340, height: 400, borderRadius: 12 },
  closePhoto: { position: "absolute", top: 50, right: 20, width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.15)", justifyContent: "center", alignItems: "center" },
  photoDots: { position: "absolute", bottom: 60, flexDirection: "row", gap: 6 },
  photoDot: { width: 6, height: 6, borderRadius: 3 },
});
