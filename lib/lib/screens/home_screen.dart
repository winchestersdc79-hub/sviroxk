import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/task.dart';
import '../providers/task_provider.dart';
import '../widgets/quadrant_card.dart';
import 'add_task_screen.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<TaskProvider>();

    return Scaffold(
      backgroundColor: const Color(0xFF0D0D1A),
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 120,
            floating: false,
            pinned: true,
            backgroundColor: const Color(0xFF0D0D1A),
            flexibleSpace: FlexibleSpaceBar(
              title: const Text(
                '📋 Мои задачи',
                style: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  fontSize: 20,
                ),
              ),
              background: Container(
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [Color(0xFF1A1A3E), Color(0xFF0D0D1A)],
                  ),
                ),
              ),
            ),
            actions: [
              IconButton(
                icon: const Icon(Icons.search, color: Colors.white70),
                onPressed: () {},
              ),
            ],
          ),
          SliverPadding(
            padding: const EdgeInsets.all(16),
            sliver: SliverGrid(
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
                childAspectRatio: 0.85,
              ),
              delegate: SliverChildListDelegate([
                QuadrantCard(
                  title: 'Важно & Срочно',
                  color: const Color(0xFFE74C3C),
                  icon: Icons.warning_rounded,
                  tasks: provider.getTasksByQuadrant(TaskQuadrant.urgentImportant),
                  onAddTask: () => _openAddTask(context, TaskQuadrant.urgentImportant),
                ),
                QuadrantCard(
                  title: 'Важно & Не срочно',
                  color: const Color(0xFFF39C12),
                  icon: Icons.star_rounded,
                  tasks: provider.getTasksByQuadrant(TaskQuadrant.notUrgentImportant),
                  onAddTask: () => _openAddTask(context, TaskQuadrant.notUrgentImportant),
                ),
                QuadrantCard(
                  title: 'Не важно & Срочно',
                  color: const Color(0xFF27AE60),
                  icon: Icons.bolt_rounded,
                  tasks: provider.getTasksByQuadrant(TaskQuadrant.urgentNotImportant),
                  onAddTask: () => _openAddTask(context, TaskQuadrant.urgentNotImportant),
                ),
                QuadrantCard(
                  title: 'Не важно & Не срочно',
                  color: const Color(0xFF7F8C8D),
                  icon: Icons.inbox_rounded,
                  tasks: provider.getTasksByQuadrant(TaskQuadrant.notUrgentNotImportant),
                  onAddTask: () => _openAddTask(context, TaskQuadrant.notUrgentNotImportant),
                ),
              ]),
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.large(
        onPressed: () => _openAddTask(context, null),
        backgroundColor: const Color(0xFF9B59B6),
        child: const Icon(Icons.add, size: 40, color: Colors.white),
      ),
    );
  }

  void _openAddTask(BuildContext context, TaskQuadrant? quadrant) async {
    final task = await Navigator.push<Task>(
      context,
      MaterialPageRoute(builder: (_) => const AddTaskScreen()),
    );
    if (task != null && context.mounted) {
      context.read<TaskProvider>().addTask(task);
    }
  }
}
