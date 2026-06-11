"use client";

import { Star } from "lucide-react";

type RatingStarsProps = {
  score: number;
  size?: "sm" | "lg";
};

export function RatingStars({ score, size = "sm" }: RatingStarsProps) {
  const full = Math.floor(score);
  const hasHalf = score - full >= 0.5;
  const empty = 5 - full - (hasHalf ? 1 : 0);
  const dim = size === "lg" ? "h-5 w-5" : "h-3 w-3";

  return (
    <div
      className={`flex items-center ${size === "sm" ? "gap-0.5" : "gap-1"}`}
      aria-label={`Score: ${score} van 5`}
    >
      {Array.from({ length: full }).map((_, i) => (
        <Star key={`f-${i}`} className={`${dim} fill-gold text-gold`} aria-hidden />
      ))}
      {hasHalf && (
        <span className={`relative ${dim} inline-block`} aria-hidden>
          <Star className={`absolute ${dim} text-gold`} aria-hidden />
          <Star
            className={`absolute ${dim} fill-gold text-gold`}
            style={{ clipPath: "inset(0 50% 0 0)" }}
            aria-hidden
          />
        </span>
      )}
      {Array.from({ length: empty }).map((_, i) => (
        <Star key={`e-${i}`} className={`${dim} text-gold`} aria-hidden />
      ))}
    </div>
  );
}
