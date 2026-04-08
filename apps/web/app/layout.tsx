import type { Metadata } from "next";
import Script from "next/script";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { FavoritesProvider } from "@/lib/favorites-context";
import { CookieConsent } from "@/components/cookie-consent";

const GTM_ID = "GTM-PL683HW8";
const isProd = process.env.NODE_ENV === "production";

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
  twitter: {
    card: "summary_large_image",
    site: "@wijnvinder",
  },
  alternates: {
    canonical: "https://wijnvinder.nl",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl" className={`${playfair.variable} ${inter.variable}`} suppressHydrationWarning>
      {isProd && (
        <head>
          <Script id="gtm-consent-default" strategy="beforeInteractive">{`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('consent', 'default', {
              'ad_storage': 'denied',
              'ad_user_data': 'denied',
              'ad_personalization': 'denied',
              'analytics_storage': 'denied',
              'wait_for_update': 500,
            });
          `}</Script>
          <Script id="gtm" strategy="afterInteractive">{`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${GTM_ID}');
          `}</Script>
        </head>
      )}
      <body className="font-body antialiased">
        {isProd && <noscript><iframe src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`} height="0" width="0" style={{display:'none',visibility:'hidden'}} /></noscript>}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "WijnVinder",
              "url": "https://wijnvinder.nl",
              "description": "Persoonlijke wijnaanbevelingen op basis van jouw smaakprofiel. Vergelijk prijzen bij Nederlandse wijnwinkels.",
              "inLanguage": "nl",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://wijnvinder.nl/aanbevelingen?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            }) }}
          />
          <FavoritesProvider>
            <Header />
            <main className="pt-16">
              {children}
            </main>
            <Footer />
          </FavoritesProvider>
          {isProd && <CookieConsent />}
        </body>
    </html>
  );
}
