"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

type Props = {
  userId: string;
  currentRole: string;
  isSelf: boolean;
  userLabel?: string;
};

export function RoleToggle({ userId, currentRole, isSelf, userLabel }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const promoting = currentRole !== "admin";
  const targetRole = promoting ? "admin" : "user";
  const label = promoting ? "Maak admin" : "Maak gebruiker";
  const who = userLabel ? `"${userLabel}"` : "deze gebruiker";

  async function handleConfirm() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/gebruikers/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: targetRole }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError((data as { error?: string }).error ?? "Onbekende fout");
      } else {
        setConfirmOpen(false);
        router.refresh();
      }
    } catch {
      setError("Netwerkfout");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        onClick={() => setConfirmOpen(true)}
        disabled={isSelf || loading}
        title={isSelf ? "Je kunt je eigen rol niet wijzigen" : undefined}
        className="text-xs px-2.5 py-1 rounded border border-border text-foreground hover:bg-surface disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? "Bezig..." : label}
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}

      <ConfirmDialog
        open={confirmOpen}
        title={promoting ? "Admin-rechten geven?" : "Admin-rechten intrekken?"}
        description={
          promoting
            ? `Je staat op het punt ${who} volledige beheerrechten te geven. Een admin kan alle wijnen, winkels, gebruikers en jobs beheren.`
            : `Je trekt de beheerrechten van ${who} in. Daarna heeft deze gebruiker geen toegang meer tot het beheer.`
        }
        confirmLabel={promoting ? "Ja, maak admin" : "Ja, trek in"}
        variant={promoting ? "default" : "danger"}
        loading={loading}
        onConfirm={handleConfirm}
        onCancel={() => !loading && setConfirmOpen(false)}
      />
    </div>
  );
}
