/**
 * Ethiopian Map & Routing Service Configuration & Real Geographic Assets
 */

export function getEffectiveApiUrl(): string {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("packman_map_api_url");
    if (saved) return saved.replace(/\/$/, "");

    // When running inside the unified Docker container (port 7860 or cloud URL), use window.location.origin
    if (window.location.port === "7860" || !window.location.hostname.includes("localhost")) {
      return window.location.origin;
    }

    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      return window.location.port === "3000" ? "http://localhost:7860" : window.location.origin;
    }
  }
  return (process.env.NEXT_PUBLIC_MAP_API_URL || "https://open-ethiopia-map-isf6.vercel.app").replace(/\/$/, "");
}

export const API_BASE_URL = (
  typeof window !== "undefined"
    ? (window.location.port === "3000" ? "http://localhost:7860" : window.location.origin)
    : (process.env.NEXT_PUBLIC_MAP_API_URL || "https://open-ethiopia-map-isf6.vercel.app")
).replace(/\/$/, "");

export const DEFAULT_DEMO_API_KEY = "sk_delivery_live_gondar_3b1c559812a4";

export interface Landmark {
  id: string;
  name: string;
  amharicName?: string;
  category: string;
  city: "Addis Ababa" | "Gondar";
  coords: [number, number]; // [lng, lat]
  description: string;
}

