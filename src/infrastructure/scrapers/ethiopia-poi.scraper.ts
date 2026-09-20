import { BaseScraper } from "./base.scraper";
import { ScraperOptions } from "./interfaces/scraper.interface";
import { Place, PlaceSource, LocationType } from "../../domain/entities";
import { Logger } from "../../domain/interfaces";

interface CityBbox {
  name: string;
  s: number;
  w: number;
  n: number;
  e: number;
}

const CITIES: Record<string, CityBbox> = {
  "addis ababa": { name: "Addis Ababa", s: 8.83, w: 38.65, n: 9.08, e: 38.90 },
  "hawassa": { name: "Hawassa", s: 6.98, w: 38.43, n: 7.10, e: 38.53 },
  "dire dawa": { name: "Dire Dawa", s: 9.55, w: 41.80, n: 9.65, e: 41.90 },
  "bahir dar": { name: "Bahir Dar", s: 11.53, w: 37.33, n: 11.64, e: 37.44 },
  "adama": { name: "Adama", s: 8.50, w: 39.22, n: 8.60, e: 39.33 },
  "bishoftu": { name: "Bishoftu", s: 8.70, w: 38.94, n: 8.80, e: 39.04 },
};

interface CategoryFilter {
  locationType: LocationType;
  category: string;
  osmKey: string;
  osmValues: string[];
}

const CATEGORY_MAP: Record<string, CategoryFilter> = {
  hospital: {
    locationType: LocationType.HOSPITAL,
    category: "Healthcare",
    osmKey: "amenity",
    osmValues: ["hospital", "clinic"],
  },
  pharmacy: {
    locationType: LocationType.PHARMACY,
    category: "Healthcare",
    osmKey: "amenity",
    osmValues: ["pharmacy"],
  },
  bank: {
    locationType: LocationType.BANK,
    category: "Finance",
    osmKey: "amenity",
    osmValues: ["bank", "atm"],
  },
  mall: {
    locationType: LocationType.SHOPPING_MALL,
    category: "Commercial",
    osmKey: "shop",
    osmValues: ["mall", "supermarket", "department_store"],
  },
  hotel: {
    locationType: LocationType.HOTEL,
    category: "Hospitality",
    osmKey: "tourism",
    osmValues: ["hotel", "guest_house"],
  },
  restaurant: {
    locationType: LocationType.RESTAURANT,
    category: "Food & Beverage",
    osmKey: "amenity",
    osmValues: ["restaurant", "cafe", "fast_food"],
  },
  fuel: {
    locationType: LocationType.FUEL_STATION,
    category: "Automotive",
    osmKey: "amenity",
    osmValues: ["fuel"],
  },
  transit: {
    locationType: LocationType.BUS_STATION,
    category: "Transportation",
    osmKey: "amenity",
    osmValues: ["bus_station"],
  },
  university: {
    locationType: LocationType.UNIVERSITY,
    category: "Education",
    osmKey: "amenity",
    osmValues: ["university", "college"],
  },
  landmark: {
    locationType: LocationType.LANDMARK,
    category: "Landmark",
    osmKey: "tourism",
    osmValues: ["attraction", "viewpoint", "museum"],
  },
};

/**
 * Seed catalog of verified Ethiopian POIs to guarantee immediate availability
 * and reliable offline/fast-path seeding.
 */
