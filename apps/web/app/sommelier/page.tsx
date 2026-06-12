import { Suspense } from "react";
import { SommelierPageClient } from "@/components/sommelier/sommelier-page-client";

export default function SommelierPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background">
          <div className="bg-card border-b border-border">
            <div className="max-w-3xl mx-auto px-4 py-10">
              <div className="h-20 rounded-xl border border-border bg-surface animate-pulse" />
            </div>
          </div>
        </div>
      }
    >
      <SommelierPageClient />
    </Suspense>
  );
}
