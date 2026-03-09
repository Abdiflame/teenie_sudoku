"use client";

import { useCallback, useEffect, useRef } from "react";

const BACKGROUND_TRACKS = [
  "/sounds/background_01.mp3",
  "/sounds/background_02.mp3",
  "/sounds/background_03.mp3"
];

const fadeVolume = (
  audio: HTMLAudioElement,
  from: number,
  to: number,
  durationMs: number,
  onDone?: () => void
) => {
  const steps = Math.max(1, Math.round(durationMs / 40));
  const delta = (to - from) / steps;
  let currentStep = 0;
  audio.volume = from;
  const tick = () => {
    currentStep += 1;
    audio.volume = Math.min(1, Math.max(0, from + delta * currentStep));
    if (currentStep >= steps) {
      onDone?.();
      return;
    }
    window.setTimeout(tick, 40);
  };
  tick();
};

export const useSound = () => {
  const ctxRef = useRef<AudioContext | null>(null);
  const bgAudioRef = useRef<HTMLAudioElement | null>(null);
  const winAudioRef = useRef<HTMLAudioElement | null>(null);
  const bgIndexRef = useRef<number>(0);
  const bgPlayingRef = useRef(false);
  const bgStartingRef = useRef(false);
  const winPlayingRef = useRef(false);

  const playEffect = useCallback((type: "correct" | "incorrect" | "hint" | "win" = "correct") => {
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

  const stopBackground = useCallback((fadeMs = 600) => {
    const audio = bgAudioRef.current;
    if (!audio) return;
    bgPlayingRef.current = false;
    bgStartingRef.current = false;
    audio.onended = null;
    fadeVolume(audio, audio.volume, 0, fadeMs, () => {
      audio.pause();
      audio.currentTime = 0;
    });
  }, []);

  const startBackground = useCallback(async () => {
    if (typeof window === "undefined") return;
    if (bgPlayingRef.current || bgStartingRef.current) return;
    bgStartingRef.current = true;

    const startIndex = Math.floor(Math.random() * BACKGROUND_TRACKS.length);
    bgIndexRef.current = startIndex;
    const audio = new Audio(BACKGROUND_TRACKS[startIndex]);
    audio.volume = 0;
    audio.preload = "auto";
    bgAudioRef.current = audio;

    const playNext = async () => {
      if (!bgPlayingRef.current || !bgAudioRef.current) return;
      bgIndexRef.current = (bgIndexRef.current + 1) % BACKGROUND_TRACKS.length;
      const nextSrc = BACKGROUND_TRACKS[bgIndexRef.current];
      bgAudioRef.current.src = nextSrc;
      bgAudioRef.current.currentTime = 0;
      bgAudioRef.current.volume = 0;
      try {
        await bgAudioRef.current.play();
        fadeVolume(bgAudioRef.current, 0, 0.35, 700);
      } catch (error) {
        console.warn("Background audio blocked", error);
      }
    };

    audio.onended = playNext;
    try {
      await audio.play();
      bgPlayingRef.current = true;
      fadeVolume(audio, 0, 0.35, 700);
    } catch (error) {
      console.warn("Background audio blocked", error);
      bgPlayingRef.current = false;
    } finally {
      bgStartingRef.current = false;
    }
  }, []);

  const playWin = useCallback(async () => {
    if (typeof window === "undefined") return;
    if (winPlayingRef.current) return;

    const audio = new Audio("/sounds/congratulations.mp3");
    audio.preload = "auto";
    audio.volume = 0;
    winAudioRef.current = audio;
    winPlayingRef.current = true;
    try {
      await audio.play();
      fadeVolume(audio, 0, 0.7, 220);
    } catch (error) {
      console.warn("Win audio blocked", error);
      winPlayingRef.current = false;
    }
  }, []);

  const stopWin = useCallback((fadeMs = 260) => {
    const audio = winAudioRef.current;
    if (!audio) return;
    winPlayingRef.current = false;
    fadeVolume(audio, audio.volume, 0, fadeMs, () => {
      audio.pause();
      audio.currentTime = 0;
    });
  }, []);

  useEffect(() => {
    return () => {
      bgPlayingRef.current = false;
      winPlayingRef.current = false;
    };
  }, []);

  return {
    play: playEffect,
    playEffect,
    startBackground,
    stopBackground,
    playWin,
    stopWin
  };
};
