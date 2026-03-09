"use client";

import { useCallback, useRef } from "react";

export const useSound = () => {
  const ctxRef = useRef<AudioContext | null>(null);

  const play = useCallback((type: "correct" | "incorrect" | "hint" | "win" = "correct") => {
    if (typeof window === "undefined") return;
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
    }
    const ctx = ctxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    const tone =
      type === "win" ? 880 : type === "hint" ? 520 : type === "incorrect" ? 180 : 720;
    const duration = type === "win" ? 0.5 : 0.22;
    osc.frequency.value = tone;
    osc.type = type === "incorrect" ? "sawtooth" : "triangle";

    const start = ctx.currentTime;
    gain.gain.setValueAtTime(type === "incorrect" ? 0.12 : 0.08, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + duration);

    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(start + duration);
  }, []);

  return { play };
};
