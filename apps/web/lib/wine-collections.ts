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
    priceMin?: number;
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
  {
    slug: "rode-wijn-onder-10",
    name: "Rode wijn onder €10",
    h1: "Rode wijn onder €10: de beste goedkope reds",
    intro: "De best beoordeelde rode wijnen onder de 10 euro. Volop smaak voor doordeweeks, vergelijk de prijzen.",
    advice: "Een goede rode wijn voor minder dan 10 euro vind je vaker dan je denkt. In dit segment scoren soepele, fruitige reds uit Spanje, Italië en Zuid-Frankrijk goed: genoeg body voor bij het eten, zonder dat je veel uitgeeft. Ideaal voor doordeweeks of een groter gezelschap.",
    faqQuestion: "Wat is de beste rode wijn onder 10 euro?",
    filter: { wineTypes: ["red"], priceMax: 10 },
    sort: "rating",
  },
  {
    slug: "rode-wijn-onder-15",
    name: "Rode wijn onder €15",
    h1: "Rode wijn onder €15: kwaliteit voor weinig geld",
    intro: "De best beoordeelde rode wijnen onder de 15 euro. Net dat beetje extra voor bij een diner.",
    advice: "Tot 15 euro vind je rode wijnen met echt karakter. Denk aan een rijpe Rioja, een stevige Italiaan of een kruidige Rhône: flessen die een diner naar een hoger niveau tillen zonder de spaarpot te raken. Hieronder de best beoordeelde rode wijnen onder die grens.",
    faqQuestion: "Wat is een goede rode wijn onder 15 euro?",
    filter: { wineTypes: ["red"], priceMax: 15 },
    sort: "rating",
  },
  {
    slug: "witte-wijn-onder-10",
    name: "Witte wijn onder €10",
    h1: "Witte wijn onder €10: de beste goedkope witte wijnen",
    intro: "De best beoordeelde witte wijnen onder de 10 euro. Fris en lekker voor weinig, vergelijk de prijzen.",
    advice: "Een frisse witte wijn voor onder de 10 euro is zo gevonden. In dit segment zitten knisperende Italianen, soepele Spanjaarden en aromatische druiven die het prima doen bij vis, salade of gewoon als borrelwijn. Hieronder de best beoordeelde witte wijnen onder die prijs.",
    faqQuestion: "Wat is de beste witte wijn onder 10 euro?",
    filter: { wineTypes: ["white"], priceMax: 10 },
    sort: "rating",
  },
  {
    slug: "witte-wijn-onder-15",
    name: "Witte wijn onder €15",
    h1: "Witte wijn onder €15: kwaliteit voor een vriendelijke prijs",
    intro: "De best beoordeelde witte wijnen onder de 15 euro. Van fris tot vol, vergelijk de prijzen.",
    advice: "In het segment tot 15 euro vind je witte wijnen voor elk moment: knisperend fris bij vis en schaaldieren, of voller en romiger bij gevogelte en romige gerechten. Net dat beetje meer keuze en kwaliteit voor een prettige prijs. Hieronder de best beoordeelde witte wijnen onder die grens.",
    faqQuestion: "Wat is een goede witte wijn onder 15 euro?",
    filter: { wineTypes: ["white"], priceMax: 15 },
    sort: "rating",
  },
  {
    slug: "rose-onder-12",
    name: "Rosé onder €12",
    h1: "Rosé onder €12: de beste betaalbare rosés",
    intro: "De best beoordeelde rosés onder de 12 euro. Frisse zomerwijn voor weinig, vergelijk de prijzen.",
    advice: "Rosé hoeft niet duur te zijn om lekker te zijn. Onder de 12 euro vind je volop frisse, droge rosés voor op het terras, bij de borrel of bij een lichte maaltijd. Hieronder de best beoordeelde rosés onder die prijs.",
    faqQuestion: "Wat is een goede rosé onder 12 euro?",
    filter: { wineTypes: ["rose"], priceMax: 12 },
    sort: "rating",
  },
  {
    slug: "mousserend-onder-20",
    name: "Bubbels onder €20",
    h1: "Mousserende wijn onder €20: betaalbare bubbels",
    intro: "De best beoordeelde mousserende wijnen onder de 20 euro. Cava, Prosecco en meer, vergelijk de prijzen.",
    advice: "Bubbels voor elk feestje hoeven geen vermogen te kosten. Onder de 20 euro vind je uitstekende Cava en Prosecco met genoeg frisheid en fijne bubbels om elk moment feestelijk te maken. Hieronder de best beoordeelde betaalbare mousserende wijnen.",
    faqQuestion: "Wat is een goede mousserende wijn onder 20 euro?",
    filter: { wineTypes: ["sparkling"], priceMax: 20 },
    sort: "rating",
  },
  {
    slug: "wijn-onder-5",
    name: "Wijn onder €5",
    h1: "Wijn onder €5: de goedkoopste flessen",
    intro: "De best beoordeelde wijnen onder de 5 euro. Goedkoper dan dit wordt het niet, vergelijk de prijzen.",
    advice: "Soms zoek je gewoon een prima fles voor zo min mogelijk geld. Dit zijn de best beoordeelde wijnen die je voor minder dan 5 euro op de kop tikt: handig voor een groot gezelschap, om mee te koken of gewoon doordeweeks. Verwacht geen topwijnen, wel eerlijke prijs-kwaliteit.",
    faqQuestion: "Wat is de beste wijn onder 5 euro?",
    filter: { priceMax: 5 },
    sort: "rating",
  },
  {
    slug: "topwijnen",
    name: "Topwijnen",
    h1: "Topwijnen: bijzondere flessen vanaf €50",
    intro: "De best beoordeelde topwijnen vanaf 50 euro. Voor een speciale gelegenheid, vergelijk de prijzen.",
    advice: "Voor een bijzonder moment mag de fles ook bijzonder zijn. Dit zijn de hoogst gewaardeerde topwijnen vanaf 50 euro: flessen met klasse, complexiteit en bewaarpotentieel. Een mooie keuze voor een feest, een groot diner of als cadeau voor de echte liefhebber.",
    faqQuestion: "Wat zijn de beste topwijnen?",
    filter: { priceMin: 50 },
    sort: "rating",
  },
  {
    slug: "wijn-cadeau",
    name: "Wijn cadeau",
    h1: "Wijn als cadeau: zo geef je altijd raak",
    intro: "De best beoordeelde wijnen vanaf 20 euro om cadeau te geven. Vind een fles die indruk maakt.",
    advice: "Een goede fles wijn is altijd een welkom cadeau. Vanaf zo'n 20 euro geef je iets met klasse: een hoog gewaardeerde wijn die laat zien dat je over de keuze hebt nagedacht. Hieronder de best beoordeelde wijnen die zich uitstekend lenen als cadeau.",
    faqQuestion: "Welke wijn geef je als cadeau?",
    filter: { minRating: 4, priceMin: 20 },
    sort: "rating",
  },
  {
    slug: "dessertwijn",
    name: "Dessertwijn",
    h1: "Dessertwijn: zoete wijnen bij het toetje",
    intro: "De best beoordeelde dessertwijnen. Van Port tot zoete oogst, vergelijk de prijzen.",
    advice: "Een goede dessertwijn maakt het toetje af. Van Port en zoete oogstwijnen tot Moscato: door hun rijke zoetheid passen ze prachtig bij gebak, blauwe kaas en chocolade. Hieronder de best beoordeelde dessertwijnen op een rij.",
    faqQuestion: "Welke wijn past bij een dessert?",
    filter: { wineTypes: ["dessert"] },
    sort: "rating",
  },
];

export function getCollectionGuide(slug: string): CollectionGuide | undefined {
  return COLLECTION_GUIDES.find((c) => c.slug === slug);
}
