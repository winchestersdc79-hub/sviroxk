import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:productivity_app/models/task.dart';
import 'package:productivity_app/providers/task_provider.dart';

class AiScreen extends StatefulWidget {
  const AiScreen({super.key});

  @override
  State<AiScreen> createState() => _AiScreenState();
}

class _AiScreenState extends State<AiScreen> {
  final List<Map<String, String>> _messages = [];
  final _controller = TextEditingController();
  bool _isLoading = false;

  String _generateAdvice(String input, List<Task> tasks) {
    final lower = input.toLowerCase();

    if (lower.contains('приоритет') || lower.contains('важн')) {
      final urgent = tasks.where((t) => t.quadrant == TaskQuadrant.urgentImportant).length;
      return '🔴 У тебя $urgent задач в квадранте "Важно & Срочно". '
          'Сосредоточься на них в первую очередь! '
          'Используй технику Pomodoro — 25 минут работы, 5 минут отдыха.';
    }

    if (lower.contains('много задач') || lower.contains('не успеваю')) {
      return '💡 Когда задач много — декомпозируй! '
          'Раздели каждую большую задачу на маленькие подзадачи. '
          'Начни с самой важной и срочной. '
          'Делегируй задачи из квадранта "Не важно & Срочно".';
    }

    if (lower.contains('pomodoro') || lower.contains('помодор') || lower.contains('концентрац')) {
      return '🍅 Техника Pomodoro:\n'
          '1. Выбери одну задачу\n'
          '2. Работай 25 минут без отвлечений\n'
          '3. Сделай 5 минут перерыв\n'
          '4. После 4 помидоров — 15 минут отдыха\n'
          'Это повышает концентрацию на 40%!';
    }

    if (lower.contains('привычк') || lower.contains('habit')) {
      return '✅ Для формирования привычки нужно минимум 21 день! '
          'Начни с маленьких шагов — 5 минут в день лучше чем ничего. '
          'Привяжи новую привычку к уже существующей. '
          'Отмечай каждый день в трекере — это мотивирует!';
    }

    if (lower.contains('устал') || lower.contains('выгорани')) {
      return '😮‍💨 Признаки выгорания — сигнал для отдыха! '
          'Сделай перерыв от задач на 1-2 часа. '
          'Прогулка, вода, еда — базовые потребности важнее задач. '
          'Перенеси несрочные задачи на завтра. '
          'Твоя продуктивность важнее количества выполненных задач!';
    }

    if (lower.contains('цел') || lower.contains('план')) {
      final total = tasks.length;
      return '🎯 У тебя сейчас $total активных задач. '
          'Хороший план — не более 3 важных задач в день. '
          'Используй правило 1-3-5: 1 большая задача, 3 средних, 5 маленьких. '
          'Каждое воскресенье планируй следующую неделю!';
    }

    if (lower.contains('мотивац')) {
      return '💪 Мотивация приходит после начала действия, не до! '
          'Начни с самой маленькой задачи — это создаст импульс. '
          'Визуализируй результат — представь как будет хорошо когда задача выполнена. '
          'Награди себя за выполнение важных задач!';
    }

    final urgent = tasks.where((t) => t.quadrant == TaskQuadrant.urgentImportant).length;
    final total = tasks.length;

    if (total == 0) {
      return '🌟 У тебя нет активных задач — отличное время добавить новые цели! '
          'Начни с планирования недели используя Матрицу Эйзенхауэра.';
    }

    return '📊 Анализ твоих задач:\n'
        '• Всего активных: $total\n'
        '• Требуют внимания: $urgent срочных\n\n'
        '💡 Совет: Спроси меня про приоритеты, Pomodoro, привычки, мотивацию или планирование!';
  }

