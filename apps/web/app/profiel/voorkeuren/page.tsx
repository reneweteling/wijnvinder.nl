"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export default function VoorkeurenPage() {
  const { data: session, isPending } = authClient.useSession();
  const searchParams = useSearchParams();
  const afmelden = searchParams.get("afmelden") === "1";
  const afgemeld = searchParams.get("afgemeld") === "1";

  const [optIn, setOptIn] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  // Load current preference
  useEffect(() => {
    if (isPending || !session?.user) return;

    fetch("/api/voorkeuren")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { weeklyDealsOptIn: boolean } | null) => {
        if (data) setOptIn(data.weeklyDealsOptIn);
      })
      .finally(() => setLoading(false));
  }, [session, isPending]);

  // Auto-unsubscribe when ?afmelden=1 is present and optIn is currently true (logged-in flow)
  const autoUnsubscribeDone = useRef(false);
  useEffect(() => {
    if (!afmelden || optIn !== true || autoUnsubscribeDone.current) return;

    autoUnsubscribeDone.current = true;

    fetch("/api/voorkeuren", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weeklyDealsOptIn: false }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { weeklyDealsOptIn: boolean } | null) => {
        if (data) {
          setOptIn(false);
          setSavedMessage("Je bent afgemeld voor de wekelijkse aanbiedingen.");
        }
      });
  }, [afmelden, optIn]);

  async function handleToggle(newValue: boolean) {
    setSaving(true);
    setSavedMessage(null);
    const res = await fetch("/api/voorkeuren", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weeklyDealsOptIn: newValue }),
    });
    if (res.ok) {
      setOptIn(newValue);
      setSavedMessage(
        newValue
          ? "Je ontvangt nu de wekelijkse aanbiedingen."
          : "Je bent afgemeld voor de wekelijkse aanbiedingen.",
      );
    }
    setSaving(false);
  }

  // Token-based unsubscribe confirmation banner (visible to anyone, no login required)
  const afgemeldBanner = afgemeld ? (
    <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-sm text-green-800 font-medium">
      Je bent afgemeld voor de wekelijkse aanbiedingenmail.
    </div>
  ) : null;

  // Not logged in
  if (!isPending && !session?.user) {
    return (
      <div className="min-h-screen bg-background pt-24">
        <div className="max-w-xl mx-auto px-4 text-center">
          <h1 className="font-heading text-3xl font-bold text-foreground mb-4">
            Voorkeuren
          </h1>
          {afgemeldBanner}
          <p className="text-text-light mb-6">
            Log in om je e-mailvoorkeuren te beheren.
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

  // Derive the unsubscribe confirmation message from URL + state directly in render
  const unsubscribeConfirm =
    afmelden && optIn === false && !savedMessage
      ? "Je bent afgemeld voor de wekelijkse aanbiedingen."
      : null;

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="max-w-xl mx-auto px-4">
        <h1 className="font-heading text-3xl font-bold text-foreground mb-8">
          E-mailvoorkeuren
        </h1>

        {afgemeldBanner}

        {loading || isPending ? (
          <div className="h-20 rounded-xl border border-border bg-card animate-pulse" />
        ) : (
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-foreground">
                  Wekelijkse aanbiedingen
                </p>
                <p className="text-sm text-text-light mt-1">
                  Elke vrijdag de beste wijnaanbiedingen in je inbox.
                </p>
              </div>

              {/* Toggle */}
              <button
                onClick={() => handleToggle(!optIn)}
                disabled={saving || optIn === null}
                aria-pressed={optIn ?? false}
                className={[
                  "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-burgundy focus:ring-offset-2 disabled:opacity-50",
                  optIn ? "bg-burgundy" : "bg-gray-200",
                ].join(" ")}
              >
                <span
                  className={[
                    "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                    optIn ? "translate-x-5" : "translate-x-0",
                  ].join(" ")}
                />
              </button>
            </div>

            {(savedMessage ?? unsubscribeConfirm) && (
              <p className="mt-4 text-sm text-burgundy font-medium">
                {savedMessage ?? unsubscribeConfirm}
              </p>
            )}
          </div>
        )}

        <p className="mt-6 text-sm text-text-light">
          <Link href="/profiel" className="text-burgundy hover:underline">
            Terug naar profiel
          </Link>
        </p>
      </div>
    </div>
  );
}
