import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useColors } from "@/hooks/useColors";
import { SubTask, TaskPriority, TaskQuadrant, useApp } from "@/contexts/AppContext";

interface AddTaskModalProps {
  visible: boolean;
  onClose: () => void;
  defaultQuadrant?: TaskQuadrant;
}

const quadrantOptions: { value: TaskQuadrant; label: string; color: string }[] = [
  { value: "urgentImportant", label: "Срочно и важно", color: "#EF4444" },
  { value: "notUrgentImportant", label: "Не срочно, важно", color: "#F59E0B" },
  { value: "urgentNotImportant", label: "Срочно, не важно", color: "#22C55E" },
  { value: "notUrgentNotImportant", label: "Не срочно, не важно", color: "#6B7280" },
];

const priorityOptions: { value: TaskPriority; label: string; color: string }[] = [
  { value: "p1", label: "Высокий", color: "#EF4444" },
  { value: "p2", label: "Средний", color: "#F59E0B" },
  { value: "p3", label: "Низкий", color: "#6B7280" },
];

const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

function getQuickDeadlines() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const in3Days = new Date(today);
  in3Days.setDate(in3Days.getDate() + 3);
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);
  const nextMonth = new Date(today);
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  return [
    { label: "Сегодня", date: today },
    { label: "Завтра", date: tomorrow },
    { label: "Через 3 дня", date: in3Days },
    { label: "Через неделю", date: nextWeek },
    { label: "Через месяц", date: nextMonth },
  ];
}

function formatDeadlineDisplay(date: Date): string {
  return date.toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" });
}

