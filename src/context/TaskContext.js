"use client";

import React, { useEffect } from "react";
import { useTaskStore, useTaskManager } from "@/store/useTaskStore";

// Export useTaskManager for backward compatibility with existing components
export { useTaskManager, useTaskStore };

export function TaskProvider({ children }) {
  const hydrateFromStorage = useTaskStore((s) => s.hydrateFromStorage);
  const isTimerRunning = useTaskStore((s) => s.isTimerRunning);
  const timeLeft = useTaskStore((s) => s.timeLeft);
  const setTimeLeft = useTaskStore((s) => s.setTimeLeft);
  const setIsTimerRunning = useTaskStore((s) => s.setIsTimerRunning);
  const handlePomodoroComplete = useTaskStore((s) => s.handlePomodoroComplete);
  const setTodayKey = useTaskStore((s) => s.setTodayKey);

  // Hydrate once on client mount
  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  // Midnight reset tracker for Daily Task Goals
  useEffect(() => {
    setTodayKey(new Date().toDateString());

    let timeoutId = null;
    const scheduleMidnightReset = () => {
      const now = new Date();
      const nextMidnight = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
        0,
        0,
        0,
        100
      );
      const msUntilMidnight = Math.max(1000, nextMidnight.getTime() - now.getTime());
      timeoutId = setTimeout(() => {
        setTodayKey(new Date().toDateString());
        scheduleMidnightReset();
      }, msUntilMidnight);
    };

    scheduleMidnightReset();
    return () => clearTimeout(timeoutId);
  }, [setTodayKey]);

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
  }, [isTimerRunning, timeLeft, setTimeLeft, setIsTimerRunning, handlePomodoroComplete]);

  return <>{children}</>;
}
