import { useEffect, useRef } from "react";

const GameCanvas = ({
  render,
  level,
  readyToLevelUp,
  paused,
  gameOver,
  totalScore,
  playTime,
}: {
  render: (ctx: CanvasRenderingContext2D) => void;
  level: number;
  readyToLevelUp: boolean;
  paused: boolean;
  gameOver: boolean;
  totalScore: number;
  playTime: number;
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const animation = () => {
      render(ctx);
    };
    animation();
  }, [render]);

  return (
    <div className="relative mt-1">
      <canvas
        ref={canvasRef}
        width={400}
        height={400}
        style={{ border: "1px solid black" }}
      />
      {readyToLevelUp && (
        <div className="absolute w-full h-full bg-[#000000b1] top-0 left-0 grid place-items-center text-white text-center">
          <div>
            <h1 className="text-xl font-semibold">Level {level} Cleared!</h1>
            <p>
              Press <strong className="text-lg text-green-500">Enter</strong> to
              start next level
            </p>
          </div>
        </div>
      )}
      {paused && (
        <div className="absolute w-full h-full bg-[#000000b1] top-0 left-0 grid place-items-center text-white text-center">
          <div>
            <h1 className="text-xl font-semibold">PAUSED</h1>
            <p>
              Press <strong className="text-lg text-green-500">Enter</strong> to
              resume
            </p>
          </div>
        </div>
      )}
      {gameOver && (
        <div className="absolute w-full h-full bg-[#000000b1] top-0 left-0 grid place-items-center text-white text-center">
          <div>
            <h1 className="text-xl font-semibold">Game Over!</h1>
            <p>Total Score: {totalScore}</p>
            <p>Play Time: {(playTime / 100).toFixed(2)} s</p>

            <p className="mt-4">
              Press <strong className="text-lg text-green-500">R</strong> to
              start next level
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameCanvas;
