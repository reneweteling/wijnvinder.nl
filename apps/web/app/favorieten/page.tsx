"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, StickyNote, X, Check } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { WineCard, type WineCardWine } from "@/components/wines/wine-card";
import { useFavoritesContext } from "@/lib/favorites-context";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type FavoriteEntry = {
  id: string;
  wineId: string;
  notes: string | null;
  createdAt: string;
  wine: WineCardWine;
};

export default function FavorietenPage() {
  const { data: session, isPending } = authClient.useSession();
  const { toggleFavorite: ctxToggle, updateNotes: ctxUpdateNotes } = useFavoritesContext();
  const [favorites, setFavorites] = useState<FavoriteEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");

  useEffect(() => {
    if (isPending) return;
    if (!session?.user) {
      setLoading(false);
      return;
    }

    fetch("/api/favorieten")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setFavorites(data))
      .finally(() => setLoading(false));
  }, [session, isPending]);

  const removeFavorite = async (wineId: string) => {
    setFavorites((prev) => prev.filter((f) => f.wineId !== wineId));
    await ctxToggle(wineId);
  };

  const startEditNotes = (fav: FavoriteEntry) => {
    setEditingNotes(fav.wineId);
    setNoteText(fav.notes ?? "");
  };

  const saveNotes = async (wineId: string) => {
    const ok = await ctxUpdateNotes(wineId, noteText);
    if (ok) {
      setFavorites((prev) =>
        prev.map((f) =>
          f.wineId === wineId ? { ...f, notes: noteText || null } : f
        )
      );
    }
    setEditingNotes(null);
    setNoteText("");
  };

  // Not logged in
  if (!isPending && !session?.user) {
    return (
      <div className="min-h-screen bg-background pt-24">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <Heart className="h-16 w-16 text-burgundy/30 mx-auto mb-4" />
          <h1 className="font-heading text-3xl font-bold text-foreground mb-3">
            Favorieten
          </h1>
          <p className="text-text-light mb-6">
            Log in om je favoriete wijnen op te slaan en notities toe te voegen.
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/login">
              <Button variant="outline">Inloggen</Button>
            </Link>
            <Link href="/registreren">
              <Button>Aanmelden</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center gap-3 mb-8">
            <Heart className="h-7 w-7 text-burgundy" />
            <h1 className="font-heading text-3xl font-bold text-foreground">
              Mijn favorieten
            </h1>
          </div>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-80 rounded-xl border border-border bg-card animate-pulse"
              />
            ))}
          </div>
        ) : favorites.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Heart className="h-16 w-16 text-burgundy/20 mx-auto mb-4" />
            <p className="text-lg text-text-light mb-2">
              Je hebt nog geen favorieten
            </p>
            <p className="text-sm text-text-light mb-6">
              Klik op het hartje bij een wijn om deze op te slaan.
            </p>
            <Link href="/aanbevelingen">
              <Button>Ontdek wijnen</Button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {favorites.map((fav, i) => (
                <motion.div
                  key={fav.wineId}
                  layout
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  className="relative group/fav"
                >
                  <WineCard wine={fav.wine} index={i} />

                  {/* Overlay controls */}
                  <div className="absolute top-3 right-3 z-10 flex gap-1.5">
                    <motion.button
                      whileTap={{ scale: 0.85 }}
                      onClick={() => startEditNotes(fav)}
                      className="p-1.5 rounded-full bg-white/90 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow"
                      title="Notitie bewerken"
                    >
                      <StickyNote className="h-4 w-4 text-text-light hover:text-gold" />
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.85 }}
                      onClick={() => removeFavorite(fav.wineId)}
                      className="p-1.5 rounded-full bg-white/90 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow"
                      title="Verwijder uit favorieten"
                    >
                      <Heart className="h-4 w-4 fill-burgundy text-burgundy" />
                    </motion.button>
                  </div>

                  {/* Notes display */}
                  {fav.notes && editingNotes !== fav.wineId && (
                    <div
                      className="mx-2 -mt-2 mb-2 p-2.5 bg-gold/5 border border-gold/20 rounded-b-lg text-sm text-foreground cursor-pointer hover:bg-gold/10 transition-colors"
                      onClick={() => startEditNotes(fav)}
                    >
                      <span className="text-gold font-medium text-xs block mb-0.5">
                        Notitie
                      </span>
                      {fav.notes}
                    </div>
                  )}

                  {/* Notes editor */}
                  {editingNotes === fav.wineId && (
                    <div className="mx-2 -mt-2 mb-2 p-2.5 bg-white border border-border rounded-b-lg shadow-md">
                      <textarea
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        placeholder="Bijv. voor bij het hoofdgerecht, cadeau voor Jan..."
                        className="w-full text-sm border border-border rounded-md p-2 resize-none focus:outline-none focus:ring-2 focus:ring-burgundy/30"
                        rows={2}
                        autoFocus
                      />
                      <div className="flex justify-end gap-1.5 mt-1.5">
                        <button
                          onClick={() => {
                            setEditingNotes(null);
                            setNoteText("");
                          }}
                          className="p-1 rounded hover:bg-surface transition-colors"
                        >
                          <X className="h-4 w-4 text-text-light" />
                        </button>
                        <button
                          onClick={() => saveNotes(fav.wineId)}
                          className="p-1 rounded hover:bg-surface transition-colors"
                        >
                          <Check className="h-4 w-4 text-burgundy" />
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
