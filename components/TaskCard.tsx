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
  p1: "P1",
  p2: "P2",
  p3: "P3",
};

const priorityColors: Record<TaskPriority, string> = {
  p1: "#EF4444",
  p2: "#F59E0B",
  p3: "#6B7280",
};

export function TaskCard({ task, quadrantColor, onComplete, onPress, onPin }: TaskCardProps) {
  const colors = useColors();
  const subtaskProgress = task.subtasks.length > 0
    ? task.subtasks.filter((s) => s.isDone).length / task.subtasks.length
    : null;

  const isOverdue = task.deadline && new Date(task.deadline) < new Date() && !task.isCompleted;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.card,
          borderLeftColor: quadrantColor,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <View style={styles.row}>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onComplete();
          }}
          hitSlop={8}
          style={[styles.checkbox, { borderColor: quadrantColor }]}
        >
          {task.isCompleted && <Feather name="check" size={12} color={quadrantColor} />}
        </Pressable>

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text
              style={[
                styles.title,
                { color: colors.foreground },
                task.isCompleted && styles.completedTitle,
              ]}
              numberOfLines={1}
            >
              {task.title}
            </Text>
            {task.isPinned && <Feather name="bookmark" size={12} color={colors.primary} />}
          </View>

          {task.description ? (
            <Text style={[styles.description, { color: colors.mutedForeground }]} numberOfLines={1}>
              {task.description}
            </Text>
          ) : null}

          <View style={styles.meta}>
            <View style={[styles.priorityBadge, { backgroundColor: `${priorityColors[task.priority]}20` }]}>
              <Text style={[styles.priorityText, { color: priorityColors[task.priority] }]}>
                {priorityLabels[task.priority]}
              </Text>
            </View>

            {task.deadline && (
              <View style={styles.deadlineRow}>
                <Feather
                  name="clock"
                  size={10}
                  color={isOverdue ? colors.destructive : colors.mutedForeground}
                />
                <Text
                  style={[
                    styles.deadlineText,
                    { color: isOverdue ? colors.destructive : colors.mutedForeground },
                  ]}
                >
                  {new Date(task.deadline).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                </Text>
              </View>
            )}

            {subtaskProgress !== null && (
              <View style={styles.progressContainer}>
                <View style={[styles.progressBar, { backgroundColor: `${quadrantColor}30` }]}>
                  <View
                    style={[
                      styles.progressFill,
                      { backgroundColor: quadrantColor, width: `${subtaskProgress * 100}%` as any },
                    ]}
                  />
                </View>
              </View>
            )}

            {task.tags.length > 0 && (
              <Text style={[styles.tagText, { color: colors.mutedForeground }]} numberOfLines={1}>
                #{task.tags[0]}
              </Text>
            )}
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
    marginTop: 1,
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  title: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    flex: 1,
  },
  completedTitle: {
    textDecorationLine: "line-through",
    opacity: 0.5,
  },
  description: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 8,
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
  deadlineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  deadlineText: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
  },
  progressContainer: {
    width: 40,
  },
  progressBar: {
    height: 3,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  tagText: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
  },
});
