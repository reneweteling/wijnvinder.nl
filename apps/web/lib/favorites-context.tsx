"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { authClient } from "@/lib/auth-client";

type FavoriteInfo = { id: string; notes: string | null };
type FavoriteMap = Record<string, FavoriteInfo>;

type FavoritesContextType = {
  isLoggedIn: boolean;
  isFavorite: (wineId: string) => boolean;
  toggleFavorite: (wineId: string) => Promise<boolean>;
  updateNotes: (wineId: string, notes: string) => Promise<boolean>;
  getNotes: (wineId: string) => string | null;
};

const FavoritesContext = createContext<FavoritesContextType>({
  isLoggedIn: false,
  isFavorite: () => false,
  toggleFavorite: async () => false,
  updateNotes: async () => false,
  getNotes: () => null,
});

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { data: session } = authClient.useSession();
  const [favorites, setFavorites] = useState<FavoriteMap>({});
  const isLoggedIn = !!session?.user;

  useEffect(() => {
    if (!isLoggedIn) {
      setFavorites({});
      return;
    }

    fetch("/api/favorieten")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: { wineId: string; id: string; notes: string | null }[]) => {
        const map: FavoriteMap = {};
        for (const fav of data) {
          map[fav.wineId] = { id: fav.id, notes: fav.notes };
        }
        setFavorites(map);
      })
      .catch(() => {});
  }, [isLoggedIn]);

  const isFavorite = useCallback(
    (wineId: string) => wineId in favorites,
    [favorites]
  );

  const toggleFavorite = useCallback(
    async (wineId: string) => {
      if (!isLoggedIn) return false;

      const was = wineId in favorites;
      setFavorites((prev) => {
        if (was) {
          const next = { ...prev };
          delete next[wineId];
          return next;
        }
        return { ...prev, [wineId]: { id: "", notes: null } };
      });

      const res = await fetch("/api/favorieten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wineId }),
      });

      if (!res.ok) {
        setFavorites((prev) => {
          if (was) return { ...prev, [wineId]: { id: "", notes: null } };
          const next = { ...prev };
          delete next[wineId];
          return next;
        });
        return false;
      }

      const data = await res.json();
      if (data.favorited && data.id) {
        setFavorites((prev) => ({
          ...prev,
          [wineId]: { id: data.id, notes: null },
        }));
      }
      return true;
    },
    [isLoggedIn, favorites]
  );

  const updateNotes = useCallback(
    async (wineId: string, notes: string) => {
      if (!isLoggedIn) return false;
      const res = await fetch("/api/favorieten", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wineId, notes }),
      });
      if (res.ok) {
        setFavorites((prev) => ({
          ...prev,
          [wineId]: { ...prev[wineId], notes },
        }));
        return true;
      }
      return false;
    },
    [isLoggedIn]
  );

  const getNotes = useCallback(
    (wineId: string) => favorites[wineId]?.notes ?? null,
    [favorites]
  );

  return (
    <FavoritesContext.Provider
      value={{ isLoggedIn, isFavorite, toggleFavorite, updateNotes, getNotes }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavoritesContext() {
  return useContext(FavoritesContext);
}
