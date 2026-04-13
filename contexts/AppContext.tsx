import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from "react";

export type TaskQuadrant = "urgentImportant" | "notUrgentImportant" | "urgentNotImportant" | "notUrgentNotImportant";
export type TaskPriority = "p1" | "p2" | "p3";

export interface SubTask {
  id: string;
  title: string;
  isDone: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  quadrant: TaskQuadrant;
  priority: TaskPriority;
  deadline: string | null;
  isCompleted: boolean;
  isPinned: boolean;
  createdAt: string;
  completedAt: string | null;
  tags: string[];
  subtasks: SubTask[];
}

export interface Habit {
  id: string;
  title: string;
  icon: string;
  color: string;
  streak: number;
  completedDates: string[];
  createdAt: string;
}

export interface PomodoroSettings {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsBeforeLongBreak: number;
}

interface AppState {
  tasks: Task[];
  archivedTasks: Task[];
  habits: Habit[];
  pomodoroSettings: PomodoroSettings;
  isLoaded: boolean;
}

type AppAction =
  | { type: "LOAD_DATA"; payload: Partial<AppState> }
  | { type: "ADD_TASK"; payload: Task }
  | { type: "UPDATE_TASK"; payload: Task }
  | { type: "COMPLETE_TASK"; payload: string }
  | { type: "DELETE_TASK"; payload: string }
  | { type: "RESTORE_TASK"; payload: string }
  | { type: "DELETE_ARCHIVED"; payload: string }
  | { type: "PIN_TASK"; payload: string }
  | { type: "MOVE_TASK"; payload: { id: string; quadrant: TaskQuadrant } }
  | { type: "TOGGLE_SUBTASK"; payload: { taskId: string; subtaskId: string } }
  | { type: "ADD_HABIT"; payload: Habit }
  | { type: "TOGGLE_HABIT"; payload: string }
  | { type: "DELETE_HABIT"; payload: string }
  | { type: "UPDATE_POMODORO_SETTINGS"; payload: PomodoroSettings }
  | { type: "RESET_ALL" };

const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

const defaultPomodoroSettings: PomodoroSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  sessionsBeforeLongBreak: 4,
};

