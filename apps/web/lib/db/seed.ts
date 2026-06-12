import { db } from "./client";
import { SHOP_CONFIGS } from "../constants";

// Logo file extensions per shop (most are .png, some are .svg)
const SHOP_LOGO_EXTENSIONS: Record<string, string> = {
  wijnvoordeel: 'svg',
  drankdozijn: 'svg',
};

function getLogoUrl(slug: string): string {
  const ext = SHOP_LOGO_EXTENSIONS[slug] ?? 'png';
  return `/images/shops/${slug}.${ext}`;
}

async function seed() {
  console.log("🍷 Seeding database...\n");

  // Upsert shops from config
  for (const shop of SHOP_CONFIGS) {
    const logoUrl = getLogoUrl(shop.slug);
    await db.shop.upsert({
      where: { slug: shop.slug },
      create: {
        slug: shop.slug,
        name: shop.name,
        baseUrl: shop.baseUrl,
        enabled: shop.enabled,
        description: shop.description ?? null,
        logoUrl,
      },
      update: {
        name: shop.name,
        baseUrl: shop.baseUrl,
        enabled: shop.enabled,
        description: shop.description ?? null,
        logoUrl,
      },
    });
    console.log(`  ✓ Shop: ${shop.name} (${shop.slug}) — logo: ${logoUrl}`);
  }

  console.log(`\n🎉 Seeded ${SHOP_CONFIGS.length} shops`);

  // Promote known admin accounts. Using updateMany so this is idempotent
  // and does not fail when the user does not exist yet.
  const ADMIN_EMAILS_SEED = ["rene@weteling.com"];
  const adminResult = await db.user.updateMany({
    where: { email: { in: ADMIN_EMAILS_SEED } },
    data: { role: "admin" },
  });
  console.log(`\n👑 Set role=admin for ${adminResult.count} user(s)`);
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
