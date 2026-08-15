/**
 * Central registry of external photography used across the marketing site.
 * Every URL below is a verified, directly-loadable Pexels CDN image (confirmed
 * HTTP 200 / image/jpeg). Swap values here to update imagery everywhere it's used.
 */
export function pexels(id: string, width = 1600) {
  return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${width}`;
}

export const images = {
  heroSlides: [
    pexels("16004744"), // iPhone 14 Pro Max close-up, camera module detail
    pexels("22032427"), // black smartphone on luxurious black fabric
    pexels("3945679"), // overhead iPhones + iPad + earphones on white
  ],
  collectionPro: pexels("9995703"), // hand holding phone, dark background
  collectionClassic: pexels("29020349"), // phone on light wooden table
  collectionLifestyle: pexels("5357612"), // woman using smartphone outdoors
  proBanner: pexels("16004978", 2000), // iPhone 14 Pro, Dynamic Island, accessories
  whyUsLifestyle: pexels("839443"), // workspace: laptop, smartphone, fresh roses
  needPhotography: pexels("12794487"), // close-up of smartphone camera lenses
  needPerformance: pexels("10885666"), // triple camera lenses on dark background
  needEveryday: pexels("5052877"), // hand scrolling phone near a coffee cup
  needValue: pexels("20360361"), // smartphone on geometric paper background
  accessoryAirpods: pexels("9204671"), // white earbuds on dramatic black background
  accessoryCharger: pexels("12671356"), // lightning connector on sleek black surface
  accessoryCase: pexels("18357980"), // hand holding a phone case
  lifestyleGrid: [
    pexels("265658"), // iPhone next to MacBook on a wooden desk
    pexels("7738878"), // phone mounted on a car dashboard
    pexels("5356711"), // woman using smartphone outdoors in the city
    pexels("1655353"), // "shot on iPhone" style lake at sunset
    pexels("20694726"), // minimalist home office setup
    pexels("6699512"), // man on phone near a tram, urban street
  ],
} as const;

const accessoryImagesBySkuPrefix: Record<string, string> = {
  "ACC-EAR": images.accessoryAirpods,
  "ACC-CHRG": images.accessoryCharger,
  "ACC-CBL": images.accessoryCharger,
  "ACC-CASE": images.accessoryCase,
  "ACC-GLS": images.accessoryCase,
  "ACC-PWR": images.accessoryCharger,
};

export function accessoryImage(sku: string) {
  const prefix = Object.keys(accessoryImagesBySkuPrefix).find((p) => sku.startsWith(p));
  return prefix ? accessoryImagesBySkuPrefix[prefix] : images.accessoryCase;
}
