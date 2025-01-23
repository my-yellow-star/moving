import { useCallback, useEffect, useState } from "react";

export const useScore = () => {
  const [level, setLevel] = useState(1);
  const scoreWeight = Math.round(Math.pow(2.5, level - 1));
  const levelUpScore = 1000 * scoreWeight;
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [readyToLevelUp, setReadyToLevelUp] = useState(false);

  useEffect(() => {
    if (localStorage && localStorage.getItem("highScore")) {
      setHighScore(Number(localStorage.getItem("highScore")));
    }
  }, []);

  useEffect(() => {
    if (score > levelUpScore) {
      setReadyToLevelUp(true);
    }
  }, [levelUpScore, score]);

  const addScore = useCallback((s: number) => {
    setScore((prev) => prev + s);
    setTotalScore((prev) => prev + s);
  }, []);

  const recordHighScore = useCallback(() => {
    const high = localStorage.getItem("highScore");
    if (!high || Number(high) < totalScore) {
      localStorage.setItem("highScore", `${totalScore}`);
    }
  }, [totalScore]);

  const levelUp = useCallback(() => {
    if (!readyToLevelUp) return;

    setLevel((prev) => prev + 1);
    setReadyToLevelUp(false);
    setScore(0);
  }, [readyToLevelUp]);

  return {
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
  };
};
