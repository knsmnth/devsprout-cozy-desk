// Open-Meteo Free & Open Source Weather Service (No API key required)

const CACHE_KEY = "devsprout_weather_cache";
const CACHE_DURATION_MS = 15 * 60 * 1000; // 15 minutes cache

// WMO Weather Interpretation Codes to accurate condition
export function mapWmoToCondition(wmoCode, precipitation = 0) {
  // Severe / Thunderstorms
  if (wmoCode >= 95 && wmoCode <= 99) {
    return "thunderstorm";
  }

  // Snow / Freezing rain / Snow showers
  if (
    (wmoCode >= 71 && wmoCode <= 77) ||
    wmoCode === 85 ||
    wmoCode === 86
  ) {
    return "snowy";
  }

  // Drizzle / Rain / Showers / Measurable precipitation
  if (
    precipitation > 0.05 ||
    (wmoCode >= 51 && wmoCode <= 67) ||
    (wmoCode >= 80 && wmoCode <= 82)
  ) {
    return "rainy";
  }

  // Fog / Misty / Overcast
  if (wmoCode === 2 || wmoCode === 3 || wmoCode === 45 || wmoCode === 48) {
    return "cloudy";
  }

  // Clear / Mainly clear
  return "clear";
}

// Calculate Time of Day from Open-Meteo is_day solar flag and local hour
export function calculateTimeOfDay(isDay = 1, currentHour = 12) {
  // is_day from Open-Meteo: 1 = day (sun above horizon), 0 = night
  if (isDay === 0 || currentHour < 6 || currentHour >= 19) {
    return "night";
  }

  // Golden hour / Sunset
  if (currentHour >= 17 && currentHour < 19) {
    return "sunset";
  }

  return "day";
}

// Get user-friendly description and icon
export function getWeatherDescription(wmoCode, timeOfDay = "day") {
  const isNight = timeOfDay === "night";

  switch (wmoCode) {
    case 0:
      return {
        label: isNight ? "clear starry night" : "clear sky",
        icon: isNight ? "🌙" : "☀️",
      };
    case 1:
      return {
        label: isNight ? "mostly clear night" : "mainly clear",
        icon: isNight ? "🌙" : "🌤️",
      };
    case 2:
      return {
        label: isNight ? "partly cloudy night" : "partly cloudy",
        icon: isNight ? "☁️" : "⛅",
      };
    case 3:
      return { label: "cozy overcast", icon: "☁️" };
    case 45:
    case 48:
      return { label: "misty fog", icon: "🌫️" };
    case 51:
    case 53:
    case 55:
      return { label: "gentle drizzle", icon: "🌦️" };
    case 61:
    case 63:
    case 65:
      return { label: "gentle rainfall", icon: "🌧️" };
    case 71:
    case 73:
    case 75:
      return { label: "soft snowfall", icon: "❄️" };
    case 80:
    case 81:
    case 82:
      return { label: "rain showers", icon: "🌧️" };
    case 85:
    case 86:
      return { label: "snow flurries", icon: "🌨️" };
    case 95:
    case 96:
    case 99:
      return { label: "thunderstorm", icon: "⛈️" };
    default:
      return { label: "cozy atmosphere", icon: "🌱" };
  }
}

// Reverse geocoding to resolve exact city / municipality / town
export async function reverseGeocode(latitude, longitude) {
  // Primary: BigDataCloud Locality API
  try {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      const place = data.locality || data.city || data.principalSubdivision;
      if (place) return place;
    }
  } catch (err) {
    console.warn("Reverse geocode primary error:", err);
  }

  // Secondary: Nominatim OSM
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const place =
        addr.city ||
        addr.town ||
        addr.municipality ||
        addr.village ||
        addr.suburb ||
        addr.county;
      if (place) return place;
    }
  } catch {}

  return "My Location";
}

// Fetch live weather from Open-Meteo for latitude & longitude
export async function fetchOpenMeteoWeather(latitude, longitude, cityName = "Current City") {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,weather_code,wind_speed_10m&timezone=auto`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Open-Meteo request failed: ${res.status}`);
  }

  const data = await res.json();
  const current = data.current || {};
  const currentHour = new Date().getHours();

  const wmoCode = current.weather_code ?? 0;
  const isDayVal = current.is_day ?? (currentHour >= 6 && currentHour < 19 ? 1 : 0);
  const tempC = Math.round(current.temperature_2m ?? 24);
  const feelsLikeC = Math.round(current.apparent_temperature ?? tempC);
  const humidity = current.relative_humidity_2m ?? 75;
  const precipitation = (current.precipitation ?? 0) + (current.rain ?? 0) + (current.showers ?? 0);

  const timeOfDay = calculateTimeOfDay(isDayVal, currentHour);
  const condition = mapWmoToCondition(wmoCode, precipitation);
  const info = getWeatherDescription(wmoCode, timeOfDay);

  const result = {
    city: cityName,
    latitude,
    longitude,
    temp: tempC,
    feelsLike: feelsLikeC,
    humidity,
    precipitation,
    wmoCode,
    isDay: isDayVal,
    timeOfDay,
    condition,
    description: info.label,
    icon: info.icon,
    fetchedAt: Date.now(),
  };

  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(result));
  } catch {}

  return result;
}

