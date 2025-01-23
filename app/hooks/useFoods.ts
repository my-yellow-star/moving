import { useCallback, useEffect, useState } from "react";
import { Food, Position } from "../types";
import { canvasSize, characterSize } from "../constant";

export const useFoods = (scoreWeight: number) => {
  const [foods, setFoods] = useState<Food[]>([]);
  const foodRegenInterval = 500;

  const generateFood = useCallback(() => {
    const additional = Math.round(Math.random() * 15);
    const food = {
      x: Math.random() * (canvasSize - 20),
      y: Math.random() * (canvasSize - 20),
      size: 5 + additional / 2,
      score: additional + 10 * scoreWeight,
    };
    setFoods((prev) => [...prev, food]);
  }, [scoreWeight]);

  const eatFoodsIfTouched = useCallback(
    (character: Position, eat: (food: Food) => void) => {
      foods.forEach((f) => {
        if (
          character.x < f.x + f.size + characterSize / 2 &&
          character.x > f.x - f.size - characterSize / 2 &&
          character.y < f.y + f.size + characterSize / 2 &&
          character.y > f.y - f.size - characterSize / 2
        ) {
          setFoods((prev) => prev.filter((e) => e !== f));
          eat(f);
        }
      });
    },
    [foods]
  );

  useEffect(() => {
    const foodInterval = setInterval(() => {
      generateFood();
    }, foodRegenInterval);

    return () => {
      clearInterval(foodInterval);
    };
  }, [generateFood]);

  return {
    foods,
    foodRegenInterval,
    setFoods,
    generateFood,
    eatFoodsIfTouched,
  };
};
