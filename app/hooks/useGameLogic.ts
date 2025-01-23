import { useState, useCallback, useRef } from "react";
import {
  canvasSize,
  centerPosition,
  characterFastSpeed,
  characterNormalSpeed,
  characterSize,
  characterSlowSpeed,
  enableEscapeCount,
} from "../constant";

export const useGameLogic = (
  readyToLevelUp: boolean,
  recordHighScore: () => void,
  levelUp: () => void
) => {
  const [character, setCharacter] = useState({
    x: canvasSize / 2,
    y: canvasSize / 2,
  });
  const [escaped, setEscaped] = useState(false);
  const escapedRef = useRef<NodeJS.Timeout | null>(null);
  const [remainEscapeCount, setRemainEscapeCount] = useState(enableEscapeCount);
  const [paused, setPaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [life, setLife] = useState(3);
  const [hideCharacter, setHideCharacter] = useState(false);

  const escape = useCallback((duration: number) => {
    if (escapedRef.current) {
      clearTimeout(escapedRef.current);
    }
    setEscaped(true);
    escapedRef.current = setTimeout(() => {
      setEscaped(false);
    }, duration);
  }, []);

  const onDamage = useCallback(() => {
    if (life === 1) {
      setLife(0);
      setGameOver(true);
      recordHighScore();
    } else {
      setLife((prev) => prev - 1);
      setCharacter(centerPosition);
      const blink = setInterval(() => {
        setHideCharacter((prev) => !prev);
      }, 100);
      setTimeout(() => {
        clearInterval(blink);
        setHideCharacter(false);
      }, 3000);
      escape(5000);
    }
  }, [escape, life, recordHighScore]);

  const moveCharacter = useCallback(
    (pressedKey: { [key: string]: boolean }) => {
      const speed = pressedKey.Shift
        ? characterFastSpeed
        : pressedKey.s
        ? characterSlowSpeed
        : characterNormalSpeed;

      setCharacter((prev) => {
        let { x, y } = prev;

        if (pressedKey.ArrowUp) y = Math.max(0, y - speed);
        if (pressedKey.ArrowDown)
          y = Math.min(canvasSize - characterSize, y + speed);
        if (pressedKey.ArrowLeft) x = Math.max(0, x - speed);
        if (pressedKey.ArrowRight)
          x = Math.min(canvasSize - characterSize, x + speed);

        return { x, y };
      });
    },
    []
  );

  const startNextLevel = useCallback(() => {
    levelUp();
    setEscaped(false);
    setRemainEscapeCount(3);
  }, [levelUp]);

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (
        (e.key === "e" || e.key === "E" || e.key === "ㄷ") &&
        remainEscapeCount > 0 &&
        !escaped
      ) {
        escape(3000);
        setRemainEscapeCount((prev) => prev - 1);
      }
      if ((e.key === "R" || e.key === "r" || e.key === "ㄱ") && gameOver) {
        window.location.reload();
      }
      if (e.key === "Enter") {
        if (readyToLevelUp) {
          startNextLevel();
        } else if (paused) {
          setPaused(false);
        }
      }
      if (e.key === "Escape") {
        setPaused(true);
      }
    },
    [
      escape,
      escaped,
      gameOver,
      paused,
      readyToLevelUp,
      remainEscapeCount,
      startNextLevel,
    ]
  );

  const moveCharacterByJoyStic = useCallback(
    (joyStickMove: { dx: number; dy: number }) => {
      const speedMultiplier = characterFastSpeed; // 이동 속도 배율

      // 속도 계산 및 캐릭터 이동
      setCharacter((prev) => ({
        x: Math.max(
          0,
          Math.min(
            canvasSize - characterSize,
            prev.x + joyStickMove.dx * speedMultiplier
          )
        ),
        y: Math.max(
          0,
          Math.min(
            canvasSize - characterSize,
            prev.y + joyStickMove.dy * speedMultiplier
          )
        ),
      }));
    },
    []
  );

  return {
    character,
    escaped,
    paused,
    gameOver,
    remainEscapeCount,
    life,
    hideCharacter,
    escape,
    setLife,
    onDamage,
    onKeyDown,
    moveCharacter,
    moveCharacterByJoyStic,
    startNextLevel,
  };
};