export function AddTaskModal({ visible, onClose, defaultQuadrant }: AddTaskModalProps) {
  const colors = useColors();
  const { addTask } = useApp();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [quadrant, setQuadrant] = useState<TaskQuadrant>(defaultQuadrant || "urgentImportant");
  const [priority, setPriority] = useState<TaskPriority>("p2");
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [subtasks, setSubtasks] = useState<SubTask[]>([]);
  const [subtaskInput, setSubtaskInput] = useState("");

  const quickDeadlines = getQuickDeadlines();

  const reset = () => {
    setTitle("");
    setDescription("");
    setQuadrant(defaultQuadrant || "urgentImportant");
    setPriority("p2");
    setDeadline(null);
    setTagInput("");
    setTags([]);
    setSubtasks([]);
    setSubtaskInput("");
  };

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setTagInput("");
    }
  };

  const handleAddSubtask = () => {
    const sub = subtaskInput.trim();
    if (sub) {
      setSubtasks([...subtasks, { id: generateId(), title: sub, isDone: false }]);
      setSubtaskInput("");
    }
  };

  const handleSave = () => {
    if (!title.trim()) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addTask({
      title: title.trim(),
      description: description.trim(),
      quadrant,
      priority,
      deadline: deadline ? deadline.toISOString() : null,
      isPinned: false,
      tags,
      subtasks,
    });
    reset();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Pressable onPress={onClose} hitSlop={8}>
            <Feather name="x" size={24} color={colors.mutedForeground} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Новая задача</Text>
          <Pressable
            onPress={handleSave}
            disabled={!title.trim()}
            style={({ pressed }) => [
              styles.saveButton,
              { backgroundColor: title.trim() ? colors.primary : colors.muted, opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <Text style={[styles.saveText, { color: title.trim() ? colors.primaryForeground : colors.mutedForeground }]}>
              Сохранить
            </Text>
          </Pressable>
        </View>

        <ScrollView style={styles.form} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <TextInput
            style={[styles.titleInput, { color: colors.foreground, borderBottomColor: colors.border }]}
            placeholder="Название задачи"
            placeholderTextColor={colors.mutedForeground}
            value={title}
            onChangeText={setTitle}
            autoFocus
          />

          <TextInput
            style={[styles.descInput, { color: colors.foreground, backgroundColor: colors.card, borderColor: colors.border }]}
            placeholder="Описание (необязательно)"
            placeholderTextColor={colors.mutedForeground}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />

          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Квадрант</Text>
          <View style={styles.optionGrid}>
            {quadrantOptions.map((opt) => (
              <Pressable
                key={opt.value}
                onPress={() => setQuadrant(opt.value)}
                style={[
                  styles.optionChip,
                  {
                    backgroundColor: quadrant === opt.value ? `${opt.color}20` : colors.card,
                    borderColor: quadrant === opt.value ? opt.color : colors.border,
                    borderWidth: 1,
                  },
                ]}
              >
                <View style={[styles.optionDot, { backgroundColor: opt.color }]} />
                <Text
                  style={[
                    styles.optionLabel,
                    { color: quadrant === opt.value ? opt.color : colors.mutedForeground },
                  ]}
                  numberOfLines={2}
                >
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Приоритет</Text>
          <View style={styles.priorityRow}>
            {priorityOptions.map((opt) => (
              <Pressable
                key={opt.value}
                onPress={() => setPriority(opt.value)}
                style={[
                  styles.priorityChip,
                  {
                    backgroundColor: priority === opt.value ? `${opt.color}20` : colors.card,
                    borderColor: priority === opt.value ? opt.color : colors.border,
                    borderWidth: 1,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.priorityLabel,
                    { color: priority === opt.value ? opt.color : colors.mutedForeground },
                  ]}
                >
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Дедлайн</Text>
          <View style={styles.deadlineSection}>
            {deadline && (
              <View style={[styles.selectedDeadline, { backgroundColor: `${colors.primary}15`, borderColor: `${colors.primary}30` }]}>
                <Feather name="calendar" size={14} color={colors.primary} />
                <Text style={[styles.selectedDeadlineText, { color: colors.primary }]}>
                  {formatDeadlineDisplay(deadline)}
                </Text>
                <Pressable onPress={() => setDeadline(null)} hitSlop={8}>
                  <Feather name="x" size={14} color={colors.primary} />
                </Pressable>
              </View>
            )}
            <View style={styles.deadlineGrid}>
              {quickDeadlines.map((qd) => {
                const isActive = deadline && deadline.toDateString() === qd.date.toDateString();
                return (
                  <Pressable
                    key={qd.label}
                    onPress={() => setDeadline(isActive ? null : qd.date)}
                    style={[
                      styles.deadlineChip,
                      {
                        backgroundColor: isActive ? `${colors.primary}20` : colors.card,
                        borderColor: isActive ? colors.primary : colors.border,
                        borderWidth: 1,
                      },
                    ]}
                  >
                    <Text style={[styles.deadlineChipText, { color: isActive ? colors.primary : colors.mutedForeground }]}>
                      {qd.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Подзадачи</Text>
          {subtasks.map((sub, idx) => (
            <View key={sub.id} style={[styles.subtaskRow, { borderBottomColor: colors.border }]}>
              <Feather name="check-circle" size={14} color={colors.mutedForeground} />
              <Text style={[styles.subtaskText, { color: colors.foreground }]}>{sub.title}</Text>
              <Pressable onPress={() => setSubtasks(subtasks.filter((_, i) => i !== idx))} hitSlop={8}>
                <Feather name="x" size={14} color={colors.mutedForeground} />
              </Pressable>
            </View>
          ))}
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.smallInput, { color: colors.foreground, backgroundColor: colors.card, borderColor: colors.border }]}
              placeholder="Добавить подзадачу"
              placeholderTextColor={colors.mutedForeground}
              value={subtaskInput}
              onChangeText={setSubtaskInput}
              onSubmitEditing={handleAddSubtask}
              returnKeyType="done"
            />
            <Pressable onPress={handleAddSubtask} style={[styles.addBtn, { backgroundColor: colors.primary }]}>
              <Feather name="plus" size={16} color={colors.primaryForeground} />
            </Pressable>
          </View>

          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Теги</Text>
          <View style={styles.tagList}>
            {tags.map((tag) => (
              <Pressable
                key={tag}
                onPress={() => setTags(tags.filter((t) => t !== tag))}
                style={[styles.tag, { backgroundColor: `${colors.primary}20` }]}
              >
                <Text style={[styles.tagText, { color: colors.primary }]}>#{tag}</Text>
                <Feather name="x" size={10} color={colors.primary} />
              </Pressable>
            ))}
          </View>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.smallInput, { color: colors.foreground, backgroundColor: colors.card, borderColor: colors.border }]}
              placeholder="Добавить тег"
              placeholderTextColor={colors.mutedForeground}
              value={tagInput}
              onChangeText={setTagInput}
              onSubmitEditing={handleAddTag}
              returnKeyType="done"
            />
            <Pressable onPress={handleAddTag} style={[styles.addBtn, { backgroundColor: colors.primary }]}>
              <Feather name="plus" size={16} color={colors.primaryForeground} />
            </Pressable>
          </View>

          <View style={{ height: 60 }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === "web" ? 67 : 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  form: {
    paddingHorizontal: 20,
  },
  titleInput: {
    fontSize: 20,
    fontFamily: "Inter_600SemiBold",
    paddingVertical: 12,
    borderBottomWidth: 1,
    marginBottom: 16,
  },
  descInput: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    minHeight: 70,
    textAlignVertical: "top",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 10,
    marginTop: 4,
  },
  optionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  optionChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
    width: "48%" as any,
  },
  optionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    flexShrink: 0,
  },
  optionLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    flex: 1,
  },
  priorityRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },
  priorityChip: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 8,
  },
  priorityLabel: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  deadlineSection: {
    marginBottom: 20,
    gap: 10,
  },
  selectedDeadline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  selectedDeadlineText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    flex: 1,
  },
  deadlineGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  deadlineChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  deadlineChipText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  subtaskRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  subtaskText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    flex: 1,
  },
  inputRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
    marginTop: 4,
  },
  smallInput: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  tagList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 8,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  tagText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
});
