import { useCallback, useEffect, useState } from "react";
import { Item, Position } from "../types";
import {
  canvasSize,
  itemSize,
  centerPosition,
  itemRegenZoneRadius,
  itemEffects,
  characterSize,
} from "../constant";

export const useItems = (level: number) => {
  const itemRegenInterval = Math.round(2000 * Math.pow(1.1, level)); // 아이템 리젠 간격
  const [items, setItems] = useState<Item[]>([]);

  const generateItem = useCallback(() => {
    if (items.length > 4) return;

    let x, y;
    do {
      x = Math.random() * (canvasSize - itemSize);
      y = Math.random() * (canvasSize - itemSize);
    } while (
      Math.hypot(centerPosition.x - x, centerPosition.y - y) <
      itemRegenZoneRadius
    );

    const randomEffect =
      itemEffects[Math.floor(Math.random() * itemEffects.length)];

    setItems((prev) => [
      ...prev,
      {
        x,
        y,
        effect: randomEffect,
      },
    ]);
  }, [items.length]);

  const consumeItemIfTouched = useCallback(
    (character: Position, activate: (item: Item) => void) => {
      items.forEach((item) => {
        if (
          character.x < item.x + itemSize &&
          character.x + characterSize > item.x &&
          character.y < item.y + itemSize &&
          character.y + characterSize > item.y
        ) {
          activate(item);
          setItems((prev) => prev.filter((i) => i !== item));
        }
      });
    },
    [items]
  );

  useEffect(() => {
    setItems([]);
  }, [level]);

  useEffect(() => {
    const itemInterval = setInterval(() => {
      generateItem();
    }, itemRegenInterval);

    return () => clearInterval(itemInterval);
  }, [generateItem, itemRegenInterval]);

  return {
    items,
    itemRegenInterval,
    generateItem,
    consumeItemIfTouched,
  };
};
