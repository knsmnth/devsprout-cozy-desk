// Open-Meteo Free & Open Source Weather Service (No API key required)

const CACHE_KEY = "devsprout_weather_cache";
const CACHE_DURATION_MS = 15 * 60 * 1000; // 15 minutes cache

// WMO Weather Interpretation Codes to Cozy Meadow States
export function mapWmoCodeToMeadow(wmoCode, isDay = 1, currentHour = 12) {
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

// Free reverse geocoding to resolve exact town/city name from latitude and longitude
export async function reverseGeocode(latitude, longitude) {
  try {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      const place = data.city || data.locality || data.principalSubdivision;
      if (place) {
        return place;
      }
    }
  } catch (err) {
    console.warn("Reverse geocode primary error:", err);
  }

  // Fallback: OpenStreetMap Nominatim
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const place = addr.city || addr.town || addr.municipality || addr.village || addr.suburb || addr.county;
      if (place) return place;
    }
  } catch {}

  return "My Location";
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

// Search coordinates by city/town name using Open-Meteo Geocoding API
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

// Request exact device GPS location, reverse-geocode to real city, and fetch weather
export async function detectExactGPSLocation() {
  if (typeof window === "undefined" || !("geolocation" in navigator)) {
    throw new Error("Geolocation is not supported by your browser.");
  }

  const position = await new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 12000,
      maximumAge: 0,
    });
  });

  const { latitude, longitude } = position.coords;
  const exactCity = await reverseGeocode(latitude, longitude);

  // Save exact location & coords to local storage
  try {
    localStorage.setItem("devsprout_weather_city", exactCity);
    localStorage.setItem(
      "devsprout_weather_coords",
      JSON.stringify({ latitude, longitude, cityName: exactCity })
    );
  } catch {}

  return await fetchOpenMeteoWeather(latitude, longitude, exactCity);
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
  // Check if exact GPS coords were previously saved
  if (typeof window !== "undefined") {
    try {
      const savedCoordsRaw = localStorage.getItem("devsprout_weather_coords");
      if (savedCoordsRaw) {
        const savedCoords = JSON.parse(savedCoordsRaw);
        if (savedCoords?.latitude && savedCoords?.longitude) {
          // If preferredCity is same or empty, reuse saved GPS coords directly
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

  // If user has a custom city name, geocode that city
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

  // Try cached weather if fresh
  const cached = getCachedWeather();
  if (cached) return cached;

  // Try browser GPS
  if (typeof window !== "undefined" && "geolocation" in navigator) {
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 4000,
          maximumAge: 60000,
        });
      });
      const { latitude, longitude } = position.coords;
      const exactCity = await reverseGeocode(latitude, longitude);
      return await fetchOpenMeteoWeather(latitude, longitude, exactCity);
    } catch {
      // GPS not granted or timed out
    }
  }

  // Fallback: IP geolocation lookup
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

  // Final fallback
  return await fetchOpenMeteoWeather(14.5995, 120.9842, "Philippines");
}
