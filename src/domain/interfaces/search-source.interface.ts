import { SearchResult } from "../entities/search-result.entity";

export interface SearchSourceQuery {
  query: string;
  limit: number;
  userId?: string;
  lat?: number;
  lng?: number;
  city?: string;
}

export interface ISearchSource {
  readonly priority: number;
  search(query: SearchSourceQuery): Promise<SearchResult[]>;
}