const SEED_ETHIOPIAN_POIS = [
  {
    name: "Tikur Anbessa Specialized Hospital (Black Lion)",
    amharicName: "ጥቁር አንበሳ ስፔሻላይዝድ ሆስፒታል",
    lat: 9.0194,
    lng: 38.7516,
    city: "Addis Ababa",
    subcity: "Kirkos",
    locationType: LocationType.HOSPITAL,
    category: "Healthcare",
  },
  {
    name: "St. Paul's Hospital Millennium Medical College",
    amharicName: "ቅዱስ ጳውሎስ ሆስፒታል ሚሊኒየም ሜዲካል ኮሌጅ",
    lat: 9.0492,
    lng: 38.7214,
    city: "Addis Ababa",
    subcity: "Gullele",
    locationType: LocationType.HOSPITAL,
    category: "Healthcare",
  },
  {
    name: "Korean Hospital (MCM)",
    amharicName: "ኮሪያ ሆስፒታል (ኤምሲኤም)",
    lat: 9.0162,
    lng: 38.8028,
    city: "Addis Ababa",
    subcity: "Bole",
    locationType: LocationType.HOSPITAL,
    category: "Healthcare",
  },
  {
    name: "Kenema Pharmacy Bole",
    amharicName: "ቀነማ መድኃኒት ቤት ቦሌ",
    lat: 8.9950,
    lng: 38.7845,
    city: "Addis Ababa",
    subcity: "Bole",
    locationType: LocationType.PHARMACY,
    category: "Healthcare",
  },
  {
    name: "Commercial Bank of Ethiopia Head Quarter",
    amharicName: "የኢትዮጵያ ንግድ ባንክ ዋና መሥሪያ ቤት",
    lat: 9.0256,
    lng: 38.7547,
    city: "Addis Ababa",
    subcity: "Arada",
    locationType: LocationType.BANK,
    category: "Finance",
  },
  {
    name: "Bank of Abyssinia Bole Medhanialem",
    amharicName: "አቢሲኒያ ባንክ ቦሌ መድኃኔዓለም",
    lat: 8.9961,
    lng: 38.7892,
    city: "Addis Ababa",
    subcity: "Bole",
    locationType: LocationType.BANK,
    category: "Finance",
  },
  {
    name: "Edna Mall & Cinema",
    amharicName: "ኤድና ሞል",
    lat: 8.9984,
    lng: 38.7890,
    city: "Addis Ababa",
    subcity: "Bole",
    locationType: LocationType.SHOPPING_MALL,
    category: "Commercial",
  },
  {
    name: "Century Mall Gurd Shola",
    amharicName: "ሴንቸሪ ሞል ጉርድ ሾላ",
    lat: 9.0152,
    lng: 38.8189,
    city: "Addis Ababa",
    subcity: "Yeka",
    locationType: LocationType.SHOPPING_MALL,
    category: "Commercial",
  },
  {
    name: "Dembel City Center",
    amharicName: "ደምበል ሲቲ ሴንተር",
    lat: 9.0062,
    lng: 38.7675,
    city: "Addis Ababa",
    subcity: "Kirkos",
    locationType: LocationType.SHOPPING_MALL,
    category: "Commercial",
  },
  {
    name: "Ethiopian Skylight Hotel",
    amharicName: "የኢትዮጵያ ስካይላይት ሆቴል",
    lat: 8.9860,
    lng: 38.7940,
    city: "Addis Ababa",
    subcity: "Bole",
    locationType: LocationType.HOTEL,
    category: "Hospitality",
  },
  {
    name: "Sheraton Addis Luxury Collection",
    amharicName: "ሸራተን አዲስ",
    lat: 9.0189,
    lng: 38.7610,
    city: "Addis Ababa",
    subcity: "Arada",
    locationType: LocationType.HOTEL,
    category: "Hospitality",
  },
  {
    name: "Hilton Addis Ababa",
    amharicName: "ሒልተን አዲስ አበባ",
    lat: 9.0198,
    lng: 38.7644,
    city: "Addis Ababa",
    subcity: "Kirkos",
    locationType: LocationType.HOTEL,
    category: "Hospitality",
  },
  {
    name: "TotalEnergies Bole Brass",
    amharicName: "ቶታል ነዳጅ ማደያ ቦሌ ብራስ",
    lat: 8.9942,
    lng: 38.7818,
    city: "Addis Ababa",
    subcity: "Bole",
    locationType: LocationType.FUEL_STATION,
    category: "Automotive",
  },
  {
    name: "National Oil Ethiopia (NOC) Meskel Flower",
    amharicName: "ኤንኦሲ መስቀል ፍላወር",
    lat: 9.0018,
    lng: 38.7562,
    city: "Addis Ababa",
    subcity: "Kirkos",
    locationType: LocationType.FUEL_STATION,
    category: "Automotive",
  },
  {
    name: "Addis Ababa University (Sidist Kilo Main Campus)",
    amharicName: "አዲስ አበባ ዩኒቨርሲቲ (ስድስት ኪሎ)",
    lat: 9.0478,
    lng: 38.7608,
    city: "Addis Ababa",
    subcity: "Yeka",
    locationType: LocationType.UNIVERSITY,
    category: "Education",
  },
  {
    name: "Meskel Square",
    amharicName: "መስቀል አደባባይ",
    lat: 9.0108,
    lng: 38.7634,
    city: "Addis Ababa",
    subcity: "Kirkos",
    locationType: LocationType.LANDMARK,
    category: "Landmark",
  },
  {
    name: "Bole International Airport Terminal 2",
    amharicName: "ቦሌ ዓለም አቀፍ አውሮፕላን ማረፊያ ተርሚናል 2",
    lat: 8.9774,
    lng: 38.7993,
    city: "Addis Ababa",
    subcity: "Bole",
    locationType: LocationType.AIRPORT,
    category: "Transportation",
  },
  {
    name: "Lamberet Bus Terminal",
    amharicName: "ላምበረት አውቶቡስ ተርሚናል",
    lat: 9.0345,
    lng: 38.8241,
    city: "Addis Ababa",
    subcity: "Yeka",
    locationType: LocationType.BUS_STATION,
    category: "Transportation",
  },
  {
    name: "Mercato Grand Market",
    amharicName: "መርካቶ ገበያ",
    lat: 9.0305,
    lng: 38.7369,
    city: "Addis Ababa",
    subcity: "Addis Ketema",
    locationType: LocationType.LANDMARK,
    category: "Commercial",
  },
  {
    name: "Adama University of Science and Technology",
    amharicName: "የአዳማ ሳይንስ እና ቴክኖሎጂ ዩኒቨርሲቲ",
    lat: 8.5601,
    lng: 39.2905,
    city: "Adama",
    subcity: "Adama",
    locationType: LocationType.UNIVERSITY,
    category: "Education",
  },
  {
    name: "Hawassa Millennium Park & Lake Front",
    amharicName: "ሀዋሳ ሚሊኒየም ፓርክ",
    lat: 7.0542,
    lng: 38.4682,
    city: "Hawassa",
    subcity: "Hawassa",
    locationType: LocationType.LANDMARK,
    category: "Landmark",
  },
];

