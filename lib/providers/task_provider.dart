import 'package:flutter/material.dart';
import 'package:productivity_app/models/task.dart';
import 'package:productivity_app/services/storage_service.dart';
import 'package:productivity_app/services/notification_service.dart';
class TaskProvider extends ChangeNotifier {
  List<Task> _tasks = [];
  List<Task> _archivedTasks = [];
  bool _isLoading = true;

  List<Task> get tasks => _tasks;
  List<Task> get archivedTasks => _archivedTasks;
  bool get isLoading => _isLoading;

  TaskProvider() {
    _loadData();
  }

  Future<void> _loadData() async {
    _tasks = await StorageService.loadTasks();
    _archivedTasks = await StorageService.loadArchivedTasks();
    _isLoading = false;
    notifyListeners();
  }

  List<Task> getTasksByQuadrant(TaskQuadrant quadrant) {
    return _tasks.where((t) => t.quadrant == quadrant && !t.isCompleted).toList();
  }

  Future<void> addTask(Task task) async {
    _tasks.add(task);
    notifyListeners();
    await StorageService.saveTasks(_tasks);
    await NotificationService.scheduleTaskReminder(task);
  }

  Future<void> completeTask(Task task) async {
    task.isCompleted = true;
    task.completedAt = DateTime.now();
    _tasks.remove(task);
    _archivedTasks.add(task);
    notifyListeners();
    await StorageService.saveTasks(_tasks);
    await StorageService.saveArchivedTasks(_archivedTasks);
    await NotificationService.cancelTaskReminder(task);
    await NotificationService.showInstantNotification(
      '✅ Задача выполнена!',
      '"${task.title}" перемещена в архив',
    );
  }

  Future<void> restoreTask(Task task) async {
    _archivedTasks.remove(task);
    task.isCompleted = false;
    task.completedAt = null;
    _tasks.add(task);
    notifyListeners();
    await StorageService.saveTasks(_tasks);
    await StorageService.saveArchivedTasks(_archivedTasks);
    await NotificationService.scheduleTaskReminder(task);
  }

  Future<void> deleteTask(Task task) async {
    _archivedTasks.remove(task);
    notifyListeners();
    await StorageService.saveArchivedTasks(_archivedTasks);
    await NotificationService.cancelTaskReminder(task);
  }

  Future<void> moveTask(Task task, TaskQuadrant newQuadrant) async {
    task.quadrant = newQuadrant;
    notifyListeners();
    await StorageService.saveTasks(_tasks);
  }

  Future<void> pinTask(Task task) async {
    task.isPinned = !task.isPinned;
    notifyListeners();
    await StorageService.saveTasks(_tasks);
  }

  Future<void> checkAndDeleteOldTasks() async {
    final toDelete = _archivedTasks.where((t) {
      final days = DateTime.now()
          .difference(t.completedAt ?? t.createdAt)
          .inDays;
      return days >= 60;
    }).toList();
    for (final task in toDelete) {
      _archivedTasks.remove(task);
    }
    if (toDelete.isNotEmpty) {
      notifyListeners();
      await StorageService.saveArchivedTasks(_archivedTasks);
    }
  }
}
