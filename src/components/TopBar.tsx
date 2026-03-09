"use client";

type Props = {
  size: 4 | 5;
  onSize: (s: 4 | 5) => void;
  difficulty: "easy" | "medium" | "hard";
  onDifficulty: (d: "easy" | "medium" | "hard") => void;
  onClear: () => void;
  onNewPuzzle: () => void;
  cheer?: string | null;
};

export const TopBar = ({ size, onSize, difficulty, onDifficulty, onClear, onNewPuzzle, cheer }: Props) => (
  <header className="w-full flex items-center justify-between gap-4 mb-4">
    <div className="flex items-center gap-3">
      <div className="avatar-frame">
        <img src="/images/teenieping_avatar.png" alt="Teenieping" className="avatar-img" />
        <span className="avatar-glow" />
        {cheer && <span className="avatar-cheer">{cheer}</span>}
      </div>
      <div className="leading-tight">
        <p className="text-sky-800 font-semibold text-lg">Teenieping Sudoku</p>
        <p className="text-sky-600 text-base">Sudoku for 찌안~</p>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <select
        aria-label="Select board size"
        value={size}
        onChange={(e) => onSize(Number(e.target.value) as 4 | 5)}
        className="rounded-full bg-white/90 border border-sky-100 px-4 py-2 shadow-soft focus:outline-none"
      >
        <option value={4}>4x4</option>
        <option value={5}>5x5</option>
      </select>
      <select
        aria-label="Select difficulty"
        value={difficulty}
        onChange={(e) => onDifficulty(e.target.value as Props["difficulty"])}
        className="rounded-full bg-white/90 border border-sky-100 px-4 py-2 shadow-soft focus:outline-none"
      >
        <option value="easy">Easy</option>
        <option value="medium">Medium</option>
        <option value="hard">Hard</option>
      </select>
      <button className="button-secondary" onClick={onClear}>Clear</button>
      <button className="button-secondary" onClick={onNewPuzzle}>New puzzle</button>
    </div>
  </header>
);
