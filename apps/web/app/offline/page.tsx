import Link from "next/link";

export const dynamic = "force-static";

export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center bg-background">
      <h1 className="font-heading text-3xl font-semibold text-foreground mb-4">
        Je bent offline
      </h1>
      <p className="text-muted-foreground mb-8 max-w-sm">
        Er is geen internetverbinding. Controleer je verbinding en probeer het opnieuw.
      </p>
      <Link
        href="/"
        className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        Terug naar WijnVinder
      </Link>
    </div>
  );
}
