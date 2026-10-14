"use client";

import React, { useState } from "react";
import styles from "./CafeView.module.css";
import { useTaskManager } from "@/context/TaskContext";
import { sounds } from "@/utils/audio";
import { Play, Pause, RotateCcw, Plus, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";

export default function CafeView() {
  const {
    timeLeft,
    setTimeLeft,
    isTimerRunning,
    setIsTimerRunning,
    pomodoroDuration,
    setPomodoroDuration,
    timerIntervalCount,
    cafeStamps,
    sessionLogs,
    currentBeverage,
    setCurrentBeverage,
  } = useTaskManager();

  const [steamActive, setSteamActive] = useState(true);

  // Minutes & Seconds formatting
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${minutes < 10 ? "0" : ""}${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  const timerPercent = Math.min(100, Math.round(((pomodoroDuration - timeLeft) / pomodoroDuration) * 100));

  const handleStartTimer = () => {
    if (sounds) sounds.playClick();
    setIsTimerRunning(true);
  };

  const handlePauseTimer = () => {
    if (sounds) sounds.playClick();
    setIsTimerRunning(false);
  };

  const handleResetTimer = () => {
    if (sounds) sounds.playClick();
    setIsTimerRunning(false);
    setTimeLeft(pomodoroDuration);
  };

  const completedStamps = cafeStamps.filter((s) => s.status === "done").length;

  return (
    <div className={styles.cafeGrid}>
      {/* Left Column: Loyalty Card & Orders */}
      <div className={styles.leftCol}>
        {/* Cafe Loyalty Card */}
        <div className={styles.card}>
          <div className={styles.loyaltyHeader}>
            <div className={styles.loyaltyTitle}>
              <span>☕</span> Cafe Loyalty Card
            </div>
            <span className={styles.stampsPill}>{completedStamps} / 8 Stamps</span>
          </div>

          <p className={styles.loyaltyDesc}>
            Earn 1 warm stamp per 25-minute mindful Pomodoro session! Free pastry at 8 stamps 🥐
          </p>

          <div className={styles.stampsGrid}>
            {cafeStamps.map((stamp) => (
              <div
                key={stamp.id}
                className={`${styles.stampSlot} ${
                  stamp.status === "done"
                    ? styles.stampDone
                    : stamp.status === "next"
                    ? styles.stampActive
                    : stamp.status === "reward"
                    ? styles.stampReward
                    : ""
                }`}
                title={stamp.label}
              >
                <span>{stamp.icon}</span>
                <span className={styles.stampSlotLabel}>{stamp.label}</span>
              </div>
            ))}
          </div>

          <div className={styles.rewardBox}>
            Next session reward: <strong>Warm Butter Croissant 🥐✨</strong>
          </div>
        </div>

        {/* My Orders Today Card */}
        <div className={styles.card}>
          <div className={styles.ordersHeader}>
            My Orders Today 🥐
          </div>

          <div className={styles.orderList}>
            <div className={styles.orderItem}>
              <div>
                <div className={styles.orderName}>1x Matcha Latte</div>
                <div className={styles.orderSub}>oat milk + brown sugar</div>
              </div>
              <span className={`${styles.orderBadge} ${styles.badgeRefilled}`}>refilled</span>
            </div>

            <div className={styles.orderItem}>
              <div>
                <div className={styles.orderName}>1x Roasted Hojicha Tea</div>
                <div className={styles.orderSub}>warm ceramic pot</div>
              </div>
              <span className={`${styles.orderBadge} ${styles.badgeHot}`}>piping hot</span>
            </div>

            <div className={styles.orderItem}>
              <div>
                <div className={styles.orderName}>1x Warm Cinnamon Roll</div>
                <div className={styles.orderSub}>extra vanilla drizzle</div>
              </div>
              <span className={`${styles.orderBadge} ${styles.badgeBaked}`}>freshly baked</span>
            </div>
          </div>

          <div className={styles.cafeTip}>
            🧺 <strong>Tip:</strong> sip water between teas to keep your coding focus calm and hydrated!
          </div>
        </div>
      </div>

      {/* Right Column: Cozy Focus Clock & Session History */}
      <div className={styles.rightCol}>
        {/* Cozy Cafe Focus Clock */}
        <div className={styles.clockCard}>
          <div className={styles.clockTop}>
            <div className={styles.clockTitle}>
              <span>⏱️</span> Cozy Cafe Focus Clock
            </div>
            <span className={styles.intervalBadge}>
              🌿 Interval #{timerIntervalCount} • {currentBeverage} Brew Flow
            </span>
          </div>

          <div className={styles.clockBody}>
            {/* Animated Beverage Mug */}
            <div className={styles.brewBox}>
              <div className={`${styles.steamIcons} ${isTimerRunning ? "steam-float" : ""}`}>
                <span>♨️</span>
                <span>♨️</span>
                <span>♨️</span>
              </div>
              <span className={styles.brewMug}>
                {currentBeverage.includes("Matcha") ? "🍵" : "☕"}
              </span>
              <div className={styles.brewStateText}>
                {isTimerRunning ? "Steaming & Brewing..." : "Grinding Fresh Beans"}
              </div>
              <div className={styles.brewSub}>calm lofi ticks active</div>
            </div>

            {/* Huge Digits & Action Controls */}
            <div className={styles.timeDisplaySection}>
              <div className={styles.digitsRow}>
                <span className={styles.digits}>{timeFormatted}</span>
                <span className={styles.timerLabel}>pomodoro time</span>
              </div>

              <div className={styles.timerProgressBar}>
                <div className={styles.timerFill} style={{ width: `${timerPercent}%` }} />
              </div>

              <div className={styles.clockBtns}>
                {isTimerRunning ? (
                  <button className={styles.pauseBtn} onClick={handlePauseTimer}>
                    <Pause size={14} style={{ display: "inline", marginRight: "4px" }} />
                    Pause
                  </button>
                ) : (
                  <button className={styles.startBtn} onClick={handleStartTimer}>
                    <Play size={14} style={{ display: "inline", marginRight: "4px" }} />
                    Start Brew (Focus)
                  </button>
                )}

                <button className={styles.resetBtn} onClick={handleResetTimer}>
                  <RotateCcw size={14} style={{ display: "inline", marginRight: "4px" }} />
                  Reset
                </button>

                <span className={styles.modeNote}>
                  Mode: 25m focus | 5m break
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Session History & Chill Log */}
        <div className={styles.historyCard}>
          <div className={styles.historyHeader}>
            <div className={styles.historyTitle}>
              <span>📜</span> Session History & Chill Log
            </div>
            <span className={styles.historyTicket}>
              {sessionLogs.length} session{sessionLogs.length === 1 ? "" : "s"} logged
            </span>
          </div>

          <table className={styles.historyTable}>
            <thead>
              <tr>
                <th>TIME</th>
                <th>BEVERAGE FOCUS</th>
                <th>TASK DESCRIPTION</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {sessionLogs.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    style={{
                      textAlign: "center",
                      padding: "32px 16px",
                      color: "#8c8371",
                      fontStyle: "italic",
                    }}
                  >
                    No sessions logged yet today. Start your first 25-minute Pomodoro timer above! ☕✨
                  </td>
                </tr>
              ) : (
                sessionLogs.map((log) => (
                  <tr key={log.id}>
                    <td style={{ fontWeight: 600 }}>{log.time}</td>
                    <td>
                      <span>{log.icon}</span> {log.beverage}
                    </td>
                    <td>{log.task}</td>
                    <td>
                      <span
                        className={
                          log.status.includes("Rested")
                            ? styles.statusRested
                            : styles.statusCompleted
                        }
                      >
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className={styles.historyFooter}>
            <div>
              ☀️ Mindful focus logged:{" "}
              <strong>
                {Math.floor((sessionLogs.length * 25) / 60) > 0
                  ? `${Math.floor((sessionLogs.length * 25) / 60)} hr `
                  : ""}
                {(sessionLogs.length * 25) % 60} mins
              </strong>
              . Remember to stretch!
            </div>
            <button
              className={styles.logManualBtn}
              onClick={() => {
                if (sounds) sounds.playClick();
                const now = new Date();
                const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                sessionLogs.push ? null : null;
                // Add quick stretch break log
              }}
            >
              ☕ Take a breath
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
