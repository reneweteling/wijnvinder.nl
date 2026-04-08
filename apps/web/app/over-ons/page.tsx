import { Wine, Users, Target, Heart } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Over ons - WijnVinder",
  description:
    "Leer meer over WijnVinder.nl en Felobo B.V. — wij helpen je de perfecte wijn te vinden.",
};

export default function OverOnsPage() {
  return (
    <main className="min-h-[60vh] py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-heading text-4xl font-bold text-foreground mb-6">
          Over WijnVinder
        </h1>

        <p className="text-text-light text-lg leading-relaxed mb-10">
          WijnVinder.nl is een initiatief van Felobo B.V. Wij geloven dat
          iedereen de perfecte wijn verdient — zonder eindeloos te zoeken.
          Daarom hebben wij WijnVinder gebouwd: een slimme zoekmachine die op
          basis van jouw persoonlijke smaakprofiel de beste wijnen vindt bij
          Nederlandse wijnwinkels.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
          {[
            {
              icon: Target,
              title: "Onze missie",
              text: "Wijn toegankelijk maken voor iedereen. Of je nu een doorgewinterde kenner bent of net begint met wijn ontdekken — WijnVinder helpt je altijd verder.",
            },
            {
              icon: Heart,
              title: "Persoonlijk",
              text: "Geen generieke lijsten, maar aanbevelingen die passen bij jouw smaak. Jouw profiel, jouw wijnen.",
            },
            {
              icon: Wine,
              title: "Onafhankelijk",
              text: "Wij vergelijken prijzen bij verschillende Nederlandse wijnwinkels zodat jij altijd de beste deal vindt.",
            },
            {
              icon: Users,
              title: "Voor iedereen",
              text: "Van een gezellig glas op vrijdagavond tot de perfecte fles voor een bijzonder diner — wij vinden hem voor je.",
            },
          ].map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="bg-card border border-border rounded-xl p-6"
            >
              <Icon className="w-6 h-6 text-burgundy mb-3" />
              <h2 className="font-heading font-semibold text-lg text-foreground mb-2">
                {title}
              </h2>
              <p className="text-text-light text-sm leading-relaxed">{text}</p>
            </div>
          ))}
        </div>

        <div className="bg-surface border border-border rounded-xl p-8">
          <h2 className="font-heading font-semibold text-xl text-foreground mb-4">
            Over Felobo B.V.
          </h2>
          <p className="text-text-light text-sm leading-relaxed mb-4">
            WijnVinder.nl is een geregistreerde handelsnaam van{" "}
            <a
              href="https://www.weteling.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-burgundy hover:underline"
            >
              Felobo B.V.
            </a>{" "}
            — KvK 80910483.
          </p>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
            <div>
              <dt className="text-text-light">KvK-nummer</dt>
              <dd className="text-foreground font-medium">80910483</dd>
            </div>
            <div>
              <dt className="text-text-light">BTW-nummer</dt>
              <dd className="text-foreground font-medium">
                NL8618.48007.B01
              </dd>
            </div>
            <div>
              <dt className="text-text-light">E-mail</dt>
              <dd className="text-foreground font-medium">
                <a
                  href="mailto:info@wijnvinder.nl"
                  className="text-burgundy hover:underline"
                >
                  info@wijnvinder.nl
                </a>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </main>
  );
}
