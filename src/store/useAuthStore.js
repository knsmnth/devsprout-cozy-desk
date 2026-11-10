"use client";

import { create } from "zustand";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";

export const useAuthStore = create((set, get) => ({
  user: null,
  session: null,
  isInitialized: false,
  isAuthModalOpen: false,
  authModalTab: "login", // 'login' | 'signup' | 'magic'
  isLogoutModalOpen: false,
  authToast: null,
  _authToastTimeout: null,
  syncStatus: isSupabaseConfigured ? "idle" : "offline", // 'idle' | 'syncing' | 'synced' | 'error' | 'offline'
  lastSyncedAt: null,
  syncError: null,

  // Modal controls
  openAuthModal: (tab = "login") => set({ isAuthModalOpen: true, authModalTab: tab }),
  closeAuthModal: () => set({ isAuthModalOpen: false }),
  setAuthModalTab: (tab) => set({ authModalTab: tab }),
  openLogoutModal: () => set({ isLogoutModalOpen: true }),
  closeLogoutModal: () => set({ isLogoutModalOpen: false }),

  // Cozy Auth Toast Notifications
  showAuthToast: (message, icon = "👋") => {
    const existing = get()._authToastTimeout;
    if (existing) clearTimeout(existing);

    const timeout = setTimeout(() => {
      set({ authToast: null, _authToastTimeout: null });
    }, 4500);

    set({ authToast: { message, icon }, _authToastTimeout: timeout });
  },
  dismissAuthToast: () => {
    const existing = get()._authToastTimeout;
    if (existing) clearTimeout(existing);
    set({ authToast: null, _authToastTimeout: null });
  },

  // Initialize auth state listener
  initAuth: async () => {
    if (!isSupabaseConfigured || !supabase) {
      set({ isInitialized: true, syncStatus: "offline" });
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user || null;
      set({
        session,
        user,
        isInitialized: true,
        syncStatus: user ? "idle" : "offline",
      });

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (_event, newSession) => {
        const newUser = newSession?.user || null;
        set({
          session: newSession,
          user: newUser,
          syncStatus: newUser ? "idle" : "offline",
        });
      });
    } catch (err) {
      console.warn("Supabase auth init error:", err);
      set({ isInitialized: true, syncStatus: "offline" });
    }
  },

  // Authentication actions
  signInWithPassword: async (email, password) => {
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, error: "Supabase credentials are not configured yet." };
    }
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      set({ user: data.user, session: data.session, syncStatus: "idle" });
      return { success: true, user: data.user };
    } catch (err) {
      return { success: false, error: err.message || "Failed to sign in." };
    }
  },

  signUpWithPassword: async (email, password) => {
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, error: "Supabase credentials are not configured yet." };
    }
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      if (data.session) {
        set({ user: data.user, session: data.session, syncStatus: "idle" });
      }
      return {
        success: true,
        user: data.user,
        requiresEmailConfirmation: !data.session,
      };
    } catch (err) {
      return { success: false, error: err.message || "Failed to create account." };
    }
  },

  signInWithOtp: async (email) => {
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, error: "Supabase credentials are not configured yet." };
    }
    try {
      const redirectTo = typeof window !== "undefined" ? window.location.origin : undefined;
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirectTo },
      });
      if (error) throw error;
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message || "Failed to send magic link." };
    }
  },

  signOut: async () => {
    if (!isSupabaseConfigured || !supabase) {
      set({ user: null, session: null, syncStatus: "offline" });
      return { success: true };
    }
    try {
      await supabase.auth.signOut();
      set({
        user: null,
        session: null,
        syncStatus: "offline",
        lastSyncedAt: null,
        syncError: null,
      });
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message || "Failed to sign out." };
    }
  },

  // Cloud Workspace Syncing
  fetchCloudWorkspace: async () => {
    const { user } = get();
    if (!isSupabaseConfigured || !supabase || !user) {
      return { success: false, error: "Not authenticated" };
    }

    try {
      set({ syncStatus: "syncing", syncError: null });
      const { data, error } = await supabase
        .from("user_workspaces")
        .select("workspace_data, updated_at")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        // No remote workspace yet
        set({ syncStatus: "synced", lastSyncedAt: new Date().toLocaleTimeString() });
        return { success: true, data: null };
      }

      set({
        syncStatus: "synced",
        lastSyncedAt: new Date(data.updated_at || Date.now()).toLocaleTimeString(),
      });
      return { success: true, data: data.workspace_data, updatedAt: data.updated_at };
    } catch (err) {
      console.warn("fetchCloudWorkspace error:", err);
      set({ syncStatus: "error", syncError: err.message });
      return { success: false, error: err.message };
    }
  },

  saveCloudWorkspace: async (workspaceData) => {
    const { user } = get();
    if (!isSupabaseConfigured || !supabase || !user) {
      return { success: false, error: "Not authenticated" };
    }

    try {
      set({ syncStatus: "syncing", syncError: null });
      const payload = {
        user_id: user.id,
        workspace_data: workspaceData,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("user_workspaces")
        .upsert(payload, { onConflict: "user_id" });

      if (error) throw error;

      const nowStr = new Date().toLocaleTimeString();
      set({ syncStatus: "synced", lastSyncedAt: nowStr });
      return { success: true, syncedAt: nowStr };
    } catch (err) {
      console.warn("saveCloudWorkspace error:", err);
      set({ syncStatus: "error", syncError: err.message });
      return { success: false, error: err.message };
    }
  },
}));

