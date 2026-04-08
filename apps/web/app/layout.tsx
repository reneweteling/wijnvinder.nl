import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { FavoritesProvider } from "@/lib/favorites-context";

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
  metadataBase: new URL("https://wijnvinder.nl"),
  title: "WijnVinder - Vind jouw perfecte wijn",
  description:
    "Persoonlijke wijnaanbevelingen op basis van jouw smaakprofiel. Vergelijk prijzen bij Nederlandse wijnwinkels.",
  openGraph: {
    title: "WijnVinder - Vind jouw perfecte wijn",
    description:
      "Persoonlijke wijnaanbevelingen op basis van jouw smaakprofiel. Vergelijk prijzen bij Nederlandse wijnwinkels.",
    url: "https://wijnvinder.nl",
    siteName: "WijnVinder",
    locale: "nl_NL",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl" className={`${playfair.variable} ${inter.variable}`}>
      <body className="font-body antialiased">
          <FavoritesProvider>
            <Header />
            <div className="pt-16">
              {children}
            </div>
            <Footer />
          </FavoritesProvider>
        </body>
    </html>
  );
}
