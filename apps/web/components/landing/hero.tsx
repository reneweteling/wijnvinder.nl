"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, ChevronDown, Search } from "lucide-react";

const QUICK_LINKS: { label: string; href: string }[] = [
  { label: "🔥 Aanbiedingen", href: "/wijnen?aanbiedingen=1" },
  { label: "🍷 Rood", href: "/wijnen?type=red" },
  { label: "🥂 Wit", href: "/wijnen?type=white" },
  { label: "🌸 Rosé", href: "/wijnen?type=rose" },
  { label: "🍾 Mousserend", href: "/wijnen?type=sparkling" },
  { label: "💶 Onder €10", href: "/wijnen?priceMax=10" },
  { label: "⭐ Best beoordeeld", href: "/wijnen?minRating=4&sort=rating-desc" },
];

export function Hero({
  shopCount,
  wineCount,
}: {
  shopCount: number;
  wineCount: number;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/wijnen?q=${encodeURIComponent(q)}` : "/wijnen");
  };

  return (
    <section className="relative -mt-16 h-[88vh] min-h-[620px] flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero-wine.jpg"
          alt="Wijn glazen"
          fill
          sizes="100vw"
          className="object-cover object-center"
          priority
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
      </div>

      {/* Decorative wine-stain ring */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-gold/[0.08] pointer-events-none z-[1]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-white/[0.04] pointer-events-none z-[1]" />

      {/* Content */}
      <div className="relative z-10 text-center text-white px-4 sm:px-6 max-w-4xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="inline-block text-gold font-medium text-sm uppercase tracking-[0.2em] mb-6 border border-gold/30 rounded-full px-5 py-1.5"
          >
            Persoonlijk &bull; Slim &bull; Betaalbaar
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-heading font-bold text-4xl sm:text-5xl md:text-6xl leading-tight mb-5"
          >
            Ontdek Jouw{" "}
            <span className="text-gold">Perfecte Wijn</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-base sm:text-lg text-white/80 max-w-2xl mx-auto mb-8 leading-relaxed"
          >
            Vergelijk {wineCount.toLocaleString("nl-NL")} wijnen bij{" "}
            <Link href="/winkels" className="text-gold underline underline-offset-2 hover:text-gold/80">
              {shopCount} Nederlandse wijnwinkels
            </Link>
            , inclusief prijsvergelijking en beoordelingen.
          </motion.p>

          {/* Search */}
          <motion.form
            onSubmit={handleSearch}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45 }}
            className="max-w-xl mx-auto mb-5"
          >
            <div className="flex items-center gap-2 bg-white rounded-full p-2 pl-5 shadow-2xl">
              <Search className="h-5 w-5 text-burgundy shrink-0" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Zoek op wijn, druif of regio..."
                className="flex-1 min-w-0 bg-transparent text-foreground placeholder:text-text-light text-base focus:outline-none [&::-webkit-search-cancel-button]:hidden"
                aria-label="Zoek wijnen"
              />
              <button
                type="submit"
                aria-label="Zoeken"
                className="bg-burgundy hover:bg-burgundy/90 text-white font-semibold rounded-full h-11 px-6 flex items-center gap-2 transition-colors shrink-0"
              >
                <span className="hidden sm:inline">Zoeken</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.form>

          {/* Quick links into the catalog */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.55 }}
            className="flex flex-wrap justify-center gap-2 mb-8"
          >
            {QUICK_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full border border-white/30 bg-white/10 backdrop-blur-sm px-4 py-1.5 text-sm text-white/90 hover:bg-white/20 hover:border-white/50 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-x-6 gap-y-2 justify-center items-center text-sm"
          >
            <Link
              href="/wijnen"
              className="text-white font-medium underline underline-offset-4 decoration-gold/60 hover:decoration-gold transition-colors"
            >
              Bekijk alle wijnen
            </Link>
            <Link
              href="/profiel"
              className="text-white/70 hover:text-white underline underline-offset-4 decoration-white/30 transition-colors"
            >
              Of start met je smaakprofiel voor persoonlijk advies
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 text-white/60"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 8, 0] }}
        transition={{
          opacity: { delay: 1.2, duration: 0.5 },
          y: { delay: 1.2, duration: 1.5, repeat: Infinity, ease: "easeInOut" },
        }}
      >
        <ChevronDown className="w-7 h-7" />
      </motion.div>
    </section>
  );
}
