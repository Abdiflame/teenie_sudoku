"use client";

import { useEffect, useState } from "react";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import type { Difficulty } from "@/lib/sudoku";

type Props = {
  defaultSize: 4 | 5;
  onClose: () => void;
};

const MEDALS = ["🥇", "🥈", "🥉", "4th", "5th"];
const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard"];
const DIFFICULTY_LABEL: Record<Difficulty, string> = { easy: "Easy", medium: "Medium", hard: "Hard" };
const DIFFICULTY_COLOR: Record<Difficulty, string> = {
  easy: "text-green-600",
  medium: "text-amber-600",
  hard: "text-rose-600"
};

const formatTime = (secs: number) => {
  const m = Math.floor(secs / 60).toString().padStart(2, "0");
  const s = (secs % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

const formatDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return "";
  }
};

export const LeaderboardModal = ({ defaultSize, onClose }: Props) => {
  const { getEntries } = useLeaderboard();
  const [activeSize, setActiveSize] = useState<4 | 5>(defaultSize);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const hasAnyEntries = DIFFICULTIES.some(d => getEntries(d, activeSize).length > 0);

  return (
    <div className="win-overlay" role="dialog" aria-modal="true" aria-label="Leaderboard">
      <div className="leaderboard-modal card p-5">

        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-2xl font-display text-sky-900">🏆 Best Times</h2>
          <button
            className="button-secondary text-base leading-none px-3 py-1"
            aria-label="Close leaderboard"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* Size tabs */}
        <div className="flex gap-2 mb-4">
          {([4, 5] as const).map((s) => (
            <button
              key={s}
              onClick={() => setActiveSize(s)}
              className={activeSize === s ? "leaderboard-tab leaderboard-tab-active" : "leaderboard-tab"}
              aria-pressed={activeSize === s}
            >
              {s}×{s}
            </button>
          ))}
        </div>

        {/* Entries by difficulty */}
        {!hasAnyEntries ? (
          <p className="text-center text-sky-400 py-6 text-base">
            No scores yet for {activeSize}×{activeSize}!<br />Be the first! ⭐
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {DIFFICULTIES.map((diff) => {
              const entries = getEntries(diff, activeSize);
              if (entries.length === 0) return null;
              return (
                <div key={diff}>
                  <p className={`text-xs font-bold uppercase tracking-widest mb-1.5 ${DIFFICULTY_COLOR[diff]}`}>
                    {DIFFICULTY_LABEL[diff]}
                  </p>
                  <ol className="flex flex-col gap-1.5">
                    {entries.map((entry, i) => (
                      <li key={i} className={`leaderboard-row rank-${i + 1}`}>
                        <span className="leaderboard-rank" aria-hidden="true">{MEDALS[i]}</span>
                        <span className="leaderboard-initials font-display text-sky-900">{entry.initials}</span>
                        <span className="leaderboard-time font-bold text-sky-700">{formatTime(entry.time)}</span>
                        <span className="leaderboard-date text-sky-400 text-sm ml-auto">{formatDate(entry.date)}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              );
            })}
          </div>
        )}

        <button className="button-primary mt-5 w-full" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};
