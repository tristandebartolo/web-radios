'use client';

import { useEffect, useRef, useState } from 'react';

interface AudioWaveProps {
  isPlaying: boolean;
  analyser: AnalyserNode | null;
  barCount?: number;
  className?: string;
}

export function AudioWave({ isPlaying, analyser, barCount = 5, className = '' }: AudioWaveProps) {
  const [frequencies, setFrequencies] = useState<number[]>(Array(barCount).fill(4));
  const animationRef = useRef<number | null>(null);
  // const dataArrayRef = useRef<Uint8Array | null>(null);
  const dataArrayRef = useRef<Uint8Array<ArrayBuffer> | null>(null);

  useEffect(() => {
    if (!analyser || !isPlaying) {
      // Reset to minimal height when not playing
      setFrequencies(Array(barCount).fill(4));
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }

    // Initialize data array for frequency data
    const bufferLength = analyser.frequencyBinCount;
    dataArrayRef.current = new Uint8Array(bufferLength);

    const updateFrequencies = () => {
      if (!analyser || !dataArrayRef.current) return;

      analyser.getByteFrequencyData(dataArrayRef.current);

      // Sample frequencies across the spectrum for each bar
      const newFrequencies: number[] = [];
      const step = Math.floor(bufferLength / barCount);

      for (let i = 0; i < barCount; i++) {
        // Get average of a range of frequencies for smoother visualization
        let sum = 0;
        const start = i * step;
        const end = Math.min(start + step, bufferLength);
        for (let j = start; j < end; j++) {
          sum += dataArrayRef.current[j]!;
        }
        const avg = sum / (end - start);
        // Map 0-255 to 4-24 (min-max height in pixels)
        const height = Math.max(4, (avg / 255) * 24);
        newFrequencies.push(height);
      }

      setFrequencies(newFrequencies);
      animationRef.current = requestAnimationFrame(updateFrequencies);
    };

    animationRef.current = requestAnimationFrame(updateFrequencies);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [analyser, isPlaying, barCount]);

  return (
    <div className={`flex items-end gap-0.75 h-6 ${className}`}>
      {frequencies.map((height, i) => (
        <div
          key={i}
          className="w-0.75 rounded-full transition-all duration-75"
          style={{
            height: `${height}px`,
            background: `linear-gradient(to top, var(--primary), var(--accent))`,
          }}
        />
      ))}
    </div>
  );
}
