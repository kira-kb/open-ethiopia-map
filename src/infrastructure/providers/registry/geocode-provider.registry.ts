import {
  IGeocodeProvider,
  AutocompleteRequest,
  ReverseGeocodeRequest,
} from "../../../domain/interfaces";
import { Place, PackManAddress } from "../../../domain/entities";
import { config } from "../../config";
import { Logger } from "../../../domain/interfaces";
import { PhotonGeocodeProvider } from "../geocode/photon.provider";

export class GeocodeProviderRegistry implements IGeocodeProvider {
  readonly name = "geocode-provider-registry";
  private providers = new Map<string, IGeocodeProvider>();

  constructor(private readonly logger: Logger) {}

  register(provider: IGeocodeProvider): void {
    this.providers.set(provider.name, provider);
    this.logger.info(`Registered geocode provider: ${provider.name}`);
  }

  private select(): IGeocodeProvider {
    const primary = config.geocodeProvider.primary;
    const provider = this.providers.get(primary);
    if (provider) return provider;

    const fallback = this.providers.values().next().value;
    if (fallback) return fallback;

    throw new Error("No geocode providers registered");
  }

  async autocomplete(request: AutocompleteRequest): Promise<Place[]> {
    return this.select().autocomplete(request);
  }

  async reverseGeocode(request: ReverseGeocodeRequest): Promise<{
    address: PackManAddress;
    nearbyPlaces?: Place[];
  }> {
    return this.select().reverseGeocode(request);
  }
}
