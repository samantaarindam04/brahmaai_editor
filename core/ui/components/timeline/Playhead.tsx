"use client";

import { useEffect, useRef } from "react";

type PlayheadProps = {
  px: number;
  currentTime: number;
  isPlaying: boolean;
  offset?: number;
};

const SEEK_THRESHOLD = 0.15; // seconds

export default function Playhead({
  px,
  currentTime,
  isPlaying,
  offset = 0,
}: PlayheadProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  const baseTimeRef = useRef(currentTime);
  const baseTsRef = useRef<number | null>(null);
  const visualTimeRef = useRef(currentTime);
  const rafRef = useRef<number | null>(null);

  // Handle authoritative updates safely
  useEffect(() => {
    const visual = visualTimeRef.current;
    const delta = currentTime - visual;

    // Accept seek or pause jumps
    if (!isPlaying || Math.abs(delta) > SEEK_THRESHOLD) {
      baseTimeRef.current = currentTime;
      visualTimeRef.current = currentTime;
      baseTsRef.current = isPlaying ? performance.now() : null;

      if (ref.current) {
        const x = offset + currentTime * px;
        ref.current.style.transform = `translateX(${x}px)`;
      }
    }
    // else: ignore tiny backward corrections
  }, [currentTime, isPlaying, px, offset]);

  useEffect(() => {
    function animate(ts: number) {
      if (!ref.current || !isPlaying || baseTsRef.current == null) return;

      const elapsed = (ts - baseTsRef.current) / 1000;

      const visualTime = baseTimeRef.current + elapsed;
      visualTimeRef.current = visualTime;

      const x = offset + visualTime * px;
      ref.current.style.transform = `translateX(${x}px)`;

      rafRef.current = requestAnimationFrame(animate);
    }

    if (isPlaying) {
      baseTsRef.current = performance.now();
      rafRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [isPlaying, px, offset]);

  return (
    <div
      ref={ref}
      className="absolute top-0 bottom-0 w-px bg-red-500 will-change-transform"
    >
      <div className="absolute -top-1 -left-2 w-3 h-3 bg-red-500 rounded-full" />
    </div>
  );
}
