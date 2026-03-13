import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:productivity_app/providers/task_provider.dart';
import 'home_screen.dart';
import 'package:productivity_app/screens/pomodoro_screen.dart';
import 'package:productivity_app/screens/statistics_screen.dart';
import 'package:productivity_app/screens/archive_screen.dart';
import 'package:productivity_app/screens/habits_screen.dart';
import 'package:productivity_app/screens/calendar_screen.dart';
import 'package:productivity_app/screens/ai_screen.dart';
import 'package:productivity_app/screens/search_screen.dart';
import 'package:productivity_app/screens/settings_screen.dart';
import 'package:productivity_app/screens/pin_screen.dart';

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
      bottomNavigationBar: NavigationBar(
        backgroundColor: const Color(0xFF16213E),
        indicatorColor: const Color(0xFF9B59B6),
        selectedIndex: _currentIndex,
        onDestinationSelected: (i) => setState(() => _currentIndex = i),
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.grid_view, color: Colors.white54),
            selectedIcon: Icon(Icons.grid_view, color: Colors.white),
            label: 'Задачи',
          ),
          NavigationDestination(
            icon: Icon(Icons.calendar_month, color: Colors.white54),
            selectedIcon: Icon(Icons.calendar_month, color: Colors.white),
            label: 'Календарь',
          ),
          NavigationDestination(
            icon: Icon(Icons.search, color: Colors.white54),
            selectedIcon: Icon(Icons.search, color: Colors.white),
            label: 'Поиск',
          ),
          NavigationDestination(
            icon: Icon(Icons.timer, color: Colors.white54),
            selectedIcon: Icon(Icons.timer, color: Colors.white),
            label: 'Pomodoro',
          ),
          NavigationDestination(
            icon: Icon(Icons.check_circle, color: Colors.white54),
            selectedIcon: Icon(Icons.check_circle, color: Colors.white),
            label: 'Привычки',
          ),
          NavigationDestination(
            icon: Icon(Icons.auto_awesome, color: Colors.white54),
            selectedIcon: Icon(Icons.auto_awesome, color: Colors.white),
            label: 'AI',
          ),
          NavigationDestination(
            icon: Icon(Icons.bar_chart, color: Colors.white54),
            selectedIcon: Icon(Icons.bar_chart, color: Colors.white),
            label: 'Статистика',
          ),
          NavigationDestination(
            icon: Icon(Icons.archive, color: Colors.white54),
            selectedIcon: Icon(Icons.archive, color: Colors.white),
            label: 'Архив',
          ),
          NavigationDestination(
            icon: Icon(Icons.settings, color: Colors.white54),
            selectedIcon: Icon(Icons.settings, color: Colors.white),
            label: 'Настройки',
          ),
        ],
      ),
    );
  }
}
