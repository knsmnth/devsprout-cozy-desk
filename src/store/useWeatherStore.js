"use client";

import { create } from "zustand";
import { sounds } from "@/utils/audio";
import confetti from "canvas-confetti";
import {
  autoDetectAndFetchWeather,
  searchCityCoordinates,
  fetchOpenMeteoWeather,
  getCachedWeather,
  detectExactGPSLocation,
  calculateTimeOfDay,
  mapWmoToCondition,
} from "@/utils/weather";

export const WEATHER_MODES = [
  { id: "auto", label: "Auto (Live Real-Time)", icon: "🌐" },
  { id: "clear_day", label: "Sunny Day", icon: "☀️", timeOfDay: "day", condition: "clear" },
  { id: "sunset", label: "Golden Sunset", icon: "🌅", timeOfDay: "sunset", condition: "clear" },
  { id: "clear_night", label: "Clear Night", icon: "🌙", timeOfDay: "night", condition: "clear" },
  { id: "rainy_day", label: "Rainy Day", icon: "🌧️", timeOfDay: "day", condition: "rainy" },
  { id: "rainy_night", label: "Rainy Night", icon: "🌧️🌙", timeOfDay: "night", condition: "rainy" },
  { id: "thunderstorm_night", label: "Night Storm", icon: "⛈️🌙", timeOfDay: "night", condition: "thunderstorm" },
  { id: "snowy_day", label: "Snowy Day", icon: "❄️", timeOfDay: "day", condition: "snowy" },
  { id: "snowy_night", label: "Snowy Night", icon: "❄️🌙", timeOfDay: "night", condition: "snowy" },
  { id: "gloomy_day", label: "Cozy Overcast", icon: "☁️", timeOfDay: "day", condition: "cloudy" },
];

export const useWeatherStore = create((set, get) => ({
  weatherMode: "auto",
  weatherData: null,
  timeString: "",
  currentHour: 12,
  gardenFlowers: ["🌷", "🍄", "🌻", "🌿"],
  flowerWaterCount: 0,

  // Location search & feedback modal
  isLocationModalOpen: false,
  isDetectingGps: false,
  locationFeedback: null,
  locationError: null,
  savedCity: "",
  isLoadingWeather: false,

  setWeatherMode: (mode) => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("devsprout_cottage_weather", mode);
      } catch {}
    }
    set({ weatherMode: mode });
    if (sounds) sounds.playClick();
  },

  cycleWeatherMode: () => {
    const { weatherMode } = get();
    const currIndex = WEATHER_MODES.findIndex((m) => m.id === weatherMode);
    const nextIndex = (currIndex + 1) % WEATHER_MODES.length;
    const nextMode = WEATHER_MODES[nextIndex].id;
    get().setWeatherMode(nextMode);
  },

  updateClock: () => {
    const now = new Date();
    const currentHour = now.getHours();
    const timeString = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    set({ currentHour, timeString });
  },

  fetchWeather: async (forcedCity = null) => {
    const targetCity = forcedCity !== null ? forcedCity : get().savedCity;
    set({ isLoadingWeather: true, locationError: null });
    try {
      const data = await autoDetectAndFetchWeather(targetCity || null);
      if (data) {
        set({ weatherData: data, isLoadingWeather: false });
      }
    } catch (err) {
      console.warn("Weather fetch error:", err);
      set({ isLoadingWeather: false, locationError: "Unable to reach live weather radar." });
    }
  },

  setCity: async (cityName) => {
    if (!cityName || !cityName.trim()) return false;
    const query = cityName.trim();
    set({ isDetectingGps: true, locationError: null, locationFeedback: null });

    try {
      const coord = await searchCityCoordinates(query);
      if (!coord) {
        set({
          locationError: `Could not locate "${query}". Please check the spelling.`,
          isDetectingGps: false,
        });
        return false;
      }

      const weather = await fetchOpenMeteoWeather(coord.latitude, coord.longitude, coord.name);

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("devsprout_weather_city", coord.name);
          localStorage.setItem(
            "devsprout_weather_coords",
            JSON.stringify({
              latitude: coord.latitude,
              longitude: coord.longitude,
              cityName: coord.name,
            })
          );
        } catch {}
      }

      set({
        savedCity: coord.name,
        weatherData: weather,
        isDetectingGps: false,
        locationFeedback: `Set location to ${coord.name}, ${coord.country}! 🌸`,
      });

      if (sounds) sounds.playBellChime();
      return true;
    } catch {
      set({
        locationError: "Could not fetch weather for this city. Please try again.",
        isDetectingGps: false,
      });
      return false;
    }
  },

  detectGPS: async () => {
    set({ isDetectingGps: true, locationError: null, locationFeedback: null });
    try {
      const weather = await detectExactGPSLocation();
      set({
        savedCity: weather.city,
        weatherData: weather,
        isDetectingGps: false,
        locationFeedback: `Accurately located at ${weather.city}! 📍`,
      });
      if (sounds) sounds.playBellChime();
      return true;
    } catch (err) {
      set({
        isDetectingGps: false,
        locationError: err.message || "GPS location permission was denied.",
      });
      return false;
    }
  },

  tendGarden: () => {
    const FLOWER_POOL = ["🌷", "🍄", "🌻", "🌿", "🌹", "🌱", "🌼", "🍓", "🪴", "🌸"];
    if (sounds) sounds.playPop();
    confetti({
      particleCount: 20,
      spread: 40,
      origin: { y: 0.8 },
      colors: ["#7ca954", "#e8a23d", "#f7b297"],
    });

    set((state) => {
      const newFlowers = Array.from({ length: 4 }, () =>
        FLOWER_POOL[Math.floor(Math.random() * FLOWER_POOL.length)]
      );
      return {
        gardenFlowers: newFlowers,
        flowerWaterCount: state.flowerWaterCount + 1,
      };
    });
  },

  openLocationModal: () => set({ isLocationModalOpen: true, locationError: null, locationFeedback: null }),
  closeLocationModal: () => set({ isLocationModalOpen: false }),

  // Hydrate initial weather settings
  initWeatherStore: () => {
    if (typeof window === "undefined") return;
    try {
      const savedMode = localStorage.getItem("devsprout_cottage_weather");
      if (savedMode && WEATHER_MODES.some((m) => m.id === savedMode)) {
        set({ weatherMode: savedMode });
      }

      const savedCity = localStorage.getItem("devsprout_weather_city") || "";
      if (savedCity) set({ savedCity });

      const cached = getCachedWeather();
      if (cached) set({ weatherData: cached });
    } catch {}

    get().updateClock();
    get().fetchWeather();
  },
}));

