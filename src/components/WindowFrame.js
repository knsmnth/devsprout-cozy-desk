"use client";

import React, { useState, useEffect, useRef } from "react";
import styles from "./WindowFrame.module.css";
import { useTaskManager } from "@/context/TaskContext";
import { sounds } from "@/utils/audio";
import DeskMenuModal from "@/components/DeskMenuModal";
import AudioStreamController from "@/components/AudioStreamController";
import MusicHubModal from "@/components/MusicHubModal";
import LogoutModal from "@/components/LogoutModal";
import { useMusicStore } from "@/store/useMusicStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useTaskStore } from "@/store/useTaskStore";
import { formatAudioTime } from "@/utils/musicCatalog";
import {
  Play,
  Pause,
  Bell,
  Droplets,
  Moon,
  Sun,
  Tv,
  X,
  SkipForward,
  SkipBack,
  Music,
  Cloud,
  ChevronDown,
  RefreshCw,
  Settings,
  LogOut,
} from "lucide-react";

export default function WindowFrame({ children }) {
  const {
    activeTab,
    setActiveTab,
    staleTasks,
    waterCups,
    maxWaterCups,
    sipWater,
    isDeskMenuOpen,
    openDeskMenu,
    closeDeskMenu,
    theme,
    levelUpToast,
    dismissLevelUpToast,
  } = useTaskManager();

  // Music Streaming Store
  const currentTrack = useMusicStore((state) => state.currentTrack);
  const isPlayingMusic = useMusicStore((state) => state.isPlaying);
  const musicCurrentTime = useMusicStore((state) => state.currentTime);
  const musicDuration = useMusicStore((state) => state.duration);
  const togglePlayMusic = useMusicStore((state) => state.togglePlay);
  const nextMusicTrack = useMusicStore((state) => state.nextTrack);
  const prevMusicTrack = useMusicStore((state) => state.prevTrack);
  const seekMusic = useMusicStore((state) => state.seek);
  const openMusicHub = useMusicStore((state) => state.openMusicHub);

  // Cloud & Online Authorization
  const authUser = useAuthStore((state) => state.user);
  const syncStatus = useAuthStore((state) => state.syncStatus);
  const openAuthModal = useAuthStore((state) => state.openAuthModal);
  const openLogoutModal = useAuthStore((state) => state.openLogoutModal);
  const saveCloudWorkspace = useAuthStore((state) => state.saveCloudWorkspace);
  const authToast = useAuthStore((state) => state.authToast);
  const dismissAuthToast = useAuthStore((state) => state.dismissAuthToast);

  const [showYoutube, setShowYoutube] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  // Close account menu on outside click
  useEffect(() => {
    if (!isUserMenuOpen) return;
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isUserMenuOpen]);

  // Switch tabs
  const handleTabClick = (tabId) => {
    if (sounds) sounds.playClick();
    setActiveTab(tabId);
  };

  return (
    <div className={styles.windowWrapper} data-theme={theme || "matcha"}>
      <div className={styles.windowChassis} data-theme={theme || "matcha"}>
        {/* Modern Cozy Top App Navigation Bar */}
        <header className={styles.tabsBar}>
          <div className={styles.navBrand}>
            <span className={styles.brandEmoji}>🌱</span>
            <div className={styles.brandTitleBox}>
              <span className={styles.brandTitle}>DevSprout</span>
              <span className={styles.brandTag}>cozy workspace</span>
            </div>
          </div>

          <nav className={styles.navTabs}>
            <button
              className={`${styles.tab} ${activeTab === "desk" ? styles.tabActive : ""}`}
              onClick={() => handleTabClick("desk")}
            >
              <span>🌱</span> today&apos;s desk
            </button>
            <button
              className={`${styles.tab} ${activeTab === "sprint" ? styles.tabActive : ""}`}
              onClick={() => handleTabClick("sprint")}
            >
              <span>✨</span> sprint harvest
            </button>
            <button
              className={`${styles.tab} ${activeTab === "notes" ? styles.tabActive : ""}`}
              onClick={() => handleTabClick("notes")}
            >
              <span>🍯</span> snug notes
            </button>
            <button
              className={`${styles.tab} ${activeTab === "cafe" ? styles.tabActive : ""}`}
              onClick={() => handleTabClick("cafe")}
            >
              <span>☕</span> cafe log
            </button>
          </nav>

          <div className={styles.navRight} ref={userMenuRef}>
            {authUser ? (
              <div className={styles.userMenuWrapper}>
                <button
                  type="button"
                  className={`${styles.cloudAuthBtn} ${styles.cloudAuthBtnActive}`}
                  onClick={() => {
                    if (sounds) sounds.playClick();
                    setIsUserMenuOpen((prev) => !prev);
                  }}
                  title={`Signed in as ${authUser.email} • Click for account actions`}
                  aria-haspopup="true"
                  aria-expanded={isUserMenuOpen}
                >
                  <Cloud size={14} className={syncStatus === "syncing" ? styles.syncSpin : ""} />
                  <span>
                    {syncStatus === "syncing"
                      ? "Syncing..."
                      : syncStatus === "error"
                      ? "Sync Alert"
                      : authUser.email?.split("@")[0] || "Synced"}
                  </span>
                  <span className={styles.cloudDotOnline} />
                  <ChevronDown
                    size={12}
                    className={`${styles.menuChevron} ${isUserMenuOpen ? styles.menuChevronOpen : ""}`}
                  />
                </button>

                {isUserMenuOpen && (
                  <div className={styles.accountPopover} role="menu">
                    <div className={styles.popoverHeader}>
                      <div className={styles.popoverEmail}>{authUser.email}</div>
                      <div className={styles.popoverStatus}>
                        <span className={styles.cloudDotOnline} />
                        <span>
                          {syncStatus === "syncing"
                            ? "Syncing changes..."
                            : syncStatus === "error"
                            ? "Sync issue detected"
                            : "Online & Synced"}
                        </span>
                      </div>
                    </div>

                    <div className={styles.popoverDivider} />

                    <button
                      type="button"
                      className={styles.popoverItem}
                      onClick={async () => {
                        if (sounds) sounds.playClick();
                        const payload = useTaskStore.getState().getExportPayload();
                        const res = await saveCloudWorkspace(payload);
                        if (res.success && sounds) sounds.playBellChime();
                      }}
                      disabled={syncStatus === "syncing"}
                      role="menuitem"
                    >
                      <RefreshCw size={14} className={syncStatus === "syncing" ? styles.syncSpin : ""} />
                      <span>{syncStatus === "syncing" ? "Syncing..." : "Sync Workspace Now"}</span>
                    </button>

                    <button
                      type="button"
                      className={styles.popoverItem}
                      onClick={() => {
                        if (sounds) sounds.playClick();
                        setIsUserMenuOpen(false);
                        openDeskMenu("cloud");
                      }}
                      role="menuitem"
                    >
                      <Settings size={14} />
                      <span>Cloud & Desk Settings</span>
                    </button>

                    <div className={styles.popoverDivider} />

                    <button
                      type="button"
                      className={`${styles.popoverItem} ${styles.popoverItemDanger}`}
                      onClick={() => {
                        if (sounds) sounds.playPop();
                        setIsUserMenuOpen(false);
                        openLogoutModal();
                      }}
                      role="menuitem"
                    >
                      <LogOut size={14} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                className={styles.cloudAuthBtn}
                onClick={() => {
                  if (sounds) sounds.playClick();
                  openAuthModal("login");
                }}
                title="Sign in with Supabase to sync your workspace across devices"
              >
                <Cloud size={14} />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </header>

        {/* Persistent Audio & Lo-Fi Media Bar with Real Streaming & Music Hub Access */}
        <div className={styles.mediaBar}>
          <div
            className={styles.mediaTitle}
            onClick={() => {
              if (sounds) sounds.playClick();
              openMusicHub("player");
            }}
            title="Click to open Cozy Music Hub & Player"
            style={{ cursor: "pointer" }}
          >
            <span className={`${styles.musicNote} ${isPlayingMusic ? styles.musicNotePlaying : ""}`}>♫</span>
            <span className={styles.mediaTitleText}>
              Now Playing –{" "}
              <strong>
                {currentTrack ? `${currentTrack.title} (${currentTrack.artist})` : "Warm Tea & Code"}
              </strong>
              {currentTrack?.isLive && <span className={styles.barLiveBadge}>📻 LIVE</span>}
            </span>

            <button
              type="button"
              className={styles.openMusicHubBtn}
              onClick={(e) => {
                e.stopPropagation();
                if (sounds) sounds.playClick();
                openMusicHub("browse");
              }}
              title="Browse Songs & Artists"
            >
              <Music size={12} />
              <span>Browse</span>
            </button>
          </div>

          <div className={styles.mediaControls}>
            <button
              type="button"
              className={styles.barSkipBtn}
              onClick={() => {
                if (sounds) sounds.playClick();
                prevMusicTrack();
              }}
              title="Previous Track"
            >
              <SkipBack size={13} />
            </button>

            <span className={styles.timeDisplay}>
              {currentTrack?.isLive ? "LIVE" : formatAudioTime(musicCurrentTime)}
            </span>

            <div
              className={styles.timeSlider}
              onClick={(e) => {
                if (!musicDuration || currentTrack?.isLive) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const ratio = Math.max(0, Math.min(1, clickX / rect.width));
                seekMusic(ratio * musicDuration);
              }}
              title={currentTrack?.isLive ? "Live Stream" : "Seek track"}
            >
              <div
                className={styles.timeProgress}
                style={{
                  width: `${currentTrack?.isLive ? 100 : musicDuration > 0 ? (musicCurrentTime / musicDuration) * 100 : 0}%`,
                }}
              />
            </div>

            <button
              type="button"
              className={styles.barSkipBtn}
              onClick={() => {
                if (sounds) sounds.playClick();
                nextMusicTrack();
              }}
              title="Next Track"
            >
              <SkipForward size={13} />
            </button>

            <button
              type="button"
              className={styles.barPlayBtn}
              onClick={() => {
                if (sounds) sounds.playClick();
                togglePlayMusic();
              }}
              title={isPlayingMusic ? "Pause" : "Play"}
            >
              {isPlayingMusic ? <Pause size={15} /> : <Play size={15} style={{ marginLeft: 1 }} />}
            </button>

            {/* YouTube Lo-Fi Player Drawer Toggle */}
            <button
              type="button"
              className={styles.ytToggleBtn}
              onClick={() => setShowYoutube(!showYoutube)}
            >
              <Tv size={14} />
              <span>{showYoutube ? "Hide Video" : "Lo-Fi Video"}</span>
            </button>
          </div>
        </div>

        {/* Expandable YouTube Companion Drawer */}
        {showYoutube && (
          <div className={styles.ytDrawer}>
            <div className={styles.ytHeader}>
              <span>📺 Lofi Girl • beats to relax/study to (Live Companion)</span>
              <button onClick={() => setShowYoutube(false)} style={{ color: "#aaa" }}>
                <X size={16} />
              </button>
            </div>
            <div className={styles.ytIframeWrapper}>
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube-nocookie.com/embed/jfKfPfyJRdk?autoplay=1&mute=0"
                title="Lofi Girl Focus Stream"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )}

        {/* Main Workspace Canvas */}
        <div className={styles.mainCanvas}>
          {children}
        </div>

        {/* Bottom Terracotta Desk Footer */}
        <div className={styles.deskFooter}>
          <button
            className={styles.deskMenuBtn}
            onClick={() => {
              if (sounds) sounds.playClick();
              openDeskMenu("profile");
            }}
          >
            <span>☕</span> Desk Menu
          </button>

          <div className={styles.footerCenterQuote}>
            ✨ Happy coding & stay cozy! • {activeTab === "desk" ? "my desk mode" : activeTab === "sprint" ? "sprint harvest mode" : activeTab === "notes" ? "snug notes mode" : "cafe pomodoro mode"} ✨
          </div>

          <div className={styles.footerIcons}>
            {/* Stale task reminder notification bell */}
            <div
              className={styles.footerPill}
              title={`${staleTasks.length} pending reminder(s)`}
              onClick={() => {
                if (sounds) sounds.playPop();
                setActiveTab("sprint");
              }}
            >
              <Bell size={16} />
              {staleTasks.length > 0 && <span className={styles.badgeDot} />}
            </div>

            {/* Hydration quick sip pill */}
            <div
              className={styles.footerPill}
              title={`Hydration: ${waterCups}/${maxWaterCups} cups. Click to take a sip!`}
              onClick={sipWater}
            >
              <Droplets size={16} />
            </div>

            {/* Day / Night warm lighting toggle */}
            <div
              className={styles.footerPill}
              title="Toggle cozy lighting"
              onClick={() => {
                if (sounds) sounds.playClick();
                setIsDarkMode(!isDarkMode);
              }}
            >
              {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
            </div>
          </div>
        </div>
      </div>

      {/* Celebratory Level Up Banner */}
      {levelUpToast && (
        <div className={styles.levelUpToast}>
          <div className={styles.levelUpToastContent}>
            <span className={styles.levelUpToastIcon}>{levelUpToast.icon || "🌱"}</span>
            <div className={styles.levelUpToastText}>
              <div className={styles.levelUpToastHeading}>
                ✨ Level Up! Reached Level {levelUpToast.level} ✨
              </div>
              <div className={styles.levelUpToastSub}>
                Unlocked title <strong>{levelUpToast.title}</strong>! {levelUpToast.reason ? `(${levelUpToast.reason})` : ""}
              </div>
            </div>
            <button
              className={styles.levelUpToastClose}
              onClick={dismissLevelUpToast}
              title="Dismiss celebration"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Cozy Auth / Logout Notification Toast */}
      {authToast && (
        <div className={styles.authToast}>
          <div className={styles.authToastContent}>
            <span className={styles.authToastIcon}>{authToast.icon || "👋"}</span>
            <div className={styles.authToastText}>{authToast.message}</div>
            <button
              type="button"
              className={styles.authToastClose}
              onClick={dismissAuthToast}
              aria-label="Dismiss toast"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Cozy Logout Confirmation Modal */}
      <LogoutModal />

      {/* Comprehensive Desk Customization Hub Modal */}
      <DeskMenuModal isOpen={isDeskMenuOpen} onClose={closeDeskMenu} />

      {/* Headless Audio Streaming Controller */}
      <AudioStreamController />

      {/* Cozy Music Streaming Hub & Player Modal */}
      <MusicHubModal />
    </div>
  );
}
