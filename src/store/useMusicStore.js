import { create } from "zustand";
import { COZY_TRACKS } from "@/utils/musicCatalog";

const STORAGE_KEY_FAVORITES = "devsprout_music_favorites";
const STORAGE_KEY_VOLUME = "devsprout_music_volume";
const STORAGE_KEY_SHUFFLE = "devsprout_music_shuffle";
const STORAGE_KEY_REPEAT = "devsprout_music_repeat";

// Load safe initial values from localStorage
const getSavedFavorites = () => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FAVORITES);
    return raw ? JSON.parse(raw) : ["track-lemon-tree", "track-algorithms"];
  } catch {
    return ["track-lemon-tree", "track-algorithms"];
  }
};

const getSavedVolume = () => {
  if (typeof window === "undefined") return 0.85;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_VOLUME);
    return raw !== null ? Number(raw) : 0.85;
  } catch {
    return 0.85;
  }
};

export const useMusicStore = create((set, get) => ({
  // Core Track & Playback State
  tracks: COZY_TRACKS,
  currentTrack: COZY_TRACKS[0],
  isPlaying: false,
  isLoading: false,
  currentTime: 0,
  duration: COZY_TRACKS[0].duration || 172,
  volume: getSavedVolume(),
  isMuted: false,
  isShuffle: false,
  isRepeat: "all", // "off" | "all" | "one"
  favorites: getSavedFavorites(),

  // Navigation & Filtering
  isMusicHubOpen: false,
  activeHubTab: "browse", // "browse" | "player"
  selectedArtistId: null,
  selectedPlaylistId: null,
  searchQuery: "",

  // Actions
  openMusicHub: (tab = "browse") => {
    set({ isMusicHubOpen: true, activeHubTab: tab });
  },

  closeMusicHub: () => {
    set({ isMusicHubOpen: false });
  },

  setActiveHubTab: (tab) => {
    set({ activeHubTab: tab });
  },

  playTrack: (track) => {
    const { currentTrack, isPlaying } = get();
    if (currentTrack && currentTrack.id === track.id) {
      // Toggle play if same track
      set({ isPlaying: !isPlaying });
    } else {
      set({
        currentTrack: track,
        currentTime: 0,
        duration: track.duration || 0,
        isPlaying: true,
        isLoading: true,
      });
    }
  },

  togglePlay: () => {
    const { isPlaying, currentTrack } = get();
    if (!currentTrack && COZY_TRACKS.length > 0) {
      set({ currentTrack: COZY_TRACKS[0], isPlaying: true, currentTime: 0 });
    } else {
      set({ isPlaying: !isPlaying });
    }
  },

  nextTrack: () => {
    const { tracks, currentTrack, isShuffle, isRepeat } = get();
    if (tracks.length === 0) return;

    if (isRepeat === "one") {
      set({ currentTime: 0, isPlaying: true });
      return;
    }

    if (isShuffle) {
      const remaining = tracks.filter((t) => t.id !== currentTrack?.id);
      const randomTrack = remaining.length > 0
        ? remaining[Math.floor(Math.random() * remaining.length)]
        : tracks[0];
      set({
        currentTrack: randomTrack,
        currentTime: 0,
        duration: randomTrack.duration || 0,
        isPlaying: true,
        isLoading: true,
      });
      return;
    }

    const currentIndex = tracks.findIndex((t) => t.id === currentTrack?.id);
    const nextIndex = (currentIndex + 1) % tracks.length;
    const next = tracks[nextIndex];

    set({
      currentTrack: next,
      currentTime: 0,
      duration: next.duration || 0,
      isPlaying: true,
      isLoading: true,
    });
  },

  prevTrack: () => {
    const { tracks, currentTrack, currentTime } = get();
    if (tracks.length === 0) return;

    // If more than 3 seconds in, restart the current track first
    if (currentTime > 3) {
      set({ currentTime: 0 });
      return;
    }

    const currentIndex = tracks.findIndex((t) => t.id === currentTrack?.id);
    const prevIndex = (currentIndex - 1 + tracks.length) % tracks.length;
    const prev = tracks[prevIndex];

    set({
      currentTrack: prev,
      currentTime: 0,
      duration: prev.duration || 0,
      isPlaying: true,
      isLoading: true,
    });
  },

  seek: (seconds) => {
    const { duration } = get();
    const clamped = Math.max(0, Math.min(seconds, duration || 0));
    set({ currentTime: clamped });
    // Signal to controller to update audio.currentTime
    if (typeof window !== "undefined" && window.__devsprout_audio_el) {
      window.__devsprout_audio_el.currentTime = clamped;
    }
  },

  setVolume: (val) => {
    const clamped = Math.max(0, Math.min(val, 1));
    set({ volume: clamped, isMuted: clamped === 0 });
    try {
      localStorage.setItem(STORAGE_KEY_VOLUME, String(clamped));
    } catch {}
    if (typeof window !== "undefined" && window.__devsprout_audio_el) {
      window.__devsprout_audio_el.volume = clamped;
    }
  },

  toggleMute: () => {
    const { isMuted, volume } = get();
    const nextMuted = !isMuted;
    set({ isMuted: nextMuted });
    if (typeof window !== "undefined" && window.__devsprout_audio_el) {
      window.__devsprout_audio_el.volume = nextMuted ? 0 : volume;
    }
  },

  toggleShuffle: () => {
    const next = !get().isShuffle;
    set({ isShuffle: next });
    try {
      localStorage.setItem(STORAGE_KEY_SHUFFLE, String(next));
    } catch {}
  },

  cycleRepeat: () => {
    const current = get().isRepeat;
    const next = current === "all" ? "one" : current === "one" ? "off" : "all";
    set({ isRepeat: next });
    try {
      localStorage.setItem(STORAGE_KEY_REPEAT, next);
    } catch {}
  },

  toggleFavorite: (trackId) => {
    const { favorites } = get();
    const exists = favorites.includes(trackId);
    const updated = exists
      ? favorites.filter((id) => id !== trackId)
      : [...favorites, trackId];
    set({ favorites: updated });
    try {
      localStorage.setItem(STORAGE_KEY_FAVORITES, JSON.stringify(updated));
    } catch {}
  },

  setSelectedArtistId: (artistId) => {
    set((state) => ({
      selectedArtistId: state.selectedArtistId === artistId ? null : artistId,
      selectedPlaylistId: null, // clear playlist filter when filtering artist
    }));
  },

  setSelectedPlaylistId: (playlistId) => {
    set((state) => ({
      selectedPlaylistId: state.selectedPlaylistId === playlistId ? null : playlistId,
      selectedArtistId: null, // clear artist filter when filtering playlist
    }));
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },

  // Internal callbacks for Audio Controller
  _syncPlaybackState: (time, duration) => {
    set({
      currentTime: time,
      duration: duration || get().duration,
      isLoading: false,
    });
  },

  _setIsPlaying: (isPlaying) => {
    set({ isPlaying, isLoading: false });
  },

  _setIsLoading: (isLoading) => {
    set({ isLoading });
  },
}));
