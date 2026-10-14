"use client";

import React, { useState, useEffect, useMemo } from "react";
import styles from "./CottageGarden.module.css";
import { sounds } from "@/utils/audio";
import confetti from "canvas-confetti";
import {
  autoDetectAndFetchWeather,
  searchCityCoordinates,
  fetchOpenMeteoWeather,
  getCachedWeather,
} from "@/utils/weather";

const WEATHER_MODES = [
  { id: "auto", label: "Auto (Live Weather)", icon: "🌐" },
  { id: "sunny", label: "Sunny", icon: "☀️" },
  { id: "sunset", label: "Sunset", icon: "🌅" },
  { id: "gloomy", label: "Gloomy", icon: "☁️" },
  { id: "rainy", label: "Rainy", icon: "🌧️" },
  { id: "snowy", label: "Snowy", icon: "❄️" },
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

const SNOW_FLAKES = [
  { id: 0, left: "6%", delay: "0s", duration: "3.2s" },
  { id: 1, left: "15%", delay: "0.8s", duration: "3.8s" },
  { id: 2, left: "26%", delay: "1.4s", duration: "3.0s" },
  { id: 3, left: "37%", delay: "0.3s", duration: "4.2s" },
  { id: 4, left: "48%", delay: "1.9s", duration: "3.5s" },
  { id: 5, left: "59%", delay: "0.6s", duration: "3.1s" },
  { id: 6, left: "70%", delay: "2.2s", duration: "4.0s" },
  { id: 7, left: "81%", delay: "1.1s", duration: "3.6s" },
  { id: 8, left: "92%", delay: "2.6s", duration: "3.4s" },
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

  const [weatherData, setWeatherData] = useState(() => getCachedWeather());
  const [timeString, setTimeString] = useState("");
  const [currentHour, setCurrentHour] = useState(12);
  const [gardenFlowers, setGardenFlowers] = useState(["🌷", "🍄", "🌻", "🌿"]);

  // City Search State
  const [isEditingCity, setIsEditingCity] = useState(false);
  const [cityInput, setCityInput] = useState("");
  const [savedCity, setSavedCity] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        return localStorage.getItem("devsprout_weather_city") || "";
      } catch {}
    }
    return "";
  });

  // Clock Synchronization (Time of Day)
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentHour(now.getHours());
      setTimeString(
        now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
      );
    };
    updateClock();
    const timer = setInterval(updateClock, 15000);
    return () => clearInterval(timer);
  }, []);

  // Initial weather load and 15-minute refresh
  useEffect(() => {
    let isCancelled = false;

    const fetchWeather = async () => {
      try {
        const data = await autoDetectAndFetchWeather(savedCity || null);
        if (!isCancelled && data) {
          setWeatherData(data);
        }
      } catch (err) {
        console.warn("Weather fetch fallback:", err);
      }
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 15 * 60 * 1000);
    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, [savedCity]);

  // Compute effective visual weather
  const effectiveWeather = useMemo(() => {
    if (weatherMode !== "auto") return weatherMode;
    if (weatherData?.atmosphere) return weatherData.atmosphere;
    // Fallback if offline / before load
    if (currentHour >= 6 && currentHour < 17) return "sunny";
    if (currentHour >= 17 && currentHour < 19) return "sunset";
    return "dark";
  }, [weatherMode, weatherData, currentHour]);

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

  // Water the garden mini-game
  const handleTendGarden = () => {
    if (sounds) sounds.playWaterDrop();
    const floraList = ["🌷", "🍄", "🌻", "🌿", "🌸", "🌱", "🍓", "🌼", "🍀", "🌺"];
    const randomFlora = floraList[Math.floor(Math.random() * floraList.length)];
    setGardenFlowers((prev) => [...prev.slice(-4), randomFlora]);

    confetti({
      particleCount: 22,
      spread: 40,
      origin: { y: 0.38, x: 0.55 },
      colors:
        effectiveWeather === "dark"
          ? ["#a0c4ff", "#bdb2ff", "#ffc6ff"]
          : ["#78995a", "#f9d976", "#e07a5f", "#70a9a1"],
    });
  };

  // Handle City Submission
  const handleCitySubmit = async (e) => {
    e.preventDefault();
    if (!cityInput.trim()) {
      setIsEditingCity(false);
      return;
    }

    try {
      const coord = await searchCityCoordinates(cityInput.trim());
      if (coord) {
        const weather = await fetchOpenMeteoWeather(
          coord.latitude,
          coord.longitude,
          `${coord.name}${coord.country ? `, ${coord.country}` : ""}`
        );
        setWeatherData(weather);
        setSavedCity(cityInput.trim());
        try {
          localStorage.setItem("devsprout_weather_city", cityInput.trim());
        } catch {}
        if (sounds) sounds.playPop();
      }
    } catch (err) {
      console.warn("City lookup error:", err);
    }
    setIsEditingCity(false);
  };

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
      case "snowy":
        return styles.skySnowy;
      case "dark":
        return styles.skyDark;
      default:
        return styles.skySunny;
    }
  };

  const activeModeObj =
    WEATHER_MODES.find((m) => m.id === weatherMode) || WEATHER_MODES[0];

  return (
    <div className={styles.cottageCard}>
      {/* Header with Title, Live Time, Location, and Weather Mode Pill */}
      <div className={styles.cottageHeader}>
        <div className={styles.cottageTitle}>
          <span>🏡</span> Sprout&apos;s Meadow
        </div>

        <div className={styles.headerRight}>
          {/* Live Clock Badge */}
          {timeString && (
            <span
              className={styles.timePill}
              title={`Real-world time of day (${currentHour >= 12 ? "PM" : "AM"})`}
            >
              <span>⏰</span> {timeString}
            </span>
          )}

          {/* City / Location Pill */}
          {!isEditingCity ? (
            <button
              className={styles.cityPill}
              onClick={(e) => {
                e.stopPropagation();
                setIsEditingCity(true);
                setCityInput(weatherData?.city || "");
              }}
              title="Click to change city or location"
            >
              <span>📍</span>
              <span>{weatherData?.city || "My City"}</span>
              {weatherData?.temp !== undefined && (
                <strong style={{ marginLeft: "2px" }}>{weatherData.temp}°C</strong>
              )}
            </button>
          ) : (
            <form onSubmit={handleCitySubmit} className={styles.cityInputBox}>
              <input
                type="text"
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                placeholder="City name..."
                className={styles.cityInput}
                autoFocus
              />
              <button type="submit" className={styles.cityBtn}>
                ✓
              </button>
            </form>
          )}

          {/* Mode Pill Toggle */}
          <button
            className={styles.weatherTogglePill}
            onClick={handleCycleWeather}
            title="Click to cycle weather (Auto Open-Meteo, Sunny, Sunset, Gloomy, Rainy, Snowy, Dark)"
          >
            <span>{weatherMode === "auto" ? weatherData?.icon || "🌐" : activeModeObj.icon}</span>
            <span>
              {weatherMode === "auto"
                ? `Live (${effectiveWeather})`
                : activeModeObj.label}
            </span>
          </button>
        </div>
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
            <span
              className={styles.secondCloud}
              style={{ top: "12px", right: "20px", fontSize: "1.2rem", opacity: 0.9 }}
            >
              🌥️
            </span>
          </>
        )}

        {/* Rainy weather with rain clouds & animated drops */}
        {effectiveWeather === "rainy" && (
          <>
            <span className={styles.celestialCloud} style={{ opacity: 0.95 }}>🌧️</span>
            <span
              className={styles.secondCloud}
              style={{ top: "8px", right: "16px", fontSize: "1.2rem" }}
            >
              ⛈️
            </span>
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

        {/* Snowy weather with falling snowflakes */}
        {effectiveWeather === "snowy" && (
          <>
            <span className={styles.celestialCloud} style={{ opacity: 0.95 }}>🌨️</span>
            <div className={styles.snowOverlay}>
              {SNOW_FLAKES.map((s) => (
                <div
                  key={s.id}
                  className={styles.snowFlake}
                  style={{
                    left: s.left,
                    animationDelay: s.delay,
                    animationDuration: s.duration,
                  }}
                >
                  ❄️
                </div>
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
          {weatherMode === "auto" && weatherData ? (
            <span>
              {weatherData.icon} {weatherData.temp}°C • {weatherData.description}
            </span>
          ) : (
            <>
              {effectiveWeather === "sunny" && "☀️ clear & sunny"}
              {effectiveWeather === "sunset" && "🌅 golden sunset"}
              {effectiveWeather === "gloomy" && "☁️ cozy overcast"}
              {effectiveWeather === "rainy" && "🌧️ gentle rainfall"}
              {effectiveWeather === "snowy" && "❄️ gentle snowfall"}
              {effectiveWeather === "dark" && "🌙 starry night"}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
