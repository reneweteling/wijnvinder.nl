"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CtaSection({ shopCount }: { shopCount: number }) {
  return (
    <section className="relative py-36 overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/cta-vineyard.jpg"
          alt="Wijnkelder"
          fill
          className="object-cover object-center"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-r from-burgundy-dark/90 via-black/70 to-black/50" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <span className="inline-block text-gold font-medium text-sm uppercase tracking-[0.2em] mb-5">
              Begin Vandaag Nog
            </span>

            <h2 className="font-heading font-bold text-3xl sm:text-4xl md:text-5xl text-white mb-4 leading-tight">
              Klaar om jouw perfecte wijn te vinden?
            </h2>
            <div className="w-16 h-[2px] bg-gradient-to-r from-gold to-gold/30 mb-6" />

            <p className="text-white/75 text-lg mb-10 leading-relaxed">
              Maak een gratis profiel aan, vertel ons over jouw smaak en ontdek
              honderden wijnen die écht bij jou passen — voor elke gelegenheid
              en elk budget.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/profiel">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Button
                    size="lg"
                    className="bg-gold hover:bg-gold/90 text-white font-semibold h-14 px-8 text-base gap-2 shadow-xl"
                  >
                    Start Je Wijnprofiel
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </motion.div>
              </Link>

              <Link href="/registreren">
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/50 text-white hover:bg-white/10 hover:text-white h-14 px-8 text-base"
                  >
                    Gratis Aanmelden
                  </Button>
                </motion.div>
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="mt-10 flex flex-wrap gap-6">
              {[
                { label: "Gratis te gebruiken" },
                { label: `${shopCount}+ wijnwinkels`, href: "/winkels" },
                { label: "Vivino-ratings" },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="flex items-center gap-2 text-white/70 text-sm"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                  {item.href ? (
                    <Link href={item.href} className="underline underline-offset-2 hover:text-white/90">
                      {item.label}
                    </Link>
                  ) : (
                    item.label
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
