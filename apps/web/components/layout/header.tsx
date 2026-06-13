"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Wine, Heart, ChevronDown } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { track } from "@/lib/analytics";
import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/#hoe-het-werkt", label: "Hoe het werkt" },
  { href: "/wijnen", label: "Wijnen" },
  { href: "/sommelier", label: "Sommelier" },
  { href: "/wijnen?aanbiedingen=1", label: "Aanbiedingen" },
  { href: "/winkels", label: "Winkels" },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { data: session } = authClient.useSession();
  const pathname = usePathname();
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Only use transparent mode on the homepage — elsewhere always show solid header
  const isTransparent = pathname === "/";
  // The header looks "scrolled" (solid) when not in transparent mode OR when actually scrolled
  const isSolid = !isTransparent || isScrolled;

  const isAdmin = (session?.user as { role?: string } | undefined)?.role === "admin";

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close user dropdown on outside click or Escape
  useEffect(() => {
    if (!isUserMenuOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsUserMenuOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isUserMenuOpen]);

  const handleSignOut = async () => {
    track("logout");
    await authClient.signOut();
    setIsMobileOpen(false);
    setIsUserMenuOpen(false);
  };

  const closeUserMenu = () => setIsUserMenuOpen(false);

  // First name only for the dropdown trigger
  const firstName = session?.user?.name?.split(" ")[0] ?? session?.user?.name ?? "";

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
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) =>
              link.href.includes("#") ? (
                <a
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium whitespace-nowrap transition-colors hover:text-gold ${
                    isSolid ? "text-foreground" : "text-white/90"
                  }`}
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium whitespace-nowrap transition-colors hover:text-gold ${
                    isSolid ? "text-foreground" : "text-white/90"
                  }`}
                >
                  {link.label}
                </Link>
              )
            )}
          </nav>

          {/* Desktop auth */}
          <div className="hidden lg:flex items-center gap-3">
            {session?.user ? (
              <div className="flex items-center gap-3">
                {/* Favorieten heart link stays standalone */}
                <Link
                  href="/favorieten"
                  className={`flex items-center gap-1 text-sm font-medium whitespace-nowrap transition-colors hover:text-burgundy ${
                    isSolid ? "text-foreground" : "text-white/90"
                  }`}
                >
                  <Heart className="h-4 w-4" />
                  Favorieten
                </Link>

                {/* User dropdown */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen((v) => !v)}
                    aria-haspopup="true"
                    aria-expanded={isUserMenuOpen}
                    className={`flex items-center gap-1 text-sm font-medium whitespace-nowrap transition-colors hover:text-gold ${
                      isSolid ? "text-foreground" : "text-white/90"
                    }`}
                  >
                    {firstName}
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-200 ${
                        isUserMenuOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.97 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute right-0 top-full mt-2 w-52 bg-card border border-border rounded-xl shadow-lg overflow-hidden"
                      >
                        <div className="py-1">
                          <Link
                            href="/profiel"
                            onClick={closeUserMenu}
                            className="block px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                          >
                            Mijn profiel
                          </Link>
                          <Link
                            href="/profiel/voorkeuren"
                            onClick={closeUserMenu}
                            className="block px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                          >
                            E-mailvoorkeuren
                          </Link>

                          {isAdmin && (
                            <>
                              <div className="my-1 border-t border-border" />
                              <Link
                                href="/admin"
                                onClick={closeUserMenu}
                                className="block px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                              >
                                Beheer
                              </Link>
                            </>
                          )}

                          <div className="my-1 border-t border-border" />
                          <button
                            onClick={handleSignOut}
                            className="block w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            Uitloggen
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
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
            className="lg:hidden p-2"
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
            className="overflow-hidden bg-white/95 backdrop-blur-md border-b border-border lg:hidden"
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
                    {/* Favorieten */}
                    <Link
                      href="/favorieten"
                      className="flex items-center gap-2 text-base font-medium text-foreground hover:text-burgundy"
                      onClick={() => setIsMobileOpen(false)}
                    >
                      <Heart className="h-4 w-4" />
                      Favorieten
                    </Link>

                    {/* Account section */}
                    <div className="pt-3 border-t border-border">
                      <p className="text-xs font-semibold uppercase tracking-wider text-text-light mb-2">
                        Account
                      </p>
                      <div className="flex flex-col gap-2">
                        <Link
                          href="/profiel"
                          className="text-base font-medium text-foreground hover:text-burgundy"
                          onClick={() => setIsMobileOpen(false)}
                        >
                          Mijn profiel
                        </Link>
                        <Link
                          href="/profiel/voorkeuren"
                          className="text-base font-medium text-foreground hover:text-burgundy"
                          onClick={() => setIsMobileOpen(false)}
                        >
                          E-mailvoorkeuren
                        </Link>
                        {isAdmin && (
                          <Link
                            href="/admin"
                            className="text-base font-medium text-foreground hover:text-burgundy"
                            onClick={() => setIsMobileOpen(false)}
                          >
                            Beheer
                          </Link>
                        )}
                        <button
                          onClick={handleSignOut}
                          className="text-left text-base font-medium text-red-600 hover:text-red-700"
                        >
                          Uitloggen
                        </button>
                      </div>
                    </div>
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
