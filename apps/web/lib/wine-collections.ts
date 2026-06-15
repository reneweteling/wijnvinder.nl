import type { WineType } from "@/lib/types";

/**
 * Selection / price guide collections. Like the other guides these are dynamic,
 * DB-backed pages: one route serves them all, the prose is curated and the wines
 * are queried live. Targets searches like "rode wijn", "wijn onder 10 euro" and
 * "wijn aanbieding".
 */
export type CollectionGuide = {
  slug: string;
  name: string;
  h1: string;
  intro: string;
  advice: string;
  faqQuestion: string;
  filter: {
    wineTypes?: WineType[];
    priceMax?: number;
    onSale?: boolean;
    minRating?: number;
  };
  /** Ordering of the result list. */
  sort: "rating" | "discount";
};

export const COLLECTION_GUIDES: CollectionGuide[] = [
  {
    slug: "beste-wijnen",
    name: "Beste wijnen",
    h1: "De beste wijnen volgens de beoordelingen",
    intro: "De hoogst beoordeelde wijnen van het moment, met de scherpste prijs bij Nederlandse wijnwinkels.",
    advice: "Op zoek naar een zekerheidje? Dit zijn de best beoordeelde wijnen uit onze catalogus, gerangschikt op hun Vivino-score. Van toegankelijke favorieten tot echte topwijnen: stuk voor stuk flessen waar veel wijnliefhebbers enthousiast over zijn.",
    faqQuestion: "Wat zijn de best beoordeelde wijnen?",
    filter: { minRating: 4 },
    sort: "rating",
  },
  {
    slug: "rode-wijn",
    name: "Rode wijn",
    h1: "Rode wijn: de best beoordeelde flessen",
    intro: "Ontdek de best beoordeelde rode wijnen en vergelijk prijzen bij Nederlandse wijnwinkels.",
    advice: "Rode wijn loopt van licht en soepel (Pinot Noir, Merlot) tot krachtig en vol (Cabernet Sauvignon, Syrah, Malbec). Lichtere reds passen bij gevogelte en pasta, stevige reds bij rood vlees en de BBQ. Hieronder de best beoordeelde rode wijnen op een rij.",
    faqQuestion: "Welke rode wijn is het lekkerst?",
    filter: { wineTypes: ["red"] },
    sort: "rating",
  },
  {
    slug: "witte-wijn",
    name: "Witte wijn",
    h1: "Witte wijn: de best beoordeelde flessen",
    intro: "Ontdek de best beoordeelde witte wijnen en vergelijk prijzen bij Nederlandse wijnwinkels.",
    advice: "Witte wijn varieert van knisperend fris (Sauvignon Blanc, Riesling) tot vol en romig (eikenhout-Chardonnay). Frisse witte wijn is ideaal bij vis, schaaldieren en salade; vollere witte wijn bij gevogelte en romige gerechten. Hieronder de best beoordeelde witte wijnen.",
    faqQuestion: "Welke witte wijn is het lekkerst?",
    filter: { wineTypes: ["white"] },
    sort: "rating",
  },
  {
    slug: "rose-wijn",
    name: "Rosé",
    h1: "Rosé: de best beoordeelde flessen",
    intro: "Ontdek de best beoordeelde rosés en vergelijk prijzen bij Nederlandse wijnwinkels.",
    advice: "Rosé is de frisse, fruitige zomerwijn bij uitstek: licht, droog en veelzijdig. Hij past bij van borrelhapjes en salade tot gegrilde groente en lichte vleesgerechten. Hieronder de best beoordeelde rosés.",
    faqQuestion: "Welke rosé is het lekkerst?",
    filter: { wineTypes: ["rose"] },
    sort: "rating",
  },
  {
    slug: "mousserende-wijn",
    name: "Mousserende wijn",
    h1: "Mousserende wijn: de best beoordeelde flessen",
    intro: "Champagne, Cava, Prosecco en meer: ontdek de best beoordeelde mousserende wijnen en vergelijk prijzen.",
    advice: "Mousserende wijn maakt elk moment feestelijk, van Champagne en Cava tot Prosecco. Door de bubbels en frisse zuren is het een perfecte aperitiefwijn en een feilloze partner bij schaaldieren en sushi. Hieronder de best beoordeelde mousserende wijnen.",
    faqQuestion: "Welke mousserende wijn is het lekkerst?",
    filter: { wineTypes: ["sparkling"] },
    sort: "rating",
  },
  {
    slug: "wijn-onder-10",
    name: "Wijn onder €10",
    h1: "Wijn onder €10: de beste goedkope wijnen",
    intro: "De best beoordeelde wijnen onder de 10 euro. Lekker hoeft niet duur te zijn, vergelijk de prijzen.",
    advice: "Goede wijn hoeft niet duur te zijn. Dit zijn de best beoordeelde wijnen die je voor minder dan 10 euro op de kop tikt. Ideaal voor doordeweeks, een groter gezelschap of gewoon om te ontdekken zonder veel uit te geven.",
    faqQuestion: "Wat is de beste wijn onder 10 euro?",
    filter: { priceMax: 10 },
    sort: "rating",
  },
  {
    slug: "wijn-onder-15",
    name: "Wijn onder €15",
    h1: "Wijn onder €15: de beste flessen voor weinig geld",
    intro: "De best beoordeelde wijnen onder de 15 euro. Vind een topfles voor een vriendelijke prijs.",
    advice: "In het segment tot 15 euro vind je verrassend veel kwaliteit. Dit zijn de best beoordeelde wijnen onder die grens: net dat beetje extra voor een diner of als cadeau, zonder dat het de spaarpot raakt.",
    faqQuestion: "Wat is een goede wijn onder 15 euro?",
    filter: { priceMax: 15 },
    sort: "rating",
  },
  {
    slug: "aanbiedingen",
    name: "Aanbiedingen",
    h1: "Wijn in de aanbieding: de beste deals",
    intro: "De grootste wijnkortingen van dit moment bij Nederlandse wijnwinkels. Profiteer van de scherpste prijzen.",
    advice: "Slim wijn kopen begint bij de aanbiedingen. Dit zijn de wijnen die nu het meeste in prijs verlaagd zijn, gerangschikt op korting. De prijzen worden dagelijks bijgewerkt, dus het loont om regelmatig te kijken.",
    faqQuestion: "Waar vind ik wijn in de aanbieding?",
    filter: { onSale: true },
    sort: "discount",
  },
];

export function getCollectionGuide(slug: string): CollectionGuide | undefined {
  return COLLECTION_GUIDES.find((c) => c.slug === slug);
}
