"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Wine, Lock, AlertCircle, CheckCircle } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function WachtwoordResettenContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const errorParam = searchParams.get("error");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Invalid or expired link
  const isInvalidLink = !!errorParam || !token;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setSubmitError(null);

    if (newPassword.length < 8) {
      setValidationError("Het wachtwoord moet minimaal 8 tekens zijn.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setValidationError("De wachtwoorden komen niet overeen.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await authClient.resetPassword({
        newPassword,
        token: token!,
      });
      if (result.error) {
        setSubmitError("Deze resetlink is ongeldig of verlopen.");
      } else {
        setSuccess(true);
      }
    } catch {
      setSubmitError("Er is een fout opgetreden. Probeer het opnieuw.");
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
            Nieuw wachtwoord
          </h1>
        </div>

        {isInvalidLink ? (
          <div className="space-y-6">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 border border-red-200 text-error text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>Deze resetlink is ongeldig of verlopen.</span>
            </div>
            <Link href="/wachtwoord-vergeten">
              <Button className="w-full h-11 font-semibold">
                Vraag een nieuwe link aan
              </Button>
            </Link>
          </div>
        ) : success ? (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-start gap-3 p-4 rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm">
              <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>Je wachtwoord is gewijzigd.</span>
            </div>
            <Link href="/login">
              <Button className="w-full h-11 font-semibold">Inloggen</Button>
            </Link>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {(validationError ?? submitError) && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-4 rounded-lg bg-red-50 border border-red-200 text-error text-sm"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {validationError ?? submitError}
              </motion.div>
            )}

            <div className="space-y-1">
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-foreground"
              >
                Nieuw wachtwoord
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light pointer-events-none" />
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-foreground"
              >
                Herhaal wachtwoord
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light pointer-events-none" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
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
                {isLoading ? "Bezig met opslaan..." : "Wachtwoord opslaan"}
              </Button>
            </motion.div>
          </form>
        )}
      </motion.div>
    </div>
  );
}

export default function WachtwoordResettenPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center px-6 sm:px-12 bg-cream">
          <div className="max-w-md w-full mx-auto">
            <div className="h-20 rounded-xl border border-border bg-card animate-pulse" />
          </div>
        </div>
      }
    >
      <WachtwoordResettenContent />
    </Suspense>
  );
}
