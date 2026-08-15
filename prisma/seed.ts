import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const categories = [
  { name: "iPhone 16", slug: "iphone-16" },
  { name: "iPhone 15", slug: "iphone-15" },
  { name: "iPhone 14", slug: "iphone-14" },
  { name: "iPhone 13", slug: "iphone-13" },
  { name: "iPhone 12", slug: "iphone-12" },
  { name: "iPhone 11", slug: "iphone-11" },
  { name: "iPhone X", slug: "iphone-x" },
  { name: "Accessoires", slug: "accessoires" },
];

type SeedProduct = {
  name: string;
  slug: string;
  sku: string;
  category: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  color: string;
  storage?: string;
  description: string;
  specs: string;
  featured?: boolean;
};

const products: SeedProduct[] = [
  // iPhone 16
  {
    name: "iPhone 16 Pro Max",
    slug: "iphone-16-pro-max-titane-noir-256go",
    sku: "IP16PM-256-BLK",
    category: "iPhone 16",
    price: 950000,
    compareAtPrice: 1020000,
    stock: 12,
    color: "#3b3a37",
    storage: "256 Go",
    featured: true,
    description:
      "L'iPhone 16 Pro Max redéfinit la puissance mobile avec la puce A18 Pro, un écran Super Retina XDR de 6,9 pouces et un système photo professionnel.",
    specs:
      "Écran : Super Retina XDR de 6,9 pouces (2868 x 1320 px)\nPuce : A18 Pro\nStockage : 256 Go\nAppareil photo : Triple 48 Mpx (Principal, Ultra grand-angle, Téléobjectif 5x)\nBatterie : jusqu'à 33h de vidéo\nConnectivité : USB-C, 5G, Wi-Fi 7",
  },
  {
    name: "iPhone 16 Pro",
    slug: "iphone-16-pro-titane-naturel-256go",
    sku: "IP16P-256-NAT",
    category: "iPhone 16",
    price: 850000,
    stock: 15,
    color: "#8f8477",
    storage: "256 Go",
    featured: true,
    description:
      "L'iPhone 16 Pro combine un design en titane, un écran ProMotion 120Hz et la puissance de la puce A18 Pro dans un format compact.",
    specs:
      "Écran : Super Retina XDR de 6,3 pouces (2622 x 1206 px)\nPuce : A18 Pro\nStockage : 256 Go\nAppareil photo : Triple 48 Mpx\nBatterie : jusqu'à 27h de vidéo\nConnectivité : USB-C, 5G, Wi-Fi 7",
  },
  {
    name: "iPhone 16",
    slug: "iphone-16-bleu-128go",
    sku: "IP16-128-BLU",
    category: "iPhone 16",
    price: 650000,
    stock: 20,
    color: "#5a7a9e",
    storage: "128 Go",
    featured: true,
    description:
      "L'iPhone 16 apporte la puce A18, le bouton Action et un système à double appareil photo 48 Mpx dans un design coloré et résistant.",
    specs:
      "Écran : Super Retina XDR de 6,1 pouces (2556 x 1179 px)\nPuce : A18\nStockage : 128 Go\nAppareil photo : Double 48 Mpx\nBatterie : jusqu'à 22h de vidéo\nConnectivité : USB-C, 5G, Wi-Fi 7",
  },
  {
    name: "iPhone 16 Plus",
    slug: "iphone-16-plus-rose-256go",
    sku: "IP16PL-256-PNK",
    category: "iPhone 16",
    price: 720000,
    stock: 10,
    color: "#e7c2c8",
    storage: "256 Go",
    description:
      "Le grand écran de l'iPhone 16 Plus, la puce A18 et une autonomie exceptionnelle pour toute la journée.",
    specs:
      "Écran : Super Retina XDR de 6,7 pouces (2796 x 1290 px)\nPuce : A18\nStockage : 256 Go\nAppareil photo : Double 48 Mpx\nBatterie : jusqu'à 27h de vidéo\nConnectivité : USB-C, 5G, Wi-Fi 7",
  },
  // iPhone 15
  {
    name: "iPhone 15 Pro Max",
    slug: "iphone-15-pro-max-titane-bleu-256go",
    sku: "IP15PM-256-BLU",
    category: "iPhone 15",
    price: 780000,
    stock: 9,
    color: "#4c5a68",
    storage: "256 Go",
    featured: true,
    description:
      "L'iPhone 15 Pro Max avec structure en titane, puce A17 Pro et zoom optique 5x pour des photos dignes d'un pro.",
    specs:
      "Écran : Super Retina XDR de 6,7 pouces (2796 x 1290 px)\nPuce : A17 Pro\nStockage : 256 Go\nAppareil photo : Triple 48 Mpx, zoom optique 5x\nBatterie : jusqu'à 29h de vidéo\nConnectivité : USB-C, 5G, Wi-Fi 6E",
  },
  {
    name: "iPhone 15",
    slug: "iphone-15-noir-128go",
    sku: "IP15-128-BLK",
    category: "iPhone 15",
    price: 580000,
    compareAtPrice: 630000,
    stock: 18,
    color: "#20242b",
    storage: "128 Go",
    featured: true,
    description:
      "L'iPhone 15 introduit Dynamic Island, un appareil photo principal 48 Mpx et le port USB-C dans un boîtier en aluminium coloré.",
    specs:
      "Écran : Super Retina XDR de 6,1 pouces (2556 x 1179 px)\nPuce : A16 Bionic\nStockage : 128 Go\nAppareil photo : Double 48 Mpx\nBatterie : jusqu'à 20h de vidéo\nConnectivité : USB-C, 5G, Wi-Fi 6",
  },
  {
    name: "iPhone 15 Plus",
    slug: "iphone-15-plus-jaune-128go",
    sku: "IP15PL-128-YEL",
    category: "iPhone 15",
    price: 620000,
    stock: 11,
    color: "#e8d78a",
    storage: "128 Go",
    description:
      "Le format Plus de l'iPhone 15 avec grand écran 6,7 pouces et autonomie longue durée.",
    specs:
      "Écran : Super Retina XDR de 6,7 pouces (2796 x 1290 px)\nPuce : A16 Bionic\nStockage : 128 Go\nAppareil photo : Double 48 Mpx\nBatterie : jusqu'à 26h de vidéo\nConnectivité : USB-C, 5G, Wi-Fi 6",
  },
  // iPhone 14
  {
    name: "iPhone 14 Pro",
    slug: "iphone-14-pro-violet-256go",
    sku: "IP14P-256-PUR",
    category: "iPhone 14",
    price: 620000,
    stock: 8,
    color: "#5b4a63",
    storage: "256 Go",
    description:
      "L'iPhone 14 Pro avec Dynamic Island, écran Always-On et appareil photo principal 48 Mpx.",
    specs:
      "Écran : Super Retina XDR de 6,1 pouces (2556 x 1179 px)\nPuce : A16 Bionic\nStockage : 256 Go\nAppareil photo : Triple 48 Mpx\nBatterie : jusqu'à 23h de vidéo\nConnectivité : Lightning, 5G, Wi-Fi 6",
  },
  {
    name: "iPhone 14",
    slug: "iphone-14-bleu-128go",
    sku: "IP14-128-BLU",
    category: "iPhone 14",
    price: 480000,
    stock: 22,
    color: "#3d5a73",
    storage: "128 Go",
    featured: true,
    description:
      "L'iPhone 14 offre la puce A15 Bionic, la détection d'accident et un système photo amélioré.",
    specs:
      "Écran : Super Retina XDR de 6,1 pouces (2532 x 1170 px)\nPuce : A15 Bionic\nStockage : 128 Go\nAppareil photo : Double 12 Mpx\nBatterie : jusqu'à 20h de vidéo\nConnectivité : Lightning, 5G, Wi-Fi 6",
  },
  {
    name: "iPhone 14 Plus",
    slug: "iphone-14-plus-minuit-128go",
    sku: "IP14PL-128-MID",
    category: "iPhone 14",
    price: 520000,
    stock: 10,
    color: "#1c1e26",
    storage: "128 Go",
    description: "L'iPhone 14 Plus, grand écran et autonomie record dans la gamme 14.",
    specs:
      "Écran : Super Retina XDR de 6,7 pouces (2778 x 1284 px)\nPuce : A15 Bionic\nStockage : 128 Go\nAppareil photo : Double 12 Mpx\nBatterie : jusqu'à 26h de vidéo\nConnectivité : Lightning, 5G, Wi-Fi 6",
  },
  // iPhone 13
  {
    name: "iPhone 13 Pro",
    slug: "iphone-13-pro-graphite-256go",
    sku: "IP13P-256-GRP",
    category: "iPhone 13",
    price: 470000,
    stock: 7,
    color: "#3a3a3c",
    storage: "256 Go",
    description: "L'iPhone 13 Pro avec écran ProMotion 120Hz et triple appareil photo Pro.",
    specs:
      "Écran : Super Retina XDR ProMotion 6,1 pouces\nPuce : A15 Bionic\nStockage : 256 Go\nAppareil photo : Triple 12 Mpx\nBatterie : jusqu'à 22h de vidéo\nConnectivité : Lightning, 5G, Wi-Fi 6",
  },
  {
    name: "iPhone 13",
    slug: "iphone-13-rose-128go",
    sku: "IP13-128-PNK",
    category: "iPhone 13",
    price: 380000,
    compareAtPrice: 420000,
    stock: 25,
    color: "#e9c7cf",
    storage: "128 Go",
    featured: true,
    description: "L'iPhone 13, toujours parmi les plus populaires : rapide, fiable et élégant.",
    specs:
      "Écran : Super Retina XDR 6,1 pouces (2532 x 1170 px)\nPuce : A15 Bionic\nStockage : 128 Go\nAppareil photo : Double 12 Mpx\nBatterie : jusqu'à 19h de vidéo\nConnectivité : Lightning, 5G, Wi-Fi 6",
  },
  {
    name: "iPhone 13 mini",
    slug: "iphone-13-mini-minuit-128go",
    sku: "IP13M-128-MID",
    category: "iPhone 13",
    price: 340000,
    stock: 9,
    color: "#22242c",
    storage: "128 Go",
    description: "Le format compact de l'iPhone 13, pour ceux qui préfèrent un téléphone léger et puissant.",
    specs:
      "Écran : Super Retina XDR 5,4 pouces\nPuce : A15 Bionic\nStockage : 128 Go\nAppareil photo : Double 12 Mpx\nBatterie : jusqu'à 13h de vidéo\nConnectivité : Lightning, 5G, Wi-Fi 6",
  },
  // iPhone 12
  {
    name: "iPhone 12 Pro",
    slug: "iphone-12-pro-bleu-pacifique-128go",
    sku: "IP12P-128-BLU",
    category: "iPhone 12",
    price: 360000,
    stock: 6,
    color: "#3c5266",
    storage: "128 Go",
    description: "L'iPhone 12 Pro, écran Super Retina XDR et triple appareil photo Pro avec LiDAR.",
    specs:
      "Écran : Super Retina XDR 6,1 pouces\nPuce : A14 Bionic\nStockage : 128 Go\nAppareil photo : Triple 12 Mpx + LiDAR\nBatterie : jusqu'à 17h de vidéo\nConnectivité : Lightning, 5G, Wi-Fi 6",
  },
  {
    name: "iPhone 12",
    slug: "iphone-12-blanc-64go",
    sku: "IP12-64-WHT",
    category: "iPhone 12",
    price: 290000,
    stock: 20,
    color: "#eceff1",
    storage: "64 Go",
    featured: true,
    description: "L'iPhone 12 avec écran Super Retina XDR, MagSafe et puce A14 Bionic performante.",
    specs:
      "Écran : Super Retina XDR 6,1 pouces (2532 x 1170 px)\nPuce : A14 Bionic\nStockage : 64 Go\nAppareil photo : Double 12 Mpx\nBatterie : jusqu'à 17h de vidéo\nConnectivité : Lightning, 5G, Wi-Fi 6",
  },
  {
    name: "iPhone 12 mini",
    slug: "iphone-12-mini-vert-64go",
    sku: "IP12M-64-GRN",
    category: "iPhone 12",
    price: 260000,
    stock: 8,
    color: "#4c5d4f",
    storage: "64 Go",
    description: "Compact et puissant, l'iPhone 12 mini tient dans une seule main.",
    specs:
      "Écran : Super Retina XDR 5,4 pouces\nPuce : A14 Bionic\nStockage : 64 Go\nAppareil photo : Double 12 Mpx\nBatterie : jusqu'à 15h de vidéo\nConnectivité : Lightning, 5G, Wi-Fi 6",
  },
  // iPhone 11
  {
    name: "iPhone 11 Pro Max",
    slug: "iphone-11-pro-max-gris-sideral-256go",
    sku: "IP11PM-256-GRY",
    category: "iPhone 11",
    price: 320000,
    stock: 5,
    color: "#4a4a4d",
    storage: "256 Go",
    description: "L'iPhone 11 Pro Max, grand écran OLED et triple appareil photo grand-angle.",
    specs:
      "Écran : Super Retina XDR 6,5 pouces\nPuce : A13 Bionic\nStockage : 256 Go\nAppareil photo : Triple 12 Mpx\nBatterie : jusqu'à 20h de vidéo\nConnectivité : Lightning, 4G, Wi-Fi 6",
  },
  {
    name: "iPhone 11",
    slug: "iphone-11-blanc-128go",
    sku: "IP11-128-WHT",
    category: "iPhone 11",
    price: 240000,
    compareAtPrice: 270000,
    stock: 24,
    color: "#e9ebee",
    storage: "128 Go",
    featured: true,
    description: "L'iPhone 11, un excellent rapport qualité-prix avec double appareil photo et puce A13 Bionic.",
    specs:
      "Écran : Liquid Retina HD 6,1 pouces (1792 x 828 px)\nPuce : A13 Bionic\nStockage : 128 Go\nAppareil photo : Double 12 Mpx\nBatterie : jusqu'à 17h de vidéo\nConnectivité : Lightning, 4G, Wi-Fi 6",
  },
  {
    name: "iPhone 11",
    slug: "iphone-11-rouge-64go",
    sku: "IP11-64-RED",
    category: "iPhone 11",
    price: 220000,
    stock: 14,
    color: "#a4322f",
    storage: "64 Go",
    description: "L'iPhone 11 en rouge (PRODUCT)RED, performant et abordable.",
    specs:
      "Écran : Liquid Retina HD 6,1 pouces (1792 x 828 px)\nPuce : A13 Bionic\nStockage : 64 Go\nAppareil photo : Double 12 Mpx\nBatterie : jusqu'à 17h de vidéo\nConnectivité : Lightning, 4G, Wi-Fi 6",
  },
  // iPhone X
  {
    name: "iPhone X",
    slug: "iphone-x-argent-256go",
    sku: "IPX-256-SLV",
    category: "iPhone X",
    price: 180000,
    stock: 6,
    color: "#c9cdd3",
    storage: "256 Go",
    description:
      "L'iPhone X, le premier iPhone à écran Super Retina HD OLED de 5,8 pouces, résolution 2436 x 1125 pixels (458 ppp).",
    specs:
      "Écran : Super Retina HD 5,8 pouces (2436 x 1125 px, 458 ppp)\nPuce : A11 Bionic\nStockage : 256 Go\nAppareil photo : Double 12 Mpx\nBatterie : jusqu'à 13h de vidéo\nConnectivité : Lightning, 4G, Wi-Fi 5",
  },
  {
    name: "iPhone X",
    slug: "iphone-x-gris-sideral-64go",
    sku: "IPX-64-GRY",
    category: "iPhone X",
    price: 160000,
    compareAtPrice: 190000,
    stock: 9,
    color: "#4b4d52",
    storage: "64 Go",
    featured: true,
    description:
      "L'iPhone X gris sidéral, design tout écran avec Face ID et double appareil photo grand-angle.",
    specs:
      "Écran : Super Retina HD 5,8 pouces (2436 x 1125 px, 458 ppp)\nPuce : A11 Bionic\nStockage : 64 Go\nAppareil photo : Double 12 Mpx\nBatterie : jusqu'à 13h de vidéo\nConnectivité : Lightning, 4G, Wi-Fi 5",
  },
  // Accessoires
  {
    name: "Coque silicone MagSafe",
    slug: "coque-silicone-magsafe",
    sku: "ACC-CASE-001",
    category: "Accessoires",
    price: 15000,
    stock: 60,
    color: "#20242b",
    description: "Coque en silicone doux compatible MagSafe, protection intégrale pour votre iPhone.",
    specs: "Compatibilité : iPhone 11 à 16\nMatière : silicone souche\nCompatible MagSafe : oui",
  },
  {
    name: "Chargeur secteur 20W USB-C",
    slug: "chargeur-secteur-20w-usb-c",
    sku: "ACC-CHRG-001",
    category: "Accessoires",
    price: 12000,
    stock: 80,
    color: "#e9ebee",
    description: "Adaptateur secteur USB-C 20W pour une charge rapide de votre iPhone.",
    specs: "Puissance : 20W\nPort : USB-C\nCharge rapide : oui",
  },
  {
    name: "Câble USB-C vers Lightning",
    slug: "cable-usb-c-lightning-1m",
    sku: "ACC-CBL-001",
    category: "Accessoires",
    price: 8000,
    stock: 100,
    color: "#e9ebee",
    description: "Câble tressé USB-C vers Lightning, 1 mètre, charge et synchronisation rapides.",
    specs: "Longueur : 1 m\nConnecteurs : USB-C / Lightning\nTressé : oui",
  },
  {
    name: "Écouteurs sans fil Pro",
    slug: "ecouteurs-sans-fil-pro",
    sku: "ACC-EAR-001",
    category: "Accessoires",
    price: 45000,
    compareAtPrice: 55000,
    stock: 35,
    color: "#e9ebee",
    featured: true,
    description: "Écouteurs sans fil avec réduction de bruit active et boîtier de charge MagSafe.",
    specs: "Autonomie : 6h (24h avec boîtier)\nRéduction de bruit active : oui\nBluetooth : 5.3",
  },
  {
    name: "Protection écran verre trempé",
    slug: "protection-ecran-verre-trempe",
    sku: "ACC-GLS-001",
    category: "Accessoires",
    price: 6000,
    stock: 120,
    color: "#c9cdd3",
    description: "Verre trempé anti-rayures, dureté 9H, pose facile sans bulle.",
    specs: "Dureté : 9H\nAnti-traces de doigts : oui\nCompatibilité : iPhone 11 à 16",
  },
  {
    name: "Batterie externe 10000mAh",
    slug: "batterie-externe-10000mah",
    sku: "ACC-PWR-001",
    category: "Accessoires",
    price: 22000,
    stock: 40,
    color: "#3a3a3c",
    description: "Powerbank 10000mAh avec charge rapide USB-C, idéale pour vos déplacements.",
    specs: "Capacité : 10000 mAh\nPorts : USB-C, USB-A\nCharge rapide : 18W",
  },
];