export class EthiopiaPoiScraper extends BaseScraper {
  readonly name = "ethiopia-poi";
  readonly description = "Scrapes verified Points of Interest across Ethiopia via OpenStreetMap Overpass API and curated national catalog";

  constructor(logger: Logger) {
    super(logger);
  }

  async *scrape(options?: ScraperOptions): AsyncGenerator<Place, void, undefined> {
    const selectedCityKey = options?.city?.toLowerCase().trim() || "addis ababa";
    const city = CITIES[selectedCityKey] || CITIES["addis ababa"];
    const targetCategory = options?.category?.toLowerCase().trim();
    const maxItems = options?.limit || 50;

    let yieldedCount = 0;

    // 1. Try querying Overpass OSM live
    try {
      const overpassPlaces = await this.fetchFromOverpass(city, targetCategory, maxItems);
      for (const place of overpassPlaces) {
        yield place;
        yieldedCount++;
        if (yieldedCount >= maxItems) return;
      }
    } catch (err) {
      this.logger.warn("Overpass API live query unavailable, utilizing verified seed catalog", {
        error: (err as Error).message,
        city: city.name,
      });
    }

    // 2. Yield matches from curated seed catalog for high confidence
    for (const seed of SEED_ETHIOPIAN_POIS) {
      if (yieldedCount >= maxItems) break;

      // Filter by city if specified
      if (options?.city && seed.city.toLowerCase() !== selectedCityKey) {
        continue;
      }

      // Filter by category if specified
      if (targetCategory) {
        const catFilter = CATEGORY_MAP[targetCategory];
        if (catFilter) {
          if (seed.locationType !== catFilter.locationType && seed.category.toLowerCase() !== catFilter.category.toLowerCase()) {
            continue;
          }
        } else if (!seed.name.toLowerCase().includes(targetCategory) && !seed.category.toLowerCase().includes(targetCategory)) {
          continue;
        }
      }

      yield new Place({
        name: seed.name,
        displayName: seed.name,
        normalizedName: seed.name.toLowerCase(),
        aliases: seed.amharicName ? [seed.amharicName] : [],
        latitude: seed.lat,
        longitude: seed.lng,
        city: seed.city,
        subcity: seed.subcity,
        country: "Ethiopia",
        locationType: seed.locationType,
        category: seed.category,
        source: PlaceSource.SCRAPER,
        confidence: 0.9,
        verified: true,
        formattedAddress: `${seed.name}, ${seed.subcity}, ${seed.city}, Ethiopia`,
        metadata: {
          scrapedAt: new Date().toISOString(),
          amharicName: seed.amharicName,
          scraper: this.name,
        },
      });

      yieldedCount++;
    }
  }

