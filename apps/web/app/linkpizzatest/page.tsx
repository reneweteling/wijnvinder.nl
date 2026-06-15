import type { Metadata } from "next";

// Tijdelijke testpagina om het LinkPizza-script (pzz.js) op productie te bekijken:
// op wijnvinder.nl draait de host die het script verwacht, op localhost niet.
// We zetten een paar echte Wijnbeurs-links neer en kijken wat het script met de
// klik-URL doet, zodat we het redirect/affiliate-formaat kunnen reverse-engineeren.
export const metadata: Metadata = {
  title: "LinkPizza test",
  robots: { index: false, follow: false },
};

const LINKS: { name: string; url: string }[] = [
  { name: "Château Pontet-Canet 5e Grand Cru Classé Pauillac", url: "https://www.wijnbeurs.nl/chateau-pontet-canet-5e-grand-cru-classe-pauillac" },
  { name: "Château Gruaud-Larose 2e Grand Cru Classé Saint-Julien", url: "https://www.wijnbeurs.nl/chateau-gruau-larose-2e-grand-cru-classe-saint-julien" },
  { name: "Château Grand Puy Lacoste 5e Grand Cru Classé Pauillac", url: "https://www.wijnbeurs.nl/chateau-grand-puy-lacoste-5e-grand-cru-classe-pauillac" },
  { name: "Château Giscours 3e Grand Cru Classé Margaux", url: "https://www.wijnbeurs.nl/chateau-giscours-3e-grand-cru-classe-margaux" },
  { name: "Château du Tertre Margaux 5e Grand Cru Classé", url: "https://www.wijnbeurs.nl/chateau-du-tertre-margaux-5e-grand-cru-classe" },
  { name: "Château d’Armailhac 5e Grand Cru Classé Pauillac", url: "https://www.wijnbeurs.nl/chateau-darmailhac-5e-grand-cru-classe-pauillac" },
];

const PZZ_SNIPPET = `(function(p,z,Z){z=p.createElement("script");z.async=1;z.src="https://pzz.io/pzz.js?uid=104014&host="+p.domain;(p.head||p.documentElement).insertBefore(z,Z);})(document);`;

export default function LinkPizzaTestPage() {
  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "2rem 1rem", fontFamily: "system-ui, sans-serif" }}>
      {/* LinkPizza */}
      <script dangerouslySetInnerHTML={{ __html: PZZ_SNIPPET }} />

      <h1 style={{ fontSize: "1.4rem", marginBottom: ".5rem" }}>LinkPizza test (Wijnbeurs)</h1>
      <p style={{ color: "#666", fontSize: ".9rem", marginBottom: "1.5rem" }}>
        Tijdelijke pagina. Het LinkPizza-script (uid 104014) staat hierop. Klik op een
        link en kijk waar je naartoe wordt gestuurd, of inspecteer de href.
      </p>

      <ol style={{ lineHeight: 1.9 }}>
        {LINKS.map((l) => (
          <li key={l.url} style={{ marginBottom: "1rem" }}>
            <a
              className="lp-test-link"
              href={l.url}
              target="_blank"
              rel="noopener"
              style={{ color: "#7B1F2E", fontWeight: 600 }}
            >
              {l.name}
            </a>
            <br />
            <code style={{ fontSize: ".75rem", color: "#999", wordBreak: "break-all" }}>{l.url}</code>
          </li>
        ))}
      </ol>
    </div>
  );
}
