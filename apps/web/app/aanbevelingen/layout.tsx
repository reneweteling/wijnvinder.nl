import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wijnen ontdekken",
  description:
    "Doorzoek en vergelijk 1700+ wijnen bij Nederlandse wijnwinkels. Filter op druif, regio, smaak en prijs.",
  alternates: {
    canonical: "https://wijnvinder.nl/aanbevelingen",
  },
  openGraph: {
    title: "Wijnen ontdekken | WijnVinder",
    description:
      "Doorzoek en vergelijk 1700+ wijnen bij Nederlandse wijnwinkels. Filter op druif, regio, smaak en prijs.",
    url: "https://wijnvinder.nl/aanbevelingen",
    siteName: "WijnVinder",
    locale: "nl_NL",
    type: "website",
  },
};

export default function AanbevelingenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
