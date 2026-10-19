"use client";

import { create } from "zustand";
import confetti from "canvas-confetti";
import { sounds } from "@/utils/audio";
import { calculateLevel, XP_REWARDS, LEVEL_TIERS } from "@/utils/levelSystem";

export const DEFAULT_APPS = [
  {
    id: "main-workspace",
    name: "My Project",
    icon: "🌱",
    tag: "Core",
    color: "#5F7A49",
    theme: "matcha",
    dailyTarget: 2,
    description: "Personal dev workspace & quests.",
  },
];

export const DEFAULT_CATEGORIES = [
  { id: "ui-flower", label: "Front-End Petals", emoji: "🌸", color: "#78995a" },
  { id: "backend", label: "Backend Roots", emoji: "🥕", color: "#d48b38" },
  { id: "bugfix", label: "Bug Squash", emoji: "🐞", color: "#e26d5c" },
  { id: "polish", label: "Polish & Clean", emoji: "✨", color: "#70a9a1" },
  { id: "rest", label: "Mindful Rest", emoji: "☕", color: "#6d849b" },
];

export const INITIAL_CAFE_STAMPS = [
  { id: 1, label: "#1", icon: "🍵", status: "next" },
  { id: 2, label: "#2", icon: "☕", status: "pending" },
  { id: 3, label: "#3", icon: "🧋", status: "pending" },
  { id: 4, label: "#4", icon: "☕", status: "pending" },
  { id: 5, label: "#5", icon: "🍵", status: "pending" },
  { id: 6, label: "#6", icon: "☕", status: "pending" },
  { id: 7, label: "#7", icon: "🌱", status: "pending" },
  { id: 8, label: "Reward", icon: "🥐", status: "reward" },
];

export const DEFAULT_PROFILE = {
  avatar: "🧸",
  name: "SPROUT",
  handle: "(@^ 0 ^)",
  title: "frontend / developer / plant parent",
  mood: "in the coding flow",
  bio: "Hello friend! Welcome to your cozy desk. Take sips of water, stretch often, and celebrate small commits! ☕🌱",
  dailyIntention: "Keep code clean, sip matcha often, and don't worry if a bug takes time. We nurture our garden one seed at a time.",
};

export const DEFAULT_SHELVES = [
  { id: "shelf-1", icon: "🐛", label: "github repository", url: "https://github.com", isExternal: true },
  { id: "shelf-2", icon: "🍊", label: "issue tracker list", url: "https://github.com/issues", isExternal: true },
  { id: "shelf-3", icon: "🍓", label: "api documentation", url: "https://developer.mozilla.org", isExternal: true },
  { id: "shelf-4", icon: "🍃", label: "study room playlist", action: "rain", isExternal: false },
];

const isSameDay = (dateInput, targetDateStr) => {
  if (!dateInput || !targetDateStr) return false;
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return false;
  return d.toDateString() === targetDateStr;
};

// Safe helper to write to localStorage
const safeStorage = {
  get: (key) => {
    if (typeof window === "undefined") return null;
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set: (key, val) => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(key, typeof val === "string" ? val : JSON.stringify(val));
    } catch {}
  },
};

