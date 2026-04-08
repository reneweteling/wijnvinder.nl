"use client";

import { motion } from "framer-motion";
import { UserCircle, Search, ShoppingCart } from "lucide-react";

const steps = [
  {
    icon: UserCircle,
    step: "01",
    title: "Maak Je Profiel",
    description:
      "Vertel ons over jouw smaken: welke wijnsoorten, druiven en smaakprofielen jij het lekkerst vindt. Geef je prijsrange op en wij doen de rest.",
  },
  {
    icon: Search,
    step: "02",
    title: "Wij Zoeken Voor Jou",
    description:
      "Ons algoritme doorzoekt meer dan 59 wijnwinkels en matcht de beste wijnen op basis van jouw unieke smaakprofiel en Vivino-ratings.",
  },
  {
    icon: ShoppingCart,
    step: "03",
    title: "Vergelijk & Bestel",
    description:
      "Bekijk jouw persoonlijke aanbevelingen, vergelijk prijzen en bestel direct bij de winkel van jouw keuze. Zo eenvoudig is het.",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: "easeOut" as const },
  },
};

export function HowItWorks() {
  return (
    <section
      id="hoe-het-werkt"
      className="py-28 bg-surface relative overflow-hidden"
    >
      {/* Subtle decorative grape cluster circles */}
      <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full bg-burgundy/[0.03] pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-gold/[0.05] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <span className="inline-block text-gold font-medium text-sm uppercase tracking-widest mb-3">
            Eenvoudig &amp; Snel
          </span>
          <h2 className="font-heading font-bold text-3xl sm:text-4xl md:text-5xl text-foreground mb-5">
            Hoe Het Werkt
          </h2>
          <div className="w-16 h-[2px] bg-gradient-to-r from-gold/60 to-gold/20 mx-auto mb-5" />
          <p className="text-text-light text-lg max-w-2xl mx-auto">
            In drie stappen naar jouw ideale fles wijn, bij de beste prijs.
          </p>
        </motion.div>

        {/* Steps */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-10 relative"
        >
          {/* Connector line (desktop) */}
          <div className="hidden md:block absolute top-14 left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] h-px bg-gradient-to-r from-burgundy/20 via-gold/40 to-burgundy/20 pointer-events-none" />

          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.step}
                variants={itemVariants}
                className="flex flex-col items-center text-center group"
              >
                {/* Icon circle */}
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="relative w-24 h-24 rounded-full bg-burgundy-light flex items-center justify-center mb-6 shadow-md group-hover:bg-burgundy transition-colors duration-300"
                >
                  <Icon className="w-10 h-10 text-burgundy group-hover:text-white transition-colors duration-300" />
                  <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-gold text-white text-xs font-bold flex items-center justify-center shadow">
                    {step.step}
                  </span>
                </motion.div>

                <h3 className="font-heading font-bold text-xl text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-text-light text-[15px] leading-relaxed max-w-xs">
                  {step.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
