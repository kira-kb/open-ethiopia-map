export type SearchSource = "SAVED_PLACE" | "PACKMAN" | "RECOMMENDATION" | "PROVIDER";

export interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  latitude: number;
  longitude: number;
  locationType?: string;
  source: SearchSource;
  score: number;
  rawScore?: number;
  locationHash?: string;

  // Preserved for enrichment flow
  extraFields?: Array<{
    key: string;
    label: string;
    type: "text" | "number";
    optional?: boolean;
    reason?: string;
  }>;
  locationTypeOptions?: string[];
  savedLabel?: string;
  isSavedPlace?: boolean;
  placeId?: string;
  address?: string;
  city?: string;
}
