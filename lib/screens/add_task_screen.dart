import 'package:flutter/material.dart';
import '../models/task.dart';

class AddTaskScreen extends StatefulWidget {
  const AddTaskScreen({super.key});

  @override
  State<AddTaskScreen> createState() => _AddTaskScreenState();
}

class _AddTaskScreenState extends State<AddTaskScreen> {
  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();
  TaskQuadrant _selectedQuadrant = TaskQuadrant.urgentImportant;
  TaskPriority _selectedPriority = TaskPriority.p2;
  DateTime? _deadline;

  final _quadrantColors = {
    TaskQuadrant.urgentImportant: const Color(0xFFE74C3C),
    TaskQuadrant.notUrgentImportant: const Color(0xFFF39C12),
    TaskQuadrant.urgentNotImportant: const Color(0xFF27AE60),
    TaskQuadrant.notUrgentNotImportant: const Color(0xFF7F8C8D),
  };

  final _quadrantNames = {
    TaskQuadrant.urgentImportant: '🔴 Важно & Срочно',
    TaskQuadrant.notUrgentImportant: '🟡 Важно & Не срочно',
    TaskQuadrant.urgentNotImportant: '🟢 Не важно & Срочно',
    TaskQuadrant.notUrgentNotImportant: '⚪ Не важно & Не срочно',
  };

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF1A1A2E),
      appBar: AppBar(
        backgroundColor: const Color(0xFF16213E),
        title: const Text(
          '➕ Новая задача',
          style: TextStyle(color: Colors.white),
        ),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Название
            _buildLabel('Название задачи *'),
            const SizedBox(height: 8),
            _buildTextField(_titleController, 'Введите название...'),
            const SizedBox(height: 16),

            // Описание
            _buildLabel('Описание'),
            const SizedBox(height: 8),
            _buildTextField(
              _descriptionController,
              'Введите описание...',
              maxLines: 3,
            ),
            const SizedBox(height: 16),

            // Квадрант
            _buildLabel('Тип задачи'),
            const SizedBox(height: 8),
            ...TaskQuadrant.values.map((q) => _buildQuadrantOption(q)),
            const SizedBox(height: 16),

            // Приоритет
            _buildLabel('Приоритет'),
            const SizedBox(height: 8),
            Row(
              children: TaskPriority.values
                  .map((p) => _buildPriorityChip(p))
                  .toList(),
            ),
            const SizedBox(height: 16),

            // Дедлайн
            _buildLabel('Дедлайн'),
            const SizedBox(height: 8),
            _buildDeadlinePicker(),
            const SizedBox(height: 32),

            // Кнопка сохранить
            SizedBox(
              width: double.infinity,
              height: 56,
              child: ElevatedButton(
                onPressed: _saveTask,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF9B59B6),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                ),
                child: const Text(
                  'Сохранить задачу',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 16,
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

  Widget _buildLabel(String text) {
    return Text(
      text,
      style: const TextStyle(
        color: Colors.white70,
        fontSize: 14,
        fontWeight: FontWeight.bold,
      ),
    );
  }

  Widget _buildTextField(
    TextEditingController controller,
    String hint, {
    int maxLines = 1,
  }) {
    return TextField(
      controller: controller,
      maxLines: maxLines,
      style: const TextStyle(color: Colors.white),
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: const TextStyle(color: Colors.white38),
        filled: true,
        fillColor: const Color(0xFF16213E),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide.none,
        ),
      ),
    );
  }

  Widget _buildQuadrantOption(TaskQuadrant quadrant) {
    final isSelected = _selectedQuadrant == quadrant;
    final color = _quadrantColors[quadrant]!;
    return GestureDetector(
      onTap: () => setState(() => _selectedQuadrant = quadrant),
      child: Container(
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: isSelected ? color.withOpacity(0.2) : const Color(0xFF16213E),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? color : Colors.white24,
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Row(
          children: [
            Icon(
              isSelected ? Icons.radio_button_checked : Icons.radio_button_off,
              color: isSelected ? color : Colors.white38,
              size: 20,
            ),
            const SizedBox(width: 12),
            Text(
              _quadrantNames[quadrant]!,
              style: TextStyle(
                color: isSelected ? color : Colors.white70,
                fontWeight:
                    isSelected ? FontWeight.bold : FontWeight.normal,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPriorityChip(TaskPriority priority) {
    final isSelected = _selectedPriority == priority;
    final names = {
      TaskPriority.p1: 'P1 🔥',
      TaskPriority.p2: 'P2 ⚡',
      TaskPriority.p3: 'P3 💤',
    };
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _selectedPriority = priority),
        child: Container(
          margin: const EdgeInsets.only(right: 8),
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: isSelected
                ? const Color(0xFF9B59B6)
                : const Color(0xFF16213E),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: isSelected ? const Color(0xFF9B59B6) : Colors.white24,
            ),
          ),
          child: Text(
            names[priority]!,
            textAlign: TextAlign.center,
            style: TextStyle(
              color: isSelected ? Colors.white : Colors.white54,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildDeadlinePicker() {
    return GestureDetector(
      onTap: () async {
        final date = await showDatePicker(
          context: context,
          initialDate: DateTime.now(),
          firstDate: DateTime.now(),
          lastDate: DateTime.now().add(const Duration(days: 365)),
        );
        if (date != null) setState(() => _deadline = date);
      },
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: const Color(0xFF16213E),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          children: [
            const Icon(Icons.calendar_today, color: Colors.white54, size: 20),
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
    );
  }

  void _saveTask() {
    if (_titleController.text.isEmpty) return;
    final task = Task(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      title: _titleController.text,
      description: _descriptionController.text,
      quadrant: _selectedQuadrant,
      priority: _selectedPriority,
      deadline: _deadline,
      createdAt: DateTime.now(),
    );
    Navigator.pop(context, task);
  }
}
