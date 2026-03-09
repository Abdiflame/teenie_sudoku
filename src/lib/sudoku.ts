export type CellValue = number;
export type Grid = CellValue[][]; // square grid
export type Difficulty = "easy" | "medium" | "hard";

const baseGrid4: Grid = [
  [1, 2, 3, 4],
  [3, 4, 1, 2],
  [2, 1, 4, 3],
  [4, 3, 2, 1]
];

const baseGrid5: Grid = [
  [1, 2, 3, 4, 5],
  [2, 3, 4, 5, 1],
  [3, 4, 5, 1, 2],
  [4, 5, 1, 2, 3],
  [5, 1, 2, 3, 4]
];

const difficultyHoles: Record<number, Record<Difficulty, number>> = {
  4: { easy: 4, medium: 6, hard: 8 },
  5: { easy: 6, medium: 9, hard: 12 }
};

const subgridSize = (size: number) => (size === 4 ? 2 : 1);

const cloneGrid = (grid: Grid): Grid => grid.map((row) => [...row]);

const shuffle = <T,>(arr: T[]): T[] => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const isValid = (grid: Grid, row: number, col: number, value: number): boolean => {
  if (value === 0) return true;
  const size = grid.length;
  for (let c = 0; c < size; c += 1) if (grid[row][c] === value) return false;
  for (let r = 0; r < size; r += 1) if (grid[r][col] === value) return false;
  const box = subgridSize(size);
  const startRow = Math.floor(row / box) * box;
  const startCol = Math.floor(col / box) * box;
  for (let r = 0; r < box; r += 1) {
    for (let c = 0; c < box; c += 1) {
      if (grid[startRow + r][startCol + c] === value) return false;
    }
  }
  return true;
};

const solveBacktracking = (grid: Grid): Grid | null => {
  const size = grid.length;
  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      if (grid[row][col] === 0) {
        for (let candidate = 1; candidate <= size; candidate += 1) {
          if (isValid(grid, row, col, candidate)) {
            grid[row][col] = candidate;
            const solved = solveBacktracking(grid);
            if (solved) return solved;
            grid[row][col] = 0;
          }
        }
        return null; // no candidate works here
      }
    }
  }
  return cloneGrid(grid);
};

const countSolutions = (grid: Grid, limit = 2): number => {
  let solutions = 0;
  const size = grid.length;
  const search = (g: Grid) => {
    if (solutions >= limit) return;
    for (let row = 0; row < size; row += 1) {
      for (let col = 0; col < size; col += 1) {
        if (g[row][col] === 0) {
          for (let candidate = 1; candidate <= size; candidate += 1) {
            if (isValid(g, row, col, candidate)) {
              g[row][col] = candidate;
              search(g);
              g[row][col] = 0;
            }
          }
          return;
        }
      }
    }
    solutions += 1;
  };
  search(cloneGrid(grid));
  return solutions;
};

const shuffleDigits = (grid: Grid): Grid => {
  const size = grid.length;
  const mapping = shuffle(Array.from({ length: size }, (_, i) => i + 1));
  const convert = (val: CellValue): CellValue => (val === 0 ? 0 : mapping[val - 1]);
  return grid.map((row) => row.map(convert));
};

const shuffleRowsAndCols = (grid: Grid): Grid => {
  const size = grid.length;
  const rows = shuffle(Array.from({ length: size }, (_, i) => i));
  const cols = shuffle(Array.from({ length: size }, (_, i) => i));
  const shuffledRows = rows.map((r) => grid[r]);
  const result: Grid = shuffledRows.map((row) => cols.map((c) => row[c]));
  return result;
};

export const generateSolvedGrid = (size: number): Grid => {
  const base = size === 5 ? baseGrid5 : baseGrid4;
  return shuffleDigits(shuffleRowsAndCols(base));
};

export const generatePuzzle = (difficulty: Difficulty, size = 4): { puzzle: Grid; solution: Grid } => {
  let working = cloneGrid(generateSolvedGrid(size));
  const solution = cloneGrid(working);
  const holes = difficultyHoles[size]?.[difficulty] ?? difficultyHoles[4][difficulty];
  let removed = 0;
  const positions = shuffle(
    Array.from({ length: size * size }, (_, idx) => ({ row: Math.floor(idx / size), col: idx % size }))
  );

  // Remove cells while keeping uniqueness; fall back to ensure holes are actually opened.
  for (const pos of positions) {
    if (removed >= holes) break;
    const backup = working[pos.row][pos.col];
    working[pos.row][pos.col] = 0;
    const solutions = countSolutions(working, 2);
    if (solutions === 1) {
      removed += 1;
    } else {
      working[pos.row][pos.col] = backup;
    }
  }

  // If uniqueness pruning failed to reach target, open remaining cells without uniqueness check.
  if (removed < holes) {
    for (const pos of positions) {
      if (removed >= holes) break;
      if (working[pos.row][pos.col] === 0) continue;
      working[pos.row][pos.col] = 0;
      removed += 1;
    }
  }

  return { puzzle: working, solution };
};

export const isComplete = (grid: Grid): boolean => {
  const size = grid.length;
  for (let r = 0; r < size; r += 1) {
    for (let c = 0; c < size; c += 1) {
      if (grid[r][c] === 0) return false;
      if (!isValid(grid, r, c, grid[r][c])) return false;
    }
  }
  return true;
};

export const isCorrect = (grid: Grid, solution: Grid): boolean => {
  const size = grid.length;
  for (let r = 0; r < size; r += 1) {
    for (let c = 0; c < size; c += 1) {
      if (grid[r][c] !== solution[r][c]) return false;
    }
  }
  return true;
};

export const findEmptyCell = (grid: Grid): { row: number; col: number } | null => {
  const size = grid.length;
  for (let r = 0; r < size; r += 1) {
    for (let c = 0; c < size; c += 1) {
      if (grid[r][c] === 0) return { row: r, col: c };
    }
  }
  return null;
};

export const solveGrid = (grid: Grid): Grid | null => solveBacktracking(cloneGrid(grid));

export const computeCandidates = (grid: Grid, row: number, col: number): CellValue[] => {
  if (grid[row][col] !== 0) return [];
  const candidates: CellValue[] = [];
  const size = grid.length;
  for (let candidate = 1; candidate <= size; candidate += 1) {
    if (isValid(grid, row, col, candidate)) candidates.push(candidate as CellValue);
  }
  return candidates;
};

export const applyHint = (grid: Grid, solution: Grid): { updated: Grid; revealed: number | null } => {
  const emptyCell = findEmptyCell(grid);
  if (!emptyCell) return { updated: grid, revealed: null };
  const { row, col } = emptyCell;
  const updated = cloneGrid(grid);
  updated[row][col] = solution[row][col];
  return { updated, revealed: solution[row][col] };
};

export const serializeGrid = (grid: Grid): string => JSON.stringify(grid);
export const deserializeGrid = (payload: string | null): Grid | null => {
  if (!payload) return null;
  try {
    const parsed = JSON.parse(payload) as number[][];
    if (!parsed.length || (parsed.length !== 4 && parsed.length !== 5)) return null;
    return parsed.map((row) => row.map((v) => Number(v) as CellValue)) as Grid;
  } catch (error) {
    console.error("Failed to parse grid", error);
    return null;
  }
};
