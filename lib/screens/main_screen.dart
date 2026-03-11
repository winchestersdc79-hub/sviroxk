import 'package:flutter/material.dart';
import '../models/task.dart';
import '../providers/task_provider.dart';
import 'package:provider/provider.dart';

class StatisticsScreen extends StatelessWidget {
  const StatisticsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<TaskProvider>();
    final archived = provider.archivedTasks;
    final active = provider.tasks;
    final total = archived.length + active.length;

    return Scaffold(
      backgroundColor: const Color(0xFF1A1A2E),
      appBar: AppBar(
        backgroundColor: const Color(0xFF16213E),
        title: const Text(
          '📊 Статистика',
          style: TextStyle(color: Colors.white),
        ),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildHeader('Общая статистика'),
            const SizedBox(height: 12),
            Row(
              children: [
                _buildStatCard('Всего задач', '$total', Colors.purple),
                const SizedBox(width: 12),
                _buildStatCard('Выполнено', '${archived.length}', Colors.green),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                _buildStatCard('Активных', '${active.length}', Colors.orange),
                const SizedBox(width: 12),
                _buildStatCard(
                  'Процент',
                  total == 0 ? '0%' : '${(archived.length / total * 100).toInt()}%',
                  Colors.blue,
                ),
              ],
            ),
            const SizedBox(height: 24),
            _buildHeader('По квадрантам'),
            const SizedBox(height: 12),
            _buildQuadrantStat('🔴 Важно & Срочно', TaskQuadrant.urgentImportant, provider, Colors.red),
            _buildQuadrantStat('🟡 Важно & Не срочно', TaskQuadrant.notUrgentImportant, provider, Colors.orange),
            _buildQuadrantStat('🟢 Не важно & Срочно', TaskQuadrant.urgentNotImportant, provider, Colors.green),
            _buildQuadrantStat('⚪ Не важно & Не срочно', TaskQuadrant.notUrgentNotImportant, provider, Colors.grey),
            const SizedBox(height: 24),
            _buildHeader('По приоритету'),
            const SizedBox(height: 12),
            _buildPriorityStat('🔥 P1', TaskPriority.p1, provider, Colors.red),
            _buildPriorityStat('⚡ P2', TaskPriority.p2, provider, Colors.orange),
            _buildPriorityStat('💤 P3', TaskPriority.p3, provider, Colors.grey),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(String text) {
    return Text(
      text,
      style: const TextStyle(
        color: Colors.white,
        fontSize: 18,
        fontWeight: FontWeight.bold,
      ),
    );
  }

  Widget _buildStatCard(String label, String value, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: color.withOpacity(0.1),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: color.withOpacity(0.3)),
        ),
        child: Column(
          children: [
            Text(
              value,
              style: TextStyle(
                color: color,
                fontSize: 32,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: const TextStyle(color: Colors.white54, fontSize: 12),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQuadrantStat(String label, TaskQuadrant quadrant, TaskProvider provider, Color color) {
    final count = provider.getTasksByQuadrant(quadrant).length;
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Colors.white70)),
          Text('$count задач', style: TextStyle(color: color, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  Widget _buildPriorityStat(String label, TaskPriority priority, TaskProvider provider, Color color) {
    final count = provider.tasks.where((t) => t.priority == priority).length;
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Colors.white70)),
          Text('$count задач', style: TextStyle(color: color, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}
