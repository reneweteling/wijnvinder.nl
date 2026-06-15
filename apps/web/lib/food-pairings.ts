import type { WineType } from "@/lib/types";

/**
 * Food-and-wine pairing guides. Each entry powers a /wijn-bij/{slug} landing
 * page that targets "wijn bij {gerecht}" search demand and links through to the
 * matching wines in the catalog. Wines are selected by grape (contains) and/or
 * wine type, so the pages stay filled even though many wines lack a wineType.
 */
export type FoodPairing = {
  slug: string;
  /** Short label for cards/nav, e.g. "Lamsvlees". */
  label: string;
  /** Question used as H1 / title, e.g. "Welke wijn bij lamsvlees?". */
  question: string;
  /** One-sentence summary, used as the meta description. */
  intro: string;
  /** Two to three sentences of genuine pairing advice (page body). */
  advice: string;
  /** Grape names matched with a case-insensitive "contains". */
  grapes: string[];
  /** Wine types that also qualify. */
  wineTypes: WineType[];
};

export const FOOD_PAIRINGS: FoodPairing[] = [
  {
    slug: "lamsvlees",
    label: "Lamsvlees",
    question: "Welke wijn bij lamsvlees?",
    intro:
      "Bij lamsvlees past een krachtige rode wijn met stevige tannine en kruidigheid. Vergelijk de beste flessen en prijzen.",
    advice:
      "Lamsvlees heeft een uitgesproken, licht wilde smaak die vraagt om een rode wijn met body en tannine. Klassiekers zijn een Bordeaux (Cabernet Sauvignon, Merlot), een Syrah uit de Rhône of een Rioja op basis van Tempranillo. De tannine snijdt door het vet en de kruidigheid van de wijn versterkt de smaak van het vlees.",
    grapes: ["syrah", "shiraz", "cabernet sauvignon", "grenache", "garnacha", "tempranillo", "merlot"],
    wineTypes: ["red"],
  },
  {
    slug: "biefstuk",
    label: "Biefstuk",
    question: "Welke wijn bij biefstuk?",
    intro:
      "Bij een biefstuk of steak hoort een stevige rode wijn waarvan de tannine door het vet snijdt. Bekijk de aanraders.",
    advice:
      "Een goede biefstuk verdient een volle rode wijn. Cabernet Sauvignon, Malbec en Tempranillo hebben de tannine en kracht om een sappig stuk vlees aan te kunnen. Hoe vetter en rijker het vlees, hoe steviger de wijn mag zijn.",
    grapes: ["cabernet sauvignon", "malbec", "merlot", "tempranillo", "syrah", "shiraz"],
    wineTypes: ["red"],
  },
  {
    slug: "bbq",
    label: "BBQ",
    question: "Welke wijn bij de BBQ?",
    intro:
      "Bij de BBQ scoren rijpe, fruitige en kruidige rode wijnen het best. Vergelijk prijzen van geschikte flessen.",
    advice:
      "Gegrild vlees en de rooksmaak van de BBQ vragen om gulle, fruitige reds. Denk aan een Shiraz, Malbec, Zinfandel of Primitivo: rijp fruit, een vleugje kruidigheid en genoeg body om tegen de grill op te boksen. Een stevige rosé doet het bij gevogelte ook prima.",
    grapes: ["shiraz", "syrah", "malbec", "zinfandel", "primitivo", "garnacha", "grenache", "tempranillo"],
    wineTypes: ["red"],
  },
  {
    slug: "pasta",
    label: "Pasta",
    question: "Welke wijn bij pasta met tomatensaus?",
    intro:
      "Bij pasta met tomatensaus past een Italiaanse rode wijn met frisse zuren. Ontdek welke flessen het best matchen.",
    advice:
      "De zuren van tomatensaus vragen om een wijn met evenveel frisheid. Italiaanse druiven als Sangiovese (Chianti), Barbera en Primitivo hebben die levendige zuurgraad en sappig rood fruit. Bij een romige saus mag de wijn iets voller, bij een pittige arrabbiata juist soepeler.",
    grapes: ["sangiovese", "barbera", "primitivo", "nebbiolo", "montepulciano", "merlot"],
    wineTypes: ["red"],
  },
  {
    slug: "pizza",
    label: "Pizza",
    question: "Welke wijn bij pizza?",
    intro:
      "Bij pizza past een soepele Italiaanse rode wijn. Vergelijk de lekkerste flessen en hun prijzen.",
    advice:
      "Pizza schreeuwt om een ongecompliceerde, sappige rode wijn. Sangiovese, Primitivo en Barbera passen perfect bij tomaat, kaas en kruiden. Bij een witte pizza of veel groente kan een frisse witte of rosé ook uitstekend werken.",
    grapes: ["sangiovese", "primitivo", "barbera", "merlot", "montepulciano"],
    wineTypes: ["red"],
  },
  {
    slug: "kip",
    label: "Kip",
    question: "Welke wijn bij kip?",
    intro:
      "Bij kip kun je alle kanten op: een romige witte wijn of een lichte rode. Bekijk de beste matches.",
    advice:
      "Kip is veelzijdig. Bij gebraden of romig bereide kip past een volle witte wijn als Chardonnay of Viognier prima. Bij een stevigere bereiding of een sausje op basis van vlees is een lichte rode wijn zoals Pinot Noir een mooie keuze.",
    grapes: ["chardonnay", "viognier", "pinot noir", "chenin blanc"],
    wineTypes: ["white"],
  },
  {
    slug: "vis",
    label: "Vis",
    question: "Welke wijn bij vis?",
    intro:
      "Bij vis past een frisse, droge witte wijn. Vergelijk de aanraders en vind de beste prijs.",
    advice:
      "De meeste vis komt het best tot zijn recht met een frisse, droge witte wijn. Sauvignon Blanc, Chablis-stijl Chardonnay, Verdejo en Pinot Grigio hebben de zuren en mineraliteit die vis nét dat beetje extra geven. Bij een vettere vis of romige saus mag de witte wijn iets voller zijn.",
    grapes: ["sauvignon blanc", "chardonnay", "verdejo", "pinot grigio", "chenin blanc", "riesling"],
    wineTypes: ["white"],
  },
  {
    slug: "garnalen",
    label: "Garnalen & schaaldieren",
    question: "Welke wijn bij garnalen en schaaldieren?",
    intro:
      "Bij garnalen, mosselen en andere schaaldieren past een mineralige witte wijn of mousserend. Bekijk de matches.",
    advice:
      "Schaaldieren vragen om frisheid en mineraliteit. Een knisperende Sauvignon Blanc, een Chablis of een Albariño tilt de zilte, zoete smaak van garnalen en mosselen op. Mousserende wijn of Champagne is met zijn bubbels en zuren een feilloze klassieker bij schaaldieren.",
    grapes: ["sauvignon blanc", "chardonnay", "riesling", "albariño", "albarino", "verdejo", "glera"],
    wineTypes: ["white", "sparkling"],
  },
  {
    slug: "sushi",
    label: "Sushi",
    question: "Welke wijn bij sushi?",
    intro:
      "Bij sushi past een frisse, aromatische witte wijn of mousserend. Ontdek welke flessen het best werken.",
    advice:
      "Sushi met zijn rijst, vis en sojasaus vraagt om een wijn die fris en aromatisch is zonder te overheersen. Een (licht zoete) Riesling, een droge Sauvignon Blanc of een mousserende wijn balanceren de umami en de zilte sojasaus mooi uit.",
    grapes: ["riesling", "sauvignon blanc", "verdejo", "glera", "chenin blanc"],
    wineTypes: ["white", "sparkling"],
  },
  {
    slug: "indisch",
    label: "Indisch & pittig",
    question: "Welke wijn bij Indisch of pittig eten?",
    intro:
      "Bij pittige en kruidige gerechten temt een licht zoete, aromatische witte wijn de heat. Vergelijk de aanraders.",
    advice:
      "Pittige gerechten worden alleen maar heter van een tanninerijke rode wijn. Kies juist een aromatische, licht zoete witte wijn: een off-dry Riesling, Gewürztraminer of Viognier. Het restzoet temt de pit en de aroma's passen bij de kruiden. Een fruitige rosé werkt ook goed.",
    grapes: ["riesling", "gewürztraminer", "gewurztraminer", "viognier", "chenin blanc", "pinot grigio"],
    wineTypes: ["white", "rose"],
  },
  {
    slug: "salade",
    label: "Salade",
    question: "Welke wijn bij salade?",
    intro:
      "Bij een frisse salade past een lichte, droge witte wijn of een rosé. Bekijk de beste combinaties.",
    advice:
      "Een salade is licht en fris, dus de wijn mag dat ook zijn. Een levendige Sauvignon Blanc, Pinot Grigio of Verdejo past bij groene salades en vinaigrette. Zit er geitenkaas of fruit in de salade, dan tilt een frisse witte of droge rosé het geheel mooi op.",
    grapes: ["sauvignon blanc", "pinot grigio", "verdejo", "chenin blanc"],
    wineTypes: ["white", "rose"],
  },
  {
    slug: "kaas",
    label: "Kaasplankje",
    question: "Welke wijn bij kaas?",
    intro:
      "Bij een kaasplankje hangt de wijn af van de kaas: vaak is een witte wijn veelzijdiger dan rood. Vergelijk de matches.",
    advice:
      "Anders dan veel mensen denken is een witte wijn bij kaas vaak veelzijdiger dan rood: de frisheid snijdt door het vet. Bij jonge en zachte kazen werkt een Chardonnay of Sauvignon Blanc, bij oude en pittige kazen een vollere witte of juist een stevige rode wijn als Nebbiolo of Tempranillo.",
    grapes: ["chardonnay", "riesling", "sauvignon blanc", "nebbiolo", "tempranillo", "chenin blanc"],
    wineTypes: ["white", "red"],
  },
  {
    slug: "borrel",
    label: "Borrel & aperitief",
    question: "Welke wijn bij de borrel?",
    intro:
      "Bij de borrel of als aperitief scoort een mousserende wijn of een frisse rosé het best. Bekijk de aanraders.",
    advice:
      "Een borrel vraagt om iets lichts en uitnodigends. Mousserende wijn zoals Prosecco of Cava maakt direct een feestje, en een droge rosé is fris en toegankelijk bij hapjes. Beide passen bij een breed scala aan borrelhapjes, van olijven tot kaas en charcuterie.",
    grapes: ["glera", "chardonnay", "pinot noir", "macabeo", "parellada"],
    wineTypes: ["sparkling", "rose"],
  },
];

export function getPairing(slug: string): FoodPairing | undefined {
  return FOOD_PAIRINGS.find((p) => p.slug === slug);
}
