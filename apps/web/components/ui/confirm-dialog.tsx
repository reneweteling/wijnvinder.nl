"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** "danger" shows a red confirm button for destructive actions. */
  variant?: "default" | "danger";
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

/**
 * Accessible confirmation modal for sensitive actions (deletes, role changes).
 * Closes on Escape and backdrop click; the confirm button is focused on open.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Bevestigen",
  cancelLabel = "Annuleren",
  variant = "default",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    confirmRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onCancel();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, loading, onCancel]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => !loading && onCancel()}
          />
          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-label={title}
            className="relative w-full max-w-sm bg-card border border-border rounded-xl shadow-xl p-6"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.15 }}
          >
            <h2 className="font-heading text-lg font-semibold text-foreground">
              {title}
            </h2>
            {description && (
              <p className="mt-2 text-sm text-text-light leading-relaxed">
                {description}
              </p>
            )}
            <div className="mt-6 flex justify-end gap-2.5">
              <button
                onClick={onCancel}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-text-light border border-border rounded-lg hover:bg-surface disabled:opacity-50 transition-colors"
              >
                {cancelLabel}
              </button>
              <button
                ref={confirmRef}
                onClick={onConfirm}
                disabled={loading}
                className={`px-4 py-2 text-sm font-medium text-white rounded-lg disabled:opacity-50 transition-colors ${
                  variant === "danger"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-burgundy hover:bg-burgundy-dark"
                }`}
              >
                {loading ? "Bezig..." : confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
