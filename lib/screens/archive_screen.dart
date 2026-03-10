import 'package:flutter/material.dart';
import '../models/task.dart';

class ArchiveScreen extends StatelessWidget {
  final List<Task> archivedTasks;
  final Function(Task) onRestore;
  final Function(Task) onDelete;

  const ArchiveScreen({
    super.key,
    required this.archivedTasks,
    required this.onRestore,
    required this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF1A1A2E),
      appBar: AppBar(
        backgroundColor: const Color(0xFF16213E),
        title: const Text(
          '🗄️ Архив',
          style: TextStyle(color: Colors.white),
        ),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: archivedTasks.isEmpty
          ? const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text('🗄️', style: TextStyle(fontSize: 64)),
                  SizedBox(height: 16),
                  Text(
                    'Архив пуст',
                    style: TextStyle(
                      color: Colors.white54,
                      fontSize: 18,
                    ),
                  ),
                  SizedBox(height: 8),
                  Text(
                    'Выполненные задачи появятся здесь',
                    style: TextStyle(
                      color: Colors.white38,
                      fontSize: 14,
                    ),
                  ),
                ],
              ),
            )
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: archivedTasks.length,
              itemBuilder: (context, index) {
                final task = archivedTasks[index];
                final daysInArchive = DateTime.now()
                    .difference(task.completedAt ?? task.createdAt)
                    .inDays;
                final willDeleteSoon = daysInArchive >= 50;

                return Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  decoration: BoxDecoration(
                    color: const Color(0xFF16213E),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: willDeleteSoon
                          ? Colors.orange.withOpacity(0.5)
                          : Colors.white12,
                    ),
                  ),
                  child: ListTile(
                    contentPadding: const EdgeInsets.all(12),
                    title: Text(
                      task.title,
                      style: const TextStyle(
                        color: Colors.white70,
                        decoration: TextDecoration.lineThrough,
                      ),
                    ),
                    subtitle: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SizedBox(height: 4),
                        Text(
                          'В архиве: $daysInArchive дней',
                          style: TextStyle(
                            color: willDeleteSoon
                                ? Colors.orange
                                : Colors.white38,
                            fontSize: 12,
                          ),
                        ),
                        if (willDeleteSoon)
                          const Text(
                            '⚠️ Скоро будет удалено автоматически',
                            style: TextStyle(
                              color: Colors.orange,
                              fontSize: 11,
                            ),
                          ),
                      ],
                    ),
                    trailing: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        // Восстановить
                        IconButton(
                          icon: const Icon(
                            Icons.restore,
                            color: Colors.green,
                          ),
                          onPressed: () => onRestore(task),
                          tooltip: 'Восстановить',
                        ),
                        // Удалить
                        IconButton(
                          icon: const Icon(
                            Icons.delete_forever,
                            color: Colors.red,
                          ),
                          onPressed: () => _confirmDelete(context, task),
                          tooltip: 'Удалить',
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
    );
  }

  void _confirmDelete(BuildContext context, Task task) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF16213E),
        title: const Text(
          'Удалить задачу?',
          style: TextStyle(color: Colors.white),
        ),
        content: Text(
          'Задача "${task.title}" будет удалена навсегда!',
          style: const TextStyle(color: Colors.white70),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Отмена'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(ctx);
              onDelete(task);
            },
            child: const Text(
              'Удалить',
              style: TextStyle(color: Colors.red),
            ),
          ),
        ],
      ),
    );
  }
}
