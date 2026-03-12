import 'package:flutter/material.dart';
import '../models/task.dart';

class AddTaskScreen extends StatefulWidget {
  const AddTaskScreen({super.key});

  @override
  State<AddTaskScreen> createState() => _AddTaskScreenState();
}

class _AddTaskScreenState extends State<AddTaskScreen> {
  final _titleController = TextEditingController();
  final _descController = TextEditingController();
  TaskQuadrant _quadrant = TaskQuadrant.urgentImportant;
  TaskPriority _priority = TaskPriority.p1;
  DateTime? _deadline;

  final _quadrants = [
    {'label': '🔴 Важно & Срочно', 'value': TaskQuadrant.urgentImportant, 'color': Color(0xFFE74C3C)},
    {'label': '🟡 Важно & Не срочно', 'value': TaskQuadrant.notUrgentImportant, 'color': Color(0xFFF39C12)},
    {'label': '🟢 Не важно & Срочно', 'value': TaskQuadrant.urgentNotImportant, 'color': Color(0xFF27AE60)},
    {'label': '⚪ Не важно & Не срочно', 'value': TaskQuadrant.notUrgentNotImportant, 'color': Color(0xFF7F8C8D)},
  ];

  void _save() {
    if (_titleController.text.isEmpty) return;
    final task = Task(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      title: _titleController.text,
      description: _descController.text,
      quadrant: _quadrant,
      priority: _priority,
      deadline: _deadline,
      createdAt: DateTime.now(),
    );
    Navigator.pop(context, task);
  }

  Future<void> _pickDate() async {
    final date = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365)),
      builder: (ctx, child) => Theme(
        data: ThemeData.dark().copyWith(
          colorScheme: const ColorScheme.dark(primary: Color(0xFF9B59B6)),
        ),
        child: child!,
      ),
    );
    if (date != null) setState(() => _deadline = date);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0D0D1A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0D0D1A),
        title: const Text(
          '➕ Новая задача',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
        iconTheme: const IconThemeData(color: Colors.white),
        actions: [
          TextButton(
            onPressed: _save,
            child: const Text(
              'Сохранить',
              style: TextStyle(
                color: Color(0xFF9B59B6),
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            TextField(
              controller: _titleController,
              style: const TextStyle(color: Colors.white, fontSize: 18),
              decoration: InputDecoration(
                hintText: 'Название задачи...',
                hintStyle: const TextStyle(color: Colors.white38),
                filled: true,
                fillColor: const Color(0xFF16213E),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16),
                  borderSide: BorderSide.none,
                ),
                contentPadding: const EdgeInsets.all(16),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _descController,
              style: const TextStyle(color: Colors.white),
              maxLines: 3,
              decoration: InputDecoration(
                hintText: 'Описание (необязательно)...',
                hintStyle: const TextStyle(color: Colors.white38),
                filled: true,
                fillColor: const Color(0xFF16213E),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16),
                  borderSide: BorderSide.none,
                ),
                contentPadding: const EdgeInsets.all(16),
              ),
            ),
            const SizedBox(height: 24),
            const Text(
              'Квадрант',
              style: TextStyle(
                color: Colors.white,
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            ..._quadrants.map((q) {
              final isSelected = _quadrant == q['value'];
              final color = q['color'] as Color;
              return GestureDetector(
                onTap: () => setState(() => _quadrant = q['value'] as TaskQuadrant),
                child: Container(
                  margin: const EdgeInsets.only(bottom: 8),
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: isSelected ? color.withOpacity(0.2) : const Color(0xFF16213E),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: isSelected ? color : Colors.white12,
                      width: isSelected ? 2 : 1,
                    ),
                  ),
                  child: Text(
                    q['label'] as String,
                    style: TextStyle(
                      color: isSelected ? color : Colors.white70,
                      fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                    ),
                  ),
                ),
              );
            }),
            const SizedBox(height: 24),
            const Text(
              'Приоритет',
              style: TextStyle(
                color: Colors.white,
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                _buildPriority('🔥 P1', TaskPriority.p1, const Color(0xFFE74C3C)),
                const SizedBox(width: 8),
                _buildPriority('⚡ P2', TaskPriority.p2, const Color(0xFFF39C12)),
                const SizedBox(width: 8),
                _buildPriority('💤 P3', TaskPriority.p3, const Color(0xFF7F8C8D)),
              ],
            ),
            const SizedBox(height: 24),
            const Text(
              'Дедлайн',
              style: TextStyle(
                color: Colors.white,
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            GestureDetector(
              onTap: _pickDate,
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFF16213E),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: _deadline != null
                        ? const Color(0xFF9B59B6)
                        : Colors.white12,
                  ),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.calendar_today, color: Color(0xFF9B59B6)),
                    const SizedBox(width: 12),
                    Text(
                      _deadline == null
                          ? 'Выбрать дату...'
                          : '${_deadline!.day}.${_deadline!.month}.${_deadline!.year}',
                      style: TextStyle(
                        color: _deadline == null ? Colors.white38 : Colors.white,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 32),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _save,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF9B59B6),
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                ),
                child: const Text(
                  'Создать задачу',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPriority(String label, TaskPriority p, Color color) {
    final isSelected = _priority == p;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _priority = p),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(
            color: isSelected ? color.withOpacity(0.2) : const Color(0xFF16213E),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: isSelected ? color : Colors.white12,
              width: isSelected ? 2 : 1,
            ),
          ),
          child: Text(
            label,
            textAlign: TextAlign.center,
            style: TextStyle(
              color: isSelected ? color : Colors.white70,
              fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
            ),
          ),
        ),
      ),
    );
  }
}
