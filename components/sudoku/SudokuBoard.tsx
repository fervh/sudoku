import styles from "./sudoku.module.css";
import type { Board } from "./types";
import type { KeyboardEvent } from "react";

type SudokuBoardProps = {
  board: Board;
  puzzle: Board;
  selectedCell: string | null;
  selectedCoords: [number, number] | null;
  selectedValue: number | null;
  conflicts: Set<string>;
  lastWrongCell: string | null;
  useCustomKeyboard: boolean;
  onSelectCell: (key: string) => void;
  onChangeCell: (row: number, col: number, value: string) => void;
  onCellKeyDown: (event: KeyboardEvent<HTMLInputElement>, row: number, col: number) => void;
  setInputRef: (row: number, col: number, node: HTMLInputElement | null) => void;
};

export function SudokuBoard({
  board,
  puzzle,
  selectedCell,
  selectedCoords,
  selectedValue,
  conflicts,
  lastWrongCell,
  useCustomKeyboard,
  onSelectCell,
  onChangeCell,
  onCellKeyDown,
  setInputRef
}: SudokuBoardProps) {
  return (
    <div className={useCustomKeyboard ? `${styles.boardShell} ${styles.customKeyboard}` : styles.boardShell}>
      <div className={styles.board} role="grid" aria-label="Sudoku board">
        {board.map((row, r) =>
          row.map((value, c) => {
            const key = `${r}-${c}`;
            const isFixed = puzzle[r][c] !== null;
            const selected = selectedCell === key;
            const conflict = !isFixed && conflicts.has(key);
            const wrongAttempt = lastWrongCell === key;

            const sameRow = Boolean(selectedCoords && selectedCoords[0] === r && !selected);
            const sameCol = Boolean(selectedCoords && selectedCoords[1] === c && !selected);
            const sameBox = Boolean(
              selectedCoords &&
                Math.floor(selectedCoords[0] / 3) === Math.floor(r / 3) &&
                Math.floor(selectedCoords[1] / 3) === Math.floor(c / 3) &&
                !selected
            );
            const sameValue = selectedValue !== null && value !== null && selectedValue === value && !selected;

            return (
              <label
                key={key}
                className={[
                  styles.cell,
                  isFixed ? styles.fixed : styles.editable,
                  selected ? styles.selected : "",
                  sameRow ? styles.peerRow : "",
                  sameCol ? styles.peerCol : "",
                  sameBox ? styles.peerBox : "",
                  sameValue ? styles.sameValue : "",
                  conflict ? styles.conflict : "",
                  wrongAttempt ? styles.wrongAttempt : "",
                  c === 2 || c === 5 ? styles.thickRight : "",
                  r === 2 || r === 5 ? styles.thickBottom : ""
                ]
                  .filter(Boolean)
                  .join(" ")}
                onPointerDown={(event) => {
                  onSelectCell(key);
                  if (useCustomKeyboard) {
                    event.preventDefault();
                  }
                }}
              >
                <input
                  ref={(node) => setInputRef(r, c, node)}
                  aria-label={`Row ${r + 1} column ${c + 1}`}
                  aria-invalid={conflict}
                  inputMode={useCustomKeyboard ? "none" : "numeric"}
                  maxLength={1}
                  readOnly={isFixed || useCustomKeyboard}
                  value={value ?? ""}
                  onMouseDown={(event) => {
                    if (useCustomKeyboard) {
                      event.preventDefault();
                      onSelectCell(key);
                    }
                  }}
                  onTouchStart={(event) => {
                    if (useCustomKeyboard) {
                      event.preventDefault();
                      onSelectCell(key);
                    }
                  }}
                  onPointerDown={(event) => {
                    if (useCustomKeyboard) {
                      event.preventDefault();
                      onSelectCell(key);
                    }
                  }}
                  onFocus={() => onSelectCell(key)}
                  onChange={(event) => onChangeCell(r, c, event.target.value)}
                  onKeyDown={(event) => onCellKeyDown(event, r, c)}
                />
              </label>
            );
          })
        )}
      </div>
    </div>
  );
}
