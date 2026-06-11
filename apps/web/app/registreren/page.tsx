"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
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
  const [isSocialLoading, setIsSocialLoading] = useState<"google" | "microsoft" | null>(null);

  const handleSocialSignIn = async (provider: "google" | "microsoft") => {
    setIsSocialLoading(provider);
    await authClient.signIn.social({ provider, callbackURL: "/aanbevelingen" });
    setIsSocialLoading(null);
  };

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
    "Beoordelingen direct zichtbaar",
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

          {/* Social sign-in */}
          <div className="space-y-3 mb-6">
            <Button
              type="button"
              variant="outline"
              className="w-full h-11 gap-3 font-medium"
              onClick={() => handleSocialSignIn("google")}
              disabled={isSocialLoading !== null}
            >
              {/* Google "G" logo */}
              <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
                <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"/>
              </svg>
              {isSocialLoading === "google" ? "Bezig..." : "Verder met Google"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full h-11 gap-3 font-medium"
              onClick={() => handleSocialSignIn("microsoft")}
              disabled={isSocialLoading !== null}
            >
              {/* Microsoft four-squares logo */}
              <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                <rect x="0" y="0" width="8.5" height="8.5" fill="#F35325"/>
                <rect x="9.5" y="0" width="8.5" height="8.5" fill="#81BC06"/>
                <rect x="0" y="9.5" width="8.5" height="8.5" fill="#05A6F0"/>
                <rect x="9.5" y="9.5" width="8.5" height="8.5" fill="#FFBA08"/>
              </svg>
              {isSocialLoading === "microsoft" ? "Bezig..." : "Verder met Microsoft"}
            </Button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-sm text-text-light">of</span>
            <div className="flex-1 h-px bg-border" />
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
