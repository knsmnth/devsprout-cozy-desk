"use client";

import React, { useState, useMemo, useRef } from "react";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Shuffle,
  Repeat,
  Heart,
  Search,
  Volume2,
  VolumeX,
  X,
  ChevronLeft,
  Sparkles,
} from "lucide-react";
import { useMusicStore } from "@/store/useMusicStore";
import { useTaskStore } from "@/store/useTaskStore";
import {
  COZY_ARTISTS,
  COZY_PLAYLISTS,
  COZY_TRACKS,
  formatAudioTime,
} from "@/utils/musicCatalog";
import styles from "./MusicHubModal.module.css";

export default function MusicHubModal() {
  const isMusicHubOpen = useMusicStore((state) => state.isMusicHubOpen);
  const closeMusicHub = useMusicStore((state) => state.closeMusicHub);
  const activeHubTab = useMusicStore((state) => state.activeHubTab);
  const setActiveHubTab = useMusicStore((state) => state.setActiveHubTab);

  // Playback state
  const currentTrack = useMusicStore((state) => state.currentTrack);
  const isPlaying = useMusicStore((state) => state.isPlaying);
  const isLoading = useMusicStore((state) => state.isLoading);
  const currentTime = useMusicStore((state) => state.currentTime);
  const duration = useMusicStore((state) => state.duration);
  const volume = useMusicStore((state) => state.volume);
  const isMuted = useMusicStore((state) => state.isMuted);
  const isShuffle = useMusicStore((state) => state.isShuffle);
  const isRepeat = useMusicStore((state) => state.isRepeat);
  const favorites = useMusicStore((state) => state.favorites);

  // Actions
  const playTrack = useMusicStore((state) => state.playTrack);
  const togglePlay = useMusicStore((state) => state.togglePlay);
  const nextTrack = useMusicStore((state) => state.nextTrack);
  const prevTrack = useMusicStore((state) => state.prevTrack);
  const seek = useMusicStore((state) => state.seek);
  const setVolume = useMusicStore((state) => state.setVolume);
  const toggleMute = useMusicStore((state) => state.toggleMute);
  const toggleShuffle = useMusicStore((state) => state.toggleShuffle);
  const cycleRepeat = useMusicStore((state) => state.cycleRepeat);
  const toggleFavorite = useMusicStore((state) => state.toggleFavorite);

  // Filters
  const selectedArtistId = useMusicStore((state) => state.selectedArtistId);
  const setSelectedArtistId = useMusicStore((state) => state.setSelectedArtistId);
  const selectedPlaylistId = useMusicStore((state) => state.selectedPlaylistId);
  const setSelectedPlaylistId = useMusicStore((state) => state.setSelectedPlaylistId);
  const searchQuery = useMusicStore((state) => state.searchQuery);
  const setSearchQuery = useMusicStore((state) => state.setSearchQuery);

  // Task Store ambient noises & sound effects
  const sounds = useTaskStore((state) => state.sounds);
  const [activeAmbient, setActiveAmbient] = useState(null);

  const scrubberRef = useRef(null);

  const handleToggleAmbient = (type) => {
    if (!sounds) return;
    if (activeAmbient === type) {
      sounds.stopAmbient();
      setActiveAmbient(null);
    } else {
      sounds.playAmbient(type);
      setActiveAmbient(type);
    }
  };

  // Filtered tracks
  const filteredTracks = useMemo(() => {
    return COZY_TRACKS.filter((track) => {
      if (selectedArtistId && track.artistId !== selectedArtistId) return false;
      if (selectedPlaylistId && track.playlistId !== selectedPlaylistId) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = track.title.toLowerCase().includes(query);
        const matchesArtist = track.artist.toLowerCase().includes(query);
        const matchesMood = track.mood.toLowerCase().includes(query);
        return matchesTitle || matchesArtist || matchesMood;
      }
      return true;
    });
  }, [selectedArtistId, selectedPlaylistId, searchQuery]);

  if (!isMusicHubOpen) return null;

  // Handle Scrubbing Click / Drag
  const handleScrubberClick = (e) => {
    if (!scrubberRef.current || !duration) return;
    const rect = scrubberRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    seek(ratio * duration);
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const isCurrentFavorite = currentTrack ? favorites.includes(currentTrack.id) : false;

  return (
    <div className={styles.modalOverlay} onClick={closeMusicHub}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        {/* Top Header */}
        <div className={styles.modalHeader}>
          <div className={styles.headerLeft}>
            {activeHubTab === "player" ? (
              <button
                type="button"
                className={styles.navIconBtn}
                onClick={() => {
                  if (sounds) sounds.playClick();
                  setActiveHubTab("browse");
                }}
                title="Back to Browser"
              >
                <ChevronLeft size={18} />
              </button>
            ) : (
              <div className={styles.headerTitle}>
                <span>🍯</span>
                <span>Sprout Audio</span>
              </div>
            )}

            {/* Quick View Switcher Pill */}
            <div className={styles.tabPillGroup}>
              <button
                type="button"
                className={`${styles.tabPill} ${activeHubTab === "browse" ? styles.tabPillActive : ""}`}
                onClick={() => {
                  if (sounds) sounds.playClick();
                  setActiveHubTab("browse");
                }}
              >
                Discover
              </button>
              <button
                type="button"
                className={`${styles.tabPill} ${activeHubTab === "player" ? styles.tabPillActive : ""}`}
                onClick={() => {
                  if (sounds) sounds.playClick();
                  setActiveHubTab("player");
                }}
              >
                Now Playing
              </button>
            </div>
          </div>

          <button
            type="button"
            className={styles.closeBtn}
            onClick={() => {
              if (sounds) sounds.playClick();
              closeMusicHub();
            }}
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className={styles.modalBody}>
          {activeHubTab === "browse" ? (
            /* ======================================================== */
            /* VIEW A: DISCOVER & BROWSE (Right Phone Inspiration)      */
            /* ======================================================== */
            <>
              {/* Cozy Greeting Card */}
              <div className={styles.greetingCard}>
                <span className={styles.greetingStars}>✨⭐️</span>
                <div className={styles.greetingTitle}>Hello, Cozy Dev!</div>
                <p className={styles.greetingSubtitle}>
                  Let&apos;s listen to something cool and relaxing today 🍯
                </p>

                {/* Search Bar */}
                <div className={styles.searchBox}>
                  <Search size={14} color="#8c7865" />
                  <input
                    type="text"
                    className={styles.searchInput}
                    placeholder="Search songs, artists, or moods..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      style={{ background: "transparent", border: "none", cursor: "pointer" }}
                      onClick={() => setSearchQuery("")}
                    >
                      <X size={13} color="#8c7865" />
                    </button>
                  )}
                </div>
              </div>

              {/* Section 1: Favorite Artists Horizontal Avatars */}
              <div>
                <div className={styles.sectionHeader}>
                  <div className={styles.sectionTitle}>
                    <span>🎨</span> Your Favorite Artists
                  </div>
                  {selectedArtistId && (
                    <button
                      type="button"
                      className={styles.clearFilterBtn}
                      onClick={() => setSelectedArtistId(null)}
                    >
                      Show All
                    </button>
                  )}
                </div>

                <div className={styles.artistAvatarScroll}>
                  {COZY_ARTISTS.map((artist) => {
                    const isActive = selectedArtistId === artist.id;
                    return (
                      <button
                        key={artist.id}
                        type="button"
                        className={`${styles.artistItem} ${isActive ? styles.artistItemActive : ""}`}
                        onClick={() => {
                          if (sounds) sounds.playClick();
                          setSelectedArtistId(artist.id);
                        }}
                        title={`${artist.name} • ${artist.tagline}`}
                      >
                        <div
                          className={styles.artistAvatarCircle}
                          style={{
                            backgroundColor: artist.avatarBg,
                            borderColor: isActive ? "#f7d770" : artist.borderColor,
                          }}
                        >
                          {artist.avatar}
                        </div>
                        <span className={styles.artistName}>{artist.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Section 2: "Mixed for you" Playlists Grid */}
              <div>
                <div className={styles.sectionHeader}>
                  <div className={styles.sectionTitle}>
                    <span>☕</span> Mixed for you
                  </div>
                  {selectedPlaylistId && (
                    <button
                      type="button"
                      className={styles.clearFilterBtn}
                      onClick={() => setSelectedPlaylistId(null)}
                    >
                      Show All
                    </button>
                  )}
                </div>

                <div className={styles.playlistCardsScroll}>
                  {COZY_PLAYLISTS.map((pl) => {
                    const isActive = selectedPlaylistId === pl.id;
                    return (
                      <div
                        key={pl.id}
                        className={`${styles.playlistCard} ${isActive ? styles.playlistCardActive : ""}`}
                        style={{
                          backgroundColor: pl.bgColor,
                          borderColor: pl.borderColor,
                        }}
                        onClick={() => {
                          if (sounds) sounds.playClick();
                          setSelectedPlaylistId(pl.id);
                        }}
                      >
                        <div className={styles.playlistTop}>
                          <span className={styles.playlistIcon}>{pl.icon}</span>
                          <span
                            className={styles.playlistBadge}
                            style={{ color: pl.accentColor }}
                          >
                            {pl.badge}
                          </span>
                        </div>
                        <div>
                          <div className={styles.playlistTitle}>{pl.title}</div>
                          <div className={styles.playlistDesc}>{pl.subtitle}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Section 3: Song Catalog */}
              <div>
                <div className={styles.sectionHeader}>
                  <div className={styles.sectionTitle}>
                    <span>🎵</span> Cozy Tracklist ({filteredTracks.length})
                  </div>
                </div>

                <div className={styles.trackList}>
                  {filteredTracks.map((track) => {
                    const isTrackCurrent = currentTrack?.id === track.id;
                    const isTrackPlaying = isTrackCurrent && isPlaying;
                    const isFav = favorites.includes(track.id);

                    return (
                      <div
                        key={track.id}
                        className={`${styles.trackRow} ${isTrackCurrent ? styles.trackRowActive : ""}`}
                        onClick={() => {
                          if (sounds) sounds.playClick();
                          playTrack(track);
                        }}
                      >
                        <div className={styles.trackLeft}>
                          <div
                            className={styles.trackCoverThumb}
                            style={{
                              backgroundColor: track.cover.primaryColor,
                              borderColor: track.cover.accentColor,
                            }}
                          >
                            {track.cover.icon}
                          </div>
                          <div className={styles.trackMeta}>
                            <div className={styles.trackTitle}>
                              {isTrackPlaying && <span>♫ </span>}
                              {track.title}
                            </div>
                            <div className={styles.trackArtist}>
                              <span>{track.artist}</span>
                              {track.isLive && (
                                <span className={styles.liveBadge}>LIVE</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className={styles.trackRight}>
                          <span className={styles.trackDuration}>
                            {track.isLive ? "Stream" : formatAudioTime(track.duration)}
                          </span>

                          <button
                            type="button"
                            className={`${styles.heartBtn} ${isFav ? styles.heartBtnActive : ""}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (sounds) sounds.playPop();
                              toggleFavorite(track.id);
                            }}
                            title={isFav ? "Remove from favorites" : "Add to favorites"}
                          >
                            <Heart size={15} fill={isFav ? "currentColor" : "none"} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Floating Bottom Mini Player Arch (Inspired by Reference Image) */}
              {currentTrack && (
                <div
                  className={styles.miniPlayerArch}
                  onClick={() => {
                    if (sounds) sounds.playClick();
                    setActiveHubTab("player");
                  }}
                  title="Click to expand full player"
                >
                  <div className={styles.miniArchLeft}>
                    <button
                      type="button"
                      className={`${styles.heartBtn} ${isCurrentFavorite ? styles.heartBtnActive : ""}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (sounds) sounds.playPop();
                        toggleFavorite(currentTrack.id);
                      }}
                    >
                      <Heart size={16} fill={isCurrentFavorite ? "currentColor" : "none"} />
                    </button>

                    <div
                      className={`${styles.miniDiscThumb} ${isPlaying ? styles.miniDiscRotating : ""}`}
                    >
                      {currentTrack.cover.icon}
                    </div>

                    <div className={styles.miniArchInfo}>
                      <span className={styles.miniArchTitle}>{currentTrack.title}</span>
                      <span className={styles.miniArchArtist}>{currentTrack.artist}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className={styles.miniArchPlayBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (sounds) sounds.playClick();
                      togglePlay();
                    }}
                    title={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? <Pause size={17} /> : <Play size={17} />}
                  </button>
                </div>
              )}
            </>
          ) : (
            /* ======================================================== */
            /* VIEW B: FULL NOW PLAYING VIEW (Left Phone Inspiration)   */
            /* ======================================================== */
            <div className={styles.playerContainer}>
              {/* Framed Album Art Card */}
              <div
                className={styles.albumFrame}
                style={{
                  background: `linear-gradient(145deg, ${currentTrack?.cover.primaryColor || "#fff9e6"} 0%, #fff1ba 100%)`,
                }}
              >
                <div className={styles.albumDoodleStars}>
                  <span className={styles.starDoodle1}>⭐️</span>
                  <span className={styles.starDoodle2}>✨</span>
                  <span className={styles.starDoodle3}>⭐️</span>
                </div>

                <div className={styles.albumCenterIcon}>
                  {currentTrack?.cover.icon || "🍋"}
                </div>

                <div className={styles.albumMoodBadge}>
                  {currentTrack?.mood || "Cozy Music"}
                </div>
              </div>

              {/* Title & Artist Row with Heart Favorite */}
              <div className={styles.playerInfoRow}>
                <div className={styles.playerTitles}>
                  <div className={styles.playerSongTitle}>
                    {currentTrack?.title || "No Track Selected"}
                  </div>
                  <div className={styles.playerArtistName}>
                    {currentTrack?.artist || "DevSprout"}
                  </div>
                </div>

                {currentTrack && (
                  <button
                    type="button"
                    className={`${styles.playerHeartBtn} ${isCurrentFavorite ? styles.playerHeartBtnActive : ""}`}
                    onClick={() => {
                      if (sounds) sounds.playPop();
                      toggleFavorite(currentTrack.id);
                    }}
                    title={isCurrentFavorite ? "Favorited" : "Mark as Favorite"}
                  >
                    <Heart size={20} fill={isCurrentFavorite ? "currentColor" : "none"} />
                  </button>
                )}
              </div>

              {/* Star-Thumb Scrubber */}
              <div className={styles.scrubberContainer}>
                <div
                  ref={scrubberRef}
                  className={styles.scrubberTrackWrapper}
                  onClick={handleScrubberClick}
                >
                  <div className={styles.scrubberTrack}>
                    <div
                      className={styles.scrubberFill}
                      style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
                    />
                  </div>
                  {/* Whimsical Star Thumb (Direct match to reference image!) */}
                  <div
                    className={styles.scrubberStarThumb}
                    style={{ left: `${Math.min(100, Math.max(0, progressPercent))}%` }}
                  >
                    ⭐️
                  </div>
                </div>

                <div className={styles.scrubberTimes}>
                  <span>{formatAudioTime(currentTime)}</span>
                  <span>
                    {currentTrack?.isLive ? "Live Stream" : formatAudioTime(duration)}
                  </span>
                </div>
              </div>

              {/* Playback Control Deck (Shuffle, Prev, Play/Pause, Next, Loop) */}
              <div className={styles.controlDeck}>
                <button
                  type="button"
                  className={`${styles.deckAuxBtn} ${isShuffle ? styles.deckAuxActive : ""}`}
                  onClick={() => {
                    if (sounds) sounds.playClick();
                    toggleShuffle();
                  }}
                  title={isShuffle ? "Shuffle On" : "Shuffle Off"}
                >
                  <Shuffle size={18} />
                </button>

                <button
                  type="button"
                  className={styles.deckSkipBtn}
                  onClick={() => {
                    if (sounds) sounds.playClick();
                    prevTrack();
                  }}
                  title="Previous Track"
                >
                  <SkipBack size={18} />
                </button>

                <button
                  type="button"
                  className={styles.deckMainPlayBtn}
                  onClick={() => {
                    if (sounds) sounds.playClick();
                    togglePlay();
                  }}
                  title={isPlaying ? "Pause" : "Play"}
                >
                  {isLoading ? (
                    <Sparkles size={26} className={styles.miniDiscRotating} />
                  ) : isPlaying ? (
                    <Pause size={28} />
                  ) : (
                    <Play size={28} style={{ marginLeft: 3 }} />
                  )}
                </button>

                <button
                  type="button"
                  className={styles.deckSkipBtn}
                  onClick={() => {
                    if (sounds) sounds.playClick();
                    nextTrack();
                  }}
                  title="Next Track"
                >
                  <SkipForward size={18} />
                </button>

                <button
                  type="button"
                  className={`${styles.deckAuxBtn} ${isRepeat !== "off" ? styles.deckAuxActive : ""}`}
                  onClick={() => {
                    if (sounds) sounds.playClick();
                    cycleRepeat();
                  }}
                  title={`Repeat: ${isRepeat}`}
                >
                  <Repeat size={18} />
                  {isRepeat === "one" && <span className={styles.repeatOneBadge}>1</span>}
                </button>
              </div>

              {/* Volume Slider & Ambient Mix Overlay */}
              <div className={styles.volumeAndAmbientRow}>
                <div className={styles.volumeGroup}>
                  <button
                    type="button"
                    style={{ background: "transparent", border: "none", cursor: "pointer", color: "inherit" }}
                    onClick={toggleMute}
                    title={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.02"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className={styles.volumeSlider}
                    title={`Volume: ${Math.round(volume * 100)}%`}
                  />
                </div>

                <div className={styles.ambientQuickToggles}>
                  <button
                    type="button"
                    className={`${styles.ambientMiniBtn} ${activeAmbient === "rain" ? styles.ambientMiniActive : ""}`}
                    onClick={() => handleToggleAmbient("rain")}
                    title="Toggle Rooftop Rain Layer"
                  >
                    🌧️ Rain
                  </button>
                  <button
                    type="button"
                    className={`${styles.ambientMiniBtn} ${activeAmbient === "cafe" ? styles.ambientMiniActive : ""}`}
                    onClick={() => handleToggleAmbient("cafe")}
                    title="Toggle Warm Cafe Layer"
                  >
                    ☕ Cafe
                  </button>
                </div>
              </div>

              {/* Bottom Decorative Citrus Arch (Inspired by Reference Image) */}
              <div className={styles.bottomDecorativeArch}>
                <div className={styles.citrusArch}>
                  <span>✨</span>
                  <span>{currentTrack?.cover.icon || "🍋"}</span>
                  <span>✨</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
