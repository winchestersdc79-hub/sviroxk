import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { Task, Habit } from "@/contexts/AppContext";

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;
  const { status } = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowBadge: true, allowSound: true },
  });
  return status === "granted";
}

function getDeadlineChannel(): string {
  return "deadlines";
}

function getHabitChannel(): string {
  return "habits";
}

function getPomodoroChannel(): string {
  return "pomodoro";
}

export async function scheduleDeadlineReminder(task: Task): Promise<void> {
  if (!task.deadline || Platform.OS === "web") return;

  const granted = await requestNotificationPermission();
  if (!granted) return;

  const deadline = new Date(task.deadline);

  // Remind 1 day before at 9:00
  const dayBefore = new Date(deadline);
  dayBefore.setDate(dayBefore.getDate() - 1);
  dayBefore.setHours(9, 0, 0, 0);

  if (dayBefore > new Date()) {
    await Notifications.scheduleNotificationAsync({
      identifier: `task-deadline-${task.id}`,
      content: {
        title: "⏰ Завтра дедлайн!",
        body: task.title,
        data: { taskId: task.id, type: "deadline" },
        sound: true,
        ...(Platform.OS === "android" ? { channelId: getDeadlineChannel() } : {}),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: dayBefore,
      },
    }).catch(console.warn);
  }

  // Remind on the day at 8:00
  const sameDay = new Date(deadline);
  sameDay.setHours(8, 0, 0, 0);

  if (sameDay > new Date()) {
    await Notifications.scheduleNotificationAsync({
      identifier: `task-today-${task.id}`,
      content: {
        title: "🔴 Сегодня дедлайн!",
        body: task.title,
        data: { taskId: task.id, type: "deadline_today" },
        sound: true,
        ...(Platform.OS === "android" ? { channelId: getDeadlineChannel() } : {}),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: sameDay,
      },
    }).catch(console.warn);
  }

  // If deadline is already passed — send immediate notification
  if (deadline < new Date()) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "🚨 Дедлайн просрочен!",
        body: task.title,
        data: { taskId: task.id, type: "overdue" },
        sound: true,
        ...(Platform.OS === "android" ? { channelId: getDeadlineChannel() } : {}),
      },
      trigger: null,
    }).catch(console.warn);
  }
}

export async function cancelTaskReminders(taskId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(`task-deadline-${taskId}`).catch(() => {});
  await Notifications.cancelScheduledNotificationAsync(`task-today-${taskId}`).catch(() => {});
}

export async function scheduleHabitReminder(
  habitId: string,
  habitTitle: string,
  hour: number,
  minute: number,
): Promise<void> {
  if (Platform.OS === "web") return;
  const granted = await requestNotificationPermission();
  if (!granted) return;

  await Notifications.cancelScheduledNotificationAsync(`habit-${habitId}`).catch(() => {});
  await Notifications.scheduleNotificationAsync({
    identifier: `habit-${habitId}`,
    content: {
      title: "✅ Не забудь про привычку!",
      body: habitTitle,
      data: { habitId, type: "habit" },
      sound: true,
      ...(Platform.OS === "android" ? { channelId: getHabitChannel() } : {}),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
      hour,
      minute,
      repeats: true,
    },
  }).catch(console.warn);
}

export async function cancelHabitReminder(habitId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(`habit-${habitId}`).catch(() => {});
}

export async function sendPomodoroNotification(mode: "work" | "break"): Promise<void> {
  if (Platform.OS === "web") return;
  const granted = await requestNotificationPermission();
  if (!granted) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: mode === "work" ? "🍅 Сессия завершена!" : "💪 Перерыв закончен!",
      body: mode === "work" ? "Время отдохнуть 😊" : "Пора снова в работу! 🚀",
      sound: true,
      ...(Platform.OS === "android" ? { channelId: getPomodoroChannel() } : {}),
    },
    trigger: null,
  }).catch(console.warn);
}

export async function scheduleDailyHabitReminders(
  habits: Habit[],
  hour: number,
  minute: number,
): Promise<void> {
  if (Platform.OS === "web") return;
  const granted = await requestNotificationPermission();
  if (!granted) return;

  const all = await Notifications.getAllScheduledNotificationsAsync();
  for (const n of all) {
    if (n.identifier.startsWith("habit-daily-")) {
      await Notifications.cancelScheduledNotificationAsync(n.identifier).catch(() => {});
    }
  }

  if (habits.length === 0) return;

  const body = habits.slice(0, 3).map(h => h.title).join(", ")
    + (habits.length > 3 ? ` и ещё ${habits.length - 3}` : "");

  await Notifications.scheduleNotificationAsync({
    identifier: "habit-daily-reminder",
    content: {
      title: "📋 Привычки на сегодня",
      body,
      sound: true,
      ...(Platform.OS === "android" ? { channelId: getHabitChannel() } : {}),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
      hour,
      minute,
      repeats: true,
    },
  }).catch(console.warn);
}
