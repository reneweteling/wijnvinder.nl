"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Wine, Mail, AlertCircle, CheckCircle } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function WachtwoordVergetenPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await authClient.requestPasswordReset({
        email,
        redirectTo: "/wachtwoord-resetten",
      });
      // Always show success — no user enumeration
      setSubmitted(true);
    } catch {
      setError("Er is een fout opgetreden. Probeer het opnieuw.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center px-6 sm:px-12 bg-cream">
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
            Wachtwoord vergeten
          </h1>
          <p className="text-text-light">
            Vul je e-mailadres in en we sturen je een link om een nieuw
            wachtwoord in te stellen.
          </p>
        </div>

        {submitted ? (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3 p-4 rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm"
          >
            <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>
              Als er een account bestaat voor <strong>{email}</strong>, hebben
              we een resetlink gestuurd. Check ook je spamfolder.
            </span>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
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
              <label
                htmlFor="email"
                className="block text-sm font-medium text-foreground"
              >
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

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="submit"
                className="w-full h-11 font-semibold"
                disabled={isLoading}
              >
                {isLoading ? "Bezig met versturen..." : "Verstuur resetlink"}
              </Button>
            </motion.div>
          </form>
        )}

        <p className="mt-8 text-center text-sm text-text-light">
          <Link
            href="/login"
            className="text-burgundy font-medium hover:text-burgundy-dark underline underline-offset-2"
          >
            Terug naar inloggen
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
