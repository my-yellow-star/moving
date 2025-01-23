import { useState, useCallback, useRef, useEffect } from "react";
import { Obstacle, Position } from "../types";
import { generateObstacle } from "../utils/gameUtils";
import {
  characterHitBoxSize,
  minObstacleSize,
  minObstacleSpeed,
} from "../constant";

export const useObstacles = (level: number) => {
  const obstaclesCount = 3 + level; // 최초 장애물 개수
  const maxObstacleSize = 10 + 4 * level; // 장애물 최대 크기
  const maxObstacleSpeed = 3 + 0.5 * level; // 장애물 최대 속도
  const obstacleRegenInterval = Math.round(2500 * Math.pow(0.97, level));

  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [speedWeight, setSpeedWeight] = useState(1);
  const speedWeightTimoutRef = useRef<NodeJS.Timeout | null>(null);
  const [stopped, setStopped] = useState(false);
  const stopTimoutRef = useRef<NodeJS.Timeout | null>(null);

  const moveObstacles = useCallback(() => {
    if (stopped) return;

    setObstacles((obs) =>
      obs.map((o) => {
        const newX = o.x + o.dx * speedWeight;
        const newY = o.y + o.dy * speedWeight;

        if (newX < 0 || newX > 400 - o.size) o.dx *= -1;
        if (newY < 0 || newY > 400 - o.size) o.dy *= -1;

        return { ...o, x: newX, y: newY };
      })
    );
  }, [speedWeight, stopped]);

  const addObstacle = useCallback(() => {
    setObstacles((prev) => [
      ...prev,
      generateObstacle(
        minObstacleSize,
        maxObstacleSize,
        minObstacleSpeed,
        maxObstacleSpeed
      ),
    ]);
  }, [maxObstacleSize, maxObstacleSpeed]);

  const clearObstacles = useCallback(() => {
    setObstacles([]);
  }, []);

  const refreshObstacles = useCallback(() => {
    setObstacles(
      Array.from({ length: obstaclesCount }, () =>
        generateObstacle(
          minObstacleSize,
          maxObstacleSize,
          minObstacleSpeed,
          maxObstacleSpeed,
          minObstacleSize,
          {
            x: 0,
            y: 0,
          }
        )
      )
    );
  }, [maxObstacleSize, maxObstacleSpeed, obstaclesCount]);

  /* level 변경 시 장애물 초기화 */
  useEffect(() => {
    refreshObstacles();
  }, [refreshObstacles]);

  const updateObstacleSpeedWeight = useCallback(
    (weight: number, duration: number) => {
      if (speedWeightTimoutRef.current) {
        clearTimeout(speedWeightTimoutRef.current);
      }
      setSpeedWeight(weight);
      speedWeightTimoutRef.current = setTimeout(() => {
        setSpeedWeight(1);
      }, duration);
    },
    []
  );

  const stopObstacles = useCallback((duration: number) => {
    if (stopTimoutRef.current) {
      clearTimeout(stopTimoutRef.current);
    }
    setStopped(true);
    stopTimoutRef.current = setTimeout(() => {
      setStopped(false);
    }, duration);
  }, []);

  const damageIfObstacleTouched = useCallback(
    (character: Position, onDamage: () => void) => {
      obstacles.forEach((o) => {
        if (
          character.x < o.x + o.size &&
          character.x + characterHitBoxSize > o.x &&
          character.y < o.y + o.size &&
          character.y + characterHitBoxSize > o.y
        ) {
          onDamage();
        }
      });
    },
    [obstacles]
  );

  useEffect(() => {
    const obstacleInterval = setInterval(() => {
      addObstacle();
    }, obstacleRegenInterval);

    return () => clearInterval(obstacleInterval);
  }, [addObstacle, obstacleRegenInterval]);

  return {
    obstacles,
    obstacleRegenInterval,
    moveObstacles,
    addObstacle,
    clearObstacles,
    stopObstacles,
    updateObstacleSpeedWeight,
    damageIfObstacleTouched,
  };
};
