"use client";

import React, { useState } from "react";
import styles from "./AuthModal.module.css";
import { useAuthStore } from "@/store/useAuthStore";
import { isSupabaseConfigured } from "@/lib/supabaseClient";
import { sounds } from "@/utils/audio";
import {
  X,
  Mail,
  Lock,
  LogIn,
  UserPlus,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Cloud,
  FileCode2,
} from "lucide-react";
import confetti from "canvas-confetti";

export default function AuthModal() {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalTab,
    setAuthModalTab,
    signInWithPassword,
    signUpWithPassword,
    signInWithOtp,
    user,
  } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  if (!isAuthModalOpen) return null;

  const handleTabClick = (tab) => {
    if (sounds) sounds.playClick();
    setErrorMsg("");
    setSuccessMsg("");
    setAuthModalTab(tab);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    const res = await signInWithPassword(email.trim(), password);
    setLoading(false);

    if (res.success) {
      if (sounds) sounds.playBellChime();
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
      closeAuthModal();
    } else {
      if (sounds) sounds.playPop();
      setErrorMsg(res.error);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    const res = await signUpWithPassword(email.trim(), password);
    setLoading(false);

    if (res.success) {
      if (sounds) sounds.playBellChime();
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
      if (res.requiresEmailConfirmation) {
        setSuccessMsg(
          "Account created! Please check your email inbox to verify your account."
        );
      } else {
        closeAuthModal();
      }
    } else {
      if (sounds) sounds.playPop();
      setErrorMsg(res.error);
    }
  };

  const handleMagicLink = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    const res = await signInWithOtp(email.trim());
    setLoading(false);

    if (res.success) {
      if (sounds) sounds.playBellChime();
      setSuccessMsg("Magic link sent! Check your email to sign in directly.");
    } else {
      if (sounds) sounds.playPop();
      setErrorMsg(res.error);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={closeAuthModal}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerTitle}>
            <span className={styles.headerEmoji}>☁️</span>
            <div>
              <div className={styles.headerText}>
                {user ? "Cloud Account Active" : "DevSprout Cloud Sign-In"}
              </div>
              <div className={styles.headerSub}>
                {user
                  ? `Signed in as ${user.email}`
                  : "Sync your quests, notes & progress across any device"}
              </div>
            </div>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={() => {
              if (sounds) sounds.playClick();
              closeAuthModal();
            }}
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* If Supabase is not configured in .env.local */}
        {!isSupabaseConfigured && (
          <div style={{ padding: "14px 20px 0" }}>
            <div className={`${styles.alertBox} ${styles.alertNotice}`}>
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <strong>Supabase Setup Needed</strong>
                <p style={{ margin: "4px 0 0", fontSize: "0.76rem" }}>
                  Add your Supabase credentials to <code>.env.local</code> to enable online
                  authorization and sync:
                </p>
                <div className={styles.helperBox} style={{ marginTop: 8 }}>
                  <span>1. Copy <code>.env.local.example</code> to <code>.env.local</code></span>
                  <span>2. Run <code>supabase/schema.sql</code> in your Supabase SQL Editor</span>
                  <span>3. Restart your dev server</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs for unauthenticated users */}
        {!user && (
          <div className={styles.tabsRow}>
            <button
              type="button"
              className={`${styles.tabBtn} ${authModalTab === "login" ? styles.tabBtnActive : ""}`}
              onClick={() => handleTabClick("login")}
            >
              <LogIn size={13} /> Log In
            </button>
            <button
              type="button"
              className={`${styles.tabBtn} ${authModalTab === "signup" ? styles.tabBtnActive : ""}`}
              onClick={() => handleTabClick("signup")}
            >
              <UserPlus size={13} /> Sign Up
            </button>
            <button
              type="button"
              className={`${styles.tabBtn} ${authModalTab === "magic" ? styles.tabBtnActive : ""}`}
              onClick={() => handleTabClick("magic")}
            >
              <Sparkles size={13} /> Magic Link
            </button>
          </div>
        )}

        {/* Form Body */}
        <div className={styles.body}>
          {errorMsg && (
            <div className={`${styles.alertBox} ${styles.alertError}`}>
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className={`${styles.alertBox} ${styles.alertSuccess}`}>
              <CheckCircle2 size={16} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: LOG IN */}
          {!user && authModalTab === "login" && (
            <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Email Address</label>
                <input
                  type="email"
                  className={styles.input}
                  placeholder="sprout@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Password</label>
                <input
                  type="password"
                  className={styles.input}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className={styles.submitBtn}
                disabled={loading || !isSupabaseConfigured}
              >
                <LogIn size={15} />
                <span>{loading ? "Signing in..." : "Log In to Cloud"}</span>
              </button>
            </form>
          )}

          {/* TAB 2: SIGN UP */}
          {!user && authModalTab === "signup" && (
            <form onSubmit={handleSignUp} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Email Address</label>
                <input
                  type="email"
                  className={styles.input}
                  placeholder="sprout@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Password (min. 6 characters)</label>
                <input
                  type="password"
                  className={styles.input}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Confirm Password</label>
                <input
                  type="password"
                  className={styles.input}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className={styles.submitBtn}
                disabled={loading || !isSupabaseConfigured}
              >
                <UserPlus size={15} />
                <span>{loading ? "Creating account..." : "Create Cloud Account"}</span>
              </button>
            </form>
          )}

          {/* TAB 3: MAGIC LINK */}
          {!user && authModalTab === "magic" && (
            <form onSubmit={handleMagicLink} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Email Address</label>
                <input
                  type="email"
                  className={styles.input}
                  placeholder="sprout@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className={styles.helperBox}>
                <span>✨ We will send you a one-click login link directly to your inbox. No password needed!</span>
              </div>

              <button
                type="submit"
                className={styles.submitBtn}
                disabled={loading || !isSupabaseConfigured}
              >
                <Sparkles size={15} />
                <span>{loading ? "Sending link..." : "Send Magic Sign-In Link"}</span>
              </button>
            </form>
          )}

          {/* ALREADY LOGGED IN VIEW */}
          {user && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div className={styles.helperBox}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Cloud size={16} color="var(--cozy-border-dark, #50683a)" />
                  <strong>Signed in as {user.email}</strong>
                </div>
                <span>Your workspace is connected to Supabase and syncs across devices automatically.</span>
              </div>

              <button
                type="button"
                className={styles.secondaryBtn}
                onClick={() => {
                  closeAuthModal();
                  const openDeskMenu = useTaskStore.getState().openDeskMenu;
                  if (openDeskMenu) openDeskMenu("cloud");
                }}
              >
                Open Cloud & Account Settings
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <span>🍵 DevSprout Cloud Sync</span>
          <span>Guest mode remains saved locally</span>
        </div>
      </div>
    </div>
  );
}

