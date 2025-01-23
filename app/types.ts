export interface Position {
  x: number;
  y: number;
}

export interface Obstacle extends Position {
  dx: number;
  dy: number;
  size: number;
  color: string;
  expression: Expression;
}

export interface ItemEffect {
  title: string;
  duration: number;
  emoji: string;
}

export interface Item extends Position {
  effect: ItemEffect;
}

export interface Food extends Position {
  size: number;
  score: number;
}

export interface Expression {
  eyes: "circle" | "line";
  mouth: "smile" | "frown" | "neutral";
}
