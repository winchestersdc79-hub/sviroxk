import DateTimePicker from "@react-native-community/datetimepicker";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  Alert, Image, Modal, Platform, Pressable,
  ScrollView, StyleSheet, Text, TextInput, View,
} from "react-native";

import { useColors } from "@/hooks/useColors";
import { SubTask, TaskPriority, TaskQuadrant, useApp } from "@/contexts/AppContext";
import { scheduleDeadlineReminder } from "@/hooks/useNotifications";

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

async function requestMediaPermission(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== "granted") {
    Alert.alert("Нет доступа", "Разреши доступ к галерее в настройках телефона, чтобы прикреплять фото.");
    return false;
  }
  return true;
}

async function requestCameraPermission(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== "granted") {
    Alert.alert("Нет доступа к камере", "Разреши доступ к камере в настройках телефона.");
    return false;
  }
  return true;
}

export function AddTaskModal({ visible, onClose, defaultQuadrant }: AddTaskModalProps) {
  const colors = useColors();
  const { addTask } = useApp();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [quadrant, setQuadrant] = useState<TaskQuadrant>(defaultQuadrant || "urgentImportant");
  const [priority, setPriority] = useState<TaskPriority>("p2");
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [subtasks, setSubtasks] = useState<SubTask[]>([]);
  const [subtaskInput, setSubtaskInput] = useState("");
  const [imageUris, setImageUris] = useState<string[]>([]);

  const reset = () => {
    setTitle(""); setDescription(""); setQuadrant(defaultQuadrant || "urgentImportant");
    setPriority("p2"); setDeadline(null); setTagInput(""); setTags([]);
    setSubtasks([]); setSubtaskInput(""); setImageUris([]);
  };

  const handleAddTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) { setTags([...tags, t]); setTagInput(""); }
  };
  const handleAddSubtask = () => {
    const s = subtaskInput.trim();
    if (s) { setSubtasks([...subtasks, { id: generateId(), title: s, isDone: false }]); setSubtaskInput(""); }
  };

  const pickFromGallery = async () => {
    const ok = await requestMediaPermission();
    if (!ok) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 4,
      quality: 0.75,
      allowsEditing: false,
    });
    if (!result.canceled) {
      const uris = result.assets.map((a) => a.uri);
      setImageUris((prev) => [...prev, ...uris].slice(0, 4));
    }
  };

  const takePhoto = async () => {
    const ok = await requestCameraPermission();
    if (!ok) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.75,
      allowsEditing: true,
    });
    if (!result.canceled) {
      setImageUris((prev) => [...prev, result.assets[0].uri].slice(0, 4));
    }
  };

  const showImageOptions = () => {
    if (Platform.OS === "web") return;
    Alert.alert("Прикрепить фото", undefined, [
      { text: "Камера", onPress: takePhoto },
      { text: "Галерея", onPress: pickFromGallery },
      { text: "Отмена", style: "cancel" },
    ]);
  };

  const handleSave = async () => {
    if (!title.trim()) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const id = addTask({
      title: title.trim(),
      description: description.trim(),
      quadrant,
      priority,
      deadline: deadline ? deadline.toISOString() : null,
      isPinned: false,
      tags,
      subtasks,
      imageUris,
    });
    if (deadline) {
      const task = {
        id,
        title: title.trim(),
        description: description.trim(),
        quadrant,
        priority,
        deadline: deadline.toISOString(),
        isPinned: false,
        tags,
        subtasks,
        imageUris,
        isCompleted: false,
        completedAt: null,
        createdAt: new Date().toISOString(),
      };
      await scheduleDeadlineReminder(task as any);
    }
    reset();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Pressable onPress={() => { reset(); onClose(); }} hitSlop={8}>
            <Feather name="x" size={24} color={colors.mutedForeground} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Новая задача</Text>
          <Pressable onPress={handleSave} disabled={!title.trim()}
            style={[styles.saveButton, { backgroundColor: title.trim() ? colors.primary : colors.muted }]}>
            <Text style={[styles.saveText, { color: title.trim() ? colors.primaryForeground : colors.mutedForeground }]}>Создать</Text>
          </Pressable>
        </View>

        <ScrollView style={styles.form} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <TextInput
            style={[styles.titleInput, { color: colors.foreground, borderBottomColor: colors.primary }]}
            placeholder="Название задачи"
            placeholderTextColor={colors.mutedForeground}
            value={title} onChangeText={setTitle} autoFocus
          />
          <TextInput
            style={[styles.descInput, { color: colors.foreground, backgroundColor: colors.card, borderColor: colors.border }]}
            placeholder="Описание (необязательно)"
            placeholderTextColor={colors.mutedForeground}
            value={description} onChangeText={setDescription} multiline numberOfLines={3}
          />

          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Квадрант</Text>
          <View style={styles.optionGrid}>
            {quadrantOptions.map((opt) => (
              <Pressable key={opt.value} onPress={() => setQuadrant(opt.value)}
                style={[styles.optionChip, { backgroundColor: quadrant === opt.value ? `${opt.color}20` : colors.card, borderColor: quadrant === opt.value ? opt.color : colors.border, borderWidth: 1 }]}>
                <View style={[styles.optionDot, { backgroundColor: opt.color }]} />
                <Text style={[styles.optionLabel, { color: quadrant === opt.value ? opt.color : colors.mutedForeground }]} numberOfLines={2}>{opt.label}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Приоритет</Text>
          <View style={styles.priorityRow}>
            {priorityOptions.map((opt) => (
              <Pressable key={opt.value} onPress={() => setPriority(opt.value)}
                style={[styles.priorityChip, { backgroundColor: priority === opt.value ? `${opt.color}20` : colors.card, borderColor: priority === opt.value ? opt.color : colors.border, borderWidth: 1 }]}>
                <Text style={[styles.priorityLabel, { color: priority === opt.value ? opt.color : colors.mutedForeground }]}>{opt.label}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Дедлайн</Text>
          <View style={styles.deadlineRow}>
            <Pressable onPress={() => setShowDatePicker(true)}
              style={[styles.deadlineBtn, { backgroundColor: colors.card, borderColor: deadline ? colors.primary : colors.border, borderWidth: 1 }]}>
              <Feather name="calendar" size={16} color={deadline ? colors.primary : colors.mutedForeground} />
              <Text style={[styles.deadlineTxt, { color: deadline ? colors.foreground : colors.mutedForeground }]}>
                {deadline ? deadline.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" }) : "Выбрать дату"}
              </Text>
            </Pressable>
            {deadline && (
              <Pressable onPress={() => setDeadline(null)} hitSlop={8} style={[styles.clearBtn, { backgroundColor: colors.card }]}>
                <Feather name="x" size={14} color={colors.mutedForeground} />
              </Pressable>
            )}
          </View>
          {showDatePicker && Platform.OS !== "web" && (
            <DateTimePicker
              value={deadline || new Date()} mode="date" display="spinner"
              minimumDate={new Date()}
              onChange={(_, date) => { setShowDatePicker(false); if (date) setDeadline(date); }}
            />
          )}
          {showDatePicker && Platform.OS === "web" && (
            <input
              type="date"
              min={new Date().toISOString().split("T")[0]}
              style={{ padding: 10, borderRadius: 8, border: `1px solid ${colors.border}`, backgroundColor: colors.card, color: colors.foreground, fontSize: 14, marginBottom: 16 }}
              onChange={(e) => { setShowDatePicker(false); if (e.target.value) setDeadline(new Date(e.target.value)); }}
            />
          )}

          {/* Photos */}
          {Platform.OS !== "web" && (
            <>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Фото</Text>
              <View style={styles.photoRow}>
                {imageUris.map((uri, idx) => (
                  <View key={idx} style={styles.photoThumbWrapper}>
                    <Image source={{ uri }} style={styles.photoThumb} />
                    <Pressable onPress={() => setImageUris(imageUris.filter((_, i) => i !== idx))}
                      style={styles.photoRemove}>
                      <Feather name="x" size={10} color="#fff" />
                    </Pressable>
                  </View>
                ))}
                {imageUris.length < 4 && (
                  <Pressable onPress={showImageOptions}
                    style={[styles.photoAdd, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Feather name="camera" size={20} color={colors.mutedForeground} />
                    <Text style={[styles.photoAddText, { color: colors.mutedForeground }]}>Добавить</Text>
                  </Pressable>
                )}
              </View>
            </>
          )}

          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Подзадачи</Text>
          {subtasks.map((sub, idx) => (
            <View key={sub.id} style={[styles.subtaskRow, { borderBottomColor: colors.border }]}>
              <Feather name="circle" size={14} color={colors.mutedForeground} />
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
              value={subtaskInput} onChangeText={setSubtaskInput}
              onSubmitEditing={handleAddSubtask} returnKeyType="done"
            />
            <Pressable onPress={handleAddSubtask} style={[styles.addBtn, { backgroundColor: colors.primary }]}>
              <Feather name="plus" size={16} color={colors.primaryForeground} />
            </Pressable>
          </View>

          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Теги</Text>
          <View style={styles.tagList}>
            {tags.map((tag) => (
              <Pressable key={tag} onPress={() => setTags(tags.filter((t) => t !== tag))}
                style={[styles.tag, { backgroundColor: `${colors.primary}20` }]}>
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
              value={tagInput} onChangeText={setTagInput}
              onSubmitEditing={handleAddTag} returnKeyType="done"
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
  container: { flex: 1, paddingTop: Platform.OS === "web" ? 0 : 0 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 16, paddingTop: Platform.OS === "web" ? 20 : 16 },
  headerTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold" },
  saveButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  saveText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  form: { paddingHorizontal: 20 },
  titleInput: { fontSize: 20, fontFamily: "Inter_600SemiBold", paddingVertical: 12, borderBottomWidth: 2, marginBottom: 16 },
  descInput: { fontSize: 14, fontFamily: "Inter_400Regular", padding: 12, borderRadius: 10, borderWidth: 1, minHeight: 70, textAlignVertical: "top", marginBottom: 20 },
  sectionTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 10, marginTop: 4 },
  optionGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 20 },
  optionChip: { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8, gap: 6, width: "48%" as any },
  optionDot: { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  optionLabel: { fontSize: 11, fontFamily: "Inter_500Medium", flex: 1 },
  priorityRow: { flexDirection: "row", gap: 8, marginBottom: 20 },
  priorityChip: { flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: 8 },
  priorityLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  deadlineRow: { flexDirection: "row", gap: 8, marginBottom: 20, alignItems: "center" },
  deadlineBtn: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: 10 },
  deadlineTxt: { fontSize: 14, fontFamily: "Inter_400Regular" },
  clearBtn: { width: 36, height: 36, borderRadius: 8, justifyContent: "center", alignItems: "center" },
  photoRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 20 },
  photoThumbWrapper: { position: "relative" },
  photoThumb: { width: 72, height: 72, borderRadius: 10 },
  photoRemove: { position: "absolute", top: 4, right: 4, width: 18, height: 18, borderRadius: 9, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "center", alignItems: "center" },
  photoAdd: { width: 72, height: 72, borderRadius: 10, borderWidth: 1, borderStyle: "dashed" as any, justifyContent: "center", alignItems: "center", gap: 4 },
  photoAddText: { fontSize: 9, fontFamily: "Inter_500Medium" },
  subtaskRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth },
  subtaskText: { fontSize: 13, fontFamily: "Inter_400Regular", flex: 1 },
  inputRow: { flexDirection: "row", gap: 8, marginBottom: 20, marginTop: 4 },
  smallInput: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, borderWidth: 1 },
  addBtn: { width: 40, height: 40, borderRadius: 8, justifyContent: "center", alignItems: "center" },
  tagList: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 8 },
  tag: { flexDirection: "row", alignItems: "center", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, gap: 4 },
  tagText: { fontSize: 12, fontFamily: "Inter_500Medium" },
});
