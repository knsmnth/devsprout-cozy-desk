"use client";

import React, { useState, useEffect } from "react";
import styles from "./CottageGarden.module.css";
import { sounds } from "@/utils/audio";
import {
  useWeatherStore,
  useMeadowAtmosphere,
  WEATHER_MODES,
} from "@/store/useWeatherStore";
import { RotateCw } from "lucide-react";

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
  const weatherMode = useWeatherStore((s) => s.weatherMode);
  const weatherData = useWeatherStore((s) => s.weatherData);
  const timeString = useWeatherStore((s) => s.timeString);
  const gardenFlowers = useWeatherStore((s) => s.gardenFlowers);
  const isLocationModalOpen = useWeatherStore((s) => s.isLocationModalOpen);
  const isDetectingGps = useWeatherStore((s) => s.isDetectingGps);
  const locationFeedback = useWeatherStore((s) => s.locationFeedback);
  const locationError = useWeatherStore((s) => s.locationError);
  const isLoadingWeather = useWeatherStore((s) => s.isLoadingWeather);

  const cycleWeatherMode = useWeatherStore((s) => s.cycleWeatherMode);
  const updateClock = useWeatherStore((s) => s.updateClock);
  const fetchWeather = useWeatherStore((s) => s.fetchWeather);
  const setCity = useWeatherStore((s) => s.setCity);
  const detectGPS = useWeatherStore((s) => s.detectGPS);
  const tendGarden = useWeatherStore((s) => s.tendGarden);
  const openLocationModal = useWeatherStore((s) => s.openLocationModal);
  const closeLocationModal = useWeatherStore((s) => s.closeLocationModal);
  const initWeatherStore = useWeatherStore((s) => s.initWeatherStore);

  const atmosphere = useMeadowAtmosphere();
  const [cityInput, setCityInput] = useState("");

  // Initialize store and start timers on mount
  useEffect(() => {
    initWeatherStore();
    const clockTimer = setInterval(updateClock, 15000);
    const weatherTimer = setInterval(() => fetchWeather(), 15 * 60 * 1000);

    return () => {
      clearInterval(clockTimer);
      clearInterval(weatherTimer);
    };
  }, [initWeatherStore, updateClock, fetchWeather]);

  const handleCitySubmit = async (e) => {
    e.preventDefault();
    if (!cityInput.trim()) return;
    const ok = await setCity(cityInput);
    if (ok) {
      setCityInput("");
      setTimeout(() => closeLocationModal(), 1200);
    }
  };

  const handleDetectGps = async () => {
    const ok = await detectGPS();
    if (ok) {
      setTimeout(() => closeLocationModal(), 1200);
    }
  };

  const handleRefreshWeather = (e) => {
    e.stopPropagation();
    if (sounds) sounds.playPop();
    fetchWeather();
  };

  // Determine computed dynamic background class
  const getSkyClass = () => {
    if (atmosphere.isThunder) return styles.skyThunderstorm;
    if (atmosphere.isNight && atmosphere.isRaining) return styles.skyNightRainy;
    if (atmosphere.isSunset && atmosphere.isRaining) return styles.skySunsetRainy;
    if (atmosphere.isNight) return styles.skyDark;
    if (atmosphere.isSunset) return styles.skySunset;
    if (atmosphere.isRaining) return styles.skyRainy;
    if (atmosphere.isSnowing) return styles.skySnowy;
    if (atmosphere.isCloudy) return styles.skyGloomy;
    return styles.skySunny;
  };

  const getActiveModeDisplay = () => {
    if (weatherMode === "auto") {
      let condLabel = atmosphere.isRaining
        ? atmosphere.isNight
          ? "Rainy Night"
          : "Rainy"
        : atmosphere.isSnowing
        ? atmosphere.isNight
          ? "Snowy Night"
          : "Snowy"
        : atmosphere.isNight
        ? "Clear Night"
        : atmosphere.isSunset
        ? "Sunset"
        : atmosphere.isCloudy
        ? "Overcast"
        : "Sunny";

      return `Live (${condLabel})`;
    }
    const found = WEATHER_MODES.find((m) => m.id === weatherMode);
    return found ? found.label : "Custom";
  };

  return (
    <div className={styles.cottageCard}>
      {/* Header with Title, Live Clock, Location, and Weather Mode */}
      <div className={styles.cottageHeader}>
        <div className={styles.cottageTitle}>
          <span>🏡</span>
          <span>Sprout&apos;s Meadow</span>
        </div>

        <div className={styles.headerRight}>
          {/* Live Local Clock */}
          {timeString && (
            <span
              className={styles.timePill}
              title={`Local Time: ${timeString} (${atmosphere.isNight ? "Night" : atmosphere.isSunset ? "Sunset" : "Daytime"})`}
            >
              <span>{atmosphere.isNight ? "🌙" : "⏰"}</span>
              <span>{timeString}</span>
            </span>
          )}

          {/* Location Pill */}
          <button
            className={styles.locationPill}
            onClick={openLocationModal}
            title="Click to change location or use Device GPS for live weather"
          >
            <span>📍</span>
            <span>{weatherData?.city || "Set Location"}</span>
            {weatherData?.temp !== undefined && (
              <strong style={{ marginLeft: "2px" }}>{weatherData.temp}°C</strong>
            )}
          </button>

          {/* Mode Pill Toggle (Supports Dual-State) */}
          <button
            className={styles.weatherTogglePill}
            onClick={cycleWeatherMode}
            title="Click to cycle weather modes (Live Real-Time, Sunny Day, Sunset, Clear Night, Rainy Day, Rainy Night, Night Storm, Snowy)"
          >
            <span>{atmosphere.icon}</span>
            <span>{getActiveModeDisplay()}</span>
          </button>

          {/* Quick Refresh Weather Button */}
          <button
            className={styles.refreshWeatherBtn}
            onClick={handleRefreshWeather}
            title="Refresh live weather radar data"
            aria-label="Refresh live weather"
          >
            <RotateCw
              size={12}
              style={{
                animation: isLoadingWeather ? "spin 1s linear infinite" : "none",
              }}
            />
          </button>
        </div>
      </div>

      {/* Interactive Weather Viewport */}
      <div
        className={`${styles.cottageViewport} ${getSkyClass()}`}
        onClick={tendGarden}
        title="Click meadow to water flowers and tend the garden!"
      >
        {/* Celestial Body: Sun in Day or Sunset */}
        {atmosphere.isDay && (
          <span className={styles.celestialSun} title="Daytime Sun">
            ☀️
          </span>
        )}
        {atmosphere.isSunset && (
          <span className={styles.celestialSun} title="Golden Sunset">
            🌅
          </span>
        )}

        {/* Celestial Body: Moon in Night (Rendered even if raining, with parting clouds) */}
        {atmosphere.isNight && (
          <span
            className={styles.celestialMoon}
            title={atmosphere.isRaining ? "Night Moon behind rain clouds" : "Night Moon"}
            style={{
              opacity: atmosphere.isRaining ? 0.75 : 1,
            }}
          >
            🌙
          </span>
        )}

        {/* Stars in Night (Softly visible through clouds during night rain, twinkling when clear) */}
        {atmosphere.isNight && (
          <div
            className={styles.starsContainer}
            style={{ opacity: atmosphere.isRaining ? 0.45 : 1 }}
          >
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

        {/* Clouds: Sunny / Sunset soft clouds */}
        {(atmosphere.isDay || atmosphere.isSunset) && !atmosphere.isRaining && (
          <>
            <span className={styles.celestialCloud}>☁️</span>
            <span className={styles.secondCloud}>☁️</span>
          </>
        )}

        {/* Gloomy heavy clouds */}
        {atmosphere.isCloudy && !atmosphere.isRaining && (
          <>
            <span className={styles.celestialCloud} style={{ opacity: 0.95 }}>
              ☁️
            </span>
            <span
              className={styles.secondCloud}
              style={{ top: "12px", right: "20px", fontSize: "1.2rem", opacity: 0.9 }}
            >
              🌥️
            </span>
          </>
        )}

        {/* Rainy weather: Works simultaneously in Day, Sunset, and Night */}
        {atmosphere.isRaining && (
          <>
            <span
              className={styles.celestialCloud}
              style={{ opacity: atmosphere.isNight ? 0.85 : 0.95 }}
            >
              {atmosphere.isThunder ? "⛈️" : "🌧️"}
            </span>
            <span
              className={styles.secondCloud}
              style={{ top: "8px", right: "16px", fontSize: "1.2rem" }}
            >
              {atmosphere.isNight ? "🌧️" : "⛈️"}
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

        {/* Snowy weather: Works in Day and Night */}
        {atmosphere.isSnowing && (
          <>
            <span className={styles.celestialCloud} style={{ opacity: 0.9 }}>
              🌨️
            </span>
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

        {/* Meadow Ground & Inhabitants */}
        <div className={styles.groundContainer}>
          {/* Cottage House with warm cozy window light in night */}
          <div className={styles.cottageBox}>
            <span
              className={styles.cottageHouse}
              style={{
                filter: atmosphere.isNight
                  ? "drop-shadow(0 0 6px rgba(254, 243, 199, 0.5))"
                  : "none",
              }}
            >
              🏡
            </span>
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
          {weatherData ? (
            <span>
              {atmosphere.icon} {weatherData.temp}°C
              {weatherData.feelsLike !== undefined && weatherData.feelsLike !== weatherData.temp
                ? ` (feels ${weatherData.feelsLike}°C)`
                : ""}
              {" • "}
              {weatherData.description}
              {atmosphere.isNight ? " • 🌙 night time" : ""}
            </span>
          ) : (
            <span>
              {atmosphere.icon} {atmosphere.label}
            </span>
          )}
        </div>
      </div>

      {/* Location Picker & GPS Modal */}
      {isLocationModalOpen && (
        <div className={styles.locationModalOverlay} onClick={closeLocationModal}>
          <div
            className={styles.locationModal}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className={styles.locationHeader}>
              <div className={styles.locationTitle}>
                <span>📍</span> Set Your Exact Location
              </div>
              <button
                className={styles.locationCloseBtn}
                onClick={closeLocationModal}
                title="Close"
              >
                ✕
              </button>
            </div>

            <p className={styles.locationSubtitle}>
              Ensure accurate real-time weather, temperature, and day/night cycle for your desk.
            </p>

            <form onSubmit={handleCitySubmit} className={styles.searchForm}>
              <input
                type="text"
                className={styles.cityInput}
                placeholder="Type city or town (e.g. Baybay, Ormoc, Manila, Tokyo)..."
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                autoFocus
              />
              <button type="submit" className={styles.searchBtn} disabled={isDetectingGps}>
                Search
              </button>
            </form>

            <div className={styles.orDivider}>
              <span>or</span>
            </div>

            <button
              type="button"
              className={styles.gpsBtn}
              onClick={handleDetectGps}
              disabled={isDetectingGps}
            >
              <span>🛰️</span>
              <span>
                {isDetectingGps ? "Acquiring Device GPS..." : "Detect with Device GPS"}
              </span>
            </button>

            {locationFeedback && (
              <div className={styles.feedbackSuccess}>{locationFeedback}</div>
            )}

            {locationError && (
              <div className={styles.feedbackError}>{locationError}</div>
            )}

            <div className={styles.quickCitiesList}>
              <span className={styles.quickCityLabel}>Quick preset:</span>
              {["Baybay", "Ormoc", "Tacloban", "Cebu", "Manila", "Tokyo"].map((city) => (
                <button
                  key={city}
                  type="button"
                  className={styles.quickCityBtn}
                  onClick={() => setCity(city)}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
