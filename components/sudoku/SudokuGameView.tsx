import { SudokuBoard } from "./SudokuBoard";
import styles from "./sudoku.module.css";
import type { Board, GameMode } from "./types";
import type { KeyboardEvent } from "react";
import { PiBroom } from "react-icons/pi";

type SudokuGameViewProps = {
  board: Board;
  puzzle: Board;
  mode: GameMode;
  selectedCell: string | null;
  selectedCoords: [number, number] | null;
  selectedValue: number | null;
  conflicts: Set<string>;
  lastWrongCell: string | null;
  useCustomKeyboard: boolean;
  gameStatus: "playing" | "solved" | "failed";
  selectedCellFixed: boolean;
  setInputRef: (row: number, col: number, node: HTMLInputElement | null) => void;
  onSelectCell: (key: string) => void;
  onCellChange: (row: number, col: number, value: string) => void;
  onCellKeyDown: (event: KeyboardEvent<HTMLInputElement>, row: number, col: number) => void;
  onNumpad: (value: number | null) => void;
  onReset: () => void;
  onMenu: () => void;
  onReveal: () => void;
};

export function SudokuGameView({
  board,
  puzzle,
  mode,
  selectedCell,
  selectedCoords,
  selectedValue,
  conflicts,
  lastWrongCell,
  useCustomKeyboard,
  gameStatus,
  selectedCellFixed,
  setInputRef,
  onSelectCell,
  onCellChange,
  onCellKeyDown,
  onNumpad,
  onReset,
  onMenu,
  onReveal
}: SudokuGameViewProps) {
  return (
    <div className={useCustomKeyboard ? `${styles.gamePanel} ${styles.gamePanelCustom}` : styles.gamePanel}>
      <SudokuBoard
        board={board}
        puzzle={puzzle}
        selectedCell={selectedCell}
        selectedCoords={selectedCoords}
        selectedValue={selectedValue}
        conflicts={conflicts}
        lastWrongCell={lastWrongCell}
        useCustomKeyboard={useCustomKeyboard}
        onSelectCell={onSelectCell}
        onChangeCell={onCellChange}
        onCellKeyDown={onCellKeyDown}
        setInputRef={setInputRef}
      />

      {useCustomKeyboard ? (
        <div className={styles.numpad} aria-label="Number pad">
          {Array.from({ length: 9 }, (_, index) => index + 1).map((digit) => (
            <button
              key={digit}
              type="button"
              className={styles.numKey}
              onClick={() => onNumpad(digit)}
              disabled={!selectedCell || selectedCellFixed || gameStatus !== "playing"}
            >
              {digit}
            </button>
          ))}

          <button
            type="button"
            className={styles.numKey}
            onClick={() => onNumpad(null)}
            disabled={!selectedCell || selectedCellFixed || gameStatus !== "playing"}
            aria-label="Clear cell"
          >
            <PiBroom aria-hidden="true" />
          </button>
        </div>
      ) : null}

      <div className={styles.actions}>
        <button type="button" className={`${styles.button} ${styles.secondaryButton}`} onClick={onReset}>
          Reset
        </button>
        <button type="button" className={`${styles.button} ${styles.primaryButton}`} onClick={onMenu}>
          Menu
        </button>
        <button
          type="button"
          className={`${styles.button} ${styles.warningButton}`}
          onClick={onReveal}
          disabled={mode === "challenge"}
        >
          Reveal
        </button>
      </div>
    </div>
  );
}
