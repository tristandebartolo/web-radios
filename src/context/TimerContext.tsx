'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from 'react';
import { usePlayer, type RadioForPlayer } from './PlayerContext';

interface Alarm {
  id: string;
  time: string; // Format HH:MM
  radio: RadioForPlayer;
  enabled: boolean;
  days: number[]; // 0-6 (dimanche-samedi), vide = une seule fois
  label?: string;
}

interface TimerState {
  // Sleep timer
  sleepTimerEnd: number | null; // Timestamp de fin
  sleepTimerRemaining: number; // Secondes restantes (pour affichage)
  // Alarms
  alarms: Alarm[];
}

interface TimerContextType extends TimerState {
  // Sleep timer
  setSleepTimer: (minutes: number) => void;
  cancelSleepTimer: () => void;
  // Alarms
  addAlarm: (alarm: Omit<Alarm, 'id'>) => void;
  updateAlarm: (id: string, alarm: Partial<Alarm>) => void;
  deleteAlarm: (id: string) => void;
  toggleAlarm: (id: string) => void;
}

const TimerContext = createContext<TimerContextType | null>(null);

const ALARMS_STORAGE_KEY = 'webradios_alarms';

export function TimerProvider({ children }: { children: ReactNode }) {
  const { pause, play, currentRadio } = usePlayer();
  const sleepTimerRef = useRef<NodeJS.Timeout | null>(null);
  const alarmCheckRef = useRef<NodeJS.Timeout | null>(null);
  const lastTriggeredAlarmRef = useRef<string | null>(null);

  const [state, setState] = useState<TimerState>({
    sleepTimerEnd: null,
    sleepTimerRemaining: 0,
    alarms: [],
  });

  // Load alarms from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(ALARMS_STORAGE_KEY);
      if (stored) {
        try {
          const alarms = JSON.parse(stored);
          setState((s) => ({ ...s, alarms }));
        } catch {
          console.error('Failed to parse stored alarms');
        }
      }
    }
  }, []);

  // Save alarms to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && state.alarms.length > 0) {
      localStorage.setItem(ALARMS_STORAGE_KEY, JSON.stringify(state.alarms));
    }
  }, [state.alarms]);

  // Sleep timer countdown display
  useEffect(() => {
    if (!state.sleepTimerEnd) {
      setState((s) => ({ ...s, sleepTimerRemaining: 0 }));
      return;
    }

    const updateRemaining = () => {
      const remaining = Math.max(0, Math.floor((state.sleepTimerEnd! - Date.now()) / 1000));
      setState((s) => ({ ...s, sleepTimerRemaining: remaining }));

      if (remaining <= 0) {
        pause();
        setState((s) => ({ ...s, sleepTimerEnd: null, sleepTimerRemaining: 0 }));
      }
    };

    updateRemaining();
    const interval = setInterval(updateRemaining, 1000);

    return () => clearInterval(interval);
  }, [state.sleepTimerEnd, pause]);

  // Alarm checker
  useEffect(() => {
    const checkAlarms = () => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const currentDay = now.getDay();
      const currentMinuteKey = `${currentTime}-${now.getDate()}`;

      state.alarms.forEach((alarm) => {
        if (!alarm.enabled) return;
        if (alarm.time !== currentTime) return;
        if (lastTriggeredAlarmRef.current === `${alarm.id}-${currentMinuteKey}`) return;

        // Check if alarm should trigger today
        const shouldTrigger = alarm.days.length === 0 || alarm.days.includes(currentDay);

        if (shouldTrigger) {
          lastTriggeredAlarmRef.current = `${alarm.id}-${currentMinuteKey}`;
          play(alarm.radio);

          // If one-time alarm, disable it
          if (alarm.days.length === 0) {
            setState((s) => ({
              ...s,
              alarms: s.alarms.map((a) => (a.id === alarm.id ? { ...a, enabled: false } : a)),
            }));
          }
        }
      });
    };

    // Check every 10 seconds
    checkAlarms();
    alarmCheckRef.current = setInterval(checkAlarms, 10000);

    return () => {
      if (alarmCheckRef.current) {
        clearInterval(alarmCheckRef.current);
      }
    };
  }, [state.alarms, play]);

  const setSleepTimer = useCallback((minutes: number) => {
    if (sleepTimerRef.current) {
      clearTimeout(sleepTimerRef.current);
    }

    const endTime = Date.now() + minutes * 60 * 1000;
    setState((s) => ({ ...s, sleepTimerEnd: endTime }));
  }, []);

  const cancelSleepTimer = useCallback(() => {
    if (sleepTimerRef.current) {
      clearTimeout(sleepTimerRef.current);
      sleepTimerRef.current = null;
    }
    setState((s) => ({ ...s, sleepTimerEnd: null, sleepTimerRemaining: 0 }));
  }, []);

  const addAlarm = useCallback((alarm: Omit<Alarm, 'id'>) => {
    const newAlarm: Alarm = {
      ...alarm,
      id: crypto.randomUUID(),
    };
    setState((s) => ({ ...s, alarms: [...s.alarms, newAlarm] }));
  }, []);

  const updateAlarm = useCallback((id: string, updates: Partial<Alarm>) => {
    setState((s) => ({
      ...s,
      alarms: s.alarms.map((a) => (a.id === id ? { ...a, ...updates } : a)),
    }));
  }, []);

  const deleteAlarm = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      alarms: s.alarms.filter((a) => a.id !== id),
    }));
    // Update localStorage
    if (typeof window !== 'undefined') {
      const remaining = state.alarms.filter((a) => a.id !== id);
      if (remaining.length === 0) {
        localStorage.removeItem(ALARMS_STORAGE_KEY);
      }
    }
  }, [state.alarms]);

  const toggleAlarm = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      alarms: s.alarms.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a)),
    }));
  }, []);

  return (
    <TimerContext.Provider
      value={{
        ...state,
        setSleepTimer,
        cancelSleepTimer,
        addAlarm,
        updateAlarm,
        deleteAlarm,
        toggleAlarm,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
}

export function useTimer() {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
}

// Helper pour formater le temps restant
export function formatTimeRemaining(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs.toString().padStart(2, '0')}s`;
  }
  return `${secs}s`;
}