// ── Addis Ababa Verified Landmarks (20+ Rich Locations) ────────
export const ADDIS_LANDMARKS: Landmark[] = [
  {
    id: "meskel-sq",
    name: "Meskel Square",
    amharicName: "መስቀል አደባባይ",
    category: "Square / Civic",
    city: "Addis Ababa",
    coords: [38.7578, 8.9806],
    description: "Central gathering landmark and transportation focal hub in Addis Ababa",
  },
  {
    id: "bole-airport",
    name: "Bole International Airport",
    amharicName: "ቦሌ ዓለም አቀፍ አውሮፕላን ማረፊያ",
    category: "Airport / Transit",
    city: "Addis Ababa",
    coords: [38.795694, 8.9832295],
    description: "East Africa's major international aviation gateway and freight hub",
  },
  {
    id: "bole-medhanialem",
    name: "Bole Medhanialem",
    amharicName: "ቦሌ መድኃኔዓለም",
    category: "Cathedral / Commercial",
    city: "Addis Ababa",
    coords: [38.7877, 8.9961],
    description: "Prominent cathedral surrounded by high-traffic malls, banks, and cafes",
  },
  {
    id: "piassa",
    name: "Piassa (Arada)",
    amharicName: "ፒያሳ (አራዳ)",
    category: "Historic Commercial",
    city: "Addis Ababa",
    coords: [38.7516, 9.0354],
    description: "Historic commercial district, gold jewelers, and cultural center",
  },
  {
    id: "kazanchis",
    name: "Kazanchis",
    amharicName: "ካዛንቺስ",
    category: "Business District",
    city: "Addis Ababa",
    coords: [38.7725, 9.0185],
    description: "UNECA headquarters, ministerial complexes, and international hotels",
  },
  {
    id: "megenagna",
    name: "Megenagna",
    amharicName: "መገናኛ",
    category: "Transit Interchange",
    city: "Addis Ababa",
    coords: [38.8015, 9.0212],
    description: "Key eastern transit node linking Ring Road and Light Rail transit",
  },
  {
    id: "mexico-sq",
    name: "Mexico Square",
    amharicName: "ሜክሲኮ አደባባይ",
    category: "Square / Commerce",
    city: "Addis Ababa",
    coords: [38.7441, 9.0102],
    description: "Commercial crossroad connecting Lideta, Kirkos, and African Union",
  },
  {
    id: "gotera",
    name: "Gotera Interchange",
    amharicName: "ጎተራ ማዞሪያ",
    category: "Highway Interchange",
    city: "Addis Ababa",
    coords: [38.7610, 8.9860],
    description: "Multi-level overpass connecting Debre Zeit corridor and Ring Road",
  },
  {
    id: "merkato",
    name: "Addis Merkato",
    amharicName: "አዲስ መርካቶ",
    category: "Open Market",
    city: "Addis Ababa",
    coords: [38.7360, 9.0305],
    description: "Africa's largest open-air commercial and trade marketplace",
  },
  {
    id: "sarbet",
    name: "Sarbet (AU Area)",
    amharicName: "ሳር ቤት (አፍሪካ ኅብረት)",
    category: "Diplomatic / Commerce",
    city: "Addis Ababa",
    coords: [38.7350, 8.9980],
    description: "African Union Headquarters, residential villas, and commercial banks",
  },
  {
    id: "cmc-michael",
    name: "CMC Michael",
    amharicName: "ሲኤምሲ ሚካኤል",
    category: "Residential / Civic",
    city: "Addis Ababa",
    coords: [38.8450, 9.0250],
    description: "Rapidly growing eastern residential corridor with modern retail centers",
  },
  {
    id: "ayat-sq",
    name: "Ayat Roundabout",
    amharicName: "አያት አደባባይ",
    category: "Transit / Suburban",
    city: "Addis Ababa",
    coords: [38.8780, 9.0290],
    description: "Eastern terminus of Light Rail Transit and major suburban housing",
  },
  {
    id: "gerji",
    name: "Gerji (Imperial)",
    amharicName: "ገርጂ",
    category: "Commercial / Residential",
    city: "Addis Ababa",
    coords: [38.8050, 8.9950],
    description: "Vibrant neighborhood with technology hubs, cafes, and logistics depots",
  },
  {
    id: "kera",
    name: "Kera",
    amharicName: "ቄራ",
    category: "Commercial",
    city: "Addis Ababa",
    coords: [38.7480, 8.9910],
    description: "Historic meat processing, automotive repair, and mid-town junction",
  },
  {
    id: "lideta",
    name: "Lideta",
    amharicName: "ልደታ",
    category: "Civic / Residential",
    city: "Addis Ababa",
    coords: [38.7370, 9.0120],
    description: "Modern condominiums, high courts, and historical churches",
  },
  {
    id: "mazoria-22",
    name: "22 Mazoria",
    amharicName: "22 ማዞሪያ",
    category: "Commercial / Nightlife",
    city: "Addis Ababa",
    coords: [38.7880, 9.0180],
    description: "Bustling transit artery with restaurants, hotels, and shopping centers",
  },
  {
    id: "tor-hailoch",
    name: "Tor Hailoch",
    amharicName: "ጦር ኃይሎች",
    category: "Transit / Hospital",
    city: "Addis Ababa",
    coords: [38.7240, 9.0130],
    description: "Western gateway connecting Jimma Road with the Light Rail corridor",
  },
  {
    id: "shiromeda",
    name: "Shiromeda",
    amharicName: "ሽሮ ሜዳ",
    category: "Cultural / Market",
    city: "Addis Ababa",
    coords: [38.7610, 9.0550],
    description: "Traditional Ethiopian textile hub located at the foot of Mount Entoto",
  },
  {
    id: "kolfe-18",
    name: "Kolfe 18",
    amharicName: "ኮልፌ 18",
    category: "Commerce / Residential",
    city: "Addis Ababa",
    coords: [38.7050, 9.0280],
    description: "Western commercial center with dense delivery destinations",
  },
  {
    id: "kality",
    name: "Akaki Kality Terminal",
    amharicName: "አቃቂ ቃሊቲ",
    category: "Freight / Logistics",
    city: "Addis Ababa",
    coords: [38.7550, 8.8950],
    description: "Southern industrial freight gateway connecting Addis-Djibouti corridor",
  },
];

