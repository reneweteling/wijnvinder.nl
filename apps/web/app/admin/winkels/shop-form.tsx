"use client";

import { useState } from "react";

type ShopFormProps = {
  shopId: string;
  enabled: boolean;
  priority: number;
  referralEnabled: boolean;
  referralParam: string | null;
  affiliateLinkTemplate: string | null;
};

export function ShopForm({
  shopId,
  enabled: initialEnabled,
  priority: initialPriority,
  referralEnabled: initialReferralEnabled,
  referralParam: initialReferralParam,
  affiliateLinkTemplate: initialAffiliateLinkTemplate,
}: ShopFormProps) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [priority, setPriority] = useState(String(initialPriority));
  const [referralEnabled, setReferralEnabled] = useState(
    initialReferralEnabled,
  );
  const [referralParam, setReferralParam] = useState(
    initialReferralParam ?? "",
  );
  const [affiliateLinkTemplate, setAffiliateLinkTemplate] = useState(
    initialAffiliateLinkTemplate ?? "",
  );

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const res = await fetch(`/api/admin/winkels/${shopId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        enabled,
        priority: Number.parseInt(priority, 10) || 0,
        referralEnabled,
        referralParam: referralParam.trim() || null,
        affiliateLinkTemplate: affiliateLinkTemplate.trim() || null,
      }),
    });

    if (res.ok) {
      setMessage({ type: "success", text: "Opgeslagen" });
    } else {
      let errorText = "Fout bij opslaan";
      try {
        const data = (await res.json()) as { error?: string };
        if (data.error) errorText = data.error;
      } catch {
        // ignore parse error
      }
      setMessage({ type: "error", text: errorText });
    }

    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      {/* Winkel actief */}
      <label className="flex items-center gap-3 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
          className="h-4 w-4 rounded border-border text-burgundy focus:ring-burgundy"
        />
        <span className="text-sm font-medium text-foreground">
          Winkel actief
        </span>
      </label>

      {/* Prioriteit */}
      <div>
        <label
          htmlFor={`priority-${shopId}`}
          className="block text-sm font-medium text-foreground mb-1"
        >
          Prioriteit
        </label>
        <input
          id={`priority-${shopId}`}
          type="number"
          step={1}
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="w-full max-w-[8rem] rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-text-light focus:outline-none focus:ring-2 focus:ring-burgundy"
        />
        <p className="mt-1 text-xs text-text-light">
          Hoger = wordt eerder aangeprezen als dezelfde wijn bij meerdere winkels
          staat. Bij gelijke prioriteit wint de laagste prijs.
        </p>
      </div>

      {/* Affiliate-links actief */}
      <label className="flex items-center gap-3 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={referralEnabled}
          onChange={(e) => setReferralEnabled(e.target.checked)}
          className="h-4 w-4 rounded border-border text-burgundy focus:ring-burgundy"
        />
        <span className="text-sm font-medium text-foreground">
          Affiliate-links actief
        </span>
      </label>

      {/* Referral-parameter */}
      <div>
        <label
          htmlFor={`referralParam-${shopId}`}
          className="block text-sm font-medium text-foreground mb-1"
        >
          Referral-parameter (fallback)
        </label>
        <input
          id={`referralParam-${shopId}`}
          type="text"
          value={referralParam}
          onChange={(e) => setReferralParam(e.target.value)}
          placeholder="?ref=wijnvinder"
          className="w-full max-w-xs rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-text-light focus:outline-none focus:ring-2 focus:ring-burgundy"
        />
      </div>

      {/* Affiliate-linksjabloon */}
      <div>
        <label
          htmlFor={`affiliateLinkTemplate-${shopId}`}
          className="block text-sm font-medium text-foreground mb-1"
        >
          Affiliate-linksjabloon
        </label>
        <input
          id={`affiliateLinkTemplate-${shopId}`}
          type="text"
          value={affiliateLinkTemplate}
          onChange={(e) => setAffiliateLinkTemplate(e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-1.5 font-mono text-sm text-foreground placeholder:text-text-light focus:outline-none focus:ring-2 focus:ring-burgundy"
        />
        <p className="mt-1 text-xs text-text-light">
          Placeholders: <code>{"{path}"}</code> = productpad (encoded),{" "}
          <code>{"{url}"}</code> = volledige URL (encoded),{" "}
          <code>{"{ref}"}</code> = listing-ID. Voorbeeld:{" "}
          <code>
            https://www.topdrinks.nl/drinks/?tt=35131_12_508390_&#123;ref&#125;&r=&#123;path&#125;
          </code>
        </p>
      </div>

      {/* Submit */}
      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-burgundy px-4 py-1.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {saving ? "Bezig…" : "Opslaan"}
        </button>

        {message && (
          <p
            className={`text-sm font-medium ${
              message.type === "success" ? "text-green-700" : "text-red-600"
            }`}
          >
            {message.text}
          </p>
        )}
      </div>
    </form>
  );
}
