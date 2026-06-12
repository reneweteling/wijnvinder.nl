import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { FavoritesProvider } from "@/lib/favorites-context";
import { CookieConsent } from "@/components/cookie-consent";
import { SITE_URL } from "@/lib/site";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "WijnVinder - Vind jouw perfecte wijn",
    template: "%s | WijnVinder",
  },
  description:
    "Persoonlijke wijnaanbevelingen op basis van jouw smaakprofiel. Vergelijk prijzen bij Nederlandse wijnwinkels.",
  openGraph: {
    title: "WijnVinder - Vind jouw perfecte wijn",
    description:
      "Persoonlijke wijnaanbevelingen op basis van jouw smaakprofiel. Vergelijk prijzen bij Nederlandse wijnwinkels.",
    url: SITE_URL,
    siteName: "WijnVinder",
    locale: "nl_NL",
    type: "website",
    images: [
      {
        url: "/images/hero-wine.jpg",
        width: 1200,
        height: 630,
        alt: "WijnVinder - Vind jouw perfecte wijn",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
  twitter: {
    card: "summary_large_image",
    site: "@wijnvinder",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl" data-scroll-behavior="smooth" className={`${playfair.variable} ${inter.variable}`} suppressHydrationWarning>
      <body className="font-body antialiased flex flex-col min-h-screen">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "WijnVinder",
              "url": SITE_URL,
              "description": "Persoonlijke wijnaanbevelingen op basis van jouw smaakprofiel. Vergelijk prijzen bij Nederlandse wijnwinkels.",
              "inLanguage": "nl",
              "potentialAction": {
                "@type": "SearchAction",
                "target": `${SITE_URL}/aanbevelingen?q={search_term_string}`,
                "query-input": "required name=search_term_string"
              }
            }) }}
          />
          <FavoritesProvider>
            <Header />
            <main className="pt-16 flex-1">
              {children}
            </main>
            <Footer />
          </FavoritesProvider>
          <CookieConsent />
        </body>
    </html>
  );
}