// ── Gondar Historic & Urban Landmarks (12 Verified Locations) ──
export const GONDAR_LANDMARKS: Landmark[] = [
  {
    id: "fasil-ghebbi",
    name: "Fasil Ghebbi (Royal Enclosure)",
    amharicName: "ፋሲል ግቢ",
    category: "World Heritage / Historic",
    city: "Gondar",
    coords: [37.4697, 12.6078],
    description: "17th-century imperial fortress city and UNESCO World Heritage Center",
  },
  {
    id: "arada-post",
    name: "Arada Post Office",
    amharicName: "አራዳ ፖስታ ቤት",
    category: "Commerce / Central Postal",
    city: "Gondar",
    coords: [37.4642, 12.6035],
    description: "Historic postal landmark and central Bajaj transit interchange in Arada",
  },
  {
    id: "piassa-gondar",
    name: "Piassa Gondar",
    amharicName: "ፒያሳ ጎንደር",
    category: "City Center / Commerce",
    city: "Gondar",
    coords: [37.4671, 12.6052],
    description: "Urban roundabout with Italian-era stone architecture, banks, and cafes",
  },
  {
    id: "kebele-18",
    name: "Kebele 18 (Gondar)",
    amharicName: "ቀበሌ 18",
    category: "Residential / Commerce",
    city: "Gondar",
    coords: [37.4520, 12.5910],
    description: "Dense hillside residential neighborhood navigated heavily by 3-wheel Bajajs",
  },
  {
    id: "azezo-airport",
    name: "Azezo Airport (Atse Tewodros)",
    amharicName: "አዘዞ አውሮፕላን ማረፊያ (ዓፄ ቴዎድሮስ)",
    category: "Airport / Regional Transit",
    city: "Gondar",
    coords: [37.4328, 12.5222],
    description: "Regional airport serving historical tourist circuits and freight links",
  },
  {
    id: "azezo-bridge",
    name: "Azezo Bridge",
    amharicName: "የአዘዞ ድልድይ",
    category: "Bridge / Chokepoint",
    city: "Gondar",
    coords: [37.4410, 12.5350],
    description: "Vital southern highway bridge connecting Azezo with Gondar downtown",
  },
  {
    id: "goha-hotel",
    name: "Goha Hotel",
    amharicName: "ጎሃ ሆቴል",
    category: "Hospitality / Viewpoint",
    city: "Gondar",
    coords: [37.4815, 12.6145],
    description: "Mountain-crest hotel with panoramic views overlooking the castles of Gondar",
  },
  {
    id: "maraki-campus",
    name: "University of Gondar (Maraki)",
    amharicName: "ጎንደር ዩኒቨርሲቲ (ማራኪ ግቢ)",
    category: "University Campus",
    city: "Gondar",
    coords: [37.4735, 12.5850],
    description: "Main social science campus with thousands of daily student commuter trips",
  },
  {
    id: "chechela-hosp",
    name: "Chechela Referral Hospital",
    amharicName: "ቼቼላ ሪፈራል ሆስፒታል",
    category: "Hospital / Healthcare",
    city: "Gondar",
    coords: [37.4580, 12.6120],
    description: "Tertiary regional healthcare referral facility for Northwest Ethiopia",
  },
  {
    id: "kuskuam-palace",
    name: "Kuskuam Palace",
    amharicName: "ቁስቋም ቤተ መንግሥት",
    category: "Monastery / Historic",
    city: "Gondar",
    coords: [37.4480, 12.6280],
    description: "Empress Mentewab's 18th-century palace complex atop Kuskuam hill",
  },
  {
    id: "debre-berhan",
    name: "Debre Berhan Selassie",
    amharicName: "ደብረ ብርሃን ሥላሴ",
    category: "Historical Church",
    city: "Gondar",
    coords: [37.4820, 12.6110],
    description: "World-renowned church famous for its painted ceiling of winged angels",
  },
  {
    id: "fasil-bath",
    name: "Fasilides' Bath",
    amharicName: "የፋሲል መዋኛ",
    category: "Historic / Religious",
    city: "Gondar",
    coords: [37.4590, 12.6020],
    description: "Site of Ethiopia's historic annual Timkat (Epiphany) celebrations",
  },
];

export const ALL_LANDMARKS: Landmark[] = [...ADDIS_LANDMARKS, ...GONDAR_LANDMARKS];

export interface DemoRoute {
  id: string;
  title: string;
  titleAmharic?: string;
  city: "Addis Ababa" | "Gondar";
  origin: { name: string; nameAmharic?: string; coords: [number, number] };
  destination: { name: string; nameAmharic?: string; coords: [number, number] };
  profile: "driving" | "bajaj" | "walking" | "cycling";
  fallbackCoordinates: [number, number][]; // realistic [lng, lat] trace
}