// Search coordinates by city/town name using Open-Meteo Geocoding API
export async function searchCityCoordinates(cityName) {
  if (!cityName || !cityName.trim()) return null;
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    cityName.trim()
  )}&count=5&language=en&format=json`;

  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  if (data.results && data.results.length > 0) {
    const item = data.results[0];
    return {
      name: item.name,
      country: item.country_code || item.country || "",
      latitude: item.latitude,
      longitude: item.longitude,
    };
  }
  return null;
}

// Request exact device GPS location, reverse-geocode to real city, and fetch weather
export async function detectExactGPSLocation() {
  if (typeof window === "undefined" || !("geolocation" in navigator)) {
    throw new Error("Geolocation is not supported by your browser.");
  }

  const position = await new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    });
  });

  const { latitude, longitude } = position.coords;
  const exactCity = await reverseGeocode(latitude, longitude);

  try {
    localStorage.setItem("devsprout_weather_city", exactCity);
    localStorage.setItem(
      "devsprout_weather_coords",
      JSON.stringify({ latitude, longitude, cityName: exactCity })
    );
  } catch {}

  return await fetchOpenMeteoWeather(latitude, longitude, exactCity);
}

// Retrieve cached weather if still fresh (15 minutes)
export function getCachedWeather() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cached = JSON.parse(raw);
    if (Date.now() - cached.fetchedAt < CACHE_DURATION_MS) {
      return cached;
    }
  } catch {}
  return null;
}

// Auto-detect location & fetch weather with reliable fallback cascade
export async function autoDetectAndFetchWeather(preferredCity = null) {
  // 1. Saved GPS coordinates from user
  if (typeof window !== "undefined") {
    try {
      const savedCoordsRaw = localStorage.getItem("devsprout_weather_coords");
      if (savedCoordsRaw) {
        const savedCoords = JSON.parse(savedCoordsRaw);
        if (savedCoords?.latitude && savedCoords?.longitude) {
          if (!preferredCity || preferredCity === savedCoords.cityName) {
            return await fetchOpenMeteoWeather(
              savedCoords.latitude,
              savedCoords.longitude,
              savedCoords.cityName || "My Location"
            );
          }
        }
      }
    } catch {}
  }

  // 2. User's custom preferred city
  if (preferredCity) {
    const cityCoord = await searchCityCoordinates(preferredCity);
    if (cityCoord) {
      return await fetchOpenMeteoWeather(
        cityCoord.latitude,
        cityCoord.longitude,
        cityCoord.name
      );
    }
  }

  // 3. Return fresh cached weather if available
  const cached = getCachedWeather();
  if (cached) return cached;

  // 4. Fast device GPS if already granted
  if (typeof window !== "undefined" && "geolocation" in navigator) {
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 3500,
          maximumAge: 60000,
        });
      });
      const { latitude, longitude } = position.coords;
      const exactCity = await reverseGeocode(latitude, longitude);
      return await fetchOpenMeteoWeather(latitude, longitude, exactCity);
    } catch {
      // Permission prompt dismissed or timed out
    }
  }

  // 5. Accurate IP Geolocation fallback via ipwho.is
  try {
    const res = await fetch("https://ipwho.is/");
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.latitude && data.longitude) {
        const cityLabel = data.city || data.region || "Local Area";
        return await fetchOpenMeteoWeather(data.latitude, data.longitude, cityLabel);
      }
    }
  } catch {}

  // 6. Secondary IP fallback via ipapi.co
  try {
    const ipRes = await fetch("https://ipapi.co/json/");
    if (ipRes.ok) {
      const ipData = await ipRes.json();
      if (ipData.latitude && ipData.longitude) {
        return await fetchOpenMeteoWeather(
          ipData.latitude,
          ipData.longitude,
          ipData.city || "Local Area"
        );
      }
    }
  } catch {}

  // 7. Safe default fallback
  return await fetchOpenMeteoWeather(14.5995, 120.9842, "Philippines");
}
