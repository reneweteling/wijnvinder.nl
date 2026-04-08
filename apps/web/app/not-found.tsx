import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <span className="text-6xl mb-4">🍷</span>
      <h1 className="font-heading text-4xl font-bold text-foreground mb-2">
        Pagina niet gevonden
      </h1>
      <p className="text-text-light text-lg mb-8 max-w-md">
        Sorry, deze pagina bestaat niet. Misschien is de wijn al op?
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 bg-burgundy text-white px-6 py-3 rounded-lg font-medium hover:bg-burgundy/90 transition-colors"
      >
        Terug naar home
      </Link>
    </main>
  );
}
