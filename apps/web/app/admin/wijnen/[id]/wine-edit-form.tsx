"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type WineFields = {
  name: string;
  wineType: string;
  grape: string;
  country: string;
  region: string;
  vintage: number | null;
  imageUrl: string;
  description: string;
};

export function WineEditForm({
  id,
  initial,
}: {
  id: string;
  initial: WineFields;
}) {
  const router = useRouter();

  const [name, setName] = useState(initial.name);
  const [wineType, setWineType] = useState(initial.wineType);
  const [grape, setGrape] = useState(initial.grape);
  const [country, setCountry] = useState(initial.country);
  const [region, setRegion] = useState(initial.region);
  const [vintage, setVintage] = useState(
    initial.vintage != null ? String(initial.vintage) : "",
  );
  const [imageUrl, setImageUrl] = useState(initial.imageUrl);
  const [description, setDescription] = useState(initial.description);

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError(null);

    const body: Record<string, unknown> = {
      name,
      wineType: wineType || null,
      grape: grape || null,
      country: country || null,
      region: region || null,
      imageUrl: imageUrl || null,
      description: description || null,
      vintage: vintage !== "" ? parseInt(vintage, 10) : null,
    };

    try {
      const res = await fetch(`/api/admin/wijnen/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(
          (data as { error?: string }).error ?? `Fout: HTTP ${res.status}`,
        );
      } else {
        setSuccess(true);
        router.refresh();
      }
    } catch {
      setError("Netwerkfout. Probeer het opnieuw.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {success && (
        <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
          Opgeslagen.
        </div>
      )}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <Input
        id="name"
        label="Naam"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <div className="space-y-1">
        <label htmlFor="wineType" className="block text-sm font-medium text-foreground">
          Type
        </label>
        <select
          id="wineType"
          value={wineType}
          onChange={(e) => setWineType(e.target.value)}
          className="flex h-10 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-burgundy focus:border-transparent"
        >
          <option value="">Onbekend</option>
          <option value="red">Rood</option>
          <option value="white">Wit</option>
          <option value="rose">Rosé</option>
          <option value="sparkling">Mousserend</option>
          <option value="dessert">Dessert</option>
        </select>
      </div>

      <Input
        id="grape"
        label="Druif"
        type="text"
        value={grape}
        onChange={(e) => setGrape(e.target.value)}
        placeholder="bijv. Cabernet Sauvignon"
      />

      <Input
        id="country"
        label="Land"
        type="text"
        value={country}
        onChange={(e) => setCountry(e.target.value)}
        placeholder="bijv. Frankrijk"
      />

      <Input
        id="region"
        label="Regio"
        type="text"
        value={region}
        onChange={(e) => setRegion(e.target.value)}
        placeholder="bijv. Bordeaux"
      />

      <Input
        id="vintage"
        label="Jaargang"
        type="number"
        value={vintage}
        onChange={(e) => setVintage(e.target.value)}
        placeholder="bijv. 2019"
        min={1900}
        max={2100}
      />

      <Input
        id="imageUrl"
        label="Afbeelding URL"
        type="text"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
        placeholder="https://..."
      />

      <div className="space-y-1">
        <label htmlFor="description" className="block text-sm font-medium text-foreground">
          Omschrijving
        </label>
        <textarea
          id="description"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="flex w-full rounded-lg border border-border bg-card px-3 py-2 text-sm placeholder:text-text-light focus:outline-none focus:ring-2 focus:ring-burgundy focus:border-transparent resize-y"
          placeholder="Korte omschrijving van de wijn..."
        />
      </div>

      <Button type="submit" disabled={saving}>
        {saving ? "Bezig met opslaan..." : "Opslaan"}
      </Button>
    </form>
  );
}
