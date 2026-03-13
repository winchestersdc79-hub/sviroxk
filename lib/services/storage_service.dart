import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:productivity_app/models/task.dart';
class StorageService {
  static const String _tasksKey = 'tasks';
  static const String _archivedKey = 'archived_tasks';

  static Future<void> saveTasks(List<Task> tasks) async {
    final prefs = await SharedPreferences.getInstance();
    final list = tasks.map((t) => _taskToMap(t)).toList();
    await prefs.setString(_tasksKey, jsonEncode(list));
  }

  static Future<void> saveArchivedTasks(List<Task> tasks) async {
    final prefs = await SharedPreferences.getInstance();
    final list = tasks.map((t) => _taskToMap(t)).toList();
    await prefs.setString(_archivedKey, jsonEncode(list));
  }

  static Future<List<Task>> loadTasks() async {
    final prefs = await SharedPreferences.getInstance();
    final str = prefs.getString(_tasksKey);
    if (str == null) return [];
    final list = jsonDecode(str) as List;
    return list.map((m) => _taskFromMap(m)).toList();
  }

  static Future<List<Task>> loadArchivedTasks() async {
    final prefs = await SharedPreferences.getInstance();
    final str = prefs.getString(_archivedKey);
    if (str == null) return [];
    final list = jsonDecode(str) as List;
    return list.map((m) => _taskFromMap(m)).toList();
  }

  static Map<String, dynamic> _taskToMap(Task task) {
    return {
      'id': task.id,
      'title': task.title,
      'description': task.description,
      'quadrant': task.quadrant.index,
      'priority': task.priority.index,
      'deadline': task.deadline?.toIso8601String(),
      'isCompleted': task.isCompleted,
      'isPinned': task.isPinned,
      'createdAt': task.createdAt.toIso8601String(),
      'completedAt': task.completedAt?.toIso8601String(),
      'tags': task.tags,
      'subtasks': task.subtasks.map((s) => {
        'title': s.title,
        'isDone': s.isDone,
      }).toList(),
    };
  }

  static Task _taskFromMap(Map<String, dynamic> m) {
    return Task(
      id: m['id'],
      title: m['title'],
      description: m['description'] ?? '',
      quadrant: TaskQuadrant.values[m['quadrant']],
      priority: TaskPriority.values[m['priority']],
      deadline: m['deadline'] != null ? DateTime.parse(m['deadline']) : null,
      isCompleted: m['isCompleted'] ?? false,
      isPinned: m['isPinned'] ?? false,
      createdAt: DateTime.parse(m['createdAt']),
      completedAt: m['completedAt'] != null ? DateTime.parse(m['completedAt']) : null,
      tags: List<String>.from(m['tags'] ?? []),
      subtasks: (m['subtasks'] as List? ?? []).map((s) => SubTask(
        title: s['title'],
        isDone: s['isDone'],
      )).toList(),
    );
  }
}
