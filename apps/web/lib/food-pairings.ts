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
  {
    slug: "wild",
    label: "Wild",
    question: "Welke wijn bij wild?",
    intro:
      "Bij wild zoals hert, ree of fazant past een krachtige, aardse rode wijn. Vergelijk de beste flessen.",
    advice:
      "Wild heeft een rijke, licht aardse smaak die vraagt om een rode wijn met body en complexiteit. Denk aan een Nebbiolo (Barolo), een rijpe Bourgogne of een stevige Rhône. De aardse en kruidige tonen in de wijn versterken het wild, terwijl de tannine het rijke vlees in balans houdt.",
    grapes: ["nebbiolo", "pinot noir", "syrah", "grenache", "mourvèdre", "cabernet sauvignon"],
    wineTypes: ["red"],
  },
  {
    slug: "eend",
    label: "Eend",
    question: "Welke wijn bij eend?",
    intro:
      "Bij eend past een soepele rode wijn met rood fruit en een frisse zuurgraad. Bekijk de aanraders.",
    advice:
      "Eend is vetter en voller van smaak dan kip, maar geen rood vlees. Een Pinot Noir is de klassieke keuze: het rode fruit en de frisse zuren snijden mooi door het vet. Ook een fruitige Merlot of een wijn op basis van Grenache werkt goed, zeker bij eend met een zoete saus.",
    grapes: ["pinot noir", "merlot", "grenache", "garnacha", "syrah"],
    wineTypes: ["red"],
  },
  {
    slug: "stoofvlees",
    label: "Stoofvlees",
    question: "Welke wijn bij stoofvlees?",
    intro:
      "Bij stoofvlees en stoofpotten past een stevige, rijpe rode wijn. Vergelijk de beste flessen en prijzen.",
    advice:
      "Langzaam gegaard stoofvlees heeft een diepe, rijke smaak die vraagt om een gulle rode wijn. Een Rioja op basis van Tempranillo, een Zuid-Franse Grenache of een stevige Italiaan past prima. Vaak gaat dezelfde wijn die je in de pan gebruikt ook goed in het glas.",
    grapes: ["tempranillo", "grenache", "garnacha", "syrah", "merlot", "sangiovese"],
    wineTypes: ["red"],
  },
  {
    slug: "risotto",
    label: "Risotto",
    question: "Welke wijn bij risotto?",
    intro:
      "Bij een romige risotto past een frisse tot volle witte wijn. Bekijk de geschikte flessen.",
    advice:
      "Risotto is romig en hartig, dus je wilt een witte wijn met genoeg frisheid om door te snijden. Een Italiaanse witte zoals Verdejo, een Pinot Grigio of een lichte Chardonnay werkt mooi. Bij een risotto met paddenstoelen mag het ook een lichte rode wijn zijn, zoals Pinot Noir.",
    grapes: ["chardonnay", "pinot grigio", "verdejo", "vermentino", "pinot noir"],
    wineTypes: ["white"],
  },
  {
    slug: "oesters",
    label: "Oesters",
    question: "Welke wijn bij oesters?",
    intro:
      "Bij oesters past een knisperend droge, minerale witte wijn of Champagne. Vergelijk de aanraders.",
    advice:
      "Oesters vragen om frisheid en zout-minerale tonen. De klassiekers zijn een Chablis, een Muscadet of een Sauvignon Blanc: strak, droog en knisperend. Een brut Champagne of Cava doet het door de bubbels en hoge zuren minstens zo goed.",
    grapes: ["chardonnay", "sauvignon blanc", "chablis", "muscadet"],
    wineTypes: ["white", "sparkling"],
  },
  {
    slug: "mosselen",
    label: "Mosselen",
    question: "Welke wijn bij mosselen?",
    intro:
      "Bij mosselen past een frisse, droge witte wijn. Bekijk de best beoordeelde flessen en prijzen.",
    advice:
      "Mosselen zijn licht en zilt, dus een frisse witte wijn is ideaal. Een Muscadet, Sauvignon Blanc of een droge Pinot Grigio past perfect en kun je meteen in de pan gebruiken. Hou de wijn strak en droog, zodat hij de zilte smaak van de mosselen niet overstemt.",
    grapes: ["sauvignon blanc", "pinot grigio", "chardonnay", "muscadet", "verdejo"],
    wineTypes: ["white"],
  },
  {
    slug: "gerookte-zalm",
    label: "Gerookte zalm",
    question: "Welke wijn bij gerookte zalm?",
    intro:
      "Bij gerookte zalm past een frisse witte wijn of Champagne met genoeg zuren. Vergelijk de aanraders.",
    advice:
      "De vette, rokerige smaak van gerookte zalm vraagt om frisheid en zuren als tegenwicht. Een droge Riesling, een Sauvignon Blanc of een brut Champagne snijdt mooi door het vet. Bubbels en een hoge zuurgraad maken de zalm lichter en verfrissen het palet.",
    grapes: ["riesling", "sauvignon blanc", "chardonnay", "pinot noir"],
    wineTypes: ["white", "sparkling"],
  },
  {
    slug: "aziatisch",
    label: "Aziatisch",
    question: "Welke wijn bij Aziatisch eten?",
    intro:
      "Bij Aziatische gerechten past een aromatische, licht zoete witte wijn. Bekijk de beste flessen.",
    advice:
      "Aziatisch eten combineert zoet, zout, zuur en pittig, vaak in één gerecht. Een off-dry Riesling of een aromatische Gewürztraminer brengt balans: het beetje restzoet temt de pit en de aroma's passen bij gember, kruiden en sojasaus. Bij milde gerechten werkt ook een frisse Pinot Grigio.",
    grapes: ["riesling", "gewürztraminer", "pinot grigio", "sauvignon blanc", "chenin blanc"],
    wineTypes: ["white"],
  },
  {
    slug: "pittig-eten",
    label: "Pittig eten",
    question: "Welke wijn bij pittig eten?",
    intro:
      "Bij pittige gerechten past een fruitige, licht zoete wijn die de scherpte tempert. Vergelijk de aanraders.",
    advice:
      "Pit en hoge alcohol versterken elkaar, dus een zware, droge rode wijn maakt een pittig gerecht juist heter. Kies een off-dry Riesling of een fruitige rosé: het restzoet en de frisheid temperen de scherpte en koelen het palet. Vermijd stevige tannine bij echt heet eten.",
    grapes: ["riesling", "gewürztraminer", "garnacha", "grenache"],
    wineTypes: ["white", "rose"],
  },
  {
    slug: "chocolade",
    label: "Chocolade & dessert",
    question: "Welke wijn bij chocolade?",
    intro:
      "Bij chocolade en zoete desserts past een rijke, zoete wijn zoals Port. Bekijk de geschikte flessen.",
    advice:
      "Bij een dessert wil je een wijn die zelf zeker zo zoet is, anders smaakt hij flets. Port is de klassieke partner bij chocolade: rijk, zoet en krachtig genoeg om tegen de cacao op te boksen. Ook een zoete oogstwijn of Moscato past mooi bij fruitige toetjes.",
    grapes: ["port", "moscato", "muscat"],
    wineTypes: ["dessert"],
  },
  {
    slug: "tapas",
    label: "Tapas",
    question: "Welke wijn bij tapas?",
    intro:
      "Bij tapas passen veelzijdige Spaanse wijnen: een frisse witte, een fruitige rode of Cava. Vergelijk de aanraders.",
    advice:
      "Tapas zijn divers, dus je wilt een veelzijdige wijn die bij van alles past. Een frisse Verdejo bij de vis- en groentehapjes, een soepele Tempranillo bij de vlees- en worsthapjes, of gewoon een Cava die het hele tafereel feestelijk maakt. Spaanse wijn bij Spaanse hapjes werkt zelden tegen.",
    grapes: ["verdejo", "tempranillo", "garnacha", "macabeo", "albariño"],
    wineTypes: ["white", "red", "sparkling"],
  },
  {
    slug: "paella",
    label: "Paella",
    question: "Welke wijn bij paella?",
    intro:
      "Bij paella past een frisse witte wijn of een droge rosé. Bekijk de best beoordeelde flessen.",
    advice:
      "Paella zit vol smaak van saffraan, zeevruchten en soms kip of chorizo. Een frisse Spaanse witte zoals Verdejo of Albariño houdt het licht, terwijl een droge rosé prima past bij een gemengde paella met vlees en vis. Hou de wijn fris zodat hij de hartige rijst aanvult.",
    grapes: ["verdejo", "albariño", "garnacha", "tempranillo", "macabeo"],
    wineTypes: ["white", "rose"],
  },
  {
    slug: "kalkoen",
    label: "Kalkoen & kerstdiner",
    question: "Welke wijn bij kalkoen?",
    intro:
      "Bij kalkoen en het kerstdiner past een soepele rode wijn of een volle witte. Vergelijk de aanraders.",
    advice:
      "Kalkoen is mild en mager, dus een wijn die niet overheerst werkt het best. Een Pinot Noir met rood fruit en frisse zuren is de klassieke kerstkeuze, en een volle witte Chardonnay past mooi bij het wittere vlees en de bijgerechten. Houd het elegant in plaats van zwaar.",
    grapes: ["pinot noir", "chardonnay", "merlot", "grenache"],
    wineTypes: ["red", "white"],
  },
  {
    slug: "gegrilde-groenten",
    label: "Gegrilde groenten",
    question: "Welke wijn bij gegrilde groenten?",
    intro:
      "Bij gegrilde groente past een frisse witte wijn of een droge rosé. Bekijk de geschikte flessen.",
    advice:
      "Gegrilde groente krijgt door de grill een lichte rooktoon en zoetheid. Een frisse witte zoals Verdejo of Sauvignon Blanc houdt het licht, en een droge rosé past mooi bij een gemengd groentebord. Bij stevig gegrilde paddenstoelen of aubergine kan ook een lichte rode wijn.",
    grapes: ["sauvignon blanc", "verdejo", "pinot grigio", "grenache"],
    wineTypes: ["white", "rose"],
  },
];

export function getPairing(slug: string): FoodPairing | undefined {
  return FOOD_PAIRINGS.find((p) => p.slug === slug);
}
