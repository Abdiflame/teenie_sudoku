"use client";

import { useEffect, useState } from "react";
import { deserializeGrid, serializeGrid, type Difficulty, type Grid } from "@/lib/sudoku";

const STORAGE_KEY = "teenie-sudoku-progress";

export type SavedState = {
  puzzle: Grid;
  current: Grid;
  solution: Grid;
  difficulty: Difficulty;
  hintsLeft: number;
  size: 4 | 5;
  elapsedSeconds?: number;
};

export const useLocalProgress = () => {
  const [saved, setSaved] = useState<SavedState | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const payload = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
    if (payload) {
      try {
        const parsed = JSON.parse(payload) as SavedState;
        if (parsed?.puzzle && parsed?.current && parsed?.solution) {
          setSaved({
            ...parsed,
            size: parsed.size === 5 ? 5 : 4,
            puzzle: deserializeGrid(serializeGrid(parsed.puzzle))!,
            current: deserializeGrid(serializeGrid(parsed.current))!,
            solution: deserializeGrid(serializeGrid(parsed.solution))!
          });
        }
      } catch (error) {
        console.error("Failed to load saved progress", error);
      }
    }
    setLoaded(true);
  }, []);

  const persist = (state: SavedState) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  };

  const clear = () => {
    setSaved(null);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  };

  return { saved, loaded, persist, clear };
};
