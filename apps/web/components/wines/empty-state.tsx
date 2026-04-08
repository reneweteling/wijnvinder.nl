"use client";

import { motion } from "framer-motion";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

type EmptyStateProps = {
  onClearFilters?: () => void;
};

export function EmptyState({ onClearFilters }: EmptyStateProps) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-20 px-6 text-center"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-burgundy-light">
        <SearchX className="h-10 w-10 text-burgundy" />
      </div>

      <h3 className="font-heading text-xl font-semibold text-foreground mb-2">
        Geen wijnen gevonden
      </h3>

      <p className="text-text-light max-w-sm mb-6">
        Er zijn geen wijnen die aan jouw zoekcriteria voldoen. Probeer de
        filters aan te passen of te verwijderen om meer resultaten te zien.
      </p>

      {onClearFilters && (
        <Button variant="outline" onClick={onClearFilters}>
          Filters wissen
        </Button>
      )}
    </motion.div>
  );
}
