export interface SearchHistoryItem {
  query: string;
  timestamp: number;
}

export interface SearchPlaceResult {
  resultType: "place";
  id: string;
  name: string;
  slug: string;
  types: string[];
  rating: string | null;
  locationPath: string;
  locationName: string;
  imageId: string | null;
}

export interface SearchLocationResult {
  resultType: "location";
  id: string;
  name: string;
  path: string;
  type: string;
  latitude: string | null;
  longitude: string | null;
  image: string | null;
}

export interface SearchResults {
  places: SearchPlaceResult[];
  locations: SearchLocationResult[];
}
