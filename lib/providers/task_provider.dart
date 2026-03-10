import 'package:flutter/material.dart';
import '../models/task.dart';

class TaskProvider extends ChangeNotifier {
  final List<Task> _tasks = [];
  final List<Task> _archivedTasks = [];

  List<Task> get tasks => _tasks;
  List<Task> get archivedTasks => _archivedTasks;

  List<Task> getTasksByQuadrant(TaskQuadrant quadrant) {
    return _tasks.where((t) => t.quadrant == quadrant && !t.isCompleted).toList();
  }

  void addTask(Task task) {
    _tasks.add(task);
    notifyListeners();
  }

  void completeTask(Task task) {
    task.isCompleted = true;
    task.completedAt = DateTime.now();
    _tasks.remove(task);
    _archivedTasks.add(task);
    notifyListeners();
  }

  void restoreTask(Task task) {
    _archivedTasks.remove(task);
    task.isCompleted = false;
    task.completedAt = null;
    _tasks.add(task);
    notifyListeners();
  }

  void deleteTask(Task task) {
    _archivedTasks.remove(task);
    notifyListeners();
  }

  void moveTask(Task task, TaskQuadrant newQuadrant) {
    task.quadrant = newQuadrant;
    notifyListeners();
  }

  void pinTask(Task task) {
    task.isPinned = !task.isPinned;
    notifyListeners();
  }

  void checkAndDeleteOldTasks() {
    final toDelete = _archivedTasks.where((t) {
      final days = DateTime.now()
          .difference(t.completedAt ?? t.createdAt)
          .inDays;
      return days >= 60;
    }).toList();

    for (final task in toDelete) {
      _archivedTasks.remove(task);
    }
    if (toDelete.isNotEmpty) notifyListeners();
  }
}
