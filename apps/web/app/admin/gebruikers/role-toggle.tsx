"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  userId: string;
  currentRole: string;
  isSelf: boolean;
};

export function RoleToggle({ userId, currentRole, isSelf }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const targetRole = currentRole === "admin" ? "user" : "admin";
  const label = currentRole === "admin" ? "Maak gebruiker" : "Maak admin";

  async function handleClick() {
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
        onClick={handleClick}
        disabled={isSelf || loading}
        title={isSelf ? "Je kunt je eigen rol niet wijzigen" : undefined}
        className="text-xs px-2.5 py-1 rounded border border-border text-foreground hover:bg-surface disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? "Bezig..." : label}
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
