"use client";

import React, { useEffect, useRef } from "react";
import { useTaskStore, useTaskManager } from "@/store/useTaskStore";
import { useAuthStore } from "@/store/useAuthStore";
import AuthModal from "@/components/AuthModal";

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

  const initAuth = useAuthStore((s) => s.initAuth);
  const user = useAuthStore((s) => s.user);
  const isInitialized = useAuthStore((s) => s.isInitialized);

  const isRemoteLoadingRef = useRef(false);
  const syncTimeoutRef = useRef(null);
  const prevUserIdRef = useRef(undefined);

  // Hydrate guest storage once on client mount and init auth
  useEffect(() => {
    hydrateFromStorage("guest");
    initAuth();
  }, [hydrateFromStorage, initAuth]);

  // Synchronize workspace when auth state changes (Guest <-> Logged-In User)
  useEffect(() => {
    if (!isInitialized) return;

    const currentUserId = user ? user.id : null;
    if (currentUserId === prevUserIdRef.current) return;

    prevUserIdRef.current = currentUserId;

    // Clear any pending debounced save
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
      syncTimeoutRef.current = null;
    }

    if (!user) {
      // Switched to Guest: hydrate guest data, clearing any user workspace from memory
      isRemoteLoadingRef.current = true;
      hydrateFromStorage("guest");
      isRemoteLoadingRef.current = false;
      return;
    }

    // Switched to Logged-in User: switch scope and load user workspace
    let isMounted = true;
    const loadUserWorkspace = async () => {
      isRemoteLoadingRef.current = true;
      // Hydrate local cache for this specific user
      hydrateFromStorage(user.id);

      const res = await useAuthStore.getState().fetchCloudWorkspace();
      if (!isMounted) return;

      if (res.success && res.data) {
        // Cloud has existing data -> cloud is source of truth
        useTaskStore.getState().importWorkspaceData(res.data, true);
      } else if (res.success && res.data === null) {
        // Brand new account: seed cloud with clean user workspace
        await useAuthStore
          .getState()
          .saveCloudWorkspace(useTaskStore.getState().getExportPayload());
      }
      isRemoteLoadingRef.current = false;
    };

    loadUserWorkspace();

    return () => {
      isMounted = false;
    };
  }, [user, isInitialized, hydrateFromStorage]);

  // Debounced auto-sync to cloud on task store changes
  useEffect(() => {
    if (!user) return;

    const unsubscribe = useTaskStore.subscribe(() => {
      if (isRemoteLoadingRef.current) return;
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }

      syncTimeoutRef.current = setTimeout(() => {
        const payload = useTaskStore.getState().getExportPayload();
        useAuthStore.getState().saveCloudWorkspace(payload);
      }, 2000);
    });

    return () => {
      unsubscribe();
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
        syncTimeoutRef.current = null;
      }
    };
  }, [user]);

  // Midnight reset tracker for Daily Task Goals & Automated Daily Quote
  useEffect(() => {
    setTodayKey(new Date().toDateString());
    useTaskStore.getState().checkDailyQuoteRotation();

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
        useTaskStore.getState().checkDailyQuoteRotation();
        scheduleMidnightReset();
      }, msUntilMidnight);
    };

    scheduleMidnightReset();
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
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
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timeLeft, setTimeLeft, setIsTimerRunning, handlePomodoroComplete]);

  return (
    <>
      {children}
      <AuthModal />
    </>
  );
}
