"use client";

import { useEffect, useMemo } from "react";

type Props = { show: boolean };

const makeStarPositions = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    left: (i * 37) % 100,
    top: (i * 53) % 100,
    delay: ((i * 73) % 60) / 100
  }));

export const Celebration = ({ show }: Props) => {
  const stars = useMemo(() => makeStarPositions(24), []);

  useEffect(() => {
    if (!show || typeof window === "undefined") return;
    window?.navigator?.vibrate?.(200);
  }, [show]);

  if (!show) return null;

  return (
    <div className="win-burst">
      {stars.map((star, i) => (
        <span
          key={i}
          className="win-star"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            animationDelay: `${star.delay}s`
          }}
        />
      ))}
      <div className="win-mascot">
        <div className="badge">Super Teenieping!</div>
      </div>
    </div>
  );
};
