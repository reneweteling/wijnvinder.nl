import Link from "next/link";
import { Wine } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-foreground text-white border-t-2 border-gold/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Branding */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Wine className="w-6 h-6 text-gold" />
              <span className="font-heading font-bold text-xl">WijnVinder</span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed max-w-xs">
              Vind jouw perfecte wijn. Persoonlijke aanbevelingen op basis van
              jouw smaakprofiel, met de beste prijs bij Nederlandse wijnwinkels.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-col gap-3">
            <h3 className="font-heading font-semibold text-gold text-sm uppercase tracking-wider">
              Navigatie
            </h3>
            <nav className="flex flex-col gap-2">
              {[
                { href: "/", label: "Home" },
                { href: "/#hoe-het-werkt", label: "Hoe het werkt" },
                { href: "/aanbevelingen", label: "Aanbevelingen" },
                { href: "/profiel", label: "Mijn profiel" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-white/70 hover:text-gold transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Info links */}
          <div className="flex flex-col gap-3">
            <h3 className="font-heading font-semibold text-gold text-sm uppercase tracking-wider">
              Informatie
            </h3>
            <nav className="flex flex-col gap-2">
              {/* TODO: create pages for over-ons, privacy, contact */}
              {[
                { href: "#", label: "Over ons" },
                { href: "#", label: "Privacybeleid" },
                { href: "#", label: "Contact" },
              ].map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm text-white/70 hover:text-gold transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-sm">
            &copy; {new Date().getFullYear()} WijnVinder.
            Alle rechten voorbehouden.
          </p>
          <p className="text-gold/70 text-sm font-heading italic">
            Vind jouw perfecte wijn.
          </p>
        </div>
      </div>
    </footer>
  );
}
