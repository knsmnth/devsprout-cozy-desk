"use client";

import React, { useState, useEffect } from "react";
import styles from "./LogoutModal.module.css";
import { useAuthStore } from "@/store/useAuthStore";
import { useTaskStore } from "@/store/useTaskStore";
import { sounds } from "@/utils/audio";
import {
  X,
  LogOut,
  Cloud,
  ShieldCheck,
  RefreshCw,
  HeartHandshake,
} from "lucide-react";

export default function LogoutModal() {
  const isLogoutModalOpen = useAuthStore((state) => state.isLogoutModalOpen);
  const closeLogoutModal = useAuthStore((state) => state.closeLogoutModal);
  const user = useAuthStore((state) => state.user);
  const syncStatus = useAuthStore((state) => state.syncStatus);
  const saveCloudWorkspace = useAuthStore((state) => state.saveCloudWorkspace);
  const signOut = useAuthStore((state) => state.signOut);
  const showAuthToast = useAuthStore((state) => state.showAuthToast);

  const [isSigningOut, setIsSigningOut] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isLogoutModalOpen && !isSigningOut) {
        if (sounds) sounds.playPop();
        closeLogoutModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLogoutModalOpen, isSigningOut, closeLogoutModal]);

  if (!isLogoutModalOpen || !user) return null;

  const handleCancel = () => {
    if (isSigningOut) return;
    if (sounds) sounds.playPop();
    closeLogoutModal();
  };

  const handleConfirmSignOut = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);

    try {
      // 1. Ensure latest workspace data is backed up before disconnecting
      const payload = useTaskStore.getState().getExportPayload();
      await saveCloudWorkspace(payload);

      // 2. Perform Supabase Sign Out
      await signOut();

      // 3. Play cozy sound & show feedback toast
      if (sounds) sounds.playPop();
      showAuthToast("Signed out safely. Returned to your local guest desk.", "👋");

      // 4. Close modal
      closeLogoutModal();
    } catch (err) {
      console.warn("Logout error:", err);
      // Still close and switch to guest even on network error
      await signOut();
      closeLogoutModal();
      showAuthToast("Signed out. Switched to offline guest desk.", "👋");
    } finally {
      setIsSigningOut(false);
    }
  };

  const username = user.email ? user.email.split("@")[0] : "Sprout Dev";

  return (
    <div
      className={styles.backdrop}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSigningOut) {
          handleCancel();
        }
      }}
    >
      <div className={styles.modalCard} role="dialog" aria-modal="true">
        {/* Close Button */}
        <button
          type="button"
          className={styles.closeBtn}
          onClick={handleCancel}
          disabled={isSigningOut}
          aria-label="Close dialog"
        >
          <X size={18} />
        </button>

        {/* Cozy Header Mascot & Badge */}
        <div className={styles.headerArea}>
          <div className={styles.avatarBadge}>
            <span className={styles.badgeEmoji}>🌱</span>
            <span className={styles.badgeWave}>👋</span>
          </div>
          <h2 className={styles.title}>Sign Out of Cloud Account?</h2>
          <p className={styles.subtitle}>
            Signed in as <strong className={styles.userEmail}>{user.email}</strong>
          </p>
        </div>

        {/* Content Reassurance Box */}
        <div className={styles.reassuranceCard}>
          <div className={styles.reassuranceItem}>
            <ShieldCheck size={18} className={styles.safeIcon} />
            <div className={styles.reassuranceText}>
              <strong>Cloud Workspace Safe & Backed Up</strong>
              <p>
                All your quests, sprint goals, snug notes, and custom shelves are securely saved to your Supabase account.
              </p>
            </div>
          </div>

          <div className={styles.reassuranceItem}>
            <HeartHandshake size={18} className={styles.guestIcon} />
            <div className={styles.reassuranceText}>
              <strong>Returning to Guest Desk</strong>
              <p>
                Signing out safely switches you back to your separate, offline guest workspace. You can sign back in anytime.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={styles.actionButtons}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={handleCancel}
            disabled={isSigningOut}
          >
            Keep Working
          </button>

          <button
            type="button"
            className={styles.signOutBtn}
            onClick={handleConfirmSignOut}
            disabled={isSigningOut}
          >
            {isSigningOut ? (
              <>
                <RefreshCw size={15} className={styles.syncSpin} />
                <span>Signing out...</span>
              </>
            ) : (
              <>
                <LogOut size={15} />
                <span>Sign Out</span>
              </>
            )}
          </button>
        </div>

        {/* Footer Note */}
        <div className={styles.cardFooter}>
          <Cloud size={13} />
          <span>DevSprout Cloud Sync • Safe Profile Isolation</span>
        </div>
      </div>
    </div>
  );
}

