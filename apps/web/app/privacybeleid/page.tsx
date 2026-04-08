import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacybeleid - WijnVinder",
  description: "Het privacybeleid van WijnVinder.nl (Felobo B.V.).",
};

export default function PrivacybeleidPage() {
  return (
    <main className="min-h-[60vh] py-16 px-4">
      <div className="max-w-3xl mx-auto prose-custom">
        <h1 className="font-heading text-4xl font-bold text-foreground mb-6">
          Privacybeleid
        </h1>
        <p className="text-text-light text-sm mb-8">
          Laatst bijgewerkt: april 2026
        </p>

        <Section title="1. Wie zijn wij?">
          <p>
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
            Voor vragen over dit privacybeleid kun je contact opnemen via{" "}
            <a
              href="mailto:info@wijnvinder.nl"
              className="text-burgundy hover:underline"
            >
              info@wijnvinder.nl
            </a>
            .
          </p>
        </Section>

        <Section title="2. Welke gegevens verzamelen wij?">
          <p>Wij kunnen de volgende persoonsgegevens verwerken:</p>
          <ul>
            <li>
              <strong>Accountgegevens:</strong> e-mailadres en wachtwoord bij
              registratie.
            </li>
            <li>
              <strong>Smaakprofiel:</strong> jouw wijnvoorkeuren zoals druiven,
              stijlen en prijsrange.
            </li>
            <li>
              <strong>Favorieten:</strong> wijnen die je als favoriet hebt
              opgeslagen.
            </li>
            <li>
              <strong>Technische gegevens:</strong> IP-adres, browsertype en
              apparaatinformatie via standaard serverlogbestanden.
            </li>
          </ul>
        </Section>

        <Section title="3. Waarvoor gebruiken wij jouw gegevens?">
          <ul>
            <li>Het aanbieden van gepersonaliseerde wijnaanbevelingen.</li>
            <li>Het beheren van je account en favorieten.</li>
            <li>Het verbeteren van onze dienst en gebruikerservaring.</li>
            <li>Het nakomen van wettelijke verplichtingen.</li>
          </ul>
        </Section>

        <Section title="4. Grondslag voor verwerking">
          <p>
            Wij verwerken jouw gegevens op basis van jouw toestemming (bij
            registratie), de uitvoering van onze dienst, en/of ons gerechtvaardigd
            belang om WijnVinder te verbeteren.
          </p>
        </Section>

        <Section title="5. Delen met derden">
          <p>
            Wij verkopen jouw gegevens niet aan derden. Wij kunnen gegevens delen
            met verwerkers die ons helpen de dienst te draaien (zoals hosting),
            altijd onder passende verwerkersovereenkomsten.
          </p>
        </Section>

        <Section title="6. Bewaartermijn">
          <p>
            Wij bewaren jouw gegevens zolang je een account bij ons hebt. Na
            verwijdering van je account worden jouw persoonsgegevens binnen 30
            dagen verwijderd.
          </p>
        </Section>

        <Section title="7. Jouw rechten">
          <p>Op grond van de AVG heb je het recht om:</p>
          <ul>
            <li>Inzage te vragen in jouw persoonsgegevens.</li>
            <li>Jouw gegevens te laten corrigeren of verwijderen.</li>
            <li>De verwerking te beperken of hiertegen bezwaar te maken.</li>
            <li>Jouw gegevens over te dragen (dataportabiliteit).</li>
          </ul>
          <p>
            Neem hiervoor contact op via{" "}
            <a
              href="mailto:info@wijnvinder.nl"
              className="text-burgundy hover:underline"
            >
              info@wijnvinder.nl
            </a>
            . Je hebt ook het recht een klacht in te dienen bij de Autoriteit
            Persoonsgegevens.
          </p>
        </Section>

        <Section title="8. Cookies">
          <p>
            WijnVinder.nl maakt gebruik van functionele cookies die nodig zijn
            voor het inloggen en onthouden van je sessie. Wij gebruiken geen
            tracking- of advertentiecookies.
          </p>
        </Section>

        <Section title="9. Beveiliging">
          <p>
            Wij nemen passende technische en organisatorische maatregelen om jouw
            persoonsgegevens te beschermen tegen ongeoorloofde toegang, verlies of
            wijziging.
          </p>
        </Section>

        <Section title="10. Wijzigingen">
          <p>
            Wij kunnen dit privacybeleid van tijd tot tijd aanpassen. De meest
            recente versie is altijd beschikbaar op deze pagina.
          </p>
        </Section>
      </div>
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-8">
      <h2 className="font-heading font-semibold text-xl text-foreground mb-3">
        {title}
      </h2>
      <div className="text-text-light text-sm leading-relaxed space-y-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_strong]:text-foreground">
        {children}
      </div>
    </section>
  );
}
