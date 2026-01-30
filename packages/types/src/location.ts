export interface Location {
  id: string;
  name: string;
  slug: string;
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

export interface PopularPlace {
  id: string;
  name: string;
  slug: string;
  types: string[];
  description: string;
  rating: string;
  reviewsCount: number;
  isVerified: boolean;
  imageId: string;
  isSaved: boolean;
  cityName: string;
  regionName: string;
}

export interface LocationWithDetails extends Location {
  popularPlaces: PopularPlace[];
  breadcrumbs: BreadcrumbItem[];
  stats: LocationsStats;
}

export type PlaceFilter = "popular" | "new" | "verified" | "surprise";

export interface LocationPlacesSort {
  places: PopularPlace[];
}
