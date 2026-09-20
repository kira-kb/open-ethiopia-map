export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_MAP_API_URL || "https://open-ethiopia-map-isf6.vercel.app"
).replace(/\/$/, "");

export interface Landmark {
  id: string;
  name: string;
  amharicName?: string;
  category: string;
  coords: [number, number]; // [lng, lat]
  description: string;
}

export const ADDIS_LANDMARKS: Landmark[] = [
  {
    id: "meskel-sq",
    name: "Meskel Square",
    amharicName: "መስቀል አደባባይ",
    category: "Square / Civic",
    coords: [38.7578, 8.9806],
    description: "Central gathering landmark and transportation focal hub in Addis Ababa",
  },
  {
    id: "bole-airport",
    name: "Bole International Airport",
    amharicName: "ቦሌ ዓለም አቀፍ አውሮፕላን ማረፊያ",
    category: "Airport / Transit",
    coords: [38.7993, 8.9774],
    description: "East Africa's major international aviation gateway and freight hub",
  },
  {
    id: "piassa",
    name: "Piassa (Arada)",
    amharicName: "ፒያሳ (አራዳ)",
    category: "Historic Commercial",
    coords: [38.7516, 9.0354],
    description: "Historic commercial district, gold jewelers, and cultural center",
  },
  {
    id: "kazanchis",
    name: "Kazanchis",
    amharicName: "ካዛንቺስ",
    category: "Business District",
    coords: [38.7725, 9.0185],
    description: "UNECA headquarters, ministerial complexes, and international hotels",
  },
  {
    id: "megenagna",
    name: "Megenagna",
    amharicName: "መገናኛ",
    category: "Transit Interchange",
    coords: [38.8015, 9.0212],
    description: "Key eastern transit node linking Ring Road and Light Rail transit",
  },
  {
    id: "mexico-sq",
    name: "Mexico Square",
    amharicName: "ሜክሲኮ አደባባይ",
    category: "Square / Commerce",
    coords: [38.7441, 9.0102],
    description: "Commercial crossroad connecting Lideta, Kirkos, and African Union",
  },
];

export const DEMO_ROUTES = [
  {
    id: "route-airport",
    title: "Meskel Square → Bole Airport",
    origin: { name: "Meskel Square", coords: [38.7578, 8.9806] as [number, number] },
    destination: { name: "Bole Airport", coords: [38.7993, 8.9774] as [number, number] },
    profile: "driving",
  },
  {
    id: "route-commute",
    title: "Piassa → Kazanchis",
    origin: { name: "Piassa", coords: [38.7516, 9.0354] as [number, number] },
    destination: { name: "Kazanchis", coords: [38.7725, 9.0185] as [number, number] },
    profile: "driving",
  },
  {
    id: "route-ringroad",
    title: "Megenagna → Mexico Square",
    origin: { name: "Megenagna", coords: [38.8015, 9.0212] as [number, number] },
    destination: { name: "Mexico Square", coords: [38.7441, 9.0102] as [number, number] },
    profile: "driving",
  },
];

export const PLATFORM_METRICS = [
  { label: "OSRM Routing Latency", value: "<15ms", change: "Sub-second engine" },
  { label: "API Cost & Key Requirement", value: "$0.00", change: "100% Free & Open" },
  { label: "Supported SDK Environments", value: "4+ Platforms", change: "Web, Flutter, RN, Native" },
  { label: "Canonical Route Sessions", value: "Audit-Grade", change: "Immutable revisions" },
];
