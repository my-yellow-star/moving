"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { drawFace, Expression, interpolateMix } from "./function";

interface Position {
  x: number;
  y: number;
}

interface Obstacle extends Position {
  dx: number;
  dy: number;
  size: number;
  color: string;
  expression: Expression;
}

interface ItemEffect {
  title: "ghost" | "bomb" | "snail" | "clock" | "magnatic" | "heart" | "turtle";
  duration: number;
  emoji: string;
}

const effects: ItemEffect[] = [
  { title: "ghost", duration: 3000, emoji: "👻" },
  { title: "bomb", duration: 500, emoji: "💣" },
  { title: "snail", duration: 1500, emoji: "🐌" },
  { title: "clock", duration: 1000, emoji: "⏱️" },
  { title: "magnatic", duration: 0, emoji: "🧲" },
  { title: "heart", duration: 0, emoji: "💖" },
  { title: "turtle", duration: 3000, emoji: "🐢" },
];

interface Item extends Position {
  effect: ItemEffect;
}

interface Food extends Position {
  size: number;
  score: number;
}

const Home = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [survivalTime, setSurvivalTime] = useState<number>(0);
  const [level, setLevel] = useState(1);

  const canvasSize = 400; // 캔버스 크기
  const characterSize = 20; // 캐릭터 크기
  const characterHitBoxSize = 5; // 캐릭터 충돌 박스 크기
  const minObstacleSize = 5; // 장애물 최소 크기
  const maxObstacleSize = 10 + 4 * level; // 장애물 최대 크기
  const minObstacleSpeed = 1; // 장애물 최소 속도
  const maxObstacleSpeed = 3 + 0.5 * level; // 장애물 최대 속도
  const obstaclesCount = 3 + level; // 최초 장애물 개수
  const normalSpeed = 3; // 캐릭터 속도
  const slowSpeed = 1; // 캐릭터 느림 속도
  const fastSpeed = 5; // 캐릭터 빠름 속도
  const enableEscapeCount = 3; // 은신 가능 횟수
  const itemSize = 15; // 아이템 크기
  const itemRegenZoneRadius = 100; // 아이템 리젠 거리
  const itemRegenInterval = 500 * level; // 아이템 리젠 간격
  const maxLife = 5; // 최대 목숨
  const [escaped, setEscaped] = useState(false); // 은신 상태
  const escapedRef = useRef<NodeJS.Timeout | null>(null);
  const [escapeCount, setEscapeCount] = useState(enableEscapeCount);
  const [obstacleSpeedWeight, setObstacleSpeedWeight] = useState(1);
  const obstacleSpeedWeightRef = useRef<NodeJS.Timeout | null>(null);
  const [cleared, setCleared] = useState(false);
  const [stopped, setStopped] = useState(false);
  const [manualPaused, setManualPaused] = useState(false);
  const [levelUpPaused, setLevelUpPaused] = useState(false);
  const paused = manualPaused || levelUpPaused;
  const [highScore, setHighScore] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [score, setScore] = useState(0);
  const scoreWeight = Math.round(Math.pow(2.5, level - 1));
  const levelUpScore = 1000 * scoreWeight;

  const centerPosition: Position = useMemo(
    () => ({
      x: (canvasSize - characterSize) / 2,
      y: (canvasSize - characterSize) / 2,
    }),
    []
  );

  const [character, setCharacter] = useState<Position>(centerPosition);
  const [obstacles, setObstacles] = useState<Obstacle[]>(
    Array.from({ length: obstaclesCount }, () => ({
      x: 0,
      y: 0,
      dx: (Math.random() - 0.5) * maxObstacleSpeed,
      dy: (Math.random() - 0.5) * maxObstacleSpeed,
      size: minObstacleSize,
      color: "#ff0000",
      expression: { eyes: "circle", mouth: "frown" },
    }))
  );
  const [item, setItem] = useState<Item | null>(null);
  const [foods, setFoods] = useState<Food[]>([]);
  const [life, setLife] = useState(3);
  const [hideCharacter, setHideCharacter] = useState(false);

  const keysPressed = useRef<{ [key: string]: boolean }>({
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    Shift: false,
    s: false,
  });

  // 게임 초기화
  const restartGame = useCallback(() => {
    window.location.reload();
  }, []);

  const updateObstacleSpeedWeight = (weight: number, duration: number) => {
    if (obstacleSpeedWeightRef.current) {
      clearTimeout(obstacleSpeedWeightRef.current);
    }
    setObstacleSpeedWeight(weight);
    obstacleSpeedWeightRef.current = setTimeout(
      () => setObstacleSpeedWeight(1),
      duration
    );
  };

  const startNextLevel = useCallback(() => {
    setLevel((prev) => prev + 1);
    setEscaped(false);
    setEscapeCount(3);
    updateObstacleSpeedWeight(1, 0);
    setCleared(false);
    setStopped(false);
    setLevelUpPaused(false);
    setCharacter(centerPosition);
    setObstacles(
      Array.from({ length: obstaclesCount }, () => ({
        x: 0,
        y: 0,
        dx: (Math.random() - 0.5) * maxObstacleSpeed,
        dy: (Math.random() - 0.5) * maxObstacleSpeed,
        size: minObstacleSize,
        color: "#ff0000",
        expression: { eyes: "circle", mouth: "frown" },
      }))
    );
    setItem(null);
    setFoods([]);
    setScore(0);
  }, [centerPosition, maxObstacleSpeed, obstaclesCount]);

  // 키 이벤트 처리
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (keysPressed.current[e.key] !== undefined) {
        keysPressed.current[e.key] = true;
      }
      if (
        (e.key === "e" || e.key === "E" || e.key === "ㄷ") &&
        escapeCount > 0 &&
        !escaped
      ) {
        if (escapedRef.current) {
          clearTimeout(escapedRef.current);
        }
        setEscaped(true);
        setEscapeCount((prev) => prev - 1);
        escapedRef.current = setTimeout(() => setEscaped(false), 3000);
      }
      if ((e.key === "R" || e.key === "r" || e.key === "ㄱ") && gameOver) {
        restartGame();
      }
      if (e.key === "Enter") {
        if (levelUpPaused) {
          startNextLevel();
        } else if (manualPaused) {
          setManualPaused(false);
        }
      }
      if (e.key === "Escape") {
        setManualPaused(true);
      }
    },
    [
      escapeCount,
      escaped,
      gameOver,
      levelUpPaused,
      manualPaused,
      restartGame,
      startNextLevel,
    ]
  );

  const handleKeyUp = (e: KeyboardEvent) => {
    if (keysPressed.current[e.key] !== undefined) {
      keysPressed.current[e.key] = false;
    }
  };

  // 장애물 이동
  const moveObstacles = useCallback(() => {
    if (stopped) return;

    setObstacles((obs) =>
      obs.map((o) => {
        const newX = o.x + o.dx * obstacleSpeedWeight;
        const newY = o.y + o.dy * obstacleSpeedWeight;
        if (newX < 0 || newX > 400 - o.size) o.dx *= -1;
        if (newY < 0 || newY > 400 - o.size) o.dy *= -1;
        return { ...o, x: newX, y: newY };
      })
    );
  }, [obstacleSpeedWeight, stopped]);

  const die = useCallback(() => {
    if (life === 1) {
      setLife(0);
      setGameOver(true);
      const high = localStorage.getItem("highScore");
      if (!high || Number(high) < totalScore) {
        localStorage.setItem("highScore", `${totalScore}`);
      }
    } else {
      setLife((prev) => prev - 1);
      if (escapedRef.current) {
        clearTimeout(escapedRef.current);
      }
      setEscaped(true);
      setCharacter(centerPosition);
      const blink = setInterval(() => {
        setHideCharacter((prev) => !prev);
      }, 100);
      setTimeout(() => {
        clearInterval(blink);
      }, 3000);
      escapedRef.current = setTimeout(() => {
        setEscaped(false);
      }, 5000);
    }
  }, [centerPosition, life, totalScore]);

  // 장애물 충돌 감지
  const checkObstacleCollision = useCallback(() => {
    obstacles.forEach((o) => {
      if (
        character.x < o.x + o.size &&
        character.x + characterHitBoxSize > o.x &&
        character.y < o.y + o.size &&
        character.y + characterHitBoxSize > o.y &&
        !escaped
      ) {
        die();
      }
    });
  }, [character.x, character.y, die, escaped, obstacles]);

  // 장애물 생성 함수
  const generateObstacle: () => Obstacle = useCallback(() => {
    let x, y;
    const size =
      minObstacleSize + Math.random() * (maxObstacleSize - minObstacleSize);

    if (Math.random() > 0.5) {
      x = Math.random() > 0.5 ? 0 - size : canvasSize;
      y = Math.random() * (canvasSize - size);
    } else {
      x = Math.random() * (canvasSize - size);
      y = Math.random() > 0.5 ? 0 - size : canvasSize;
    }

    const speed =
      minObstacleSpeed +
      ((maxObstacleSize - size) / (maxObstacleSize - minObstacleSize)) *
        (maxObstacleSpeed - minObstacleSpeed);

    return {
      x,
      y,
      dx: (Math.random() - 0.5) * speed,
      dy: (Math.random() - 0.5) * speed,
      size,
      color: interpolateMix(
        "#ff0000",
        "#a020f0",
        1 -
          (size - minObstacleSize) /
            (Math.max(50, maxObstacleSize) - minObstacleSize)
      ),
      expression: {
        eyes: size > 30 ? "line" : "circle",
        mouth: size > 40 ? "smile" : size > 25 ? "neutral" : "frown",
      },
    };
  }, [maxObstacleSize, maxObstacleSpeed]);

  const generateItem = useCallback(() => {
    if (item !== null) return;

    let x, y;
    do {
      x = Math.random() * (canvasSize - itemSize);
      y = Math.random() * (canvasSize - itemSize);
    } while (
      Math.hypot(centerPosition.x - x, centerPosition.y - y) <
      itemRegenZoneRadius
    );

    const randomEffect = effects[Math.floor(Math.random() * effects.length)];

    setItem({
      x,
      y,
      effect: randomEffect,
    });
  }, [centerPosition.x, centerPosition.y, item]);

  const generateFood: () => Food = useCallback(() => {
    const additional = Math.round(Math.random() * 15);
    return {
      x: Math.random() * (canvasSize - 20),
      y: Math.random() * (canvasSize - 20),
      size: 5 + additional / 2,
      score: additional + 10 * scoreWeight,
    };
  }, [scoreWeight]);

  const activateEffect = useCallback(
    (item: Item) => {
      switch (item.effect.title) {
        case "bomb":
          setCleared(true);
          setObstacles((prev) =>
            prev.filter((e) => e.size === minObstacleSize)
          );
          setTimeout(() => setCleared(false), item.effect.duration);
          break;
        case "ghost":
          if (escapedRef.current) {
            clearTimeout(escapedRef.current);
          }
          setEscaped(true);
          escapedRef.current = setTimeout(
            () => setEscaped(false),
            item.effect.duration
          );
          break;
        case "snail":
          updateObstacleSpeedWeight(0.1, item.effect.duration);
          break;
        case "clock":
          setStopped(true);
          setTimeout(() => setStopped(false), item.effect.duration);
          break;
        case "magnatic":
          const foodScore = foods.reduce((sum, f) => sum + f.score, 0);
          setTotalScore((prev) => (prev += foodScore));
          setScore((prev) => (prev += foodScore));
          setFoods([]);
          break;
        case "heart":
          setLife((prev) => Math.min(maxLife, prev + 1));
          break;
        case "turtle":
          updateObstacleSpeedWeight(0.5, item.effect.duration);
          break;
      }
    },
    [foods]
  );

  // 캐릭터와 아이템 상호작용
  const checkItemCollision = useCallback(() => {
    if (
      item &&
      character.x < item.x + itemSize &&
      character.x + characterSize > item.x &&
      character.y < item.y + itemSize &&
      character.y + characterSize > item.y
    ) {
      activateEffect(item);
      setItem(null); // 아이템 제거
    }
  }, [activateEffect, character.x, character.y, item]);

  // 푸드 상호작용
  const checkFoodCollision = useCallback(() => {
    foods.forEach((f) => {
      if (
        character.x < f.x + f.size + characterSize / 2 &&
        character.x > f.x - f.size - characterSize / 2 &&
        character.y < f.y + f.size + characterSize / 2 &&
        character.y > f.y - f.size - characterSize / 2
      ) {
        setFoods((prev) => prev.filter((e) => e !== f));
        setTotalScore((prev) => prev + f.score);
        setScore((prev) => prev + f.score);
      }
    });
  }, [character.x, character.y, foods]);

  // 캐릭터 업데이트
  const updateCharacter = () => {
    const speed = keysPressed.current.Shift
      ? fastSpeed
      : keysPressed.current.s
      ? slowSpeed
      : normalSpeed;

    setCharacter((prev) => {
      let { x, y } = prev;

      if (keysPressed.current.ArrowUp) y = Math.max(0, y - speed);
      if (keysPressed.current.ArrowDown)
        y = Math.min(400 - characterSize, y + speed);
      if (keysPressed.current.ArrowLeft) x = Math.max(0, x - speed);
      if (keysPressed.current.ArrowRight)
        x = Math.min(400 - characterSize, x + speed);

      return { x, y };
    });
  };

  useEffect(() => {
    if (localStorage && localStorage.getItem("highScore")) {
      setHighScore(Number(localStorage.getItem("highScore")));
    }
  }, []);

  // 게임 루프
  useEffect(() => {
    const updateInterval = setInterval(() => {
      if (gameOver || paused) return;

      updateCharacter();
      moveObstacles();
      checkObstacleCollision();
      checkItemCollision();
      checkFoodCollision();
    }, 16); // 약 60FPS

    const timeInterval = setInterval(() => {
      if (gameOver || paused) return;
      setSurvivalTime((time) => time + 1);
    }, 10);

    return () => {
      clearInterval(updateInterval);
      clearInterval(timeInterval);
    };
  }, [
    checkFoodCollision,
    checkItemCollision,
    checkObstacleCollision,
    gameOver,
    generateItem,
    generateObstacle,
    paused,
    moveObstacles,
  ]);

  useEffect(() => {
    const obstacleInterval = setInterval(() => {
      if (gameOver || cleared || paused) return;

      setObstacles((prev) => [...prev, generateObstacle()]);
    }, 1000);

    const itemInterval = setInterval(() => {
      if (gameOver || paused) return;

      generateItem();
    }, itemRegenInterval);

    const foodInterval = setInterval(() => {
      if (gameOver || paused) return;

      setFoods((prev) => [...prev, generateFood()]);
    }, 500);

    return () => {
      clearInterval(obstacleInterval);
      clearInterval(itemInterval);
      clearInterval(foodInterval);
    };
  }, [
    cleared,
    gameOver,
    generateFood,
    generateItem,
    generateObstacle,
    itemRegenInterval,
    paused,
  ]);

  useEffect(() => {
    if (score > levelUpScore) {
      setLevelUpPaused(true);
    }
  }, [level, levelUpScore, score]);

  // 캔버스 렌더링
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const render = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.1)"; // 자취 남김
      ctx.fillRect(0, 0, canvasSize, canvasSize);

      // 푸드 렌더링
      ctx.fillStyle = "yellow";
      ctx.globalAlpha = 0.1;
      foods.forEach((f) => {
        ctx.beginPath();
        ctx.arc(f.x - f.size / 2, f.y - f.size / 2, f.size / 2, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      // 아이템 렌더링
      if (item) {
        ctx.font = `${itemSize * 1.5}px Arial`; // 이모지 크기 설정
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(
          item.effect.emoji,
          item.x + itemSize / 2, // 이모지 중심 맞추기
          item.y + itemSize / 2
        );
      }

      // 장애물 렌더링
      obstacles.forEach((o) => {
        if (escaped) {
          ctx.fillStyle = "pink";
        } else {
          ctx.fillStyle = o.color;
        }
        ctx.fillRect(o.x, o.y, o.size, o.size);

        if (o.size > 20) {
          drawFace(ctx, o.x, o.y, o.size, o.expression);
        }
      });

      // 캐릭터 렌더링
      if (hideCharacter) {
        ctx.fillStyle = "black";
        ctx.globalAlpha = 0;
      } else if (escaped) {
        ctx.fillStyle = "green";
        ctx.globalAlpha = 0.5;
      } else {
        ctx.fillStyle = "blue";
        ctx.globalAlpha = 1;
      }
      ctx.fillRect(
        character.x - characterSize / 2 + characterHitBoxSize / 2,
        character.y - characterSize / 2 + characterHitBoxSize / 2,
        characterSize,
        characterSize
      );

      ctx.fillStyle = "white";
      ctx.globalAlpha = 1;
      ctx.fillRect(
        character.x,
        character.y,
        characterHitBoxSize,
        characterHitBoxSize
      );
    };

    render();
  }, [character, escaped, foods, hideCharacter, item, obstacles]);

  // 키 이벤트 리스너 추가
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleKeyDown]);

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
      <div className="w-[400px] bg-gray-900 h-2 rounded-full mt-1">
        <div
          className="bg-green-500 h-2 rounded-full"
          style={{ width: `${Math.min(100, (score * 100) / levelUpScore)}%` }}
        />
      </div>
      <div className="w-[400px] flex justify-between text-xs">
        <p>{score}</p>
        <p>{levelUpScore}</p>
      </div>
      <div className="relative mt-2">
        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          style={{ border: "1px solid black" }}
        />
        {levelUpPaused && (
          <div className="absolute w-full h-full bg-[#000000b1] top-0 left-0 grid place-items-center text-white text-center">
            <div>
              <h1 className="text-xl font-semibold">Level {level} Cleared!</h1>
              <p>
                Press <strong className="text-lg text-green-500">Enter</strong>{" "}
                to start next level
              </p>
            </div>
          </div>
        )}
        {manualPaused && (
          <div className="absolute w-full h-full bg-[#000000b1] top-0 left-0 grid place-items-center text-white text-center">
            <div>
              <h1 className="text-xl font-semibold">PAUSED</h1>
              <p>
                Press <strong className="text-lg text-green-500">Enter</strong>{" "}
                to resume
              </p>
            </div>
          </div>
        )}
        {gameOver && (
          <div className="absolute w-full h-full bg-[#000000b1] top-0 left-0 grid place-items-center text-white text-center">
            <div>
              <h1 className="text-xl font-semibold">Game Over!</h1>
              <p>Total Score: {totalScore}</p>
              <p>Play Time: {(survivalTime / 100).toFixed(2)} s</p>
              <p className="mt-4">
                Press <strong className="text-lg text-green-500">R</strong> to
                start next level
              </p>
            </div>
          </div>
        )}
      </div>
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
          stealth mode (remaining: {escapeCount})
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
