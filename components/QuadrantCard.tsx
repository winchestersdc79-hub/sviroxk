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
  const totalSubtasks = tasks.reduce((acc, t) => acc + t.subtasks.length, 0);
  const doneSubtasks = tasks.reduce((acc, t) => acc + t.subtasks.filter((s) => s.isDone).length, 0);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: `${color}30`,
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

      <View style={styles.footer}>
        <View style={[styles.badge, { backgroundColor: `${color}20` }]}>
          <Text style={[styles.badgeText, { color }]}>{activeTasks.length}</Text>
        </View>
        {totalSubtasks > 0 && (
          <Text style={[styles.subtaskText, { color: colors.mutedForeground }]}>
            {doneSubtasks}/{totalSubtasks}
          </Text>
        )}
      </View>

      {activeTasks.length > 0 && (
        <View style={styles.taskPreview}>
          {activeTasks.slice(0, 2).map((task) => (
            <View key={task.id} style={[styles.previewDot, { backgroundColor: color }]} />
          ))}
          {activeTasks.length > 2 && (
            <Text style={[styles.moreText, { color: colors.mutedForeground }]}>
              +{activeTasks.length - 2}
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
    padding: 16,
    flex: 1,
    minHeight: 140,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  addButton: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    gap: 8,
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
  subtaskText: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  taskPreview: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 4,
  },
  previewDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  moreText: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    marginLeft: 2,
  },
});
