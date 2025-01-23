import { useEffect, useRef } from "react";

export const useKeyboard = (
  onKeyDown: (e: KeyboardEvent) => void,
  onKeyUp: (e: KeyboardEvent) => void
) => {
  const keysPressed = useRef<{ [key: string]: boolean }>({});

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!keysPressed.current[e.key]) {
        keysPressed.current[e.key] = true;
        onKeyDown(e);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key] = false;
      onKeyUp(e);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [onKeyDown, onKeyUp]);

  return keysPressed;
};
