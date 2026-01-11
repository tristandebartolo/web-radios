'use client';

import {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import Hls from 'hls.js';

interface Genre {
  id: string;
  name: string;
  slug: string;
}

export interface RadioForPlayer {
  id: string;
  name: string;
  streamUrl: string;
  streamType: string;
  logoUrl: string | null;
  description: string | null;
  genres: Genre[];
}

interface PlayerState {
  currentRadio: RadioForPlayer | null;
  isPlaying: boolean;
  isLoading: boolean;
  volume: number;
  isMuted: boolean;
  error: string | null;
}

interface PlayerContextType extends PlayerState {
  play: (radio: RadioForPlayer) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [state, setState] = useState<PlayerState>({
    currentRadio: null,
    isPlaying: false,
    isLoading: false,
    volume: 0.8,
    isMuted: false,
    error: null,
  });

  // Initialize audio element
  useEffect(() => {
    if (typeof window !== 'undefined' && !audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.volume = state.volume;

      // Audio event listeners
      audioRef.current.addEventListener('playing', () => {
        setState((s) => ({ ...s, isPlaying: true, isLoading: false, error: null }));
      });

      audioRef.current.addEventListener('pause', () => {
        setState((s) => ({ ...s, isPlaying: false }));
      });

      audioRef.current.addEventListener('waiting', () => {
        setState((s) => ({ ...s, isLoading: true }));
      });

      audioRef.current.addEventListener('error', () => {
        setState((s) => ({
          ...s,
          isPlaying: false,
          isLoading: false,
          error: 'Erreur de lecture du flux audio',
        }));
      });
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  // Update volume when state changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = state.isMuted ? 0 : state.volume;
    }
  }, [state.volume, state.isMuted]);

  const cleanupHls = useCallback(() => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
  }, []);

  const play = useCallback((radio: RadioForPlayer) => {
    const audio = audioRef.current;
    if (!audio) return;

    setState((s) => ({
      ...s,
      currentRadio: radio,
      isLoading: true,
      error: null,
    }));

    // Cleanup previous HLS instance
    cleanupHls();

    const streamType = radio.streamType.toUpperCase();

    if (streamType === 'HLS') {
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });

        hls.loadSource(radio.streamUrl);
        hls.attachMedia(audio);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          audio.play().catch((err) => {
            console.error('Playback error:', err);
            setState((s) => ({
              ...s,
              isLoading: false,
              error: 'Impossible de lancer la lecture',
            }));
          });
        });

        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) {
            console.error('HLS fatal error:', data);
            setState((s) => ({
              ...s,
              isPlaying: false,
              isLoading: false,
              error: 'Erreur de connexion au flux',
            }));
          }
        });

        hlsRef.current = hls;
      } else if (audio.canPlayType('application/vnd.apple.mpegurl')) {
        // Safari native HLS support
        audio.src = radio.streamUrl;
        audio.play().catch(console.error);
      } else {
        setState((s) => ({
          ...s,
          isLoading: false,
          error: 'HLS non supporté par ce navigateur',
        }));
      }
    } else {
      // MP3, AAC, OGG - direct playback
      audio.src = radio.streamUrl;
      audio.play().catch((err) => {
        console.error('Playback error:', err);
        setState((s) => ({
          ...s,
          isLoading: false,
          error: 'Impossible de lancer la lecture',
        }));
      });
    }

    // Update Media Session API for mobile controls
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: radio.name,
        artist: radio.description || 'WebRadios',
        album: radio.genres.map((g) => g.name).join(', ') || 'Radio',
        artwork: radio.logoUrl
          ? [{ src: radio.logoUrl, sizes: '512x512', type: 'image/png' }]
          : [],
      });

      navigator.mediaSession.setActionHandler('play', () => {
        audio.play();
      });

      navigator.mediaSession.setActionHandler('pause', () => {
        audio.pause();
      });
    }
  }, [cleanupHls]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const resume = useCallback(() => {
    audioRef.current?.play().catch(console.error);
  }, []);

  const stop = useCallback(() => {
    cleanupHls();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    setState((s) => ({
      ...s,
      currentRadio: null,
      isPlaying: false,
      isLoading: false,
    }));
  }, [cleanupHls]);

  const setVolume = useCallback((volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    setState((s) => ({ ...s, volume: clampedVolume, isMuted: false }));
  }, []);

  const toggleMute = useCallback(() => {
    setState((s) => ({ ...s, isMuted: !s.isMuted }));
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        ...state,
        play,
        pause,
        resume,
        stop,
        setVolume,
        toggleMute,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}
