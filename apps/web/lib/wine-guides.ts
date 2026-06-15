/**
 * Grape and country guide data. Each entry powers a dynamic, DB-backed landing
 * page: the prose is curated, the wines/prices/ratings are queried live from the
 * catalog. Targets searches like "malbec wijn" and "wijn uit frankrijk".
 */

export type GrapeGuide = {
  slug: string;
  name: string;
  h1: string;
  intro: string;
  advice: string;
  faqQuestion: string;
  /** Grape names matched with a case-insensitive "contains". */
  match: string[];
};

export type CountryGuide = {
  slug: string;
  name: string;
  h1: string;
  intro: string;
  advice: string;
  faqQuestion: string;
  /** Country values as stored in the catalog, matched case-insensitively. */
  countries: string[];
  /** [latitude, longitude, half-width in degrees] for the location map. */
  map: [number, number, number];
};

export const GRAPE_GUIDES: GrapeGuide[] = [
  {
    slug: "chardonnay",
    name: "Chardonnay",
    h1: "Chardonnay: smaak, kenmerken en de beste flessen",
    intro: "Chardonnay is de bekendste witte druif ter wereld. Ontdek de smaak, stijlen en de best beoordeelde Chardonnays met de scherpste prijs.",
    advice: "Chardonnay is een veelzijdige witte druif die van knisperend fris tot vol en romig kan zijn. Onbehandelde Chardonnay (zoals Chablis) is mineralig en strak; op eikenhout gerijpte versies krijgen boter-, vanille- en tropisch-fruitige tonen. Daardoor past Chardonnay bij van schaaldieren en witvis tot gevogelte en romige sauzen.",
    faqQuestion: "Wat is Chardonnay voor wijn?",
    match: ["chardonnay"],
  },
  {
    slug: "sauvignon-blanc",
    name: "Sauvignon Blanc",
    h1: "Sauvignon Blanc: smaak, kenmerken en de beste flessen",
    intro: "Sauvignon Blanc is een frisse, aromatische witte wijn. Lees over de smaak en vergelijk de best beoordeelde flessen.",
    advice: "Sauvignon Blanc staat bekend om zijn knisperende frisheid en aroma's van groene appel, kruisbes, citrus en gras. Bekende stijlen komen uit de Loire (Sancerre) en Nieuw-Zeeland. Door de hoge zuurgraad is het een topkeuze bij vis, schaaldieren, salade en geitenkaas.",
    faqQuestion: "Hoe smaakt Sauvignon Blanc?",
    match: ["sauvignon blanc"],
  },
  {
    slug: "pinot-noir",
    name: "Pinot Noir",
    h1: "Pinot Noir: smaak, kenmerken en de beste flessen",
    intro: "Pinot Noir is een elegante, lichte rode wijn. Ontdek de smaak en de best beoordeelde Pinot Noirs.",
    advice: "Pinot Noir is een verfijnde rode druif met lichte tannine, frisse zuren en aroma's van rood fruit zoals kers en framboos, vaak met een aardse toon. De thuisbasis is de Bourgogne. Door zijn elegantie past Pinot Noir bij gevogelte, zalm, paddenstoelen en zachtere vleesgerechten.",
    faqQuestion: "Wat is Pinot Noir voor wijn?",
    match: ["pinot noir"],
  },
  {
    slug: "cabernet-sauvignon",
    name: "Cabernet Sauvignon",
    h1: "Cabernet Sauvignon: smaak, kenmerken en de beste flessen",
    intro: "Cabernet Sauvignon is een krachtige rode druif met stevige tannine. Vergelijk de beste flessen en prijzen.",
    advice: "Cabernet Sauvignon is een van de meest geplante rode druiven en de ruggengraat van veel Bordeaux-wijnen. Verwacht stevige tannine, body en aroma's van zwarte bes, cederhout en soms een groene kruidigheid. Een klassieke partner voor rood vlees zoals biefstuk en lamsvlees.",
    faqQuestion: "Hoe smaakt Cabernet Sauvignon?",
    match: ["cabernet sauvignon"],
  },
  {
    slug: "merlot",
    name: "Merlot",
    h1: "Merlot: smaak, kenmerken en de beste flessen",
    intro: "Merlot is een soepele, toegankelijke rode wijn. Ontdek de smaak en de best beoordeelde flessen.",
    advice: "Merlot is zachter en ronder dan Cabernet Sauvignon, met zacht tannine en sappige aroma's van pruim, kers en chocolade. Daardoor is het een toegankelijke rode wijn die zowel op zichzelf als bij eten goed werkt: gevogelte, pasta, gegrild vlees en zachte kazen.",
    faqQuestion: "Wat is Merlot voor wijn?",
    match: ["merlot"],
  },
  {
    slug: "riesling",
    name: "Riesling",
    h1: "Riesling: smaak, kenmerken en de beste flessen",
    intro: "Riesling is een aromatische witte druif, van kurkdroog tot zoet. Vergelijk de best beoordeelde Rieslings.",
    advice: "Riesling is een van de edelste witte druiven, met hoge zuurgraad en aroma's van limoen, perzik, appel en een typische minerale toets. De stijl loopt van kurkdroog tot zoet. Off-dry Riesling is ideaal bij pittige en Aziatische gerechten; droge versies passen bij vis en gevogelte.",
    faqQuestion: "Is Riesling zoet of droog?",
    match: ["riesling"],
  },
  {
    slug: "tempranillo",
    name: "Tempranillo",
    h1: "Tempranillo: smaak, kenmerken en de beste flessen",
    intro: "Tempranillo is de bekendste rode druif van Spanje, hart van de Rioja. Ontdek de beste flessen.",
    advice: "Tempranillo is de trots van Spanje en de basis van Rioja en Ribera del Duero. De wijn combineert rood fruit en leer met tonen van vanille en kokos door rijping op Amerikaans eikenhout. Met zijn body en kruidigheid past Tempranillo bij lamsvlees, gegrild vlees en stoofgerechten.",
    faqQuestion: "Wat is Tempranillo voor wijn?",
    match: ["tempranillo"],
  },
  {
    slug: "malbec",
    name: "Malbec",
    h1: "Malbec: smaak, kenmerken en de beste flessen",
    intro: "Malbec is een diepe, fruitige rode wijn, beroemd uit Argentinië. Vergelijk de best beoordeelde flessen.",
    advice: "Malbec werd groot in Argentinië en geeft een diepgekleurde, fluwelige rode wijn met rijp zwart fruit, pruim en een vleugje cacao en kruiden. De zachte maar volle structuur maakt Malbec een geliefde partner bij steak, BBQ en stevig vlees.",
    faqQuestion: "Hoe smaakt Malbec?",
    match: ["malbec"],
  },
  {
    slug: "syrah",
    name: "Syrah / Shiraz",
    h1: "Syrah (Shiraz): smaak, kenmerken en de beste flessen",
    intro: "Syrah, ook bekend als Shiraz, geeft een krachtige, kruidige rode wijn. Ontdek de beste flessen.",
    advice: "Syrah (in Australië Shiraz genoemd) levert een volle, kruidige rode wijn met aroma's van zwarte bes, peper en soms een rokerige toon. In de noordelijke Rhône is hij verfijnd en peperig, in Australië juist rijp en gul. Een uitstekende keuze bij gegrild vlees, wild en de BBQ.",
    faqQuestion: "Wat is het verschil tussen Syrah en Shiraz?",
    match: ["syrah", "shiraz"],
  },
  {
    slug: "sangiovese",
    name: "Sangiovese",
    h1: "Sangiovese: smaak, kenmerken en de beste flessen",
    intro: "Sangiovese is de belangrijkste rode druif van Italië, hart van de Chianti. Vergelijk de beste flessen.",
    advice: "Sangiovese is de ziel van Toscane en de basis van Chianti en Brunello. De wijn heeft stevige zuren en tannine met aroma's van zure kers, kruiden en een aardse toets. Die frisheid maakt Sangiovese ideaal bij Italiaans eten: pasta met tomatensaus, pizza en gerijpte kazen.",
    faqQuestion: "Wat is Sangiovese voor wijn?",
    match: ["sangiovese"],
  },
  {
    slug: "grenache",
    name: "Grenache / Garnacha",
    h1: "Grenache (Garnacha): smaak, kenmerken en de beste flessen",
    intro: "Grenache, in Spanje Garnacha, geeft een warme, fruitige rode wijn. Ontdek de best beoordeelde flessen.",
    advice: "Grenache (Spaans: Garnacha) geeft gulle, warme rode wijnen met rijp rood fruit, kruiden en zachte tannine. Het is een hoofdrolspeler in Châteauneuf-du-Pape en veel Spaanse blends. Door de soepele, fruitige stijl past Grenache bij gegrild vlees, stoofpotten en mediterrane gerechten.",
    faqQuestion: "Wat is Grenache of Garnacha?",
    match: ["grenache", "garnacha"],
  },
  {
    slug: "pinot-grigio",
    name: "Pinot Grigio",
    h1: "Pinot Grigio: smaak, kenmerken en de beste flessen",
    intro: "Pinot Grigio is een lichte, frisse witte wijn. Vergelijk de best beoordeelde flessen en prijzen.",
    advice: "Pinot Grigio (Frans: Pinot Gris) is een lichte, droge witte wijn met frisse zuren en aroma's van peer, citrus en groene appel. De Italiaanse stijl is licht en knisperend, de Elzasser versie juist voller en aromatischer. Een prettige aperitiefwijn en mooi bij vis, salade en lichte gerechten.",
    faqQuestion: "Hoe smaakt Pinot Grigio?",
    match: ["pinot grigio", "pinot gris"],
  },
  {
    slug: "chenin-blanc",
    name: "Chenin Blanc",
    h1: "Chenin Blanc: smaak, kenmerken en de beste flessen",
    intro: "Chenin Blanc is een veelzijdige witte druif uit de Loire en Zuid-Afrika. Ontdek de beste flessen.",
    advice: "Chenin Blanc is enorm veelzijdig: van droog en fris tot halfzoet en mousserend, altijd met levendige zuren en aroma's van appel, kweepeer en honing. De Loire en Zuid-Afrika zijn de bakermat. Droge Chenin past bij vis en gevogelte, halfzoete versies bij pittige gerechten.",
    faqQuestion: "Wat is Chenin Blanc voor wijn?",
    match: ["chenin blanc", "steen"],
  },
  {
    slug: "primitivo",
    name: "Primitivo / Zinfandel",
    h1: "Primitivo (Zinfandel): smaak, kenmerken en de beste flessen",
    intro: "Primitivo, genetisch gelijk aan Zinfandel, geeft een rijpe, krachtige rode wijn uit Puglia. Vergelijk de beste flessen.",
    advice: "Primitivo uit Zuid-Italië (genetisch identiek aan de Amerikaanse Zinfandel) geeft een rijpe, gulle rode wijn met hoog alcohol, zoet zwart fruit, pruim en een kruidige toets. De volle, fluwelige stijl is heerlijk bij gegrild vlees, pizza en stevige pastagerechten.",
    faqQuestion: "Is Primitivo hetzelfde als Zinfandel?",
    match: ["primitivo", "zinfandel"],
  },
  {
    slug: "nebbiolo",
    name: "Nebbiolo",
    h1: "Nebbiolo: smaak, kenmerken en de beste flessen",
    intro: "Nebbiolo is de edele rode druif achter Barolo en Barbaresco. Ontdek de smaak en de beste flessen.",
    advice: "Nebbiolo uit Piemonte is de druif van Barolo en Barbaresco: bleek van kleur, maar krachtig in smaak. Verwacht stevige tannine, hoge zuren en aroma's van kers, rozen, teer en truffel. Het is een wijn voor liefhebbers en voor de tafel, prachtig bij rijke gerechten met paddenstoelen, wild en truffel.",
    faqQuestion: "Wat is Nebbiolo voor wijn?",
    match: ["nebbiolo"],
  },
  {
    slug: "verdejo",
    name: "Verdejo",
    h1: "Verdejo: smaak, kenmerken en de beste flessen",
    intro: "Verdejo is de frisse witte druif uit Rueda in Spanje. Vergelijk de best beoordeelde flessen.",
    advice: "Verdejo is de bekendste witte druif van Spanje, met Rueda als thuisbasis. Hij geeft een frisse, aromatische wijn met aroma's van citrus, witte perzik, venkel en een licht bittertje in de afdronk. Een prima alternatief voor Sauvignon Blanc en heerlijk bij vis, schaaldieren en tapas.",
    faqQuestion: "Hoe smaakt Verdejo?",
    match: ["verdejo"],
  },
  {
    slug: "cabernet-franc",
    name: "Cabernet Franc",
    h1: "Cabernet Franc: smaak, kenmerken en de beste flessen",
    intro: "Cabernet Franc is een elegante, kruidige rode druif uit de Loire en Bordeaux. Ontdek de beste flessen.",
    advice: "Cabernet Franc is verfijnder en lichter dan Cabernet Sauvignon, met soepel tannine en aroma's van rood fruit, paprika en potlood. In de Loire (Chinon, Bourgueil) staat hij solo, in Bordeaux speelt hij een bijrol in de blend. Mooi bij gevogelte, kalfsvlees en gegrilde groente.",
    faqQuestion: "Wat is Cabernet Franc voor wijn?",
    match: ["cabernet franc"],
  },
  {
    slug: "viognier",
    name: "Viognier",
    h1: "Viognier: smaak, kenmerken en de beste flessen",
    intro: "Viognier is een volle, aromatische witte druif uit de Rhône. Vergelijk de best beoordeelde flessen.",
    advice: "Viognier geeft een volle, parfumige witte wijn met lage zuren en weelderige aroma's van abrikoos, perzik en bloesem. De thuisbasis is de noordelijke Rhône (Condrieu), maar je vindt hem nu wereldwijd. Door zijn rondheid past Viognier mooi bij gevogelte, milde curry en romige gerechten.",
    faqQuestion: "Hoe smaakt Viognier?",
    match: ["viognier"],
  },
];

