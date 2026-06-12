import { Suspense } from "react";
import { SommelierPageHeader } from "@/components/sommelier/sommelier-page-client";
import { SommelierWidget } from "@/components/sommelier/sommelier-widget";

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
