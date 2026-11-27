/**
 * One-off catalogue update (28 Nov 2026):
 *  1. brand on every phone range (Apple / Samsung / Google) — drives the Android mega-menu;
 *  2. new ranges: Tecno Camon/Spark/Pova, Huawei Pura/nova/Mate (empty until products are added);
 *  3. accessory sub-categories, and the 8 accessories moved into them.
 * Idempotent: safe to run twice. Nothing is deleted.
 *
 * Usage: node --env-file=.env prisma/scripts/2026-11-28-android-accessories.cjs [--apply]
 * Without --apply it only prints what it would change.
 */
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const apply = process.argv.includes("--apply");

const brands = {
  Apple: ["iphone-17", "iphone-16", "iphone-15", "iphone-14", "iphone-13", "iphone-12", "iphone-11", "iphone-x"],
  Samsung: ["galaxy-s", "galaxy-z", "galaxy-a"],
  Google: ["google-pixel"],
};

const newRanges = [
  { name: "Tecno Camon", slug: "tecno-camon", position: 20, brand: "Tecno", description: "Photo et selfie, la gamme vedette de Tecno." },
  { name: "Tecno Spark", slug: "tecno-spark", position: 21, brand: "Tecno", description: "Grands écrans et grosse batterie à petit prix." },
  { name: "Tecno Pova", slug: "tecno-pova", position: 22, brand: "Tecno", description: "Performance et autonomie pour le jeu." },
  { name: "Huawei Pura", slug: "huawei-pura", position: 30, brand: "Huawei", description: "Le haut de gamme photo de Huawei." },
  { name: "Huawei nova", slug: "huawei-nova", position: 31, brand: "Huawei", description: "Design et selfie, en milieu de gamme." },
  { name: "Huawei Mate", slug: "huawei-mate", position: 32, brand: "Huawei", description: "Les pliables et flagships Mate." },
];

const accessoryRanges = [
  { name: "Coques & protection", slug: "coques-protection", position: 0, description: "Coques, MagSafe, verres trempés." },
  { name: "Charge & énergie", slug: "charge-energie", position: 1, description: "Chargeurs, câbles et batteries externes." },
  { name: "Écouteurs & audio", slug: "ecouteurs-audio", position: 2, description: "AirPods, Galaxy Buds et écouteurs sans fil." },
];

const moves = {
  "coques-protection": ["coque-silicone-magsafe", "protection-ecran-verre-trempe"],
  "charge-energie": ["chargeur-secteur-20w-usb-c", "cable-usb-c-lightning-1m", "batterie-externe-10000mah"],
  "ecouteurs-audio": ["ecouteurs-sans-fil-pro", "airpods-pro-3", "galaxy-buds3-pro"],
};

async function main() {
  const [phones, accessories] = await Promise.all([
    prisma.category.findUniqueOrThrow({ where: { slug: "smartphones" } }),
    prisma.category.findUniqueOrThrow({ where: { slug: "accessoires" } }),
  ]);
  const log = [];

  for (const [brand, slugs] of Object.entries(brands)) {
    const r = apply
      ? await prisma.category.updateMany({ where: { slug: { in: slugs }, brand: null }, data: { brand } })
      : { count: await prisma.category.count({ where: { slug: { in: slugs }, brand: null } }) };
    log.push(`marque ${brand} sur ${r.count} gamme(s)`);
  }

  for (const r of newRanges) {
    const exists = await prisma.category.findUnique({ where: { slug: r.slug } });
    if (exists) { log.push(`= ${r.name} existe déjà`); continue; }
    if (apply) await prisma.category.create({ data: { ...r, parentId: phones.id, active: true } });
    log.push(`+ gamme ${r.name}`);
  }

  for (const r of accessoryRanges) {
    let cat = await prisma.category.findUnique({ where: { slug: r.slug } });
    if (!cat) {
      if (apply) cat = await prisma.category.create({ data: { ...r, parentId: accessories.id, active: true } });
      log.push(`+ sous-catégorie ${r.name}`);
    } else log.push(`= ${r.name} existe déjà`);

    const products = await prisma.product.findMany({ where: { slug: { in: moves[r.slug] } }, select: { id: true, name: true, categoryId: true } });
    for (const p of products) {
      if (cat && p.categoryId === cat.id) continue;
      if (apply) await prisma.product.update({ where: { id: p.id }, data: { categoryId: cat.id } });
      log.push(`  → ${p.name} rangé dans ${r.name}`);
    }
  }

  console.log((apply ? "APPLIQUÉ" : "SIMULATION (ajoutez --apply)") + "\n" + log.join("\n"));
}

main().finally(() => prisma.$disconnect());