const initialState: AppState = {
  tasks: [],
  archivedTasks: [],
  habits: [],
  pomodoroSettings: defaultPomodoroSettings,
  isLoaded: false,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "LOAD_DATA":
      return { ...state, ...action.payload, isLoaded: true };
    case "ADD_TASK":
      return { ...state, tasks: [action.payload, ...state.tasks] };
    case "UPDATE_TASK":
      return {
        ...state,
        tasks: state.tasks.map((t) => (t.id === action.payload.id ? action.payload : t)),
      };
    case "COMPLETE_TASK": {
      const task = state.tasks.find((t) => t.id === action.payload);
      if (!task) return state;
      const completed = { ...task, isCompleted: true, completedAt: new Date().toISOString() };
      return {
        ...state,
        tasks: state.tasks.filter((t) => t.id !== action.payload),
        archivedTasks: [completed, ...state.archivedTasks],
      };
    }
    case "DELETE_TASK":
      return { ...state, tasks: state.tasks.filter((t) => t.id !== action.payload) };
    case "RESTORE_TASK": {
      const archived = state.archivedTasks.find((t) => t.id === action.payload);
      if (!archived) return state;
      const restored = { ...archived, isCompleted: false, completedAt: null };
      return {
        ...state,
        archivedTasks: state.archivedTasks.filter((t) => t.id !== action.payload),
        tasks: [restored, ...state.tasks],
      };
    }
    case "DELETE_ARCHIVED":
      return { ...state, archivedTasks: state.archivedTasks.filter((t) => t.id !== action.payload) };
    case "PIN_TASK":
      return {
        ...state,
        tasks: state.tasks.map((t) => (t.id === action.payload ? { ...t, isPinned: !t.isPinned } : t)),
      };
    case "MOVE_TASK":
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.payload.id ? { ...t, quadrant: action.payload.quadrant } : t
        ),
      };
    case "TOGGLE_SUBTASK":
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.payload.taskId
            ? {
                ...t,
                subtasks: t.subtasks.map((s) =>
                  s.id === action.payload.subtaskId ? { ...s, isDone: !s.isDone } : s
                ),
              }
            : t
        ),
      };
    case "ADD_HABIT":
      return { ...state, habits: [...state.habits, action.payload] };
    case "TOGGLE_HABIT": {
      const today = new Date().toISOString().split("T")[0];
      return {
        ...state,
        habits: state.habits.map((h) => {
          if (h.id !== action.payload) return h;
          const completedToday = h.completedDates.includes(today);
          if (completedToday) {
            return {
              ...h,
              completedDates: h.completedDates.filter((d) => d !== today),
              streak: Math.max(0, h.streak - 1),
            };
          }
          return {
            ...h,
            completedDates: [...h.completedDates, today],
            streak: h.streak + 1,
          };
        }),
      };
    }
    case "DELETE_HABIT":
      return { ...state, habits: state.habits.filter((h) => h.id !== action.payload) };
    case "UPDATE_POMODORO_SETTINGS":
      return { ...state, pomodoroSettings: action.payload };
    case "RESET_ALL":
      return { ...initialState, isLoaded: true };
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  addTask: (task: Omit<Task, "id" | "createdAt" | "isCompleted" | "completedAt">) => void;
  updateTask: (task: Task) => void;
  completeTask: (id: string) => void;
  deleteTask: (id: string) => void;
  restoreTask: (id: string) => void;
  deleteArchivedTask: (id: string) => void;
  pinTask: (id: string) => void;
  moveTask: (id: string, quadrant: TaskQuadrant) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  addHabit: (habit: Omit<Habit, "id" | "createdAt" | "streak" | "completedDates">) => void;
  toggleHabit: (id: string) => void;
  deleteHabit: (id: string) => void;
  updatePomodoroSettings: (settings: PomodoroSettings) => void;
  getTasksByQuadrant: (quadrant: TaskQuadrant) => Task[];
  getTasksForDate: (date: string) => Task[];
  getCompletionStats: () => { total: number; completed: number; byQuadrant: Record<TaskQuadrant, { total: number; completed: number }> };
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEYS = {
  tasks: "@sviroxk_tasks",
  archivedTasks: "@sviroxk_archived",
  habits: "@sviroxk_habits",
  pomodoroSettings: "@sviroxk_pomodoro",
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    (async () => {
      try {
        const [tasksJson, archivedJson, habitsJson, pomodoroJson] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.tasks),
          AsyncStorage.getItem(STORAGE_KEYS.archivedTasks),
          AsyncStorage.getItem(STORAGE_KEYS.habits),
          AsyncStorage.getItem(STORAGE_KEYS.pomodoroSettings),
        ]);
        dispatch({
          type: "LOAD_DATA",
          payload: {
            tasks: tasksJson ? JSON.parse(tasksJson) : [],
            archivedTasks: archivedJson ? JSON.parse(archivedJson) : [],
            habits: habitsJson ? JSON.parse(habitsJson) : [],
            pomodoroSettings: pomodoroJson ? JSON.parse(pomodoroJson) : defaultPomodoroSettings,
          },
        });
      } catch {
        dispatch({ type: "LOAD_DATA", payload: {} });
      }
    })();
  }, []);

  useEffect(() => {
    if (!state.isLoaded) return;
    AsyncStorage.multiSet([
      [STORAGE_KEYS.tasks, JSON.stringify(state.tasks)],
      [STORAGE_KEYS.archivedTasks, JSON.stringify(state.archivedTasks)],
      [STORAGE_KEYS.habits, JSON.stringify(state.habits)],
      [STORAGE_KEYS.pomodoroSettings, JSON.stringify(state.pomodoroSettings)],
    ]);
  }, [state.tasks, state.archivedTasks, state.habits, state.pomodoroSettings, state.isLoaded]);

  const addTask = useCallback((taskData: Omit<Task, "id" | "createdAt" | "isCompleted" | "completedAt">) => {
    const task: Task = {
      ...taskData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      isCompleted: false,
      completedAt: null,
    };
    dispatch({ type: "ADD_TASK", payload: task });
  }, []);

  const updateTask = useCallback((task: Task) => dispatch({ type: "UPDATE_TASK", payload: task }), []);
  const completeTask = useCallback((id: string) => dispatch({ type: "COMPLETE_TASK", payload: id }), []);
  const deleteTask = useCallback((id: string) => dispatch({ type: "DELETE_TASK", payload: id }), []);
  const restoreTask = useCallback((id: string) => dispatch({ type: "RESTORE_TASK", payload: id }), []);
  const deleteArchivedTask = useCallback((id: string) => dispatch({ type: "DELETE_ARCHIVED", payload: id }), []);
  const pinTask = useCallback((id: string) => dispatch({ type: "PIN_TASK", payload: id }), []);
  const moveTask = useCallback((id: string, quadrant: TaskQuadrant) => dispatch({ type: "MOVE_TASK", payload: { id, quadrant } }), []);
  const toggleSubtask = useCallback((taskId: string, subtaskId: string) => dispatch({ type: "TOGGLE_SUBTASK", payload: { taskId, subtaskId } }), []);

  const addHabit = useCallback((habitData: Omit<Habit, "id" | "createdAt" | "streak" | "completedDates">) => {
    const habit: Habit = {
      ...habitData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      streak: 0,
      completedDates: [],
    };
    dispatch({ type: "ADD_HABIT", payload: habit });
  }, []);

  const toggleHabit = useCallback((id: string) => dispatch({ type: "TOGGLE_HABIT", payload: id }), []);
  const deleteHabit = useCallback((id: string) => dispatch({ type: "DELETE_HABIT", payload: id }), []);
  const updatePomodoroSettings = useCallback((settings: PomodoroSettings) => dispatch({ type: "UPDATE_POMODORO_SETTINGS", payload: settings }), []);

  const getTasksByQuadrant = useCallback(
    (quadrant: TaskQuadrant) => {
      return state.tasks
        .filter((t) => t.quadrant === quadrant && !t.isCompleted)
        .sort((a, b) => {
          if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
          const priorityOrder = { p1: 0, p2: 1, p3: 2 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        });
    },
    [state.tasks]
  );

  const getTasksForDate = useCallback(
    (date: string) => {
      return state.tasks.filter((t) => {
        if (!t.deadline) return false;
        return t.deadline.split("T")[0] === date;
      });
    },
    [state.tasks]
  );

  const getCompletionStats = useCallback(() => {
    const all = [...state.tasks, ...state.archivedTasks];
    const quadrants: TaskQuadrant[] = ["urgentImportant", "notUrgentImportant", "urgentNotImportant", "notUrgentNotImportant"];
    const byQuadrant = {} as Record<TaskQuadrant, { total: number; completed: number }>;
    for (const q of quadrants) {
      const qTasks = all.filter((t) => t.quadrant === q);
      byQuadrant[q] = { total: qTasks.length, completed: qTasks.filter((t) => t.isCompleted).length };
    }
    return {
      total: all.length,
      completed: state.archivedTasks.length,
      byQuadrant,
    };
  }, [state.tasks, state.archivedTasks]);

  const value = useMemo(
    () => ({
      state,
      dispatch,
      addTask,
      updateTask,
      completeTask,
      deleteTask,
      restoreTask,
      deleteArchivedTask,
      pinTask,
      moveTask,
      toggleSubtask,
      addHabit,
      toggleHabit,
      deleteHabit,
      updatePomodoroSettings,
      getTasksByQuadrant,
      getTasksForDate,
      getCompletionStats,
    }),
    [state, addTask, updateTask, completeTask, deleteTask, restoreTask, deleteArchivedTask, pinTask, moveTask, toggleSubtask, addHabit, toggleHabit, deleteHabit, updatePomodoroSettings, getTasksByQuadrant, getTasksForDate, getCompletionStats]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
}
