import { db } from "./client";
import { SHOP_CONFIGS } from "../constants";

async function seed() {
  console.log("🍷 Seeding database...\n");

  // Upsert shops from config
  for (const shop of SHOP_CONFIGS) {
    await db.shop.upsert({
      where: { slug: shop.slug },
      create: {
        slug: shop.slug,
        name: shop.name,
        baseUrl: shop.baseUrl,
        enabled: shop.enabled,
        description: shop.description ?? null,
      },
      update: {
        name: shop.name,
        baseUrl: shop.baseUrl,
        enabled: shop.enabled,
        description: shop.description ?? null,
      },
    });
    console.log(`  ✓ Shop: ${shop.name} (${shop.slug})`);
  }

  console.log(`\n🎉 Seeded ${SHOP_CONFIGS.length} shops`);
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
