"use client";

import { useCallback, useEffect, useState } from "react";

import {
  canvasSize,
  characterHitBoxSize,
  characterMaxLife,
  characterSize,
  itemSize,
} from "./constant";
import { Item } from "./types";
import { useObstacles } from "./hooks/useObstacles";
import {
  clearCanvas,
  drawCharacter,
  drawFood,
  drawItem,
  drawObstacle,
} from "./utils/canvasUtils";
import { useKeyboard } from "./hooks/useKeyboard";
import { useGameLogic } from "./hooks/useGameLogic";
import { useScore } from "./hooks/useScore";
import { useItems } from "./hooks/useItems";
import { useFoods } from "./hooks/useFoods";
import GameCanvas from "./components/game-canvas";

const Home = () => {
  const [survivalTime, setSurvivalTime] = useState<number>(0);
  const {
    level,
    score,
    scoreWeight,
    levelUpScore,
    highScore,
    totalScore,
    readyToLevelUp,
    addScore,
    recordHighScore,
    levelUp,
  } = useScore();
  const {
    life,
    character,
    escaped,
    paused,
    gameOver,
    remainEscapeCount,
    hideCharacter,
    escape,
    setLife,
    onKeyDown,
    moveCharacter,
    onDamage,
  } = useGameLogic(readyToLevelUp, recordHighScore, levelUp);
  const {
    obstacles,
    moveObstacles,
    clearObstacles,
    stopObstacles,
    updateObstacleSpeedWeight,
    damageIfObstacleTouched,
  } = useObstacles(level);

  const { items, consumeItemIfTouched } = useItems(level);
  const { foods, setFoods, eatFoodsIfTouched } = useFoods(scoreWeight);

  const stopLoop = gameOver || paused || readyToLevelUp;
  const keysPressed = useKeyboard(onKeyDown, () => {});

  const activateItem = useCallback(
    (item: Item) => {
      switch (item.effect.title) {
        case "bomb":
          clearObstacles();
          break;
        case "ghost":
          escape(item.effect.duration);
          break;
        case "snail":
          updateObstacleSpeedWeight(0.1, item.effect.duration);
          break;
        case "clock":
          stopObstacles(item.effect.duration);
          break;
        case "magnatic":
          const foodScore = foods.reduce((sum, f) => sum + f.score, 0);
          addScore(foodScore);
          setFoods([]);
          break;
        case "heart":
          setLife((prev) => Math.min(characterMaxLife, prev + 1));
          break;
        case "turtle":
          updateObstacleSpeedWeight(0.5, item.effect.duration);
          break;
      }
    },
    [
      addScore,
      clearObstacles,
      escape,
      foods,
      setFoods,
      setLife,
      stopObstacles,
      updateObstacleSpeedWeight,
    ]
  );
  // 캐릭터 업데이트
  const updateCharacter = useCallback(() => {
    moveCharacter(keysPressed.current);
  }, [keysPressed, moveCharacter]);

  // 게임 루프
  useEffect(() => {
    const updateInterval = setInterval(() => {
      if (stopLoop) return;

      updateCharacter();
      moveObstacles();
      if (!escaped) {
        damageIfObstacleTouched(character, onDamage);
      }
      consumeItemIfTouched(character, activateItem);
      eatFoodsIfTouched(character, (f) => addScore(f.score));
    }, 16); // 약 60FPS

    const timeInterval = setInterval(() => {
      if (stopLoop) return;
      setSurvivalTime((time) => time + 1);
    }, 10);

    return () => {
      clearInterval(updateInterval);
      clearInterval(timeInterval);
    };
  }, [
    activateItem,
    addScore,
    character,
    consumeItemIfTouched,
    damageIfObstacleTouched,
    eatFoodsIfTouched,
    escaped,
    moveObstacles,
    onDamage,
    stopLoop,
    updateCharacter,
  ]);

  const render = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      clearCanvas(ctx, canvasSize, canvasSize, 0.1);
      // 푸드 렌더링
      foods.forEach((f) => {
        drawFood(ctx, f);
      });
      // 아이템 렌더링
      items.forEach((i) => {
        drawItem(ctx, i, itemSize);
      });
      // 장애물 렌더링
      obstacles.forEach((o) => {
        drawObstacle(ctx, o, escaped);
      });
      // 캐릭터 렌더링
      drawCharacter(
        ctx,
        character,
        characterSize,
        characterHitBoxSize,
        hideCharacter,
        escaped
      );
    },
    [character, escaped, foods, hideCharacter, items, obstacles]
  );

  return (
    <div
      tabIndex={0}
      style={{
        outline: "none",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginTop: 50,
      }}
    >
      <p>High Score: {Math.max(totalScore, highScore)}</p>
      <div className="w-[400px] flex items-center justify-between">
        <h1 className="text-lg font-bold">Level {level}</h1>
        <p>
          {Array.from({ length: life })
            .map(() => "♥️")
            .join("")}
        </p>
      </div>
      <div className="w-[400px] flex justify-between text-xs">
        <p>{score}</p>
        <p>{levelUpScore}</p>
      </div>
      <div className="w-[400px] bg-gray-900 h-2 rounded-full mt-1">
        <div
          className="bg-green-500 h-2 rounded-full"
          style={{ width: `${Math.min(100, (score * 100) / levelUpScore)}%` }}
        />
      </div>
      <GameCanvas
        render={render}
        level={level}
        readyToLevelUp={readyToLevelUp}
        paused={paused}
        gameOver={gameOver}
        totalScore={totalScore}
        playTime={survivalTime}
      />
      <div className="w-[400px] p-2">
        <h1>Total Score: {totalScore}</h1>
        <h1>Play Time: {(survivalTime / 100).toFixed(2)} s</h1>
        <h2>
          Press <strong className="text-lg text-orange-500">Shift</strong> to
          move faster
        </h2>
        <h2>
          Press <strong className="text-lg text-orange-500">S</strong> to move
          slower
        </h2>
        <h2>
          Press <strong className="text-lg text-orange-500">E</strong> to
          stealth mode (remaining: {remainEscapeCount})
        </h2>
        <h2>
          Press <strong className="text-lg text-orange-500">ESC</strong> to
          pause
        </h2>
      </div>
    </div>
  );
};

export default Home;
