"use client";

import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";
import { SudokuGameView } from "@/components/sudoku/SudokuGameView";
import { SudokuMenu } from "@/components/sudoku/SudokuMenu";
import { SudokuResult } from "@/components/sudoku/SudokuResult";
import { formatTime } from "@/components/sudoku/engine";
import { useSudokuGame } from "@/components/sudoku/useSudokuGame";
import styles from "@/components/sudoku/sudoku.module.css";
import { CiCircleInfo, CiHeart } from "react-icons/ci";
import { FaClock, FaHeart } from "react-icons/fa";

export default function Home() {
  const game = useSudokuGame();

  return (
    <BackgroundGradientAnimation
      gradientBackgroundStart="rgb(8, 27, 43)"
      gradientBackgroundEnd="rgb(18, 51, 70)"
      firstColor="56, 193, 182"
      secondColor="52, 130, 246"
      thirdColor="255, 201, 107"
      fourthColor="38, 111, 144"
      fifthColor="21, 82, 116"
      pointerColor="255, 179, 102"
      blendingValue="soft-light"
      size="85%"
      interactive={false}
      containerClassName="sudoku-bg-layer min-h-screen h-auto w-full"
    >
      <main className={styles.page}>
        <div className={styles.layout}>
          {game.view === "game" ? (
            <aside className={styles.extraInfo} aria-live="polite">
              <span className={styles.infoChip}>
                <FaClock className={styles.chipIcon} aria-hidden="true" />
                <span className={styles.timeValue}>{formatTime(game.elapsedSeconds)}</span>
              </span>

              {game.mode === "challenge" ? (
                <span className={game.strikePulse ? `${styles.infoChip} ${styles.lives} ${styles.pulse}` : `${styles.infoChip} ${styles.lives}`}>
                  <span className={styles.srOnly}>Lives left: {game.strikesLeft}</span>
                  {Array.from({ length: 3 }, (_, index) =>
                    index < game.strikesLeft ? (
                      <FaHeart key={`live-${index}`} className={styles.heartFull} aria-hidden="true" />
                    ) : (
                      <CiHeart key={`lost-${index}`} className={styles.heartEmpty} aria-hidden="true" />
                    )
                  )}
                </span>
              ) : null}

              <span className={`${styles.infoChip} ${styles.statusChip} ${styles[game.statusClass]}`}>
                <CiCircleInfo className={styles.chipIcon} aria-hidden="true" />
                <span className={styles.statusText}>{game.statusText}</span>
              </span>
            </aside>
          ) : null}

          <section className={styles.card}>
            <h1 className={styles.title}>Sudoku Studio</h1>
            <p className={styles.subtitle}>Structured, clean, and focused gameplay.</p>

          {game.view === "menu" ? (
            <SudokuMenu
              difficulty={game.difficulty}
              mode={game.mode}
              onDifficultyChange={game.setDifficulty}
              onModeChange={game.setMode}
              onStart={() => game.startGame(game.difficulty, game.mode)}
            />
          ) : null}

          {game.view === "game" ? (
            <SudokuGameView
              board={game.board}
              puzzle={game.game.puzzle}
              mode={game.mode}
              selectedCell={game.selectedCell}
              selectedCoords={game.selectedCoords}
              selectedValue={game.selectedValue as number | null}
              conflicts={game.conflicts}
              lastWrongCell={game.lastWrongCell}
              useCustomKeyboard={game.useCustomKeyboard}
              gameStatus={game.gameStatus}
              selectedCellFixed={game.selectedCellFixed}
              setInputRef={game.setInputRef}
              onSelectCell={game.setSelectedCell}
              onCellChange={game.handleCellChange}
              onCellKeyDown={game.handleCellKeyDown}
              onNumpad={game.handleNumpad}
              onReset={game.resetCurrentGame}
              onMenu={game.goToMenu}
              onReveal={game.revealSolution}
            />
          ) : null}

          {game.view === "result" ? (
            <SudokuResult
              solved={game.isSolved}
              difficulty={game.difficulty}
              mode={game.mode}
              elapsedSecondsText={formatTime(game.elapsedSeconds)}
              strikesLeft={game.strikesLeft}
              onNewGame={game.goToMenu}
            />
          ) : null}

          </section>

          <footer className={styles.licenseFooter}>
            © 2026 Fernando Vela Hidalgo. All rights reserved.
          </footer>
        </div>
      </main>
    </BackgroundGradientAnimation>
  );
}
