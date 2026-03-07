import styles from "./sudoku.module.css";
import { DIFFICULTY_CONFIG, DIFFICULTY_OPTIONS, MODE_OPTIONS } from "./types";
import type { Difficulty, GameMode } from "./types";

type SudokuMenuProps = {
  difficulty: Difficulty;
  mode: GameMode;
  onDifficultyChange: (difficulty: Difficulty) => void;
  onModeChange: (mode: GameMode) => void;
  onStart: () => void;
};

export function SudokuMenu({
  difficulty,
  mode,
  onDifficultyChange,
  onModeChange,
  onStart
}: SudokuMenuProps) {
  return (
    <div className={styles.panel}>
      <h2 className={styles.panelTitle}>Start Game</h2>

      <div className={styles.menuGrid}>
        <fieldset className={styles.fieldset}>
          <legend>Difficulty</legend>
          <div className={styles.chipRow}>
            {DIFFICULTY_OPTIONS.map((level) => (
              <button
                key={level}
                type="button"
                className={difficulty === level ? `${styles.chip} ${styles.chipActive}` : styles.chip}
                aria-pressed={difficulty === level}
                onClick={() => onDifficultyChange(level)}
              >
                {DIFFICULTY_CONFIG[level].label}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className={styles.fieldset}>
          <legend>Mode</legend>
          <div className={styles.chipRow}>
            {MODE_OPTIONS.map((value) => (
              <button
                key={value}
                type="button"
                className={mode === value ? `${styles.chip} ${styles.chipActive}` : styles.chip}
                aria-pressed={mode === value}
                onClick={() => onModeChange(value)}
              >
                {value === "practice" ? "Practice" : "Challenge"}
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      <button type="button" className={`${styles.button} ${styles.primaryButton}`} onClick={onStart}>
        Play
      </button>
    </div>
  );
}
