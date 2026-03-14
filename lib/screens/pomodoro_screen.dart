import 'dart:async';
import 'package:flutter/material.dart';
import 'package:productivity_app/services/notification_service.dart';

class PomodoroScreen extends StatefulWidget {
  const PomodoroScreen({super.key});

  @override
  State<PomodoroScreen> createState() => _PomodoroScreenState();
}

class _PomodoroScreenState extends State<PomodoroScreen> {
  static const int workTime = 25 * 60;
  static const int shortBreak = 5 * 60;
  static const int longBreak = 15 * 60;

  int _seconds = workTime;
  bool _isRunning = false;
  bool _isWork = true;
  int _pomodoroCount = 0;
  Timer? _timer;

  void _startStop() {
    if (_isRunning) {
      _timer?.cancel();
      NotificationService.cancelPomodoro();
    } else {
      NotificationService.schedulePomodoroEnd(_seconds ~/ 60);
      _timer = Timer.periodic(const Duration(seconds: 1), (_) {
        if (_seconds > 0) {
          setState(() => _seconds--);
        } else {
          _timer?.cancel();
          _nextSession();
        }
      });
    }
    setState(() => _isRunning = !_isRunning);
  }

  void _nextSession() {
    if (_isWork) {
      _pomodoroCount++;
      if (_pomodoroCount % 4 == 0) {
        _seconds = longBreak;
      } else {
        _seconds = shortBreak;
      }
    } else {
      _seconds = workTime;
    }
    setState(() {
      _isWork = !_isWork;
      _isRunning = false;
    });
    NotificationService.showInstantNotification(
      _isWork ? '🍅 Время работать!' : '☕ Время отдыхать!',
      _isWork ? 'Пора сосредоточиться на задачах.' : 'Сделай небольшой перерыв.',
    );
  }

  void _reset() {
    _timer?.cancel();
    NotificationService.cancelPomodoro();
    setState(() {
      _seconds = workTime;
      _isRunning = false;
      _isWork = true;
    });
  }

  String get _timeString {
    final m = (_seconds ~/ 60).toString().padLeft(2, '0');
    final s = (_seconds % 60).toString().padLeft(2, '0');
    return '$m:$s';
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final color = _isWork ? const Color(0xFFE74C3C) : const Color(0xFF27AE60);
    final label = _isWork ? '🍅 Работа' : '☕ Перерыв';

    return Scaffold(
      backgroundColor: const Color(0xFF0D0D1A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0D0D1A),
        title: const Text(
          '🍅 Pomodoro',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              label,
              style: TextStyle(
                color: color,
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 40),
            Stack(
              alignment: Alignment.center,
              children: [
                SizedBox(
                  width: 260,
                  height: 260,
                  child: CircularProgressIndicator(
                    value: _seconds / (_isWork ? workTime : (_pomodoroCount % 4 == 0 ? longBreak : shortBreak)),
                    strokeWidth: 8,
                    color: color,
                    backgroundColor: color.withOpacity(0.1),
                  ),
                ),
                Container(
                  width: 240,
                  height: 240,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: color.withOpacity(0.05),
                  ),
                  child: Center(
                    child: Text(
                      _timeString,
                      style: TextStyle(
                        color: color,
                        fontSize: 64,
                        fontWeight: FontWeight.bold,
                        fontFamily: 'monospace',
                      ),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 60),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                ElevatedButton(
                  onPressed: _startStop,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: color,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(
                      horizontal: 40,
                      vertical: 18,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(20),
                    ),
                    elevation: 8,
                    shadowColor: color.withOpacity(0.4),
                  ),
                  child: Row(
                    children: [
                      Icon(_isRunning ? Icons.pause_rounded : Icons.play_arrow_rounded),
                      const SizedBox(width: 8),
                      Text(
                        _isRunning ? 'ПАУЗА' : 'СТАРТ',
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w900,
                          letterSpacing: 1.2,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 20),
                IconButton.filledTonal(
                  onPressed: _reset,
                  icon: const Icon(Icons.refresh_rounded),
                  style: IconButton.styleFrom(
                    backgroundColor: const Color(0xFF16213E),
                    foregroundColor: Colors.white70,
                    padding: const EdgeInsets.all(18),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 40),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
              decoration: BoxDecoration(
                color: const Color(0xFF16213E),
                borderRadius: BorderRadius.circular(30),
              ),
              child: Text(
                'Выполнено помидоров: $_pomodoroCount',
                style: const TextStyle(color: Colors.white54, fontSize: 14),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
