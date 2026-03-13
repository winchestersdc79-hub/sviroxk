import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:productivity_app/models/task.dart';
import 'package:productivity_app/providers/task_provider.dart';

class StatisticsScreen extends StatelessWidget {
  const StatisticsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<TaskProvider>();
    final archived = provider.archivedTasks;
    final active = provider.tasks;
    final total = archived.length + active.length;
    final percent = total == 0 ? 0.0 : archived.length / total;

    return Scaffold(
      backgroundColor: const Color(0xFF0D0D1A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0D0D1A),
        title: const Text(
          '📊 Статистика',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF9B59B6), Color(0xFF6C3483)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Column(
                children: [
                  const Text(
                    'Общий прогресс',
                    style: TextStyle(color: Colors.white70, fontSize: 14),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    '${(percent * 100).toInt()}%',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 48,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 12),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: LinearProgressIndicator(
                      value: percent,
                      backgroundColor: Colors.white24,
                      valueColor: const AlwaysStoppedAnimation(Colors.white),
                      minHeight: 8,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      _buildMini('Всего', '$total'),
                      _buildMini('Активных', '${active.length}'),
                      _buildMini('Выполнено', '${archived.length}'),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            const Text(
              'По квадрантам',
              style: TextStyle(
                color: Colors.white,
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            _buildQuadrantStat('🔴 Важно & Срочно', TaskQuadrant.urgentImportant, provider, const Color(0xFFE74C3C), total),
            _buildQuadrantStat('🟡 Важно & Не срочно', TaskQuadrant.notUrgentImportant, provider, const Color(0xFFF39C12), total),
            _buildQuadrantStat('🟢 Не важно & Срочно', TaskQuadrant.urgentNotImportant, provider, const Color(0xFF27AE60), total),
            _buildQuadrantStat('⚪ Не важно & Не срочно', TaskQuadrant.notUrgentNotImportant, provider, const Color(0xFF7F8C8D), total),
            const SizedBox(height: 24),
            const Text(
              'По приоритету',
              style: TextStyle(
                color: Colors.white,
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            _buildPriorityStat('🔥 P1 — Высокий', TaskPriority.p1, provider, const Color(0xFFE74C3C)),
            _buildPriorityStat('⚡ P2 — Средний', TaskPriority.p2, provider, const Color(0xFFF39C12)),
            _buildPriorityStat('💤 P3 — Низкий', TaskPriority.p3, provider, const Color(0xFF7F8C8D)),
          ],
        ),
      ),
    );
  }

  Widget _buildMini(String label, String value) {
    return Column(
      children: [
        Text(
          value,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
        Text(
          label,
          style: const TextStyle(color: Colors.white60, fontSize: 12),
        ),
      ],
    );
  }

  Widget _buildQuadrantStat(String label, TaskQuadrant quadrant, TaskProvider provider, Color color, int total) {
    final count = provider.getTasksByQuadrant(quadrant).length;
    final percent = total == 0 ? 0.0 : count / total;
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF16213E),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(label, style: const TextStyle(color: Colors.white70, fontSize: 13)),
              Text('$count задач', style: TextStyle(color: color, fontWeight: FontWeight.bold)),
            ],
          ),
          const SizedBox(height: 8),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: percent,
              backgroundColor: color.withOpacity(0.1),
              valueColor: AlwaysStoppedAnimation(color),
              minHeight: 6,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPriorityStat(String label, TaskPriority priority, TaskProvider provider, Color color) {
    final count = provider.tasks.where((t) => t.priority == priority).length;
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF16213E),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Colors.white70)),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
            decoration: BoxDecoration(
              color: color.withOpacity(0.2),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              '$count',
              style: TextStyle(color: color, fontWeight: FontWeight.bold),
            ),
          ),
        ],
      ),
    );
  }
}
