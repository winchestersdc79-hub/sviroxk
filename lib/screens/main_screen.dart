import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:productivity_app/providers/task_provider.dart';
import 'home_screen.dart';
import 'pomodoro_screen.dart';
import 'statistics_screen.dart';
import 'archive_screen.dart';
import 'habits_screen.dart';
import 'calendar_screen.dart';
import 'ai_screen.dart';
import 'search_screen.dart';
import 'settings_screen.dart';

class MainScreen extends StatefulWidget {
  const MainScreen({super.key});

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  int _currentIndex = 0;

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<TaskProvider>();

    final screens = [
      const HomeScreen(),
      const CalendarScreen(),
      const SearchScreen(),
      const PomodoroScreen(),
      const HabitsScreen(),
      const AiScreen(),
      const StatisticsScreen(),
      ArchiveScreen(
        archivedTasks: provider.archivedTasks,
        onRestore: provider.restoreTask,
        onDelete: provider.deleteTask,
      ),
      const SettingsScreen(),
    ];

    return Scaffold(
      body: screens[_currentIndex],
      bottomNavigationBar: NavigationBarTheme(
        data: NavigationBarThemeData(
          labelTextStyle: WidgetStateProperty.resolveWith((states) {
            if (states.contains(WidgetState.selected)) {
              return const TextStyle(
                color: Colors.white,
                fontSize: 11,
                fontWeight: FontWeight.bold,
              );
            }
            return const TextStyle(color: Colors.white54, fontSize: 10);
          }),
          iconTheme: WidgetStateProperty.resolveWith((states) {
            if (states.contains(WidgetState.selected)) {
              return const IconThemeData(color: Colors.white, size: 26);
            }
            return const IconThemeData(color: Colors.white54, size: 22);
          }),
        ),
        child: NavigationBar(
          backgroundColor: const Color(0xFF0D0D1A),
          indicatorColor: const Color(0xFF9B59B6).withOpacity(0.3),
          selectedIndex: _currentIndex,
          onDestinationSelected: (i) => setState(() => _currentIndex = i),
          height: 70,
          labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
          destinations: const [
            NavigationDestination(
              icon: Icon(Icons.grid_view_rounded),
              label: 'Задачи',
            ),
            NavigationDestination(
              icon: Icon(Icons.calendar_month_rounded),
              label: 'Календарь',
            ),
            NavigationDestination(
              icon: Icon(Icons.search_rounded),
              label: 'Поиск',
            ),
            NavigationDestination(
              icon: Icon(Icons.timer_rounded),
              label: 'Pomodoro',
            ),
            NavigationDestination(
              icon: Icon(Icons.check_circle_rounded),
              label: 'Привычки',
            ),
            NavigationDestination(
              icon: Icon(Icons.auto_awesome_rounded),
              label: 'AI',
            ),
            NavigationDestination(
              icon: Icon(Icons.bar_chart_rounded),
              label: 'Статы',
            ),
            NavigationDestination(
              icon: Icon(Icons.archive_rounded),
              label: 'Архив',
            ),
            NavigationDestination(
              icon: Icon(Icons.settings_rounded),
              label: 'Настройки',
            ),
          ],
        ),
      ),
    );
  }
}
