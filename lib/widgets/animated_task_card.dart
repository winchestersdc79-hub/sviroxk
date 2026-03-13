import 'package:flutter/material.dart';
import 'package:productivity_app/models/task.dart';

class AnimatedTaskCard extends StatefulWidget {
  final Task task;
  final Color color;
  final VoidCallback? onComplete;
  final VoidCallback? onTap;

  const AnimatedTaskCard({
    super.key,
    required this.task,
    required this.color,
    this.onComplete,
    this.onTap,
  });

  @override
  State<AnimatedTaskCard> createState() => _AnimatedTaskCardState();
}

class _AnimatedTaskCardState extends State<AnimatedTaskCard>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 300),
      vsync: this,
    );
    _scaleAnimation = Tween<double>(begin: 0.8, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: Curves.elasticOut),
    );
    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeIn),
    );
    _controller.forward();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _handleComplete() async {
    await _controller.reverse();
    widget.onComplete?.call();
  }

  @override
  Widget build(BuildContext context) {
    return FadeTransition(
      opacity: _fadeAnimation,
      child: ScaleTransition(
        scale: _scaleAnimation,
        child: GestureDetector(
          onTap: widget.onTap,
          child: Container(
            margin: const EdgeInsets.only(bottom: 8),
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: widget.color.withOpacity(0.08),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: widget.color.withOpacity(0.2)),
            ),
            child: Row(
              children: [
                GestureDetector(
                  onTap: _handleComplete,
                  child: Container(
                    width: 24,
                    height: 24,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(color: widget.color, width: 2),
                    ),
                    child: widget.task.isCompleted
                        ? Icon(Icons.check, color: widget.color, size: 16)
                        : null,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        widget.task.title,
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 14,
                          fontWeight: widget.task.isPinned
                              ? FontWeight.bold
                              : FontWeight.normal,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      if (widget.task.deadline != null)
                        Text(
                          '⏰ ${widget.task.deadline!.day}.${widget.task.deadline!.month}',
                          style: const TextStyle(
                            color: Colors.orange,
                            fontSize: 11,
                          ),
                        ),
                    ],
                  ),
                ),
                if (widget.task.isPinned)
                  Icon(Icons.push_pin, color: widget.color, size: 14),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
