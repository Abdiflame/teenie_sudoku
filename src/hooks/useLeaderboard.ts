import type { Difficulty } from "@/lib/sudoku";

export type LeaderboardEntry = {
  initials: string;
  time: number;       // elapsed seconds
  date: string;       // ISO date string
  difficulty: Difficulty;
  size: 4 | 5;
};

type LeaderboardStore = {
  [bucketKey: string]: LeaderboardEntry[];
};

const LEADERBOARD_KEY = "teenie-sudoku-leaderboard";
const MAX_ENTRIES = 5;

const bucketKey = (difficulty: Difficulty, size: 4 | 5) => `${difficulty}-${size}`;

const readAll = (): LeaderboardStore => {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(LEADERBOARD_KEY);
    return raw ? (JSON.parse(raw) as LeaderboardStore) : {};
  } catch {
    return {};
  }
};

export const useLeaderboard = () => {
  const getEntries = (difficulty: Difficulty, size: 4 | 5): LeaderboardEntry[] => {
    const store = readAll();
    return store[bucketKey(difficulty, size)] ?? [];
  };

  const addEntry = (entry: LeaderboardEntry): void => {
    const store = readAll();
    const key = bucketKey(entry.difficulty, entry.size);
    const existing = store[key] ?? [];
    store[key] = [...existing, entry]
      .sort((a, b) => a.time - b.time)
      .slice(0, MAX_ENTRIES);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(store));
    }
  };

  return { getEntries, addEntry };
};
