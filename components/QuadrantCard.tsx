import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import { Task, TaskQuadrant } from "@/contexts/AppContext";

interface QuadrantCardProps {
  title: string;
  subtitle: string;
  color: string;
  icon: keyof typeof Feather.glyphMap;
  tasks: Task[];
  onPress: () => void;
  onAddTask: () => void;
}

export function QuadrantCard({ title, subtitle, color, icon, tasks, onPress, onAddTask }: QuadrantCardProps) {
  const colors = useColors();
  const activeTasks = tasks.filter((t) => !t.isCompleted);
  const completedTasks = tasks.filter((t) => t.isCompleted);
  const totalTasks = tasks.length;
  const progress = totalTasks > 0 ? completedTasks.length / totalTasks : 0;
  const overdueCount = activeTasks.filter((t) => t.deadline && new Date(t.deadline) < new Date()).length;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: `${color}25`,
          borderWidth: 1,
          transform: [{ scale: pressed ? 0.97 : 1 }],
        },
      ]}
    >
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
          <Feather name={icon} size={18} color={color} />
        </View>
        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onAddTask();
          }}
          hitSlop={8}
          style={({ pressed }) => [
            styles.addButton,
            { backgroundColor: `${color}15`, opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Feather name="plus" size={14} color={color} />
        </Pressable>
      </View>

      <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={1}>
        {title}
      </Text>
      <Text style={[styles.subtitle, { color: colors.mutedForeground }]} numberOfLines={1}>
        {subtitle}
      </Text>

      {totalTasks > 0 && (
        <View style={styles.progressRow}>
          <View style={[styles.progressTrack, { backgroundColor: `${color}15` }]}>
            <View style={[styles.progressFill, { backgroundColor: color, width: `${progress * 100}%` as any }]} />
          </View>
        </View>
      )}

      <View style={styles.footer}>
        <View style={[styles.badge, { backgroundColor: `${color}20` }]}>
          <Text style={[styles.badgeText, { color }]}>{activeTasks.length}</Text>
        </View>
        {overdueCount > 0 && (
          <View style={[styles.overdueBadge, { backgroundColor: "#EF444415" }]}>
            <Feather name="alert-circle" size={9} color="#EF4444" />
            <Text style={[styles.overdueText, { color: "#EF4444" }]}>{overdueCount}</Text>
          </View>
        )}
      </View>

      {activeTasks.length > 0 && (
        <View style={styles.taskPreview}>
          {activeTasks.slice(0, 2).map((task) => (
            <Text key={task.id} style={[styles.taskPreviewText, { color: colors.mutedForeground }]} numberOfLines={1}>
              · {task.title}
            </Text>
          ))}
          {activeTasks.length > 2 && (
            <Text style={[styles.moreText, { color: `${color}80` }]}>
              + ещё {activeTasks.length - 2}
            </Text>
          )}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 14,
    flex: 1,
    minHeight: 160,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  iconContainer: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  addButton: {
    width: 26,
    height: 26,
    borderRadius: 7,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
  },
  progressRow: {
    marginTop: 10,
    marginBottom: 2,
  },
  progressTrack: {
    height: 3,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: "Inter_700Bold",
  },
  overdueBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  overdueText: {
    fontSize: 10,
    fontFamily: "Inter_700Bold",
  },
  taskPreview: {
    marginTop: 8,
    gap: 2,
  },
  taskPreviewText: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
  },
  moreText: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
    marginTop: 2,
  },
});
