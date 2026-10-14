// Open-Meteo Free & Open Source Weather Service (No API key required)

const CACHE_KEY = "devsprout_weather_cache";
const CACHE_DURATION_MS = 15 * 60 * 1000; // 15 minutes cache

// WMO Weather Interpretation Codes to Cozy Meadow States
export function mapWmoCodeToMeadow(wmoCode, isDay = 1, currentHour = 12) {
  // If night (isDay === 0 or hour < 6 or hour >= 19)
  const isNight = isDay === 0 || currentHour < 6 || currentHour >= 19;
  const isSunset = currentHour >= 17 && currentHour < 19 && isDay !== 0;

  // Clear / Mainly clear
  if (wmoCode === 0 || wmoCode === 1) {
    if (isNight) return "dark";
    if (isSunset) return "sunset";
    return "sunny";
  }

  // Partly cloudy / Overcast
  if (wmoCode === 2 || wmoCode === 3) {
    if (isNight) return "dark";
    return "gloomy";
  }

  // Fog / Misty
  if (wmoCode === 45 || wmoCode === 48) {
    if (isNight) return "dark";
    return "gloomy";
  }

  // Drizzle / Rain / Showers / Thunderstorms
  if (
    (wmoCode >= 51 && wmoCode <= 67) ||
    (wmoCode >= 80 && wmoCode <= 82) ||
    (wmoCode >= 95 && wmoCode <= 99)
  ) {
    return "rainy";
  }

  // Snow / Freezing rain / Snow showers
  if (
    (wmoCode >= 71 && wmoCode <= 77) ||
    (wmoCode >= 85 && wmoCode <= 86)
  ) {
    return "snowy";
  }

  // Fallback based on time of day
  if (isNight) return "dark";
  if (isSunset) return "sunset";
  return "sunny";
}

// Get user-friendly description and icon
export function getWeatherDescription(wmoCode) {
  switch (wmoCode) {
    case 0:
      return { label: "clear sky", icon: "☀️" };
    case 1:
      return { label: "mainly clear", icon: "🌤️" };
    case 2:
      return { label: "partly cloudy", icon: "⛅" };
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

// Fetch weather from Open-Meteo for latitude & longitude
export async function fetchOpenMeteoWeather(latitude, longitude, cityName = "Current City") {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,is_day,weather_code&timezone=auto`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Open-Meteo request failed: ${res.status}`);
  }

  const data = await res.json();
  const current = data.current || {};
  const currentHour = new Date().getHours();

  const wmoCode = current.weather_code ?? 0;
  const isDay = current.is_day ?? (currentHour >= 6 && currentHour < 19 ? 1 : 0);
  const tempC = Math.round(current.temperature_2m ?? 22);
  const meadowAtmosphere = mapWmoCodeToMeadow(wmoCode, isDay, currentHour);
  const info = getWeatherDescription(wmoCode);

  const result = {
    city: cityName,
    latitude,
    longitude,
    temp: tempC,
    wmoCode,
    isDay,
    atmosphere: meadowAtmosphere,
    description: info.label,
    icon: info.icon,
    fetchedAt: Date.now(),
  };

  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(result));
  } catch {}

  return result;
}

// Search coordinates by city name using Open-Meteo Geocoding API
export async function searchCityCoordinates(cityName) {
  if (!cityName || !cityName.trim()) return null;
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName.trim())}&count=1&language=en&format=json`;

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

// Retrieve cached weather if valid
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

// Auto-detect location & fetch weather
export async function autoDetectAndFetchWeather(preferredCity = null) {
  // If user has a saved city, search that first
  if (preferredCity) {
    const cityCoord = await searchCityCoordinates(preferredCity);
    if (cityCoord) {
      return await fetchOpenMeteoWeather(
        cityCoord.latitude,
        cityCoord.longitude,
        `${cityCoord.name}${cityCoord.country ? `, ${cityCoord.country}` : ""}`
      );
    }
  }

  // Try cached weather if fresh
  const cached = getCachedWeather();
  if (cached) return cached;

  // Try browser GPS with timeout
  if (typeof window !== "undefined" && "geolocation" in navigator) {
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 5000,
          maximumAge: 60000,
        });
      });
      return await fetchOpenMeteoWeather(
        position.coords.latitude,
        position.coords.longitude,
        "Local Area"
      );
    } catch {
      // GPS denied or timed out; proceed to IP fallback
    }
  }

  // Fallback: Free IP geolocation lookup
  try {
    const ipRes = await fetch("https://ipapi.co/json/");
    if (ipRes.ok) {
      const ipData = await ipRes.json();
      if (ipData.latitude && ipData.longitude) {
        return await fetchOpenMeteoWeather(
          ipData.latitude,
          ipData.longitude,
          ipData.city || "Local Town"
        );
      }
    }
  } catch {}

  // Safe universal fallback (Tokyo / Cozy Default)
  return await fetchOpenMeteoWeather(35.6762, 139.6503, "Sprout Meadow");
}
