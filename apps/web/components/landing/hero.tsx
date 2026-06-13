"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ChevronDown,
  Flame,
  Search,
  Sparkles,
  Star,
  Tag,
} from "lucide-react";

type QuickLink = {
  label: string;
  href: string;
  icon?: React.ReactNode;
};

const QUICK_LINKS: QuickLink[] = [
  {
    label: "Aanbiedingen",
    href: "/wijnen?aanbiedingen=1",
    icon: <Flame className="w-3.5 h-3.5 text-orange-400" />,
  },
  {
    label: "Rood",
    href: "/wijnen?type=red",
    icon: (
      <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#7B1F2E] ring-1 ring-white/20 shrink-0" />
    ),
  },
  {
    label: "Wit",
    href: "/wijnen?type=white",
    icon: (
      <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#D4C27A] ring-1 ring-white/20 shrink-0" />
    ),
  },
  {
    label: "Rosé",
    href: "/wijnen?type=rose",
    icon: (
      <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#E8A0A8] ring-1 ring-white/20 shrink-0" />
    ),
  },
  {
    label: "Mousserend",
    href: "/wijnen?type=sparkling",
    icon: (
      <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#C9B97A] ring-1 ring-white/20 shrink-0" />
    ),
  },
  {
    label: "Onder €10",
    href: "/wijnen?priceMax=10",
    icon: <Tag className="w-3.5 h-3.5 text-white/70" />,
  },
  {
    label: "Best beoordeeld",
    href: "/wijnen?minRating=4&sort=rating-desc",
    icon: <Star className="w-3.5 h-3.5 text-gold" />,
  },
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
  const [mauriceQuery, setMauriceQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/wijnen?q=${encodeURIComponent(q)}` : "/wijnen");
  };

  const handleMauriceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = mauriceQuery.trim();
    if (!q) return;
    router.push(`/sommelier?vraag=${encodeURIComponent(q)}`);
  };

  return (
    <section className="relative -mt-16 h-[100svh] sm:h-[88vh] sm:min-h-[680px] flex flex-col sm:flex-row sm:items-center sm:justify-center overflow-hidden">
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

      {/* Header clearance spacer — mobile only, matches the 64px fixed header */}
      <div className="shrink-0 h-16 sm:hidden" aria-hidden="true" />

      {/* Content — flex-1 so it fills the space between header spacer and chevron on mobile.
          pb-14 on mobile reserves space for the absolute chevron so centering is balanced. */}
      <div className="relative z-10 flex-1 sm:flex-none flex items-center justify-center sm:block w-full px-4 sm:px-6 pb-14 sm:pb-0">
      <div className="text-center text-white max-w-4xl mx-auto w-full sm:pt-0">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="inline-block text-gold font-medium text-sm uppercase tracking-[0.2em] mb-2 sm:mb-6 border border-gold/30 rounded-full px-5 py-1.5"
          >
            Persoonlijk &bull; Slim &bull; Betaalbaar
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-heading font-bold text-3xl sm:text-5xl md:text-6xl leading-tight mb-2 sm:mb-5"
          >
            Ontdek Jouw{" "}
            <span className="text-gold">Perfecte Wijn</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-sm sm:text-lg text-white/80 max-w-2xl mx-auto mb-3 sm:mb-8 leading-relaxed"
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
            className="max-w-xl mx-auto mb-2 sm:mb-4"
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

          {/* Maurice AI sommelier block */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.52 }}
            className="max-w-xl mx-auto mb-2 sm:mb-5"
          >
            {/* Eyebrow label */}
            <div className="flex items-center justify-center gap-1.5 mb-1 sm:mb-2">
              <Sparkles className="w-3.5 h-3.5 text-gold" />
              <span className="text-gold text-xs font-semibold uppercase tracking-[0.18em]">
                Nieuw · AI-sommelier
              </span>
            </div>

            {/* Maurice card */}
            <form
              onSubmit={handleMauriceSubmit}
              className="rounded-2xl border border-gold/40 bg-gold/[0.12] backdrop-blur-sm px-4 py-2 sm:py-3 shadow-lg focus-within:border-gold/70 focus-within:bg-gold/[0.18] transition-all"
            >
              <p className="hidden sm:block text-gold/80 text-xs mb-2.5 text-left">
                Vertel wat je eet, Maurice kiest de wijn.
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={mauriceQuery}
                  onChange={(e) => setMauriceQuery(e.target.value)}
                  placeholder="Bijv. garnalen in knoflookboter, lamskotelet..."
                  className="flex-1 min-w-0 bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
                  aria-label="Vraag Maurice"
                />
                <button
                  type="submit"
                  aria-label="Vraag Maurice"
                  className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-gold hover:bg-gold/90 text-[#1a0a00] text-xs font-bold px-4 py-1.5 transition-colors"
                >
                  <span className="hidden sm:inline">Vraag Maurice</span>
                  <span className="sm:hidden">Vraag</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </form>
          </motion.div>

          {/* Quick links into the catalog */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.55 }}
            className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mb-3 sm:mb-8"
          >
            {QUICK_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/10 backdrop-blur-sm px-3.5 py-1.5 text-sm text-white/90 hover:bg-white/20 hover:border-white/50 transition-colors"
              >
                {link.icon}
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
              className="hidden sm:inline text-white/70 hover:text-white underline underline-offset-4 decoration-white/30 transition-colors"
            >
              Of start met je smaakprofiel voor persoonlijk advies
            </Link>
          </motion.div>
        </motion.div>
      </div>
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
