"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { applyHint, generatePuzzle, isCorrect, type Difficulty, type Grid } from "@/lib/sudoku";
import { CellButton } from "./CellButton";
import { ControlsBar } from "./ControlsBar";
import { Celebration } from "./Celebration";
import { LeaderboardModal } from "./LeaderboardModal";
import { useLocalProgress } from "@/hooks/useLocalProgress";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { useServiceWorker } from "@/hooks/useServiceWorker";
import { useSound } from "@/hooks/useSound";
import { TopBar } from "./TopBar";

const defaultHints: Record<Difficulty, number> = {
  easy: 4,
  medium: 3,
  hard: 2
};

const buildNewState = (difficulty: Difficulty, size: 4 | 5) => {
  const { puzzle, solution } = generatePuzzle(difficulty, size);
  return {
    puzzle,
    current: puzzle.map((row) => [...row]) as Grid,
    solution,
    difficulty,
    hintsLeft: defaultHints[difficulty],
    size
  };
};

export const GameBoard = () => {
  useServiceWorker();
  const { playEffect, startBackground, stopBackground, playWin, stopWin } = useSound();
  const { saved, loaded, persist } = useLocalProgress();
  const { addEntry } = useLeaderboard();

  const [size, setSize] = useState<4 | 5>(4);
  const [puzzle, setPuzzle] = useState<Grid | null>(null);
  const [current, setCurrent] = useState<Grid | null>(null);
  const [solution, setSolution] = useState<Grid | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [hintsLeft, setHintsLeft] = useState<number>(defaultHints.easy);
  const [selected, setSelected] = useState<{ row: number; col: number } | null>(null);
  const [won, setWon] = useState(false);
  const [completedRows, setCompletedRows] = useState<Set<number>>(new Set());
  const [flashRows, setFlashRows] = useState<Set<number>>(new Set());
  const [completedCols, setCompletedCols] = useState<Set<number>>(new Set());
  const [flashCols, setFlashCols] = useState<Set<number>>(new Set());
  const [cheer, setCheer] = useState<string | null>(null);

  // Timer — lives in refs to avoid stale closures; elapsedSeconds is state only for display
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRunningRef = useRef(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Leaderboard / initials flow
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showInitialsInput, setShowInitialsInput] = useState(false);
  const [initials, setInitials] = useState("");

  const startTimer = useCallback(() => {
    if (timerRunningRef.current) return;
    timerRunningRef.current = true;
    intervalRef.current = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    timerRunningRef.current = false;
  }, []);

  // Cleanup on unmount
  useEffect(() => () => stopTimer(), [stopTimer]);

  // Hydration — runs exactly once when localStorage read is done
  useEffect(() => {
    if (!loaded) return;

    if (saved) {
      setSize(saved.size ?? 4);
      setPuzzle(saved.puzzle);
      setCurrent(saved.current);
      setSolution(saved.solution);
      setDifficulty(saved.difficulty);
      setHintsLeft(saved.hintsLeft);
      const secs = saved.elapsedSeconds ?? 0;
      setElapsedSeconds(secs);
      // Start timer — puzzle is in-progress
      startTimer();
    } else {
      const fresh = buildNewState("easy", 4);
      setPuzzle(fresh.puzzle);
      setCurrent(fresh.current);
      setSolution(fresh.solution);
      setDifficulty(fresh.difficulty);
      setHintsLeft(fresh.hintsLeft);
      setSize(fresh.size);
      persist({ ...fresh, elapsedSeconds: 0 });
      startTimer();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

  // elapsedSeconds ref — lets persistState always write the latest value without stale closure
  const elapsedRef = useRef(0);
  useEffect(() => { elapsedRef.current = elapsedSeconds; }, [elapsedSeconds]);

  const persistState = useCallback((payload: {
    puzzle: Grid;
    current: Grid;
    solution: Grid;
    difficulty: Difficulty;
    hintsLeft: number;
    size: 4 | 5;
  }) => persist({ ...payload, elapsedSeconds: elapsedRef.current }), [persist]);

  const resetProgress = useCallback((opts?: { stopTimerOnly?: boolean }) => {
    stopTimer();
    setElapsedSeconds(0);
    elapsedRef.current = 0;
    if (!opts?.stopTimerOnly) {
      setWon(false);
      setSelected(null);
      setCompletedRows(new Set());
      setCompletedCols(new Set());
      setFlashRows(new Set());
      setFlashCols(new Set());
      setCheer(null);
      setShowInitialsInput(false);
      setInitials("");
      stopWin();
    }
  }, [stopTimer, stopWin]);

  const startNew = useCallback((nextDifficulty = difficulty, nextSize = size) => {
    const fresh = buildNewState(nextDifficulty, nextSize);
    setPuzzle(fresh.puzzle);
    setCurrent(fresh.current);
    setSolution(fresh.solution);
    setDifficulty(fresh.difficulty);
    setHintsLeft(fresh.hintsLeft);
    setSize(fresh.size);
    resetProgress();
    persist({ ...fresh, elapsedSeconds: 0 });
    stopBackground();
    startBackground();
    startTimer();
  }, [difficulty, size, resetProgress, persist, stopBackground, startBackground, startTimer]);

  const handleNumber = (value: number) => {
    if (!puzzle || !current || !solution || !selected) return;
    startBackground();
    const { row, col } = selected;
    if (puzzle[row][col] !== 0) return;
    const next = current.map((r) => [...r]) as Grid;
    next[row][col] = value === 0 ? 0 : (value as Grid[number][number]);
    setCurrent(next);
    persistState({ puzzle, current: next, solution, difficulty, hintsLeft, size });

    if (value !== 0) {
      if (solution[row][col] === value) {
        playEffect("correct");
      } else {
        playEffect("incorrect");
      }
    }
    const solved = isCorrect(next, solution);
    if (solved) {
      stopTimer();
      setWon(true);
      setShowInitialsInput(true);
      stopBackground();
      playWin();
    }
  };

  const handleHint = () => {
    if (!puzzle || !current || !solution || hintsLeft <= 0) return;
    startBackground();
    const { updated, revealed } = applyHint(current, solution);
    if (revealed) playEffect("hint");
    setCurrent(updated);
    const nextHints = Math.max(0, hintsLeft - 1);
    setHintsLeft(nextHints);
    persistState({ puzzle, current: updated, solution, difficulty, hintsLeft: nextHints, size });
    if (isCorrect(updated, solution)) {
      stopTimer();
      setWon(true);
      setShowInitialsInput(true);
      stopBackground();
      playWin();
    }
  };

  const handleClear = () => {
    if (!puzzle || !solution) return;
    const reset = puzzle.map((row) => [...row]) as Grid;
    setCurrent(reset);
    setHintsLeft(defaultHints[difficulty]);
    resetProgress();
    persist({ puzzle, current: reset, solution, difficulty, hintsLeft: defaultHints[difficulty], size, elapsedSeconds: 0 });
    startTimer();
  };

  const handleSaveScore = () => {
    const trimmed = initials.trim().toUpperCase();
    if (trimmed.length > 0) {
      addEntry({ initials: trimmed, time: elapsedSeconds, date: new Date().toISOString(), difficulty, size });
    }
    setShowInitialsInput(false);
    setInitials("");
  };

  const presetMask = useMemo(() => {
    if (!puzzle) return new Set<string>();
    const presets = new Set<string>();
    puzzle.forEach((row, r) => row.forEach((value, c) => value !== 0 && presets.add(`${r}-${c}`)));
    return presets;
  }, [puzzle]);

  useEffect(() => {
    if (!current || !solution) return;
    const gridSize = current.length;
    const cheering = ["Nice row!", "Way to go!", "Column magic!", "Great job!"];
    const triggerCheer = () => {
      const index = Math.floor(Math.random() * cheering.length);
      setCheer(cheering[index]);
      setTimeout(() => setCheer(null), 1800);
      playEffect("correct");
    };

    const nextRows = new Set<number>();
    const nextCols = new Set<number>();

    for (let r = 0; r < gridSize; r += 1) {
      const fullRow = current[r].every((v) => v !== 0);
      const matches = fullRow && current[r].every((v, c) => v === solution[r][c]);
      if (matches) nextRows.add(r);
    }
    for (let c = 0; c < gridSize; c += 1) {
      const fullCol = current.every((row) => row[c] !== 0);
      const matches = fullCol && current.every((row, r) => row[c] === solution[r][c]);
      if (matches) nextCols.add(c);
    }

    setCompletedRows((prev) => {
      const newly = Array.from(nextRows).filter((r) => !prev.has(r));
      if (newly.length) {
        triggerCheer();
        setFlashRows((prevFlash) => {
          const next = new Set([...prevFlash, ...newly]);
          setTimeout(() => {
            setFlashRows((curr) => {
              const clone = new Set(curr);
              newly.forEach((r) => clone.delete(r));
              return clone;
            });
          }, 1200);
          return next;
        });
      }
      return nextRows;
    });

    setCompletedCols((prev) => {
      const newly = Array.from(nextCols).filter((c) => !prev.has(c));
      if (newly.length) {
        triggerCheer();
        setFlashCols((prevFlash) => {
          const next = new Set([...prevFlash, ...newly]);
          setTimeout(() => {
            setFlashCols((curr) => {
              const clone = new Set(curr);
              newly.forEach((c) => clone.delete(c));
              return clone;
            });
          }, 1200);
          return next;
        });
      }
      return nextCols;
    });
  }, [current, solution, playEffect]);

  useEffect(() => {
    if (!puzzle || !current || won) return;
    startBackground();
  }, [puzzle, current, won, startBackground]);

  const handleSizeChange = (next: 4 | 5) => {
    if (next === size) return;
    startNew(difficulty, next);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  if (!puzzle || !current || !solution) return <div className="card p-6 text-sky-700">Loading cute puzzles...</div>;

  return (
    <div className="w-full max-w-6xl">
      <TopBar
        size={size}
        onSize={handleSizeChange}
        difficulty={difficulty}
        onDifficulty={(d) => {
          setDifficulty(d);
          startNew(d, size);
        }}
        onClear={handleClear}
        onNewPuzzle={() => startNew(difficulty, size)}
        cheer={cheer}
        elapsedSeconds={elapsedSeconds}
        onTrophy={() => setShowLeaderboard(true)}
      />

      <div className="card relative p-3 md:p-4 overflow-hidden">
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/40 to-candy-lilac/20" />
        <div
          className="relative play-area"
          style={{ ["--board-size" as string]: "min(72vh, 82vw)" }}
        >
          <div className="board-shell">
            <div className="board-wrapper" style={{ ["--grid-size" as string]: size }}>
              {current.flatMap((row, rIdx) =>
                row.map((value, cIdx) => {
                  const isPreset = presetMask.has(`${rIdx}-${cIdx}`);
                  const highlighted = selected?.row === rIdx && selected?.col === cIdx;
                  const isRowComplete = completedRows.has(rIdx);
                  const isRowFlash = flashRows.has(rIdx);
                  const isColComplete = completedCols.has(cIdx);
                  const isColFlash = flashCols.has(cIdx);
                  return (
                    <CellButton
                      key={`${rIdx}-${cIdx}`}
                      value={value}
                      preset={isPreset}
                      highlighted={highlighted}
                      rowComplete={isRowComplete}
                      rowFlash={isRowFlash}
                      colComplete={isColComplete}
                      colFlash={isColFlash}
                      onClick={() => setSelected({ row: rIdx, col: cIdx })}
                    />
                  );
                })
              )}
            </div>
          </div>

          <ControlsBar
            onNumber={handleNumber}
            onHint={handleHint}
            hintsLeft={hintsLeft}
            disableInputs={won}
            size={size}
          />
        </div>
        <Celebration show={won} />

        {won && (
          <div className="win-overlay">
            <div className="win-modal card p-6 text-center max-w-sm">
              <div className="win-video-frame">
                <video
                  className="win-video"
                  src="/animation/teenie_animation.mp4"
                  autoPlay
                  muted
                  playsInline
                />
              </div>
              <h2 className="text-3xl font-display text-sky-900 mb-2">Yay! You did it! 🎉</h2>

              {showInitialsInput ? (
                <div className="initials-phase">
                  <p className="text-sky-700 mb-1 font-semibold">Save your score!</p>
                  <p className="text-sky-500 text-sm mb-3">
                    Time: <span className="font-bold text-sky-700">{formatTime(elapsedSeconds)}</span>
                  </p>
                  <input
                    className="initials-input"
                    type="text"
                    maxLength={8}
                    placeholder="Your name"
                    autoFocus
                    aria-label="Enter your name (up to 8 letters)"
                    value={initials}
                    onChange={(e) => setInitials(e.target.value.replace(/[^a-zA-Z]/g, "").toUpperCase())}
                  />
                  <div className="flex gap-2 justify-center mt-3">
                    <button
                      className="button-primary"
                      onClick={handleSaveScore}
                      disabled={initials.trim().length === 0}
                    >
                      Save Score
                    </button>
                    <button
                      className="button-secondary"
                      onClick={() => { setShowInitialsInput(false); setInitials(""); }}
                    >
                      Skip
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sky-700 mb-1">
                    Time: <span className="font-bold">{formatTime(elapsedSeconds)}</span>
                  </p>
                  <p className="text-sky-500 text-sm mb-4">Stars unlocked. Try a new puzzle or harder mode.</p>
                  <div className="flex gap-2 justify-center">
                    <button className="button-primary" onClick={() => startNew(difficulty)}>New puzzle</button>
                    <button className="button-secondary" onClick={() => startNew("hard")}>Hard mode</button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {showLeaderboard && (
        <LeaderboardModal
          defaultSize={size}
          onClose={() => setShowLeaderboard(false)}
        />
      )}
    </div>
  );
};
