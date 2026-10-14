"use client";

import React, { useState, useEffect } from "react";
import styles from "./WindowFrame.module.css";
import { useTaskManager } from "@/context/TaskContext";
import { sounds } from "@/utils/audio";
import DeskMenuModal from "@/components/DeskMenuModal";
import { Play, Pause, Bell, Droplets, Moon, Sun, Tv, X } from "lucide-react";

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
  } = useTaskManager();

  const [isPlayingLoFi, setIsPlayingLoFi] = useState(false);
  const [activeAmbient, setActiveAmbient] = useState(null);
  const [showYoutube, setShowYoutube] = useState(false);
  const [mediaTime, setMediaTime] = useState(65); // 01:05
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Switch tabs
  const handleTabClick = (tabId) => {
    if (sounds) sounds.playClick();
    setActiveTab(tabId);
  };

  // Ambient sound handler
  const handleToggleAmbient = (type) => {
    if (!sounds) return;
    const isNowActive = sounds.toggleAmbient(type);
    setActiveAmbient(isNowActive ? type : null);
  };

  // Timer simulation for Lo-Fi bar
  useEffect(() => {
    let interval = null;
    if (isPlayingLoFi || activeAmbient) {
      interval = setInterval(() => {
        setMediaTime((prev) => (prev >= 252 ? 0 : prev + 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlayingLoFi, activeAmbient]);

  const formatMediaTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `0${mins}:${secs < 10 ? "0" : ""}${secs}`;
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

          <div className={styles.navRight}>
            <span className={styles.madeWithBadge}>made with 🍵 for cozy devs</span>
          </div>
        </header>

        {/* Persistent Audio & Lo-Fi Media Bar */}
        <div className={styles.mediaBar}>
          <div className={styles.mediaTitle}>
            <span className={styles.musicNote}>♫</span>
            <span>
              Now Playing –{" "}
              {activeAmbient === "rain"
                ? "Gentle Rooftop Rain & Distant Thunder"
                : activeAmbient === "cafe"
                ? "Ambient Cafe Chimes & Rainy Jazz"
                : "Warm Tea & Code (by Chocoberry)"}
            </span>
          </div>

          <div className={styles.mediaControls}>
            <span className={styles.timeDisplay}>
              {formatMediaTime(mediaTime)}
            </span>
            <div
              className={styles.timeSlider}
              onClick={() => setMediaTime((prev) => (prev + 30) % 252)}
            >
              <div
                className={styles.timeProgress}
                style={{ width: `${(mediaTime / 252) * 100}%` }}
              />
            </div>

            <button
              onClick={() => {
                if (activeAmbient) {
                  sounds && sounds.stopAmbient();
                  setActiveAmbient(null);
                } else {
                  handleToggleAmbient("rain");
                }
                setIsPlayingLoFi(!isPlayingLoFi);
              }}
              title="Play / Pause"
              style={{ color: "#fff" }}
            >
              {isPlayingLoFi || activeAmbient ? <Pause size={17} /> : <Play size={17} />}
            </button>

            {/* Ambient Sound Toggles */}
            <div className={styles.ambientPills}>
              <button
                className={`${styles.ambientBtn} ${activeAmbient === "rain" ? styles.ambientBtnActive : ""}`}
                onClick={() => handleToggleAmbient("rain")}
              >
                🌧️ Rain
              </button>
              <button
                className={`${styles.ambientBtn} ${activeAmbient === "cafe" ? styles.ambientBtnActive : ""}`}
                onClick={() => handleToggleAmbient("cafe")}
              >
                ☕ Cafe
              </button>
            </div>

            {/* YouTube Lo-Fi Player Drawer Toggle */}
            <button
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

      {/* Comprehensive Desk Customization Hub Modal */}
      <DeskMenuModal isOpen={isDeskMenuOpen} onClose={closeDeskMenu} />
    </div>
  );
}
