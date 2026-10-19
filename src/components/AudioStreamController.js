"use client";

import { useEffect, useRef } from "react";
import { useMusicStore } from "@/store/useMusicStore";

/**
 * Headless Singleton Audio Stream Controller.
 * Handles HTML5 audio playback, streaming synchronization, seeking, and queue progression.
 */
export default function AudioStreamController() {
  const audioRef = useRef(null);

  const currentTrack = useMusicStore((state) => state.currentTrack);
  const isPlaying = useMusicStore((state) => state.isPlaying);
  const volume = useMusicStore((state) => state.volume);
  const isMuted = useMusicStore((state) => state.isMuted);
  const nextTrack = useMusicStore((state) => state.nextTrack);
  const _syncPlaybackState = useMusicStore((state) => state._syncPlaybackState);
  const _setIsPlaying = useMusicStore((state) => state._setIsPlaying);
  const _setIsLoading = useMusicStore((state) => state._setIsLoading);

  // Sync window global reference for instant scrubbing
  useEffect(() => {
    if (audioRef.current && typeof window !== "undefined") {
      window.__devsprout_audio_el = audioRef.current;
    }
    return () => {
      if (typeof window !== "undefined") {
        window.__devsprout_audio_el = null;
      }
    };
  }, []);

  // Update track source when track changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    const currentSrc = audio.src;
    if (currentSrc !== currentTrack.streamUrl) {
      _setIsLoading(true);
      audio.src = currentTrack.streamUrl;
      audio.load();

      if (isPlaying) {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              _setIsLoading(false);
            })
            .catch(() => {
              // Handled by browser user interaction policy or network
              _setIsLoading(false);
              _setIsPlaying(false);
            });
        }
      }
    }
  }, [currentTrack, _setIsLoading, _setIsPlaying]);

  // Sync play / pause state
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            _setIsLoading(false);
          })
          .catch(() => {
            _setIsPlaying(false);
            _setIsLoading(false);
          });
      }
    } else {
      audio.pause();
    }
  }, [isPlaying, _setIsLoading, _setIsPlaying]);

  // Sync volume & mute
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  return (
    <audio
      ref={audioRef}
      preload="metadata"
      onTimeUpdate={(e) => {
        const el = e.currentTarget;
        _syncPlaybackState(el.currentTime, el.duration);
      }}
      onLoadedMetadata={(e) => {
        const el = e.currentTarget;
        _syncPlaybackState(el.currentTime, el.duration);
      }}
      onWaiting={() => _setIsLoading(true)}
      onCanPlay={() => _setIsLoading(false)}
      onPlaying={() => {
        _setIsPlaying(true);
        _setIsLoading(false);
      }}
      onPause={() => _setIsPlaying(false)}
      onEnded={() => {
        nextTrack();
      }}
      onError={(err) => {
        console.warn("Audio stream error, progressing to next track:", err);
        _setIsLoading(false);
        // Automatically skip if link fails
        setTimeout(() => {
          nextTrack();
        }, 1200);
      }}
      style={{ display: "none" }}
    />
  );
}
