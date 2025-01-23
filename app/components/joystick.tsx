import React, { useState, useEffect, useRef, useCallback } from "react";

interface JoystickProps {
  onMove: (direction: { dx: number; dy: number }) => void;
  size?: number;
}

const Joystick: React.FC<JoystickProps> = ({ onMove, size = 100 }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 }); // 핸들의 현재 위치
  const centerRef = useRef<{ x: number; y: number } | null>(null); // 중심점 저장

  const handleTouchStart = useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      setIsDragging(true);
      const touch = event.touches[0];
      // 중심점을 처음 터치한 위치로 설정
      centerRef.current = {
        x: touch.clientX,
        y: touch.clientY,
      };
      setPosition({ x: 0, y: 0 }); // 핸들 초기화
    },
    []
  );

  const handleTouchMove = useCallback(
    (event: TouchEvent) => {
      if (!isDragging || !centerRef.current) return;

      const touch = event.touches[0];
      const dx = touch.clientX - centerRef.current.x;
      const dy = touch.clientY - centerRef.current.y;

      const distance = Math.sqrt(dx * dx + dy * dy);
      const maxDistance = size / 2;

      // 핸들의 최대 이동 거리 제한
      const clampedDistance = Math.min(distance, maxDistance);
      const angle = Math.atan2(dy, dx);

      const x = Math.cos(angle) * clampedDistance;
      const y = Math.sin(angle) * clampedDistance;

      setPosition({ x, y });
      onMove({ dx: x / maxDistance, dy: y / maxDistance });
    },
    [isDragging, onMove, size]
  );

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    setPosition({ x: 0, y: 0 });
    onMove({ dx: 0, dy: 0 }); // 입력 초기화
  }, [onMove]);

  useEffect(() => {
    const handleTouchMoveWrapper = (e: TouchEvent) => handleTouchMove(e);

    if (isDragging) {
      window.addEventListener("touchmove", handleTouchMoveWrapper);
      window.addEventListener("touchend", handleTouchEnd);
    } else {
      window.removeEventListener("touchmove", handleTouchMoveWrapper);
      window.removeEventListener("touchend", handleTouchEnd);
    }

    return () => {
      window.removeEventListener("touchmove", handleTouchMoveWrapper);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isDragging, handleTouchMove, handleTouchEnd]);

  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        background: "rgba(255, 255, 255, 0.2)",
        borderRadius: "50%",
        touchAction: "none",
      }}
      onTouchStart={handleTouchStart}
    >
      <div
        style={{
          position: "absolute",
          top: `calc(50% + ${position.y}px - ${size / 4}px)`,
          left: `calc(50% + ${position.x}px - ${size / 4}px)`,
          width: size / 2,
          height: size / 2,
          background: "rgba(255, 255, 255, 0.8)",
          borderRadius: "50%",
        }}
      />
    </div>
  );
};

export default Joystick;
