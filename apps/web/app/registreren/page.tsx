"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Wine, User, Mail, Lock, AlertCircle, CheckCircle } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ENABLED_SHOP_COUNT } from "@/lib/constants";

export default function RegistrerenPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Wachtwoord moet minimaal 8 tekens lang zijn.");
      return;
    }

    setIsLoading(true);

    try {
      const result = await authClient.signUp.email({
        name,
        email,
        password,
      });

      if (result.error) {
        if (result.error.message?.includes("already exists") || result.error.message?.includes("already in use")) {
          setError("Dit e-mailadres is al in gebruik. Probeer in te loggen.");
        } else {
          setError("Aanmelden mislukt. Controleer je gegevens en probeer opnieuw.");
        }
      } else {
        router.push("/profiel");
      }
    } catch {
      setError("Er is een fout opgetreden. Probeer het opnieuw.");
    } finally {
      setIsLoading(false);
    }
  };

  const benefits = [
    "Persoonlijke wijnprofielen",
    `Vergelijk prijzen bij ${ENABLED_SHOP_COUNT}+ winkels`,
    "Vivino-beoordelingen direct zichtbaar",
    "Gratis te gebruiken",
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] flex">
      {/* Left side — decorative image (hidden on mobile) */}
      <div className="hidden lg:block relative flex-1 max-w-[45%]">
        <Image
          src="/images/cta-vineyard.jpg"
          alt="Wijnkelder"
          fill
          className="object-cover object-center"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-l from-cream/10 to-burgundy/70" />

        {/* Benefits overlay */}
        <div className="absolute inset-0 flex flex-col justify-center p-14">
          <h2 className="font-heading font-bold text-3xl text-white mb-8">
            Jouw persoonlijke<br />wijnsommelier
          </h2>
          <ul className="space-y-4">
            {benefits.map((benefit, i) => (
              <motion.li
                key={benefit}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-3 text-white/90 text-base"
              >
                <CheckCircle className="w-5 h-5 text-gold flex-shrink-0" />
                {benefit}
              </motion.li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right side — form */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-20 xl:px-28 bg-cream">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-md w-full mx-auto"
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 mb-10 group">
            <motion.div
              whileHover={{ rotate: 15 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Wine className="w-7 h-7 text-burgundy" />
            </motion.div>
            <span className="font-heading font-bold text-xl text-burgundy">
              WijnVinder
            </span>
          </Link>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="font-heading font-bold text-3xl text-foreground mb-2">
              Gratis aanmelden
            </h1>
            <p className="text-text-light">
              Maak je profiel aan en ontdek jouw perfecte wijn.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-4 rounded-lg bg-red-50 border border-red-200 text-error text-sm"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </motion.div>
            )}

            <div className="space-y-1">
              <label htmlFor="name" className="block text-sm font-medium text-foreground">
                Volledige naam
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light pointer-events-none" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Jan de Vries"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="name"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="email" className="block text-sm font-medium text-foreground">
                E-mailadres
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light pointer-events-none" />
                <Input
                  id="email"
                  type="email"
                  placeholder="jouw@email.nl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="password" className="block text-sm font-medium text-foreground">
                Wachtwoord
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light pointer-events-none" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Minimaal 8 tekens"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  minLength={8}
                  className="pl-10"
                />
              </div>
            </div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="submit"
                className="w-full h-11 font-semibold"
                disabled={isLoading}
              >
                {isLoading ? "Account aanmaken..." : "Aanmelden"}
              </Button>
            </motion.div>

            <p className="text-xs text-text-light text-center">
              Door aan te melden ga je akkoord met onze{" "}
              {/* TODO: create page */}
              <a href="#" className="underline hover:text-foreground">
                privacyvoorwaarden
              </a>
              .
            </p>
          </form>

          {/* Login link */}
          <p className="mt-8 text-center text-sm text-text-light">
            Al een account?{" "}
            <Link
              href="/login"
              className="text-burgundy font-medium hover:text-burgundy-dark underline underline-offset-2"
            >
              Inloggen
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
