import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:productivity_app/models/task.dart';
import 'package:productivity_app/providers/task_provider.dart';
import 'package:productivity_app/widgets/quadrant_card.dart';
import 'package:productivity_app/screens/add_task_screen.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<TaskProvider>();
    
    return Scaffold(
      backgroundColor: const Color(0xFF0D0D1A),
      body: CustomScrollView(
        physics: const BouncingScrollPhysics(),
        slivers: [
          SliverAppBar(
            expandedHeight: 180,
            floating: false,
            pinned: true,
            backgroundColor: const Color(0xFF0D0D1A),
            flexibleSpace: FlexibleSpaceBar(
              titlePadding: const EdgeInsets.only(left: 20, bottom: 16),
              title: Text(
                'Sviroxk',
                style: GoogleFonts.montserrat(
                  color: Colors.white,
                  fontWeight: FontWeight.w900,
                  fontSize: 28,
                  letterSpacing: 1.5,
                ),
              ),
              background: Stack(
                fit: StackFit.expand,
                children: [
                  Container(
                    decoration: const BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: [Color(0xFF1A1A3E), Color(0xFF0D0D1A)],
                      ),
                    ),
                  ),
                  Positioned(
                    right: -30,
                    top: -30,
                    child: Container(
                      width: 180,
                      height: 180,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: const Color(0xFF9B59B6).withOpacity(0.15),
                      ),
                    ),
                  ),
                  Positioned(
                    left: 40,
                    top: 60,
                    child: Container(
                      width: 60,
                      height: 60,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: const Color(0xFFE74C3C).withOpacity(0.1),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 24, 20, 8),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Твоя продуктивность',
                    style: GoogleFonts.inter(
                      color: Colors.white70,
                      fontSize: 16,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Матрица Эйзенхауэра',
                    style: GoogleFonts.inter(
                      color: Colors.white,
                      fontSize: 22,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ],
              ),
            ),
          ),
          SliverPadding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 120),
            sliver: SliverGrid(
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: 16,
                mainAxisSpacing: 16,
                childAspectRatio: 0.85,
              ),
              delegate: SliverChildListDelegate([
                QuadrantCard(
                  title: 'Срочно & Важно',
                  color: const Color(0xFFE74C3C),
                  icon: Icons.priority_high_rounded,
                  tasks: provider.getTasksByQuadrant(TaskQuadrant.urgentImportant),
                  onAddTask: () => _openAddTask(context, TaskQuadrant.urgentImportant),
                ),
                QuadrantCard(
                  title: 'Не срочно & Важно',
                  color: const Color(0xFFF39C12),
                  icon: Icons.star_rounded,
                  tasks: provider.getTasksByQuadrant(TaskQuadrant.notUrgentImportant),
                  onAddTask: () => _openAddTask(context, TaskQuadrant.notUrgentImportant),
                ),
                QuadrantCard(
                  title: 'Срочно & Не важно',
                  color: const Color(0xFF27AE60),
                  icon: Icons.bolt_rounded,
                  tasks: provider.getTasksByQuadrant(TaskQuadrant.urgentNotImportant),
                  onAddTask: () => _openAddTask(context, TaskQuadrant.urgentNotImportant),
                ),
                QuadrantCard(
                  title: 'Не срочно & Не важно',
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
      floatingActionButton: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(24),
          boxShadow: [
            BoxShadow(
              color: const Color(0xFF9B59B6).withOpacity(0.4),
              blurRadius: 25,
              offset: const Offset(0, 10),
            ),
          ],
        ),
        child: FloatingActionButton.large(
          onPressed: () => _openAddTask(context, null),
          backgroundColor: const Color(0xFF9B59B6),
          elevation: 0,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
          child: const Icon(Icons.add_rounded, size: 48, color: Colors.white),
        ),
      ),
    );
  }

  void _openAddTask(BuildContext context, TaskQuadrant? quadrant) async {
    final task = await Navigator.push<Task>(
      context,
      MaterialPageRoute(builder: (_) => const AddTaskScreen()),
    );
    if (task != null && context.mounted) {
      if (quadrant != null) {
        task.quadrant = quadrant;
      }
      context.read<TaskProvider>().addTask(task);
    }
  }
}
