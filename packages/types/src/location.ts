export interface Location {
  id: string;
  name: string;
  slug: string;
  description: string;
  parentId: string | null;
  type: string;
  countryCode: string;
  path: string;
  level: number;
  latitude: number;
  longitude: number;
  image: string;
  isPopular: boolean;
  metaTitle: string;
  metaDescription: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BreadcrumbItem {
  name: string;
  slug: string;
  path: string;
  level: number;
}

export interface LocationsStats {
  totalPlaces: number;
  totalAdventures: number;
  totalEats: number;
  totalStays: number;
  totalStores: number;
}

export interface LocationPlace {
  id: string;
  name: string;
  slug: string;
  types: string[];
  description: string;
  rating: string;
  reviewsCount: number;
  isVerified: boolean;
  countryCode: string;
  imageId: string;
  isSaved: boolean;
  cityName: string;
  regionName: string;
  locationPath: string;
  lat: string | null;
  lng: string | null;
  memberFavourite: boolean;
  dogAmenities: string[];
}

export interface LocationWithDetails extends Location {
  popularPlaces: LocationPlace[];
  stays: LocationPlace[];
  eats: LocationPlace[];
  adventures: LocationPlace[];
  breadcrumbs: BreadcrumbItem[];
  stats: LocationsStats;
}

export type PlaceFilter = "popular" | "new" | "verified" | "surprise";

export interface LocationPlacesSort {
  places: LocationPlace[];
}

export interface ExploreResult {
  places: LocationPlace[];
  total: number;
  page: number;
  pageSize: number;
}