  private async fetchFromOverpass(
    city: CityBbox,
    categoryKey?: string,
    limit: number = 30,
  ): Promise<Place[]> {
    const filter = categoryKey ? CATEGORY_MAP[categoryKey] : null;
    const osmKey = filter?.osmKey || "amenity";
    const osmValues = filter?.osmValues || ["hospital", "pharmacy", "bank", "restaurant", "fuel", "bus_station"];

    const valueFilters = osmValues
      .map((v) => `node["${osmKey}"="${v}"](${city.s},${city.w},${city.n},${city.e});way["${osmKey}"="${v}"](${city.s},${city.w},${city.n},${city.e});`)
      .join("");

    const query = `[out:json][timeout:10];(${valueFilters});out center ${limit};`;
    const overpassUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
      const res = await fetch(overpassUrl, { signal: controller.signal });
      if (!res.ok) {
        throw new Error(`Overpass API responded with ${res.status}: ${res.statusText}`);
      }

      const json = (await res.json()) as any;
      const elements = json?.elements || [];
      const places: Place[] = [];

      for (const el of elements) {
        const lat = el.lat || el.center?.lat;
        const lng = el.lon || el.center?.lon;
        const tags = el.tags || {};
        const name = tags.name || tags["name:en"] || tags["name:am"];

        if (!name || !lat || !lng) continue;

        const amharicName = tags["name:am"];
        const aliases: string[] = [];
        if (amharicName && amharicName !== name) aliases.push(amharicName);
        if (tags.alt_name) aliases.push(tags.alt_name);

        const locationType = filter?.locationType || LocationType.LANDMARK;
        const category = filter?.category || "Points of Interest";

        places.push(
          new Place({
            name,
            displayName: name,
            normalizedName: name.toLowerCase(),
            aliases,
            latitude: Number(lat.toFixed(6)),
            longitude: Number(lng.toFixed(6)),
            city: tags["addr:city"] || city.name,
            subcity: tags["addr:subcity"] || tags["addr:district"],
            country: "Ethiopia",
            locationType,
            category,
            source: PlaceSource.SCRAPER,
            confidence: 0.75,
            verified: true,
            formattedAddress: `${name}, ${city.name}, Ethiopia`,
            metadata: {
              osmId: el.id,
              osmType: el.type,
              scrapedAt: new Date().toISOString(),
              scraper: this.name,
              tags,
            },
          }),
        );
      }

      return places;
    } finally {
      clearTimeout(timeout);
    }
  }
}