export const useTaskStore = create((set, get) => ({
  // Active View Tab & Selection
  activeTab: "desk",
  selectedAppId: "all",
  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedAppId: (appId) => set({ selectedAppId: appId }),

  // Desk Menu Modal
  isDeskMenuOpen: false,
  deskMenuTab: "profile",
  openDeskMenu: (tab = "profile") => {
    if (sounds) sounds.playClick();
    set({ isDeskMenuOpen: true, deskMenuTab: tab });
  },
  closeDeskMenu: () => set({ isDeskMenuOpen: false }),
  setDeskMenuTab: (tab) => set({ deskMenuTab: tab }),

  // Profile & Shelves
  userProfile: DEFAULT_PROFILE,
  shelves: DEFAULT_SHELVES,
  updateUserProfile: (updates) => {
    set((state) => {
      const next = { ...state.userProfile, ...updates };
      safeStorage.set("devsprout_profile", next);
      return { userProfile: next };
    });
    if (sounds) sounds.playPop();
  },
  updateShelves: (newShelves) => {
    set({ shelves: newShelves });
    safeStorage.set("devsprout_shelves", newShelves);
    if (sounds) sounds.playPop();
  },
  addShelf: (newShelf) => {
    set((state) => {
      const shelf = {
        id: `shelf-${Date.now()}`,
        icon: "🔖",
        isExternal: true,
        ...newShelf,
      };
      const next = [...state.shelves, shelf];
      safeStorage.set("devsprout_shelves", next);
      return { shelves: next };
    });
    if (sounds) sounds.playClick();
  },
  deleteShelf: (id) => {
    set((state) => {
      const next = state.shelves.filter((s) => s.id !== id);
      safeStorage.set("devsprout_shelves", next);
      return { shelves: next };
    });
    if (sounds) sounds.playClick();
  },

  // Themes & Ambience
  theme: "matcha",
  audioEnabled: true,
  updateTheme: (newTheme) => {
    set({ theme: newTheme });
    safeStorage.set("devsprout_theme", newTheme);
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", newTheme);
    }
    if (sounds) sounds.playClick();
  },
  toggleAudio: (enabled) => {
    set({ audioEnabled: enabled });
    safeStorage.set("devsprout_audio", String(enabled));
    if (sounds) sounds.setMuted(!enabled);
  },

  // Hydration Water Meter
  waterCups: 0,
  maxWaterCups: 5,
  updateMaxWater: (cups) => {
    const num = Number(cups);
    set({ maxWaterCups: num });
    safeStorage.set("devsprout_max_water", String(num));
    if (sounds) sounds.playPop();
  },
  sipWater: () => {
    const { maxWaterCups, waterCups, addXp } = get();
    const nextCups = waterCups >= maxWaterCups ? 1 : waterCups + 1;
    if (sounds) sounds.playWaterDrop();
    set({ waterCups: nextCups });
    safeStorage.set("devsprout_water", String(nextCups));
    addXp(XP_REWARDS.SIP_WATER, "Hydration Sip");
  },

  // Developer Progression & Level System
  userXp: 0,
  levelUpToast: null,
  addXp: (amount, reason = "") => {
    if (!amount || amount <= 0) return;
    set((state) => {
      const oldLevelData = calculateLevel(state.userXp);
      const newXp = state.userXp + amount;
      const newLevelData = calculateLevel(newXp);

      safeStorage.set("devsprout_user_xp", String(newXp));

      if (newLevelData.level > oldLevelData.level) {
        if (sounds) sounds.playBellChime();
        confetti({
          particleCount: 55,
          spread: 70,
          origin: { y: 0.5 },
          colors: ["#78995a", "#f8df8c", "#e26d5c", "#ffd166"],
        });
        return {
          userXp: newXp,
          levelUpToast: {
            level: newLevelData.level,
            title: newLevelData.title,
            icon: newLevelData.icon,
            reason,
          },
        };
      }
      return { userXp: newXp };
    });
  },
  dismissLevelUpToast: () => set({ levelUpToast: null }),

  // Apps Management
  apps: DEFAULT_APPS,
  addApp: (newApp) => {
    set((state) => {
      const app = {
        id: `app-${Date.now()}`,
        color: "#5F7A49",
        icon: "🌱",
        dailyTarget: 2,
        ...newApp,
      };
      const next = [...state.apps, app];
      safeStorage.set("devsprout_apps", next);
      return { apps: next };
    });
    if (sounds) sounds.playClick();
  },
  updateApp: (appId, updates) => {
    set((state) => {
      const next = state.apps.map((a) => (a.id === appId ? { ...a, ...updates } : a));
      safeStorage.set("devsprout_apps", next);
      return { apps: next };
    });
    if (sounds) sounds.playPop();
  },
  deleteApp: (appId) => {
    const { apps } = get();
    if (apps.length <= 1) return;
    set((state) => {
      const nextApps = state.apps.filter((a) => a.id !== appId);
      const nextTasks = state.tasks.filter((t) => t.appId !== appId);
      safeStorage.set("devsprout_apps", nextApps);
      safeStorage.set("devsprout_tasks", nextTasks);
      return {
        apps: nextApps,
        tasks: nextTasks,
        selectedAppId: state.selectedAppId === appId ? "all" : state.selectedAppId,
      };
    });
    if (sounds) sounds.playClick();
  },
  selectAppWithTheme: (appId) => {
    const { apps, updateTheme } = get();
    set({ selectedAppId: appId });
    if (appId !== "all") {
      const app = apps.find((a) => a.id === appId);
      if (app?.theme) updateTheme(app.theme);
    }
  },

  // Task Categories
  taskCategories: DEFAULT_CATEGORIES,
  addCategory: (newCat) => {
    const id = newCat.id || `cat-${Date.now()}`;
    const category = {
      id,
      label: newCat.label || "New Tag",
      emoji: newCat.emoji || "🏷️",
      color: newCat.color || "#5F7A49",
    };
    set((state) => {
      const next = [...state.taskCategories, category];
      safeStorage.set("devsprout_categories", next);
      return { taskCategories: next };
    });
    if (sounds) sounds.playPop();
  },
  updateCategory: (catId, updates) => {
    set((state) => {
      const next = state.taskCategories.map((c) => (c.id === catId ? { ...c, ...updates } : c));
      safeStorage.set("devsprout_categories", next);
      return { taskCategories: next };
    });
    if (sounds) sounds.playPop();
  },
  deleteCategory: (catId) => {
    const { taskCategories } = get();
    if (taskCategories.length <= 1) return;
    set((state) => {
      const next = state.taskCategories.filter((c) => c.id !== catId);
      safeStorage.set("devsprout_categories", next);
      return { taskCategories: next };
    });
    if (sounds) sounds.playClick();
  },

  // Tasks Management
  tasks: [],
  addTask: (newTask) => {
    const isHarvested = newTask?.status === "harvested";
    const task = {
      id: `task-${Date.now()}`,
      ticketNumber: `#SP-${Math.floor(Math.random() * 80 + 20)}`,
      status: "sprouting",
      createdDaysAgo: 0,
      updatedAt: new Date().toISOString(),
      completedAt: isHarvested ? new Date().toISOString() : null,
      teacups: 1,
      priority: "normal",
      type: "sprint",
      typeLabel: "SPRINT",
      ...newTask,
    };
    set((state) => {
      const next = [task, ...state.tasks];
      safeStorage.set("devsprout_tasks", next);
      return { tasks: next };
    });
    if (isHarvested) {
      get().addXp(XP_REWARDS.HARVEST_TASK, "Harvested Task");
    }
    if (sounds) sounds.playClick();
  },
  updateTask: (taskId, updates) => {
    set((state) => {
      const next = state.tasks.map((t) => {
        if (t.id === taskId) {
          const isHarvestedTransition = updates.status === "harvested" && t.status !== "harvested";
          const isUnharvestedTransition = updates.status && updates.status !== "harvested" && t.status === "harvested";

          let completedAt = t.completedAt;
          if (isHarvestedTransition) {
            completedAt = new Date().toISOString();
          } else if (isUnharvestedTransition) {
            completedAt = null;
          }

          const updated = {
            ...t,
            ...updates,
            completedAt,
            updatedAt: new Date().toISOString(),
          };
          if (updates.type && !updates.typeLabel) {
            updated.typeLabel = updates.type.toUpperCase();
          }
          if (isHarvestedTransition) {
            get().addXp(XP_REWARDS.HARVEST_TASK, "Harvested Task");
            if (sounds) sounds.playPop();
            confetti({
              particleCount: 35,
              spread: 45,
              origin: { y: 0.7 },
              colors: ["#6b8e23", "#f9d976", "#e07a5f"],
            });
          }
          return updated;
        }
        return t;
      });
      safeStorage.set("devsprout_tasks", next);
      return { tasks: next };
    });
    if (sounds) sounds.playPop();
  },
  updateTaskStatus: (taskId, newStatus) => {
    set((state) => {
      const next = state.tasks.map((t) => {
        if (t.id === taskId) {
          const wasHarvested = t.status === "harvested";
          const isHarvested = newStatus === "harvested";
          let completedAt = t.completedAt;
          if (isHarvested && !wasHarvested) {
            completedAt = new Date().toISOString();
            get().addXp(XP_REWARDS.HARVEST_TASK, "Harvested Task");
            if (sounds) sounds.playPop();
            confetti({
              particleCount: 35,
              spread: 45,
              origin: { y: 0.7 },
              colors: ["#6b8e23", "#f9d976", "#e07a5f"],
            });
          } else if (!isHarvested && wasHarvested) {
            completedAt = null;
          }
          return {
            ...t,
            status: newStatus,
            completedAt,
            updatedAt: new Date().toISOString(),
          };
        }
        return t;
      });
      safeStorage.set("devsprout_tasks", next);
      return { tasks: next };
    });
  },
  deleteTask: (taskId) => {
    set((state) => {
      const next = state.tasks.filter((t) => t.id !== taskId);
      safeStorage.set("devsprout_tasks", next);
      return { tasks: next };
    });
    if (sounds) sounds.playClick();
  },
  toggleTaskDone: (taskId) => {
    const { tasks, updateTaskStatus } = get();
    const target = tasks.find((t) => t.id === taskId);
    if (!target) return;
    const nextStatus = target.status === "harvested" ? "sprouting" : "harvested";
    updateTaskStatus(taskId, nextStatus);
  },
  clearHarvestedTasks: () => {
    set((state) => {
      const next = state.tasks.filter((t) => t.status !== "harvested");
      safeStorage.set("devsprout_tasks", next);
      return { tasks: next };
    });
    if (sounds) sounds.playPop();
  },

  // Scratchpad & Learnings
  scratchpadCode: "",
  setScratchpadCode: (code) => {
    set({ scratchpadCode: code });
    safeStorage.set("devsprout_scratchpad", code);
  },
  learnings: [],
  setLearnings: (fnOrArray) => {
    set((state) => {
      const next = typeof fnOrArray === "function" ? fnOrArray(state.learnings) : fnOrArray;
      safeStorage.set("devsprout_learnings", next);
      return { learnings: next };
    });
  },

  // Reaction Stamps
  stamps: { bear: 0, strawberry: 0, matcha: 0, sparkle: 0 },
  addStamp: (type) => {
    if (sounds) sounds.playPop();
    set((state) => ({
      stamps: { ...state.stamps, [type]: (state.stamps[type] || 0) + 1 },
    }));
    get().addXp(XP_REWARDS.STAMP, "Desk Reaction");
  },

  // Pomodoro Timer & Cafe
  pomodoroDuration: 25 * 60,
  timeLeft: 25 * 60,
  isTimerRunning: false,
  timerIntervalCount: 0,
  currentBeverage: "Matcha Latte",
  cafeStamps: INITIAL_CAFE_STAMPS,
  sessionLogs: [],
  setTimeLeft: (val) => set({ timeLeft: typeof val === "function" ? val(get().timeLeft) : val }),
  setIsTimerRunning: (val) => set({ isTimerRunning: typeof val === "function" ? val(get().isTimerRunning) : val }),
  setPomodoroDuration: (val) => set({ pomodoroDuration: val }),
  setCurrentBeverage: (bev) => set({ currentBeverage: bev }),
  updatePomodoroDuration: (secs) => {
    const dur = Number(secs);
    set({ pomodoroDuration: dur });
    safeStorage.set("devsprout_pomo_dur", String(dur));
    if (!get().isTimerRunning) set({ timeLeft: dur });
    if (sounds) sounds.playClick();
  },
  handlePomodoroComplete: () => {
    if (sounds) sounds.playBellChime();
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
      colors: ["#78995a", "#f8df8c", "#e26d5c"],
    });

    set((state) => {
      const nextIndex = state.cafeStamps.findIndex((s) => s.status === "next");
      let updatedStamps = state.cafeStamps;
      if (nextIndex !== -1) {
        updatedStamps = [...state.cafeStamps];
        updatedStamps[nextIndex] = { ...updatedStamps[nextIndex], status: "done" };
        if (nextIndex + 1 < updatedStamps.length && updatedStamps[nextIndex + 1].status !== "reward") {
          updatedStamps[nextIndex + 1] = { ...updatedStamps[nextIndex + 1], status: "next" };
        }
      }

      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const newLog = {
        id: `log-${Date.now()}`,
        time: timeStr,
        beverage: state.currentBeverage,
        icon: state.currentBeverage.includes("Matcha") ? "🍵" : "☕",
        task: `Mindful Focus Sprint #${state.timerIntervalCount + 1}`,
        status: "Completed ✨",
        appId: state.selectedAppId,
      };
      const nextLogs = [newLog, ...state.sessionLogs];

      safeStorage.set("devsprout_cafe_stamps", updatedStamps);
      safeStorage.set("devsprout_session_logs", nextLogs);

      return {
        cafeStamps: updatedStamps,
        sessionLogs: nextLogs,
        timerIntervalCount: state.timerIntervalCount + 1,
        timeLeft: state.pomodoroDuration,
      };
    });

    get().addXp(XP_REWARDS.FOCUS_SESSION, "Mindful Pomodoro");
  },

  // Daily Reset & Mascot
  todayKey: "",
  setTodayKey: (k) => set({ todayKey: k }),
  mascotMood: "in the coding flow",
  setMascotMood: (mood) => set({ mascotMood: mood }),
  mascotQuote: "Remember: Drink water, push clean commits, you are doing great! 🌸",
  setMascotQuote: (quote) => set({ mascotQuote: quote }),
  resetDailyStats: () => {
    set({
      waterCups: 0,
      cafeStamps: INITIAL_CAFE_STAMPS,
      timerIntervalCount: 0,
    });
    safeStorage.set("devsprout_water", "0");
    safeStorage.set("devsprout_cafe_stamps", INITIAL_CAFE_STAMPS);
    if (sounds) sounds.playBellChime();
  },

  // Export & Import
  exportWorkspaceData: () => {
    const state = get();
    const data = {
      version: "devsprout_v4_zustand",
      exportDate: new Date().toISOString(),
      userProfile: state.userProfile,
      shelves: state.shelves,
      theme: state.theme,
      audioEnabled: state.audioEnabled,
      apps: state.apps,
      tasks: state.tasks,
      waterCups: state.waterCups,
      maxWaterCups: state.maxWaterCups,
      userXp: state.userXp,
      learnings: state.learnings,
      scratchpadCode: state.scratchpadCode,
      sessionLogs: state.sessionLogs,
      cafeStamps: state.cafeStamps,
    };
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `devsprout-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    if (sounds) sounds.playPop();
  },
  importWorkspaceData: (jsonStr) => {
    try {
      const data = JSON.parse(jsonStr);
      const updates = {};
      if (data.userProfile) updates.userProfile = data.userProfile;
      if (data.shelves) updates.shelves = data.shelves;
      if (data.theme) {
        updates.theme = data.theme;
        if (typeof document !== "undefined") {
          document.documentElement.setAttribute("data-theme", data.theme);
        }
      }
      if (typeof data.audioEnabled === "boolean") {
        updates.audioEnabled = data.audioEnabled;
        if (sounds) sounds.setMuted(!data.audioEnabled);
      }
      if (data.apps) updates.apps = data.apps;
      if (data.tasks) updates.tasks = data.tasks;
      if (typeof data.waterCups === "number") updates.waterCups = data.waterCups;
      if (typeof data.maxWaterCups === "number") updates.maxWaterCups = data.maxWaterCups;
      if (typeof data.userXp === "number") updates.userXp = data.userXp;
      if (data.learnings) updates.learnings = data.learnings;
      if (data.scratchpadCode) updates.scratchpadCode = data.scratchpadCode;
      if (data.sessionLogs) updates.sessionLogs = data.sessionLogs;
      if (data.cafeStamps) updates.cafeStamps = data.cafeStamps;

      set(updates);

      // Persist loaded keys
      Object.entries(updates).forEach(([k, v]) => {
        safeStorage.set(`devsprout_${k}`, v);
      });

      if (sounds) sounds.playBellChime();
      return true;
    } catch {
      return false;
    }
  },

  // Hydrate Store from LocalStorage
  hydrateFromStorage: () => {
    if (typeof window === "undefined") return;
    try {
      const updates = {};
      const savedProfile = safeStorage.get("devsprout_profile");
      if (savedProfile) updates.userProfile = JSON.parse(savedProfile);

      const savedShelves = safeStorage.get("devsprout_shelves");
      if (savedShelves) updates.shelves = JSON.parse(savedShelves);

      const savedTheme = safeStorage.get("devsprout_theme");
      if (savedTheme) {
        updates.theme = savedTheme;
        document.documentElement.setAttribute("data-theme", savedTheme);
      }

      const savedAudio = safeStorage.get("devsprout_audio");
      if (savedAudio !== null) {
        const isAudio = savedAudio === "true";
        updates.audioEnabled = isAudio;
        if (sounds) sounds.setMuted(!isAudio);
      }

      const savedMaxWater = safeStorage.get("devsprout_max_water");
      if (savedMaxWater) updates.maxWaterCups = Number(savedMaxWater);

      const savedPomo = safeStorage.get("devsprout_pomo_dur");
      if (savedPomo) {
        const dur = Number(savedPomo);
        updates.pomodoroDuration = dur;
        updates.timeLeft = dur;
      }

      const savedApps = safeStorage.get("devsprout_apps");
      if (savedApps) updates.apps = JSON.parse(savedApps);

      const savedTasks = safeStorage.get("devsprout_tasks");
      let loadedTasks = [];
      if (savedTasks) {
        const parsed = JSON.parse(savedTasks);
        loadedTasks = parsed.filter(
          (t) => !["task-1", "task-2", "task-3", "task-4", "task-5", "task-6", "task-7"].includes(t.id)
        );
        updates.tasks = loadedTasks;
      }

      const savedWater = safeStorage.get("devsprout_water");
      if (savedWater !== null) updates.waterCups = Number(savedWater);

      const savedStamps = safeStorage.get("devsprout_cafe_stamps");
      if (savedStamps) updates.cafeStamps = JSON.parse(savedStamps);

      const savedLearnings = safeStorage.get("devsprout_learnings");
      if (savedLearnings) updates.learnings = JSON.parse(savedLearnings);

      const savedCategories = safeStorage.get("devsprout_categories");
      if (savedCategories) {
        try {
          updates.taskCategories = JSON.parse(savedCategories);
        } catch {}
      }

      const savedLogs = safeStorage.get("devsprout_session_logs");
      if (savedLogs) updates.sessionLogs = JSON.parse(savedLogs);

      const savedXp = safeStorage.get("devsprout_user_xp");
      if (savedXp !== null) {
        updates.userXp = Number(savedXp);
      } else {
        // Bootstrap initial XP from tasks & water
        let bootstrapXp = 0;
        const harvestedCount = loadedTasks.filter((t) => t.status === "harvested").length;
        bootstrapXp += harvestedCount * XP_REWARDS.HARVEST_TASK;
        if (savedWater !== null) {
          bootstrapXp += Number(savedWater) * XP_REWARDS.SIP_WATER;
        }
        if (bootstrapXp > 0) {
          updates.userXp = bootstrapXp;
        }
      }

      updates.todayKey = new Date().toDateString();
      set(updates);
    } catch (e) {
      console.warn("Zustand store hydration error:", e);
    }
  },
}));

// Backward-compatible hook and selectors
export function useTaskManager() {
  const store = useTaskStore();

  // Dynamic getters calculated on read
  const levelData = calculateLevel(store.userXp);

  const staleTasks = store.tasks.filter((t) => {
    if (t.status === "harvested") return false;
    return t.createdDaysAgo >= 2 || (t.priority === "urgent" && t.status === "sprouting");
  });

  const appBalanceData = store.apps.map((app) => {
    const appTasks = store.tasks.filter((t) => t.appId === app.id);
    const completed = appTasks.filter((t) => {
      if (t.status !== "harvested") return false;
      const compDate = t.completedAt || t.updatedAt;
      return isSameDay(compDate, store.todayKey);
    }).length;
    const active = appTasks.filter((t) => t.status !== "harvested").length;
    const quota = app.dailyTarget || 1;
    const metQuota = completed >= quota;
    return {
      ...app,
      completed,
      active,
      quota,
      metQuota,
      percentage: Math.min(100, Math.round((completed / quota) * 100)),
    };
  });

  const imbalancedApp = appBalanceData.find(
    (a) =>
      a.completed >= 3 &&
      appBalanceData.some((other) => other.id !== a.id && other.completed === 0 && other.active > 0)
  );

  return {
    ...store,
    levelData,
    staleTasks,
    appBalanceData,
    imbalancedApp,
    LEVEL_TIERS,
    XP_REWARDS,
  };
}
