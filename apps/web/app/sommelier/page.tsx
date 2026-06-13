import { Suspense } from "react";
import { SommelierPageHeader } from "@/components/sommelier/sommelier-page-client";
import { SommelierWidget } from "@/components/sommelier/sommelier-widget";
import { SITE_URL } from "@/lib/site";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI-sommelier Maurice — persoonlijk wijnadvies",
  description:
    "Vertel wat je eet of welke smaak je zoekt en AI-sommelier Maurice kiest direct de perfecte wijn voor je. Gratis persoonlijk wijnadvies van WijnVinder.",
  alternates: { canonical: "/sommelier" },
  openGraph: {
    title: "AI-sommelier Maurice — persoonlijk wijnadvies | WijnVinder",
    description:
      "Vertel wat je eet en Maurice kiest de perfecte wijn. Gratis AI-wijnadvies.",
    url: `${SITE_URL}/sommelier`,
    type: "website",
  },
};

export default function SommelierPage() {
  return (
    <div className="min-h-screen bg-background">
      <SommelierPageHeader />
      {/* The widget reads searchParams (?vraag=), so it needs its own
          Suspense boundary to keep this page statically prerenderable. */}
      <Suspense
        fallback={
          <div className="max-w-3xl mx-auto px-4 py-10">
            <div className="h-40 rounded-xl border border-border bg-surface animate-pulse" />
          </div>
        }
      >
        <SommelierWidget variant="full" />
      </Suspense>
    </div>
  );
}
