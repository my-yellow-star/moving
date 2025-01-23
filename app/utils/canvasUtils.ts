import { Obstacle, Item, Food, Position } from "../types";

export const clearCanvas = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  opacity = 0.1
) => {
  ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
  ctx.fillRect(0, 0, width, height);
};

export const drawCharacter = (
  ctx: CanvasRenderingContext2D,
  character: Position,
  characterSize: number,
  characterHitBoxSize: number,
  hidden: boolean,
  escaped: boolean
) => {
  if (hidden) {
    ctx.fillStyle = "black";
    ctx.globalAlpha = 0;
  } else {
    ctx.fillStyle = escaped ? "white" : "blue";
    ctx.globalAlpha = escaped ? 0.2 : 1;
  }
  ctx.fillRect(
    character.x - characterSize / 2 + characterHitBoxSize / 2,
    character.y - characterSize / 2 + characterHitBoxSize / 2,
    characterSize,
    characterSize
  );

  ctx.fillStyle = escaped ? "black" : "white";
  ctx.globalAlpha = 1;
  ctx.fillRect(
    character.x,
    character.y,
    characterHitBoxSize,
    characterHitBoxSize
  );
};

export const drawObstacle = (
  ctx: CanvasRenderingContext2D,
  obstacle: Obstacle,
  escaped: boolean
) => {
  ctx.globalAlpha = 1;
  ctx.fillStyle = escaped ? "pink" : obstacle.color;
  ctx.fillRect(obstacle.x, obstacle.y, obstacle.size, obstacle.size);

  // Optionally draw a face on large obstacles
  if (obstacle.size > 20) {
    drawFace(ctx, obstacle.x, obstacle.y, obstacle.size, obstacle.expression);
  }
};

export const drawItem = (
  ctx: CanvasRenderingContext2D,
  item: Item,
  size: number
) => {
  ctx.globalAlpha = 1;
  ctx.font = `${size * 1.5}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(item.effect.emoji, item.x + size / 2, item.y + size / 2);
};

export const drawFood = (ctx: CanvasRenderingContext2D, food: Food) => {
  ctx.fillStyle = "yellow";
  ctx.globalAlpha = 0.1;
  ctx.beginPath();
  ctx.arc(
    food.x - food.size / 2,
    food.y - food.size / 2,
    food.size / 2,
    0,
    Math.PI * 2
  );
  ctx.fill();
};

export const drawFace = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  expression: { eyes: "circle" | "line"; mouth: "smile" | "frown" | "neutral" }
) => {
  // Draw eyes
  ctx.fillStyle = "black";
  if (expression.eyes === "circle") {
    ctx.beginPath();
    ctx.arc(x + size / 3, y + size / 3, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + (2 * size) / 3, y + size / 3, 2, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.moveTo(x + size / 3 - 3, y + size / 3);
    ctx.lineTo(x + size / 3 + 3, y + size / 3);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + (2 * size) / 3 - 3, y + size / 3);
    ctx.lineTo(x + (2 * size) / 3 + 3, y + size / 3);
    ctx.stroke();
  }

  // Draw mouth
  ctx.strokeStyle = "black";
  ctx.beginPath();
  if (expression.mouth === "smile") {
    ctx.arc(x + size / 2, y + (2 * size) / 3, size / 6, 0, Math.PI);
  } else if (expression.mouth === "frown") {
    ctx.arc(
      x + size / 2,
      y + (2 * size) / 3 + size / 6,
      size / 6,
      Math.PI,
      0,
      true
    );
  } else {
    ctx.moveTo(x + size / 3, y + (2 * size) / 3);
    ctx.lineTo(x + (2 * size) / 3, y + (2 * size) / 3);
  }
  ctx.stroke();
};
