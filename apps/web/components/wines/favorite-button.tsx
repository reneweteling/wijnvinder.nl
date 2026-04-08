"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";
import { useFavoritesContext } from "@/lib/favorites-context";

type FavoriteButtonProps = {
  wineId: string;
  size?: "sm" | "md";
  className?: string;
};

export function FavoriteButton({
  wineId,
  size = "sm",
  className = "",
}: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite, isLoggedIn } = useFavoritesContext();
  const active = isFavorite(wineId);

  if (!isLoggedIn) return null;

  const iconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  const padding = size === "sm" ? "p-1.5" : "p-2";

  return (
    <motion.button
      whileTap={{ scale: 0.85 }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(wineId);
      }}
      className={`${padding} rounded-full bg-white/90 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow ${className}`}
      aria-label={active ? "Verwijder uit favorieten" : "Voeg toe aan favorieten"}
      title={active ? "Verwijder uit favorieten" : "Voeg toe aan favorieten"}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={active ? "filled" : "outline"}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <Heart
            className={`${iconSize} transition-colors ${
              active
                ? "fill-burgundy text-burgundy"
                : "text-text-light hover:text-burgundy"
            }`}
          />
        </motion.div>
      </AnimatePresence>
    </motion.button>
  );
}
