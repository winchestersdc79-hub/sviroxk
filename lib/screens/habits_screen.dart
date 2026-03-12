import 'package:flutter/material.dart';

class Habit {
  final String id;
  String title;
  String emoji;
  int streak;
  List<DateTime> completedDates;

  Habit({
    required this.id,
    required this.title,
    required this.emoji,
    this.streak = 0,
    List<DateTime>? completedDates,
  }) : completedDates = completedDates ?? [];

  bool get isCompletedToday {
    final now = DateTime.now();
    return completedDates.any((d) =>
        d.year == now.year && d.month == now.month && d.day == now.day);
  }
}

class HabitsScreen extends StatefulWidget {
  const HabitsScreen({super.key});

  @override
  State<HabitsScreen> createState() => _HabitsScreenState();
}

class _HabitsScreenState extends State<HabitsScreen> {
  final List<Habit> _habits = [];
  final _titleController = TextEditingController();
  String _selectedEmoji = '⭐';

  final List<String> _emojis = [
    '⭐', '💪', '📚', '🏃', '💧', '🧘', '🎯', '✍️', '🍎', '😴'
  ];

  void _addHabit() {
    if (_titleController.text.isEmpty) return;
    setState(() {
      _habits.add(Habit(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        title: _titleController.text,
        emoji: _selectedEmoji,
      ));
      _titleController.clear();
    });
    Navigator.pop(context);
  }

  void _toggleHabit(Habit habit) {
    setState(() {
      if (habit.isCompletedToday) {
        habit.completedDates.removeWhere((d) {
          final now = DateTime.now();
          return d.year == now.year && d.month == now.month && d.day == now.day;
        });
        if (habit.streak > 0) habit.streak--;
      } else {
        habit.completedDates.add(DateTime.now());
        habit.streak++;
      }
    });
  }

  void _showAddHabit() {
    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF16213E),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setModalState) => Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Новая привычка',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _titleController,
                style: const TextStyle(color: Colors.white),
                decoration: InputDecoration(
                  hintText: 'Название привычки...',
                  hintStyle: const TextStyle(color: Colors.white38),
                  filled: true,
                  fillColor: const Color(0xFF1A1A2E),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide.none,
                  ),
                ),
              ),
              const SizedBox(height: 16),
              const Text(
                'Выбери эмодзи:',
                style: TextStyle(color: Colors.white70),
              ),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                children: _emojis.map((e) => GestureDetector(
                  onTap: () => setModalState(() => _selectedEmoji = e),
                  child: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: _selectedEmoji == e
                          ? const Color(0xFF9B59B6)
                          : const Color(0xFF1A1A2E),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(e, style: const TextStyle(fontSize: 24)),
                  ),
                )).toList(),
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _addHabit,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF9B59B6),
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: const Text(
                    'Добавить',
                    style: TextStyle(color: Colors.white, fontSize: 16),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF1A1A2E),
      appBar: AppBar(
        backgroundColor: const Color(0xFF16213E),
        title: const Text(
          '✅ Привычки',
          style: TextStyle(color: Colors.white),
        ),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: _habits.isEmpty
          ? const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text('✅', style: TextStyle(fontSize: 64)),
                  SizedBox(height: 16),
                  Text(
                    'Нет привычек',
                    style: TextStyle(color: Colors.white54, fontSize: 18),
                  ),
                  SizedBox(height: 8),
                  Text(
                    'Добавь первую привычку!',
                    style: TextStyle(color: Colors.white38, fontSize: 14),
                  ),
                ],
              ),
            )
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _habits.length,
              itemBuilder: (ctx, i) {
                final habit = _habits[i];
                return Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: const Color(0xFF16213E),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: habit.isCompletedToday
                          ? const Color(0xFF9B59B6)
                          : Colors.white12,
                    ),
                  ),
                  child: Row(
                    children: [
                      Text(habit.emoji, style: const TextStyle(fontSize: 32)),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              habit.title,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            Text(
                              '🔥 ${habit.streak} дней подряд',
                              style: const TextStyle(
                                color: Colors.orange,
                                fontSize: 12,
                              ),
                            ),
                          ],
                        ),
                      ),
                      GestureDetector(
                        onTap: () => _toggleHabit(habit),
                        child: Container(
                          width: 40,
                          height: 40,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: habit.isCompletedToday
                                ? const Color(0xFF9B59B6)
                                : Colors.white12,
                          ),
                          child: Icon(
                            habit.isCompletedToday
                                ? Icons.check
                                : Icons.circle_outlined,
                            color: Colors.white,
                            size: 20,
                          ),
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
      floatingActionButton: FloatingActionButton(
        onPressed: _showAddHabit,
        backgroundColor: const Color(0xFF9B59B6),
        child: const Icon(Icons.add, color: Colors.white),
      ),
    );
  }
}
