import { useEffect, useRef } from "react";

const GameCanvas = ({
  render,
  level,
  readyToLevelUp,
  paused,
  gameOver,
  totalScore,
  playTime,
  onClickNextLevel,
  onRestart,
}: {
  render: (ctx: CanvasRenderingContext2D) => void;
  level: number;
  readyToLevelUp: boolean;
  paused: boolean;
  gameOver: boolean;
  totalScore: number;
  playTime: number;
  onClickNextLevel: () => void;
  onRestart: () => void;
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
        <div
          onClick={onClickNextLevel}
          className="absolute w-full h-full bg-[#000000b1] top-0 left-0 grid place-items-center text-white text-center"
        >
          <div>
            <h1 className="text-xl font-semibold">Level {level} Cleared!</h1>
            <p className="max-md:hidden">
              Press <strong className="text-lg text-green-500">Enter</strong> to
              start next level
            </p>
            <p className="md:hidden text-lg">Touch to start next level</p>
          </div>
        </div>
      )}
      {paused && (
        <div className="absolute w-full h-full bg-[#000000b1] top-0 left-0 grid place-items-center text-white text-center">
          <div>
            <h1 className="text-xl font-semibold">PAUSED</h1>
            <p className="max-md:hidden">
              Press <strong className="text-lg text-green-500">Enter</strong> to
              resume
            </p>
            <p className="md:hidden text-lg">Touch to resume</p>
          </div>
        </div>
      )}
      {gameOver && (
        <div className="absolute w-full h-full bg-[#000000b1] top-0 left-0 grid place-items-center text-white text-center">
          <div onClick={onRestart}>
            <h1 className="text-xl font-semibold">Game Over!</h1>
            <div className="text-sm">
              <p>Total Score: {totalScore}</p>
              <p>Play Time: {(playTime / 100).toFixed(2)} s</p>
            </div>
            <p className="mt-4 max-md:hidden">
              Press <strong className="text-lg text-green-500">R</strong> to
              Restart
            </p>
            <p className="mt-4 md:hidden text-lg">Touch to Restart</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameCanvas;
