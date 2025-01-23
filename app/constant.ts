export const canvasSize = 400; // 캔버스 크기

/* 캐릭터 관련 */
export const characterSize = 20; // 캐릭터 크기
export const characterHitBoxSize = 5; // 캐릭터 충돌 박스 크기
export const characterNormalSpeed = 3; // 캐릭터 속도
export const characterSlowSpeed = 1; // 캐릭터 느림 속도
export const characterFastSpeed = 5; // 캐릭터 빠름 속도
export const characterMaxLife = 5; // 최대 목숨
export const enableEscapeCount = 3; // 은신 가능 횟수

/* 위치 관련 */
export const centerPosition = {
  x: (canvasSize - characterSize) / 2,
  y: (canvasSize - characterSize) / 2,
};

/* 장애물 관련 */
export const minObstacleSize = 5; // 장애물 최소 크기
export const minObstacleSpeed = 1; // 장애물 최소 속도

/* 아이템 관련 */
export const itemEffects = [
  { title: "ghost", duration: 3000, emoji: "👻" },
  { title: "bomb", duration: 500, emoji: "💣" },
  { title: "snail", duration: 1500, emoji: "🐌" },
  { title: "clock", duration: 1000, emoji: "⏱️" },
  { title: "magnatic", duration: 0, emoji: "🧲" },
  { title: "heart", duration: 0, emoji: "💖" },
  { title: "turtle", duration: 3000, emoji: "🐢" },
]; // 아이템 효과
export const itemSize = 15; // 아이템 크기
export const itemRegenZoneRadius = 100; // 아이템 리젠 거리
