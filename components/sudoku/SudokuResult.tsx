import { CiHeart } from "react-icons/ci";
import { FaHeart } from "react-icons/fa";
import styles from "./sudoku.module.css";
import { DIFFICULTY_CONFIG } from "./types";
import type { Difficulty, GameMode } from "./types";

type SudokuResultProps = {
  solved: boolean;
  difficulty: Difficulty;
  mode: GameMode;
  elapsedSecondsText: string;
  strikesLeft: number;
  onNewGame: () => void;
};

export function SudokuResult({
  solved,
  difficulty,
  mode,
  elapsedSecondsText,
  strikesLeft,
  onNewGame
}: SudokuResultProps) {
  return (
    <div className={styles.panel}>
      <h2 className={styles.panelTitle}>{solved ? "Puzzle Complete" : "Game Over"}</h2>
      <p className={styles.panelSubtext}>{solved ? "Well played." : "Challenge ended."}</p>

      <div className={styles.resultGrid}>
        <span>Difficulty</span>
        <strong>{DIFFICULTY_CONFIG[difficulty].label}</strong>
        <span>Mode</span>
        <strong>{mode === "practice" ? "Practice" : "Challenge"}</strong>
        <span>Time</span>
        <strong>{elapsedSecondsText}</strong>
        {mode === "challenge" ? (
          <>
            <span>Lives left</span>
            <strong className={styles.resultLives}>
              {Array.from({ length: 3 }, (_, index) =>
                index < strikesLeft ? (
                  <FaHeart key={`result-live-${index}`} className={styles.heartFull} aria-hidden="true" />
                ) : (
                  <CiHeart key={`result-lost-${index}`} className={styles.heartEmpty} aria-hidden="true" />
                )
              )}
            </strong>
          </>
        ) : null}
      </div>

      <button type="button" className={`${styles.button} ${styles.primaryButton}`} onClick={onNewGame}>
        New Game
      </button>
    </div>
  );
}
