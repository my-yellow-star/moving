import { canvasSize, centerPosition, itemEffects } from "../constant";
import { Position, Obstacle, Item, Food, Expression } from "../types";

export const generateRandomPosition = (size: number): Position => {
  return {
    x: Math.random() * (canvasSize - size),
    y: Math.random() * (canvasSize - size),
  };
};

export const generateRandomSafePosition = (
  size: number,
  minDistance: number
): Position => {
  let x, y;
  do {
    x = Math.random() * (canvasSize - size);
    y = Math.random() * (canvasSize - size);
  } while (
    Math.hypot(centerPosition.x - x, centerPosition.y - y) < minDistance
  );
  return { x, y };
};

export const generateObstacle = (
  minSize: number,
  maxSize: number,
  minSpeed: number,
  maxSpeed: number,
  size?: number,
  position?: Position
): Obstacle => {
  const obstacleSize = size ?? minSize + Math.random() * (maxSize - minSize);
  const speed =
    minSpeed +
    ((maxSize - obstacleSize) / (maxSize - minSize)) * (maxSpeed - minSpeed);

  return {
    ...(position ?? generateRandomSafePosition(obstacleSize, 200)),
    dx: (Math.random() - 0.5) * speed,
    dy: (Math.random() - 0.5) * speed,
    size: obstacleSize,
    color: interpolateColor(
      "#a020f0",
      "#ff0000",
      (obstacleSize - minSize) / (maxSize - minSize)
    ),
    expression: generateExpression(obstacleSize),
  };
};

export const generateItem = (): Item => {
  const effect = itemEffects[Math.floor(Math.random() * itemEffects.length)];
  return {
    ...generateRandomPosition(15),
    effect,
  };
};

export const generateFood = (scoreWeight: number): Food => {
  const additional = Math.round(Math.random() * 15);
  const size = 5 + additional / 2;
  return {
    ...generateRandomPosition(size),
    size,
    score: additional + 10 * scoreWeight,
  };
};

export const interpolateColor = (
  startColor: string,
  endColor: string,
  ratio: number
): string => {
  const start = parseInt(startColor.slice(1), 16);
  const end = parseInt(endColor.slice(1), 16);

  const r = Math.round(((end >> 16) - (start >> 16)) * ratio + (start >> 16));
  const g = Math.round(
    (((end >> 8) & 0xff) - ((start >> 8) & 0xff)) * ratio +
      ((start >> 8) & 0xff)
  );
  const b = Math.round(
    ((end & 0xff) - (start & 0xff)) * ratio + (start & 0xff)
  );

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};

export function generateExpression(size: number): Expression {
  return {
    eyes: size > 30 ? "line" : "circle",
    mouth: size > 40 ? "smile" : size > 25 ? "neutral" : "frown",
  };
}
