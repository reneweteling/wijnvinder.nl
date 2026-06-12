import type { Metadata } from "next";
import { CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Algemene voorwaarden - WijnVinder",
  description: "De algemene voorwaarden van WijnVinder.nl (Felobo B.V.).",
};

export default function AlgemeneVoorwaardenPage() {
  return (
    <main className="min-h-[60vh] py-16 px-4">
      <div className="max-w-3xl mx-auto prose-custom">
        <h1 className="font-heading text-4xl font-bold text-foreground mb-6">
          Algemene voorwaarden
        </h1>
        <p className="text-text-light text-sm mb-8">
          Laatst bijgewerkt: 12 juni 2026
        </p>

        <Section title="1. Definities en toepasselijkheid">
          <p>
            In deze algemene voorwaarden wordt verstaan onder:
          </p>
          <ul>
            <li>
              <strong>WijnVinder:</strong> WijnVinder.nl, een geregistreerde handelsnaam van Felobo B.V. (KvK 80910483).
            </li>
            <li>
              <strong>Dienst:</strong> het platform op WijnVinder.nl waarmee gebruikers wijnen kunnen vergelijken, aanbevelingen ontvangen en worden doorverwezen naar externe wijnwinkels.
            </li>
            <li>
              <strong>Gebruiker:</strong> iedere persoon die de website bezoekt of een account aanmaakt.
            </li>
            <li>
              <strong>Externe winkel:</strong> een derde partij die wijn verkoopt en waarvan WijnVinder prijzen en aanbiedingen toont.
            </li>
          </ul>
          <p>
            Deze voorwaarden zijn van toepassing op ieder gebruik van de Dienst. Door de website te gebruiken of een account aan te maken, aanvaard je deze voorwaarden.
          </p>
        </Section>

        <Section title="2. Beschrijving van de dienst">
          <p>
            WijnVinder is een vergelijkings- en aanbevelingsplatform voor wijn. Wij verkopen zelf geen wijn. Wij tonen prijzen, beschrijvingen en aanbiedingen van externe wijnwinkels en linken je door naar die winkels als je een wijn wilt kopen.
          </p>
          <p>
            De aankoop vindt volledig plaats bij de externe winkel, onder hun eigen voorwaarden. WijnVinder is geen partij bij die koopovereenkomst en draagt geen verantwoordelijkheid voor de afhandeling ervan.
          </p>
        </Section>

        <Section title="3. Leeftijdsverificatie (18+)">
          <p>
            Wijn is een alcoholisch product. Op grond van de NIX18-regelgeving is de verkoop van alcohol aan personen jonger dan 18 jaar verboden.
          </p>
          <p>
            Door gebruik te maken van WijnVinder verklaar je 18 jaar of ouder te zijn. Als je jonger bent dan 18 jaar, mag je de Dienst niet gebruiken. Wij behouden ons het recht voor accounts te sluiten als er aanwijzingen zijn dat de gebruiker jonger dan 18 jaar is.
          </p>
        </Section>

        <Section title="4. Accounts">
          <p>
            Bij registratie ben je verplicht correcte en volledige gegevens op te geven. Je bent zelf verantwoordelijk voor de geheimhouding van je wachtwoord en voor alle activiteiten die via jouw account plaatsvinden.
          </p>
          <p>
            Neem direct contact op via{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-burgundy hover:underline">
              {CONTACT_EMAIL}
            </a>{" "}
            als je vermoedt dat jouw account onbevoegd wordt gebruikt.
          </p>
          <p>
            WijnVinder mag accounts opschorten of verwijderen als er sprake is van misbruik, het schenden van deze voorwaarden, of andere gegronde redenen.
          </p>
        </Section>

        <Section title="5. Prijzen en beschikbaarheid">
          <p>
            Prijzen en beschikbaarheid van wijnen worden aangeleverd door externe winkels. Wij streven ernaar deze informatie actueel te houden, maar kunnen niet garanderen dat zij op ieder moment juist of volledig is.
          </p>
          <p>
            Aan de prijzen en beschikbaarheidsinformatie op WijnVinder kunnen geen rechten worden ontleend. De prijs en voorraad zoals vermeld op de website van de externe winkel zijn leidend op het moment van aankoop.
          </p>
        </Section>

        <Section title="6. Doorverwijzingen en affiliate-links">
          <p>
            Sommige links op WijnVinder zijn affiliate-links. Als je via zo&apos;n link een aankoop doet, kunnen wij een vergoeding ontvangen van de betreffende winkel. Dit heeft geen invloed op de prijs die jij betaalt.
          </p>
          <p>
            WijnVinder streeft ernaar aanbevelingen te doen op basis van relevantie voor de gebruiker, niet op basis van commerciële belangen.
          </p>
        </Section>

        <Section title="7. Intellectueel eigendom">
          <p>
            Alle rechten op de inhoud van WijnVinder, waaronder teksten, afbeeldingen, logo&apos;s en software, berusten bij Felobo B.V. of bij de betreffende rechthebbenden. Het is niet toegestaan deze inhoud te kopiëren, te verspreiden of te gebruiken zonder voorafgaande schriftelijke toestemming.
          </p>
        </Section>

        <Section title="8. Aansprakelijkheid">
          <p>
            WijnVinder wordt aangeboden zoals het is (&ldquo;as is&rdquo;). Wij sluiten aansprakelijkheid uit voor schade die voortvloeit uit:
          </p>
          <ul>
            <li>onjuiste of verouderde prijsinformatie;</li>
            <li>het niet beschikbaar zijn van de Dienst;</li>
            <li>aankopen bij of geschillen met externe winkels;</li>
            <li>onbevoegde toegang tot jouw account.</li>
          </ul>
          <p>
            Deze uitsluiting geldt niet voor schade veroorzaakt door opzet of grove nalatigheid van WijnVinder, en doet geen afbreuk aan rechten die je op grond van dwingend recht hebt.
          </p>
        </Section>

        <Section title="9. Wijzigingen van de voorwaarden">
          <p>
            WijnVinder kan deze voorwaarden aanpassen. Wijzigingen treden in werking 30 dagen na publicatie op deze pagina, tenzij een kortere termijn wettelijk verplicht is. Voortgezet gebruik van de Dienst na die datum geldt als aanvaarding van de gewijzigde voorwaarden.
          </p>
        </Section>

        <Section title="10. Toepasselijk recht">
          <p>
            Op deze voorwaarden is Nederlands recht van toepassing. Geschillen worden voorgelegd aan de bevoegde rechter in het arrondissement van de vestigingsplaats van Felobo B.V.
          </p>
        </Section>

        <Section title="11. Contact">
          <p>
            Voor vragen over deze voorwaarden kun je contact opnemen via{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-burgundy hover:underline">
              {CONTACT_EMAIL}
            </a>
            .
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
