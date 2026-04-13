import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import { Task, TaskPriority } from "@/contexts/AppContext";

interface TaskCardProps {
  task: Task;
  quadrantColor: string;
  onComplete: () => void;
  onPress: () => void;
  onPin?: () => void;
}

const priorityLabels: Record<TaskPriority, string> = {
  p1: "П1",
  p2: "П2",
  p3: "П3",
};

const priorityColors: Record<TaskPriority, string> = {
  p1: "#EF4444",
  p2: "#F59E0B",
  p3: "#6B7280",
};

function formatDeadline(deadline: string): string {
  const date = new Date(deadline);
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  if (date.toDateString() === today.toDateString()) return "Сегодня";
  if (date.toDateString() === tomorrow.toDateString()) return "Завтра";

  return date.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

export function TaskCard({ task, quadrantColor, onComplete, onPress, onPin }: TaskCardProps) {
  const colors = useColors();
  const doneSubtasks = task.subtasks.filter((s) => s.isDone).length;
  const totalSubtasks = task.subtasks.length;
  const subtaskProgress = totalSubtasks > 0 ? doneSubtasks / totalSubtasks : null;
  const isOverdue = task.deadline && new Date(task.deadline) < new Date() && !task.isCompleted;

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onPin ? () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); onPin(); } : undefined}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.card,
          borderLeftColor: quadrantColor,
          opacity: task.isCompleted ? 0.6 : pressed ? 0.85 : 1,
        },
      ]}
    >
      <View style={styles.row}>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onComplete();
          }}
          hitSlop={10}
          style={[
            styles.checkbox,
            {
              borderColor: task.isCompleted ? quadrantColor : quadrantColor,
              backgroundColor: task.isCompleted ? `${quadrantColor}20` : "transparent",
            },
          ]}
        >
          {task.isCompleted && <Feather name="check" size={12} color={quadrantColor} />}
        </Pressable>

        <View style={styles.content}>
          <View style={styles.titleRow}>
            {task.isPinned && (
              <Feather name="bookmark" size={11} color={colors.primary} style={{ marginTop: 1 }} />
            )}
            <Text
              style={[
                styles.title,
                { color: colors.foreground },
                task.isCompleted && styles.completedTitle,
              ]}
              numberOfLines={2}
            >
              {task.title}
            </Text>
          </View>

          {task.description ? (
            <Text style={[styles.description, { color: colors.mutedForeground }]} numberOfLines={1}>
              {task.description}
            </Text>
          ) : null}

          {subtaskProgress !== null && (
            <View style={styles.subtaskRow}>
              <View style={[styles.subtaskTrack, { backgroundColor: `${quadrantColor}20` }]}>
                <View style={[styles.subtaskFill, { backgroundColor: quadrantColor, width: `${subtaskProgress * 100}%` as any }]} />
              </View>
              <Text style={[styles.subtaskCount, { color: colors.mutedForeground }]}>
                {doneSubtasks}/{totalSubtasks}
              </Text>
            </View>
          )}

          <View style={styles.meta}>
            <View style={[styles.priorityBadge, { backgroundColor: `${priorityColors[task.priority]}20` }]}>
              <Text style={[styles.priorityText, { color: priorityColors[task.priority] }]}>
                {priorityLabels[task.priority]}
              </Text>
            </View>

            {task.deadline && (
              <View style={[styles.deadlineChip, { backgroundColor: isOverdue ? "#EF444415" : `${colors.mutedForeground}10` }]}>
                <Feather
                  name="clock"
                  size={9}
                  color={isOverdue ? "#EF4444" : colors.mutedForeground}
                />
                <Text style={[styles.deadlineText, { color: isOverdue ? "#EF4444" : colors.mutedForeground }]}>
                  {formatDeadline(task.deadline)}
                </Text>
              </View>
            )}

            {task.tags.slice(0, 2).map((tag) => (
              <Text key={tag} style={[styles.tagText, { color: colors.primary }]}>
                #{tag}
              </Text>
            ))}
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
    flexShrink: 0,
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 5,
  },
  title: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    flex: 1,
    lineHeight: 19,
  },
  completedTitle: {
    textDecorationLine: "line-through",
    opacity: 0.45,
  },
  description: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 3,
    lineHeight: 16,
  },
  subtaskRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },
  subtaskTrack: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    overflow: "hidden",
  },
  subtaskFill: {
    height: "100%",
    borderRadius: 2,
  },
  subtaskCount: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 6,
    flexWrap: "wrap",
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 10,
    fontFamily: "Inter_700Bold",
  },
  deadlineChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  deadlineText: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
  },
  tagText: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
    opacity: 0.7,
  },
});