export const DEMO_ROUTES: DemoRoute[] = [
  // ── Addis Ababa Routes ──
  {
    id: "route-airport",
    title: "Meskel Square → Bole Airport",
    titleAmharic: "መስቀል አደባባይ → ቦሌ አውሮፕላን ማረፊያ",
    city: "Addis Ababa",
    origin: { name: "Meskel Square", nameAmharic: "መስቀል አደባባይ", coords: [38.7578, 8.9806] },
    destination: { name: "Bole Airport", nameAmharic: "ቦሌ አውሮፕላን ማረፊያ", coords: [38.795694, 8.9832295] },
    profile: "driving",
    fallbackCoordinates: [
      [38.7578, 8.9806],
      [38.7650, 8.9820],
      [38.7750, 8.9850],
      [38.7840, 8.9890],
      [38.7877, 8.9961],
      [38.7930, 8.9880],
      [38.795694, 8.9832295],
    ],
  },
  {
    id: "route-commute",
    title: "Piassa → Kazanchis",
    titleAmharic: "ፒያሳ → ካዛንቺስ",
    city: "Addis Ababa",
    origin: { name: "Piassa", nameAmharic: "ፒያሳ", coords: [38.7516, 9.0354] },
    destination: { name: "Kazanchis", nameAmharic: "ካዛንቺስ", coords: [38.7725, 9.0185] },
    profile: "driving",
    fallbackCoordinates: [
      [38.7516, 9.0354],
      [38.7560, 9.0310],
      [38.7620, 9.0250],
      [38.7680, 9.0210],
      [38.7725, 9.0185],
    ],
  },
  {
    id: "route-ringroad",
    title: "Megenagna → Mexico Square",
    titleAmharic: "መገናኛ → ሜክሲኮ አደባባይ",
    city: "Addis Ababa",
    origin: { name: "Megenagna", nameAmharic: "መገናኛ", coords: [38.8015, 9.0212] },
    destination: { name: "Mexico Square", nameAmharic: "ሜክሲኮ አደባባይ", coords: [38.7441, 9.0102] },
    profile: "driving",
    fallbackCoordinates: [
      [38.8015, 9.0212],
      [38.7880, 9.0180],
      [38.7750, 9.0100],
      [38.7600, 9.0060],
      [38.7500, 9.0080],
      [38.7441, 9.0102],
    ],
  },
  // ── Gondar Routes ──
  {
    id: "route-gondar-bajaj",
    title: "Arada Post Office → Kebele 18 (Bajaj)",
    titleAmharic: "አራዳ ፖስታ ቤት → ቀበሌ 18 (ባጃጅ)",
    city: "Gondar",
    origin: { name: "Arada Post Office", nameAmharic: "አራዳ ፖስታ ቤት", coords: [37.4642, 12.6035] },
    destination: { name: "Kebele 18", nameAmharic: "ቀበሌ 18", coords: [37.4520, 12.5910] },
    profile: "bajaj",
    fallbackCoordinates: [
      [37.4642, 12.6035],
      [37.4610, 12.6010],
      [37.4580, 12.5980],
      [37.4550, 12.5940],
      [37.4520, 12.5910],
    ],
  },
  {
    id: "route-gondar-tour",
    title: "Fasil Ghebbi → Azezo Airport",
    titleAmharic: "ፋሲል ግቢ → አዘዞ አውሮፕላን ማረፊያ",
    city: "Gondar",
    origin: { name: "Fasil Ghebbi", nameAmharic: "ፋሲል ግቢ", coords: [37.4697, 12.6078] },
    destination: { name: "Azezo Airport", nameAmharic: "አዘዞ አውሮፕላን ማረፊያ", coords: [37.4328, 12.5222] },
    profile: "driving",
    fallbackCoordinates: [
      [37.4697, 12.6078],
      [37.4671, 12.6052],
      [37.4600, 12.5800],
      [37.4500, 12.5500],
      [37.4410, 12.5350],
      [37.4328, 12.5222],
    ],
  },
  {
    id: "route-gondar-maraki",
    title: "Piassa Gondar → Maraki Campus (Bajaj)",
    titleAmharic: "ፒያሳ ጎንደር → ማራኪ ግቢ (ባጃጅ)",
    city: "Gondar",
    origin: { name: "Piassa Gondar", nameAmharic: "ፒያሳ ጎንደር", coords: [37.4671, 12.6052] },
    destination: { name: "University of Gondar", nameAmharic: "ጎንደር ዩኒቨርሲቲ", coords: [37.4735, 12.5850] },
    profile: "bajaj",
    fallbackCoordinates: [
      [37.4671, 12.6052],
      [37.4690, 12.6000],
      [37.4710, 12.5920],
      [37.4735, 12.5850],
    ],
  },
];

export const PLATFORM_METRICS = [
  { label: "OSRM Routing Latency", value: "<15ms", change: "Sub-second engine" },
  { label: "API Cost & Key Requirement", value: "$0.00", change: "100% Free & Open" },
  { label: "Supported SDK Environments", value: "4+ Platforms", change: "Web, Flutter, RN, Native" },
  { label: "Canonical Route Sessions", value: "Audit-Grade", change: "Immutable revisions" },
];
