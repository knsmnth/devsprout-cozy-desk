"use client";

import React, { useState, useEffect, useMemo } from "react";
import styles from "./CottageGarden.module.css";
import { sounds } from "@/utils/audio";
import confetti from "canvas-confetti";

const WEATHER_MODES = [
  { id: "auto", label: "Auto (Local Time)", icon: "⏰" },
  { id: "sunny", label: "Sunny", icon: "☀️" },
  { id: "gloomy", label: "Gloomy", icon: "☁️" },
  { id: "rainy", label: "Rainy", icon: "🌧️" },
  { id: "dark", label: "Dark Night", icon: "🌙" },
];

const RAIN_DROPS = [
  { id: 0, left: "4%", delay: "0s", duration: "0.5s" },
  { id: 1, left: "11%", delay: "0.12s", duration: "0.58s" },
  { id: 2, left: "18%", delay: "0.24s", duration: "0.48s" },
  { id: 3, left: "25%", delay: "0.08s", duration: "0.62s" },
  { id: 4, left: "32%", delay: "0.36s", duration: "0.52s" },
  { id: 5, left: "39%", delay: "0.18s", duration: "0.45s" },
  { id: 6, left: "46%", delay: "0.48s", duration: "0.56s" },
  { id: 7, left: "53%", delay: "0.05s", duration: "0.6s" },
  { id: 8, left: "60%", delay: "0.28s", duration: "0.5s" },
  { id: 9, left: "67%", delay: "0.15s", duration: "0.54s" },
  { id: 10, left: "74%", delay: "0.42s", duration: "0.46s" },
  { id: 11, left: "81%", delay: "0.22s", duration: "0.64s" },
  { id: 12, left: "88%", delay: "0.32s", duration: "0.52s" },
  { id: 13, left: "95%", delay: "0.1s", duration: "0.48s" },
];

const NIGHT_STARS = [
  { id: 1, top: "12px", left: "20%", delay: "0s" },
  { id: 2, top: "22px", left: "42%", delay: "0.8s" },
  { id: 3, top: "14px", left: "68%", delay: "1.4s" },
  { id: 4, top: "35px", left: "15%", delay: "1.9s" },
  { id: 5, top: "28px", left: "82%", delay: "0.5s" },
  { id: 6, top: "42px", left: "54%", delay: "2.1s" },
];

