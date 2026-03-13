import 'package:flutter/material.dart';
import 'package:productivity_app/models/task.dart';
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
      backgroundColor: const Color(0xFF0D0D1A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0D0D1A),
        title: const Text(
          '🗄️ Архив',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
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
                    style: TextStyle(color: Colors.white54, fontSize: 18),
                  ),
                  SizedBox(height: 8),
                  Text(
                    'Выполненные задачи появятся здесь',
                    style: TextStyle(color: Colors.white38, fontSize: 14),
                  ),
                ],
              ),
            )
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: archivedTasks.length,
              itemBuilder: (ctx, i) {
                final task = archivedTasks[i];
                final days = DateTime.now()
                    .difference(task.completedAt ?? task.createdAt)
                    .inDays;
                final isOld = days >= 50;

                return Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  decoration: BoxDecoration(
                    color: const Color(0xFF16213E),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: isOld
                          ? Colors.orange.withOpacity(0.5)
                          : Colors.white12,
                    ),
                  ),
                  child: ListTile(
                    contentPadding: const EdgeInsets.all(16),
                    title: Text(
                      task.title,
                      style: const TextStyle(
                        color: Colors.white70,
                        decoration: TextDecoration.lineThrough,
                        fontSize: 16,
                      ),
                    ),
                    subtitle: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SizedBox(height: 4),
                        Text(
                          '✅ Выполнено $days дней назад',
                          style: TextStyle(
                            color: isOld ? Colors.orange : Colors.white38,
                            fontSize: 12,
                          ),
                        ),
                        if (isOld)
                          const Text(
                            '⚠️ Будет удалено через 10 дней',
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
                        IconButton(
                          icon: const Icon(
                            Icons.restore,
                            color: Color(0xFF9B59B6),
                          ),
                          onPressed: () => onRestore(task),
                        ),
                        IconButton(
                          icon: const Icon(
                            Icons.delete_outline,
                            color: Colors.red,
                          ),
                          onPressed: () => _confirmDelete(context, task),
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
          '"${task.title}" будет удалена навсегда.',
          style: const TextStyle(color: Colors.white70),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text(
              'Отмена',
              style: TextStyle(color: Colors.white54),
            ),
          ),
          ElevatedButton(
            onPressed: () {
              onDelete(task);
              Navigator.pop(ctx);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            child: const Text(
              'Удалить',
              style: TextStyle(color: Colors.white),
            ),
          ),
        ],
      ),
    );
  }
}
