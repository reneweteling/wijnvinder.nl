import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Wijnen ontdekken",
  description:
    "Doorzoek en vergelijk 1700+ wijnen bij Nederlandse wijnwinkels. Filter op druif, regio, smaak en prijs.",
  alternates: {
    canonical: `${SITE_URL}/wijnen`,
  },
  openGraph: {
    title: "Wijnen ontdekken | WijnVinder",
    description:
      "Doorzoek en vergelijk 1700+ wijnen bij Nederlandse wijnwinkels. Filter op druif, regio, smaak en prijs.",
    url: `${SITE_URL}/wijnen`,
    siteName: "WijnVinder",
    locale: "nl_NL",
    type: "website",
  },
};

export default function WijnenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
