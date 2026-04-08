import { Mail } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact - WijnVinder",
  description:
    "Neem contact op met WijnVinder.nl (Felobo B.V.) voor vragen of opmerkingen.",
};

export default function ContactPage() {
  return (
    <main className="min-h-[60vh] py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-heading text-4xl font-bold text-foreground mb-4">
          Contact
        </h1>
        <p className="text-text-light text-lg leading-relaxed mb-10">
          Heb je een vraag, opmerking of suggestie? Neem gerust contact met ons
          op. We horen graag van je.
        </p>

        <div className="max-w-sm mx-auto mb-12">
          <a
            href="mailto:info@wijnvinder.nl"
            className="bg-card border border-border rounded-xl p-6 flex flex-col items-center text-center hover:border-burgundy/40 transition-colors group"
          >
            <Mail className="w-8 h-8 text-burgundy mb-3 group-hover:scale-110 transition-transform" />
            <h2 className="font-heading font-semibold text-foreground mb-1">
              E-mail
            </h2>
            <p className="text-text-light text-sm">info@wijnvinder.nl</p>
          </a>
        </div>

        <div className="bg-surface border border-border rounded-xl p-8">
          <h2 className="font-heading font-semibold text-xl text-foreground mb-4">
            Bedrijfsgegevens
          </h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
            <div>
              <dt className="text-text-light">Bedrijfsnaam</dt>
              <dd className="text-foreground font-medium">
                <a href="https://www.weteling.com" target="_blank" rel="noopener noreferrer" className="text-burgundy hover:underline">
                  Felobo B.V.
                </a>
              </dd>
            </div>
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
          </dl>
        </div>
      </div>
    </main>
  );
}
