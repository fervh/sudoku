import type { Board, Difficulty, SolvedBoard } from "./types";
import { DIFFICULTY_CONFIG } from "./types";

const baseSolution: SolvedBoard = [
  [5, 3, 4, 6, 7, 8, 9, 1, 2],
  [6, 7, 2, 1, 9, 5, 3, 4, 8],
  [1, 9, 8, 3, 4, 2, 5, 6, 7],
  [8, 5, 9, 7, 6, 1, 4, 2, 3],
  [4, 2, 6, 8, 5, 3, 7, 9, 1],
  [7, 1, 3, 9, 2, 4, 8, 5, 6],
  [9, 6, 1, 5, 3, 7, 2, 8, 4],
  [2, 8, 7, 4, 1, 9, 6, 3, 5],
  [3, 4, 5, 2, 8, 6, 1, 7, 9]
];

function randomInt(max: number): number {
  return Math.floor(Math.random() * max);
}

function shuffle<T>(items: T[]): T[] {
  const clone = [...items];
  for (let i = clone.length - 1; i > 0; i -= 1) {
    const j = randomInt(i + 1);
    [clone[i], clone[j]] = [clone[j], clone[i]];
  }
  return clone;
}

function cloneSolved(board: SolvedBoard): SolvedBoard {
  return board.map((row) => [...row]);
}

function transpose(board: SolvedBoard): SolvedBoard {
  return Array.from({ length: 9 }, (_, row) =>
    Array.from({ length: 9 }, (_, col) => board[col][row])
  );
}

function permuteDigits(board: SolvedBoard): SolvedBoard {
  const digits = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  return board.map((row) => row.map((value) => digits[value - 1]));
}

function swapRowsWithinBands(board: SolvedBoard): SolvedBoard {
  const next = cloneSolved(board);
  for (let band = 0; band < 3; band += 1) {
    const rows = shuffle([0, 1, 2]).map((index) => band * 3 + index);
    const source = [
      [...next[band * 3]],
      [...next[band * 3 + 1]],
      [...next[band * 3 + 2]]
    ];
    for (let i = 0; i < 3; i += 1) {
      next[band * 3 + i] = source[rows[i] - band * 3];
    }
  }
  return next;
}

function swapBands(board: SolvedBoard): SolvedBoard {
  const order = shuffle([0, 1, 2]);
  const next: SolvedBoard = [];
  for (const band of order) {
    next.push([...board[band * 3]], [...board[band * 3 + 1]], [...board[band * 3 + 2]]);
  }
  return next;
}

function createSolvedBoard(): SolvedBoard {
  let board = cloneSolved(baseSolution);
  board = permuteDigits(board);
  board = swapRowsWithinBands(board);
  board = transpose(board);
  board = swapRowsWithinBands(board);
  board = transpose(board);
  board = swapBands(board);
  board = transpose(swapBands(transpose(board)));
  return board;
}

export function cloneBoard(board: Board): Board {
  return board.map((row) => [...row]);
}

function isSafe(board: Board, row: number, col: number, value: number): boolean {
  for (let i = 0; i < 9; i += 1) {
    if (board[row][i] === value) return false;
    if (board[i][col] === value) return false;
  }

  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;

  for (let r = boxRow; r < boxRow + 3; r += 1) {
    for (let c = boxCol; c < boxCol + 3; c += 1) {
      if (board[r][c] === value) return false;
    }
  }

  return true;
}

function countSolutions(board: Board, cap: number): number {
  let bestRow = -1;
  let bestCol = -1;
  let candidates: number[] = [];

  for (let r = 0; r < 9; r += 1) {
    for (let c = 0; c < 9; c += 1) {
      if (board[r][c] !== null) continue;
      const nextCandidates = [];
      for (let value = 1; value <= 9; value += 1) {
        if (isSafe(board, r, c, value)) {
          nextCandidates.push(value);
        }
      }
      if (nextCandidates.length === 0) return 0;
      if (candidates.length === 0 || nextCandidates.length < candidates.length) {
        candidates = nextCandidates;
        bestRow = r;
        bestCol = c;
      }
    }
  }

  if (bestRow === -1) return 1;

  let total = 0;
  for (const value of candidates) {
    board[bestRow][bestCol] = value;
    total += countSolutions(board, cap);
    if (total >= cap) {
      board[bestRow][bestCol] = null;
      return total;
    }
    board[bestRow][bestCol] = null;
  }

  return total;
}

function makePuzzle(solution: SolvedBoard, clues: number): Board {
  const puzzle: Board = solution.map((row) => row.map((value) => value));
  const cells = shuffle(Array.from({ length: 81 }, (_, index) => index));
  let filled = 81;

  for (const cell of cells) {
    if (filled <= clues) break;

    const row = Math.floor(cell / 9);
    const col = cell % 9;
    const backup = puzzle[row][col];

    puzzle[row][col] = null;
    const attempts = countSolutions(cloneBoard(puzzle), 2);

    if (attempts !== 1) {
      puzzle[row][col] = backup;
      continue;
    }

    filled -= 1;
  }

  return puzzle;
}

export function createGame(difficulty: Difficulty): { puzzle: Board; solution: SolvedBoard } {
  const solved = createSolvedBoard();
  const puzzle = makePuzzle(solved, DIFFICULTY_CONFIG[difficulty].clues);
  return { puzzle, solution: solved };
}

export function parseCellKey(key: string): [number, number] {
  const [rowText, colText] = key.split("-");
  return [Number(rowText), Number(colText)];
}

export function findFirstEditableCell(puzzle: Board): [number, number] {
  for (let r = 0; r < 9; r += 1) {
    for (let c = 0; c < 9; c += 1) {
      if (puzzle[r][c] === null) return [r, c];
    }
  }
  return [0, 0];
}

export function getConflictSet(board: Board): Set<string> {
  const conflicts = new Set<string>();

  const markDuplicates = (cells: Array<[number, number]>) => {
    const map = new Map<number, Array<[number, number]>>();
    for (const [r, c] of cells) {
      const value = board[r][c];
      if (value === null) continue;
      const entries = map.get(value) ?? [];
      entries.push([r, c]);
      map.set(value, entries);
    }

    for (const entries of map.values()) {
      if (entries.length > 1) {
        for (const [r, c] of entries) {
          conflicts.add(`${r}-${c}`);
        }
      }
    }
  };

  for (let row = 0; row < 9; row += 1) {
    markDuplicates(Array.from({ length: 9 }, (_, col): [number, number] => [row, col]));
  }

  for (let col = 0; col < 9; col += 1) {
    markDuplicates(Array.from({ length: 9 }, (_, row): [number, number] => [row, col]));
  }

  for (let boxRow = 0; boxRow < 3; boxRow += 1) {
    for (let boxCol = 0; boxCol < 3; boxCol += 1) {
      const cells: Array<[number, number]> = [];
      for (let r = boxRow * 3; r < boxRow * 3 + 3; r += 1) {
        for (let c = boxCol * 3; c < boxCol * 3 + 3; c += 1) {
          cells.push([r, c]);
        }
      }
      markDuplicates(cells);
    }
  }

  return conflicts;
}

export function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export function boardEqualsSolution(board: Board, solution: SolvedBoard): boolean {
  return board.every((row, r) => row.every((value, c) => value === solution[r][c]));
}

export function toCellKey(row: number, col: number): string {
  return `${row}-${col}`;
}
