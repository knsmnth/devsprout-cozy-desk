"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import confetti from "canvas-confetti";
import { sounds } from "@/utils/audio";

const TaskContext = createContext(null);

const DEFAULT_APPS = [
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

const DEFAULT_CATEGORIES = [
  { id: "ui-flower", label: "Front-End Petals", emoji: "🌸", color: "#78995a" },
  { id: "backend", label: "Backend Roots", emoji: "🥕", color: "#d48b38" },
  { id: "bugfix", label: "Bug Squash", emoji: "🐞", color: "#e26d5c" },
  { id: "polish", label: "Polish & Clean", emoji: "✨", color: "#70a9a1" },
  { id: "rest", label: "Mindful Rest", emoji: "☕", color: "#6d849b" },
];

const INITIAL_TASKS = [];

const INITIAL_LEARNINGS = [];

const INITIAL_CAFE_STAMPS = [
  { id: 1, label: "#1", icon: "🍵", status: "next" },
  { id: 2, label: "#2", icon: "☕", status: "pending" },
  { id: 3, label: "#3", icon: "🧋", status: "pending" },
  { id: 4, label: "#4", icon: "☕", status: "pending" },
  { id: 5, label: "#5", icon: "🍵", status: "pending" },
  { id: 6, label: "#6", icon: "☕", status: "pending" },
  { id: 7, label: "#7", icon: "🌱", status: "pending" },
  { id: 8, label: "Reward", icon: "🥐", status: "reward" },
];

const DEFAULT_PROFILE = {
  avatar: "🧸",
  name: "SPROUT",
  handle: "(@^ 0 ^)",
  title: "frontend / developer / plant parent",
  mood: "in the coding flow",
  bio: "Hello friend! Welcome to your cozy desk. Take sips of water, stretch often, and celebrate small commits! ☕🌱",
  dailyIntention: "Keep code clean, sip matcha often, and don't worry if a bug takes time. We nurture our garden one seed at a time.",
};

const DEFAULT_SHELVES = [
  { id: "shelf-1", icon: "🐛", label: "github repository", url: "https://github.com", isExternal: true },
  { id: "shelf-2", icon: "🍊", label: "issue tracker list", url: "https://github.com/issues", isExternal: true },
  { id: "shelf-3", icon: "🍓", label: "api documentation", url: "https://developer.mozilla.org", isExternal: true },
  { id: "shelf-4", icon: "🍃", label: "study room playlist", action: "rain", isExternal: false },
];

export function TaskProvider({ children }) {
  // Active Tab
  const [activeTab, setActiveTab] = useState("desk"); // 'desk' | 'sprint' | 'notes' | 'cafe'
  const [selectedAppId, setSelectedAppId] = useState("all"); // 'all' or app id

  // Desk Menu Modal State
  const [isDeskMenuOpen, setIsDeskMenuOpen] = useState(false);
  const [deskMenuTab, setDeskMenuTab] = useState("profile"); // 'profile' | 'shelves' | 'apps' | 'theme' | 'data'

  // Developer Profile & Shelves
  const [userProfile, setUserProfile] = useState(DEFAULT_PROFILE);
  const [shelves, setShelves] = useState(DEFAULT_SHELVES);

  // Theme & Sound Atmosphere
  const [theme, setTheme] = useState("matcha"); // 'matcha' | 'sakura' | 'coffee' | 'midnight' | 'terracotta'
  const [audioEnabled, setAudioEnabled] = useState(true);

  // App & Task State
  const [apps, setApps] = useState(DEFAULT_APPS);
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [taskCategories, setTaskCategories] = useState(DEFAULT_CATEGORIES);
  const [waterCups, setWaterCups] = useState(0);
  const [maxWaterCups, setMaxWaterCups] = useState(5);

  // Scratchpad & Reactions
  const [scratchpadCode, setScratchpadCode] = useState("");
  const [learnings, setLearnings] = useState(INITIAL_LEARNINGS);
  const [stamps, setStamps] = useState({ bear: 0, strawberry: 0, matcha: 0, sparkle: 0 });

  // Cafe Pomodoro
  const [pomodoroDuration, setPomodoroDuration] = useState(25 * 60);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerIntervalCount, setTimerIntervalCount] = useState(0);
  const [currentBeverage, setCurrentBeverage] = useState("Matcha Latte");
  const [cafeStamps, setCafeStamps] = useState(INITIAL_CAFE_STAMPS);
  const [sessionLogs, setSessionLogs] = useState([]);

  // Mascot & Garden
  const [mascotMood, setMascotMood] = useState("in the coding flow");
  const [mascotQuote, setMascotQuote] = useState(
    "Remember: Drink water, push clean commits, you are doing great! 🌸"
  );

  // Load from LocalStorage (with version migration to purge old mock data)
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    try {
      const STORAGE_VERSION = "devsprout_v3_custom";
      const storedVersion = localStorage.getItem("devsprout_version");

      if (storedVersion !== STORAGE_VERSION) {
        // Migrate or initialize
        localStorage.setItem("devsprout_version", STORAGE_VERSION);
      }

      const savedProfile = localStorage.getItem("devsprout_profile");
      if (savedProfile) setUserProfile(JSON.parse(savedProfile));

      const savedShelves = localStorage.getItem("devsprout_shelves");
      if (savedShelves) setShelves(JSON.parse(savedShelves));

      const savedTheme = localStorage.getItem("devsprout_theme");
      if (savedTheme) {
        setTheme(savedTheme);
        document.documentElement.setAttribute("data-theme", savedTheme);
      }

      const savedAudio = localStorage.getItem("devsprout_audio");
      if (savedAudio !== null) {
        const isAudioOn = savedAudio === "true";
        setAudioEnabled(isAudioOn);
        if (sounds) sounds.setMuted(!isAudioOn);
      }

      const savedMaxWater = localStorage.getItem("devsprout_max_water");
      if (savedMaxWater) setMaxWaterCups(Number(savedMaxWater));

      const savedPomo = localStorage.getItem("devsprout_pomo_dur");
      if (savedPomo) {
        const dur = Number(savedPomo);
        setPomodoroDuration(dur);
        setTimeLeft(dur);
      }

      const savedApps = localStorage.getItem("devsprout_apps");
      if (savedApps) setApps(JSON.parse(savedApps));

      const savedTasks = localStorage.getItem("devsprout_tasks");
      if (savedTasks) {
        const parsed = JSON.parse(savedTasks);
        const cleaned = parsed.filter(
          (t) => !["task-1", "task-2", "task-3", "task-4", "task-5", "task-6", "task-7"].includes(t.id)
        );
        setTasks(cleaned);
      }

      const savedWater = localStorage.getItem("devsprout_water");
      if (savedWater !== null) setWaterCups(Number(savedWater));

      const savedStamps = localStorage.getItem("devsprout_cafe_stamps");
      if (savedStamps) setCafeStamps(JSON.parse(savedStamps));

      const savedLearnings = localStorage.getItem("devsprout_learnings");
      if (savedLearnings) setLearnings(JSON.parse(savedLearnings));

      const savedCategories = localStorage.getItem("devsprout_categories");
      if (savedCategories) {
        try {
          setTaskCategories(JSON.parse(savedCategories));
        } catch {}
      }

      const savedLogs = localStorage.getItem("devsprout_session_logs");
      if (savedLogs) setSessionLogs(JSON.parse(savedLogs));
    } catch {
      // Local storage unavailable or SSR
    }
  }, []);

  // Save changes to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem("devsprout_profile", JSON.stringify(userProfile));
    } catch {}
  }, [userProfile]);

  useEffect(() => {
    try {
      localStorage.setItem("devsprout_shelves", JSON.stringify(shelves));
    } catch {}
  }, [shelves]);

  useEffect(() => {
    try {
      localStorage.setItem("devsprout_theme", theme);
      document.documentElement.setAttribute("data-theme", theme);
    } catch {}
  }, [theme]);

  useEffect(() => {
    try {
      localStorage.setItem("devsprout_audio", String(audioEnabled));
      if (sounds) sounds.setMuted(!audioEnabled);
    } catch {}
  }, [audioEnabled]);

  useEffect(() => {
    try {
      localStorage.setItem("devsprout_max_water", String(maxWaterCups));
    } catch {}
  }, [maxWaterCups]);

  useEffect(() => {
    try {
      localStorage.setItem("devsprout_pomo_dur", String(pomodoroDuration));
    } catch {}
  }, [pomodoroDuration]);

  useEffect(() => {
    try {
      localStorage.setItem("devsprout_apps", JSON.stringify(apps));
    } catch {}
  }, [apps]);

  useEffect(() => {
    try {
      localStorage.setItem("devsprout_tasks", JSON.stringify(tasks));
    } catch {}
  }, [tasks]);

  useEffect(() => {
    try {
      localStorage.setItem("devsprout_water", String(waterCups));
    } catch {}
  }, [waterCups]);

  useEffect(() => {
    try {
      localStorage.setItem("devsprout_cafe_stamps", JSON.stringify(cafeStamps));
    } catch {}
  }, [cafeStamps]);

  useEffect(() => {
    try {
      localStorage.setItem("devsprout_learnings", JSON.stringify(learnings));
    } catch {}
  }, [learnings]);

  useEffect(() => {
    try {
      localStorage.setItem("devsprout_session_logs", JSON.stringify(sessionLogs));
    } catch {}
  }, [sessionLogs]);

  useEffect(() => {
    try {
      localStorage.setItem("devsprout_categories", JSON.stringify(taskCategories));
    } catch {}
  }, [taskCategories]);

  const handlePomodoroComplete = useCallback(() => {
    if (sounds) sounds.playBellChime();
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
      colors: ["#78995a", "#f8df8c", "#e26d5c"],
    });

    // Award next stamp
    setCafeStamps((prev) => {
      const nextIndex = prev.findIndex((s) => s.status === "next");
      if (nextIndex !== -1) {
        const updated = [...prev];
        updated[nextIndex] = { ...updated[nextIndex], status: "done" };
        if (nextIndex + 1 < updated.length) {
          if (updated[nextIndex + 1].status !== "reward") {
            updated[nextIndex + 1] = { ...updated[nextIndex + 1], status: "next" };
          }
        }
        return updated;
      }
      return prev;
    });

    // Add session log
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setSessionLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        time: timeStr,
        beverage: currentBeverage,
        icon: currentBeverage.includes("Matcha") ? "🍵" : "☕",
        task: `Mindful Focus Sprint #${timerIntervalCount + 1}`,
        status: "Completed ✨",
        appId: selectedAppId,
      },
      ...prev,
    ]);

    setTimerIntervalCount((prev) => prev + 1);
    setTimeLeft(pomodoroDuration);
  }, [currentBeverage, pomodoroDuration, selectedAppId, timerIntervalCount]);

  // Pomodoro Interval Timer
  useEffect(() => {
    let interval = null;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isTimerRunning && timeLeft === 0) {
      setIsTimerRunning(false);
      handlePomodoroComplete();
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft, handlePomodoroComplete]);

  // Task Mutations
  const addTask = (newTask) => {
    const task = {
      id: `task-${Date.now()}`,
      ticketNumber: `#SP-${Math.floor(Math.random() * 80 + 20)}`,
      status: "sprouting",
      createdDaysAgo: 0,
      updatedAt: new Date().toISOString(),
      teacups: 1,
      priority: "normal",
      type: "sprint",
      typeLabel: "SPRINT",
      ...newTask,
    };
    setTasks((prev) => [task, ...prev]);
    if (sounds) sounds.playClick();
  };

  const updateTask = (taskId, updates) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const updated = {
            ...t,
            ...updates,
            updatedAt: new Date().toISOString(),
          };
          if (updates.type && !updates.typeLabel) {
            updated.typeLabel = updates.type.toUpperCase();
          }
          if (updates.status === "harvested" && t.status !== "harvested") {
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
      })
    );
    if (sounds) sounds.playPop();
  };

  const updateTaskStatus = (taskId, newStatus) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          if (newStatus === "harvested" && t.status !== "harvested") {
            if (sounds) sounds.playPop();
            confetti({
              particleCount: 35,
              spread: 45,
              origin: { y: 0.7 },
              colors: ["#6b8e23", "#f9d976", "#e07a5f"],
            });
          }
          return { ...t, status: newStatus, updatedAt: new Date().toISOString() };
        }
        return t;
      })
    );
  };

  const deleteTask = (taskId) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    if (sounds) sounds.playClick();
  };

  const toggleTaskDone = (taskId) => {
    const target = tasks.find((t) => t.id === taskId);
    if (!target) return;
    const nextStatus = target.status === "harvested" ? "sprouting" : "harvested";
    updateTaskStatus(taskId, nextStatus);
  };

  // Add new App
  const addApp = (newApp) => {
    const app = {
      id: `app-${Date.now()}`,
      color: "#6b8e23",
      icon: "🌱",
      dailyTarget: 2,
      ...newApp,
    };
    setApps((prev) => [...prev, app]);
    if (sounds) sounds.playClick();
  };

  const updateApp = (appId, updates) => {
    setApps((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, ...updates } : a))
    );
    if (sounds) sounds.playPop();
  };

  const deleteApp = (appId) => {
    if (apps.length <= 1) return;
    setApps((prev) => prev.filter((a) => a.id !== appId));
    setTasks((prev) => prev.filter((t) => t.appId !== appId));
    if (selectedAppId === appId) setSelectedAppId("all");
    if (sounds) sounds.playClick();
  };

  // Profile Mutations
  const updateUserProfile = (updates) => {
    setUserProfile((prev) => ({ ...prev, ...updates }));
    if (sounds) sounds.playPop();
  };

  // Shelves Mutations
  const updateShelves = (newShelves) => {
    setShelves(newShelves);
    if (sounds) sounds.playPop();
  };

  const addShelf = (newShelf) => {
    const shelf = {
      id: `shelf-${Date.now()}`,
      icon: "🔖",
      isExternal: true,
      ...newShelf,
    };
    setShelves((prev) => [...prev, shelf]);
    if (sounds) sounds.playClick();
  };

  const deleteShelf = (id) => {
    setShelves((prev) => prev.filter((s) => s.id !== id));
    if (sounds) sounds.playClick();
  };

  // Task Category / Filter Management
  const addCategory = (newCat) => {
    const id = newCat.id || `cat-${Date.now()}`;
    const category = {
      id,
      label: newCat.label || "New Tag",
      emoji: newCat.emoji || "🏷️",
      color: newCat.color || "#657d4f",
    };
    setTaskCategories((prev) => [...prev, category]);
    if (sounds) sounds.playPop();
  };

  const deleteCategory = (catId) => {
    if (taskCategories.length <= 1) return;
    setTaskCategories((prev) => prev.filter((c) => c.id !== catId));
    if (sounds) sounds.playClick();
  };

  const updateCategory = (catId, updates) => {
    setTaskCategories((prev) =>
      prev.map((c) => (c.id === catId ? { ...c, ...updates } : c))
    );
    if (sounds) sounds.playPop();
  };

  // Select App with optional theme switching
  const selectAppWithTheme = (appId) => {
    setSelectedAppId(appId);
    if (appId !== "all") {
      const app = apps.find((a) => a.id === appId);
      if (app && app.theme) {
        updateTheme(app.theme);
      }
    }
  };

  // Theme & Audio Controls
  const updateTheme = (newTheme) => {
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    if (sounds) sounds.playClick();
  };

  const toggleAudio = (enabled) => {
    setAudioEnabled(enabled);
    if (sounds) sounds.setMuted(!enabled);
  };

  const updateMaxWater = (cups) => {
    setMaxWaterCups(Number(cups));
    if (sounds) sounds.playPop();
  };

  const updatePomodoroDuration = (secs) => {
    const duration = Number(secs);
    setPomodoroDuration(duration);
    if (!isTimerRunning) setTimeLeft(duration);
    if (sounds) sounds.playClick();
  };

  // Data Actions
  const clearHarvestedTasks = () => {
    setTasks((prev) => prev.filter((t) => t.status !== "harvested"));
    if (sounds) sounds.playPop();
  };

  const resetDailyStats = () => {
    setWaterCups(0);
    setCafeStamps(INITIAL_CAFE_STAMPS);
    setTimerIntervalCount(0);
    if (sounds) sounds.playBellChime();
  };

  const exportWorkspaceData = () => {
    const data = {
      version: "devsprout_v3_custom",
      exportDate: new Date().toISOString(),
      userProfile,
      shelves,
      theme,
      audioEnabled,
      apps,
      tasks,
      waterCups,
      maxWaterCups,
      learnings,
      scratchpadCode,
      sessionLogs,
      cafeStamps,
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
  };

  const importWorkspaceData = (jsonStr) => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.userProfile) setUserProfile(data.userProfile);
      if (data.shelves) setShelves(data.shelves);
      if (data.theme) {
        setTheme(data.theme);
        document.documentElement.setAttribute("data-theme", data.theme);
      }
      if (typeof data.audioEnabled === "boolean") {
        setAudioEnabled(data.audioEnabled);
        if (sounds) sounds.setMuted(!data.audioEnabled);
      }
      if (data.apps) setApps(data.apps);
      if (data.tasks) setTasks(data.tasks);
      if (typeof data.waterCups === "number") setWaterCups(data.waterCups);
      if (typeof data.maxWaterCups === "number") setMaxWaterCups(data.maxWaterCups);
      if (data.learnings) setLearnings(data.learnings);
      if (data.scratchpadCode) setScratchpadCode(data.scratchpadCode);
      if (data.sessionLogs) setSessionLogs(data.sessionLogs);
      if (data.cafeStamps) setCafeStamps(data.cafeStamps);
      if (sounds) sounds.playBellChime();
      return true;
    } catch {
      return false;
    }
  };

  // Desk Menu Modal Controls
  const openDeskMenu = (tab = "profile") => {
    setDeskMenuTab(tab);
    setIsDeskMenuOpen(true);
    if (sounds) sounds.playClick();
  };

  const closeDeskMenu = () => {
    setIsDeskMenuOpen(false);
  };

  // Drink Water
  const sipWater = () => {
    if (sounds) sounds.playWaterDrop();
    setWaterCups((prev) => (prev >= maxWaterCups ? 1 : prev + 1));
  };

  // Stamp Reaction Clicker
  const addStamp = (type) => {
    if (sounds) sounds.playPop();
    setStamps((prev) => ({ ...prev, [type]: (prev[type] || 0) + 1 }));
  };

  // Stale Task Analyzer
  // Flags tasks that have been created > 2 days ago or urgent tasks pending
  const staleTasks = tasks.filter((t) => {
    if (t.status === "harvested") return false;
    return t.createdDaysAgo >= 2 || (t.priority === "urgent" && t.status === "sprouting");
  });

  // Daily App Balance Engine
  // Analyzes today's harvested tasks across apps
  const appBalanceData = apps.map((app) => {
    const appTasks = tasks.filter((t) => t.appId === app.id);
    const completed = appTasks.filter((t) => t.status === "harvested").length;
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

  // Balance alert if user has done 3+ tasks on one app but 0 on another app that has pending work
  const imbalancedApp = appBalanceData.find(
    (a) => a.completed >= 3 && appBalanceData.some((other) => other.id !== a.id && other.completed === 0 && other.active > 0)
  );

  return (
    <TaskContext.Provider
      value={{
        activeTab,
        setActiveTab,
        selectedAppId,
        setSelectedAppId,
        // Desk Menu
        isDeskMenuOpen,
        deskMenuTab,
        setDeskMenuTab,
        openDeskMenu,
        closeDeskMenu,
        // Profile & Shelves
        userProfile,
        updateUserProfile,
        shelves,
        updateShelves,
        addShelf,
        deleteShelf,
        // Themes & Ambience
        theme,
        updateTheme,
        audioEnabled,
        toggleAudio,
        updateMaxWater,
        updatePomodoroDuration,
        // Categories & Custom Filters
        taskCategories,
        addCategory,
        updateCategory,
        deleteCategory,
        // Apps & Tasks
        apps,
        addApp,
        updateApp,
        deleteApp,
        selectAppWithTheme,
        tasks,
        addTask,
        updateTask,
        updateTaskStatus,
        deleteTask,
        toggleTaskDone,
        staleTasks,
        appBalanceData,
        imbalancedApp,
        clearHarvestedTasks,
        resetDailyStats,
        exportWorkspaceData,
        importWorkspaceData,
        // Trackers
        waterCups,
        maxWaterCups,
        sipWater,
        scratchpadCode,
        setScratchpadCode,
        learnings,
        setLearnings,
        stamps,
        addStamp,
        // Cafe Pomodoro
        timeLeft,
        setTimeLeft,
        isTimerRunning,
        setIsTimerRunning,
        pomodoroDuration,
        setPomodoroDuration,
        currentBeverage,
        setCurrentBeverage,
        timerIntervalCount,
        cafeStamps,
        sessionLogs,
        // Mascot
        mascotMood,
        setMascotMood,
        mascotQuote,
        setMascotQuote,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTaskManager() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error("useTaskManager must be used within a TaskProvider");
  }
  return context;
}
