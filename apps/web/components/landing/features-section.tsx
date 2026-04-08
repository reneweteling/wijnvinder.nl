"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Store, Star, Tag, User } from "lucide-react";

function getFeatures(shopCount: number) {
  return [
  {
    icon: Store,
    title: `${shopCount}+ Wijnwinkels`,
    description:
      `Wij doorzoeken meer dan ${shopCount} Nederlandse wijnwinkels zodat jij altijd de beste keuze hebt.`,
    linkTo: "/winkels",
    image:
      "/images/feature-bottles.jpg",
    imageAlt: "Wijnflessen",
  },
  {
    icon: Star,
    title: "Vivino Integratie",
    description:
      "Beoordelingen van miljoenen wijnliefhebbers wereldwijd, direct gekoppeld aan onze aanbevelingen.",
    image:
      "/images/feature-vineyard.jpg",
    imageAlt: "Wijngaard",
  },
  {
    icon: Tag,
    title: "Beste Prijs Garantie",
    description:
      "Wij vergelijken automatisch prijzen zodat jij nooit te veel betaalt voor jouw favoriete fles.",
    image:
      "/images/feature-tasting.jpg",
    imageAlt: "Wijnproeverij",
  },
  {
    icon: User,
    title: "Persoonlijk Profiel",
    description:
      "Hoe vaker je WijnVinder gebruikt, hoe beter onze aanbevelingen aansluiten op jouw smaak.",
    image:
      "/images/hero-wine.jpg",
    imageAlt: "Wijn glazen",
  },
];
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: "easeOut" as const },
  },
};

export function FeaturesSection({ shopCount }: { shopCount: number }) {
  const features = getFeatures(shopCount);
  return (
    <section className="py-28 bg-cream relative overflow-hidden">
      {/* Decorative top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

      {/* Subtle decorative element */}
      <div className="absolute top-20 -left-16 w-40 h-40 rounded-full bg-burgundy/[0.03] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <span className="inline-block text-gold font-medium text-sm uppercase tracking-widest mb-3">
            Waarom WijnVinder
          </span>
          <h2 className="font-heading font-bold text-3xl sm:text-4xl md:text-5xl text-foreground mb-5">
            Alles voor de Wijnliefhebber
          </h2>
          <div className="w-16 h-[2px] bg-gradient-to-r from-gold/60 to-gold/20 mx-auto mb-5" />
          <p className="text-text-light text-lg max-w-2xl mx-auto">
            Van smaakprofiel tot bestelling — wij begeleiden jou bij elke stap.
          </p>
        </motion.div>

        {/* Feature cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7"
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                variants={cardVariants}
                whileHover={{ y: -8, transition: { duration: 0.3, ease: "easeOut" } }}
                className="bg-card rounded-2xl overflow-hidden border border-border/80 shadow-sm hover:shadow-xl hover:border-gold/30 transition-all duration-300 group"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={feature.image}
                    alt={feature.imageAlt}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

                  {/* Icon badge */}
                  <div className="absolute bottom-4 left-4 w-10 h-10 rounded-full bg-burgundy flex items-center justify-center shadow-md">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
                    {"linkTo" in feature ? (
                      <Link href={feature.linkTo!} className="hover:text-burgundy underline underline-offset-2 decoration-gold/50">
                        {feature.title}
                      </Link>
                    ) : (
                      feature.title
                    )}
                  </h3>
                  <p className="text-text-light text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