export default function CottageGarden() {
  const [weatherMode, setWeatherMode] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("devsprout_cottage_weather");
        if (saved && WEATHER_MODES.some((m) => m.id === saved)) {
          return saved;
        }
      } catch {}
    }
    return "auto";
  });
  const [currentHour, setCurrentHour] = useState(12);
  const [gardenFlowers, setGardenFlowers] = useState(["🌷", "🍄", "🌻", "🌿"]);

  // Start clock timer
  useEffect(() => {
    const updateHour = () => {
      setCurrentHour(new Date().getHours());
    };
    updateHour();
    const timer = setInterval(updateHour, 60000);
    return () => clearInterval(timer);
  }, []);

  // Compute effective weather state
  const effectiveWeather = useMemo(() => {
    if (weatherMode !== "auto") return weatherMode;
    // Auto mode based on current real-world hour
    if (currentHour >= 6 && currentHour < 17) return "sunny";
    if (currentHour >= 17 && currentHour < 19) return "sunset";
    return "dark"; // 7 PM to 6 AM
  }, [weatherMode, currentHour]);

  // Cycle weather mode
  const handleCycleWeather = (e) => {
    e.stopPropagation();
    if (sounds) sounds.playClick();
    const currentIndex = WEATHER_MODES.findIndex((m) => m.id === weatherMode);
    const nextMode = WEATHER_MODES[(currentIndex + 1) % WEATHER_MODES.length].id;
    setWeatherMode(nextMode);
    try {
      localStorage.setItem("devsprout_cottage_weather", nextMode);
    } catch {}
  };

  // Water the garden
  const handleTendGarden = () => {
    if (sounds) sounds.playWaterDrop();
    const floraList = ["🌷", "🍄", "🌻", "🌿", "🌸", "🌱", "🍓", "🌼", "🍀", "🌺"];
    const randomFlora = floraList[Math.floor(Math.random() * floraList.length)];
    setGardenFlowers((prev) => [...prev.slice(-4), randomFlora]);

    confetti({
      particleCount: 22,
      spread: 40,
      origin: { y: 0.38, x: 0.55 },
      colors: effectiveWeather === "dark" 
        ? ["#a0c4ff", "#bdb2ff", "#ffc6ff"] 
        : ["#78995a", "#f9d976", "#e07a5f", "#70a9a1"],
    });
  };

  // Get sky class based on effective weather
  const getSkyClass = () => {
    switch (effectiveWeather) {
      case "sunny":
        return styles.skySunny;
      case "sunset":
        return styles.skySunset;
      case "gloomy":
        return styles.skyGloomy;
      case "rainy":
        return styles.skyRainy;
      case "dark":
        return styles.skyDark;
      default:
        return styles.skySunny;
    }
  };

  const activeModeObj = WEATHER_MODES.find((m) => m.id === weatherMode) || WEATHER_MODES[0];

  return (
    <div className={styles.cottageCard}>
      {/* Header with Title and Weather Pill */}
      <div className={styles.cottageHeader}>
        <div className={styles.cottageTitle}>
          <span>🏡</span> Sprout&apos;s Meadow
        </div>
        <button
          className={styles.weatherTogglePill}
          onClick={handleCycleWeather}
          title="Click to switch weather (Auto, Sunny, Gloomy, Rainy, Dark)"
        >
          <span>{activeModeObj.icon}</span>
          <span>{weatherMode === "auto" ? `Auto (${effectiveWeather})` : activeModeObj.label}</span>
        </button>
      </div>

      {/* Interactive Weather Viewport */}
      <div
        className={`${styles.cottageViewport} ${getSkyClass()}`}
        onClick={handleTendGarden}
        title="Click meadow to water flowers!"
      >
        {/* Sun in Sunny or Sunset */}
        {effectiveWeather === "sunny" && <span className={styles.celestialSun}>☀️</span>}
        {effectiveWeather === "sunset" && <span className={styles.celestialSun}>🌅</span>}

        {/* Moon in Dark Night */}
        {effectiveWeather === "dark" && <span className={styles.celestialMoon}>🌙</span>}

        {/* Clouds */}
        {(effectiveWeather === "sunny" || effectiveWeather === "sunset") && (
          <>
            <span className={styles.celestialCloud}>☁️</span>
            <span className={styles.secondCloud}>☁️</span>
          </>
        )}

        {/* Gloomy heavy clouds */}
        {effectiveWeather === "gloomy" && (
          <>
            <span className={styles.celestialCloud} style={{ opacity: 0.95 }}>☁️</span>
            <span className={styles.secondCloud} style={{ top: "12px", right: "20px", fontSize: "1.2rem", opacity: 0.9 }}>🌥️</span>
          </>
        )}

        {/* Rainy weather with rain clouds & animated drops */}
        {effectiveWeather === "rainy" && (
          <>
            <span className={styles.celestialCloud} style={{ opacity: 0.95 }}>🌧️</span>
            <span className={styles.secondCloud} style={{ top: "8px", right: "16px", fontSize: "1.2rem" }}>⛈️</span>
            <div className={styles.rainOverlay}>
              {RAIN_DROPS.map((drop) => (
                <div
                  key={drop.id}
                  className={styles.rainDrop}
                  style={{
                    left: drop.left,
                    animationDelay: drop.delay,
                    animationDuration: drop.duration,
                  }}
                />
              ))}
            </div>
          </>
        )}

        {/* Stars in Dark Mode */}
        {effectiveWeather === "dark" && (
          <div className={styles.starsContainer}>
            {NIGHT_STARS.map((s) => (
              <span
                key={s.id}
                className={styles.star}
                style={{ top: s.top, left: s.left, animationDelay: s.delay }}
              >
                ✨
              </span>
            ))}
          </div>
        )}

        {/* Meadow Ground & Inhabitants */}
        <div className={styles.groundContainer}>
          {/* Cottage House */}
          <div className={styles.cottageBox}>
            <span className={styles.cottageHouse}>🏡</span>
          </div>

          {/* Garden Flowers */}
          <div className={styles.gardenFlora}>
            {gardenFlowers.map((f, i) => (
              <span
                key={i}
                className="cute-bounce"
                style={{ animationDelay: `${i * 0.25}s` }}
              >
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Label */}
      <div className={styles.cottageFooter}>
        <div className={styles.tapHint}>
          <span>🌱</span>
          <span>tap meadow to water</span>
        </div>
        <div className={styles.weatherLabel}>
          {effectiveWeather === "sunny" && "☀️ clear & sunny"}
          {effectiveWeather === "sunset" && "🌅 golden sunset"}
          {effectiveWeather === "gloomy" && "☁️ cozy overcast"}
          {effectiveWeather === "rainy" && "🌧️ gentle rainfall"}
          {effectiveWeather === "dark" && "🌙 starry night"}
        </div>
      </div>
    </div>
  );
}
