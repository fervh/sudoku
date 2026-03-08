export type CellValue = number | null;
export type Board = CellValue[][];
export type SolvedBoard = number[][];
export type NotesBoard = number[][][];

export type Difficulty = "easy" | "medium" | "hard";
export type GameMode = "practice" | "challenge";
export type GameStatus = "playing" | "solved" | "failed";
export type ViewState = "menu" | "game" | "result";

export const DIFFICULTY_OPTIONS: Difficulty[] = ["easy", "medium", "hard"];
export const MODE_OPTIONS: GameMode[] = ["practice", "challenge"];

export const DIFFICULTY_CONFIG: Record<Difficulty, { label: string; clues: number }> = {
  easy: { label: "Easy", clues: 40 },
  medium: { label: "Medium", clues: 33 },
  hard: { label: "Hard", clues: 27 }
};
