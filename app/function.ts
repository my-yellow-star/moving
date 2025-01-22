export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface Paint<T> {
  color: T;
  ratio: number;
}

export function interpolateMix(
  hex1: string,
  hex2: string,
  ratio: number
): string {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  return rgbToHex({
    r: Math.round(rgb1.r * ratio + rgb2.r * (1 - ratio)),
    g: Math.round(rgb1.g * ratio + rgb2.g * (1 - ratio)),
    b: Math.round(rgb1.b * ratio + rgb2.b * (1 - ratio)),
  });
}

export function hexToRgb(hex: string): RGB {
  const parsed = parseInt(hex.replace("#", ""), 16);
  return {
    r: (parsed >> 16) & 0xff,
    g: (parsed >> 8) & 0xff,
    b: parsed & 0xff,
  };
}

export function rgbToHex(rgb: RGB): string {
  const r = Math.round(rgb.r).toString(16).padStart(2, "0");
  const g = Math.round(rgb.g).toString(16).padStart(2, "0");
  const b = Math.round(rgb.b).toString(16).padStart(2, "0");
  return `#${r}${g}${b}`;
}

export interface Expression {
  eyes: "circle" | "line";
  mouth: "smile" | "frown" | "neutral";
}

export function drawFace(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  expression: Expression
) {
  // 눈 그리기
  ctx.fillStyle = "black";
  if (expression.eyes === "circle") {
    // 동그란 눈
    ctx.beginPath();
    ctx.arc(x + size / 3, y + size / 3, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + (2 * size) / 3, y + size / 3, 2, 0, Math.PI * 2);
    ctx.fill();
  } else if (expression.eyes === "line") {
    // 선형 눈
    ctx.beginPath();
    ctx.moveTo(x + size / 3 - 3, y + size / 3);
    ctx.lineTo(x + size / 3 + 3, y + size / 3);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + (2 * size) / 3 - 3, y + size / 3);
    ctx.lineTo(x + (2 * size) / 3 + 3, y + size / 3);
    ctx.stroke();
  }

  // 입 그리기
  ctx.strokeStyle = "black";
  ctx.beginPath();
  if (expression.mouth === "smile") {
    // 웃는 입
    ctx.arc(x + size / 2, y + (2 * size) / 3, size / 6, 0, Math.PI);
  } else if (expression.mouth === "frown") {
    // 찌푸린 입
    ctx.arc(
      x + size / 2,
      y + (2 * size) / 3 + size / 6,
      size / 6,
      0,
      Math.PI,
      true
    );
  } else if (expression.mouth === "neutral") {
    // 일자형 입
    ctx.moveTo(x + size / 3, y + (2 * size) / 3);
    ctx.lineTo(x + (2 * size) / 3, y + (2 * size) / 3);
  }
  ctx.stroke();
}
