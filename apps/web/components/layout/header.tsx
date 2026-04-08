"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Wine, Heart } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/#hoe-het-werkt", label: "Hoe het werkt" },
  { href: "/aanbevelingen", label: "Aanbevelingen" },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { data: session } = authClient.useSession();
  const pathname = usePathname();

  // Only use transparent mode on the homepage — elsewhere always show solid header
  const isTransparent = pathname === "/";
  // The header looks "scrolled" (solid) when not in transparent mode OR when actually scrolled
  const isSolid = !isTransparent || isScrolled;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = async () => {
    await authClient.signOut();
    setIsMobileOpen(false);
  };

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isSolid
          ? "bg-white/80 backdrop-blur-md border-b border-border shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <motion.div
              whileHover={{ rotate: 15 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Wine
                className={`w-7 h-7 transition-colors ${
                  isSolid ? "text-burgundy" : "text-white"
                }`}
              />
            </motion.div>
            <span
              className={`font-heading font-bold text-xl transition-colors ${
                isSolid ? "text-burgundy" : "text-white"
              }`}
            >
              WijnVinder
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) =>
              link.href.includes("#") ? (
                <a
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-gold ${
                    isSolid ? "text-foreground" : "text-white/90"
                  }`}
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-gold ${
                    isSolid ? "text-foreground" : "text-white/90"
                  }`}
                >
                  {link.label}
                </Link>
              )
            )}
          </nav>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-3">
            {session?.user ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/favorieten"
                  className={`flex items-center gap-1 text-sm font-medium transition-colors hover:text-burgundy ${
                    isSolid ? "text-foreground" : "text-white/90"
                  }`}
                >
                  <Heart className="h-4 w-4" />
                  Favorieten
                </Link>
                <span
                  className={`text-sm font-medium ${
                    isSolid ? "text-foreground" : "text-white"
                  }`}
                >
                  {session.user.name}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className={
                    !isSolid
                      ? "border-white/50 text-white hover:bg-white/10 hover:text-white"
                      : ""
                  }
                >
                  Uitloggen
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={
                      !isSolid
                        ? "text-white hover:bg-white/10 hover:text-white"
                        : ""
                    }
                  >
                    Inloggen
                  </Button>
                </Link>
                <Link href="/registreren">
                  <motion.div
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Button
                      size="sm"
                      className={
                        !isSolid ? "bg-gold hover:bg-gold/90 text-white" : ""
                      }
                    >
                      Aanmelden
                    </Button>
                  </motion.div>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMobileOpen((v) => !v)}
            aria-label="Menu openen"
          >
            {isMobileOpen ? (
              <X
                className={`w-6 h-6 ${isSolid ? "text-foreground" : "text-white"}`}
              />
            ) : (
              <Menu
                className={`w-6 h-6 ${isSolid ? "text-foreground" : "text-white"}`}
              />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden bg-white/95 backdrop-blur-md border-b border-border md:hidden"
          >
            <div className="px-4 py-6 flex flex-col gap-4">
              {navLinks.map((link, i) => {
                const LinkTag = link.href.includes("#") ? "a" : Link;
                return (
                  <motion.div
                    key={link.href}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.07 }}
                  >
                    <LinkTag
                      href={link.href}
                      className="block text-base font-medium text-foreground hover:text-burgundy"
                      onClick={() => setIsMobileOpen(false)}
                    >
                      {link.label}
                    </LinkTag>
                  </motion.div>
                );
              })}

              <div className="pt-4 border-t border-border flex flex-col gap-3">
                {session?.user ? (
                  <>
                    <Link
                      href="/favorieten"
                      className="flex items-center gap-2 text-base font-medium text-foreground hover:text-burgundy"
                      onClick={() => setIsMobileOpen(false)}
                    >
                      <Heart className="h-4 w-4" />
                      Favorieten
                    </Link>
                    <p className="text-sm text-text-light">{session.user.name}</p>
                    <Button variant="outline" onClick={handleSignOut}>
                      Uitloggen
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setIsMobileOpen(false)}>
                      <Button variant="outline" className="w-full">
                        Inloggen
                      </Button>
                    </Link>
                    <Link
                      href="/registreren"
                      onClick={() => setIsMobileOpen(false)}
                    >
                      <Button className="w-full">Aanmelden</Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
