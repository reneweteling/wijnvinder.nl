import { db } from "./client";

// Verified working Unsplash wine photo IDs
const WINE_IMAGES = [
  "photo-1510812431401-41d2bd2722f3", // wine glasses clinking
  "photo-1553361371-9b22f78e8b1d", // wine bottles
  "photo-1474722883778-792e7990302f", // wine tasting
  "photo-1506377247377-2a5b3b417ebb", // vineyard
  "photo-1543857778-c4a1a3e0b2eb", // wine cellar
  "photo-1558001373-7b93ee48ffa0", // rosé wine
  "photo-1578911373434-0cb395d2cbfb", // white wine
  "photo-1594372365401-3b5ff14eaaed", // champagne
  "photo-1549492423-400259a2e574", // sparkling
  "photo-1584916201218-f4242ceb4809", // red wine glass
];

function getWineImage(index: number): string {
  const id = WINE_IMAGES[index % WINE_IMAGES.length];
  return `https://images.unsplash.com/${id}?w=400&h=500&fit=crop`;
}

const WINES = [
  // RED - French
  { name: "Château Margaux 2018", producer: "Château Margaux", grape: "Cabernet Sauvignon", grapes: ["Cabernet Sauvignon", "Merlot", "Petit Verdot"], country: "Frankrijk", region: "Bordeaux", wineType: "red", vintage: 2018, vivinoScore: 4.6, vivinoScoreCount: 12500, description: "Een iconische Bordeaux met intense cassis, cederhout en elegante tannines.", imageUrl: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=500&fit=crop" },
  { name: "Barolo Riserva 2016", producer: "Giacomo Conterno", grape: "Nebbiolo", grapes: ["Nebbiolo"], country: "Italië", region: "Piemonte", wineType: "red", vintage: 2016, vivinoScore: 4.5, vivinoScoreCount: 3200, description: "Krachtige Barolo met aroma's van rozen, teer en rijp fruit.", imageUrl: "https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=400&h=600&fit=crop" },
  { name: "Rioja Reserva 2017", producer: "Marqués de Riscal", grape: "Tempranillo", grapes: ["Tempranillo", "Graciano"], country: "Spanje", region: "Rioja", wineType: "red", vintage: 2017, vivinoScore: 4.1, vivinoScoreCount: 8900, description: "Klassieke Rioja met vanille, kersen en subtiele eiken tonen.", imageUrl: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=600&fit=crop" },
  { name: "Côtes du Rhône Rouge 2021", producer: "E. Guigal", grape: "Grenache", grapes: ["Grenache", "Syrah", "Mourvèdre"], country: "Frankrijk", region: "Rhône", wineType: "red", vintage: 2021, vivinoScore: 3.8, vivinoScoreCount: 15000, description: "Soepele rode wijn met bramen, kruiden en een vleugje peper.", imageUrl: "https://images.unsplash.com/photo-1474722883778-792e7990302f?w=400&h=600&fit=crop" },
  { name: "Chianti Classico Riserva 2019", producer: "Castello di Ama", grape: "Sangiovese", grapes: ["Sangiovese"], country: "Italië", region: "Toscane", wineType: "red", vintage: 2019, vivinoScore: 4.2, vivinoScoreCount: 4500, description: "Elegante Chianti met kersen, violetten en een minerale afdronk.", imageUrl: "https://images.unsplash.com/photo-1567696911980-2eed69a46042?w=400&h=600&fit=crop" },
  { name: "Malbec Reserve 2020", producer: "Catena Zapata", grape: "Malbec", grapes: ["Malbec"], country: "Argentinië", region: "Mendoza", wineType: "red", vintage: 2020, vivinoScore: 4.0, vivinoScoreCount: 22000, description: "Rijke Malbec met pruimen, chocolade en fluwelen tannines.", imageUrl: "https://images.unsplash.com/photo-1558346489-19413928158b?w=400&h=600&fit=crop" },
  { name: "Pinot Noir Willamette 2020", producer: "Domaine Drouhin", grape: "Pinot Noir", grapes: ["Pinot Noir"], country: "Verenigde Staten", region: "Oregon", wineType: "red", vintage: 2020, vivinoScore: 4.1, vivinoScoreCount: 3800, description: "Fijnzinnige Pinot Noir met rode bessen, aarde en kruidige tonen.", imageUrl: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=400&h=600&fit=crop" },
  { name: "Amarone della Valpolicella 2017", producer: "Allegrini", grape: "Corvina", grapes: ["Corvina", "Rondinella", "Oseleta"], country: "Italië", region: "Veneto", wineType: "red", vintage: 2017, vivinoScore: 4.3, vivinoScoreCount: 7600, description: "Volle Amarone met gedroogd fruit, specerijen en een lange afdronk.", imageUrl: "https://images.unsplash.com/photo-1600320844678-62d48e4afe20?w=400&h=600&fit=crop" },
  { name: "Shiraz Barossa 2019", producer: "Penfolds", grape: "Syrah/Shiraz", grapes: ["Syrah/Shiraz"], country: "Australië", region: "Barossa Valley", wineType: "red", vintage: 2019, vivinoScore: 4.0, vivinoScoreCount: 11000, description: "Krachtige Shiraz met bramen, zwarte peper en eikenhout.", imageUrl: "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=400&h=600&fit=crop" },
  { name: "Douro Tinto 2020", producer: "Quinta do Crasto", grape: "Touriga Nacional", grapes: ["Touriga Nacional", "Tinta Roriz"], country: "Portugal", region: "Douro", wineType: "red", vintage: 2020, vivinoScore: 3.9, vivinoScoreCount: 5400, description: "Elegante Douro rode wijn met donker fruit en bloemige toetsen.", imageUrl: "https://images.unsplash.com/photo-1543857778-c4a1a3e0b2eb?w=400&h=600&fit=crop" },

  // WHITE
  { name: "Chablis Premier Cru 2021", producer: "William Fèvre", grape: "Chardonnay", grapes: ["Chardonnay"], country: "Frankrijk", region: "Bourgogne", wineType: "white", vintage: 2021, vivinoScore: 4.2, vivinoScoreCount: 6300, description: "Minerale Chablis met citrus, groene appel en een strakke afdronk.", imageUrl: "https://images.unsplash.com/photo-1566995541428-f05db0b38803?w=400&h=600&fit=crop" },
  { name: "Sancerre Blanc 2022", producer: "Domaine Vacheron", grape: "Sauvignon Blanc", grapes: ["Sauvignon Blanc"], country: "Frankrijk", region: "Loire", wineType: "white", vintage: 2022, vivinoScore: 4.1, vivinoScoreCount: 4800, description: "Frisse Sancerre met grapefruit, kruisbessen en vuursteenmineraliteit.", imageUrl: "https://images.unsplash.com/photo-1578911373434-0cb395d2cbfb?w=400&h=600&fit=crop" },
  { name: "Riesling Spätlese 2021", producer: "Dr. Loosen", grape: "Riesling", grapes: ["Riesling"], country: "Duitsland", region: "Mosel", wineType: "white", vintage: 2021, vivinoScore: 4.0, vivinoScoreCount: 9200, description: "Aromatische Riesling met perzik, honing en levendige zuurgraad.", imageUrl: "https://images.unsplash.com/photo-1597290282695-edc43d0e7129?w=400&h=600&fit=crop" },
  { name: "Grüner Veltliner Federspiel 2022", producer: "Domäne Wachau", grape: "Grüner Veltliner", grapes: ["Grüner Veltliner"], country: "Oostenrijk", region: "Wachau", wineType: "white", vintage: 2022, vivinoScore: 3.9, vivinoScoreCount: 3100, description: "Fris en kruidig met witte peper, citrus en minerale tonen.", imageUrl: "https://images.unsplash.com/photo-1569919659476-f0852e6b8f63?w=400&h=600&fit=crop" },
  { name: "Albariño Rías Baixas 2022", producer: "Martín Códax", grape: "Albariño", grapes: ["Albariño"], country: "Spanje", region: "Galicië", wineType: "white", vintage: 2022, vivinoScore: 3.8, vivinoScoreCount: 7500, description: "Verfrissende Albariño met abrikoos, citrus en zilte tonen.", imageUrl: "https://images.unsplash.com/photo-1559620192-032c4bc4674e?w=400&h=600&fit=crop" },
  { name: "Pinot Grigio delle Venezie 2023", producer: "Santa Margherita", grape: "Pinot Grigio", grapes: ["Pinot Grigio"], country: "Italië", region: "Veneto", wineType: "white", vintage: 2023, vivinoScore: 3.7, vivinoScoreCount: 18000, description: "Lichte Pinot Grigio met peer, citrus en amandel.", imageUrl: "https://images.unsplash.com/photo-1560148218-1a83060f7b32?w=400&h=600&fit=crop" },
  { name: "Chenin Blanc 2022", producer: "Ken Forrester", grape: "Chenin Blanc", grapes: ["Chenin Blanc"], country: "Zuid-Afrika", region: "Stellenbosch", wineType: "white", vintage: 2022, vivinoScore: 3.9, vivinoScoreCount: 4200, description: "Tropisch fruit, honing en een rijke textuur.", imageUrl: "https://images.unsplash.com/photo-1571613316887-6f8d5cbf7ef7?w=400&h=600&fit=crop" },

  // ROSÉ
  { name: "Whispering Angel Rosé 2023", producer: "Château d'Esclans", grape: "Grenache", grapes: ["Grenache", "Cinsault"], country: "Frankrijk", region: "Provence", wineType: "rose", vintage: 2023, vivinoScore: 3.9, vivinoScoreCount: 42000, description: "Iconische Provence rosé met aardbeien, roze grapefruit en kruiden.", imageUrl: "https://images.unsplash.com/photo-1558001373-7b93ee48ffa0?w=400&h=600&fit=crop" },
  { name: "Rosé de Navarra 2023", producer: "Gran Feudo", grape: "Garnacha", grapes: ["Garnacha"], country: "Spanje", region: "Navarra", wineType: "rose", vintage: 2023, vivinoScore: 3.6, vivinoScoreCount: 5600, description: "Fruitige rosé met frambozen, watermeloen en een frisse afdronk.", imageUrl: "https://images.unsplash.com/photo-1560512823-829485b8bf24?w=400&h=600&fit=crop" },

  // SPARKLING
  { name: "Brut Réserve NV", producer: "Moët & Chandon", grape: "Chardonnay", grapes: ["Chardonnay", "Pinot Noir", "Pinot Meunier"], country: "Frankrijk", region: "Champagne", wineType: "sparkling", vintage: null, vivinoScore: 4.0, vivinoScoreCount: 85000, description: "Klassieke champagne met citrus, brioche en fijne perlage.", imageUrl: "https://images.unsplash.com/photo-1594372365401-3b5ff14eaaed?w=400&h=600&fit=crop" },
  { name: "Prosecco Superiore DOCG Brut", producer: "Bisol", grape: "Glera", grapes: ["Glera"], country: "Italië", region: "Veneto", wineType: "sparkling", vintage: null, vivinoScore: 3.8, vivinoScoreCount: 12000, description: "Frisse Prosecco met groene appel, witte bloemen en delicate bubbels.", imageUrl: "https://images.unsplash.com/photo-1549492423-400259a2e574?w=400&h=600&fit=crop" },
  { name: "Cava Brut Reserva 2020", producer: "Codorníu", grape: "Macabeo", grapes: ["Macabeo", "Xarel·lo", "Parellada"], country: "Spanje", region: "Penedès", wineType: "sparkling", vintage: 2020, vivinoScore: 3.7, vivinoScoreCount: 6800, description: "Elegante Cava met toastige tonen, citrus en mineralen.", imageUrl: "https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=400&h=600&fit=crop" },

  // Budget options
  { name: "Viña Sol 2023", producer: "Torres", grape: "Parellada", grapes: ["Parellada"], country: "Spanje", region: "Catalonië", wineType: "white", vintage: 2023, vivinoScore: 3.5, vivinoScoreCount: 14000, description: "Lichte, frisse witte wijn met citrus en bloesem.", imageUrl: "https://images.unsplash.com/photo-1585553616435-2dc0a54e271d?w=400&h=600&fit=crop" },
  { name: "Casillero del Diablo Cabernet 2022", producer: "Concha y Toro", grape: "Cabernet Sauvignon", grapes: ["Cabernet Sauvignon"], country: "Chili", region: "Valle Central", wineType: "red", vintage: 2022, vivinoScore: 3.6, vivinoScoreCount: 35000, description: "Toegankelijke Cabernet met cassis, kers en zachte tannines.", imageUrl: "https://images.unsplash.com/photo-1561461056-77634126673a?w=400&h=600&fit=crop" },
];

// Generate varied prices across shops
function generateListings(wineId: string, wineName: string, producer: string | undefined) {
  const shops = [
    { slug: "wijnvoordeel", name: "Wijnvoordeel", baseUrl: "https://www.wijnvoordeel.nl" },
    { slug: "wijnbeurs", name: "Wijnbeurs", baseUrl: "https://www.wijnbeurs.nl" },
    { slug: "gall", name: "Gall & Gall", baseUrl: "https://www.gall.nl" },
  ];

  const listings = [];
  const basePrice = 8 + Math.random() * 80; // €8-€88

  for (const shop of shops) {
    // Not every wine is in every shop (70% chance)
    if (Math.random() < 0.3) continue;

    const variation = 0.85 + Math.random() * 0.3; // ±15% price variation
    const price = Math.round(basePrice * variation * 100) / 100;
    const hasDiscount = Math.random() < 0.25;
    const originalPrice = hasDiscount ? Math.round(price * (1.15 + Math.random() * 0.2) * 100) / 100 : null;

    const slug = wineName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "");

    listings.push({
      canonicalWineId: wineId,
      shopSlug: shop.slug,
      shopName: shop.name,
      price,
      originalPrice,
      url: `${shop.baseUrl}/wijn/${slug}`,
      available: Math.random() > 0.1, // 90% available
      rawName: wineName,
      rawProducer: producer || null,
      lastScrapedAt: new Date(),
    });
  }

  return listings;
}

function normalizeSearchName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

async function seed() {
  console.log("🍷 Seeding wine database...\n");

  // Clear existing data
  await db.shopListing.deleteMany({});
  await db.canonicalWine.deleteMany({});
  console.log("  Cleared existing wines and listings\n");

  let totalWines = 0;
  let totalListings = 0;

  for (let i = 0; i < WINES.length; i++) {
    const wine = WINES[i];
    const slug = [wine.producer, wine.name, wine.vintage]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-') + '-' + Math.random().toString(36).substring(2, 6);

    const created = await db.canonicalWine.create({
      data: {
        slug,
        name: wine.name,
        // producer linked via Producer model during scraping
        grape: wine.grape,
        grapes: wine.grapes,
        country: wine.country,
        region: wine.region,
        wineType: wine.wineType,
        vintage: wine.vintage,
        vivinoScore: wine.vivinoScore,
        vivinoScoreCount: wine.vivinoScoreCount,
        searchName: normalizeSearchName(`${wine.producer} ${wine.name}`),
        imageUrl: getWineImage(i),
        description: wine.description,
      },
    });

    const listings = generateListings(created.id, wine.name, wine.producer);
    for (const listing of listings) {
      await db.shopListing.create({ data: listing });
    }

    totalWines++;
    totalListings += listings.length;
    console.log(`  ✓ ${wine.name} (${wine.wineType}) — ${listings.length} shop listings`);
  }

  console.log(`\n🎉 Seeded ${totalWines} wines with ${totalListings} shop listings`);
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
