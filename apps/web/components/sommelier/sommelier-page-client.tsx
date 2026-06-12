"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { SommelierWidget } from "@/components/sommelier/sommelier-widget";

export function SommelierPageClient() {
  return (
    <div className="min-h-screen bg-background">
      {/* Page header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-3xl mx-auto px-4 py-10">
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-5 w-5 text-gold" />
              <span className="text-xs font-semibold uppercase tracking-widest text-gold">
                AI Sommelier
              </span>
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-burgundy mb-3">
              Vraag het Maurice
            </h1>
            <p className="text-text-light max-w-xl leading-relaxed">
              Maurice is onze AI-sommelier. Vertel wat je eet of zoekt en hij kiest passende wijnen uit ons assortiment.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Widget */}
      <SommelierWidget variant="full" />
    </div>
  );
}
