import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <span className="text-6xl mb-4">🍷</span>
      <h1 className="font-heading text-4xl font-bold text-foreground mb-2">
        Pagina niet gevonden
      </h1>
      <p className="text-text-light text-lg mb-8 max-w-md">
        Deze pagina bestaat niet (meer). Misschien is de wijn op?
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-burgundy text-white px-6 py-3 rounded-lg font-medium hover:bg-burgundy/90 transition-colors"
        >
          Terug naar home
        </Link>
        <Link
          href="/aanbevelingen"
          className="inline-flex items-center gap-2 border border-burgundy text-burgundy px-6 py-3 rounded-lg font-medium hover:bg-burgundy/10 transition-colors"
        >
          Bekijk wijnen
        </Link>
      </div>
    </main>
  );
}
