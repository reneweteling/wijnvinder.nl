import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { FavoritesProvider } from "@/lib/favorites-context";
import { CookieConsent } from "@/components/cookie-consent";
import { PwaRegister } from "@/components/pwa-register";
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

export const viewport: Viewport = {
  themeColor: "#722f37",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "WijnVinder - Vind jouw perfecte wijn",
    template: "%s | WijnVinder",
  },
  description:
    "Vergelijk prijzen van duizenden wijnen bij Nederlandse wijnwinkels en krijg persoonlijke aanbevelingen van AI-sommelier Maurice op basis van jouw smaakprofiel.",
  alternates: {
    canonical: "/",
  },
  keywords: [
    "wijn vergelijken",
    "wijn prijsvergelijking",
    "goedkope wijn",
    "wijn aanbiedingen",
    "wijnsommelier",
    "wijn kopen",
    "Nederlandse wijnwinkels",
  ],
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "WijnVinder",
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: "/icons/apple-touch-icon.png",
  },
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
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": `${SITE_URL}/#organization`,
                  "name": "WijnVinder",
                  "url": SITE_URL,
                  "logo": {
                    "@type": "ImageObject",
                    "url": `${SITE_URL}/icons/icon-512.png`,
                    "width": 512,
                    "height": 512,
                  },
                  "description": "WijnVinder vergelijkt prijzen van wijnen bij Nederlandse wijnwinkels en geeft persoonlijke aanbevelingen via AI-sommelier Maurice.",
                  "email": "info@wijnvinder.nl",
                  "areaServed": { "@type": "Country", "name": "Nederland" },
                },
                {
                  "@type": "WebSite",
                  "@id": `${SITE_URL}/#website`,
                  "name": "WijnVinder",
                  "url": SITE_URL,
                  "description": "Persoonlijke wijnaanbevelingen op basis van jouw smaakprofiel. Vergelijk prijzen bij Nederlandse wijnwinkels.",
                  "inLanguage": "nl-NL",
                  "publisher": { "@id": `${SITE_URL}/#organization` },
                  "potentialAction": {
                    "@type": "SearchAction",
                    "target": {
                      "@type": "EntryPoint",
                      "urlTemplate": `${SITE_URL}/wijnen?q={search_term_string}`,
                    },
                    "query-input": "required name=search_term_string",
                  },
                },
              ],
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
          <PwaRegister />
        </body>
    </html>
  );
}