  void _sendMessage() {
    if (_controller.text.isEmpty) return;
    final input = _controller.text;
    _controller.clear();

    setState(() {
      _messages.add({'role': 'user', 'text': input});
      _isLoading = true;
    });

    final tasks = context.read<TaskProvider>().tasks;

    Future.delayed(const Duration(milliseconds: 800), () {
      setState(() {
        _messages.add({
          'role': 'ai',
          'text': _generateAdvice(input, tasks),
        });
        _isLoading = false;
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0D0D1A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0D0D1A),
        title: const Text(
          '🤖 AI-помощник',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: Column(
        children: [
          if (_messages.isEmpty)
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    const SizedBox(height: 20),
                    Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [Color(0xFF9B59B6), Color(0xFF6C3483)],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: const Column(
                        children: [
                          Text('🤖', style: TextStyle(fontSize: 48)),
                          SizedBox(height: 12),
                          Text(
                            'AI-помощник',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 22,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          SizedBox(height: 8),
                          Text(
                            'Спроси меня о продуктивности,\nуправлении задачами и привычках!',
                            style: TextStyle(color: Colors.white70),
                            textAlign: TextAlign.center,
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),
                    const Text(
                      'Примеры вопросов:',
                      style: TextStyle(
                        color: Colors.white70,
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 12),
                    ...[
                      '🔴 Как расставить приоритеты?',
                      '🍅 Объясни технику Pomodoro',
                      '✅ Как сформировать привычку?',
                      '💪 Как повысить мотивацию?',
                      '😮‍💨 Что делать при выгорании?',
                      '🎯 Как планировать цели?',
                    ].map((q) => GestureDetector(
                      onTap: () {
                        _controller.text = q;
                        _sendMessage();
                      },
                      child: Container(
                        width: double.infinity,
                        margin: const EdgeInsets.only(bottom: 8),
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: const Color(0xFF16213E),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: Colors.white12),
                        ),
                        child: Text(
                          q,
                          style: const TextStyle(color: Colors.white70),
                        ),
                      ),
                    )),
                  ],
                ),
              ),
            )
          else
            Expanded(
              child: ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: _messages.length + (_isLoading ? 1 : 0),
                itemBuilder: (ctx, i) {
                  if (i == _messages.length) {
                    return const Padding(
                      padding: EdgeInsets.all(16),
                      child: Row(
                        children: [
                          SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              color: Color(0xFF9B59B6),
                            ),
                          ),
                          SizedBox(width: 12),
                          Text(
                            'AI думает...',
                            style: TextStyle(color: Colors.white54),
                          ),
                        ],
                      ),
                    );
                  }
                  final msg = _messages[i];
                  final isUser = msg['role'] == 'user';
                  return Align(
                    alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
                    child: Container(
                      margin: const EdgeInsets.only(bottom: 12),
                      padding: const EdgeInsets.all(14),
                      constraints: BoxConstraints(
                        maxWidth: MediaQuery.of(ctx).size.width * 0.8,
                      ),
                      decoration: BoxDecoration(
                        color: isUser
                            ? const Color(0xFF9B59B6)
                            : const Color(0xFF16213E),
                        borderRadius: BorderRadius.circular(16),
                        border: isUser
                            ? null
                            : Border.all(color: Colors.white12),
                      ),
                      child: Text(
                        msg['text']!,
                        style: TextStyle(
                          color: isUser ? Colors.white : Colors.white70,
                          fontSize: 14,
                        ),
                      ),
                    ),
                  );
                },
              ),
            ),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: const BoxDecoration(
              color: Color(0xFF16213E),
              border: Border(top: BorderSide(color: Colors.white12)),
            ),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _controller,
                    style: const TextStyle(color: Colors.white),
                    decoration: InputDecoration(
                      hintText: 'Спроси что-нибудь...',
                      hintStyle: const TextStyle(color: Colors.white38),
                      filled: true,
                      fillColor: const Color(0xFF0D0D1A),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(24),
                        borderSide: BorderSide.none,
                      ),
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 12,
                      ),
                    ),
                    onSubmitted: (_) => _sendMessage(),
                  ),
                ),
                const SizedBox(width: 8),
                GestureDetector(
                  onTap: _sendMessage,
                  child: Container(
                    width: 48,
                    height: 48,
                    decoration: const BoxDecoration(
                      color: Color(0xFF9B59B6),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.send, color: Colors.white, size: 20),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
