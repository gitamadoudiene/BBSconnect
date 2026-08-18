import { PrismaClient, ImageType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function pexels(id: string, width = 1600) {
  return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${width}`;
}

/**
 * Real device photography (verified Pexels CDN — every URL confirmed HTTP 200
 * / image/jpeg by two dedicated research passes).
 *
 * `confirmed` = independently identified as genuinely that iPhone generation
 * (camera layout, retail packaging, or explicit metadata cross-checked).
 * `fallback`  = a real photo of an actual iPhone, but NOT verified to be the
 * specific generation it's assigned to below — used only where research found
 * no identifiable match for that generation (notably: base iPhone 11, base
 * iPhone 15, the entire iPhone 16 lineup, iPhone Air and iPhone 17e — all
 * released too recently, or too plainly, to have distinguishable stock
 * photography yet). Swap these for merchant-supplied product photos via the
 * dashboard once real inventory photos exist.
 */
const confirmed = {
  iphoneXSilverBack: pexels("1647976"),
  iphoneXBlackBack: pexels("5207543"),
  iphoneXFront: pexels("968639"),
  iphone11ProMaxSpaceGrayBack: pexels("13367286"),
  iphone11ProMidnightGreen: pexels("5948353"),
  iphone12BlackAndPurple: pexels("13570143"),
  iphone12ProMaxPacificBlue: pexels("12794487"),
  iphone12ProductRed: pexels("9741358"),
  iphone13Blue: pexels("12741170"),
  iphone13ProSierraBlue: pexels("9667337"),
  iphone14ProDeepPurpleAndSilver: pexels("16004744"),
  iphone14ProDynamicIslandFront: pexels("16004978"),
  iphone14ProDeepPurpleAstronaut: pexels("16005007"),
  iphone15ProMaxUnboxingUsbC: pexels("18525574"),
  iphone15ProOutdoors: pexels("18525573"),
  iphone17ProCosmicOrangeWide: pexels("34624326"),
  iphone17ProCosmicOrangeTight: pexels("34624327"),
  iphone17ProCosmicOrangeAngled: pexels("36659007"),
};

// Generic (real, but generation-unconfirmed) photography — used only where
// research found no identifiable match for that specific generation.
const stock = {
  cameraModuleDark: pexels("16004744"),
  blackOnBlackFabric: pexels("22032427"),
  overheadFlatlayWhite: pexels("3945679"),
  handHoldingDark: pexels("9995703"),
  lightWoodTable: pexels("29020349"),
  outdoorLifestyle: pexels("5357612"),
  dynamicIslandDark: pexels("16004978"),
  cameraLensesClose: pexels("12794487"),
  tripleCameraDark: pexels("10885666"),
  geometricBluePhone: pexels("20360361"),
};

const categories = [
  { name: "iPhone 17", slug: "iphone-17" },
  { name: "iPhone 16", slug: "iphone-16" },
  { name: "iPhone 15", slug: "iphone-15" },
  { name: "iPhone 14", slug: "iphone-14" },
  { name: "iPhone 13", slug: "iphone-13" },
  { name: "iPhone 12", slug: "iphone-12" },
  { name: "iPhone 11", slug: "iphone-11" },
  { name: "iPhone X", slug: "iphone-x" },
  { name: "Accessoires", slug: "accessoires" },
];

type SeedImage = { url: string; type: ImageType; position: number; alt?: string };
type SeedVariant = {
  sku: string;
  colorName: string;
  colorHex: string;
  storage?: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  images: SeedImage[];
};
type SeedProduct = {
  name: string;
  slug: string;
  category: string;
  description: string;
  specs: string;
  featured?: boolean;
  variants: SeedVariant[];
};

function img(url: string, type: ImageType = "GALLERY" as ImageType, position = 0): SeedImage {
  return { url, type, position };
}

const products: SeedProduct[] = [
  // ---------------- iPhone 17 (2025 lineup) ----------------
  {
    name: "iPhone 17 Pro Max",
    slug: "iphone-17-pro-max",
    category: "iPhone 17",
    featured: true,
    description:
      "L'iPhone 17 Pro Max repousse les limites avec la puce A19 Pro, un système de refroidissement en vapor chamber et un système photo Pro entièrement revu.",
    specs:
      "Écran : Super Retina XDR ProMotion de 6,9 pouces\nPuce : A19 Pro\nAppareil photo : Triple 48 Mpx (Principal, Ultra grand-angle, Téléobjectif 8x)\nBatterie : jusqu'à 37h de vidéo\nConnectivité : USB-C 3, 5G, Wi-Fi 7",
    variants: [
      {
        sku: "IP17PM-256-ORG",
        colorName: "Orange cosmique",
        colorHex: "#c9622f",
        storage: "256 Go",
        price: 1150000,
        compareAtPrice: 1220000,
        stock: 10,
        images: [
          img(confirmed.iphone17ProCosmicOrangeWide, "PRIMARY" as ImageType, 0),
          img(confirmed.iphone17ProCosmicOrangeTight, "GALLERY" as ImageType, 1),
        ],
      },
      {
        sku: "IP17PM-256-BLU",
        colorName: "Bleu intense",
        colorHex: "#2c3e6b",
        storage: "256 Go",
        price: 1150000,
        stock: 8,
        images: [img(stock.blackOnBlackFabric, "PRIMARY" as ImageType, 0), img(stock.tripleCameraDark, "GALLERY" as ImageType, 1)],
      },
      {
        sku: "IP17PM-512-SLV",
        colorName: "Argent",
        colorHex: "#e4e4e2",
        storage: "512 Go",
        price: 1350000,
        stock: 5,
        images: [img(stock.lightWoodTable, "PRIMARY" as ImageType, 0), img(stock.overheadFlatlayWhite, "GALLERY" as ImageType, 1)],
      },
    ],
  },
  {
    name: "iPhone 17 Pro",
    slug: "iphone-17-pro",
    category: "iPhone 17",
    featured: true,
    description:
      "L'iPhone 17 Pro combine le châssis en titane, l'écran ProMotion 120Hz et la puissance de la puce A19 Pro dans un format plus compact.",
    specs:
      "Écran : Super Retina XDR ProMotion de 6,3 pouces\nPuce : A19 Pro\nAppareil photo : Triple 48 Mpx\nBatterie : jusqu'à 31h de vidéo\nConnectivité : USB-C 3, 5G, Wi-Fi 7",
    variants: [
      {
        sku: "IP17P-256-ORG",
        colorName: "Orange cosmique",
        colorHex: "#c9622f",
        storage: "256 Go",
        price: 1050000,
        stock: 12,
        images: [
          img(confirmed.iphone17ProCosmicOrangeAngled, "PRIMARY" as ImageType, 0),
          img(confirmed.iphone17ProCosmicOrangeWide, "GALLERY" as ImageType, 1),
        ],
      },
      {
        sku: "IP17P-256-SLV",
        colorName: "Argent",
        colorHex: "#e4e4e2",
        storage: "256 Go",
        price: 1050000,
        compareAtPrice: 1100000,
        stock: 9,
        images: [img(stock.lightWoodTable, "PRIMARY" as ImageType, 0), img(stock.overheadFlatlayWhite, "GALLERY" as ImageType, 1)],
      },
    ],
  },
  {
    name: "iPhone Air",
    slug: "iphone-air",
    category: "iPhone 17",
    featured: true,
    description:
      "L'iPhone Air introduit un châssis inédit ultra-fin en titane, sans compromis sur l'autonomie ni la puissance grâce à la puce A19.",
    specs:
      "Écran : Super Retina XDR ProMotion de 6,5 pouces\nPuce : A19\nÉpaisseur : 5,6 mm\nAppareil photo : Simple 48 Mpx grand-angle\nBatterie : jusqu'à 27h de vidéo\nConnectivité : USB-C, 5G, Wi-Fi 7",
    variants: [
      {
        sku: "IPAIR-256-SKY",
        colorName: "Bleu ciel",
        colorHex: "#9fb8cc",
        storage: "256 Go",
        price: 980000,
        stock: 11,
        images: [img(stock.handHoldingDark, "PRIMARY" as ImageType, 0), img(stock.geometricBluePhone, "GALLERY" as ImageType, 1)],
      },
      {
        sku: "IPAIR-256-WHT",
        colorName: "Blanc nuage",
        colorHex: "#eef0ee",
        storage: "256 Go",
        price: 980000,
        stock: 7,
        images: [img(stock.lightWoodTable, "PRIMARY" as ImageType, 0), img(stock.overheadFlatlayWhite, "GALLERY" as ImageType, 1)],
      },
    ],
  },
  {
    name: "iPhone 17",
    slug: "iphone-17",
    category: "iPhone 17",
    featured: true,
    description:
      "L'iPhone 17 apporte la puce A19, un écran ProMotion 120Hz et un double appareil photo 48 Mpx dans un design coloré.",
    specs:
      "Écran : Super Retina XDR ProMotion de 6,3 pouces\nPuce : A19\nAppareil photo : Double 48 Mpx\nBatterie : jusqu'à 24h de vidéo\nConnectivité : USB-C, 5G, Wi-Fi 7",
    variants: [
      {
        sku: "IP17-256-LAV",
        colorName: "Lavande",
        colorHex: "#c9c3e0",
        storage: "256 Go",
        price: 780000,
        stock: 16,
        images: [img(stock.geometricBluePhone, "PRIMARY" as ImageType, 0), img(stock.overheadFlatlayWhite, "GALLERY" as ImageType, 1)],
      },
      {
        sku: "IP17-256-SAU",
        colorName: "Sauge",
        colorHex: "#aab9a2",
        storage: "256 Go",
        price: 780000,
        stock: 14,
        images: [img(stock.lightWoodTable, "PRIMARY" as ImageType, 0), img(stock.handHoldingDark, "GALLERY" as ImageType, 1)],
      },
      {
        sku: "IP17-128-BLK",
        colorName: "Noir",
        colorHex: "#1c1c1e",
        storage: "128 Go",
        price: 720000,
        compareAtPrice: 760000,
        stock: 18,
        images: [img(stock.blackOnBlackFabric, "PRIMARY" as ImageType, 0), img(stock.tripleCameraDark, "GALLERY" as ImageType, 1)],
      },
    ],
  },
  {
    name: "iPhone 17e",
    slug: "iphone-17e",
    category: "iPhone 17",
    description:
      "L'iPhone 17e propose l'essentiel de l'expérience iPhone récente — puce A19, Dynamic Island et appareil photo 48 Mpx — au meilleur prix.",
    specs:
      "Écran : Super Retina XDR de 6,1 pouces\nPuce : A19\nAppareil photo : Simple 48 Mpx\nBatterie : jusqu'à 22h de vidéo\nConnectivité : USB-C, 5G, Wi-Fi 6",
    variants: [
      {
        sku: "IP17E-128-BLK",
        colorName: "Noir",
        colorHex: "#1c1c1e",
        storage: "128 Go",
        price: 620000,
        stock: 20,
        images: [img(stock.blackOnBlackFabric, "PRIMARY" as ImageType, 0)],
      },
      {
        sku: "IP17E-128-WHT",
        colorName: "Blanc",
        colorHex: "#eef0ee",
        storage: "128 Go",
        price: 620000,
        stock: 15,
        images: [img(stock.lightWoodTable, "PRIMARY" as ImageType, 0)],
      },
    ],
  },
  // ---------------- iPhone 16 ----------------
  {
    name: "iPhone 16 Pro Max",
    slug: "iphone-16-pro-max",
    category: "iPhone 16",
    featured: true,
    description:
      "L'iPhone 16 Pro Max redéfinit la puissance mobile avec la puce A18 Pro, un écran Super Retina XDR de 6,9 pouces et un système photo professionnel.",
    specs:
      "Écran : Super Retina XDR de 6,9 pouces (2868 x 1320 px)\nPuce : A18 Pro\nAppareil photo : Triple 48 Mpx (Principal, Ultra grand-angle, Téléobjectif 5x)\nBatterie : jusqu'à 33h de vidéo\nConnectivité : USB-C, 5G, Wi-Fi 7",
    variants: [
      {
        sku: "IP16PM-256-BLK",
        colorName: "Titane noir",
        colorHex: "#3b3a37",
        storage: "256 Go",
        price: 950000,
        compareAtPrice: 1020000,
        stock: 12,
        images: [img(stock.blackOnBlackFabric, "PRIMARY" as ImageType, 0), img(stock.tripleCameraDark, "GALLERY" as ImageType, 1)],
      },
    ],
  },
  {
    name: "iPhone 16 Pro",
    slug: "iphone-16-pro",
    category: "iPhone 16",
    featured: true,
    description:
      "L'iPhone 16 Pro combine un design en titane, un écran ProMotion 120Hz et la puissance de la puce A18 Pro dans un format compact.",
    specs:
      "Écran : Super Retina XDR de 6,3 pouces (2622 x 1206 px)\nPuce : A18 Pro\nAppareil photo : Triple 48 Mpx\nBatterie : jusqu'à 27h de vidéo\nConnectivité : USB-C, 5G, Wi-Fi 7",
    variants: [
      {
        sku: "IP16P-256-NAT",
        colorName: "Titane naturel",
        colorHex: "#8f8477",
        storage: "256 Go",
        price: 850000,
        stock: 15,
        images: [img(stock.lightWoodTable, "PRIMARY" as ImageType, 0), img(stock.handHoldingDark, "GALLERY" as ImageType, 1)],
      },
    ],
  },
  {
    name: "iPhone 16",
    slug: "iphone-16",
    category: "iPhone 16",
    featured: true,
    description:
      "L'iPhone 16 apporte la puce A18, le bouton Action et un système à double appareil photo 48 Mpx dans un design coloré et résistant.",
    specs:
      "Écran : Super Retina XDR de 6,1 pouces (2556 x 1179 px)\nPuce : A18\nAppareil photo : Double 48 Mpx\nBatterie : jusqu'à 22h de vidéo\nConnectivité : USB-C, 5G, Wi-Fi 7",
    variants: [
      {
        sku: "IP16-128-BLU",
        colorName: "Bleu",
        colorHex: "#5a7a9e",
        storage: "128 Go",
        price: 650000,
        stock: 20,
        images: [img(stock.geometricBluePhone, "PRIMARY" as ImageType, 0), img(stock.overheadFlatlayWhite, "GALLERY" as ImageType, 1)],
      },
    ],
  },
  {
    name: "iPhone 16 Plus",
    slug: "iphone-16-plus",
    category: "iPhone 16",
    description:
      "Le grand écran de l'iPhone 16 Plus, la puce A18 et une autonomie exceptionnelle pour toute la journée.",
    specs:
      "Écran : Super Retina XDR de 6,7 pouces (2796 x 1290 px)\nPuce : A18\nAppareil photo : Double 48 Mpx\nBatterie : jusqu'à 27h de vidéo\nConnectivité : USB-C, 5G, Wi-Fi 7",
    variants: [
      {
        sku: "IP16PL-256-PNK",
        colorName: "Rose",
        colorHex: "#e7c2c8",
        storage: "256 Go",
        price: 720000,
        stock: 10,
        images: [img(stock.lightWoodTable, "PRIMARY" as ImageType, 0)],
      },
    ],
  },
  // ---------------- iPhone 15 ----------------
  {
    name: "iPhone 15 Pro Max",
    slug: "iphone-15-pro-max",
    category: "iPhone 15",
    featured: true,
    description:
      "L'iPhone 15 Pro Max avec structure en titane, puce A17 Pro et zoom optique 5x pour des photos dignes d'un pro.",
    specs:
      "Écran : Super Retina XDR de 6,7 pouces (2796 x 1290 px)\nPuce : A17 Pro\nAppareil photo : Triple 48 Mpx, zoom optique 5x\nBatterie : jusqu'à 29h de vidéo\nConnectivité : USB-C, 5G, Wi-Fi 6E",
    variants: [
      {
        sku: "IP15PM-256-BLU",
        colorName: "Titane bleu",
        colorHex: "#4c5a68",
        storage: "256 Go",
        price: 780000,
        stock: 9,
        images: [
          img(confirmed.iphone15ProMaxUnboxingUsbC, "PRIMARY" as ImageType, 0),
          img(confirmed.iphone15ProOutdoors, "GALLERY" as ImageType, 1),
        ],
      },
    ],
  },
  {
    name: "iPhone 15",
    slug: "iphone-15",
    category: "iPhone 15",
    featured: true,
    description:
      "L'iPhone 15 introduit Dynamic Island, un appareil photo principal 48 Mpx et le port USB-C dans un boîtier en aluminium coloré.",
    specs:
      "Écran : Super Retina XDR de 6,1 pouces (2556 x 1179 px)\nPuce : A16 Bionic\nAppareil photo : Double 48 Mpx\nBatterie : jusqu'à 20h de vidéo\nConnectivité : USB-C, 5G, Wi-Fi 6",
    variants: [
      {
        sku: "IP15-128-BLK",
        colorName: "Noir",
        colorHex: "#20242b",
        storage: "128 Go",
        price: 580000,
        compareAtPrice: 630000,
        stock: 18,
        images: [img(stock.blackOnBlackFabric, "PRIMARY" as ImageType, 0)],
      },
    ],
  },
  {
    name: "iPhone 15 Plus",
    slug: "iphone-15-plus",
    category: "iPhone 15",
    description: "Le format Plus de l'iPhone 15 avec grand écran 6,7 pouces et autonomie longue durée.",
    specs:
      "Écran : Super Retina XDR de 6,7 pouces (2796 x 1290 px)\nPuce : A16 Bionic\nAppareil photo : Double 48 Mpx\nBatterie : jusqu'à 26h de vidéo\nConnectivité : USB-C, 5G, Wi-Fi 6",
    variants: [
      {
        sku: "IP15PL-128-YEL",
        colorName: "Jaune",
        colorHex: "#e8d78a",
        storage: "128 Go",
        price: 620000,
        stock: 11,
        images: [img(stock.lightWoodTable, "PRIMARY" as ImageType, 0)],
      },
    ],
  },
  // ---------------- iPhone 14 ----------------
  {
    name: "iPhone 14 Pro",
    slug: "iphone-14-pro",
    category: "iPhone 14",
    description: "L'iPhone 14 Pro avec Dynamic Island, écran Always-On et appareil photo principal 48 Mpx.",
    specs:
      "Écran : Super Retina XDR de 6,1 pouces (2556 x 1179 px)\nPuce : A16 Bionic\nAppareil photo : Triple 48 Mpx\nBatterie : jusqu'à 23h de vidéo\nConnectivité : Lightning, 5G, Wi-Fi 6",
    variants: [
      {
        sku: "IP14P-256-PUR",
        colorName: "Violet intense",
        colorHex: "#5b4a63",
        storage: "256 Go",
        price: 620000,
        stock: 8,
        images: [
          img(confirmed.iphone14ProDeepPurpleAndSilver, "PRIMARY" as ImageType, 0),
          img(confirmed.iphone14ProDeepPurpleAstronaut, "GALLERY" as ImageType, 1),
          img(confirmed.iphone14ProDynamicIslandFront, "GALLERY" as ImageType, 2),
        ],
      },
    ],
  },
  {
    name: "iPhone 14",
    slug: "iphone-14",
    category: "iPhone 14",
    featured: true,
    description: "L'iPhone 14 offre la puce A15 Bionic, la détection d'accident et un système photo amélioré.",
    specs:
      "Écran : Super Retina XDR de 6,1 pouces (2532 x 1170 px)\nPuce : A15 Bionic\nAppareil photo : Double 12 Mpx\nBatterie : jusqu'à 20h de vidéo\nConnectivité : Lightning, 5G, Wi-Fi 6",
    variants: [
      {
        sku: "IP14-128-BLU",
        colorName: "Bleu",
        colorHex: "#3d5a73",
        storage: "128 Go",
        price: 480000,
        stock: 22,
        images: [img(stock.geometricBluePhone, "PRIMARY" as ImageType, 0)],
      },
    ],
  },
  {
    name: "iPhone 14 Plus",
    slug: "iphone-14-plus",
    category: "iPhone 14",
    description: "L'iPhone 14 Plus, grand écran et autonomie record dans la gamme 14.",
    specs:
      "Écran : Super Retina XDR de 6,7 pouces (2778 x 1284 px)\nPuce : A15 Bionic\nAppareil photo : Double 12 Mpx\nBatterie : jusqu'à 26h de vidéo\nConnectivité : Lightning, 5G, Wi-Fi 6",
    variants: [
      {
        sku: "IP14PL-128-MID",
        colorName: "Minuit",
        colorHex: "#1c1e26",
        storage: "128 Go",
        price: 520000,
        stock: 10,
        images: [img(stock.blackOnBlackFabric, "PRIMARY" as ImageType, 0)],
      },
    ],
  },
  // ---------------- iPhone 13 ----------------
  {
    name: "iPhone 13 Pro",
    slug: "iphone-13-pro",
    category: "iPhone 13",
    description: "L'iPhone 13 Pro avec écran ProMotion 120Hz et triple appareil photo Pro.",
    specs:
      "Écran : Super Retina XDR ProMotion 6,1 pouces\nPuce : A15 Bionic\nAppareil photo : Triple 12 Mpx\nBatterie : jusqu'à 22h de vidéo\nConnectivité : Lightning, 5G, Wi-Fi 6",
    variants: [
      {
        sku: "IP13P-256-SRB",
        colorName: "Bleu Sierra",
        colorHex: "#8fa3b3",
        storage: "256 Go",
        price: 470000,
        stock: 7,
        images: [img(confirmed.iphone13ProSierraBlue, "PRIMARY" as ImageType, 0)],
      },
    ],
  },
  {
    name: "iPhone 13",
    slug: "iphone-13",
    category: "iPhone 13",
    featured: true,
    description: "L'iPhone 13, toujours parmi les plus populaires : rapide, fiable et élégant.",
    specs:
      "Écran : Super Retina XDR 6,1 pouces (2532 x 1170 px)\nPuce : A15 Bionic\nAppareil photo : Double 12 Mpx\nBatterie : jusqu'à 19h de vidéo\nConnectivité : Lightning, 5G, Wi-Fi 6",
    variants: [
      {
        sku: "IP13-128-BLU",
        colorName: "Bleu",
        colorHex: "#6b8cae",
        storage: "128 Go",
        price: 380000,
        compareAtPrice: 420000,
        stock: 25,
        images: [img(confirmed.iphone13Blue, "PRIMARY" as ImageType, 0)],
      },
    ],
  },
  {
    name: "iPhone 13 mini",
    slug: "iphone-13-mini",
    category: "iPhone 13",
    description: "Le format compact de l'iPhone 13, pour ceux qui préfèrent un téléphone léger et puissant.",
    specs:
      "Écran : Super Retina XDR 5,4 pouces\nPuce : A15 Bionic\nAppareil photo : Double 12 Mpx\nBatterie : jusqu'à 13h de vidéo\nConnectivité : Lightning, 5G, Wi-Fi 6",
    variants: [
      {
        sku: "IP13M-128-MID",
        colorName: "Minuit",
        colorHex: "#22242c",
        storage: "128 Go",
        price: 340000,
        stock: 9,
        images: [img(stock.blackOnBlackFabric, "PRIMARY" as ImageType, 0)],
      },
    ],
  },
  // ---------------- iPhone 12 ----------------
  {
    name: "iPhone 12 Pro",
    slug: "iphone-12-pro",
    category: "iPhone 12",
    description: "L'iPhone 12 Pro, écran Super Retina XDR et triple appareil photo Pro avec LiDAR.",
    specs:
      "Écran : Super Retina XDR 6,1 pouces\nPuce : A14 Bionic\nAppareil photo : Triple 12 Mpx + LiDAR\nBatterie : jusqu'à 17h de vidéo\nConnectivité : Lightning, 5G, Wi-Fi 6",
    variants: [
      {
        sku: "IP12P-128-BLU",
        colorName: "Bleu pacifique",
        colorHex: "#3c5266",
        storage: "128 Go",
        price: 360000,
        stock: 6,
        images: [img(confirmed.iphone12ProMaxPacificBlue, "PRIMARY" as ImageType, 0)],
      },
    ],
  },
  {
    name: "iPhone 12",
    slug: "iphone-12",
    category: "iPhone 12",
    featured: true,
    description: "L'iPhone 12 avec écran Super Retina XDR, MagSafe et puce A14 Bionic performante.",
    specs:
      "Écran : Super Retina XDR 6,1 pouces (2532 x 1170 px)\nPuce : A14 Bionic\nAppareil photo : Double 12 Mpx\nBatterie : jusqu'à 17h de vidéo\nConnectivité : Lightning, 5G, Wi-Fi 6",
    variants: [
      {
        sku: "IP12-64-RED",
        colorName: "(PRODUCT)RED",
        colorHex: "#b23b3b",
        storage: "64 Go",
        price: 290000,
        stock: 20,
        images: [
          img(confirmed.iphone12ProductRed, "PRIMARY" as ImageType, 0),
          img(confirmed.iphone12BlackAndPurple, "GALLERY" as ImageType, 1),
        ],
      },
    ],
  },
  {
    name: "iPhone 12 mini",
    slug: "iphone-12-mini",
    category: "iPhone 12",
    description: "Compact et puissant, l'iPhone 12 mini tient dans une seule main.",
    specs:
      "Écran : Super Retina XDR 5,4 pouces\nPuce : A14 Bionic\nAppareil photo : Double 12 Mpx\nBatterie : jusqu'à 15h de vidéo\nConnectivité : Lightning, 5G, Wi-Fi 6",
    variants: [
      {
        sku: "IP12M-64-GRN",
        colorName: "Vert",
        colorHex: "#4c5d4f",
        storage: "64 Go",
        price: 260000,
        stock: 8,
        images: [img(stock.tripleCameraDark, "PRIMARY" as ImageType, 0)],
      },
    ],
  },
  // ---------------- iPhone 11 ----------------
  {
    name: "iPhone 11 Pro Max",
    slug: "iphone-11-pro-max",
    category: "iPhone 11",
    description: "L'iPhone 11 Pro Max, grand écran OLED et triple appareil photo grand-angle.",
    specs:
      "Écran : Super Retina XDR 6,5 pouces\nPuce : A13 Bionic\nAppareil photo : Triple 12 Mpx\nBatterie : jusqu'à 20h de vidéo\nConnectivité : Lightning, 4G, Wi-Fi 6",
    variants: [
      {
        sku: "IP11PM-256-GRY",
        colorName: "Gris sidéral",
        colorHex: "#4a4a4d",
        storage: "256 Go",
        price: 320000,
        stock: 5,
        images: [img(confirmed.iphone11ProMaxSpaceGrayBack, "PRIMARY" as ImageType, 0)],
      },
    ],
  },
  {
    name: "iPhone 11",
    slug: "iphone-11",
    category: "iPhone 11",
    featured: true,
    description: "L'iPhone 11, un excellent rapport qualité-prix avec double appareil photo et puce A13 Bionic.",
    specs:
      "Écran : Liquid Retina HD 6,1 pouces (1792 x 828 px)\nPuce : A13 Bionic\nAppareil photo : Double 12 Mpx\nBatterie : jusqu'à 17h de vidéo\nConnectivité : Lightning, 4G, Wi-Fi 6",
    variants: [
      {
        sku: "IP11-128-WHT",
        colorName: "Blanc",
        colorHex: "#e9ebee",
        storage: "128 Go",
        price: 240000,
        compareAtPrice: 270000,
        stock: 24,
        images: [img(stock.overheadFlatlayWhite, "PRIMARY" as ImageType, 0)],
      },
      {
        sku: "IP11-64-RED",
        colorName: "Rouge",
        colorHex: "#a4322f",
        storage: "64 Go",
        price: 220000,
        stock: 14,
        images: [img(stock.handHoldingDark, "PRIMARY" as ImageType, 0)],
      },
    ],
  },
  // ---------------- iPhone X ----------------
  {
    name: "iPhone X",
    slug: "iphone-x",
    category: "iPhone X",
    featured: true,
    description:
      "L'iPhone X, le premier iPhone à écran Super Retina HD OLED de 5,8 pouces, résolution 2436 x 1125 pixels (458 ppp).",
    specs:
      "Écran : Super Retina HD 5,8 pouces (2436 x 1125 px, 458 ppp)\nPuce : A11 Bionic\nAppareil photo : Double 12 Mpx\nBatterie : jusqu'à 13h de vidéo\nConnectivité : Lightning, 4G, Wi-Fi 5",
    variants: [
      {
        sku: "IPX-256-SLV",
        colorName: "Argent",
        colorHex: "#c9cdd3",
        storage: "256 Go",
        price: 180000,
        stock: 6,
        images: [img(confirmed.iphoneXSilverBack, "PRIMARY" as ImageType, 0)],
      },
      {
        sku: "IPX-64-GRY",
        colorName: "Gris sidéral",
        colorHex: "#4b4d52",
        storage: "64 Go",
        price: 160000,
        compareAtPrice: 190000,
        stock: 9,
        images: [
          img(confirmed.iphoneXBlackBack, "PRIMARY" as ImageType, 0),
          img(confirmed.iphoneXFront, "GALLERY" as ImageType, 1),
        ],
      },
    ],
  },
  // ---------------- Accessoires ----------------
  {
    name: "Coque silicone MagSafe",
    slug: "coque-silicone-magsafe",
    category: "Accessoires",
    description: "Coque en silicone doux compatible MagSafe, protection intégrale pour votre iPhone.",
    specs: "Compatibilité : iPhone 11 à 17\nMatière : silicone souche\nCompatible MagSafe : oui",
    variants: [
      {
        sku: "ACC-CASE-001",
        colorName: "Noir",
        colorHex: "#20242b",
        price: 15000,
        stock: 60,
        images: [img(stock.blackOnBlackFabric, "PRIMARY" as ImageType, 0)],
      },
    ],
  },
  {
    name: "Chargeur secteur 20W USB-C",
    slug: "chargeur-secteur-20w-usb-c",
    category: "Accessoires",
    description: "Adaptateur secteur USB-C 20W pour une charge rapide de votre iPhone.",
    specs: "Puissance : 20W\nPort : USB-C\nCharge rapide : oui",
    variants: [
      {
        sku: "ACC-CHRG-001",
        colorName: "Blanc",
        colorHex: "#e9ebee",
        price: 12000,
        stock: 80,
        images: [img(stock.overheadFlatlayWhite, "PRIMARY" as ImageType, 0)],
      },
    ],
  },
  {
    name: "Câble USB-C vers Lightning",
    slug: "cable-usb-c-lightning-1m",
    category: "Accessoires",
    description: "Câble tressé USB-C vers Lightning, 1 mètre, charge et synchronisation rapides.",
    specs: "Longueur : 1 m\nConnecteurs : USB-C / Lightning\nTressé : oui",
    variants: [
      {
        sku: "ACC-CBL-001",
        colorName: "Blanc",
        colorHex: "#e9ebee",
        price: 8000,
        stock: 100,
        images: [img(stock.overheadFlatlayWhite, "PRIMARY" as ImageType, 0)],
      },
    ],
  },
  {
    name: "Écouteurs sans fil Pro",
    slug: "ecouteurs-sans-fil-pro",
    category: "Accessoires",
    featured: true,
    description: "Écouteurs sans fil avec réduction de bruit active et boîtier de charge MagSafe.",
    specs: "Autonomie : 6h (24h avec boîtier)\nRéduction de bruit active : oui\nBluetooth : 5.3",
    variants: [
      {
        sku: "ACC-EAR-001",
        colorName: "Blanc",
        colorHex: "#e9ebee",
        price: 45000,
        compareAtPrice: 55000,
        stock: 35,
        images: [img(stock.lightWoodTable, "PRIMARY" as ImageType, 0)],
      },
    ],
  },
  {
    name: "Protection écran verre trempé",
    slug: "protection-ecran-verre-trempe",
    category: "Accessoires",
    description: "Verre trempé anti-rayures, dureté 9H, pose facile sans bulle.",
    specs: "Dureté : 9H\nAnti-traces de doigts : oui\nCompatibilité : iPhone 11 à 17",
    variants: [
      {
        sku: "ACC-GLS-001",
        colorName: "Transparent",
        colorHex: "#c9cdd3",
        price: 6000,
        stock: 120,
        images: [img(stock.cameraLensesClose, "PRIMARY" as ImageType, 0)],
      },
    ],
  },
  {
    name: "Batterie externe 10000mAh",
    slug: "batterie-externe-10000mah",
    category: "Accessoires",
    description: "Powerbank 10000mAh avec charge rapide USB-C, idéale pour vos déplacements.",
    specs: "Capacité : 10000 mAh\nPorts : USB-C, USB-A\nCharge rapide : 18W",
    variants: [
      {
        sku: "ACC-PWR-001",
        colorName: "Noir",
        colorHex: "#3a3a3c",
        price: 22000,
        stock: 40,
        images: [img(stock.blackOnBlackFabric, "PRIMARY" as ImageType, 0)],
      },
    ],
  },
];

async function main() {
  console.log("Seeding database...");

  for (const cat of categories) {
    await prisma.category.upsert({ where: { slug: cat.slug }, update: {}, create: cat });
  }
  const categoryMap = new Map((await prisma.category.findMany()).map((c) => [c.name, c.id]));

  for (const p of products) {
    const categoryId = categoryMap.get(p.category);
    if (!categoryId) continue;

    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        description: p.description,
        specs: p.specs,
        featured: p.featured ?? false,
        categoryId,
      },
      create: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        specs: p.specs,
        featured: p.featured ?? false,
        categoryId,
      },
    });

    for (let i = 0; i < p.variants.length; i++) {
      const v = p.variants[i];
      const variant = await prisma.productVariant.upsert({
        where: { sku: v.sku },
        update: {
          colorName: v.colorName,
          colorHex: v.colorHex,
          storage: v.storage,
          price: v.price,
          compareAtPrice: v.compareAtPrice,
          stock: v.stock,
          position: i,
          productId: product.id,
        },
        create: {
          sku: v.sku,
          colorName: v.colorName,
          colorHex: v.colorHex,
          storage: v.storage,
          price: v.price,
          compareAtPrice: v.compareAtPrice,
          stock: v.stock,
          position: i,
          productId: product.id,
        },
      });

      await prisma.productImage.deleteMany({ where: { variantId: variant.id } });
      await prisma.productImage.createMany({
        data: v.images.map((im) => ({
          url: im.url,
          type: im.type,
          position: im.position,
          variantId: variant.id,
        })),
      });
    }
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

  if ((await prisma.order.count()) === 0) {
    const sampleVariants = await prisma.productVariant.findMany({ take: 2 });
    const subtotal = sampleVariants.reduce((s, v) => s + v.price, 0);
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
          create: sampleVariants.map((v) => ({ variantId: v.id, quantity: 1, price: v.price })),
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
