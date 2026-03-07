"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import {
  boardEqualsSolution,
  cloneBoard,
  createGame,
  findFirstEditableCell,
  getConflictSet,
  parseCellKey,
  toCellKey
} from "./engine";
import type { Board, CellValue, Difficulty, GameMode, GameStatus, SolvedBoard, ViewState } from "./types";

type GameData = { puzzle: Board; solution: SolvedBoard };

export function useSudokuGame() {
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [mode, setMode] = useState<GameMode>("practice");
  const [view, setView] = useState<ViewState>("menu");

  const [game, setGame] = useState<GameData>(() => createGame("easy"));
  const [board, setBoard] = useState<Board>(() => cloneBoard(game.puzzle));
  const [selectedCell, setSelectedCell] = useState<string | null>(null);

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [strikes, setStrikes] = useState(0);
  const [gameStatus, setGameStatus] = useState<GameStatus>("playing");
  const [lastWrongCell, setLastWrongCell] = useState<string | null>(null);
  const [strikePulse, setStrikePulse] = useState(false);
  const [useCustomKeyboard, setUseCustomKeyboard] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[][]>(
    Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => null))
  );
  const feedbackTimeoutRef = useRef<number | null>(null);

  const isSolved = gameStatus === "solved";
  const isFailed = gameStatus === "failed";
  const strikesLeft = Math.max(0, 3 - strikes);

  const statusText = isSolved ? "Solved" : isFailed ? "Failed" : "In Progress";
  const statusClass = isSolved ? "status-solved" : isFailed ? "status-failed" : "status-live";

  const selectedCoords = useMemo<[number, number] | null>(() => {
    if (!selectedCell) return null;
    return parseCellKey(selectedCell);
  }, [selectedCell]);

  const selectedValue = useMemo<CellValue>(() => {
    if (!selectedCoords) return null;
    const [row, col] = selectedCoords;
    return board[row][col];
  }, [board, selectedCoords]);

  const selectedCellFixed = useMemo(() => {
    if (!selectedCoords) return true;
    const [row, col] = selectedCoords;
    return game.puzzle[row][col] !== null;
  }, [game.puzzle, selectedCoords]);

  const conflicts = useMemo(() => getConflictSet(board), [board]);

  const isPlaying = view === "game" && gameStatus === "playing";

  useEffect(() => {
    if (!isPlaying) return;
    const interval = window.setInterval(() => {
      setElapsedSeconds((value) => value + 1);
    }, 1000);
    return () => window.clearInterval(interval);
  }, [isPlaying]);

  useEffect(
    () => () => {
      if (feedbackTimeoutRef.current !== null) {
        window.clearTimeout(feedbackTimeoutRef.current);
      }
    },
    []
  );

  useEffect(() => {
    const media = window.matchMedia("(pointer: coarse), (max-width: 820px)");
    const update = () => {
      const hasTouch = navigator.maxTouchPoints > 0 || "ontouchstart" in window;
      setUseCustomKeyboard(media.matches || hasTouch);
    };
    update();

    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", update);
      return () => media.removeEventListener("change", update);
    }

    media.addListener(update);
    return () => media.removeListener(update);
  }, []);

  useEffect(() => {
    if (boardEqualsSolution(board, game.solution)) {
      setGameStatus("solved");
    }
  }, [board, game.solution]);

  const setInputRef = (row: number, col: number, node: HTMLInputElement | null) => {
    inputRefs.current[row][col] = node;
  };

  const selectAndFocus = (row: number, col: number) => {
    setSelectedCell(toCellKey(row, col));
    inputRefs.current[row][col]?.focus();
  };

  const triggerWrongFeedback = (key: string) => {
    setLastWrongCell(key);
    setStrikePulse(true);

    if (feedbackTimeoutRef.current !== null) {
      window.clearTimeout(feedbackTimeoutRef.current);
    }
    feedbackTimeoutRef.current = window.setTimeout(() => {
      setLastWrongCell(null);
      setStrikePulse(false);
      feedbackTimeoutRef.current = null;
    }, 340);
  };

  const startGame = (nextDifficulty = difficulty, nextMode = mode) => {
    const nextGame = createGame(nextDifficulty);
    const [startRow, startCol] = findFirstEditableCell(nextGame.puzzle);

    setDifficulty(nextDifficulty);
    setMode(nextMode);
    setGame(nextGame);
    setBoard(cloneBoard(nextGame.puzzle));
    setElapsedSeconds(0);
    setStrikes(0);
    setGameStatus("playing");
    setLastWrongCell(null);
    setStrikePulse(false);
    setView("game");

    window.setTimeout(() => {
      selectAndFocus(startRow, startCol);
    }, 0);
  };

  const resetCurrentGame = () => {
    const [startRow, startCol] = findFirstEditableCell(game.puzzle);
    setBoard(cloneBoard(game.puzzle));
    setElapsedSeconds(0);
    setStrikes(0);
    setGameStatus("playing");
    setLastWrongCell(null);
    setStrikePulse(false);
    selectAndFocus(startRow, startCol);
  };

  const goToMenu = () => {
    setView("menu");
    setSelectedCell(null);
    setGameStatus("playing");
    setLastWrongCell(null);
    setStrikePulse(false);
  };

  const revealSolution = () => {
    setBoard(game.solution.map((row) => [...row]));
  };

  const updateCell = (row: number, col: number, value: CellValue) => {
    if (game.puzzle[row][col] !== null || gameStatus !== "playing") return;

    if (mode === "challenge" && value !== null && value !== game.solution[row][col]) {
      triggerWrongFeedback(toCellKey(row, col));
      setStrikes((current) => {
        const next = current + 1;
        if (next >= 3) {
          setGameStatus("failed");
          setView("result");
        }
        return next;
      });
      return;
    }

    setBoard((current) => {
      const next = cloneBoard(current);
      next[row][col] = value;
      return next;
    });
  };

  const handleCellChange = (row: number, col: number, rawValue: string) => {
    const trimmed = rawValue.trim();
    if (trimmed === "") {
      updateCell(row, col, null);
      return;
    }
    const value = Number(trimmed);
    if (!Number.isInteger(value) || value < 1 || value > 9) return;
    updateCell(row, col, value);
  };

  const moveSelection = (row: number, col: number, rowDelta: number, colDelta: number) => {
    const nextRow = (row + rowDelta + 9) % 9;
    const nextCol = (col + colDelta + 9) % 9;
    selectAndFocus(nextRow, nextCol);
  };

  const handleCellKeyDown = (event: KeyboardEvent<HTMLInputElement>, row: number, col: number) => {
    if (event.key === "ArrowUp") {
      event.preventDefault();
      moveSelection(row, col, -1, 0);
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      moveSelection(row, col, 1, 0);
      return;
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      moveSelection(row, col, 0, -1);
      return;
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      moveSelection(row, col, 0, 1);
      return;
    }
    if (event.key === "Backspace" || event.key === "Delete" || event.key === "0") {
      event.preventDefault();
      updateCell(row, col, null);
      return;
    }
    if (/^[1-9]$/.test(event.key)) {
      event.preventDefault();
      updateCell(row, col, Number(event.key));
      moveSelection(row, col, 0, 1);
    }
  };

  const handleNumpad = (value: CellValue) => {
    if (!selectedCoords || selectedCellFixed) return;
    const [row, col] = selectedCoords;
    updateCell(row, col, value);
  };

  return {
    difficulty,
    mode,
    view,
    board,
    game,
    elapsedSeconds,
    strikesLeft,
    strikes,
    statusText,
    statusClass,
    strikePulse,
    useCustomKeyboard,
    selectedCell,
    selectedCoords,
    selectedValue,
    selectedCellFixed,
    lastWrongCell,
    conflicts,
    gameStatus,
    isSolved,
    isFailed,

    setDifficulty,
    setMode,
    setSelectedCell,
    setInputRef,
    handleCellChange,
    handleCellKeyDown,
    handleNumpad,
    startGame,
    goToMenu,
    revealSolution,
    resetCurrentGame
  };
}