// Dual-State Selector Hook: Computes both timeOfDay and condition
export function useMeadowAtmosphere() {
  const weatherMode = useWeatherStore((s) => s.weatherMode);
  const weatherData = useWeatherStore((s) => s.weatherData);
  const currentHour = useWeatherStore((s) => s.currentHour);

  // If manual preset mode selected:
  const manualPreset = WEATHER_MODES.find((m) => m.id === weatherMode);
  if (manualPreset && manualPreset.id !== "auto") {
    return {
      timeOfDay: manualPreset.timeOfDay,
      condition: manualPreset.condition,
      isNight: manualPreset.timeOfDay === "night",
      isSunset: manualPreset.timeOfDay === "sunset",
      isDay: manualPreset.timeOfDay === "day",
      isRaining: manualPreset.condition === "rainy" || manualPreset.condition === "thunderstorm",
      isSnowing: manualPreset.condition === "snowy",
      isThunder: manualPreset.condition === "thunderstorm",
      isCloudy: manualPreset.condition === "cloudy",
      isClear: manualPreset.condition === "clear",
      label: manualPreset.label,
      icon: manualPreset.icon,
      isAuto: false,
    };
  }

  // Live Auto Weather: Combine Open-Meteo's solar is_day + local time + precipitation
  const isDayVal = weatherData?.isDay ?? (currentHour >= 6 && currentHour < 19 ? 1 : 0);
  const timeOfDay = calculateTimeOfDay(isDayVal, currentHour);
  const condition = weatherData
    ? mapWmoToCondition(weatherData.wmoCode, weatherData.precipitation)
    : "clear";

  const isNight = timeOfDay === "night";
  const isSunset = timeOfDay === "sunset";
  const isDay = timeOfDay === "day";
  const isRaining = condition === "rainy" || condition === "thunderstorm";
  const isSnowing = condition === "snowy";
  const isThunder = condition === "thunderstorm";
  const isCloudy = condition === "cloudy";
  const isClear = condition === "clear";

  return {
    timeOfDay,
    condition,
    isNight,
    isSunset,
    isDay,
    isRaining,
    isSnowing,
    isThunder,
    isCloudy,
    isClear,
    label: weatherData ? weatherData.description : "Live Weather",
    icon: weatherData ? weatherData.icon : "🌐",
    isAuto: true,
  };
}
