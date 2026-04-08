"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Wine, Mail, Lock, AlertCircle } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await authClient.signIn.email({
        email,
        password,
      });

      if (result.error) {
        setError("Ongeldig e-mailadres of wachtwoord. Probeer het opnieuw.");
      } else {
        router.push("/aanbevelingen");
      }
    } catch {
      setError("Er is een fout opgetreden. Probeer het opnieuw.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex">
      {/* Left side — form */}
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
              Welkom terug
            </h1>
            <p className="text-text-light">
              Log in om jouw wijnprofiel te bekijken.
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
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
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
                {isLoading ? "Bezig met inloggen..." : "Inloggen"}
              </Button>
            </motion.div>
          </form>

          {/* Footer links */}
          <p className="mt-8 text-center text-sm text-text-light">
            Nog geen account?{" "}
            <Link
              href="/registreren"
              className="text-burgundy font-medium hover:text-burgundy-dark underline underline-offset-2"
            >
              Gratis aanmelden
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right side — decorative image (hidden on mobile) */}
      <div className="hidden lg:block relative flex-1 max-w-[45%]">
        <Image
          src="/images/hero-wine.jpg"
          alt="Wijn glazen"
          fill
          className="object-cover object-center"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-r from-cream/20 to-burgundy/60" />
        <div className="absolute inset-0 flex items-end p-14">
          <blockquote className="text-white">
            <p className="font-heading italic text-2xl leading-relaxed mb-4">
              &ldquo;De beste wijn is degene die jij het lekkerst vindt.&rdquo;
            </p>
            <footer className="text-white/70 text-sm">— Wijnliefhebber</footer>
          </blockquote>
        </div>
      </div>
    </div>
  );
}