async function main() {
  console.log("Seeding database...");

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  const categoryMap = new Map(
    (await prisma.category.findMany()).map((c) => [c.name, c.id])
  );

  for (const p of products) {
    const categoryId = categoryMap.get(p.category);
    if (!categoryId) continue;
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        name: p.name,
        slug: p.slug,
        sku: p.sku,
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        stock: p.stock,
        color: p.color,
        storage: p.storage,
        description: p.description,
        specs: p.specs,
        featured: p.featured ?? false,
        categoryId,
      },
    });
  }

  const merchantPassword = await bcrypt.hash("Commerce2026!", 10);
  await prisma.user.upsert({
    where: { email: "marchand@bbsconnect.sn" },
    update: {},
    create: {
      name: "Amadou Diene",
      email: "marchand@bbsconnect.sn",
      password: merchantPassword,
      role: "MERCHANT",
      phone: "+221770000000",
    },
  });

  const customerPassword = await bcrypt.hash("Client2026!", 10);
  const customer = await prisma.user.upsert({
    where: { email: "client@bbsconnect.sn" },
    update: {},
    create: {
      name: "Fatou Ndiaye",
      email: "client@bbsconnect.sn",
      password: customerPassword,
      role: "CUSTOMER",
      phone: "+221771234567",
      address: "Sacré-Cœur 3, Dakar",
    },
  });

  const sampleProducts = await prisma.product.findMany({ take: 2 });
  if (sampleProducts.length && (await prisma.order.count()) === 0) {
    const subtotal = sampleProducts.reduce((s, p) => s + p.price, 0);
    const shippingFee = 2500;
    await prisma.order.create({
      data: {
        reference: "BBS-00001DEMO",
        status: "DELIVERED",
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone ?? "",
        address: customer.address ?? "",
        city: "Dakar",
        paymentMethod: "Paiement à la livraison",
        subtotal,
        shippingFee,
        total: subtotal + shippingFee,
        userId: customer.id,
        items: {
          create: sampleProducts.map((p) => ({
            productId: p.id,
            quantity: 1,
            price: p.price,
          })),
        },
      },
    });
  }

  console.log("Seed terminé.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