export const COUNTRY_GUIDES: CountryGuide[] = [
  {
    slug: "frankrijk",
    name: "Frankrijk",
    h1: "Wijn uit Frankrijk: regio's, stijlen en de beste flessen",
    intro: "Franse wijn is wereldberoemd, van Bordeaux tot Bourgogne. Vergelijk de best beoordeelde Franse wijnen en prijzen.",
    advice: "Frankrijk is het hart van de wijnwereld, met iconische regio's als Bordeaux (krachtige rode blends), Bourgogne (Pinot Noir en Chardonnay), de Rhône (Syrah, Grenache), de Loire (Sauvignon Blanc, Chenin) en Champagne. Franse wijn staat bekend om terroir, elegantie en bewaarpotentieel.",
    faqQuestion: "Wat kenmerkt Franse wijn?",
    countries: ["Frankrijk"],
    map: [46.6, 2.6, 4.6],
  },
  {
    slug: "italie",
    name: "Italië",
    h1: "Wijn uit Italië: regio's, stijlen en de beste flessen",
    intro: "Italiaanse wijn biedt een enorme variatie, van Chianti tot Prosecco. Ontdek de best beoordeelde Italiaanse wijnen.",
    advice: "Italië heeft de grootste druivendiversiteit ter wereld. Bekende stijlen zijn Toscaanse Sangiovese (Chianti, Brunello), Piëmontese Nebbiolo (Barolo), Zuid-Italiaanse Primitivo, en mousserende Prosecco. Italiaanse wijnen hebben vaak frisse zuren die ze perfect bij eten maken.",
    faqQuestion: "Wat kenmerkt Italiaanse wijn?",
    countries: ["Italië"],
    map: [42.6, 12.6, 4.6],
  },
  {
    slug: "spanje",
    name: "Spanje",
    h1: "Wijn uit Spanje: regio's, stijlen en de beste flessen",
    intro: "Spaanse wijn biedt veel kwaliteit voor weinig geld, met Rioja als boegbeeld. Vergelijk de beste flessen.",
    advice: "Spanje staat bekend om uitstekende prijs-kwaliteit. Tempranillo domineert in Rioja en Ribera del Duero, Garnacha levert warme reds, en in het noordwesten maakt Albariño frisse witte wijn. Cava is de Spaanse mousserende wijn. Veel Spaanse rode wijn rijpt op eikenhout (crianza, reserva).",
    faqQuestion: "Wat kenmerkt Spaanse wijn?",
    countries: ["Spanje"],
    map: [40.0, -3.7, 5.2],
  },
  {
    slug: "duitsland",
    name: "Duitsland",
    h1: "Wijn uit Duitsland: regio's, stijlen en de beste flessen",
    intro: "Duitse wijn draait om Riesling: aromatisch, fris en veelzijdig. Ontdek de best beoordeelde flessen.",
    advice: "Duitsland is het Riesling-land bij uitstek, met aromatische witte wijnen van kurkdroog tot edelzoet en altijd met levendige zuren. Regio's als de Moezel en de Rheingau leveren elegante, mineralige wijnen. Daarnaast wint Duitse Spätburgunder (Pinot Noir) steeds meer terrein.",
    faqQuestion: "Wat kenmerkt Duitse wijn?",
    countries: ["Duitsland"],
    map: [50.6, 8.6, 3.6],
  },
  {
    slug: "portugal",
    name: "Portugal",
    h1: "Wijn uit Portugal: regio's, stijlen en de beste flessen",
    intro: "Portugese wijn biedt unieke inheemse druiven en topkwaliteit, van de Douro tot Vinho Verde. Vergelijk de beste flessen.",
    advice: "Portugal heeft een schat aan inheemse druiven. De Douro levert krachtige rode wijnen (en Port), terwijl Vinho Verde in het noorden frisse, lichte witte wijn maakt. Veel Portugese wijnen zijn blends en bieden uitstekende prijs-kwaliteit.",
    faqQuestion: "Wat kenmerkt Portugese wijn?",
    countries: ["Portugal"],
    map: [39.8, -8.2, 2.6],
  },
  {
    slug: "zuid-afrika",
    name: "Zuid-Afrika",
    h1: "Wijn uit Zuid-Afrika: regio's, stijlen en de beste flessen",
    intro: "Zuid-Afrikaanse wijn combineert Oude en Nieuwe Wereld, met Chenin Blanc en Pinotage als specialiteiten. Ontdek de beste flessen.",
    advice: "Zuid-Afrika maakt wijnen die elegantie en rijp fruit combineren. Chenin Blanc (lokaal 'Steen') is de witte specialiteit, en Pinotage is de eigen rode kruising. Rond Stellenbosch en Swartland komen veel topwijnen vandaan, vaak met sterke prijs-kwaliteit.",
    faqQuestion: "Wat kenmerkt Zuid-Afrikaanse wijn?",
    countries: ["Zuid-Afrika"],
    map: [-33.6, 19.6, 2.6],
  },
  {
    slug: "argentinie",
    name: "Argentinië",
    h1: "Wijn uit Argentinië: regio's, stijlen en de beste flessen",
    intro: "Argentijnse wijn draait om Malbec uit de hooggelegen wijngaarden van Mendoza. Vergelijk de best beoordeelde flessen.",
    advice: "Argentinië is wereldberoemd om Malbec: diepgekleurd, fluwelig en vol rijp zwart fruit. De hooggelegen wijngaarden rond Mendoza geven concentratie en frisheid. Daarnaast maakt het land aromatische witte Torrontés. Argentijnse wijn is een natuurlijke partner van steak en BBQ.",
    faqQuestion: "Wat kenmerkt Argentijnse wijn?",
    countries: ["Argentinië", "Argentinie"],
    map: [-33.4, -68.9, 3.2],
  },
  {
    slug: "oostenrijk",
    name: "Oostenrijk",
    h1: "Wijn uit Oostenrijk: regio's, stijlen en de beste flessen",
    intro: "Oostenrijkse wijn staat bekend om de frisse, kruidige Grüner Veltliner. Ontdek de best beoordeelde flessen.",
    advice: "Oostenrijk maakt strakke, mineralige witte wijnen, met Grüner Veltliner als handtekening: fris, met witte peper en citrus. Ook elegante Riesling en verfijnde rode wijnen (Blaufränkisch, Zweigelt) komen er vandaan. Grüner Veltliner is een uitstekende keuze bij vis en groente.",
    faqQuestion: "Wat kenmerkt Oostenrijkse wijn?",
    countries: ["Oostenrijk"],
    map: [47.9, 15.6, 3.4],
  },
  {
    slug: "amerika",
    name: "Verenigde Staten",
    h1: "Wijn uit Amerika: regio's, stijlen en de beste flessen",
    intro: "Amerikaanse wijn, vooral uit Californië, staat voor rijp fruit en gulle stijlen. Vergelijk de beste flessen.",
    advice: "De Verenigde Staten, met Californië voorop, maken gulle wijnen met rijp fruit en een rondere stijl. Napa Valley is beroemd om krachtige Cabernet Sauvignon en volle Chardonnay, terwijl Zinfandel een typisch Amerikaanse rode specialiteit is. Verwacht overtuigende, toegankelijke wijnen.",
    faqQuestion: "Wat kenmerkt Amerikaanse wijn?",
    countries: ["Amerika", "Verenigde Staten", "Verenigde Staten van Amerika", "USA"],
    map: [37.8, -121.5, 3.2],
  },
];

export function getGrapeGuide(slug: string): GrapeGuide | undefined {
  return GRAPE_GUIDES.find((g) => g.slug === slug);
}

export function getCountryGuide(slug: string): CountryGuide | undefined {
  return COUNTRY_GUIDES.find((c) => c.slug === slug);
}
