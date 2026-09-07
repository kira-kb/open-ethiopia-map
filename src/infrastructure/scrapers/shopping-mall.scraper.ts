import { BaseScraper } from "./base.scraper";
import { ScraperOptions } from "./interfaces/scraper.interface";
import { Place, PlaceSource, LocationType } from "../../domain/entities";

export class ShoppingMallScraper extends BaseScraper {
  readonly name = "shopping-mall";
  readonly description = "Imports known shopping malls in Ethiopia";

  private readonly malls = [
    { name: "Megenagna Mall", lat: 9.0320, lng: 38.6710, city: "Addis Ababa", subcity: "Bole" },
    { name: "Bole DHL Mall", lat: 9.0080, lng: 38.7920, city: "Addis Ababa", subcity: "Bole" },
    { name: "Edna Mall", lat: 9.0210, lng: 38.7930, city: "Addis Ababa", subcity: "Bole" },
    { name: "Dembel City Center", lat: 9.0150, lng: 38.7490, city: "Addis Ababa", subcity: "Arada" },
    { name: "Bambis Supermarket", lat: 9.0240, lng: 38.7610, city: "Addis Ababa", subcity: "Kirkos" },
  ];

  async *scrape(_options?: ScraperOptions): AsyncGenerator<Place, void, undefined> {
    for (const mall of this.malls) {
      yield new Place({
        name: mall.name,
        normalizedName: mall.name.toLowerCase(),
        latitude: mall.lat,
        longitude: mall.lng,
        city: mall.city,
        subcity: mall.subcity,
        country: "Ethiopia",
        locationType: LocationType.SHOPPING_MALL,
        source: PlaceSource.SCRAPER,
        confidence: 0.5,
      });
    }
  }
}
